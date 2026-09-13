/**
 * Closed next/image remote allowlist. Hostnames are exact — no `*` / `**` host patterns —
 * so the optimizer cannot be used as an open SSRF proxy. Pathname is scoped to the CDN
 * prefix each host actually serves. Search stays unrestricted because Wikimedia thumbs and
 * Pexels `src.large` URLs carry query strings.
 *
 * ArticleImage uses this same list: allowlisted (or same-origin) rasters go through
 * next/image; publisher og:images on unknown hosts and data-URLs stay on raw <img>.
 * HEP clinician-pasted URLs are never routed through this helper.
 */
export const IMAGE_REMOTE_PATTERNS = [
  { protocol: "https" as const, hostname: "i.ytimg.com", pathname: "/vi/**" },
  { protocol: "https" as const, hostname: "thumb.wikimedia.org", pathname: "/wikipedia/commons/**" },
  { protocol: "https" as const, hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" },
  { protocol: "https" as const, hostname: "images.pexels.com", pathname: "/photos/**" },
] as const;

export const IMAGE_REMOTE_HOSTS: readonly string[] = IMAGE_REMOTE_PATTERNS.map((pattern) => pattern.hostname);

function pathnameMatches(pathname: string, pattern: string): boolean {
  if (!pattern.endsWith("/**")) return pathname === pattern;
  const prefix = pattern.slice(0, -2);
  return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
}

/** True when next/image can optimize `src` without a 400 from an unconfigured host. */
export function isOptimizableImageSrc(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/")) return true;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return false;
    return IMAGE_REMOTE_PATTERNS.some(
      (pattern) => url.hostname === pattern.hostname && pathnameMatches(url.pathname, pattern.pathname)
    );
  } catch {
    return false;
  }
}
