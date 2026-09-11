import {
  formatBriefDate,
  formatScore,
  type ChangeKind,
  type ExerciseProgressRow,
  type GoalItem,
  type LiftProgress,
  type OutcomeProgress,
  type PatientProgress,
  type PlanOfCareProgress,
  type StrengthChangeRow,
  type StrengthSymmetryRow,
} from "@/lib/patient-progress";

function goalStatusLabel(status: string): string {
  if (status === "met") return "Achieved";
  if (status === "partially-met") return "Partly met";
  if (status === "not-met") return "Not yet met";
  if (status === "active") return "In progress";
  return status;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function verdictClass(kind: ChangeKind | null, meaningful: boolean): string {
  if (kind === "improved" && meaningful) return "patient-brief-verdict--good";
  if (kind === "improved") return "patient-brief-verdict--warn";
  if (kind === "declined") return "patient-brief-verdict--bad";
  return "";
}

function OutcomeSparkline({ points, label }: { points: OutcomeProgress["points"]; label: string }) {
  if (points.length < 2) return null;
  const w = 260;
  const h = 64;
  const padX = 10;
  const padY = 10;
  const maxY = Math.max(1, ...points.map((p) => Math.max(p.score, p.maxScore, 0)));
  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (w - padX * 2);
    const y = h - padY - (Math.max(p.score, 0) / maxY) * (h - padY * 2);
    return { x, y };
  });
  const polyline = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  return (
    <svg
      className="patient-brief-spark"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      role="img"
      aria-label={label}
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="#3b6fe0"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="3.2" fill="#3b6fe0" />
      ))}
    </svg>
  );
}

function ClientGoalBanner({ goal }: { goal: NonNullable<PatientProgress["clientGoal"]> }) {
  const text = goal.goalShort || goal.goalLong;
  const extra = goal.goalShort && goal.goalLong && goal.goalLong !== goal.goalShort ? goal.goalLong : null;
  return (
    <div className="patient-brief-panel patient-brief-goal-banner">
      <div className="patient-brief-section-title">What you wanted from therapy</div>
      <p className="patient-brief-goal-quote">“{text}”</p>
      {extra && <p className="patient-brief-goal-long">{extra}</p>}
    </div>
  );
}

function OutcomePanel({ outcomes }: { outcomes: OutcomeProgress[] }) {
  if (outcomes.length === 0) return null;
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">How you are scoring</div>
      <div className="patient-brief-outcome-grid">
        {outcomes.map((outcome) => (
          <div className={`patient-brief-outcome-card ${verdictClass(outcome.kind, outcome.meaningful)}`.trim()} key={outcome.measureName}>
            <div className="patient-brief-outcome-name">{outcome.displayName}</div>
            <p className="patient-brief-plain-label">{outcome.plainLabel}</p>
            <OutcomeSparkline
              points={outcome.points}
              label={`${outcome.displayName} scores from ${formatScore(outcome.first.score, outcome.first.maxScore)} to ${formatScore(outcome.latest.score, outcome.latest.maxScore)}`}
            />
            {outcome.points.length >= 2 && (
              <div className="patient-brief-spark-axis">
                <span>{formatBriefDate(outcome.first.recordedAt)}</span>
                <span>{formatBriefDate(outcome.latest.recordedAt)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanOfCarePanel({ plan }: { plan: PlanOfCareProgress }) {
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">Your plan of care</div>
      <p className="patient-brief-plain-label">
        Visit {plan.visitCount} of {plan.totalVisits} completed
        {plan.visitLogCount > 0 ? ` · ${plan.visitLogCount} visit${plan.visitLogCount === 1 ? "" : "s"} logged` : ""}
      </p>
      <div
        className="patient-brief-bar-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={plan.totalVisits}
        aria-valuenow={plan.visitCount}
        aria-label={`Visit ${plan.visitCount} of ${plan.totalVisits}`}
      >
        <span className="patient-brief-bar-fill" style={{ width: `${plan.percent}%` }} />
      </div>
      <div className="patient-brief-plan-dates">
        <span>Started {formatFullDate(plan.startDate)}</span>
        {plan.lastSeen && <span>Last visit {formatFullDate(plan.lastSeen)}</span>}
        {plan.nextVisit && <span>Next visit {formatFullDate(plan.nextVisit)}</span>}
      </div>
    </div>
  );
}

function StrengthBar({ label, value, max, unit, tone }: { label: string; value: number | null; max: number; unit: string; tone: "left" | "right" }) {
  const width = value == null || max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="patient-brief-strength-bar-row">
      <span className="patient-brief-strength-side">{label}</span>
      <span className="patient-brief-bar-track">
        <span className={`patient-brief-bar-fill patient-brief-bar-fill--${tone}`} style={{ width: `${width}%` }} />
      </span>
      <span className="patient-brief-strength-value">{value != null ? `${value} ${unit}` : "—"}</span>
    </div>
  );
}

function StrengthSymmetryPanel({ rows }: { rows: StrengthSymmetryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">Left and right strength</div>
      <p className="patient-brief-panel-intro">Latest reading for each muscle group. Symmetry describes how even the two sides are.</p>
      {rows.map((row) => {
        const max = Math.max(1, row.leftPeak ?? 0, row.rightPeak ?? 0);
        return (
          <div className="patient-brief-strength-card" key={row.muscleGroup}>
            <div className="patient-brief-strength-head">
              <span className="patient-brief-strength-name">{row.displayName}</span>
              {row.lsiLabel && row.lsiColor && (
                <span className="patient-brief-lsi-pill" style={{ color: row.lsiColor, borderColor: row.lsiColor }}>
                  {row.lsiLabel}
                  {row.lsi != null ? ` (${row.lsi}%)` : ""}
                </span>
              )}
            </div>
            <StrengthBar label="Left" value={row.leftPeak} max={max} unit={row.unit} tone="left" />
            <StrengthBar label="Right" value={row.rightPeak} max={max} unit={row.unit} tone="right" />
            <p className="patient-brief-muted">Measured {formatFullDate(row.sessionDate)}</p>
          </div>
        );
      })}
    </div>
  );
}

function StrengthChangePanel({ rows }: { rows: StrengthChangeRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">How much stronger</div>
      {rows.map((row) => (
        <div className="patient-brief-change-row" key={row.muscleGroup}>
          <div className="patient-brief-strength-name">{row.displayName}</div>
          <p className="patient-brief-plain-label">{row.plainLabel}</p>
        </div>
      ))}
    </div>
  );
}

function LiftingPanel({ lifts }: { lifts: LiftProgress[] }) {
  if (lifts.length === 0) return null;
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">Lifting benchmarks</div>
      {lifts.map((lift) => (
        <div className={`patient-brief-change-row ${verdictClass(lift.kind, lift.kind === "improved")}`.trim()} key={lift.lift}>
          <div className="patient-brief-strength-name">{lift.displayName}</div>
          <p className="patient-brief-plain-label">{lift.plainLabel}</p>
        </div>
      ))}
    </div>
  );
}

function ExercisePanel({ rows }: { rows: ExerciseProgressRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">Exercise progression</div>
      <p className="patient-brief-panel-intro">Exercises you did in both your first and most recent logged session — sets × reps × load.</p>
      <table className="patient-brief-progress-table">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Then</th>
            <th>Now</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>
                {row.first.sets || "—"} × {row.first.reps || "—"} × {row.first.weight || "—"}
              </td>
              <td>
                {row.latest.sets || "—"} × {row.latest.reps || "—"} × {row.latest.weight || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GoalList({ title, items }: { title: string; items: GoalItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="patient-brief-goal-col-title">{title}</div>
      <ul className="patient-brief-goal-list">
        {items.map((goal) => (
          <li key={`${goal.goalText}-${goal.timeframe}`}>
            <span className="patient-brief-goal-text">{goal.goalText}</span>
            <span className="patient-brief-muted">
              {goal.timeframe}
              {goal.status !== "met" ? ` · ${goalStatusLabel(goal.status)}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GoalsPanel({ goals }: { goals: NonNullable<PatientProgress["goals"]> }) {
  return (
    <div className="patient-brief-panel">
      <div className="patient-brief-section-title">Your goals</div>
      <div className="patient-brief-goal-cols">
        <GoalList title="Achieved" items={goals.achieved} />
        <GoalList title="Still in progress" items={goals.inProgress} />
      </div>
    </div>
  );
}

/** Presentational progress panels for the printable patient brief. Server-rendered —
 *  charts are inline SVG with no client JS, so Print / Save as PDF captures them. */
export function PatientBriefProgress({ progress }: { progress: PatientProgress }) {
  return (
    <>
      {progress.clientGoal && <ClientGoalBanner goal={progress.clientGoal} />}
      <OutcomePanel outcomes={progress.outcomes} />
      {progress.planOfCare && <PlanOfCarePanel plan={progress.planOfCare} />}
      <StrengthSymmetryPanel rows={progress.strengthSymmetry} />
      <StrengthChangePanel rows={progress.strengthChange} />
      <LiftingPanel lifts={progress.lifts} />
      <ExercisePanel rows={progress.exercises} />
      {progress.goals && <GoalsPanel goals={progress.goals} />}
    </>
  );
}
