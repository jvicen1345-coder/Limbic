import type { ReactNode } from "react";
import { ContinueReadingCard, type ContinueReadingData } from "@/components/ContinueReadingCard";
import { HomeQuestionCard, type HomeQuestionData } from "@/components/HomeQuestionCard";
import { StockCard } from "@/components/StockCard";
import { SavedUnreadCard } from "@/components/SavedUnreadCard";
import { NexusSuggestionsCard, type NexusSuggestion } from "@/components/NexusSuggestionsCard";
import { NexusJoinPromptCard } from "@/components/NexusJoinPromptCard";
import type { DecoratedArticle } from "@/lib/feed";
import type { StockView } from "@/lib/stock";

export function HomeFeedAside({
  showWidget,
  continueReading,
  homeQuestion,
  savedUnread,
  calendarWidget,
  nexusSuggestions,
  nexusOnWaitlist,
  stocks,
}: {
  showWidget: (id: string) => boolean;
  continueReading: ContinueReadingData | null;
  homeQuestion: HomeQuestionData;
  savedUnread: DecoratedArticle[];
  calendarWidget: ReactNode;
  nexusSuggestions: NexusSuggestion[] | null;
  nexusOnWaitlist: boolean;
  stocks: StockView[];
}) {
  return (
    <aside className="home-aside-col">
      <div className="home-aside-scroll">
        {showWidget("continueReading") && <ContinueReadingCard data={continueReading} />}
        {showWidget("homeQuestion") && <HomeQuestionCard data={homeQuestion} />}
        {showWidget("savedUnread") && <SavedUnreadCard articles={savedUnread} />}
        {showWidget("calendar") && calendarWidget}
        {showWidget("nexus") &&
          (nexusSuggestions ? (
            <NexusSuggestionsCard people={nexusSuggestions} />
          ) : (
            <NexusJoinPromptCard onWaitlist={nexusOnWaitlist} />
          ))}
        {showWidget("stock") && <StockCard stocks={stocks} />}
      </div>
    </aside>
  );
}
