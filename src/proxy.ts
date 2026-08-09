import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Country-level access block, geolocated purely off Vercel's own edge network — Next.js
 * removed `request.geo`/`request.ip` as of v15 (see the Version History table in
 * node_modules/next/dist/docs/.../file-conventions/proxy.md), so this reads the
 * `x-vercel-ip-country` header Vercel's infrastructure sets on every request it proxies
 * before it ever reaches this app. That header is ONLY populated on Vercel's production
 * deployment — it's absent in local dev and on any other host, so this can't be tested
 * outside an actual Vercel deploy, and self-hosting elsewhere would silently disable the
 * block entirely rather than fail loudly. IP geolocation is also a soft signal, not a hard
 * boundary — a VPN or proxy trivially routes around it — so treat this as a deterrent, not
 * real access control for anything security-sensitive.
 */
const BLOCKED_COUNTRIES = new Set(["IN"]);

export function proxy(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  if (country && BLOCKED_COUNTRIES.has(country)) {
    return NextResponse.rewrite(new URL("/blocked-region", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except: Next's own static/image assets, favicon/robots/sitemap, the
    // blocked-region page itself (avoids a rewrite loop), and the two routes that need to
    // stay reachable regardless of where the caller geolocates — Stripe's webhook and
    // Vercel Cron's own trigger, neither of which is a real end-user visit.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|blocked-region|api/stripe/webhook|api/cron).*)",
  ],
};
