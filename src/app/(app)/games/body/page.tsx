import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey, bodyMatchSetForDate } from "@/lib/body-connections-static";
import { BodyConnectionsGame } from "@/components/BodyConnectionsGame";

export default async function BodyConnectionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dateKey = todayDateKey();
  const matchSet = bodyMatchSetForDate(dateKey);

  const row = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "bodyConnections", dateKey } },
  });
  const initialMatchedRegions = (row?.guesses as string[] | null) ?? [];

  return <BodyConnectionsGame dateKey={dateKey} pairs={matchSet.pairs} initialMatchedRegions={initialMatchedRegions} />;
}
