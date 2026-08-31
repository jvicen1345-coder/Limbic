"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckIcon, ChevronRightIcon, PlusIcon, XIcon } from "@/components/icons";
import {
  MOVEMENT_CATEGORIES,
  MOVEMENT_EQUIPMENT,
  MOVEMENT_LAB_COUNTS,
  MOVEMENT_LAB_TOTAL,
  MOVEMENT_POSITIONS,
  MOVEMENT_PROTOCOLS,
  MOVEMENT_REGIONS,
  REHAB_PHASES,
  formatDosage,
  resolveProtocolSteps,
  searchExercises,
  type MovementCategory,
  type MovementEquipment,
  type MovementExercise,
  type MovementPosition,
  type MovementProtocol,
  type MovementRegion,
  type RehabPhase,
} from "@/lib/movement-lab";

/** Difficulty rendered as filled/empty pips rather than a number, so it reads as a rough
 *  band at a glance and doesn't invite being treated as a validated score — see the note on
 *  MovementDifficulty in lib/movement-lab/types.ts. */
function DifficultyPips({ level }: { level: number }) {
  return (
    <span className="ml-pips" aria-label={`Difficulty ${level} of 5`} title={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`ml-pip${i <= level ? " ml-pip--on" : ""}`} aria-hidden="true" />
      ))}
    </span>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="ml-detail-label">{label}</div>
      <div className="ml-detail-body">{children}</div>
    </div>
  );
}

function ExerciseCard({
  ex,
  selected,
  onToggle,
}: {
  ex: MovementExercise;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <details className="card elev-sm" id={ex.id}>
      <summary className="pro-accordion-summary">
        <div style={{ minWidth: 0 }}>
          <div>{ex.name}</div>
          <div className="pro-accordion-summary-sub">
            <span className="tag tag-accent" style={{ marginRight: 6 }}>
              {ex.region}
            </span>
            <span className="tag tag-neutral" style={{ marginRight: 6 }}>
              {ex.category}
            </span>
            <DifficultyPips level={ex.difficulty} />
          </div>
          <div className="pro-accordion-summary-sub">{formatDosage(ex.dosage)}</div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <div className="ml-detail-grid">
          <DetailBlock label="Prescribed for">{ex.indications.join(" · ")}</DetailBlock>
          <DetailBlock label="Targets">{ex.targets.join(" · ")}</DetailBlock>
          <DetailBlock label="Position">{ex.positions.join(" · ")}</DetailBlock>
          <DetailBlock label="Equipment">{ex.equipment.join(" · ")}</DetailBlock>
          <DetailBlock label="Rehab phase">{ex.phases.join(" · ")}</DetailBlock>
          {ex.aka && ex.aka.length > 0 && <DetailBlock label="Also known as">{ex.aka.join(" · ")}</DetailBlock>}
        </div>

        <DetailBlock label="Setup">{ex.setup}</DetailBlock>

        <DetailBlock label="Technique">
          <ol className="ml-ol">
            {ex.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </DetailBlock>

        <DetailBlock label="Typical dosage">
          {formatDosage(ex.dosage)}
          <div className="ml-muted">A typical starting range, not a prescription — set the real numbers for this patient.</div>
        </DetailBlock>

        <DetailBlock label="Cue">
          <em>{ex.cue}</em>
        </DetailBlock>

        <DetailBlock label="Patient instructions">{ex.patientInstructions}</DetailBlock>

        <DetailBlock label="Common errors">
          <ul className="ml-ul">
            {ex.commonErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </DetailBlock>

        <div className="ml-detail-grid">
          <DetailBlock label="Regression">{ex.regression}</DetailBlock>
          <DetailBlock label="Progression">{ex.progression}</DetailBlock>
        </div>

        <div className="ml-precautions">
          <div className="ml-detail-label">Precautions</div>
          <ul className="ml-ul">
            {ex.precautions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        {ex.note && <div className="ml-muted">{ex.note}</div>}

        <div>
          <button type="button" className={`btn ${selected ? "btn-secondary" : "btn-primary"}`} onClick={onToggle}>
            {selected ? (
              <>
                <CheckIcon size={14} /> In program
              </>
            ) : (
              <>
                <PlusIcon size={14} /> Add to program
              </>
            )}
          </button>
        </div>
      </div>
    </details>
  );
}

function ProtocolCard({ protocol }: { protocol: MovementProtocol }) {
  return (
    <details className="card elev-sm" id={protocol.id}>
      <summary className="pro-accordion-summary">
        <div style={{ minWidth: 0 }}>
          <div>{protocol.name}</div>
          <div className="pro-accordion-summary-sub">
            <span className="tag tag-accent" style={{ marginRight: 6 }}>
              {protocol.region}
            </span>
            {protocol.phases.length} phases
          </div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <div className="ml-detail-body">{protocol.summary}</div>

        {/* Rendered above the phases rather than at the bottom: the whole point of the
            caution is that it is read before the program is used, not after. */}
        <div className="ml-precautions">
          <div className="ml-detail-label">Before you use this</div>
          <div className="ml-detail-body">{protocol.caution}</div>
        </div>

        {protocol.phases.map((phase, i) => (
          <div className="ml-phase" key={phase.name}>
            <div className="ml-phase-head">
              <div>
                <div className="ml-phase-name">{phase.name}</div>
                <div className="ml-muted">{phase.timeframe}</div>
              </div>
              <Link className="btn btn-secondary btn-sm" href={`/hep?protocol=${protocol.id}&phase=${i}`}>
                Open in HEP Builder
              </Link>
            </div>

            <DetailBlock label="Goals">
              <ul className="ml-ul">
                {phase.goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </DetailBlock>

            <DetailBlock label="Criteria to progress">
              <ul className="ml-ul">
                {phase.criteriaToProgress.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </DetailBlock>

            <DetailBlock label="Exercises">
              <ul className="ml-step-list">
                {resolveProtocolSteps(phase).map(({ exercise, dosage, note }) => (
                  <li key={exercise.id}>
                    <span className="ml-step-name">{exercise.name}</span> — {dosage}
                    {note && <div className="ml-muted">{note}</div>}
                  </li>
                ))}
              </ul>
            </DetailBlock>
          </div>
        ))}
      </div>
    </details>
  );
}

/** `""` is the "no constraint on this axis" value for every select — it maps to `undefined`
 *  in MovementFilters, which is what filterExercises reads as "don't filter on this". */
function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "";
  options: readonly T[];
  onChange: (v: T | "") => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as T | "")}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MovementLabBrowser() {
  const [tab, setTab] = useState<"exercises" | "protocols">("exercises");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<MovementRegion | "">("");
  const [category, setCategory] = useState<MovementCategory | "">("");
  const [position, setPosition] = useState<MovementPosition | "">("");
  const [equipment, setEquipment] = useState<MovementEquipment | "">("");
  const [phase, setPhase] = useState<RehabPhase | "">("");
  const [maxDifficulty, setMaxDifficulty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const results = useMemo(
    () =>
      searchExercises(query, {
        region: region || undefined,
        category: category || undefined,
        position: position || undefined,
        equipment: equipment || undefined,
        phase: phase || undefined,
        maxDifficulty: maxDifficulty ? Number(maxDifficulty) : undefined,
      }),
    [query, region, category, position, equipment, phase, maxDifficulty],
  );

  const extraFilterCount = [category, position, equipment, phase, maxDifficulty].filter(Boolean).length;

  function toggleSelected(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearFilters() {
    setQuery("");
    setRegion("");
    setCategory("");
    setPosition("");
    setEquipment("");
    setPhase("");
    setMaxDifficulty("");
  }

  return (
    <>
      <div className="pro-filter-bar" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`pro-filter-chip${tab === "exercises" ? " active" : ""}`}
          onClick={() => setTab("exercises")}
        >
          Exercises ({MOVEMENT_LAB_TOTAL})
        </button>
        <button
          type="button"
          className={`pro-filter-chip${tab === "protocols" ? " active" : ""}`}
          onClick={() => setTab("protocols")}
        >
          Protocols ({MOVEMENT_PROTOCOLS.length})
        </button>
      </div>

      {tab === "protocols" ? (
        <div className="pro-accordion">
          {MOVEMENT_PROTOCOLS.map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
        </div>
      ) : (
        <>
          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="ml-search">Search the bank</label>
            <input
              className="input"
              id="ml-search"
              type="search"
              placeholder="Rotator cuff, sciatica, clamshell, no equipment…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="pro-filter-bar">
            <button
              type="button"
              className={`pro-filter-chip${region === "" ? " active" : ""}`}
              onClick={() => setRegion("")}
            >
              All regions
            </button>
            {MOVEMENT_REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                className={`pro-filter-chip${region === r ? " active" : ""}`}
                onClick={() => setRegion(r)}
              >
                {r} ({MOVEMENT_LAB_COUNTS[r]})
              </button>
            ))}
          </div>

          <div className="ml-filter-row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowFilters((s) => !s)}>
              {showFilters ? "Hide filters" : "More filters"}
              {extraFilterCount > 0 && ` (${extraFilterCount})`}
            </button>
            <span className="ml-muted">
              {results.length} {results.length === 1 ? "exercise" : "exercises"}
            </span>
            {(query || region || extraFilterCount > 0) && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>

          {showFilters && (
            <div className="card elev-sm ml-filter-panel">
              <FilterSelect label="Type" value={category} options={MOVEMENT_CATEGORIES} onChange={setCategory} />
              <FilterSelect label="Position" value={position} options={MOVEMENT_POSITIONS} onChange={setPosition} />
              <FilterSelect label="Equipment" value={equipment} options={MOVEMENT_EQUIPMENT} onChange={setEquipment} />
              <FilterSelect label="Rehab phase" value={phase} options={REHAB_PHASES} onChange={setPhase} />
              <div className="field">
                <label htmlFor="ml-difficulty">Difficulty at most</label>
                <select
                  className="input"
                  id="ml-difficulty"
                  value={maxDifficulty}
                  onChange={(e) => setMaxDifficulty(e.target.value)}
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      {d} and below
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
              Nothing matches those filters. Try clearing one — searching by condition (&ldquo;sciatica&rdquo;,
              &ldquo;ACL&rdquo;) or by an exercise&rsquo;s other name usually finds it.
            </p>
          ) : (
            <div className="pro-accordion">
              {results.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  selected={selected.includes(ex.id)}
                  onToggle={() => toggleSelected(ex.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* The tray is deliberately outside the tab branch so a selection survives switching to
          the Protocols tab and back — losing a half-built program to a mis-click would be
          worse than the small cost of the bar staying on screen. The spacer keeps the tray
          from covering the last card's own controls, which it otherwise sits directly on. */}
      {selected.length > 0 && (
        <>
          <div aria-hidden="true" style={{ height: 72 }} />
          <div className="ml-tray">
            <span>
              {selected.length} {selected.length === 1 ? "exercise" : "exercises"} selected
            </span>
            <div className="ml-tray-actions">
              <Link className="btn btn-primary btn-sm" href={`/hep?exercises=${selected.join(",")}`}>
                Send to HEP Builder
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label="Clear selection"
                onClick={() => setSelected([])}
              >
                <XIcon size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
