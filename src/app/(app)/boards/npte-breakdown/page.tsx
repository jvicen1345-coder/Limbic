import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { ArrowLeftIcon } from "@/components/icons";

const SYSTEMS = [
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

const DEEP_DIVES = [
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

/** A static NPTE reference page under Limbic Boards — pure content, no DB reads beyond the
 *  same student-access gate /boards itself uses for its full (non-clinician) view, since
 *  exam-structure prep is only relevant to someone still sitting for the NPTE. */
export default async function NpteBreakdownPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/boards");

  return (
    <div className="screen-pad boards-question-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Link
        href="/boards"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-neutral-700)", textDecoration: "none", marginBottom: 10 }}
      >
        <ArrowLeftIcon size={14} /> Back to Boards
      </Link>

      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>NPTE Exam Breakdown</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        250 questions. 5 content systems. 6 hours. Here&rsquo;s exactly how the NPTE is structured, how each system is
        weighted, and what to focus on to pass on your first attempt.
      </p>

      {/* Section 1 — How the NPTE Is Structured */}
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

      {/* Section 2 — The 5 Content Systems */}
      <div className="npte-systems-grid">
        {SYSTEMS.map((s) => (
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

      {/* Section 3 — Stat cards */}
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

      {/* Section 4 — What NOT to Study */}
      <div className="npte-warning-card">
        <div>
          <div className="npte-warning-card-title">What NOT to Study</div>
          <p>
            The NPTE does not test billing codes, specific insurance protocols, or state-specific practice acts.
            Focus exclusively on the FSBPT content outline to avoid wasted study hours on low-yield material.
          </p>
        </div>
      </div>

      {/* Section 5 — Question Types */}
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

      {/* Section 6 — System Deep Dives */}
      <div className="npte-accordion-list">
        {DEEP_DIVES.map((d) => (
          <details className="npte-accordion" key={d.title}>
            <summary>{d.title}</summary>
            <p>{d.body}</p>
          </details>
        ))}
      </div>

      {/* Section 7 — Scoring */}
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
