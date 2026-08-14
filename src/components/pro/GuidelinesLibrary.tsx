"use client";

import { useState } from "react";
import { ExternalLinkIcon } from "@/components/icons";

interface Guideline {
  condition: string;
  org: string;
  year: number;
  region: string;
}

const REGIONS = ["All", "Spine", "Shoulder", "Hip", "Knee", "Ankle", "Neurological", "Cardiopulmonary", "Pediatrics", "Geriatrics"] as const;

const GUIDELINES: Guideline[] = [
  { condition: "Low Back Pain", org: "APTA", year: 2021, region: "Spine" },
  { condition: "Neck Pain", org: "APTA", year: 2017, region: "Spine" },
  { condition: "Hip Pain and Mobility Deficits", org: "APTA", year: 2017, region: "Hip" },
  { condition: "Knee Pain and Mobility Deficits", org: "APTA", year: 2018, region: "Knee" },
  { condition: "Achilles Pain and Mobility Deficits", org: "APTA", year: 2018, region: "Ankle" },
  { condition: "Shoulder Pain and Mobility Deficits", org: "APTA", year: 2022, region: "Shoulder" },
  { condition: "Patellofemoral Pain", org: "APTA", year: 2019, region: "Knee" },
  { condition: "Stroke Rehabilitation", org: "APTA", year: 2022, region: "Neurological" },
  { condition: "Bell's Palsy", org: "APTA", year: 2020, region: "Neurological" },
  { condition: "Balance and Fall Prevention", org: "APTA", year: 2021, region: "Geriatrics" },
  { condition: "Chronic Obstructive Pulmonary Disease", org: "APTA", year: 2019, region: "Cardiopulmonary" },
  { condition: "Plantar Fasciitis", org: "APTA", year: 2014, region: "Ankle" },
];

function GuidelineCard({ g }: { g: Guideline }) {
  return (
    <div className="card elev-sm">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div className="pro-calc-title">{g.condition}</div>
        <span className="tag tag-evidence-cpg">{g.org} CPG</span>
      </div>
      <p className="pro-calc-meta" style={{ margin: "2px 0 8px" }}>
        {g.org} &middot; {g.year}
      </p>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
        Key recommendations coming soon. Content being compiled from official APTA clinical practice guidelines.
      </p>
      {/* TODO: Add real guideline URL and 3-5 key recommendations for this condition */}
      <a href="#" className="btn btn-secondary" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}>
        View Full Guideline
        <ExternalLinkIcon size={13} />
      </a>
    </div>
  );
}

export function GuidelinesLibrary() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const filtered = region === "All" ? GUIDELINES : GUIDELINES.filter((g) => g.region === region);

  return (
    <>
      <div className="pro-filter-bar">
        {REGIONS.map((r) => (
          <button key={r} type="button" className={`pro-filter-chip${region === r ? " active" : ""}`} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="pro-grid-2">
        {filtered.map((g) => (
          <GuidelineCard g={g} key={g.condition} />
        ))}
      </div>
    </>
  );
}
