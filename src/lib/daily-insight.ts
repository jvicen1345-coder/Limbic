import { SPECIALTY_META } from "@/lib/meta";
import type { Article } from "@/lib/types";

/**
 * Choosing and shaping the Home sidebar's daily insight.
 *
 * Deliberately pure and free of `server-only`: no Anthropic client, no Prisma, no request
 * context — just the selection rules and the card's shape, so they can be exercised
 * directly (see e2e/daily-insight.spec.ts). The half that calls a model and writes to the
 * database lives in lib/daily-insight-agent.ts. Same split, and the same reason, as
 * lib/limbic-agent-insights.ts.
 */

/** A .edu address is Limbic's student signal everywhere else too (see lib/session.ts
 *  isStudentEmail) — inlined rather than imported because that module is server-only and
 *  this one deliberately is not. */
function isEduEmail(email: string | null | undefined): boolean {
  return !!email && /\.edu$/i.test(email.trim());
}

/**
 * Who the insight is written for.
 *
 * Derived from account facts the reader has already given us rather than a new profile
 * question: a licence on file means a practising clinician, a student tier or .edu identity
 * or a school on file means a student, and everyone else is reading Limbic as a member of
 * the public. It changes the pitch, not the evidence — the same finding is worth knowing at
 * all three levels, but "what you'd do with it" is not.
 */
export type ReaderLevel = "clinician" | "student" | "general";

export function readerLevelOf(user: {
  licenseNumber: string | null;
  email: string | null;
  studentTier: string;
  school: string | null;
}): ReaderLevel {
  if (user.licenseNumber != null) return "clinician";
  if (user.studentTier !== "none" || isEduEmail(user.email) || (user.school ?? "") !== "") return "student";
  return "general";
}

/** How the model is told to address each level. Lives beside ReaderLevel rather than in
 *  lib/daily-insight-agent.ts so the definition of a level and the way we write for it stay
 *  in one place. */
export const LEVEL_BRIEF: Record<ReaderLevel, string> = {
  clinician:
    "a practising physical therapist. Write for a colleague: name the measure, the number and its limits, " +
    "and say what would change in their examination or plan of care. Assume clinical vocabulary.",
  student:
    "a physical therapy student. Write for someone who will be examined on this: name the concept, the number " +
    "worth remembering, and the distinction people most often get wrong. Assume coursework vocabulary but not " +
    "clinical experience.",
  general:
    "a member of the public reading about health and movement. No clinical jargon, no abbreviations, nothing " +
    "that reads as advice about their own condition. Explain what was found and why it is interesting.",
};

export interface DailyInsightSource {
  articleId: string;
  title: string;
  /** The article's own `sourceUrl`, copied from the article record — never written by the
   *  model. See generateDailyInsight. */
  url: string;
  publisher: string;
}

export interface DailyInsight {
  /** Local date the insight belongs to, YYYY-MM-DD — the rotation key. */
  dateKey: string;
  level: ReaderLevel;
  /** The thread this picked up from the reader's own activity, e.g. "Tendinopathy". */
  topic: string;
  /** One or two sentences: what the source actually found. */
  insight: string;
  /** What to do with it, pitched at `level`. */
  soWhat: string;
  source: DailyInsightSource;
  /** True when the text came from the model; false for the deterministic fallback. */
  authored: boolean;
}

/** A link is only worth showing if it can actually be opened. */
export function usableUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * The candidate articles for this reader, best first.
 *
 * Only articles that carry a real external `sourceUrl` are eligible, because the card
 * promises a source link that opens the original. Hand-authored seed articles have no such
 * link (see Article.sourceUrl) and are therefore never chosen, even when they match the
 * reader's topics perfectly — a link into Limbic itself would not be a source. Articles the
 * reader has already opened are excluded too: an insight about something they read last
 * week is not an insight.
 */
export function candidateArticles(
  articles: Article[],
  readArticleIds: Set<string>,
  followedTopics: string[],
  specialty: string
): Article[] {
  const follows = followedTopics.map((t) => t.toLowerCase());
  const scored = articles
    .filter((a) => !readArticleIds.has(a.id) && usableUrl(a.sourceUrl))
    .map((a) => {
      let score = 0;
      const label = (SPECIALTY_META[a.specialty] ?? "").toLowerCase();
      if (follows.some((t) => t === label || a.tags.some((tag) => tag.toLowerCase() === t))) score += 3;
      if (a.specialty === specialty) score += 2;
      return { a, score };
    })
    .filter((x) => x.score > 0);

  scored.sort((x, y) => y.score - x.score || (x.a.id < y.a.id ? -1 : 1));
  return scored.map((x) => x.a);
}

/**
 * The one article today's insight is about, or null when nothing matches.
 *
 * Stable per (reader, day): the same article all day, a different one tomorrow, and two
 * readers with the same candidate pool don't get the same pick. Both callers go through
 * here — the generator and Home's fallback — so the card a reader sees before the cron has
 * run is about the same article the written one will be about, and the two cannot drift.
 */
export function pickInsightArticle(
  articles: Article[],
  readArticleIds: Set<string>,
  followedTopics: string[],
  specialty: string,
  userId: string,
  dateKey: string
): Article | null {
  const pool = candidateArticles(articles, readArticleIds, followedTopics, specialty);
  if (pool.length === 0) return null;
  let h = 0;
  const key = `${userId}:${dateKey}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}

/** The opening of an article summary, cut at a sentence end rather than mid-word.
 *
 *  Summaries are often raw abstracts, which run far longer than a sidebar card and read
 *  badly when simply truncated ("Therefore, this systematic…"). Takes whole sentences up to
 *  a comfortable length, and falls back to the first sentence alone when even that is long.
 *  The budget is set for the Home sidebar, which is around 200px wide — generous here costs
 *  ten lines of a narrow column.
 */
export function leadSentences(summary: string, maxChars = 180): string {
  const text = summary.trim().replace(/\s+/g, " ");
  if (text.length <= maxChars) return text;

  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences || sentences.length === 0) return text.slice(0, maxChars).trimEnd() + "…";

  let out = "";
  for (const sentence of sentences) {
    if (out && (out + sentence).trim().length > maxChars) break;
    out += sentence;
  }
  out = out.trim();
  if (out) return out;

  // A single sentence longer than the budget: cut it at a word boundary instead.
  const first = sentences[0].trim();
  const cut = first.slice(0, maxChars);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd() + "…";
}

/**
 * The insight shown when the model hasn't written one for today yet.
 *
 * Deliberately not a placeholder: it names a real article chosen the same personalized way,
 * carries the same real source link, and says honestly what it is. A reader who never gets
 * picked up by a cron run still gets something true and sourced rather than an empty card.
 */
export function fallbackInsight(article: Article, level: ReaderLevel, dateKey: string): DailyInsight {
  const topic = SPECIALTY_META[article.specialty] ?? "Physical therapy";
  return {
    dateKey,
    level,
    topic,
    insight: leadSentences(article.summary) || article.title,
    soWhat:
      level === "general"
        ? "Worth a read if the topic interests you — the source is linked below."
        : "Read the source before it changes anything you do — this card is the headline, not the evidence.",
    source: { articleId: article.id, title: article.title, url: article.sourceUrl!, publisher: article.source },
    authored: false,
  };
}

/** Today's stored insight, or null when there isn't one for this date. Cheap: no LLM call
 *  ever happens on a Home request (same rule as lib/llm-interest-profile.ts). */
export function storedInsightFor(
  dateKey: string,
  stored: unknown,
  storedDate: string | null
): DailyInsight | null {
  if (storedDate !== dateKey || !stored || typeof stored !== "object") return null;
  const s = stored as Partial<DailyInsight>;
  if (!s.insight || !s.source || !usableUrl(s.source.url)) return null;
  return s as DailyInsight;
}

