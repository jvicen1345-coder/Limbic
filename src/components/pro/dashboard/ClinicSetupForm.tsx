"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClinic } from "@/app/actions/clinic-pro";

/** /pro/clinic-setup's single form — client component only so it can show a validation
 *  error inline and redirect client-side on success (createClinic itself never redirects;
 *  the spec's own "On success — redirect to /pro/dashboard" is this component's job). */
export function ClinicSetupForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createClinic(name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/pro/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card elev-sm">
      <div className="field">
        <label htmlFor="clinic-name">Clinic Name</label>
        <input
          className="input"
          id="clinic-name"
          placeholder="e.g. Newport Beach Physical Therapy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ fontSize: 12.5, color: "var(--color-danger)", margin: "8px 0 0" }}>{error}</p>}
      <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={pending}>
        {pending ? "Creating…" : "Create Clinic"}
      </button>
    </form>
  );
}
