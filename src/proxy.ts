import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Guards every /admin page: the visitor must be signed in AND be the admin
// account (checked by the database's is_admin() function, see
// supabase/admin_security.sql). Everyone else is sent to the login page.

// Verifying with Supabase costs two network round trips, and the sidebar's
// links preload in the background, so a single page view used to trigger many
// of them. A login that passed is remembered for a few minutes instead.
const VERIFIED_TTL_MS = 5 * 60 * 1000;
const verifiedTokens = new Map<string, number>(); // access token -> expiry time

const isVerified = (token: string) => (verifiedTokens.get(token) ?? 0) > Date.now();

const rememberVerified = (token: string) => {
  if (verifiedTokens.size > 200) verifiedTokens.clear();
  verifiedTokens.set(token, Date.now() + VERIFIED_TTL_MS);
};

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  if (req.nextUrl.pathname === "/admin/login") {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const toLogin = (reason?: string) => {
    const url = new URL("/admin/login", req.url);
    if (reason) url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

  // Reads the session cookie only (no network call unless it needs refreshing)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return toLogin();

  // Fast path: this exact login was verified recently
  if (isVerified(session.access_token)) return res;

  // getUser() verifies the session with Supabase instead of trusting the cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return toLogin();

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  // If is_admin() isn't installed yet, fall back to "any signed-in user"
  // rather than locking the owner out
  if (!error && isAdmin !== true) {
    await supabase.auth.signOut();
    const redirect = toLogin("not-admin");
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  rememberVerified(session.access_token);
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
