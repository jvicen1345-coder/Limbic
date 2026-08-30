"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DailySharpeningSession, type SavedSharpeningProgress } from "@/components/DailySharpeningSession";
import { PaperAnatomyDiagram } from "@/components/boards/PaperAnatomyDiagram";
import { StatisticsCardGrid } from "@/components/boards/StatisticsCardGrid";
import { EvidenceHierarchyPyramid } from "@/components/boards/EvidenceHierarchyPyramid";
import { MissedQuestionsReview } from "@/components/boards/MissedQuestionsReview";
import { NPTE_DOMAIN_WEIGHTS, domainSlug, type BoardQuestion, type BoardTerm, type NpteDomain } from "@/lib/board-content";
import type { BoardsProgress } from "@/lib/boards-progress";
import type { DailyCase } from "@/lib/cases-static";

/** The 5 scored systems, as the FSBPT content outline names them. `domain` ties each one
 *  to its lib/board-content.ts NPTE_DOMAINS identity — the two lists are the same five
 *  things under different names ("Other Body Systems" is what our bank tags
 *  "Integumentary"), and keeping the link explicit is what lets each card below carry this
 *  reader's own accuracy and link into that domain's practice set. Weights come from
 *  NPTE_DOMAIN_WEIGHTS rather than being repeated here, so the figures this tab teaches and
 *  the figures the daily pick is weighted by can't drift apart. */
const NPTE_SYSTEMS: { name: string; domain: NpteDomain; color: string; description: string }[] = [
  {
    name: "Musculoskeletal",
    domain: "Musculoskeletal",
    color: "var(--color-accent)",
    description: "Bones, joints, muscles, and connective tissue, the highest-weighted system.",
  },
  {
    name: "Neuromuscular and Nervous System",
    domain: "Neuromuscular",
    color: "var(--color-vitals-mindfulness)",
    description: "Neurological conditions, functional mobility, and gait.",
  },
  {
    name: "Cardiopulmonary",
    domain: "Cardiopulmonary",
    color: "var(--color-danger)",
    description: "Cardiovascular and pulmonary conditions, vitals, and aerobic exercise.",
  },
  {
    name: "Other Body Systems",
    domain: "Integumentary",
    color: "var(--color-success)",
    description: "Integumentary, metabolic, GI/GU, and multi-system comorbidities.",
  },
  {
    name: "Non-Systems",
    domain: "Nonsystem / Safety",
    color: "var(--color-warn)",
    description: "Equipment, safety, professional standards, and evidence-based practice.",
  },
];

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
  "Work the Review list on the Daily Sharpening tab — a question stays there until you answer it right again.",
  "Use the NPTE Breakdown tab to find your weakest system, then practice it from that system's card.",
  "Watch the timer, not just the score; it pauses while you read, so it measures answering pace.",
] as const;

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
  /** A day later this week, which hasn't happened yet. Rendered differently from a day that
   *  was available and went unused — the two used to look identical, so an untouched Friday
   *  read as a missed Friday on a Tuesday. */
  isFuture: boolean;
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
      isFuture: dk > todayKey,
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

/** The four tab panels below the always-visible Limbic Boards header (title, streak badge
 *  and NPTE countdown, rendered by app/(app)/boards/page.tsx above this component). The
 *  active panel lives in ?tab= rather than in component state: switching pushes a history
 *  entry on the same route, so the header above never remounts (unlike the Link-driven
 *  .sub-tabs pattern in components/SubTabs.tsx, which these aren't — the four panels are
 *  one page's content, not separate destinations) while a panel stays linkable, shareable
 *  and reachable with the back button. Deep links in (e.g. from the specialty tracks'
 *  Board Connections tab) read the same parameter they now write. */
export function BoardsTabs({
  dateKey,
  question,
  term,
  dayCase,
  alreadyComplete,
  saved,
  targetSeconds,
  nexusOptIn,
  currentStreak,
  longestStreak,
  weekDays,
  progress,
  examDays,
  hasExamDate,
}: {
  dateKey: string;
  question: BoardQuestion;
  term: BoardTerm;
  dayCase: DailyCase;
  alreadyComplete: boolean;
  saved: SavedSharpeningProgress;
  targetSeconds: number;
  nexusOptIn: boolean;
  currentStreak: number;
  longestStreak: number;
  /** Oldest first (7 entries, ending today) — see app/(app)/boards/page.tsx. */
  weekDays: { dateKey: string; completed: boolean }[];
  progress: BoardsProgress;
  /** Days until this reader's NPTE, or null if they haven't set a date. */
  examDays: number | null;
  hasExamDate: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: BoardsTab = TABS.some((t) => t.id === requestedTab) ? (requestedTab as BoardsTab) : "sharpening";

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectTab = useCallback(
    (id: BoardsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === "sharpening") params.delete("tab");
      else params.set("tab", id);
      const query = params.toString();
      // scroll:false keeps the page where it is — switching a tab shouldn't jump the reader
      // back to the top of a page whose header is the point of staying put.
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  /** Roving-focus keyboard support, which the tablist role promises and this list didn't
   *  have: arrows move between tabs (wrapping), Home/End jump to the ends. Only the active
   *  tab is in the page's tab order, so Tab moves past the whole list to its panel. */
  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const deltas: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (event.key in deltas) next = (index + deltas[event.key] + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    selectTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  const weekDots = buildWeekDots(dateKey, weekDays);
  const accuracyByDomain = new Map(progress.domains.map((d) => [d.domain, d]));
  const overallAccuracy = progress.answeredCount > 0 ? Math.round((progress.correctCount / progress.answeredCount) * 100) : null;

  /** Domains this reader is weakest in — used to point the breakdown tab at something
   *  specific instead of leaving five equal-looking cards. Needs a couple of answers before
   *  it means anything, so a domain with fewer than 3 attempts never gets flagged. */
  const weakest = progress.domains
    .filter((d) => d.total >= 3)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)[0];

  function panelProps(id: BoardsTab) {
    return { role: "tabpanel", id: `boards-panel-${id}`, "aria-labelledby": `boards-tab-${id}`, tabIndex: 0 } as const;
  }

  return (
    <>
      <div className="boards-tabs" role="tablist" aria-label="Limbic Boards sections">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`boards-tab-${t.id}`}
            aria-selected={activeTab === t.id}
            aria-controls={`boards-panel-${t.id}`}
            tabIndex={activeTab === t.id ? 0 : -1}
            className={activeTab === t.id ? "boards-tab active" : "boards-tab"}
            onClick={() => selectTab(t.id)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "sharpening" && (
        <div {...panelProps("sharpening")} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DailySharpeningSession
            dateKey={dateKey}
            question={question}
            term={term}
            dayCase={dayCase}
            alreadyComplete={alreadyComplete}
            saved={saved}
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
                      "boards-streak-day-dot" +
                      (d.completed ? " boards-streak-day-dot--completed" : "") +
                      (d.isToday && !d.completed ? " boards-streak-day-dot--today" : "") +
                      (d.isFuture ? " boards-streak-day-dot--future" : "")
                    }
                  >
                    {d.completed && <span className="boards-streak-day-check">✓</span>}
                  </span>
                  <span className={`boards-streak-day-label${d.isFuture ? " boards-streak-day-label--future" : ""}`}>{d.label}</span>
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
              <div className="boards-streak-stat">
                <div className="boards-streak-stat-value">{overallAccuracy === null ? "—" : `${overallAccuracy}%`}</div>
                <div className="boards-streak-stat-label">Accuracy</div>
              </div>
            </div>
            <p className={`boards-streak-message ${streakMessageClass(currentStreak)}`}>{streakMessage(currentStreak)}</p>
          </div>

          <MissedQuestionsReview missed={progress.missed} />
        </div>
      )}

      {activeTab === "breakdown" && (
        <div {...panelProps("breakdown")}>
          <div style={{ margin: "0 0 4px" }}>
            <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>NPTE Exam Breakdown</h2>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
              250 questions. 5 content systems. 6 hours. Here&rsquo;s exactly how the NPTE is structured, how each system
              is weighted, and what to focus on to pass on your first attempt.
            </p>
          </div>

          {weakest && (
            <div className="boards-weakest-card">
              <div className="card-kicker">Where you&rsquo;re losing points</div>
              <p className="boards-weakest-body">
                Your weakest system so far is <strong>{weakest.domain}</strong> — {weakest.correct} of {weakest.total} correct.
                It&rsquo;s worth ~{NPTE_DOMAIN_WEIGHTS[weakest.domain]}% of the exam.
              </p>
              <Link className="btn btn-primary boards-weakest-link" href={`/student/domains/${domainSlug(weakest.domain)}`}>
                Practice {weakest.domain} →
              </Link>
            </div>
          )}

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

          {/* Each system card is a link into that system's practice set (see
              app/(app)/student/domains/[slug]) carrying this reader's own record in it.
              These were five static cards describing domains the app could already drill
              and never offered to. */}
          <div className="npte-systems-grid">
            {NPTE_SYSTEMS.map((s) => {
              const stat = accuracyByDomain.get(s.domain);
              const weight = NPTE_DOMAIN_WEIGHTS[s.domain];
              return (
                <Link className="card elev-sm npte-system-card" key={s.name} href={`/student/domains/${domainSlug(s.domain)}`}>
                  <div className="npte-system-name">{s.name}</div>
                  <div className="npte-system-weight" style={{ color: s.color }}>
                    ~{weight}%
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${weight}%`, background: s.color }} />
                  </div>
                  <p className="npte-system-desc">{s.description}</p>
                  <div className="npte-system-record">
                    {stat && stat.total > 0 ? (
                      <>
                        <span className="npte-system-record-value">{Math.round((stat.correct / stat.total) * 100)}%</span>
                        <span className="npte-system-record-label">
                          {stat.correct}/{stat.total} correct · {stat.bankSize} in the bank
                        </span>
                      </>
                    ) : (
                      <span className="npte-system-record-label">Not practiced yet · {stat?.bankSize ?? 0} in the bank</span>
                    )}
                    <span className="npte-system-record-cta">Practice →</span>
                  </div>
                </Link>
              );
            })}
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
        <div {...panelProps("research")}>
          <div style={{ margin: "0 0 4px" }}>
            <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>Research & Statistics Literacy</h2>
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
              How to break down a research article and interpret the statistics inside it — the Non-Systems section
              of the NPTE covers evidence-based practice, and it&rsquo;s the same skill you&rsquo;ll use reading real
              studies once you&rsquo;re practicing.
            </p>
          </div>

          <h3 className="boards-research-section-title">How to Break Down a Research Article</h3>
          <PaperAnatomyDiagram />

          <h3 className="boards-research-section-title" style={{ marginTop: 32 }}>
            How to Read the Statistics
          </h3>
          <StatisticsCardGrid />

          <div style={{ marginTop: 32 }}>
            <EvidenceHierarchyPyramid />
          </div>

          <p className="boards-research-guide-link">
            Need the generalizability checker or the article histogram explorer? <Link href="/pro/research-literacy">Open the full guide →</Link>
          </p>
        </div>
      )}

      {activeTab === "resources" && (
        <div {...panelProps("resources")} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

          {/* Practice by system — the same five destinations the NPTE Breakdown cards link
              to, gathered here because "where do I drill a specific system" is a resources
              question and this tab is where a reader looks for it. */}
          <div className="card elev-sm">
            <div className="card-title">Practice by System</div>
            <p className="boards-resource-intro">
              Every question in the bank, grouped the way the exam scores them. Your record on each is on the NPTE
              Breakdown tab.
            </p>
            <div className="boards-domain-links">
              {NPTE_SYSTEMS.map((s) => {
                const stat = accuracyByDomain.get(s.domain);
                return (
                  <Link className="boards-domain-link" key={s.domain} href={`/student/domains/${domainSlug(s.domain)}`}>
                    <span className="boards-domain-link-dot" style={{ background: s.color }} />
                    <span className="boards-domain-link-name">{s.name}</span>
                    <span className="boards-domain-link-meta">
                      {stat && stat.total > 0 ? `${stat.seen} of ${stat.bankSize} practiced` : `${stat?.bankSize ?? 0} questions`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="card elev-sm">
            <div className="card-title">Plan Your Run-Up</div>
            {hasExamDate && examDays !== null && examDays >= 0 ? (
              <p className="boards-resource-intro">
                You have <strong>{examDays} day{examDays === 1 ? "" : "s"}</strong> until your NPTE. At one Daily Sharpening a
                day that&rsquo;s {examDays * 3} more questions, terms and cases between now and then — and{" "}
                {progress.missed.length > 0
                  ? `${progress.missed.length} question${progress.missed.length === 1 ? "" : "s"} already waiting on your Review list.`
                  : "a clean Review list to keep clean."}
              </p>
            ) : (
              <p className="boards-resource-intro">
                Add your NPTE date and Boards will count down to it and pace your run-up.{" "}
                <Link href="/profile/credentials#professional-dates">Set your exam date →</Link>
              </p>
            )}
          </div>

          <div className="card elev-sm">
            <div className="card-title">Official Sources</div>
            <p className="boards-resource-intro">
              Limbic Boards follows the FSBPT content outline. When a detail here and an official source disagree, the
              official source wins — check these directly for exam registration, eligibility, and score reporting.
            </p>
            <div className="boards-official-links">
              <a className="boards-official-link" href="https://www.fsbpt.org" target="_blank" rel="noopener noreferrer">
                <span className="boards-official-link-name">FSBPT</span>
                <span className="boards-official-link-desc">Exam administration, content outline, registration and scoring</span>
              </a>
              <a className="boards-official-link" href="https://www.apta.org" target="_blank" rel="noopener noreferrer">
                <span className="boards-official-link-name">APTA</span>
                <span className="boards-official-link-desc">Practice guidelines and professional standards</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
