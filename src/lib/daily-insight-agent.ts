import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import { LEVEL_BRIEF, pickInsightArticle, readerLevelOf, type DailyInsight } from "@/lib/daily-insight";
import type { Article } from "@/lib/types";

/**
 * The half of the daily insight that talks to a model and to the database. The selection
 * rules and the card's shape are pure and live in lib/daily-insight.ts.
 */

const client = new Anthropic();
const MODEL = "claude-opus-5";

// How much recent activity the model is shown. Enough to pick up what someone is actually
// working on, bounded so prompt size and cost don't grow with account age.
const MAX_HISTORY_ITEMS = 25;

// How many insights one cron run generates at most — bounds LLM spend per invocation the
// same way refreshStaleInterestProfiles does. A reader missed by today's batch falls back
// to the deterministic insight, which is still real and still sourced.
const MAX_INSIGHTS_PER_RUN = 25;

const InsightSchema = z.object({
  topic: z.string().describe("The single topic this insight is about, two or three words, title case."),
  insight: z
    .string()
    .describe("One or two sentences stating what this specific article reports. Only what the title and summary support."),
  soWhat: z.string().describe("One sentence on what the reader should take from it, pitched at their level."),
});

/**
 * Writes today's insight for one reader and stores it.
 *
 * **The model never supplies the link.** It is given one real article and asked to write
 * about that article only; the URL, title and publisher on the stored insight are copied
 * from the article record afterwards. That is what makes the source link on the card
 * guaranteed to resolve — there is no path by which a generated string becomes a link.
 * Everything else about the card is the model's, and it is asked for nothing it cannot
 * support from the material it was given.
 */
export async function generateDailyInsight(
  userId: string,
  dateKey: string
): Promise<{ ok: true; insight: DailyInsight } | { ok: false; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      licenseNumber: true,
      email: true,
      studentTier: true,
      school: true,
      specialty: true,
      followedTopics: true,
      llmInterestProfile: true,
    },
  });
  if (!user) return { ok: false, message: "No such reader." };

  const level = readerLevelOf(user);
  const followedTopics = Array.isArray(user.followedTopics) ? (user.followedTopics as unknown as string[]) : [];

  const [articles, readRows] = await Promise.all([
    getArticles(),
    prisma.readArticle.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: MAX_HISTORY_ITEMS,
      select: { articleId: true },
    }),
  ]);

  const readIds = new Set(readRows.map((r) => r.articleId));
  const article = pickInsightArticle(articles, readIds, followedTopics, user.specialty, userId, dateKey);
  if (!article) return { ok: false, message: "No unread article matches this reader's topics yet." };

  // What the reader has been reading, so the model can connect today's pick to it rather
  // than describing the article in isolation.
  const articleById = new Map(articles.map((a) => [a.id, a]));
  const recent = readRows
    .map((r) => articleById.get(r.articleId))
    .filter((a): a is Article => Boolean(a))
    .slice(0, 8)
    .map((a) => `- ${a.title} (${SPECIALTY_META[a.specialty] ?? a.specialty})`);

  const profileSummary =
    user.llmInterestProfile && typeof user.llmInterestProfile === "object" && "summary" in user.llmInterestProfile
      ? String((user.llmInterestProfile as { summary?: unknown }).summary ?? "")
      : "";

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low", format: zodOutputFormat(InsightSchema) },
      system:
        "You write one short daily insight for a reader of Limbic, a physical therapy platform. " +
        "You are given ONE article and must write about that article only. " +
        "State only what the supplied title and summary actually support: no invented numbers, no invented " +
        "study details, no claims the material does not carry. If the material is thin, say something modest " +
        "and true rather than padding it. Never include a URL, citation or link in your output — the link is " +
        "attached separately from the source record. Never give individual medical advice.",
      messages: [
        {
          role: "user",
          content:
            `Reader level: ${LEVEL_BRIEF[level]}\n` +
            (profileSummary ? `What they read: ${profileSummary}\n` : "") +
            (recent.length ? `\nRecently read:\n${recent.join("\n")}\n` : "") +
            `\nToday's article:\nTitle: ${article.title}\n` +
            `Topic: ${SPECIALTY_META[article.specialty] ?? article.specialty}\n` +
            `Publisher: ${article.source}\n` +
            (article.summary ? `Summary: ${article.summary}\n` : "") +
            `\nWrite the insight.`,
        },
      ],
    });

    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: "No insight came back." };

    const insight: DailyInsight = {
      dateKey,
      level,
      topic: parsed.topic,
      insight: parsed.insight,
      soWhat: parsed.soWhat,
      // Straight from the article record. Nothing the model returned is used here.
      source: { articleId: article.id, title: article.title, url: article.sourceUrl!, publisher: article.source },
      authored: true,
    };

    await prisma.user.update({
      where: { id: userId },
      data: { dailyInsight: insight as unknown as object, dailyInsightDate: dateKey },
    });
    return { ok: true, insight };
  } catch (err) {
    console.error("generateDailyInsight failed:", err);
    return { ok: false, message: "Limbic couldn't write an insight right now." };
  }
}

/**
 * Writes today's insight for active readers who don't have one yet — called by
 * app/api/cron/refresh-daily-insights/route.ts. Same bounded-batch shape as
 * refreshStaleInterestProfiles: never on a request path, never unbounded.
 */
export async function refreshDailyInsights(dateKey: string): Promise<{ attempted: number; succeeded: number }> {
  const candidates = await prisma.user.findMany({
    where: { isGuest: false, readArticles: { some: {} }, NOT: { dailyInsightDate: dateKey } },
    select: { id: true },
    take: MAX_INSIGHTS_PER_RUN,
  });

  let succeeded = 0;
  for (const c of candidates) {
    const result = await generateDailyInsight(c.id, dateKey);
    if (result.ok) succeeded++;
  }
  return { attempted: candidates.length, succeeded };
}
