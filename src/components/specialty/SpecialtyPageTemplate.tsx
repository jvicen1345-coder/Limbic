"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import { ChevronRightIcon } from "@/components/icons";
import type { ClinicalPearl, NpteConnection, OutcomeMeasureRow, SpecialTestRow, SpecialtyCondition, Sport } from "@/lib/specialty-content";
import type { BoardQuestion } from "@/lib/board-content";
import { SpecialtyBoardConnections } from "@/components/specialty/SpecialtyBoardConnections";

type TabId = "overview" | "conditions" | "tools" | "boards" | "bysport";

const BASE_TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Key Conditions" },
  { id: "tools", label: "Clinical Tools" },
  { id: "boards", label: "Board Connections" },
];

export interface SpecialtyPageTemplateProps {
  /** Drives the --specialty-accent-{slug} CSS modifier class, see globals.css. */
  slug: string;
  name: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  whatPTsDo: string;
  whereTheyWork: string;
  patientPopulation: string;
  rotationTip: string;
  highYieldFocusAreas: string;
  clinicalPearls: ClinicalPearl[];
  conditions: SpecialtyCondition[];
  specialTests: SpecialTestRow[];
  outcomeMeasuresTable: OutcomeMeasureRow[];
  documentationPearls: string[];
  boardQuestionTypes: string;
  npte: NpteConnection;
  /** Real questions tagged for this specialty (see questionsForSpecialty in
   *  lib/board-content.ts) — rendered in the Board Connections tab below. */
  specialtyQuestions: BoardQuestion[];
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
  whatPTsDo,
  whereTheyWork,
  patientPopulation,
  rotationTip,
  highYieldFocusAreas,
  clinicalPearls,
  conditions,
  specialTests,
  outcomeMeasuresTable,
  documentationPearls,
  boardQuestionTypes,
  npte,
  specialtyQuestions,
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
              <span className="card-title">About This Specialty</span>
              <div className="specialty-overview-item" style={{ marginTop: 10 }}>
                <div className="specialty-overview-item-label">What PTs Do</div>
                <p className="specialty-overview-item-text">{whatPTsDo}</p>
              </div>
              <div className="specialty-overview-item">
                <div className="specialty-overview-item-label">Where They Work</div>
                <p className="specialty-overview-item-text">{whereTheyWork}</p>
              </div>
              <div className="specialty-overview-item">
                <div className="specialty-overview-item-label">Patient Population</div>
                <p className="specialty-overview-item-text">{patientPopulation}</p>
              </div>
              <div className="specialty-overview-item">
                <div className="specialty-overview-item-label">Rotation Tip</div>
                <p className="specialty-overview-item-text">{rotationTip}</p>
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
                <div className="specialty-overview-item-label">High Yield Focus Areas</div>
                <p className="specialty-overview-item-text">{highYieldFocusAreas}</p>
              </div>
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <span className="card-title">High Yield Clinical Pearls</span>
            <div className="specialty-pearl-list">
              {clinicalPearls.map((pearl) => (
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
          {conditions.map((condition) => {
            const sections: { label: string; paragraphs?: string[] }[] = [
              { label: "Clinical Presentation", paragraphs: condition.clinicalPresentation },
              { label: "Evaluation", paragraphs: condition.evaluation },
              { label: "Intervention", paragraphs: condition.intervention },
              { label: "Outcome Measures", paragraphs: condition.outcomeMeasures },
            ];
            return (
              <div className="card elev-sm specialty-condition-card" key={condition.name}>
                <div className="specialty-condition-card-head">
                  <span className="card-title">{condition.name}</span>
                  <span className="tag tag-neutral">{condition.category}</span>
                </div>
                <div className="specialty-accordion-list">
                  {sections.map((section) => (
                    <details className="specialty-accordion" key={section.label}>
                      <summary>{section.label}</summary>
                      {section.paragraphs && section.paragraphs.length > 0 ? (
                        section.paragraphs.map((p) => <p key={p}>{p}</p>)
                      ) : (
                        <p>Content coming soon</p>
                      )}
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "tools" && (
        <>
          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <span className="card-title">Common Special Tests</span>
            <div className="specialty-table-wrap">
              <table className="specialty-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>What It Assesses</th>
                  </tr>
                </thead>
                <tbody>
                  {specialTests.map((row) => (
                    <tr key={row.test}>
                      <td>{row.test}</td>
                      <td>{row.assesses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 16 }}>
            <span className="card-title">Outcome Measures</span>
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
                  {outcomeMeasuresTable.map((row) => (
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
            <span className="card-title">Documentation Pearls</span>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {documentationPearls.map((pearl) => (
                <p className="specialty-overview-item-text" key={pearl}>
                  {pearl}
                </p>
              ))}
            </div>
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
              <p className="specialty-overview-item-text">{boardQuestionTypes}</p>
            </div>
            <Link href="/boards?tab=breakdown" className="specialty-explore-btn" style={{ marginTop: 4 }}>
              View NPTE Breakdown
              <ChevronRightIcon size={14} />
            </Link>
          </div>

          <div className="card elev-sm">
            <span className="card-title">Board-Level Questions for This Specialty</span>
            <div style={{ marginTop: 10 }}>
              <SpecialtyBoardConnections specialty={slug} questions={specialtyQuestions} />
            </div>
            <p className="specialty-table-note">Complete your Daily Sharpening for a new board question every day</p>
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
