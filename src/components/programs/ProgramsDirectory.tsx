"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { setUserProgram } from "@/app/actions/dpt-programs";
import { ExternalLinkIcon, CheckIcon } from "@/components/icons";

export interface ProgramListItem {
  id: number;
  stateCode: string;
  stateName: string;
  region: string;
  institution: string;
  calendarType: string | null;
  programLength: string | null;
  startTerm: string | null;
  totalCreditsRaw: string | null;
  creditsMin: number | null;
  creditsMax: number | null;
  clinicalWeeksRaw: string | null;
  clinicalWeeksMin: number | null;
  clinicalWeeksMax: number | null;
  accreditedSince: number | null;
  notes: string | null;
  sourceDomain: string | null;
}

type SortField = "institution" | "stateCode" | "calendarType" | "creditsMin" | "clinicalWeeksMin" | "accreditedSince";
type SortDir = "asc" | "desc";

const SORT_SELECT_OPTIONS: { value: string; label: string; field: SortField; dir: SortDir }[] = [
  { value: "institution-asc", label: "Institution A-Z", field: "institution", dir: "asc" },
  { value: "institution-desc", label: "Institution Z-A", field: "institution", dir: "desc" },
  { value: "clinicalWeeksMin-desc", label: "Clinical Weeks High-Low", field: "clinicalWeeksMin", dir: "desc" },
  { value: "clinicalWeeksMin-asc", label: "Clinical Weeks Low-High", field: "clinicalWeeksMin", dir: "asc" },
  { value: "creditsMin-desc", label: "Credits High-Low", field: "creditsMin", dir: "desc" },
  { value: "creditsMin-asc", label: "Credits Low-High", field: "creditsMin", dir: "asc" },
  { value: "accreditedSince-asc", label: "Accredited Since Oldest", field: "accreditedSince", dir: "asc" },
  { value: "accreditedSince-desc", label: "Accredited Since Newest", field: "accreditedSince", dir: "desc" },
];

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "institution", label: "Institution" },
  { field: "stateCode", label: "State" },
  { field: "calendarType", label: "Calendar" },
  { field: "creditsMin", label: "Total Credits" },
  { field: "clinicalWeeksMin", label: "Clinical Weeks" },
  { field: "accreditedSince", label: "Accredited Since" },
];

function displayOrNotPublished(value: string | number | null): string {
  return value === null || value === "" ? "Not published" : String(value);
}

function isProbationary(notes: string | null): boolean {
  return Boolean(notes && notes.toLowerCase().includes("probationary"));
}

function compareNullable(a: number | null, b: number | null, dir: SortDir): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir === "asc" ? a - b : b - a;
}

function sortPrograms(programs: ProgramListItem[], field: SortField, dir: SortDir): ProgramListItem[] {
  return [...programs].sort((a, b) => {
    switch (field) {
      case "creditsMin":
        return compareNullable(a.creditsMin, b.creditsMin, dir);
      case "clinicalWeeksMin":
        return compareNullable(a.clinicalWeeksMin, b.clinicalWeeksMin, dir);
      case "accreditedSince":
        return compareNullable(a.accreditedSince, b.accreditedSince, dir);
      case "stateCode": {
        const cmp = a.stateName.localeCompare(b.stateName);
        return dir === "asc" ? cmp : -cmp;
      }
      case "calendarType": {
        const av = a.calendarType ?? "";
        const bv = b.calendarType ?? "";
        if (av === "" && bv === "") return 0;
        if (av === "") return 1;
        if (bv === "") return -1;
        const cmp = av.localeCompare(bv);
        return dir === "asc" ? cmp : -cmp;
      }
      case "institution":
      default: {
        const cmp = a.institution.localeCompare(b.institution);
        return dir === "asc" ? cmp : -cmp;
      }
    }
  });
}

function ProgramDetail({
  program,
  canSelectProgram,
  isSelected,
  onSelect,
  selecting,
}: {
  program: ProgramListItem;
  canSelectProgram: boolean;
  isSelected: boolean;
  onSelect: () => void;
  selecting: boolean;
}) {
  return (
    <div className="programs-detail">
      <p className="programs-detail-institution">{program.institution}</p>
      <div className="programs-detail-pills">
        <span className="programs-pill">{program.stateName}</span>
        <span className="programs-pill">{program.region}</span>
        {isProbationary(program.notes) && <span className="programs-pill programs-pill--warn">CAPTE Probationary</span>}
      </div>

      <div className="programs-detail-fields">
        <div className="programs-detail-field">
          <span className="programs-detail-label">Calendar Type</span>
          <span>{displayOrNotPublished(program.calendarType)}</span>
        </div>
        <div className="programs-detail-field">
          <span className="programs-detail-label">Program Length</span>
          <span>{displayOrNotPublished(program.programLength)}</span>
        </div>
        <div className="programs-detail-field">
          <span className="programs-detail-label">Start Term</span>
          <span>{displayOrNotPublished(program.startTerm)}</span>
        </div>
        <div className="programs-detail-field">
          <span className="programs-detail-label">Total Credits</span>
          <span>{displayOrNotPublished(program.totalCreditsRaw)}</span>
        </div>
        <div className="programs-detail-field">
          <span className="programs-detail-label">Clinical Weeks</span>
          <span>{displayOrNotPublished(program.clinicalWeeksRaw)}</span>
        </div>
        <div className="programs-detail-field">
          <span className="programs-detail-label">Accredited Since</span>
          <span>{displayOrNotPublished(program.accreditedSince)}</span>
        </div>
      </div>

      {program.notes && <p className="programs-detail-notes">{program.notes}</p>}

      <div className="programs-detail-footer">
        {program.sourceDomain && (
          <a className="programs-detail-source" href={`https://${program.sourceDomain}`} target="_blank" rel="noopener noreferrer">
            Source: {program.sourceDomain}
          </a>
        )}
        <a className="programs-detail-ptcas" href="https://directory.ptcas.org" target="_blank" rel="noopener noreferrer">
          Find on PTCAS <ExternalLinkIcon size={12} />
        </a>
        {canSelectProgram &&
          (isSelected ? (
            <span className="programs-your-program-badge">
              <CheckIcon size={13} /> Your Program
            </span>
          ) : (
            <button type="button" className="btn btn-primary" style={{ fontSize: 12.5, padding: "6px 14px" }} onClick={onSelect} disabled={selecting}>
              {selecting ? "Saving…" : "Select This Program"}
            </button>
          ))}
      </div>
    </div>
  );
}

/** Search/filter/sort table for all 235 seeded DPTProgram rows — search is debounced and
 *  entirely client-side (see the effect below), since the whole dataset (loaded once by the
 *  server page) is small enough that filtering it in the browser is both correct and
 *  instant; getAllPrograms's own searchQuery/sortBy params exist for other callers, not this
 *  page. */
export function ProgramsDirectory({
  programs,
  states,
  regions,
  calendarTypes,
  canSelectProgram,
  currentProgramId,
}: {
  programs: ProgramListItem[];
  states: { stateCode: string; stateName: string }[];
  regions: string[];
  calendarTypes: string[];
  canSelectProgram: boolean;
  currentProgramId: number | null;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [region, setRegion] = useState("");
  const [calendarType, setCalendarType] = useState("");
  const [sortField, setSortField] = useState<SortField>("institution");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(currentProgramId);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const filtered = useMemo(() => {
    let rows = programs;
    if (stateCode) rows = rows.filter((p) => p.stateCode === stateCode);
    if (region) rows = rows.filter((p) => p.region === region);
    if (calendarType) rows = rows.filter((p) => p.calendarType === calendarType);
    const q = debouncedSearch.trim().toLowerCase();
    if (q) rows = rows.filter((p) => p.institution.toLowerCase().includes(q) || p.stateName.toLowerCase().includes(q));
    return sortPrograms(rows, sortField, sortDir);
  }, [programs, stateCode, region, calendarType, debouncedSearch, sortField, sortDir]);

  function handleHeaderSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleSelectProgram(programId: number) {
    setSelectingId(programId);
    setUserProgram(programId).then((result) => {
      setSelectingId(null);
      if (!("error" in result)) setSelectedProgramId(programId);
    });
  }

  const selectValue = SORT_SELECT_OPTIONS.find((o) => o.field === sortField && o.dir === sortDir)?.value ?? "institution-asc";

  const filterSelects = (idPrefix: string) => (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-state`}>State</label>
        <select id={`${idPrefix}-state`} className="input" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s.stateCode} value={s.stateCode}>
              {s.stateName}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-region`}>Region</label>
        <select id={`${idPrefix}-region`} className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-calendar`}>Calendar Type</label>
        <select id={`${idPrefix}-calendar`} className="input" value={calendarType} onChange={(e) => setCalendarType(e.target.value)}>
          <option value="">All Calendar Types</option>
          {calendarTypes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-sort`}>Sort by</label>
        <select
          id={`${idPrefix}-sort`}
          className="input"
          value={selectValue}
          onChange={(e) => {
            const opt = SORT_SELECT_OPTIONS.find((o) => o.value === e.target.value);
            if (opt) {
              setSortField(opt.field);
              setSortDir(opt.dir);
            }
          }}
        >
          {SORT_SELECT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <div>
      <div className="programs-filter-bar">
        <input
          type="text"
          className="input programs-search-input"
          placeholder="Search by school name or state..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="programs-filter-selects">{filterSelects("desktop")}</div>
        <button type="button" className="btn btn-secondary programs-filter-mobile-btn" onClick={() => setDrawerOpen(true)}>
          Filter
        </button>
      </div>

      <p className="programs-results-count">
        Showing {filtered.length} program{filtered.length === 1 ? "" : "s"}
      </p>

      {drawerOpen && (
        <div className="programs-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="programs-drawer" onClick={(e) => e.stopPropagation()}>
            <p className="programs-drawer-title">Filter Programs</p>
            {filterSelects("mobile")}
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={() => setDrawerOpen(false)}>
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="programs-table-wrap">
        <table className="programs-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.field}>
                  <button type="button" className="programs-th-sort" onClick={() => handleHeaderSort(col.field)}>
                    {col.label}
                    {sortField === col.field && <span className="programs-sort-arrow">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                </th>
              ))}
              <th>Program Length</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const expanded = expandedId === p.id;
              return (
                <Fragment key={p.id}>
                  <tr
                    className="programs-table-row"
                    onClick={() => setExpandedId(expanded ? null : p.id)}
                  >
                    <td>
                      <span className="programs-institution-cell">
                        {p.institution}
                        <span className="programs-state-pill-inline">{p.stateCode}</span>
                        {isProbationary(p.notes) && <span className="programs-pill programs-pill--warn programs-pill--tiny">CAPTE Probationary</span>}
                      </span>
                    </td>
                    <td>{p.stateName}</td>
                    <td>{displayOrNotPublished(p.calendarType)}</td>
                    <td>{displayOrNotPublished(p.totalCreditsRaw)}</td>
                    <td>{displayOrNotPublished(p.clinicalWeeksRaw)}</td>
                    <td>{displayOrNotPublished(p.accreditedSince)}</td>
                    <td>{displayOrNotPublished(p.programLength)}</td>
                  </tr>
                  {expanded && (
                    <tr className="programs-detail-row">
                      <td colSpan={7}>
                        <ProgramDetail
                          program={p}
                          canSelectProgram={canSelectProgram}
                          isSelected={selectedProgramId === p.id}
                          selecting={selectingId === p.id}
                          onSelect={() => handleSelectProgram(p.id)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="programs-card-list">
        {filtered.map((p) => {
          const expanded = expandedId === p.id;
          return (
            <div key={p.id} className="programs-card">
              <button type="button" className="programs-card-summary" onClick={() => setExpandedId(expanded ? null : p.id)}>
                <span className="programs-card-institution">
                  {p.institution}
                  {isProbationary(p.notes) && <span className="programs-pill programs-pill--warn programs-pill--tiny">CAPTE Probationary</span>}
                </span>
                <span className="programs-card-meta">
                  {p.stateName} · {displayOrNotPublished(p.calendarType)} · {displayOrNotPublished(p.clinicalWeeksRaw)}
                </span>
              </button>
              {expanded && (
                <ProgramDetail
                  program={p}
                  canSelectProgram={canSelectProgram}
                  isSelected={selectedProgramId === p.id}
                  selecting={selectingId === p.id}
                  onSelect={() => handleSelectProgram(p.id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="atrium-dashboard-empty">No programs match your filters.</p>}

      {canSelectProgram === false && (
        <p className="programs-signin-hint">
          <Link href="/sign-in">Sign in as a PT Student</Link> to select your program and personalize your Atrium.
        </p>
      )}
    </div>
  );
}
