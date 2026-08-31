"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

// Real, standard SMART-format (specific, measurable, functional, time-bound) goal examples,
// following the style used in real PT documentation, organized by category.
const CATEGORIES: { name: string; goals: string[] }[] = [
  {
    name: "Mobility goals",
    goals: [
      "Patient will ambulate 150 feet with [device] and modified independence on level surfaces within 2 weeks, to safely access the bathroom and kitchen at home.",
      "Patient will negotiate 12 stairs with a single railing and contact guard assist within 4 weeks, to safely enter and exit their home.",
      "Patient will transition from sit to stand independently without upper extremity push-off within 3 weeks, to reduce fall risk during daily transfers.",
      "Patient will ambulate 500 feet on uneven outdoor terrain with modified independence within 6 weeks, to return to community mobility.",
      "Patient will demonstrate independent bed mobility, including rolling and supine-to-sit, within 2 weeks, to reduce caregiver burden with the morning routine.",
    ],
  },
  {
    name: "Strength goals",
    goals: [
      "Patient will increase quadriceps strength from 3/5 to 4/5 on manual muscle test within 4 weeks, to support safe stair negotiation.",
      "Patient will perform 10 repetitions of a sit-to-stand transfer without upper extremity assistance within 3 weeks, to demonstrate improved lower extremity strength for functional transfers.",
      "Patient will increase grip strength to within 10% of the uninvolved side within 6 weeks, to return to occupational tasks requiring manual dexterity.",
      "Patient will demonstrate 4/5 hip abductor strength bilaterally within 4 weeks, to reduce a compensatory Trendelenburg gait pattern.",
      "Patient will independently complete a home strengthening program of 3 sets of 15 repetitions within 4 weeks, to support return to prior level of function.",
    ],
  },
  {
    name: "Balance goals",
    goals: [
      "Patient will maintain single-limb stance for 10 seconds bilaterally without loss of balance within 4 weeks, to reduce fall risk.",
      "Patient will improve Berg Balance Scale score to at least 45/56 within 6 weeks, to reduce fall risk to the low-risk category.",
      "Patient will maintain standing balance on a compliant surface with eyes closed for 20 seconds within 4 weeks, to improve proprioceptive control.",
      "Patient will recover from an external perturbation without a step or loss of balance in 4 of 5 trials within 5 weeks, to demonstrate improved reactive balance strategies.",
      "Patient will complete the Timed Up and Go in under 12 seconds within 4 weeks, to demonstrate reduced fall risk.",
    ],
  },
  {
    name: "ADL goals",
    goals: [
      "Patient will don/doff a shirt independently using adaptive strategies within 3 weeks, to reduce reliance on caregiver assistance with dressing.",
      "Patient will complete a shower transfer with modified independence using a shower chair and grab bars within 3 weeks, to safely bathe independently.",
      "Patient will perform a toilet transfer independently within 2 weeks, to reduce caregiver assistance needs.",
      "Patient will independently prepare a simple meal while standing at the counter for 10 minutes within 4 weeks, to support independent living.",
      "Patient will don/doff lower extremity clothing and footwear independently, using adaptive equipment as needed, within 3 weeks, to support independence with morning ADLs.",
    ],
  },
  {
    name: "Return to sport goals",
    goals: [
      "Patient will demonstrate a limb symmetry index of at least 90% on single-leg hop testing within 12 weeks, to support safe return to cutting and pivoting sports.",
      "Patient will complete a sport-specific agility drill within 10% of pre-injury time within 12 weeks, to progress toward return-to-sport clearance.",
      "Patient will complete a pain-free running progression from straight-line jogging to sprinting within 8 weeks, to progress toward return-to-play testing.",
      "Patient will pass a return-to-sport functional test battery, including hop testing, agility, and a sport-specific movement screen, prior to unrestricted return to competition.",
      "Patient will demonstrate quadriceps strength within 90% of the contralateral limb on dynamometry testing within 16 weeks, to meet return-to-sport strength criteria.",
    ],
  },
  {
    name: "Return to work goals",
    goals: [
      "Patient will tolerate 8 hours of standing and walking associated with job requirements within 6 weeks, to support full-duty return to work.",
      "Patient will demonstrate safe lifting mechanics with loads matching job demands within 6 weeks, to support return to full-duty work.",
      "Patient will tolerate repetitive overhead reaching for 30 minutes without symptom exacerbation within 5 weeks, to meet the physical demands of their occupation.",
      "Patient will complete a simulated work-conditioning task matching essential job functions with modified independence within 8 weeks, to support a graduated return-to-work plan.",
      "Patient will demonstrate the ability to sit for 60 minutes with proper ergonomic positioning without symptom exacerbation within 4 weeks, to support return to a desk-based occupation.",
    ],
  },
];

/** Not a copy template like the other six documentation cards, a searchable reference bank
 *  of pre-written goal examples organized by body region/function — six categories of five
 *  goals each is a lot of text, easily the tallest card on the page (see the .pro-grid-2
 *  row-stretch fix in globals.css this used to trigger). Collapsed by default via the same
 *  <details>/.pro-accordion-* shell every other reference-library entry in this app uses
 *  (TestCard in SpecialTestsLibrary.tsx, the decision-rule/red-flag cards) — closed, its
 *  height matches its row neighbors; a reader who wants it clicks to open, same as any other
 *  accordion card. */
export function FunctionalGoalsBank() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = CATEGORIES.map((cat) => ({
    ...cat,
    goals: q ? cat.goals.filter((g) => g.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) : cat.goals,
  })).filter((cat) => cat.goals.length > 0);

  return (
    <details className="card elev-sm">
      <summary className="pro-accordion-summary">
        <div>
          <div>Functional Goals Bank</div>
          <div className="pro-accordion-summary-sub">
            Searchable reference bank of pre-written goal examples, organized by body region and function.
          </div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <input
          className="input"
          style={{ marginBottom: 12 }}
          placeholder="Search goals..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((cat) => (
            <div key={cat.name}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{cat.name}</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
                {cat.goals.map((g) => (
                  <li key={g} style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>No goals match &ldquo;{query}&rdquo;.</p>}
        </div>
      </div>
    </details>
  );
}
