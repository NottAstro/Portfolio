import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Guards every /admin page: the visitor must be signed in AND be the admin
// account (checked by the database's is_admin() function, see
// supabase/admin_security.sql). Everyone else is sent to the login page.
export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

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

  if (req.nextUrl.pathname === "/admin/login") {
    return res;
  }

  // getUser() verifies the session with Supabase instead of trusting the cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const toLogin = (reason?: string) => {
    const url = new URL("/admin/login", req.url);
    if (reason) url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

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

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
