import { todayDateKey } from "@/lib/wordle-words";
import { WordleGame } from "@/components/WordleGame";

export default function WordlePage() {
  return <WordleGame dateKey={todayDateKey()} />;
}
