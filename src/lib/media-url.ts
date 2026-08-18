/** Only ever accept an http(s) link — never javascript:/data: etc, which an <a href> or
 *  <img src> would otherwise happily render/execute. Used both when saving a HEP exercise's
 *  imageUrl/videoUrl (see app/actions/hep.ts) and again defensively at render time (see
 *  app/(app)/hep/page.tsx) — the field is a free-text URL a clinician pastes in, so this is
 *  the one thing standing between it and stored XSS. */
export function sanitizeMediaUrl(url: string | undefined | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed || !/^https:\/\//i.test(trimmed)) return null;
  return trimmed;
}
