"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import { ChevronRightIcon } from "@/components/icons";
import type { NpteConnection, SpecialtyCondition, Sport } from "@/lib/specialty-content";

type TabId = "overview" | "conditions" | "tools" | "boards" | "bysport";

const BASE_TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Key Conditions" },
  { id: "tools", label: "Clinical Tools" },
  { id: "boards", label: "Board Connections" },
];

/** Generic, specialty-agnostic placeholders — the same five slots render for every
 *  specialty until real content is written in per the TODO below (see the closing
 *  TODO summary produced at the end of this feature's build for every file/line that
 *  needs specialty-specific copy dropped in). */
const PLACEHOLDER_PEARLS = [1, 2, 3, 4, 5].map((n) => ({
  title: `Placeholder clinical pearl #${n}`,
  body: "A one-line, high-yield clinical insight goes here, followed by a brief explanation of why it matters in practice.",
}));

const PLACEHOLDER_SPECIAL_TESTS = [1, 2, 3, 4, 5].map((n) => ({
  test: `Special test placeholder #${n}`,
  assesses: "What this test assesses goes here.",
}));

const PLACEHOLDER_OUTCOME_MEASURES = [1, 2, 3, 4, 5].map((n) => ({
  measure: `Outcome measure placeholder #${n}`,
  assesses: "What this measure assesses goes here.",
  population: "Population",
}));

const PLACEHOLDER_QUESTIONS = [1, 2, 3];
const PLACEHOLDER_OPTIONS = ["Answer option A", "Answer option B", "Answer option C", "Answer option D"];

export interface SpecialtyPageTemplateProps {
  /** Drives the --specialty-accent-{slug} CSS modifier class, see globals.css. */
  slug: string;
  name: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  conditions: SpecialtyCondition[];
  npte: NpteConnection;
  /** Geriatrics only — bridges the student section into The Connexion Method. */
  showConnexionCard?: boolean;
  /** Presence adds the 5th "By Sport" tab — the Sports hub page only. */
  sports?: Sport[];
}

export function SpecialtyPageTemplate({
  slug,
  name,
  description,
  breadcrumb,
  conditions,
  npte,
  showConnexionCard = false,
  sports,
}: SpecialtyPageTemplateProps) {
  const tabs = sports ? [...BASE_TABS, { id: "bysport" as TabId, label: "By Sport" }] : BASE_TABS;
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const accentClass = `specialty-accent-${slug}`;

  return (
    <div className={`screen-pad atrium-page ${accentClass}`} style={{ maxWidth: 960 }}>
      <Breadcrumb items={breadcrumb} />

      <div className="specialty-header">
        <h1 className="specialty-header-title">{name}</h1>
        <p className="specialty-header-desc">{description}</p>
      </div>

      <div className="boards-tabs" role="tablist" aria-label={`${name} sections`}>
        {tabs.map((t) => (
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

      {activeTab === "overview" && (
        <>
          <div className="specialty-overview-grid">
            <div className="card elev-sm">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="card-title">About This Specialty</span>
                <span className="boards-badge-soon">Coming soon</span>
              </div>
              <div className="specialty-overview-item" style={{ marginTop: 10 }}>
                <div className="specialty-overview-item-label">What PTs Do</div>
                {/* TODO: Describe what physical therapists actually do day-to-day in this specialty. */}
                <p className="specialty-overview-item-text">
                  A description of the clinical work physical therapists do within {name} goes here.
                </p>
              </div>
              <div className="specialty-overview-item">
                <div className="specialty-overview-item-label">Where They Work</div>
                {/* TODO: List realistic practice settings for this specialty (outpatient, inpatient, home health, etc.). */}
                <p className="specialty-overview-item-text">Example practice settings for {name} go here.</p>
              </div>
              <div className="specialty-overview-item">
                <div className="specialty-overview-item-label">Patient Population</div>
                {/* TODO: Describe the typical patient population seen in this specialty. */}
                <p className="specialty-overview-item-text">A description of the typical patient population goes here.</p>
              </div>
            </div>

            <div className="card elev-sm">
              <span className="card-title">Why It Matters for Boards</span>
              <div className="specialty-overview-item" style={{ marginTop: 10 }}>
                <div className="specialty-overview-item-label">NPTE System Connection</div>
                <p className="specialty-overview-item-text">
                  {npte.system}, approximately {npte.weight} of the exam.
                  {npte.note ? ` ${npte.note}` : ""}
                </p>
              </div>
              <div className="specialty-overview-item">
                <div className="specialty-overview-item-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  High Yield Focus Areas
                  <span className="boards-badge-soon">Coming soon</span>
                </div>
                {/* TODO: List the specific high-yield topics within this specialty for NPTE prep. */}
                <p className="specialty-overview-item-text">High-yield focus areas for {name} go here.</p>
              </div>
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="card-title">High Yield Clinical Pearls</span>
              <span className="boards-badge-soon">Coming soon</span>
            </div>
            {/* TODO: Add specialty-specific clinical pearls */}
            <div className="specialty-pearl-list">
              {PLACEHOLDER_PEARLS.map((pearl) => (
                <div className="specialty-pearl-item" key={pearl.title}>
                  <strong>{pearl.title}</strong>
                  <p>{pearl.body}</p>
                </div>
              ))}
            </div>
          </div>

          {showConnexionCard && (
            <div className="specialty-connexion-card">
              <h3>The Connexion Method</h3>
              <p>
                The Connexion Method is a standardized clinical system for senior home safety and mobility optimization,
                developed by Delia Vicencio, PT, DPT with 30 years of home health experience. It is available inside Limbic
                as a complete clinical resource.
              </p>
              <Link href="/connexion" className="specialty-explore-btn">
                Explore The Connexion Method
                <ChevronRightIcon size={14} />
              </Link>
            </div>
          )}
        </>
      )}

      {activeTab === "conditions" && (
        <div className="specialty-conditions-grid">
          {conditions.map((condition) => (
            <div className="card elev-sm specialty-condition-card" key={condition.name}>
              <div className="specialty-condition-card-head">
                <span className="card-title">{condition.name}</span>
                <span className="tag tag-neutral">{condition.category}</span>
              </div>
              {/* TODO: Fill in Clinical Presentation, Evaluation, Intervention, and Outcome Measures content for this condition. */}
              <div className="specialty-accordion-list">
                {["Clinical Presentation", "Evaluation", "Intervention", "Outcome Measures"].map((section) => (
                  <details className="specialty-accordion" key={section}>
                    <summary>{section}</summary>
                    <p>Content coming soon</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "tools" && (
        <>
          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="card-title">Common Special Tests</span>
              <span className="boards-badge-soon">Coming soon</span>
            </div>
            {/* TODO: Add the real special tests for this specialty, with sensitivity/specificity values. */}
            <div className="specialty-table-wrap">
              <table className="specialty-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>What It Assesses</th>
                  </tr>
                </thead>
                <tbody>
                  {PLACEHOLDER_SPECIAL_TESTS.map((row) => (
                    <tr key={row.test}>
                      <td>{row.test}</td>
                      <td>{row.assesses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="specialty-table-note">Sensitivity and specificity values coming soon</p>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="card-title">Outcome Measures</span>
              <span className="boards-badge-soon">Coming soon</span>
            </div>
            {/* TODO: Add the real outcome measures for this specialty. */}
            <div className="specialty-table-wrap">
              <table className="specialty-table">
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>What It Assesses</th>
                    <th>Population</th>
                  </tr>
                </thead>
                <tbody>
                  {PLACEHOLDER_OUTCOME_MEASURES.map((row) => (
                    <tr key={row.measure}>
                      <td>{row.measure}</td>
                      <td>{row.assesses}</td>
                      <td>{row.population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card elev-sm">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="card-title">Documentation Pearls</span>
              <span className="boards-badge-soon">Coming soon</span>
            </div>
            {/* TODO: Add specialty-specific documentation templates. */}
            <p className="specialty-overview-item-text" style={{ marginTop: 10 }}>
              Specialty-specific documentation templates coming soon
            </p>
          </div>
        </>
      )}

      {activeTab === "boards" && (
        <>
          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <span className="card-title">NPTE Connection</span>
            <div className="specialty-overview-item" style={{ marginTop: 10 }}>
              <div className="specialty-overview-item-label">Content System</div>
              <p className="specialty-overview-item-text">{npte.system}</p>
            </div>
            <div className="specialty-overview-item">
              <div className="specialty-overview-item-label">Approximate Exam Weight</div>
              <p className="specialty-overview-item-text">{npte.weight} of the NPTE</p>
            </div>
            <div className="specialty-overview-item">
              <div className="specialty-overview-item-label">What Question Types to Expect</div>
              {/* TODO: Describe the typical NPTE question formats/scenarios for this specialty. */}
              <p className="specialty-overview-item-text">Typical NPTE question types for {name} go here.</p>
            </div>
            <Link href="/boards?tab=breakdown" className="specialty-explore-btn" style={{ marginTop: 4 }}>
              View NPTE Breakdown
              <ChevronRightIcon size={14} />
            </Link>
          </div>

          <div className="card elev-sm">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="card-title">Board-Level Questions for This Specialty</span>
              <span className="boards-badge-soon">Coming soon</span>
            </div>
            {/* TODO: Wire to BoardsQuestion model filtered by specialty tag */}
            <div style={{ marginTop: 10 }}>
              {PLACEHOLDER_QUESTIONS.map((n) => (
                <div className="specialty-question-card" key={n}>
                  <p className="specialty-question-text">Board question coming soon</p>
                  <div className="specialty-question-options">
                    {PLACEHOLDER_OPTIONS.map((opt) => (
                      <div className="specialty-question-option" key={opt}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="specialty-table-note">Complete your Daily Sharpening for real board questions</p>
          </div>
        </>
      )}

      {activeTab === "bysport" && sports && (
        <div className="specialty-sport-grid">
          {sports.map((sport) => (
            <div className="card elev-sm specialty-sport-card" key={sport.slug}>
              <span className="card-title">{sport.name}</span>
              <ul className="specialty-sport-injuries">
                {sport.injuries.map((injury) => (
                  <li key={injury}>{injury}</li>
                ))}
              </ul>
              <p className="specialty-sport-focus">{sport.focus}</p>
              <Link href={`/student/specialties/sports/${sport.slug}`} className="specialty-explore-btn">
                Explore
                <ChevronRightIcon size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
