"use client";

import { useState, useTransition } from "react";
import {
  createIntakeLink,
  revokeIntakeLink,
  acceptIntakeSubmission,
  dismissIntakeSubmission,
  type IntakeInboxData,
  type IntakeSubmissionView,
} from "@/app/actions/intake";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import { PlusIcon } from "@/components/icons";

/** "Client Intake" on the dashboard's right column: generate a link to send a new client,
 *  and deal with the intakes that have come back.
 *
 *  A submission is never a patient on its own — accepting one asks which patient it belongs
 *  to, because ClinicalPatient needs a condition, body region, specialty and visit count
 *  that no client can supply, and because "new person or one I already have" is a judgement
 *  the form can't make. Create the patient first if they're new, then attach.
 *
 *  The client's name and email are shown here and nowhere else. They exist so the clinician
 *  can tell who submitted, and are cleared the moment the submission is accepted or
 *  dismissed — see acceptIntakeSubmission. The caseload itself stays keyed on patientCode. */
export function IntakeInboxCard({ data, patients, onChanged }: {
  data: IntakeInboxData;
  patients: PatientListEntry[];
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [freshLink, setFreshLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attaching, setAttaching] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const linkUrl = (token: string) =>
    typeof window === "undefined" ? "" : `${window.location.origin}/intake?token=${token}`;

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(linkUrl(token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused outright (permissions, an insecure origin). The input
      // below still holds the URL, so the reader can select it by hand — no error state needed.
    }
  };

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createIntakeLink(label);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFreshLink(result.token);
      setLabel("");
      setCreating(false);
      onChanged();
    });
  };

  const handleAccept = (submissionId: string) => {
    if (!target) {
      setError("Choose which patient this belongs to.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await acceptIntakeSubmission(submissionId, target);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAttaching(null);
      setTarget("");
      onChanged();
    });
  };

  const handleDismiss = (submissionId: string) => {
    if (!window.confirm("Dismiss this intake? The client's answers will be kept, their name and email won't.")) return;
    setError(null);
    startTransition(async () => {
      const result = await dismissIntakeSubmission(submissionId);
      if (!result.ok) setError(result.error);
      else onChanged();
    });
  };

  const handleRevoke = (linkId: string) => {
    startTransition(async () => {
      const result = await revokeIntakeLink(linkId);
      if (!result.ok) setError(result.error);
      else onChanged();
    });
  };

  return (
    <div className="card elev-sm intake-inbox">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Client Intake{data.pending.length > 0 ? ` (${data.pending.length})` : ""}
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setCreating((v) => !v)}>
          <PlusIcon size={13} />
          New link
        </button>
      </div>

      {creating && (
        <div className="clindash-inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="intake-label">Who is this for? (only you see this)</label>
            <input
              className="input"
              id="intake-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Jane, referred by Dr Ruiz"
            />
          </div>
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleCreate}>
              {pending ? "Creating…" : "Create link"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)} disabled={pending}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {freshLink && (
        <div className="intake-fresh-link">
          <div className="intake-fresh-link-label">Send this to your client — it works once, and expires in 14 days.</div>
          <div className="intake-fresh-link-row">
            <input className="input" readOnly value={linkUrl(freshLink)} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn-secondary" onClick={() => copy(freshLink)}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {data.pending.length === 0 && data.openLinks.length === 0 && !creating && (
        <p className="intake-empty">
          No intakes waiting. Create a link and send it to a new client — their answers come back here.
        </p>
      )}

      {data.pending.map((s) => (
        <SubmissionRow
          key={s.id}
          submission={s}
          patients={patients}
          expanded={attaching === s.id}
          pending={pending}
          target={target}
          onTarget={setTarget}
          onToggle={() => {
            setAttaching(attaching === s.id ? null : s.id);
            setTarget("");
            setError(null);
          }}
          onAccept={() => handleAccept(s.id)}
          onDismiss={() => handleDismiss(s.id)}
        />
      ))}

      {data.openLinks.length > 0 && (
        <details className="clindash-hep-history">
          <summary>Links waiting to be used ({data.openLinks.length})</summary>
          {data.openLinks.map((l) => (
            <div className="intake-open-link" key={l.id}>
              <div>
                <div className="intake-open-link-label">{l.label || "Unlabelled link"}</div>
                <div className="intake-open-link-meta">Expires {new Date(l.expiresAt).toLocaleDateString()}</div>
              </div>
              <div className="intake-open-link-actions">
                <button type="button" className="clindash-session-exercise-action" onClick={() => copy(l.token)}>
                  Copy
                </button>
                <button
                  type="button"
                  className="clindash-session-exercise-action clindash-session-exercise-action--danger"
                  disabled={pending}
                  onClick={() => handleRevoke(l.id)}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </details>
      )}

      {error && <p className="intake-error">{error}</p>}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="intake-answer-line">
      <span className="intake-answer-label">{label}</span>
      <span className="intake-answer-value">{value}</span>
    </div>
  );
}

function SubmissionRow({
  submission, patients, expanded, pending, target, onTarget, onToggle, onAccept, onDismiss,
}: {
  submission: IntakeSubmissionView;
  patients: PatientListEntry[];
  expanded: boolean;
  pending: boolean;
  target: string;
  onTarget: (v: string) => void;
  onToggle: () => void;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const a = submission.answers;
  const equipment = [...a.equipment, a.equipmentOther].filter(Boolean).join(", ");

  return (
    <div className="intake-submission">
      <div className="intake-submission-top">
        <div>
          <div className="intake-submission-name">{submission.clientName || "Unnamed client"}</div>
          <div className="intake-submission-meta">
            {submission.clientEmail ? `${submission.clientEmail} · ` : ""}
            {new Date(submission.submittedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="intake-open-link-actions">
          <button type="button" className="clindash-session-exercise-action" disabled={pending} onClick={onToggle}>
            {expanded ? "Close" : "Attach"}
          </button>
          <button
            type="button"
            className="clindash-session-exercise-action clindash-session-exercise-action--danger"
            disabled={pending}
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>

      <div className="intake-answers">
        <Line label="Now" value={[a.activityLevel, a.activities.join(", ")].filter(Boolean).join(" — ")} />
        <Line label="Short term" value={a.goalShort} />
        <Line label="Long term" value={a.goalLong} />
        <Line label="Measure" value={a.goalMeasure} />
        <Line label="Limits" value={a.limits || (a.cleared ? "None stated" : "")} />
        <Line label="Equipment" value={equipment} />
        <Line label="Where" value={a.venues.join(", ")} />
        <Line
          label="Availability"
          value={[a.availableDays && `${a.availableDays} days`, a.availableTime].filter(Boolean).join(", ")}
        />
      </div>

      {expanded && (
        <div className="clindash-inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor={`intake-target-${submission.id}`}>Attach to patient</label>
            <select
              className="input"
              id={`intake-target-${submission.id}`}
              value={target}
              onChange={(e) => onTarget(e.target.value)}
            >
              <option value="">Choose a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patientCode} — {p.condition}
                </option>
              ))}
            </select>
          </div>
          <p className="intake-attach-note">
            New client? Add them with &ldquo;New Patient&rdquo; first — a record needs a condition, body region and
            visit count that an intake can&rsquo;t supply. Their goals will be added to whichever patient you pick.
          </p>
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending} onClick={onAccept}>
              {pending ? "Attaching…" : "Attach intake"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
