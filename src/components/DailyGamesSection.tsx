import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/board-content";
import { CheckCircleIcon } from "@/components/icons";

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
 *  row for today's dateKey means completed, no row means not started. dateKey here
 *  (board-content.ts todayDateKey) is the same `new Date().toISOString().slice(0, 10)`
 *  format each game's own getDateKey() uses, so the lookups below always agree with what
 *  the game page itself considers "today". */
export async function DailyGamesSection() {
  const user = await getCurrentUser();
  const dateKey = todayDateKey();

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

  return (
    <div className="games-grid">
      {games.map((game) => (
        <Link
          key={game.href}
          href={game.href}
          className={`game-card game-card-standalone game-card-${game.done ? "completed" : "not-started"}`}
        >
          {game.done && (
            <span className="game-card-check-badge">
              <CheckCircleIcon size={18} />
            </span>
          )}
          <span className="game-card-daily-badge">Daily</span>
          <div className="game-card-title">{game.title}</div>
          <p className="game-card-desc">{game.desc}</p>
          <span className="game-card-btn">{game.done ? "Completed ✓" : "Play Today"}</span>
        </Link>
      ))}
    </div>
  );
}
