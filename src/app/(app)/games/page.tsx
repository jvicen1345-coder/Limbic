import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/wordle-words";
import {
  GAMES,
  GAME_KINDS,
  DIFFICULTY_DOTS,
  completionStateForStatus,
  isFinishedStatus,
  computeCurrentStreak,
  computeBestStreak,
  last7DateKeys,
  type GameKind,
  type CardCompletionState,
} from "@/lib/games";
import { DailyTermIcon, MiniCrosswordIcon, CaseOfDayIcon, CheckCircleIcon, LockIcon } from "@/components/icons";

const GAME_ICON: Record<GameKind, (props: { size?: number }) => React.ReactNode> = {
  wordle: DailyTermIcon,
  crossword: MiniCrosswordIcon,
  caseOfDay: CaseOfDayIcon,
};

const BUTTON_LABEL: Record<CardCompletionState, string> = {
  "not-started": "Play Today",
  "in-progress": "Continue",
  completed: "Completed ✓",
  locked: "Available Tomorrow",
};

export default async function GamesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dateKey = todayDateKey();

  const [todayRows, historyRows] = await Promise.all([
    prisma.dailyCompletion.findMany({
      where: { userId: user.id, kind: { in: GAME_KINDS }, dateKey },
      select: { kind: true, status: true },
    }),
    prisma.dailyCompletion.findMany({
      where: { userId: user.id, kind: { in: GAME_KINDS } },
      select: { kind: true, dateKey: true, status: true },
    }),
  ]);

  const todayStatusByKind = new Map(todayRows.map((r) => [r.kind, r.status]));
  const finishedRows = historyRows.filter((r) => isFinishedStatus(r.status));
  const finishedDateKeys = finishedRows.map((r) => r.dateKey);

  const currentStreak = computeCurrentStreak(finishedDateKeys, dateKey);
  const bestStreak = computeBestStreak(finishedDateKeys);
  const totalCompleted = finishedRows.length;

  const countByKind = new Map<string, number>();
  for (const row of finishedRows) countByKind.set(row.kind, (countByKind.get(row.kind) ?? 0) + 1);
  let favoriteGame: string | null = null;
  let favoriteCount = 0;
  for (const game of GAMES) {
    const count = countByKind.get(game.kind) ?? 0;
    if (count > favoriteCount) {
      favoriteCount = count;
      favoriteGame = game.title;
    }
  }

  const week = last7DateKeys(dateKey);
  const weekFinishedSet = new Set(finishedDateKeys);
  const activeWeekDays = week.filter((d) => weekFinishedSet.has(d)).length;

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="games-header">
        <p className="games-header-date">{todayLabel}</p>
        <h1 className="games-header-title">Limbic Games</h1>
        {currentStreak > 0 && <div className="games-header-streak">🔥 {currentStreak} day streak</div>}
        <p className="games-header-tagline">Your daily dose of clinical knowledge</p>
      </div>

      <div className="games-grid">
        {GAMES.map((game) => {
          const Icon = GAME_ICON[game.kind];
          const state = completionStateForStatus(todayStatusByKind.get(game.kind));
          return (
            <Link key={game.kind} href={game.href} className={`game-card game-card-${state}`}>
              {state === "completed" && (
                <span className="game-card-check-badge">
                  <CheckCircleIcon size={18} />
                </span>
              )}
              {state === "in-progress" && <span className="game-card-progress-dot" />}
              {state === "locked" && (
                <span className="game-card-lock-badge">
                  <LockIcon size={16} />
                </span>
              )}

              <div className="game-card-icon">
                <Icon size={56} />
              </div>
              <div className="game-card-title">{game.title}</div>
              <p className="game-card-desc">{game.description}</p>

              <div className="game-card-meta">
                <span className="game-card-dots">
                  {Array.from({ length: 3 }, (_, i) => (
                    <span key={i} className={`game-card-dot${i < DIFFICULTY_DOTS[game.difficulty] ? " game-card-dot-filled" : ""}`} />
                  ))}
                  <span style={{ marginLeft: 4 }}>{game.difficulty}</span>
                </span>
                <span>·</span>
                <span>{game.timeEstimate}</span>
              </div>

              <span className="game-card-btn">{BUTTON_LABEL[state]}</span>
            </Link>
          );
        })}
      </div>

      <div className="card elev-sm" style={{ padding: 20 }}>
        <div className="games-stats-title">Your Stats</div>
        <div className="games-stats-grid">
          <div className="games-stat-tile">
            <div className="games-stat-value">{totalCompleted}</div>
            <div className="games-stat-label">Games Completed</div>
          </div>
          <div className="games-stat-tile">
            <div className="games-stat-value">{currentStreak}</div>
            <div className="games-stat-label">Current Streak</div>
          </div>
          <div className="games-stat-tile">
            <div className="games-stat-value">{bestStreak}</div>
            <div className="games-stat-label">Best Streak</div>
          </div>
          <div className="games-stat-tile">
            <div className="games-stat-value" style={{ fontSize: 15 }}>
              {favoriteGame ?? "—"}
            </div>
            <div className="games-stat-label">Favorite Game</div>
          </div>
        </div>

        <div className="games-week-bar">
          {week
            .slice()
            .reverse()
            .map((d) => (
              <span key={d} className={`games-week-dot${weekFinishedSet.has(d) ? " games-week-dot-active" : ""}`} />
            ))}
          <span className="games-week-label">
            {activeWeekDays} out of 7 days
          </span>
        </div>
      </div>
    </div>
  );
}
