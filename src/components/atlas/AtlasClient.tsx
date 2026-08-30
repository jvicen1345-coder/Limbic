"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AtlasBodyMap } from "./AtlasBodyMap";
import { ATLAS_CONTENT } from "@/lib/atlas-content";
import { ANTERIOR_GROUPS, POSTERIOR_GROUPS, type AtlasRegionGroup } from "@/lib/atlas-regions";
import { ATLAS_SEARCH_INDEX, type AtlasSearchEntry, type AtlasSearchEntryType } from "@/lib/atlas-search-index";
import { forceLabTokenForZone } from "@/lib/atlas-connections";
import { getQuestionsForRegion } from "@/app/actions/boards-tagging";
import { subscribeToStudentTierAction, subscribeToProAction } from "@/app/actions/pro";
import type { BoardQuestion } from "@/lib/board-content";
import { ChevronRightIcon, XIcon } from "@/components/icons";

type View = "anterior" | "posterior";

function getZoneName(zoneKey: string): string {
  return ATLAS_CONTENT[zoneKey]?.name ?? zoneKey;
}

function RegionNavList({
  groups,
  selectedZone,
  onSelectZone,
}: {
  groups: AtlasRegionGroup[];
  selectedZone: string | null;
  onSelectZone: (zoneKey: string) => void;
}) {
  return (
    <>
      {groups.map((g) => (
        <details className="atlas-region-group" key={g.label} open>
          <summary className="pro-accordion-summary atlas-region-group-summary">
            <span>{g.label}</span>
            <ChevronRightIcon size={14} className="pro-accordion-chevron" />
          </summary>
          <ul className="atlas-region-list">
            {g.zones.map((z) => (
              <li key={z}>
                <button
                  type="button"
                  className={`atlas-region-link${selectedZone === z ? " active" : ""}`}
                  onClick={() => onSelectZone(z)}
                  aria-current={selectedZone === z}
                >
                  {getZoneName(z)}
                </button>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </>
  );
}

const SEARCH_TYPE_LABEL: Record<AtlasSearchEntryType, string> = {
  region: "Region",
  muscle: "Muscle",
  condition: "Condition",
  test: "Test",
  nerve: "Nerve",
  board_pearl: "Board Pearl",
};

const SEARCH_TYPE_STYLE: Record<AtlasSearchEntryType, { background: string; color: string }> = {
  region: { background: "var(--color-accent)", color: "#fff" },
  muscle: { background: "var(--color-neutral-200)", color: "var(--color-neutral-700)" },
  condition: { background: "#dc2626", color: "#fff" },
  test: { background: "#7c3aed", color: "#fff" },
  nerve: { background: "#c9853a", color: "#fff" },
  board_pearl: { background: "#16a34a", color: "#fff" },
};

function highlightMatch(label: string, query: string) {
  const idx = label.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1 || !query) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="atlas-search-highlight">{label.slice(idx, idx + query.length)}</mark>
      {label.slice(idx + query.length)}
    </>
  );
}

function AtlasSearchResults({ query, onSelectResult }: { query: string; onSelectResult: (entry: AtlasSearchEntry) => void }) {
  const q = query.trim().toLowerCase();
  const matches = ATLAS_SEARCH_INDEX.filter((e) => e.label.toLowerCase().includes(q));
  const shown = matches.slice(0, 12);

  if (matches.length === 0) {
    return <p className="atlas-search-no-results">No results for &lsquo;{query.trim()}&rsquo;</p>;
  }

  return (
    <div className="atlas-search-results">
      {shown.map((entry, i) => (
        <button
          type="button"
          key={`${entry.type}-${entry.regionId}-${entry.label}-${i}`}
          className="atlas-search-result"
          onClick={() => onSelectResult(entry)}
        >
          <div className="atlas-search-result-top">
            <span className="atlas-search-result-pill" style={SEARCH_TYPE_STYLE[entry.type]}>
              {SEARCH_TYPE_LABEL[entry.type]}
            </span>
            <span className="atlas-search-result-label">{highlightMatch(entry.label, query.trim())}</span>
          </div>
          <div className="atlas-search-result-region">in {entry.regionName}</div>
        </button>
      ))}
      {matches.length > 12 && <p className="atlas-search-overflow-note">Showing 12 of {matches.length} results</p>}
    </div>
  );
}

function MuscleEntry({ muscle }: { muscle: (typeof ATLAS_CONTENT)[string]["keyMuscles"][number] }) {
  return (
    <div className="atlas-muscle-entry">
      <div className="atlas-muscle-name">{muscle.name}</div>
      <div>
        <strong>Origin:</strong> {muscle.origin}
      </div>
      <div>
        <strong>Insertion:</strong> {muscle.insertion}
      </div>
      <div>
        <strong>Action:</strong> {muscle.action}
      </div>
      <div>
        <strong>Nerve:</strong> {muscle.nerve} ({muscle.rootLevel})
      </div>
    </div>
  );
}

/** Ephemeral (no answer persistence — Limbic Boards' own daily-streak tracking lives at
 *  /boards, not here) multiple-choice card, same visual pattern as
 *  components/BoardQuestionCard.tsx: pick an answer, correct choice turns primary, a wrong
 *  pick gets an accent-bordered "✕", the rest dim. */
function AtlasBoardQuestionCard({ question }: { question: BoardQuestion }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const answered = selectedIndex !== null;

  return (
    <div className="card elev-sm" style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 12.5, margin: "0 0 8px" }}>{question.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {question.choices.map((choice, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selectedIndex;
          let className = "btn btn-secondary";
          if (answered && isCorrect) className = "btn btn-primary";
          return (
            <button
              key={choice}
              type="button"
              className={className}
              disabled={answered}
              onClick={() => !answered && setSelectedIndex(i)}
              style={{
                textAlign: "left",
                opacity: answered && !isCorrect && !isSelected ? 0.6 : 1,
                border: answered && isSelected && !isCorrect ? "1.5px solid var(--color-accent-700)" : undefined,
              }}
            >
              {choice}
              {answered && isSelected && !isCorrect && " ✕"}
              {answered && isCorrect && " ✓"}
            </button>
          );
        })}
      </div>
      {answered && <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>{question.explanation}</p>}
    </div>
  );
}

function ConnectionCard({
  title,
  description,
  href,
  unlocked,
  lockLabel,
}: {
  title: string;
  description: string;
  href: string;
  unlocked: boolean;
  lockLabel: string;
}) {
  if (!unlocked) {
    return (
      <div className="atlas-connection-card atlas-connection-card--locked">
        <div className="atlas-connection-card-title">{title}</div>
        <p className="atlas-connection-card-desc">{description}</p>
        <span className="atlas-connection-lock-pill">{lockLabel}</span>
      </div>
    );
  }
  return (
    <Link href={href} className="atlas-connection-card">
      <div className="atlas-connection-card-title">{title}</div>
      <p className="atlas-connection-card-desc">{description}</p>
    </Link>
  );
}

/** Always visible, never gated — see components/atlas/AtlasClient.tsx's AtlasContentPanel,
 *  which renders this for every real zone regardless of hasFullAccess/comingSoon. Force Lab
 *  only shows up for the 6 broad regions with a testable muscle group there (see
 *  lib/atlas-connections.ts) — Head and Neck and Core and Abdomen have none. */
function ExploreFurtherSection({ zoneKey, zoneName, isPro, hasStudentOrPro }: { zoneKey: string; zoneName: string; isPro: boolean; hasStudentOrPro: boolean }) {
  const forceLabToken = forceLabTokenForZone(zoneKey);
  return (
    <section className="atlas-panel-section" id="explore-further">
      <div className="card-kicker">Explore Further</div>
      <div className="atlas-connections-grid">
        <ConnectionCard
          title="Special Tests"
          description={`View full test protocols and evidence for ${zoneName}`}
          href={`/pro/special-tests?region=${zoneKey}`}
          unlocked={isPro}
          lockLabel="LimbicPRO"
        />
        <ConnectionCard
          title="Practice Questions"
          description={`Test your knowledge on ${zoneName} board questions`}
          href={`/boards?region=${zoneKey}`}
          unlocked={hasStudentOrPro}
          lockLabel="Limbic Student"
        />
        {forceLabToken && (
          <ConnectionCard
            title="Force Lab"
            description={`Measure ${zoneName} strength with your dynamometer`}
            href={`/pro/force-lab?region=${forceLabToken}`}
            unlocked={isPro}
            lockLabel="LimbicPRO"
          />
        )}
      </div>
    </section>
  );
}

/** Replaces the old blur+overlay paywall with a plain, non-blurred upgrade card — see
 *  app/globals.css .atlas-gate-card. The Limbic Student button only submits for real when the
 *  visitor already qualifies for a .edu/comped Student identity (see
 *  hasStudentAccess/subscribeToStudentTierAction), same disabled-button-with-reason pattern
 *  as app/(app)/profile/membership/page.tsx's TierHeader — anyone actually seeing this gate
 *  card doesn't yet have that identity (hasFullAccess is false), so in practice this button
 *  reads as informational; LimbicPRO's button is always real when billing is configured. */
function AtlasGateCard({ zoneName, canBuyStudent, billingEnabled }: { zoneName: string; canBuyStudent: boolean; billingEnabled: boolean }) {
  return (
    <div className="atlas-gate-card">
      <h3 className="atlas-gate-card-title">Unlock the full {zoneName} profile</h3>
      <ul className="atlas-gate-card-bullets">
        <li>Common conditions and clinical mechanisms</li>
        <li>Special tests with sensitivity and specificity values</li>
        <li>Outcome measures and cutoff scores</li>
        <li>Board pearls and NPTE connections</li>
      </ul>
      {canBuyStudent ? (
        <form action={subscribeToStudentTierAction}>
          <button type="submit" className="btn btn-primary atlas-gate-card-btn" disabled={!billingEnabled}>
            Unlock with Limbic Student — $5/mo
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="btn btn-primary atlas-gate-card-btn"
          disabled
          title="Sign in with a .edu email to purchase Limbic Student"
        >
          Unlock with Limbic Student — $5/mo
        </button>
      )}
      <form action={subscribeToProAction}>
        <button type="submit" className="btn btn-secondary atlas-gate-card-btn" disabled={!billingEnabled}>
          Unlock with LimbicPRO — $15/mo
        </button>
      </form>
      <p className="atlas-gate-card-note">Already subscribed? Sign in to access your content.</p>
    </div>
  );
}

/** The right-hand clinical panel. Free readers get the zone name and the first key muscle
 *  only (see `hasFullAccess` below) — everything past that sits behind AtlasGateCard instead
 *  of rendering. Explore Further (special tests / boards / Force Lab connections) and, when
 *  unlocked, Board Questions render below regardless of tier — see ExploreFurtherSection. */
function AtlasContentPanel({
  zoneKey,
  hasFullAccess,
  isPro,
  canBuyStudent,
  billingEnabled,
}: {
  zoneKey: string | null;
  hasFullAccess: boolean;
  isPro: boolean;
  canBuyStudent: boolean;
  billingEnabled: boolean;
}) {
  // Keyed by zoneKey rather than reset-then-refetch, so a stale zone's questions never
  // flash while the new zone's fetch is in flight — the derived `boardQuestions` below just
  // treats a mismatched key as "still loading" without needing a synchronous setState at the
  // top of the effect.
  const [boardQuestionsState, setBoardQuestionsState] = useState<{ zoneKey: string; questions: BoardQuestion[] } | null>(null);

  useEffect(() => {
    if (!zoneKey || !hasFullAccess) return;
    let cancelled = false;
    getQuestionsForRegion(zoneKey).then((questions) => {
      if (!cancelled) setBoardQuestionsState({ zoneKey, questions });
    });
    return () => {
      cancelled = true;
    };
  }, [zoneKey, hasFullAccess]);

  const boardQuestions = zoneKey && boardQuestionsState?.zoneKey === zoneKey ? boardQuestionsState.questions : null;

  if (!zoneKey) {
    return (
      <div className="atlas-panel-empty">
        <p>Select a region on the body map, or from the list, to see clinical detail.</p>
      </div>
    );
  }

  const zone = ATLAS_CONTENT[zoneKey];
  if (!zone) return null;

  if (zone.comingSoon) {
    return (
      <div className="atlas-panel-empty">
        <div className="card-kicker">{zone.name}</div>
        <p>Clinical content for this region is coming soon.</p>
        <ExploreFurtherSection zoneKey={zoneKey} zoneName={zone.name} isPro={isPro} hasStudentOrPro={hasFullAccess} />
      </div>
    );
  }

  const firstMuscle = zone.keyMuscles[0];
  const rest = (
    <>
      {zone.keyMuscles.length > 1 && (
        <section className="atlas-panel-section">
          <div className="card-kicker">Key Muscles</div>
          {zone.keyMuscles.slice(1).map((m) => (
            <MuscleEntry muscle={m} key={m.name} />
          ))}
        </section>
      )}

      {zone.commonConditions.length > 0 && (
        <section className="atlas-panel-section" id="conditions">
          <div className="card-kicker">Common Conditions</div>
          {zone.commonConditions.map((c) => (
            <div className="atlas-list-entry" key={c.name}>
              <div className="atlas-list-entry-name">{c.name}</div>
              <div>
                <strong>Mechanism:</strong> {c.mechanism}
              </div>
              <div>
                <strong>Board pearl:</strong> {c.boardPearl}
              </div>
            </div>
          ))}
        </section>
      )}

      {zone.specialTests.length > 0 && (
        <section className="atlas-panel-section" id="special-tests">
          <div className="card-kicker">Special Tests</div>
          {zone.specialTests.map((t) => (
            <div className="atlas-list-entry" key={t.name}>
              <div className="atlas-list-entry-name">{t.name}</div>
              <div>
                <strong>Assesses:</strong> {t.assesses}
              </div>
              <div>
                <strong>Sensitivity / Specificity:</strong> {t.sensitivity} / {t.specificity}
              </div>
              <div>
                <strong>Positive:</strong> {t.positive}
              </div>
            </div>
          ))}
        </section>
      )}

      {zone.outcomemeasures.length > 0 && (
        <section className="atlas-panel-section" id="outcome-measures">
          <div className="card-kicker">Outcome Measures</div>
          {zone.outcomemeasures.map((o) => (
            <div className="atlas-list-entry" key={o.name}>
              <div className="atlas-list-entry-name">{o.name}</div>
              <div>{o.description}</div>
              <div>
                <strong>MDC / cutoff:</strong> {o.mdcOrCutoff}
              </div>
            </div>
          ))}
        </section>
      )}

      {zone.boardPearls.length > 0 && (
        <section className="atlas-panel-section" id="board-pearls">
          <div className="card-kicker">Board Pearls</div>
          <ul className="atlas-pearls-list">
            {zone.boardPearls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="atlas-panel-section" id="board-questions">
        <div className="card-kicker">Board Questions</div>
        {boardQuestions === null ? null : boardQuestions.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>Board questions for this region coming soon.</p>
        ) : (
          <>
            {boardQuestions.slice(0, 3).map((q) => (
              <AtlasBoardQuestionCard question={q} key={q.id} />
            ))}
            <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>
              <Link href="/boards" style={{ color: "inherit" }}>
                Practice more on Limbic Boards
              </Link>
            </p>
          </>
        )}
      </section>
    </>
  );

  return (
    <div key={zoneKey} className="atlas-panel">
      <h2 className="atlas-panel-title">{zone.name}</h2>

      {firstMuscle && (
        <section className="atlas-panel-section" id="muscles">
          <div className="card-kicker">Key Muscles</div>
          <MuscleEntry muscle={firstMuscle} />
        </section>
      )}

      {hasFullAccess ? rest : <AtlasGateCard zoneName={zone.name} canBuyStudent={canBuyStudent} billingEnabled={billingEnabled} />}

      <ExploreFurtherSection zoneKey={zoneKey} zoneName={zone.name} isPro={isPro} hasStudentOrPro={hasFullAccess} />
    </div>
  );
}

export function AtlasClient({
  hasFullAccess,
  isPro,
  canBuyStudent,
  billingEnabled,
}: {
  hasFullAccess: boolean;
  isPro: boolean;
  canBuyStudent: boolean;
  billingEnabled: boolean;
}) {
  const [view, setView] = useState<View>("anterior");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const pendingScrollAnchorRef = useRef<string | null>(null);

  const groups = view === "anterior" ? ANTERIOR_GROUPS : POSTERIOR_GROUPS;
  const searching = query.trim().length >= 2;

  function switchView(next: View) {
    setView(next);
    // Switching front/back deselects the current zone and clears the right panel — the two
    // views' zones only share content by naming coincidence at best (most don't overlap at
    // all), so keeping a selection across the switch would either point at a zone that no
    // longer exists on the new view or silently swap to an unrelated one.
    setSelectedZone(null);
  }

  function selectZone(zoneKey: string) {
    const isAnteriorZone = ANTERIOR_GROUPS.some((g) => g.zones.includes(zoneKey));
    setView(isAnteriorZone ? "anterior" : "posterior");
    setSelectedZone(zoneKey);
  }

  function handleSelectResult(entry: AtlasSearchEntry) {
    selectZone(entry.regionId);
    pendingScrollAnchorRef.current = entry.sectionAnchor;
    setQuery("");
  }

  useEffect(() => {
    const anchor = pendingScrollAnchorRef.current;
    if (!anchor) return;
    pendingScrollAnchorRef.current = null;
    const raf = requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedZone]);

  return (
    <div className="atlas-layout">
      <div className="atlas-mobile-nav">
        <select
          className="input"
          value={selectedZone ?? ""}
          onChange={(e) => {
            if (e.target.value) setSelectedZone(e.target.value);
          }}
          aria-label="Select a body region"
        >
          <option value="">Select a region…</option>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.zones.map((z) => (
                <option key={z} value={z}>
                  {getZoneName(z)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <nav className="atlas-region-nav" aria-label="Body regions">
        {/* Placeholder kept short enough to fit the region-nav column — the old "Search
            muscles, conditions, tests..." was wider than the field and rendered clipped at
            "Search muscles, conditions," a hanging comma that read as a truncation bug. */}
        <div className="atlas-search-bar">
          <input
            type="text"
            className="input atlas-search-input"
            placeholder="Search muscles, tests…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search Limbic Atlas"
          />
          {query && (
            <button type="button" className="atlas-search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
              <XIcon size={13} />
            </button>
          )}
        </div>

        {searching ? (
          <AtlasSearchResults query={query} onSelectResult={handleSelectResult} />
        ) : (
          <RegionNavList groups={groups} selectedZone={selectedZone} onSelectZone={selectZone} />
        )}
      </nav>

      <div className="atlas-map-col">
        <div className="atlas-view-toggle" role="tablist" aria-label="Body view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "anterior"}
            className={`atlas-view-btn${view === "anterior" ? " active" : ""}`}
            onClick={() => switchView("anterior")}
          >
            Anterior
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "posterior"}
            className={`atlas-view-btn${view === "posterior" ? " active" : ""}`}
            onClick={() => switchView("posterior")}
          >
            Posterior
          </button>
        </div>
        <AtlasBodyMap view={view} selectedZone={selectedZone} onSelectZone={selectZone} getZoneName={getZoneName} />
        {/* Required by the illustrations' CC BY-SA 3.0 license (see public/atlas/*.svg,
         *  sourced from Wikimedia Commons — "Muscular system.svg" / "Muscular system-back.svg"
         *  by Termininja) — attribution stays with the image everywhere it's shown, not just
         *  on a separate credits page. */}
        <p className="atlas-credit">
          Illustration:{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Muscular_system.svg" target="_blank" rel="noopener noreferrer">
            Termininja
          </a>
          , licensed under{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.en" target="_blank" rel="noopener noreferrer">
            CC BY-SA 3.0
          </a>
        </p>
      </div>

      <aside className="atlas-content-panel">
        <AtlasContentPanel
          zoneKey={selectedZone}
          hasFullAccess={hasFullAccess}
          isPro={isPro}
          canBuyStudent={canBuyStudent}
          billingEnabled={billingEnabled}
        />
      </aside>
    </div>
  );
}
