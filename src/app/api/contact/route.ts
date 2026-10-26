import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContact } from "@/lib/contactValidation";

// Contact form endpoint. Each message is saved to the `messages` table (read in
// /admin/messages) and, when RESEND_API_KEY is set, also emailed to CONTACT_TO_EMAIL.
// It succeeds if at least one of the two deliveries works.

const RATE_LIMIT = 3; // messages per IP...
const RATE_WINDOW_MS = 10 * 60 * 1000; // ...per 10 minutes
const recentByIp = new Map<string, number[]>();

const recentSends = (ip: string) =>
  (recentByIp.get(ip) || []).filter((t) => Date.now() - t < RATE_WINDOW_MS);

// Only successful sends count, so a temporary failure never locks anyone out
const recordSend = (ip: string) => recentByIp.set(ip, [...recentSends(ip), Date.now()]);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function saveToDatabase(name: string, email: string, message: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.from("messages").insert({ name, email, message });

  if (error) console.error("Contact: failed to save message:", error.message);
  return !error;
}

async function sendEmail(name: string, email: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: email,
      subject: `New portfolio message from ${name}`,
      html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) wrote:</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  });

  if (!res.ok) console.error("Contact: failed to send email:", res.status, await res.text());
  return res.ok;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots fill every field, including this hidden one; pretend it worked
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const input = {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim(),
    message: String(body.message ?? "").trim(),
  };

  const errors = validateContact(input);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Please check the highlighted fields.", errors }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (recentSends(ip).length >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "You've sent a few messages already. Please try again later." },
      { status: 429 }
    );
  }

  const [saved, emailed] = await Promise.all([
    saveToDatabase(input.name, input.email, input.message).catch(() => false),
    sendEmail(input.name, input.email, input.message).catch(() => false),
  ]);

  if (!saved && !emailed) {
    return NextResponse.json(
      { error: "Sorry, your message couldn't be sent right now." },
      { status: 502 }
    );
  }

  recordSend(ip);
  return NextResponse.json({ ok: true });
}
