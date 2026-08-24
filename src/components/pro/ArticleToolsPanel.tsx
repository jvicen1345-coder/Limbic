"use client";

import { useState } from "react";
import { GeneralizabilityChecker } from "@/components/pro/GeneralizabilityChecker";
import { ArticleHistogramExplorer } from "@/components/pro/ArticleHistogramExplorer";

/** One shared "Study" field feeding both the Generalizability Checker and the Article
 *  Histogram Explorer below it — each used to have its own separate study input, so
 *  checking both meant pasting the same link twice. Lifted here since app/(app)/pro/
 *  research-literacy/page.tsx is a server component (it does the auth/gate check) and
 *  can't hold this client state itself. The shared value is read-only from each child's
 *  own perspective (see their `studyInput` prop) — only this panel can change it. */
export function ArticleToolsPanel() {
  const [studyInput, setStudyInput] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card elev-sm">
        <div className="card-kicker">Study</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Paste a PubMed link, PMID, DOI, or citation once — both tools below read from it. The Generalizability
          Checker also accepts a plain description of the study&rsquo;s population here instead, if you&rsquo;d
          rather not look one up.
        </p>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="shared-study-input">Study — link, PMID, DOI, citation, or a description of its population</label>
          <textarea
            className="input"
            id="shared-study-input"
            rows={3}
            placeholder="e.g. https://pubmed.ncbi.nlm.nih.gov/34567890/ — or 45 adults aged 20-35 with acute low back pain, recruited from one outpatient clinic"
            value={studyInput}
            onChange={(e) => setStudyInput(e.target.value)}
          />
        </div>
      </div>

      <GeneralizabilityChecker studyInput={studyInput} />
      <ArticleHistogramExplorer studyInput={studyInput} />
    </div>
  );
}
