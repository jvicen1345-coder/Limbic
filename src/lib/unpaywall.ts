import "server-only";
import { type UnpaywallResult } from "@/lib/unpaywall-shared";

/**
 * Unpaywall (https://unpaywall.org) — a free, legal open-access lookup by DOI, used to
 * offer a free full-text/PDF link on the article detail page for PubMed research articles
 * that have a legally hosted open-access copy. Server-side only: the contact email in
 * CONTACT_EMAIL is required by Unpaywall's terms of use but never needs to reach the
 * client (see lib/article-view.ts, which is the only caller) — see lib/unpaywall-shared.ts
 * for the client-safe result type and label helpers this re-exports.
 */

export type { UnpaywallResult } from "@/lib/unpaywall-shared";
export { extractDoiFromUrl, getOaStatusLabel, getOaStatusColor } from "@/lib/unpaywall-shared";

const UNPAYWALL_BASE = "https://api.unpaywall.org/v2";
const CONTACT_EMAIL = process.env.UNPAYWALL_EMAIL ?? "jonathan@limbic.center";

/** Looks up open-access status for a DOI. Never throws — a network failure, a DOI
 *  Unpaywall doesn't recognize, or a non-2xx response all just yield null, same
 *  "never block the article page on a third-party API" reasoning as the rest of this
 *  app's live-source integrations (see lib/pubmed.ts, lib/og-image.ts). Cached for 24
 *  hours per DOI — open-access status changes rarely, if ever, once published. */
export async function checkUnpaywall(doi: string): Promise<UnpaywallResult | null> {
  try {
    const encodedDoi = encodeURIComponent(doi);
    const url = `${UNPAYWALL_BASE}/${encodedDoi}?email=${CONTACT_EMAIL}`;

    const response = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;

    const data = await response.json();

    return {
      doi: data.doi,
      isOpenAccess: data.is_oa ?? false,
      oaStatus: data.oa_status ?? "closed",
      bestOaLocation: data.best_oa_location
        ? {
            url: data.best_oa_location.url,
            urlForPdf: data.best_oa_location.url_for_pdf ?? undefined,
            hostType: data.best_oa_location.host_type,
            license: data.best_oa_location.license ?? undefined,
            version: data.best_oa_location.version ?? undefined,
          }
        : null,
      title: data.title ?? "",
      journal: data.journal_name ?? "",
    };
  } catch {
    return null;
  }
}
