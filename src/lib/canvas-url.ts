/** Normalizes a student's Profile-entered Canvas URL (see canvasUrl in schema.prisma) into a
 *  safe absolute link for the Atrium "Open Canvas" button (AtriumThisWeekCard.tsx). Students
 *  commonly type a bare domain like "chapman.instructure.com" with no scheme, so this adds
 *  https:// when one is missing; also blocks non-http(s) schemes (javascript:, data:, etc.)
 *  the same way sanitizeMediaUrl does for pasted media links, since this is free text saved
 *  straight from a profile field. */
export function normalizeCanvasUrl(url: string | undefined | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}
