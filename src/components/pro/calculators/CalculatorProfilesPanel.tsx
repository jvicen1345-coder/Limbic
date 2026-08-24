"use client";

import { useState, useTransition } from "react";
import { CALCULATOR_TESTS } from "@/lib/calculator-tests";
import {
  createCalculatorProfileAction,
  deleteCalculatorProfileAction,
  deleteCalculatorResultAction,
  updateCalculatorProfileDemographicsAction,
  type CalculatorProfileView,
} from "@/app/actions/calculator-profiles";
import { PlusIcon, TrashIcon, CheckIcon, XIcon } from "@/components/icons";

function CreateProfileForm({ onCreated, onCancel }: { onCreated: (p: CalculatorProfileView) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"" | "male" | "female">("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleTest = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  return (
    <div className="calc-profile-create">
      <div className="field">
        <label htmlFor="calc-profile-label">Profile label</label>
        <input
          id="calc-profile-label"
          className="input"
          placeholder="e.g. Room 4, or a session code"
          value={label}
          maxLength={60}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "4px 0 12px" }}>
        Use a non-identifying label — initials, a room number, or a session code — not the patient&rsquo;s real name.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="calc-profile-age">Age (optional)</label>
          <input id="calc-profile-age" className="input" type="number" min={0} max={130} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="calc-profile-sex">Sex (optional)</label>
          <select id="calc-profile-sex" className="input" value={sex} onChange={(e) => setSex(e.target.value as "" | "male" | "female")}>
            <option value="">Unspecified</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "-6px 0 12px" }}>
        Pre-fills age/sex-normed tests (30-Second Sit-to-Stand, 6MWT) so you don&rsquo;t retype them for every test.
      </p>

      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Tests planned for this session</div>
      <div className="calc-profile-test-list">
        {CALCULATOR_TESTS.map((t) => (
          <label key={t.key} className="calc-profile-test-checkbox">
            <input type="checkbox" checked={selected.includes(t.key)} onChange={() => toggleTest(t.key)} />
            {t.name}
          </label>
        ))}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "10px 0 0" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ fontSize: 12.5 }}
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const ageNum = age.trim() !== "" ? Number(age) : null;
              const result = await createCalculatorProfileAction(label, selected, ageNum, sex || null);
              if (!result.ok || !result.profile) {
                setError(result.error ?? "Something went wrong.");
                return;
              }
              onCreated(result.profile);
            });
          }}
        >
          {pending ? "Creating…" : "Create profile"}
        </button>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12.5 }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Two-click confirm (see AccountsAdminTable.tsx's DeleteButton for the same idiom) — this
 *  deletes every saved result under the profile too (see the schema's onDelete: Cascade),
 *  so it's deliberately not a single click. */
function DeleteProfileButton({ profileId, onDeleted }: { profileId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" className="btn btn-ghost btn-icon" aria-label="Delete profile" onClick={() => setConfirming(true)}>
        <TrashIcon size={13} />
      </button>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <button
        type="button"
        className="btn"
        disabled={pending}
        style={{ fontSize: 11, padding: "3px 8px", background: "var(--color-danger)", color: "#fff", border: "none" }}
        onClick={() =>
          startTransition(async () => {
            await deleteCalculatorProfileAction(profileId);
            onDeleted();
          })
        }
      >
        {pending ? "…" : "Confirm?"}
      </button>
      <button type="button" className="btn btn-ghost btn-icon" aria-label="Cancel" onClick={() => setConfirming(false)}>
        <XIcon size={12} />
      </button>
    </span>
  );
}

function ResultRow({ result, onDeleted }: { result: CalculatorProfileView["results"][number]; onDeleted: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="calc-profile-result-row">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{result.testName}</div>
        <div style={{ fontSize: 12 }}>{result.value}</div>
        <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>{result.interpretation}</div>
        <div style={{ fontSize: 10.5, color: "var(--color-neutral-600)", marginTop: 2 }}>
          {new Date(result.completedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        aria-label="Delete result"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteCalculatorResultAction(result.id);
            onDeleted();
          })
        }
      >
        <TrashIcon size={12} />
      </button>
    </div>
  );
}

/** Inline, always-editable age/sex for the active profile — saves on blur (age) or change
 *  (sex) rather than needing its own explicit save button, since these are two small,
 *  low-stakes fields a clinician may want to fix mid-visit (set at creation, or correct
 *  later) without a modal. Local `age`/`sex` state re-syncs whenever the active profile
 *  itself changes (switching profiles, or a fresh save landing) via the key prop on this
 *  component from its caller, rather than an effect. */
function ClientDetailsEditor({ profile, onUpdated }: { profile: CalculatorProfileView; onUpdated: (age: number | null, sex: "male" | "female" | null) => void }) {
  const [age, setAge] = useState(profile.age != null ? String(profile.age) : "");
  const [sex, setSex] = useState<"" | "male" | "female">(profile.sex ?? "");
  const [pending, startTransition] = useTransition();

  const save = (nextAge: number | null, nextSex: "male" | "female" | null) => {
    startTransition(async () => {
      const result = await updateCalculatorProfileDemographicsAction(profile.id, nextAge, nextSex);
      if (result.ok) onUpdated(nextAge, nextSex);
    });
  };

  return (
    <div style={{ display: "flex", gap: 10, margin: "8px 0 12px" }}>
      <div className="field" style={{ flex: 1 }}>
        <label htmlFor={`calc-profile-detail-age-${profile.id}`} style={{ fontSize: 11 }}>
          Age
        </label>
        <input
          id={`calc-profile-detail-age-${profile.id}`}
          className="input"
          type="number"
          min={0}
          max={130}
          disabled={pending}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          onBlur={() => save(age.trim() !== "" ? Number(age) : null, sex || null)}
        />
      </div>
      <div className="field" style={{ flex: 1 }}>
        <label htmlFor={`calc-profile-detail-sex-${profile.id}`} style={{ fontSize: 11 }}>
          Sex
        </label>
        <select
          id={`calc-profile-detail-sex-${profile.id}`}
          className="input"
          disabled={pending}
          value={sex}
          onChange={(e) => {
            const next = e.target.value as "" | "male" | "female";
            setSex(next);
            save(age.trim() !== "" ? Number(age) : null, next || null);
          }}
        >
          <option value="">Unspecified</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
    </div>
  );
}

/** The right-side panel on /pro/calculators — a clinician creates a Calculator Profile for
 *  a visit (a plain de-identified label, never a real patient name — see
 *  CreateProfileForm above), checks off which of the 12 tests they plan to run, then makes
 *  it active here so every calculator's "Save to profile" button (see CalcModal.tsx,
 *  CalculatorProfileContext.tsx) knows where a result should land. Results persist to the
 *  database (CalculatorProfile/CalculatorResult in schema.prisma) so they're retrievable on
 *  any later visit to this page, not just this browser session. */
export function CalculatorProfilesPanel({
  profiles,
  activeProfileId,
  onSelectProfile,
  onProfileCreated,
  onProfileDeleted,
  onResultDeleted,
  onProfileDemographicsUpdated,
}: {
  profiles: CalculatorProfileView[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onProfileCreated: (profile: CalculatorProfileView) => void;
  onProfileDeleted: (profileId: string) => void;
  onResultDeleted: (profileId: string, resultId: string) => void;
  onProfileDemographicsUpdated: (profileId: string, age: number | null, sex: "male" | "female" | null) => void;
}) {
  const [creating, setCreating] = useState(profiles.length === 0);
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;
  const resultKeys = new Set(activeProfile?.results.map((r) => r.testKey));

  return (
    <div className="card elev-sm calc-profile-panel">
      <div className="card-kicker">Calculator Profiles</div>
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "4px 0 12px" }}>
        Save results from the tests you run on the left, grouped by visit.
      </p>

      {profiles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className={p.id === activeProfileId ? "calc-profile-row calc-profile-row--active" : "calc-profile-row"}
              onClick={() => onSelectProfile(p.id)}
            >
              <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: "block" }}>{p.label}</span>
                <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
                  {p.results.length} result{p.results.length === 1 ? "" : "s"} &middot;{" "}
                  {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </span>
              <span onClick={(e) => e.stopPropagation()}>
                <DeleteProfileButton profileId={p.id} onDeleted={() => onProfileDeleted(p.id)} />
              </span>
            </button>
          ))}
        </div>
      )}

      {creating ? (
        <CreateProfileForm
          onCreated={(profile) => {
            onProfileCreated(profile);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <button type="button" className="btn btn-secondary btn-block" style={{ fontSize: 12.5, marginBottom: 14 }} onClick={() => setCreating(true)}>
          <PlusIcon size={13} />
          New profile
        </button>
      )}

      {activeProfile && (
        <div className="calc-profile-detail">
          <div className="card-kicker" style={{ marginTop: 4 }}>
            {activeProfile.label}
          </div>

          <ClientDetailsEditor
            key={activeProfile.id}
            profile={activeProfile}
            onUpdated={(age, sex) => onProfileDemographicsUpdated(activeProfile.id, age, sex)}
          />

          {activeProfile.selectedTests.length > 0 && (
            <div style={{ margin: "8px 0 14px" }}>
              {activeProfile.selectedTests.map((key) => {
                const test = CALCULATOR_TESTS.find((t) => t.key === key);
                if (!test) return null;
                const done = resultKeys.has(key);
                return (
                  <div key={key} className="calc-profile-checklist-item">
                    {done ? <CheckIcon size={13} style={{ color: "var(--color-success)" }} /> : <span className="calc-profile-checklist-dot" />}
                    <span style={{ color: done ? "var(--color-text)" : "var(--color-neutral-700)" }}>{test.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {activeProfile.results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeProfile.results.map((r) => (
                <ResultRow key={r.id} result={r} onDeleted={() => onResultDeleted(activeProfile.id, r.id)} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
              Open a calculator on the left, then use its &ldquo;Save to profile&rdquo; button once you have a result.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
