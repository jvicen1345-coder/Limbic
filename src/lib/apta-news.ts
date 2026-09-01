import "server-only";
import type { Article } from "@/lib/types";
import { classify, fetchGoogleNewsRss, stripHtml, sourceName, toIsoDate, estimateReadMins } from "@/lib/news-live";

/**
 * APTA News section — third-party reporting *about* APTA, found via a Google News RSS
 * search and linking out to whichever outlets covered the story.
 *
 * This used to have a first tier that scraped https://www.apta.org/news directly, with the
 * Google News search only as a backstop. That scrape is removed. Its own comment recorded
 * that apta.org had returned a 403 which "usually means bot/WAF protection on their end",
 * and the selectors were then written to be resilient to that — which is to say the code
 * observed an access control and was built to keep working around it. Whatever the intent,
 * that is the fact pattern that turns a terms-of-service question into a Computer Fraud and
 * Abuse Act one, and it was never worth the risk for a feed that this tier already fills.
 * Do not reintroduce it: apta.org publishes no feed or API for programmatic use, and the
 * absence is the answer.
 *
 * Nothing here touches APTA's servers. If the search returns nothing, the section renders
 * empty — there is no bundled fallback either (see lib/articles.ts and the deleted
 * apta-news-static.ts for why inventing APTA news was worse than showing none).
 */

function stableId(href: string): string {
  let hash = 0;
  for (let i = 0; i < href.length; i++) hash = (hash * 31 + href.charCodeAt(i)) >>> 0;
  return "apta-" + hash.toString(36);
}

const GOOGLE_NEWS_QUERY = "APTA American Physical Therapy Association";

/** Title/summary must actually mention APTA or physical therapy — the query above is
 *  specific, but Google News can still return loosely-related results, and a story with
 *  neither phrase isn't reliably about APTA. */
function isAptaRelevant(text: string): boolean {
  return /\bapta\b/i.test(text) || /physical therap/i.test(text);
}

/** Third-party reporting about APTA via Google News RSS — see file header. */
async function fetchAptaNewsFromGoogleNews(limit = 12): Promise<Article[]> {
  const items = await fetchGoogleNewsRss(GOOGLE_NEWS_QUERY);
  const seen = new Set<string>();
  const articles: Article[] = [];

  for (const item of items) {
    if (articles.length >= limit) break;
    const link = item.link;
    const title = (item.title || "").trim();
    if (!link || !title || seen.has(link)) continue;

    const source = sourceName(item, title);
    const cleanTitle =
      title.replace(new RegExp(` - ${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "").trim() || title;
    const snippetRaw = stripHtml(item.contentSnippet || item.content || "");
    const summary = snippetRaw.length > 20 ? snippetRaw : cleanTitle;
    if (!isAptaRelevant(`${cleanTitle} ${summary}`)) continue;
    seen.add(link);

    const { specialty } = classify(`${cleanTitle} ${summary}`, "industry");

    articles.push({
      id: stableId(link),
      type: "industry",
      specialty,
      title: cleanTitle,
      source,
      sourceUrl: link,
      date: toIsoDate(item),
      readMins: estimateReadMins(summary),
      summary: summary.length > 240 ? summary.slice(0, 237) + "…" : summary,
      tags: ["APTA News"],
      live: true,
    });
  }
  return articles;
}

/** The APTA News feed. A thin pass-through today, kept as the module's public entry point
 *  so lib/articles.ts doesn't need to know how the section is sourced. */
export async function fetchAptaNews(limit = 12): Promise<Article[]> {
  return fetchAptaNewsFromGoogleNews(limit);
}
