import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/board-content";
import { CheckCircleIcon } from "@/components/icons";
import { getTimeZone } from "@/lib/user-time-zone";

/** The three clinical-knowledge daily games — Differential, Anatomy Connect, Rehab
 *  Sequence — moved here from the general /games hub (app/(app)/games/page.tsx used to
 *  render these inline) since they test PT clinical knowledge the same way Boards' own
 *  Daily Sharpening does, unlike the casual Wordle/Crossword/Trivia games that stayed on
 *  /games. Rendered on every branch of app/(app)/boards/page.tsx, including the one shown
 *  to a visitor with neither student nor clinician access — these games were never gated
 *  by tier before the move and stay that way, only their location changed.
 *
 *  Each game has its own dedicated Prisma model (DifferentialResult/AnatomyConnectResult/
 *  RehabSequenceResult) rather than the shared DailyCompletion kind the /games hub's cards
 *  use — see lib/games.ts — and a "first finish wins" model with no in-progress state: a
 *  row for today's dateKey means completed, no row means not started. There is no
 *  in-between "started but not finished" signal recorded anywhere for these three games,
 *  so the card only ever renders as not-started or completed — an "in progress" visual
 *  state isn't derivable from the data these models track without adding new tracking,
 *  which is out of scope for a visual-only pass. dateKey here (board-content.ts
 *  todayDateKey) is resolved in the reader's own time zone, the same way each game's own
 *  getDateKey() resolves it (see lib/day.ts), so the lookups below always agree with what
 *  the game page itself considers "today" — including in the evening in the Americas,
 *  where both used to have already rolled over to tomorrow. */
export async function DailyGamesSection() {
  const user = await getCurrentUser();
  const dateKey = todayDateKey(await getTimeZone(user));

  const [differential, anatomyConnect, rehabSequence] = user
    ? await Promise.all([
        prisma.differentialResult.findUnique({ where: { userId_dateKey: { userId: user.id, dateKey } } }),
        prisma.anatomyConnectResult.findUnique({ where: { userId_dateKey: { userId: user.id, dateKey } } }),
        prisma.rehabSequenceResult.findUnique({ where: { userId_dateKey: { userId: user.id, dateKey } } }),
      ])
    : [null, null, null];

  const games = [
    {
      href: "/games/differential",
      title: "Differential",
      desc: "Five clues. One condition. How quickly can you identify it?",
      done: differential != null,
    },
    {
      href: "/games/anatomy-connect",
      title: "Anatomy Connect",
      desc: "Match muscles to their nerves, actions, and regions. One new puzzle every day.",
      done: anatomyConnect != null,
    },
    {
      href: "/games/rehab-sequence",
      title: "Rehab Sequence",
      desc: "Eight interventions. One correct order. Arrange them the way a great clinician would.",
      done: rehabSequence != null,
    },
  ];

  const completedCount = games.filter((g) => g.done).length;

  return (
    <>
      <div className="daily-games-context-bar">
        <span className="daily-games-context-date">{formatTodayLong(dateKey)}</span>
        {completedCount === 3 ? (
          <span className="daily-games-context-status daily-games-context-status--complete">All games complete ✓</span>
        ) : completedCount > 0 ? (
          <span className="daily-games-context-status daily-games-context-status--partial">
            {completedCount} of 3 complete — keep going
          </span>
        ) : (
          <span className="daily-games-context-status daily-games-context-status--none">
            Complete all three to keep your streak alive
          </span>
        )}
      </div>
      <div className="games-grid">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className={`game-card game-card-standalone game-card-${game.done ? "completed" : "not-started"}`}
          >
            <span className="game-card-daily-badge">Daily</span>
            <div className="game-card-title">{game.title}</div>
            {game.done ? (
              <>
                <p className="game-card-desc game-card-desc--clamp">{game.desc}</p>
                <span className="game-card-standalone-done">
                  <CheckCircleIcon size={16} />
                  Done for today
                </span>
              </>
            ) : (
              <>
                <p className="game-card-desc">{game.desc}</p>
                <span className="game-card-btn">Play Today</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}

/** "Monday, September 1, 2026" — the T00:00:00 (local, not Z) suffix parses dateKey as
 *  local midnight rather than UTC midnight, same fix as AtriumThisWeekCard's formatDueDate
 *  for the same reason: a bare `new Date(dateKey)` reads a date-only string as UTC
 *  midnight, which renders as the previous day in any timezone west of UTC. */
function formatTodayLong(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
