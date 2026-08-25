"use client";

import { useState } from "react";
import Link from "next/link";
import { AtlasBodyMap } from "./AtlasBodyMap";
import { ATLAS_CONTENT } from "@/lib/atlas-content";
import { ANTERIOR_GROUPS, POSTERIOR_GROUPS, type AtlasRegionGroup } from "@/lib/atlas-regions";
import { ChevronRightIcon, LockIcon } from "@/components/icons";

type View = "anterior" | "posterior";

function getZoneName(zoneKey: string): string {
  return ATLAS_CONTENT[zoneKey]?.name ?? zoneKey;
}

function RegionNav({
  groups,
  selectedZone,
  onSelectZone,
}: {
  groups: AtlasRegionGroup[];
  selectedZone: string | null;
  onSelectZone: (zoneKey: string) => void;
}) {
  return (
    <nav className="atlas-region-nav" aria-label="Body regions">
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
    </nav>
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

/** The right-hand clinical panel. Free readers get the zone name and the first key muscle
 *  only (see `hasFullAccess` below) — everything past that renders normally but sits behind
 *  a blurred, non-interactive wrapper with a centered upgrade card on top, same recipe as
 *  the Wellness+ paywall on app/(app)/wellness/nutrition/page.tsx (.nutrition-paywall*),
 *  just under Atlas's own class names. */
function AtlasContentPanel({ zoneKey, hasFullAccess }: { zoneKey: string | null; hasFullAccess: boolean }) {
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
        <section className="atlas-panel-section">
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
        <section className="atlas-panel-section">
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
        <section className="atlas-panel-section">
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
        <section className="atlas-panel-section">
          <div className="card-kicker">Board Pearls</div>
          <ul className="atlas-pearls-list">
            {zone.boardPearls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );

  return (
    <div key={zoneKey} className="atlas-panel">
      <h2 className="atlas-panel-title">{zone.name}</h2>

      {firstMuscle && (
        <section className="atlas-panel-section">
          <div className="card-kicker">Key Muscles</div>
          <MuscleEntry muscle={firstMuscle} />
        </section>
      )}

      {hasFullAccess ? (
        rest
      ) : (
        <div className="atlas-paywall">
          <div className="atlas-paywall-content">{rest}</div>
          <div className="atlas-paywall-overlay">
            <div className="atlas-paywall-card">
              <LockIcon size={20} />
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, marginTop: 6 }}>Unlock the full clinical picture</div>
              <p>
                Upgrade to Limbic Student or LimbicPRO to access full clinical content — muscles, conditions, special
                tests, outcome measures, and board pearls.
              </p>
              <Link href="/profile?tab=membership" className="btn btn-primary">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AtlasClient({ hasFullAccess }: { hasFullAccess: boolean }) {
  const [view, setView] = useState<View>("anterior");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const groups = view === "anterior" ? ANTERIOR_GROUPS : POSTERIOR_GROUPS;

  function switchView(next: View) {
    setView(next);
    // Switching front/back deselects the current zone and clears the right panel — the two
    // views' zones only share content by naming coincidence at best (most don't overlap at
    // all), so keeping a selection across the switch would either point at a zone that no
    // longer exists on the new view or silently swap to an unrelated one.
    setSelectedZone(null);
  }

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

      <RegionNav groups={groups} selectedZone={selectedZone} onSelectZone={setSelectedZone} />

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
        <AtlasBodyMap view={view} selectedZone={selectedZone} onSelectZone={setSelectedZone} getZoneName={getZoneName} />
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
        <AtlasContentPanel zoneKey={selectedZone} hasFullAccess={hasFullAccess} />
      </aside>
    </div>
  );
}
