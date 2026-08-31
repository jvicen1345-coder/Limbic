"use client";

import { useState } from "react";
import { matchesSearch, searchTerms } from "@/lib/reference-search";

interface TermRow {
  abbrev: string;
  meaning: string;
  context: string;
  tags: string[];
}

const CATEGORIES = ["All", "Orders & Frequency", "Mobility & Weight-Bearing", "Assessment", "Body Position", "Musculoskeletal", "Neuro", "Cardiopulm", "Documentation"] as const;

const ROWS: TermRow[] = [
  { abbrev: "PRN", meaning: "As needed", context: "Frequency of an order, e.g. an assistive device PRN", tags: ["Orders & Frequency"] },
  { abbrev: "BID", meaning: "Twice a day", context: "Dosing/session frequency", tags: ["Orders & Frequency"] },
  { abbrev: "TID", meaning: "Three times a day", context: "Dosing/session frequency", tags: ["Orders & Frequency"] },
  { abbrev: "QID", meaning: "Four times a day", context: "Dosing/session frequency", tags: ["Orders & Frequency"] },
  { abbrev: "QD / QOD", meaning: "Every day / every other day", context: "Order frequency", tags: ["Orders & Frequency"] },
  { abbrev: "STAT", meaning: "Immediately", context: "Urgent order", tags: ["Orders & Frequency"] },
  { abbrev: "NPO", meaning: "Nothing by mouth", context: "Pre-procedure or dysphagia precaution", tags: ["Orders & Frequency"] },
  { abbrev: "DC", meaning: "Discharge / discontinue", context: "Context-dependent — discharge from care or stop an order", tags: ["Orders & Frequency", "Documentation"] },

  { abbrev: "WBAT", meaning: "Weight bearing as tolerated", context: "No fixed limit — patient titrates load to pain/tolerance", tags: ["Mobility & Weight-Bearing"] },
  { abbrev: "NWB", meaning: "Non-weight bearing", context: "No load through the limb at all", tags: ["Mobility & Weight-Bearing"] },
  { abbrev: "PWB", meaning: "Partial weight bearing", context: "Usually a specified percentage or pound limit", tags: ["Mobility & Weight-Bearing"] },
  { abbrev: "TTWB", meaning: "Toe-touch weight bearing", context: "Foot contacts ground for balance only, essentially non-weight bearing", tags: ["Mobility & Weight-Bearing"] },
  { abbrev: "FWB", meaning: "Full weight bearing", context: "No restriction on load through the limb", tags: ["Mobility & Weight-Bearing"] },
  { abbrev: "WFL", meaning: "Within functional limits", context: "Common in ROM/strength documentation", tags: ["Mobility & Weight-Bearing", "Assessment"] },
  { abbrev: "AMB", meaning: "Ambulate / ambulation", context: "Walking, often paired with a device (e.g. AMB c FWW)", tags: ["Mobility & Weight-Bearing"] },
  { abbrev: "SBA", meaning: "Standby assist", context: "Level of assistance — therapist nearby but hands-off", tags: ["Mobility & Weight-Bearing", "Assessment"] },
  { abbrev: "CGA", meaning: "Contact guard assist", context: "Level of assistance — hands-on but not lifting", tags: ["Mobility & Weight-Bearing", "Assessment"] },
  { abbrev: "MIN A / MOD A / MAX A", meaning: "Minimal / moderate / maximal assist", context: "Percentage of work the patient performs (roughly 75/50/25%)", tags: ["Mobility & Weight-Bearing", "Assessment"] },
  { abbrev: "I", meaning: "Independent", context: "No physical or verbal assistance required", tags: ["Mobility & Weight-Bearing", "Assessment"] },

  { abbrev: "ROM", meaning: "Range of motion", context: "AROM = active, PROM = passive, AAROM = active-assisted", tags: ["Assessment", "Musculoskeletal"] },
  { abbrev: "MMT", meaning: "Manual muscle test", context: "Graded 0-5 strength scale", tags: ["Assessment", "Musculoskeletal"] },
  { abbrev: "WNL", meaning: "Within normal limits", context: "Used broadly for ROM, strength, sensation findings", tags: ["Assessment"] },
  { abbrev: "ADL / IADL", meaning: "Activities / instrumental activities of daily living", context: "Basic self-care vs. higher-level home/community tasks", tags: ["Assessment", "Documentation"] },
  { abbrev: "LOB", meaning: "Loss of balance", context: "Observed during a functional task", tags: ["Assessment"] },
  { abbrev: "c/o", meaning: "Complains of", context: "Subjective report, e.g. c/o pain 6/10", tags: ["Documentation"] },
  { abbrev: "NAD", meaning: "No acute distress", context: "General observation on presentation", tags: ["Assessment"] },
  { abbrev: "NKDA", meaning: "No known drug allergies", context: "Chart review/history", tags: ["Assessment"] },

  { abbrev: "B/L", meaning: "Bilateral", context: "Both sides", tags: ["Body Position"] },
  { abbrev: "R / L", meaning: "Right / left", context: "Side designation", tags: ["Body Position"] },
  { abbrev: "prox / dist", meaning: "Proximal / distal", context: "Closer to / farther from the trunk", tags: ["Body Position"] },
  { abbrev: "ant / post", meaning: "Anterior / posterior", context: "Front / back", tags: ["Body Position"] },
  { abbrev: "sup / inf", meaning: "Superior / inferior", context: "Above / below", tags: ["Body Position"] },
  { abbrev: "supine / prone", meaning: "Face-up / face-down", context: "Patient positioning", tags: ["Body Position"] },
  { abbrev: "sidelying", meaning: "Lying on one side", context: "Patient positioning, often abbreviated SL", tags: ["Body Position"] },
  { abbrev: "LE / UE", meaning: "Lower extremity / upper extremity", context: "Limb designation", tags: ["Body Position", "Musculoskeletal"] },

  { abbrev: "THA / TKA", meaning: "Total hip / total knee arthroplasty", context: "Joint replacement surgery", tags: ["Musculoskeletal"] },
  { abbrev: "ORIF", meaning: "Open reduction internal fixation", context: "Surgical fracture repair with hardware", tags: ["Musculoskeletal"] },
  { abbrev: "ACL / MCL / PCL / LCL", meaning: "Anterior/medial/posterior/lateral cruciate or collateral ligament", context: "Knee ligament reference", tags: ["Musculoskeletal"] },
  { abbrev: "RTC", meaning: "Rotator cuff", context: "Shoulder musculature", tags: ["Musculoskeletal"] },
  { abbrev: "DJD / OA", meaning: "Degenerative joint disease / osteoarthritis", context: "Chronic joint condition", tags: ["Musculoskeletal"] },

  { abbrev: "CVA", meaning: "Cerebrovascular accident (stroke)", context: "Neurological diagnosis", tags: ["Neuro"] },
  { abbrev: "TBI", meaning: "Traumatic brain injury", context: "Neurological diagnosis", tags: ["Neuro"] },
  { abbrev: "SCI", meaning: "Spinal cord injury", context: "Neurological diagnosis, often paired with an ASIA level", tags: ["Neuro"] },
  { abbrev: "DTR", meaning: "Deep tendon reflex", context: "Neuro exam finding, graded 0-4+", tags: ["Neuro", "Assessment"] },
  { abbrev: "LOC", meaning: "Loss of consciousness", context: "Neuro history/screening", tags: ["Neuro"] },

  { abbrev: "SOB / DOE", meaning: "Shortness of breath / dyspnea on exertion", context: "Cardiopulmonary symptom", tags: ["Cardiopulm"] },
  { abbrev: "HR / BP / RR", meaning: "Heart rate / blood pressure / respiratory rate", context: "Core vitals", tags: ["Cardiopulm", "Assessment"] },
  { abbrev: "SpO2", meaning: "Peripheral oxygen saturation", context: "Pulse oximetry reading", tags: ["Cardiopulm", "Assessment"] },
  { abbrev: "RPE", meaning: "Rating of perceived exertion", context: "Borg scale, subjective exertion during activity", tags: ["Cardiopulm", "Assessment"] },
  { abbrev: "COPD / CHF", meaning: "Chronic obstructive pulmonary disease / congestive heart failure", context: "Common cardiopulmonary diagnoses", tags: ["Cardiopulm"] },

  { abbrev: "SOAP", meaning: "Subjective, Objective, Assessment, Plan", context: "Standard note format", tags: ["Documentation"] },
  { abbrev: "STG / LTG", meaning: "Short-term goal / long-term goal", context: "Plan of care documentation", tags: ["Documentation"] },
  { abbrev: "POC", meaning: "Plan of care", context: "Documentation", tags: ["Documentation"] },
  { abbrev: "s / c / w", meaning: "Without / with", context: "Shorthand pairing, e.g. AMB c SPC", tags: ["Documentation"] },
  { abbrev: "pt", meaning: "Patient", context: "General shorthand", tags: ["Documentation"] },
  { abbrev: "tx", meaning: "Treatment", context: "General shorthand", tags: ["Documentation"] },
  { abbrev: "hx", meaning: "History", context: "General shorthand", tags: ["Documentation"] },
  { abbrev: "dx", meaning: "Diagnosis", context: "General shorthand", tags: ["Documentation"] },
  { abbrev: "eval", meaning: "Evaluation", context: "Initial visit note", tags: ["Documentation"] },
];

/** New third tab alongside Lab Values and Medications (see ClinicalReferenceTabs.tsx) —
 *  general PT/medical shorthand a clinical rotation or coursework note is full of, distinct
 *  from the two lab-value/pharmacology references already here. Same filterable-table
 *  pattern as LabValuesReference.tsx, reusing its pro-filter-bar/pro-table CSS rather than
 *  introducing new classes. */
function rowMatches(terms: string[], row: TermRow): boolean {
  return matchesSearch(terms, row.abbrev, row.meaning, row.context, row.tags);
}

/** Match count for this tab's label in the Clinical Reference search — see
 *  countLabValueMatches in LabValuesReference.tsx for the shape and why. */
export function countTerminologyMatches(query: string): number {
  const terms = searchTerms(query);
  return ROWS.filter((r) => rowMatches(terms, r)).length;
}

export function MedicalTerminologyReference({ query = "" }: { query?: string }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const terms = searchTerms(query);
  const filtered = ROWS.filter((r) => (category === "All" || r.tags.includes(category)) && rowMatches(terms, r));

  return (
    <>
      <div className="pro-disclaimer">
        Shorthand varies by facility and program — always confirm local convention before charting with an
        unfamiliar abbreviation.
      </div>
      <div className="pro-filter-bar">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={`pro-filter-chip${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      {filtered.length > 0 ? (
        <div className="pro-table-wrap">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Abbreviation</th>
                <th>Meaning</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.abbrev}>
                  <td>{row.abbrev}</td>
                  <td>{row.meaning}</td>
                  <td>{row.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="clinref-empty">No abbreviations match this search.</p>
      )}
    </>
  );
}
