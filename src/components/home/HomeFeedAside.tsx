import type { ReactNode } from "react";
import { ContinueReadingCard, type ContinueReadingData } from "@/components/ContinueReadingCard";
import { HomeQuestionCard, type HomeQuestionData } from "@/components/HomeQuestionCard";
import { SavedUnreadCard } from "@/components/SavedUnreadCard";
import { DailyInsightCard } from "@/components/DailyInsightCard";
import { NexusSuggestionsCard, type NexusSuggestion } from "@/components/NexusSuggestionsCard";
import { NexusJoinPromptCard } from "@/components/NexusJoinPromptCard";
import type { DecoratedArticle } from "@/lib/feed";
import type { DailyInsight } from "@/lib/daily-insight";

export function HomeFeedAside({
  showWidget,
  continueReading,
  homeQuestion,
  savedUnread,
  calendarWidget,
  nexusSuggestions,
  showNexus,
  dailyInsight,
}: {
  showWidget: (id: string) => boolean;
  continueReading: ContinueReadingData | null;
  homeQuestion: HomeQuestionData;
  savedUnread: DecoratedArticle[];
  calendarWidget: ReactNode;
  nexusSuggestions: NexusSuggestion[] | null;
  /** Whether Nexus exists for this reader at all — see lib/nexus-visibility.ts. */
  showNexus: boolean;
  /** null when this reader has no article pool to draw one from yet. */
  dailyInsight: DailyInsight | null;
}) {
  return (
    <aside className="home-aside-col">
      <div className="home-aside-scroll">
        {showWidget("continueReading") && <ContinueReadingCard data={continueReading} />}
        {showWidget("homeQuestion") && <HomeQuestionCard data={homeQuestion} />}
        {showWidget("dailyInsight") && dailyInsight && <DailyInsightCard insight={dailyInsight} />}
        {showWidget("savedUnread") && <SavedUnreadCard articles={savedUnread} />}
        {showWidget("calendar") && calendarWidget}
        {showNexus &&
          showWidget("nexus") &&
          (nexusSuggestions ? (
            <NexusSuggestionsCard people={nexusSuggestions} />
          ) : (
            <NexusJoinPromptCard />
          ))}
      </div>
    </aside>
  );
}
