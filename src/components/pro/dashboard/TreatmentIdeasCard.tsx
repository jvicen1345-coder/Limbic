"use client";

import { useEffect, useState, useTransition } from "react";
import { generateTreatmentIdeas, getTodaysTreatmentIdeas } from "@/app/actions/clinician-dashboard";

/** "What should I try next?" — below the Pre-Visit Brief section on the active-patient
 *  workspace. Self-fetching for today's already-generated ideas (if any) the same way
 *  PreVisitBriefSection checks preBriefs, just via its own round trip since TreatmentIdea
 *  rows aren't part of getPatientDetail's payload. */
export function TreatmentIdeasCard({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTodaysTreatmentIdeas(patientId).then((saved) => {
      if (cancelled) return;
      setIdeas(saved?.ideas ?? null);
      setLoadedFor(patientId);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const isCurrent = loadedFor === patientId;

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateTreatmentIdeas(patientId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setIdeas(result.ideas);
    });
  };

  return (
    <div className="clindash-section">
      <div className="card-kicker" style={{ margin: 0 }}>
        Treatment Ideas
      </div>

      {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "8px 0 0" }}>{error}</p>}

      {isCurrent && ideas ? (
        <>
          <div className="clindash-treatment-ideas-list">
            {ideas.map((idea, i) => (
              <div className="clindash-treatment-idea-row" key={i}>
                {idea}
              </div>
            ))}
          </div>
          <div className="clindash-treatment-ideas-actions">
            <button type="button" className="btn btn-secondary" style={{ fontSize: 12.5 }} onClick={handleGenerate} disabled={pending}>
              {pending ? "Generating ideas…" : "Regenerate"}
            </button>
          </div>
          <p className="clindash-disclaimer">These are evidence-based suggestions. Apply your clinical judgment before using.</p>
        </>
      ) : (
        <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={handleGenerate} disabled={pending || !isCurrent}>
          {pending ? "Generating ideas…" : "What should I try next?"}
        </button>
      )}
    </div>
  );
}
