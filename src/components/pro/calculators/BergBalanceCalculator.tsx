"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// The real published Berg Balance Scale (Berg et al.) per-item 0-4 scoring criteria, in
// score order 0 (unable/most impaired) to 4 (independent/least impaired) to match the
// select's value order below.
const BERG_ITEMS: { name: string; criteria: string[] }[] = [
  {
    name: "Sitting to standing",
    criteria: [
      "Needs moderate or maximal assist to stand",
      "Needs minimal aid to stand or stabilize",
      "Able to stand using hands after several tries",
      "Able to stand independently using hands",
      "Able to stand without using hands and stabilize independently",
    ],
  },
  {
    name: "Standing unsupported",
    criteria: [
      "Unable to stand 30 seconds unsupported",
      "Needs several tries to stand 30 seconds unsupported",
      "Able to stand 30 seconds unsupported",
      "Able to stand 2 minutes with supervision",
      "Able to stand safely for 2 minutes",
    ],
  },
  {
    name: "Sitting unsupported, feet on floor",
    criteria: [
      "Unable to sit without support 10 seconds",
      "Able to sit 10 seconds",
      "Able to sit 30 seconds",
      "Able to sit 2 minutes under supervision",
      "Able to sit safely and securely for 2 minutes",
    ],
  },
  {
    name: "Standing to sitting",
    criteria: [
      "Needs assistance to sit",
      "Sits independently but has uncontrolled descent",
      "Uses back of legs against chair to control descent",
      "Controls descent by using hands",
      "Sits safely with minimal use of hands",
    ],
  },
  {
    name: "Transfers",
    criteria: [
      "Needs two people to assist or supervise to be safe",
      "Needs one person to assist",
      "Able to transfer with verbal cueing and/or supervision",
      "Able to transfer safely, definite need of hands",
      "Able to transfer safely with minor use of hands",
    ],
  },
  {
    name: "Standing with eyes closed",
    criteria: [
      "Needs help to keep from falling",
      "Unable to keep eyes closed 3 seconds but stands safely",
      "Able to stand 3 seconds",
      "Able to stand 10 seconds with supervision",
      "Able to stand 10 seconds safely",
    ],
  },
  {
    name: "Standing with feet together",
    criteria: [
      "Needs help to attain position and unable to hold 15 seconds",
      "Needs help to attain position but able to stand 15 seconds feet together",
      "Able to place feet together independently but unable to hold 30 seconds",
      "Able to place feet together independently and stand 1 minute with supervision",
      "Able to place feet together independently and stand 1 minute safely",
    ],
  },
  {
    name: "Reaching forward with outstretched arm",
    criteria: [
      "Loses balance while trying/requires external support",
      "Reaches forward but needs supervision",
      "Can reach forward safely >5 cm (2 in)",
      "Can reach forward safely >12.5 cm (5 in)",
      "Can reach forward confidently >25 cm (10 in)",
    ],
  },
  {
    name: "Retrieving object from floor",
    criteria: [
      "Unable to try/needs assist to keep from losing balance or falling",
      "Unable to pick up and needs supervision while trying",
      "Unable to pick up but reaches 2-5 cm from the object and keeps balance independently",
      "Able to pick up but needs supervision",
      "Able to pick up safely and easily",
    ],
  },
  {
    name: "Turning to look behind",
    criteria: [
      "Needs assist to keep from losing balance or falling",
      "Needs supervision when turning",
      "Turns sideways only but maintains balance",
      "Looks behind one side only, other side shows less weight shift",
      "Looks behind from both sides, good weight shift",
    ],
  },
  {
    name: "Turning 360 degrees",
    criteria: [
      "Needs assistance while turning",
      "Needs close supervision or verbal cueing",
      "Able to turn 360 degrees safely but slowly",
      "Able to turn 360 degrees safely one side only in ≤4 seconds",
      "Able to turn 360 degrees safely in ≤4 seconds each side",
    ],
  },
  {
    name: "Placing alternate foot on stool",
    criteria: [
      "Needs assistance to keep from falling/unable to try",
      "Able to complete >2 steps needing minimal assist",
      "Able to complete 4 steps without aid with supervision",
      "Able to stand independently, completes 8 steps in >20 seconds",
      "Able to stand independently and safely, completes 8 steps in 20 seconds",
    ],
  },
  {
    name: "Standing with one foot in front",
    criteria: [
      "Loses balance while stepping or standing",
      "Needs help to step but can hold 15 seconds",
      "Able to take small step independently and hold 30 seconds",
      "Able to place foot ahead independently and hold 30 seconds",
      "Able to place foot in tandem independently and hold 30 seconds",
    ],
  },
  {
    name: "Standing on one foot",
    criteria: [
      "Unable to try/needs assist to prevent fall",
      "Tries to lift leg, unable to hold 3 seconds but remains standing independently",
      "Able to lift leg independently and hold ≥3 seconds",
      "Able to lift leg independently and hold 5-10 seconds",
      "Able to lift leg independently and hold >10 seconds",
    ],
  },
];

function interpretBerg(total: number) {
  if (total >= 41) return { label: "Low fall risk", color: "var(--color-success)" };
  if (total >= 21) return { label: "Medium fall risk", color: "var(--color-warn)" };
  return { label: "High fall risk", color: "#dc2626" };
}

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const BERG_BALANCE_MEASURE = {
  name: "Berg Balance Scale",
  fullName: "BBS",
  measures: "Static and dynamic balance across 14 functional tasks.",
  population: "Older adults, neurological and balance-impaired patients",
  itemCount: "14 items",
  administration: "Clinician-Administered",
} as const;

/** Fully functional — all 14 items, each scored 0-4 against the real published Berg
 *  Balance Scale per-item criteria, summed in real time out of 56. */
export function BergBalanceCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(BERG_ITEMS.length).fill(0));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const result = interpretBerg(total);

  return (
    <>
      <CalcCardShell {...BERG_BALANCE_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="Berg Balance Scale"
        onClose={() => setOpen(false)}
        testKey="berg"
        testName="Berg Balance Scale"
        result={{ value: `${total} / 56`, label: `${result.label}, 41-56 low, 21-40 medium, 0-20 high fall risk` }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {BERG_ITEMS.map((item, i) => (
            <div className="pro-item-row" key={item.name}>
              <span className="pro-item-row-label">
                {i + 1}. {item.name}
              </span>
              <select
                className="input pro-item-row-select"
                value={scores[i]}
                onChange={(e) => {
                  const next = [...scores];
                  next[i] = Number(e.target.value);
                  setScores(next);
                }}
              >
                {item.criteria.map((criterion, score) => (
                  <option key={score} value={score}>
                    {score} — {criterion}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value" style={{ color: result.color }}>
            {total} / 56
          </div>
          <div className="pro-calc-result-label">{result.label}, 41-56 low, 21-40 medium, 0-20 high fall risk</div>
        </div>
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 12 }}>
          Minimal detectable change: ~6.5 points (community-dwelling older adults). Minimal clinically important
          difference varies by baseline score and population, commonly cited in the 4-8 point range.
        </p>
      </CalcModal>
    </>
  );
}
