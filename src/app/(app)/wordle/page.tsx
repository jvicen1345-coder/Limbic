import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { todayDateKey } from "@/lib/wordle-words";
import { WordleGame } from "@/components/WordleGame";

export default async function WordlePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Hard redirect rather than an inline upsell — same reasoning as /agent's isPro gate:
  // a non-student landing on a dead-end page under /wordle is worse than sending them
  // straight to the Pro page, where the Student PRO tiers explain what unlocks this.
  if (!isStudentEmail(user.email)) redirect("/pro");

  return <WordleGame dateKey={todayDateKey()} />;
}
