"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DailySharpeningSession } from "@/components/DailySharpeningSession";
import type { BoardQuestion, BoardTerm } from "@/lib/board-content";
import type { DailyCase } from "@/lib/cases-static";

const NPTE_SYSTEMS = [
  {
    name: "Musculoskeletal",
    weight: 24,
    color: "var(--color-accent)",
    description: "Bones, joints, muscles, and connective tissue, the highest-weighted system.",
  },
  {
    name: "Neuromuscular and Nervous System",
    weight: 20,
    color: "var(--color-vitals-mindfulness)",
    description: "Neurological conditions, functional mobility, and gait.",
  },
  {
    name: "Cardiopulmonary",
    weight: 16,
    color: "var(--color-danger)",
    description: "Cardiovascular and pulmonary conditions, vitals, and aerobic exercise.",
  },
  {
    name: "Other Body Systems",
    weight: 20,
    color: "var(--color-success)",
    description: "Integumentary, metabolic, GI/GU, and multi-system comorbidities.",
  },
  {
    name: "Non-Systems",
    weight: 20,
    color: "var(--color-warn)",
    description: "Equipment, safety, professional standards, and evidence-based practice.",
  },
] as const;

const NPTE_DEEP_DIVES = [
  {
    title: "Musculoskeletal (~24%)",
    body: "The highest-weighted system. Covers evaluation, diagnosis, and intervention for bones, joints, muscles, and connective tissue. Expect questions on orthopedic conditions, manual therapy, post-surgical rehab, and exercise prescription.",
  },
  {
    title: "Neuromuscular and Nervous System (~20%)",
    body: "Tests your knowledge of neurological conditions including stroke, TBI, SCI, Parkinson's disease, MS, and peripheral neuropathies. Focuses heavily on functional mobility, gait analysis, and neuro-rehab interventions.",
  },
  {
    title: "Cardiopulmonary (~16%)",
    body: "Covers cardiovascular and pulmonary conditions, lab values, vital sign interpretation, aerobic exercise prescription, and ICU-level interventions. Cardiopulmonary is frequently underestimated; don't let it cost you.",
  },
  {
    title: "Other Body Systems (~20%)",
    body: "Includes integumentary, metabolic/endocrine, GI/GU, and multi-system conditions. These often appear as comorbidities alongside primary diagnoses. Covers wound care, diabetes management, osteoporosis, incontinence, pelvic floor, oncology, and connective tissue disorders.",
  },
  {
    title: "Non-Systems (~20%)",
    body: "Covers equipment selection, patient safety, professional standards, evidence-based practice, and clinical administration. These questions are often overlooked but represent a significant portion of the exam.",
  },
] as const;

const STRATEGY_STEPS = [
  "Complete your Daily Sharpening every day; consistency beats cramming.",
  "Use the NPTE Breakdown tab to understand what to prioritize.",
  "Track your time on each session; aim to beat your previous best.",
  "Review any missed questions before starting the next day.",
] as const;

const COMING_SOON_ITEMS = ["Flashcard decks by system", "Full practice question bank", "Study schedule generator"] as const;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDaysToDateKey(base: string, delta: number): string {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

interface WeekDot {
  dateKey: string;
  label: string;
  completed: boolean;
  isToday: boolean;
}

/** Reshapes the already-fetched rolling 7-day `weekDays` window (see
 *  app/(app)/boards/page.tsx — last7DateKeys, ending today) into a true Monday-through-
 *  Sunday calendar week, with no new data fetching: the calendar week's Monday-through-
 *  today portion is always a subset of that rolling window (today's offset from Monday is
 *  always 0-6 days, and the window already reaches back 6 days), so every day up to today
 *  is a plain lookup. Any day after today this week hasn't happened yet, so it's always
 *  "not completed" by definition — no lookup needed for those either. */
function buildWeekDots(todayKey: string, weekDays: { dateKey: string; completed: boolean }[]): WeekDot[] {
  const completedByDate = new Map(weekDays.map((d) => [d.dateKey, d.completed]));
  const todayDow = new Date(`${todayKey}T00:00:00Z`).getUTCDay();
  const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow;
  const mondayKey = addDaysToDateKey(todayKey, mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const dk = addDaysToDateKey(mondayKey, i);
    return {
      dateKey: dk,
      label: WEEKDAY_LABELS[new Date(`${dk}T00:00:00Z`).getUTCDay()],
      completed: completedByDate.get(dk) ?? false,
      isToday: dk === todayKey,
    };
  });
}

function streakMessage(days: number): string {
  if (days === 0) return "Start your streak today — one session builds the habit";
  if (days < 7) return `Day ${days} — keep showing up`;
  if (days < 14) return `${days} day streak — one week strong`;
  if (days < 30) return `${days} days — you are building something real`;
  return `${days} day streak — elite consistency`;
}

function streakMessageClass(days: number): string {
  if (days === 0) return "boards-streak-message--muted";
  if (days < 7) return "boards-streak-message--primary";
  if (days < 14) return "boards-streak-message--brand";
  return "boards-streak-message--success";
}

type BoardsTab = "sharpening" | "breakdown" | "research" | "resources";

const TABS: { id: BoardsTab; label: string }[] = [
  { id: "sharpening", label: "Daily Sharpening" },
  { id: "breakdown", label: "NPTE Breakdown" },
  { id: "research", label: "Research & Stats" },
  { id: "resources", label: "Resources" },
];

/** The four tab panels below the always-visible Limbic Boards header (title + streak
 *  badge, rendered by app/(app)/boards/page.tsx above this component). A plain useState
 *  tab switch — not routes, so the header above never remounts — rather than the
 *  Link-driven .sub-tabs pattern (see components/SubTabs.tsx) used for multi-page
 *  sections elsewhere, since these four panels are one page's content, not separate
 *  destinations. Research & Stats used to be just a card inside Resources (a grab-bag of
 *  external FSBPT links) — promoted to its own tab since it's a full guide + AI tool
 *  (app/(app)/pro/research-literacy) in its own right, not another external reference link. */
export function BoardsTabs({
  dateKey,
  question,
  term,
  dayCase,
  alreadyComplete,
  targetSeconds,
  nexusOptIn,
  currentStreak,
  longestStreak,
  weekDays,
}: {
  dateKey: string;
  question: BoardQuestion;
  term: BoardTerm;
  dayCase: DailyCase;
  alreadyComplete: boolean;
  targetSeconds: number;
  nexusOptIn: boolean;
  currentStreak: number;
  longestStreak: number;
  /** Oldest first (7 entries, ending today) — see app/(app)/boards/page.tsx. */
  weekDays: { dateKey: string; completed: boolean }[];
}) {
  // ?tab=breakdown deep-links here from outside the page (e.g. the specialty tracks' Board
  // Connections tab) straight into NPTE Breakdown instead of always landing on Daily
  // Sharpening — read once at mount, same as any other client-only initial-state read.
  const requestedTab = useSearchParams().get("tab");
  const [activeTab, setActiveTab] = useState<BoardsTab>(
    TABS.some((t) => t.id === requestedTab) ? (requestedTab as BoardsTab) : "sharpening"
  );
  const weekDots = buildWeekDots(dateKey, weekDays);

  return (
    <>
      <div className="boards-tabs" role="tablist" aria-label="Limbic Boards sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className={activeTab === t.id ? "boards-tab active" : "boards-tab"}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "sharpening" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DailySharpeningSession
            dateKey={dateKey}
            question={question}
            term={term}
            dayCase={dayCase}
            alreadyComplete={alreadyComplete}
            targetSeconds={targetSeconds}
            nexusOptIn={nexusOptIn}
          />

          <div className="card elev-sm">
            <div className="boards-streak-header">
              <div className="card-kicker">Your Streak</div>
              <div className="boards-streak-best">Best: {longestStreak} day{longestStreak === 1 ? "" : "s"}</div>
            </div>
            <div className="boards-streak-days">
              {weekDots.map((d) => (
                <div className="boards-streak-day" key={d.dateKey}>
                  <span
                    className={
                      d.completed
                        ? "boards-streak-day-dot boards-streak-day-dot--completed"
                        : d.isToday
                          ? "boards-streak-day-dot boards-streak-day-dot--today"
                          : "boards-streak-day-dot"
                    }
                  >
                    {d.isToday && d.completed && <span className="boards-streak-day-check">✓</span>}
                  </span>
                  <span className="boards-streak-day-label">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="boards-streak-stats">
              <div className="boards-streak-stat">
                <div className="boards-streak-stat-value">{currentStreak}</div>
                <div className="boards-streak-stat-label">Current Streak</div>
              </div>
              <div className="boards-streak-stat">
                <div className="boards-streak-stat-value">{longestStreak}</div>
                <div className="boards-streak-stat-label">Longest Streak</div>
              </div>
            </div>
            <p className={`boards-streak-message ${streakMessageClass(currentStreak)}`}>{streakMessage(currentStreak)}</p>
          </div>
        </div>
      )}

      {activeTab === "breakdown" && (
        <div>
          <div style={{ margin: "0 0 4px" }}>
            <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>NPTE Exam Breakdown</h2>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
              250 questions. 5 content systems. 6 hours. Here&rsquo;s exactly how the NPTE is structured, how each system
              is weighted, and what to focus on to pass on your first attempt.
            </p>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 14 }}>
            <div className="card-kicker">How the NPTE Is Structured</div>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, margin: "8px 0 0" }}>
              The NPTE is a computer-based exam administered by FSBPT. It contains approximately 250 questions, 200
              scored and 50 unscored pilot questions. You won&rsquo;t know which questions are pilot items, so treat
              every question as if it counts.
            </p>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, margin: "10px 0 0" }}>
              The exam is designed around 5 content systems that reflect the full scope of physical therapy practice.
              Each system tests your ability to apply clinical reasoning, not just recall facts. Questions are
              scenario-based, presenting patient cases where you must choose the best course of action.
            </p>
          </div>

          <div className="npte-systems-grid">
            {NPTE_SYSTEMS.map((s) => (
              <div className="card elev-sm" key={s.name}>
                <div className="npte-system-name">{s.name}</div>
                <div className="npte-system-weight" style={{ color: s.color }}>
                  ~{s.weight}%
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${s.weight}%`, background: s.color }} />
                </div>
                <p className="npte-system-desc">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-metrics-row" style={{ marginBottom: 14 }}>
            <div className="dashboard-metric-tile">
              <div className="card-kicker">Total Questions</div>
              <div className="dashboard-metric-value">~250</div>
            </div>
            <div className="dashboard-metric-tile">
              <div className="card-kicker">Time Per Question</div>
              <div className="dashboard-metric-value">~1.4 min</div>
            </div>
            <div className="dashboard-metric-tile">
              <div className="card-kicker">Pass Score</div>
              <div className="dashboard-metric-value">600 scaled</div>
            </div>
          </div>

          <div className="npte-warning-card">
            <div>
              <div className="npte-warning-card-title">What NOT to Study</div>
              <p>
                The NPTE does not test billing codes, specific insurance protocols, or state-specific practice acts.
                Focus exclusively on the FSBPT content outline to avoid wasted study hours on low-yield material.
              </p>
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 14 }}>
            <div className="card-title">All Questions Are Scenario-Based</div>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, margin: "8px 0 0" }}>
              There are no definition questions on the NPTE. Every question presents a patient case and requires you
              to select the best intervention, diagnosis, or outcome measure. You must think like a clinician, not
              recall like a student.
            </p>
            <ul className="npte-bullet-list">
              <li>Evaluation and re-evaluation across all 5 systems</li>
              <li>Intervention selection based on evidence and patient presentation</li>
              <li>Outcome measure selection and progression criteria</li>
            </ul>
          </div>

          <div className="npte-accordion-list">
            {NPTE_DEEP_DIVES.map((d) => (
              <details className="npte-accordion" key={d.title}>
                <summary>{d.title}</summary>
                <p>{d.body}</p>
              </details>
            ))}
          </div>

          <div className="card elev-sm" style={{ marginBottom: 14 }}>
            <div className="card-title">Scoring</div>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, margin: "8px 0 0" }}>
              The NPTE uses item response theory (IRT), not a simple percentage. A scaled score of 600 or higher is
              required to pass, which generally corresponds to answering approximately 60-65% of scored questions
              correctly. Score scale runs from 200 to 800. Results released to your state board within 2-4 weeks. A
              diagnostic report is available if you do not pass.
            </p>
            <div className="npte-stat-lines">
              <div className="npte-stat-line">
                <strong>200</strong> scored questions
              </div>
              <div className="npte-stat-line">
                <strong>50</strong> unscored pilot questions
              </div>
              <div className="npte-stat-line">
                Pass score: <strong>600 scaled</strong>
              </div>
              <div className="npte-stat-line">
                Score scale: <strong>200-800</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "research" && (
        <div>
          <div style={{ margin: "0 0 4px" }}>
            <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>Research & Statistics Literacy</h2>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
              How to break down a research article and interpret the statistics inside it — the Non-Systems section
              of the NPTE covers evidence-based practice, and it&rsquo;s the same skill you&rsquo;ll use reading real
              studies once you&rsquo;re practicing.
            </p>
          </div>

          <div className="card elev-sm">
            <div className="card-title">The Full Guide</div>
            <p className="boards-resource-disclaimer" style={{ margin: "4px 0 12px" }}>
              How to break down a research article section by section, how to read the statistics inside it, a
              generalizability checker, and an article histogram explorer — all in one place.
            </p>
            <Link href="/pro/research-literacy" className="btn btn-primary">
              Open the guide →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card elev-sm">
            <div className="card-title">How to Use Limbic Boards</div>
            <div className="boards-strategy-list" style={{ marginTop: 12 }}>
              {STRATEGY_STEPS.map((step, i) => (
                <div className="boards-strategy-item" key={i}>
                  <div className="boards-strategy-number">{i + 1}</div>
                  <p className="boards-strategy-body">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card elev-sm" style={{ background: "var(--color-neutral-100)", border: "1px solid var(--color-neutral-200)" }}>
            <div className="card-title">More Resources Coming</div>
            <div className="boards-comingsoon-list">
              {COMING_SOON_ITEMS.map((item) => (
                <div className="boards-comingsoon-item" key={item}>
                  <span>{item}</span>
                  <span className="boards-badge-soon">Coming soon</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
