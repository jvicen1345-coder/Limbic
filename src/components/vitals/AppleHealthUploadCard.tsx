"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importAppleHealthExportAction, type ImportResult } from "@/app/actions/fitness-import";

/** The zero-technical-concept path onto the Activity Log — export a file from the Health
 *  app (Health app → profile icon → Export All Health Data, produces one zip), upload it
 *  here, done. No Shortcuts app, no automation, no tokens. See lib/apple-health-import.ts
 *  for the size caps and what this can and can't handle. */
export function AppleHealthUploadCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const res = await importAppleHealthExportAction(formData);
      setResult(res);
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Upload from the Health app</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Prefer not to set up an automation? Open the Health app, tap your profile icon
        (top right) → <strong>Export All Health Data</strong>, then upload the zip file it
        creates here. This is a one-time snapshot, not an ongoing sync.
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        {/* The bare native file input renders its own OS-level button chrome, which reads
         *  as a mismatched box dropped into this card's otherwise custom-styled UI —
         *  same fix as CELogForm.tsx's own certificate upload: keep the real <input>
         *  hidden but functional, and drive it from a normal styled button instead. */}
        <input ref={inputRef} type="file" accept=".zip" onChange={handleUpload} disabled={isPending} style={{ display: "none" }} />
        <button type="button" className="btn btn-secondary" disabled={isPending} onClick={() => inputRef.current?.click()}>
          {isPending ? "Reading…" : "Choose File"}
        </button>
        {fileName && !isPending && <span style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>{fileName}</span>}
      </div>

      {isPending && (
        <p className="card-body" style={{ marginTop: 8, fontStyle: "italic" }}>
          Reading {fileName}…
        </p>
      )}
      {!isPending && result && result.ok && (
        <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--color-success)" }}>
          Imported activity for {result.daysImported} day{result.daysImported === 1 ? "" : "s"}.
        </p>
      )}
      {!isPending && result && !result.ok && (
        <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--color-danger)" }}>{result.error}</p>
      )}
    </div>
  );
}
