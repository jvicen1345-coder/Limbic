import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/wordle-words";
import { getArticles } from "@/lib/articles";
import { dayIndexForDateKey, caseForDayIndex } from "@/lib/cases-static";
import { findRelatedArticle } from "@/lib/games";
import { CaseOfDayGame, type CaseOfDayInitialState } from "@/components/CaseOfDayGame";

export default async function CaseOfDayPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dateKey = todayDateKey();
  const dayCase = caseForDayIndex(dayIndexForDateKey(dateKey));

  const [row, articles] = await Promise.all([
    prisma.dailyCompletion.findUnique({
      where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } },
    }),
    // getArticles() hits live network sources (see lib/articles.ts) purely to resolve one
    // "Learn More" link — a flaky fetch here shouldn't take down the whole case page, so
    // fall back to an empty pool (which just means the search-page fallback link below).
    getArticles().catch(() => []),
  ]);

  const initial: CaseOfDayInitialState | null = row
    ? {
        attemptedIndexes: ((row.guesses as string[] | null) ?? []).map(Number),
        status: (row.status as CaseOfDayInitialState["status"]) ?? "playing",
      }
    : null;

  const relatedArticle = findRelatedArticle(articles, dayCase.relatedTopic);
  const learnMoreHref = relatedArticle ? `/article/${relatedArticle.id}?threads=1` : `/search?q=${encodeURIComponent(dayCase.relatedTopic)}`;

  return <CaseOfDayGame dateKey={dateKey} dayCase={dayCase} initial={initial} learnMoreHref={learnMoreHref} isPro={user.isPro} />;
}
