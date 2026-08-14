"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCELog } from "@/app/actions/pro-toolbox";
import { ImageIcon } from "@/components/icons";

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
  const [pending, startTransition] = useTransition();
  const [courseName, setCourseName] = useState("");
  const [provider, setProvider] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [hours, setHours] = useState("");
  const [category, setCategory] = useState(CE_CATEGORIES[0]);

  const canSubmit = courseName.trim().length > 0 && completedAt.length > 0 && Number(hours) > 0;

  const handleAdd = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      await addCELog({ courseName, provider, completedAt, hours: Number(hours), category });
      setCourseName("");
      setProvider("");
      setCompletedAt("");
      setHours("");
      setCategory(CE_CATEGORIES[0]);
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <button type="button" className="btn btn-primary" disabled={pending || !canSubmit} onClick={handleAdd}>
          {pending ? "Adding…" : "Add"}
        </button>
        {/* TODO: wire up real certificate file upload and storage, not functional yet. */}
        <button type="button" className="btn btn-secondary" disabled title="Certificate upload coming soon">
          <ImageIcon size={14} />
          Upload certificate
        </button>
      </div>
    </div>
  );
}
