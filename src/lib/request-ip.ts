import "server-only";
import { headers } from "next/headers";

/** Best-effort client IP from Vercel's `x-forwarded-for` header (first entry — the original
 *  client, everything after that is intermediate proxies). Falls back to a shared "unknown"
 *  bucket when it's absent (e.g. local dev), which just rate-limits all such requests
 *  together rather than skipping the limit entirely. */
export async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return store.get("x-real-ip")?.trim() || "unknown";
}
