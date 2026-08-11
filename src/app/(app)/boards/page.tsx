import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess, hasLicenseAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GraduationCapIcon, ZapIcon } from "@/components/icons";
import { BoardQuestionCard } from "@/components/BoardQuestionCard";
import { DailySharpeningSession } from "@/components/DailySharpeningSession";
import { questionForDate, termForDate, todayDateKey, NPTE_THREE_QUESTION_BENCHMARK_SECONDS } from "@/lib/board-content";
import { dayIndexForDateKey, caseForDayIndex } from "@/lib/cases-static";

const NPTE_SYSTEMS = [
  {
    name: "Musculoskeletal",
    weight: 24,
    color: "var(--color-accent)",
    description: "Bones, joints, muscles, and connective tissue — the highest-weighted system.",
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
    body: "Covers cardiovascular and pulmonary conditions, lab values, vital sign interpretation, aerobic exercise prescription, and ICU-level interventions. Cardiopulmonary is frequently underestimated — don't let it cost you.",
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

/** Limbic Boards — the hub and the daily practice combined onto one page (previously split
 *  across this page, which only linked out, and /boards/sharpening, which held the actual
 *  question/term/case; that old URL now redirects here, see app/(app)/boards/sharpening/
 *  page.tsx). The NPTE Exam Breakdown used to be a separate page linked from here
 *  (/boards/npte-breakdown) — its content now lives directly on this page instead, so
 *  NPTE_SYSTEMS/NPTE_DEEP_DIVES above are this page's own copy rather than a shared export.
 *  A licensed PT/clinician account only ever gets today's question — not the rest of Limbic
 *  Boards, which stays a student-only product. */
export default async function BoardsHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isStudent = hasStudentAccess(user);
  const isClinician = hasLicenseAccess(user);
  if (!isStudent && !isClinician) redirect("/pro");

  const dateKey = todayDateKey();
  const question = questionForDate(dateKey);
  const questionCompletion = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "boardQuestion", dateKey } },
  });

  if (!isStudent) {
    return (
      <div className="screen-pad boards-question-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Question of the Day</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          A board-style question for clinicians to keep sharp on — the rest of Limbic Boards is a student product.
        </p>
        <BoardQuestionCard
          dateKey={dateKey}
          question={question}
          initialSelectedIndex={questionCompletion?.selectedIndex ?? null}
          initialElapsedSeconds={questionCompletion?.elapsedSeconds ?? null}
          nexusOptIn={user.nexusOptIn}
        />
      </div>
    );
  }

  const term = termForDate(dateKey);
  const dayCase = caseForDayIndex(dayIndexForDateKey(dateKey));

  const [termCompletion, caseCompletion] = await Promise.all([
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "boardTerm", dateKey } } }),
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } } }),
  ]);

  return (
    <div className="screen-pad boards-question-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
          <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
        </div>
        <div className="boards-header-streak">
          <ZapIcon size={14} />
          {user.boardsStreakDays > 0 ? `${user.boardsStreakDays} day${user.boardsStreakDays === 1 ? "" : "s"} streak` : "No streak yet"}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Your NPTE prep hub — a board-style question and a term to lock in every day, building toward exam day.
      </p>

      <DailySharpeningSession
        dateKey={dateKey}
        question={question}
        term={term}
        dayCase={dayCase}
        alreadyComplete={questionCompletion?.selectedIndex != null && termCompletion != null && caseCompletion?.selectedIndex != null}
        targetSeconds={user.boardsSharpeningTargetSeconds ?? NPTE_THREE_QUESTION_BENCHMARK_SECONDS}
        nexusOptIn={user.nexusOptIn}
      />

      {/* NPTE Exam Breakdown — formerly its own page (/boards/npte-breakdown), now inlined
          directly below the Daily Dose card instead of linked out to. */}
      <div style={{ margin: "28px 0 4px" }}>
        <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>NPTE Exam Breakdown</h2>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
          250 questions. 5 content systems. 6 hours. Here&rsquo;s exactly how the NPTE is structured, how each system is
          weighted, and what to focus on to pass on your first attempt.
        </p>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 14 }}>
        <div className="card-kicker">How the NPTE Is Structured</div>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, margin: "8px 0 0" }}>
          The NPTE is a computer-based exam administered by FSBPT. It contains approximately 250 questions — 200
          scored and 50 unscored pilot questions. You won&rsquo;t know which questions are pilot items, so treat every
          question as if it counts.
        </p>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, margin: "10px 0 0" }}>
          The exam is designed around 5 content systems that reflect the full scope of physical therapy practice.
          Each system tests your ability to apply clinical reasoning — not just recall facts. Questions are
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
          There are no definition questions on the NPTE. Every question presents a patient case and requires you to
          select the best intervention, diagnosis, or outcome measure. You must think like a clinician — not recall
          like a student.
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
          The NPTE uses item response theory (IRT) — not a simple percentage. A scaled score of 600 or higher is
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
  );
}
