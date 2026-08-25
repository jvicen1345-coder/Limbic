"use client";

import { useRef, useState } from "react";
import { GeneralizabilityChecker } from "@/components/pro/GeneralizabilityChecker";
import { ArticleHistogramExplorer } from "@/components/pro/ArticleHistogramExplorer";
import { SendIcon } from "@/components/icons";

/** One shared "Study" field feeding both the Generalizability Checker and the Article
 *  Histogram Explorer below it — each used to have its own separate study input, so
 *  checking both meant pasting the same link twice. Lifted here since app/(app)/pro/
 *  research-literacy/page.tsx is a server component (it does the auth/gate check) and
 *  can't hold this client state itself. The shared value is read-only from each child's
 *  own perspective (see their `studyInput` prop) — only this panel can change it.
 *
 *  The inline send button (and Enter key) submit both tools at once, since a textarea's
 *  Enter key only inserts a newline rather than submitting anything on its own — without
 *  this, the only way to act on a pasted link was to scroll down to each tool's own button.
 *  Each ref points at that tool's own submit handler, kept current via an effect in the
 *  tool itself (see submitRef on GeneralizabilityChecker/ArticleHistogramExplorer) rather
 *  than lifting either tool's fetch state up here — calling both unconditionally is safe,
 *  each handler already no-ops when its own required fields aren't filled in yet. */
export function ArticleToolsPanel() {
  const [studyInput, setStudyInput] = useState("");
  const genCheckRef = useRef<() => void>(() => {});
  const histFindRef = useRef<() => void>(() => {});

  const submitBoth = () => {
    genCheckRef.current();
    histFindRef.current();
  };

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
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              className="input"
              id="shared-study-input"
              rows={3}
              style={{ flex: 1 }}
              placeholder="e.g. https://pubmed.ncbi.nlm.nih.gov/34567890/ — or 45 adults aged 20-35 with acute low back pain, recruited from one outpatient clinic"
              value={studyInput}
              onChange={(e) => setStudyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitBoth();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-icon"
              aria-label="Submit study to both tools below"
              disabled={studyInput.trim().length === 0}
              onClick={submitBoth}
            >
              <SendIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <GeneralizabilityChecker studyInput={studyInput} submitRef={genCheckRef} />
      <ArticleHistogramExplorer studyInput={studyInput} submitRef={histFindRef} />
    </div>
  );
}
