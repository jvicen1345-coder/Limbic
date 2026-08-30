import Link from "next/link";

/** The three clinical-knowledge daily games — Differential, Anatomy Connect, Rehab
 *  Sequence — moved here from the general /games hub (app/(app)/games/page.tsx used to
 *  render these inline) since they test PT clinical knowledge the same way Boards' own
 *  Daily Sharpening does, unlike the casual Wordle/Crossword/Trivia games that stayed on
 *  /games. Rendered on every branch of app/(app)/boards/page.tsx, including the one shown
 *  to a visitor with neither student nor clinician access — these games were never gated
 *  by tier before the move and stay that way, only their location changed. Pure static
 *  links: unlike the /games hub's own cards, these don't track a per-day completion state
 *  on the card itself (each has its own dedicated Prisma model rather than the shared
 *  DailyCompletion kind — see lib/games.ts), so there's no state to fetch here. */
export function DailyGamesSection() {
  return (
    <div className="games-grid">
      <Link href="/games/differential" className="game-card game-card-standalone">
        <span className="game-card-daily-badge">Daily</span>
        <div className="game-card-title">Differential</div>
        <p className="game-card-desc">Five clues. One condition. How quickly can you identify it?</p>
        <span className="game-card-btn">Play Today</span>
      </Link>
      <Link href="/games/anatomy-connect" className="game-card game-card-standalone">
        <span className="game-card-daily-badge">Daily</span>
        <div className="game-card-title">Anatomy Connect</div>
        <p className="game-card-desc">Match muscles to their nerves, actions, and regions. One new puzzle every day.</p>
        <span className="game-card-btn">Play Today</span>
      </Link>
      <Link href="/games/rehab-sequence" className="game-card game-card-standalone">
        <span className="game-card-daily-badge">Daily</span>
        <div className="game-card-title">Rehab Sequence</div>
        <p className="game-card-desc">Eight interventions. One correct order. Arrange them the way a great clinician would.</p>
        <span className="game-card-btn">Play Today</span>
      </Link>
    </div>
  );
}
