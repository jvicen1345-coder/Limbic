"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toolboxMatches, toolboxTerms, type ToolboxGroup, type ToolboxIcon } from "@/lib/clinician-toolbox";
import {
  ActivityIcon,
  BandageIcon,
  BodyIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DumbbellIcon,
  FileTextIcon,
  GridIcon,
  LayoutDashboardIcon,
  ListIcon,
  LockIcon,
  NetworkIcon,
  SearchIcon,
  UsersIcon,
  ZapIcon,
  XIcon,
} from "@/components/icons";

/** The body of the Clinical Toolbox (see app/(app)/pro/toolbox/page.tsx) — the grid, plus the
 *  filter row above it.
 *
 *  A client component only because of that filter row; the page itself stays a server
 *  component and hands the already-filtered groups down, so nothing about who can see which
 *  tool is decided here.
 *
 *  The tour anchors live on the elements below (see lib/tours.ts). Filtering unmounts a group
 *  that does not match, which would leave a tour step pointing at nothing — but a tour step
 *  navigates to /pro/toolbox, which mounts this fresh with no filter applied, so the anchors
 *  are always present by the time a step looks for them. */

/** Typed Record, so a new ToolboxIcon key cannot be added to the data without a drawing. */
const ICONS: Record<ToolboxIcon, (props: { size?: number }) => React.ReactElement> = {
  dashboard: LayoutDashboardIcon,
  force: ZapIcon,
  agent: NetworkIcon,
  team: UsersIcon,
  report: FileTextIcon,
  tests: ListIcon,
  screening: CheckCircleIcon,
  outcomes: ActivityIcon,
  exercise: BandageIcon,
  movement: DumbbellIcon,
  reference: GridIcon,
  guidelines: BookmarkIcon,
  documents: FileTextIcon,
  pathologies: BodyIcon,
  ce: CalendarIcon,
};

const ALL = "__all__";

export function ToolboxBrowser({ groups, isPro }: { groups: ToolboxGroup[]; isPro: boolean }) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>(ALL);

  const total = useMemo(() => groups.reduce((n, g) => n + g.tools.length, 0), [groups]);

  /* Matching lives in lib/clinician-toolbox.ts so it can be asserted on its own — see
     toolboxMatches for why a term has to land at the start of a word rather than anywhere. */
  const visible = useMemo(() => {
    const terms = toolboxTerms(query);
    return groups
      .filter((g) => activeGroup === ALL || g.title === activeGroup)
      .map((g) => ({ ...g, tools: g.tools.filter((t) => toolboxMatches(t, g.title, terms)) }))
      .filter((g) => g.tools.length > 0);
  }, [groups, query, activeGroup]);

  const shown = visible.reduce((n, g) => n + g.tools.length, 0);
  const filtering = query.trim().length > 0 || activeGroup !== ALL;

  return (
    <>
      <div className="toolbox-bar">
        <div className="toolbox-search">
          <SearchIcon size={14} />
          <input
            type="search"
            className="toolbox-search-input"
            placeholder="Filter tools"
            aria-label="Filter tools by name, description or group"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="toolbox-search-clear" aria-label="Clear filter" onClick={() => setQuery("")}>
              <XIcon size={13} />
            </button>
          )}
        </div>
        <div className="toolbox-chips">
          <button
            type="button"
            className={`toolbox-chip${activeGroup === ALL ? " toolbox-chip--on" : ""}`}
            aria-pressed={activeGroup === ALL}
            onClick={() => setActiveGroup(ALL)}
          >
            All <span className="toolbox-chip-n">{total}</span>
          </button>
          {groups.map((g) => (
            <button
              key={g.title}
              type="button"
              className={`toolbox-chip${activeGroup === g.title ? " toolbox-chip--on" : ""}`}
              aria-pressed={activeGroup === g.title}
              onClick={() => setActiveGroup(activeGroup === g.title ? ALL : g.title)}
            >
              {g.title} <span className="toolbox-chip-n">{g.tools.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Per-group tour anchors (see lib/tours.ts), keyed off each group's own title rather
          than its position, so reordering or adding a group cannot silently point a tour
          step at the wrong one. A step pointing at this whole stack was removed: it is
          taller than any viewport, which is not something a highlight ring can show. */}
      <div>
        {visible.map((group) => (
          <section
            className="toolbox-group"
            key={group.title}
            data-tour={`toolbox-group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          >
            <div className="toolbox-group-head">
              <h2 className="toolbox-group-title">{group.title}</h2>
              <p className="toolbox-group-blurb">{group.blurb}</p>
            </div>
            <div className="pro-tools-grid">
              {group.tools.map((tool) => {
                const locked = Boolean(tool.pro) && !isPro;
                const Icon = ICONS[tool.icon];
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`pro-tool-card${locked ? " pro-tool-card--locked" : ""}`}
                  >
                    <div className="toolbox-card-head">
                      <span className="toolbox-card-icon">
                        <Icon size={15} />
                      </span>
                      <span className="pro-tool-card-title">{tool.name}</span>
                      {locked && (
                        <span className="toolbox-lock">
                          <LockIcon size={11} />
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="pro-tool-card-desc">{tool.description}</p>
                    <div className="pro-tool-card-footer">
                      <span className="pro-tool-card-arrow">
                        {locked ? "See what it does" : "Open"}
                        <ChevronRightIcon size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {shown === 0 && (
        <p className="toolbox-empty">
          Nothing matches &ldquo;{query.trim()}&rdquo;.{" "}
          <button type="button" className="toolbox-empty-reset" onClick={() => { setQuery(""); setActiveGroup(ALL); }}>
            Show all {total} tools
          </button>
        </p>
      )}

      {filtering && shown > 0 && (
        <p className="toolbox-result-note">
          Showing {shown} of {total}.{" "}
          <button type="button" className="toolbox-empty-reset" onClick={() => { setQuery(""); setActiveGroup(ALL); }}>
            Show all
          </button>
        </p>
      )}
    </>
  );
}
