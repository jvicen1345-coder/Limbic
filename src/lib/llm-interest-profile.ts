import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import type { Article } from "@/lib/types";

const client = new Anthropic();
const MODEL = "claude-opus-5";

// How much reading history to actually show the model — recent, not exhaustive. A reader's
// current interests are better read off their last couple weeks of activity than their
// entire lifetime history, and this keeps the prompt (and cost) bounded regardless of how
// long the account has existed.
const MAX_HISTORY_ITEMS = 40;

// Below this many touched articles there isn't enough signal for the model to say anything
// more specific than "reads physical therapy content" — not worth the call.
const MIN_HISTORY_FOR_PROFILE = 5;

// A profile older than this is treated as stale and eligible for regeneration by the daily
// cron (see app/api/cron/refresh-interest-profiles/route.ts) — long enough that a reader's
// implicit interests don't get recomputed on every marginal new read, short enough that a
// real shift in what someone's reading (e.g. an upcoming rotation, a new clinical interest)
// shows up in the feed within about a day of it becoming visible in their activity.
const STALE_AFTER_HOURS = 24;

const InterestProfileSchema = z.object({
  topics: z
    .array(
      z.object({
        label: z
          .string()
          .describe(
            "A specific clinical topic, condition, patient population, or technique this reader's activity " +
              "shows real interest in, as concrete as the evidence supports (e.g. 'ACL rehabilitation', " +
              "'pediatric torticollis', 'blood flow restriction training'), not a vague restatement of a " +
              "specialty they already declared."
          ),
        weight: z
          .number()
          .min(0)
          .max(1)
          .describe("0-1 strength of this interest relative to the others in this list, 1 is their strongest signal."),
      })
    )
    .min(1)
    .max(8)
    .describe("The reader's inferred interests, strongest first, drawn only from patterns actually present in their activity below, never invented."),
  summary: z
    .string()
    .describe("One sentence describing what this reader seems to actually care about right now, for internal/debugging use, not shown to the reader."),
});

export interface InterestProfileTopic {
  label: string;
  weight: number;
}

/** What lib/feed.ts's rankFeed consumes and what gets cached on User.llmInterestProfile —
 *  see that field's own doc comment in schema.prisma for the full round trip. */
export interface LlmInterestProfile {
  topics: InterestProfileTopic[];
  summary: string;
  generatedAt: string;
}

/** Safe parse of whatever's actually sitting in User.llmInterestProfile — a raw Prisma Json
 *  column, so this guards against a shape that predates a future field change rather than
 *  trusting the cast. Returns null on anything that doesn't look right, same "ranking works
 *  fully without it" fallback lib/feed.ts already assumes for a reader who's never had a
 *  profile generated at all. */
export function parseInterestProfile(raw: unknown): LlmInterestProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.topics) || typeof r.summary !== "string" || typeof r.generatedAt !== "string") return null;
  const topics = r.topics.filter(
    (t): t is InterestProfileTopic =>
      !!t && typeof t === "object" && typeof (t as InterestProfileTopic).label === "string" && typeof (t as InterestProfileTopic).weight === "number"
  );
  if (topics.length === 0) return null;
  return { topics, summary: r.summary, generatedAt: r.generatedAt };
}

export function isInterestProfileStale(updatedAt: Date | null, now: number = Date.now()): boolean {
  if (!updatedAt) return true;
  return now - updatedAt.getTime() > STALE_AFTER_HOURS * 60 * 60 * 1000;
}

function historyLine(article: Article, kind: "read" | "saved", completion?: number): string {
  const pct = completion != null ? ` (${Math.round(completion * 100)}% read)` : "";
  return `- [${kind}${pct}] ${SPECIALTY_META[article.specialty]} · ${article.title}, tags: ${article.tags.join(", ") || "none"}`;
}

/**
 * Generates (and persists) one reader's implicit-interest profile from their recent
 * ReadArticle/SavedArticle activity — the LLM piece rankFeed's affinity model can fold in
 * on top of its own purely behavioral tag/specialty scoring (see lib/feed.ts). Deliberately
 * not called from the Home page render path: an LLM call on every page load doesn't scale
 * (see this file's STALE_AFTER_HOURS comment and app/api/cron/refresh-interest-profiles/
 * route.ts, the intended caller on a daily schedule). Safe to call directly too — e.g. for
 * a future "refresh my recommendations" affordance, or manual testing.
 */
export async function generateInterestProfile(userId: string): Promise<{ ok: true; profile: LlmInterestProfile } | { ok: false; message: string }> {
  const [readRows, savedRows] = await Promise.all([
    prisma.readArticle.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: MAX_HISTORY_ITEMS,
      select: { articleId: true, scrollProgress: true },
    }),
    prisma.savedArticle.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY_ITEMS,
      select: { articleId: true },
    }),
  ]);

  if (readRows.length + savedRows.length < MIN_HISTORY_FOR_PROFILE) {
    return { ok: false, message: "Not enough reading history yet to generate a profile." };
  }

  const articles = await getArticles();
  const articleById = new Map(articles.map((a) => [a.id, a]));

  const lines: string[] = [];
  for (const row of readRows) {
    const article = articleById.get(row.articleId);
    if (article) lines.push(historyLine(article, "read", row.scrollProgress));
  }
  for (const row of savedRows) {
    const article = articleById.get(row.articleId);
    if (article) lines.push(historyLine(article, "saved"));
  }

  if (lines.length < MIN_HISTORY_FOR_PROFILE) {
    return { ok: false, message: "Not enough of this reader's history is in the current article pool to profile." };
  }

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "low", format: zodOutputFormat(InterestProfileSchema) },
      system:
        "You infer a physical therapy professional's real clinical interests from their reading activity on Limbic, " +
        "a PT platform. Be specific and evidence-based, only name interests the activity below actually supports, " +
        "never generic restatements of a whole specialty, and never anything invented.",
      messages: [
        {
          role: "user",
          content: `This reader's recent activity (${kindCounts(readRows.length, savedRows.length)}):\n\n${lines.join("\n")}\n\nInfer their interest profile.`,
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: "Limbic couldn't generate an interest profile right now." };

    const profile: LlmInterestProfile = { topics: parsed.topics, summary: parsed.summary, generatedAt: new Date().toISOString() };
    await prisma.user.update({
      where: { id: userId },
      // Prisma's Json input type wants a plain indexable object, not a named interface —
      // same reasoning every `as unknown as string[]` cast elsewhere in this codebase
      // applies in reverse (see e.g. lib/session.ts callers of followedTopics).
      data: { llmInterestProfile: profile as unknown as object, llmInterestProfileUpdatedAt: new Date() },
    });
    return { ok: true, profile };
  } catch (err) {
    console.error("generateInterestProfile failed:", err);
    return { ok: false, message: "Limbic couldn't generate an interest profile right now." };
  }
}

function kindCounts(reads: number, saves: number): string {
  return `${reads} read, ${saves} saved`;
}

// How many stale profiles one cron run regenerates at most — bounds both the run's wall
// time and, more importantly, its LLM spend per invocation regardless of how many active
// readers exist. A reader who misses a day's batch simply gets picked up by the next one;
// nothing depends on same-day freshness.
const MAX_PROFILES_PER_RUN = 25;

/**
 * Regenerates the interest profile for every active reader whose profile is missing or
 * stale, up to MAX_PROFILES_PER_RUN — called by app/api/cron/refresh-interest-profiles/
 * route.ts on a daily schedule (see vercel.json). "Active reader" means they have at least
 * one ReadArticle row at all; a guest or an account that's never opened an article has
 * nothing for the model to read, so generateInterestProfile would just reject it anyway —
 * filtered here instead so the query only pulls candidates actually worth a call.
 */
export async function refreshStaleInterestProfiles(): Promise<{ attempted: number; succeeded: number }> {
  const candidates = await prisma.user.findMany({
    where: { isGuest: false, readArticles: { some: {} } },
    select: { id: true, llmInterestProfileUpdatedAt: true },
    take: 500,
  });

  const now = Date.now();
  const stale = candidates.filter((c) => isInterestProfileStale(c.llmInterestProfileUpdatedAt, now)).slice(0, MAX_PROFILES_PER_RUN);

  let succeeded = 0;
  for (const c of stale) {
    const result = await generateInterestProfile(c.id);
    if (result.ok) succeeded++;
  }
  return { attempted: stale.length, succeeded };
}
