"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

/** One documentation template (/pro/documentation) — "Copy Template" writes the full body
 *  to the clipboard, "View" expands it inline for review before copying. */
export function DocTemplateCard({
  name,
  description,
  format,
  body,
}: {
  name: string;
  description: string;
  format: "SOAP" | "Narrative" | "Goal" | "Letter";
  body: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied by the browser, expanding the template via View
      // still lets a clinician select and copy the text manually.
      setExpanded(true);
    }
  };

  return (
    <div className="card elev-sm">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div className="pro-calc-title">{name}</div>
        <span className="tag tag-accent">{format}</span>
      </div>
      <p className="pro-calc-desc">{description}</p>
      <div className="pro-template-actions">
        <button type="button" className="btn btn-primary" onClick={handleCopy}>
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied ? "Copied" : "Copy Template"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Hide" : "View"}
        </button>
      </div>
      {expanded && <div className="pro-template-body">{body}</div>}
    </div>
  );
}
