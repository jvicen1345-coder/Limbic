"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCELog } from "@/app/actions/pro-toolbox";
import { readCertificateFileToDataUrl } from "@/lib/media-upload";
import { ImageIcon, CheckIcon, XIcon } from "@/components/icons";

const CE_CATEGORIES = [
  "Manual Therapy",
  "Neurological Rehabilitation",
  "Cardiopulmonary",
  "Pediatrics",
  "Geriatrics",
  "Ethics",
  "Jurisprudence",
  "Pain Science",
  "Evidence Based Practice",
  "Other",
];

export function CELogForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [courseName, setCourseName] = useState("");
  const [provider, setProvider] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [hours, setHours] = useState("");
  const [category, setCategory] = useState(CE_CATEGORIES[0]);
  const [certificateDataUrl, setCertificateDataUrl] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const [readingCertificate, setReadingCertificate] = useState(false);

  const canSubmit = courseName.trim().length > 0 && completedAt.length > 0 && Number(hours) > 0;

  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCertificateError(null);
    setReadingCertificate(true);
    try {
      const dataUrl = await readCertificateFileToDataUrl(file);
      setCertificateDataUrl(dataUrl);
      setCertificateName(file.name);
    } catch (err) {
      setCertificateDataUrl(null);
      setCertificateName(null);
      setCertificateError(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setReadingCertificate(false);
    }
  };

  const clearCertificate = () => {
    setCertificateDataUrl(null);
    setCertificateName(null);
    setCertificateError(null);
  };

  const handleAdd = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      await addCELog({
        courseName,
        provider,
        completedAt,
        hours: Number(hours),
        category,
        certificateDataUrl: certificateDataUrl ?? undefined,
      });
      setCourseName("");
      setProvider("");
      setCompletedAt("");
      setHours("");
      setCategory(CE_CATEGORIES[0]);
      clearCertificate();
      router.refresh();
    });
  };

  return (
    <div className="card elev-sm">
      <div className="card-kicker">Log a CE course</div>
      <div className="pro-grid-2" style={{ marginTop: 10 }}>
        <div className="field">
          <label htmlFor="ce-course-name">Course name</label>
          <input id="ce-course-name" className="input" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ce-provider">Provider</label>
          <input id="ce-provider" className="input" value={provider} onChange={(e) => setProvider(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ce-completed">Date completed</label>
          <input id="ce-completed" className="input" type="date" value={completedAt} onChange={(e) => setCompletedAt(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ce-hours">Hours</label>
          <input id="ce-hours" className="input" type="number" min={0} step={0.25} value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ce-category">Category</label>
          <select id="ce-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" disabled={pending || !canSubmit} onClick={handleAdd}>
          {pending ? "Adding…" : "Add"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={handleCertificateChange}
        />
        {certificateName ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-neutral-700)" }}>
            <CheckIcon size={13} style={{ color: "var(--color-success)" }} />
            {certificateName}
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label="Remove certificate"
              onClick={clearCertificate}
              style={{ width: 20, height: 20 }}
            >
              <XIcon size={12} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={readingCertificate}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={14} />
            {readingCertificate ? "Reading…" : "Upload certificate"}
          </button>
        )}
      </div>
      {certificateError && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 6 }}>{certificateError}</p>}
    </div>
  );
}
