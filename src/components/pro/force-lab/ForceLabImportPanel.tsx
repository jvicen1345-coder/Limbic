"use client";

import { useRef, useState } from "react";
import { parseScreenshot } from "@/app/actions/force-lab";
import { ForceLabEntryForm, type ForceLabPrefill } from "./ForceLabEntryForm";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import type { ForceLabSession } from "@/generated/prisma/client";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Import Screenshot tab — upload an ActiveForce result screenshot, parse it via Anthropic
 *  Vision (see parseScreenshot in app/actions/force-lab.ts), then hand the parsed values to
 *  the same ForceLabEntryForm Manual Entry uses so the clinician reviews/corrects before
 *  saving. `onParseFailed` switches the parent's tab back to Manual Entry with empty
 *  fields, per the spec's own failure behavior — this panel never renders a form itself in
 *  that case. */
export function ForceLabImportPanel({
  patients,
  forceUnit,
  initialPatientId,
  onSaved,
  onParseFailed,
}: {
  patients: PatientListEntry[];
  forceUnit: string;
  initialPatientId: string | null;
  onSaved: (session: ForceLabSession) => void;
  onParseFailed: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "parsed">("idle");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ForceLabPrefill | null>(null);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    setStatus("loading");
    setPreviewSrc(URL.createObjectURL(file));
    const base64 = await fileToBase64(file);
    const result = await parseScreenshot(base64, file.type);
    if (!result) {
      setStatus("idle");
      setPreviewSrc(null);
      onParseFailed();
      return;
    }
    setParsed(result);
    setStatus("parsed");
  };

  if (status === "parsed" && parsed) {
    return (
      <ForceLabEntryForm
        patients={patients}
        forceUnit={forceUnit}
        initialPatientId={initialPatientId}
        prefill={parsed}
        importedFrom="activeforce_screenshot"
        previewImageSrc={previewSrc ?? undefined}
        onSaved={onSaved}
      />
    );
  }

  return (
    <div className="forcelab-import-panel">
      <div className="card elev-sm forcelab-import-instructions">
        <p>Take a screenshot of your ActiveForce result screen and upload it here.</p>
        <p>Limbic will read the values automatically. Review and confirm before saving.</p>
      </div>

      {status === "loading" ? (
        <div className="forcelab-upload-zone forcelab-upload-zone--loading">Reading your screenshot…</div>
      ) : (
        <div
          className="forcelab-upload-zone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
        >
          Tap to upload or drag and drop
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
