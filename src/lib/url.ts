import "server-only";
import { headers } from "next/headers";

/** Derived from the incoming request rather than hardcoded (unlike
 *  lib/google-oauth.ts's GOOGLE_REDIRECT_URI, which is registered with Google ahead of
 *  time and needs an exact match) — Stripe Checkout's success_url/cancel_url and a
 *  password-reset email's link both just need to point back at whatever host actually
 *  served the request, so this keeps local dev and preview deploys working too, not only
 *  the hardcoded production domain. */
export async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "limbic.center";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
