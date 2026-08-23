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
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          onChange={handleUpload}
          disabled={isPending}
          style={{ fontSize: 12.5 }}
        />
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
