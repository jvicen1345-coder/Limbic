"use client";

import { Fragment, useMemo, useState } from "react";
import { upsertOutreachRecord, type OutreachRow } from "@/app/actions/dpt-programs";

const STATUS_OPTIONS = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "in_discussion", label: "In Discussion" },
  { value: "agreement", label: "Agreement" },
  { value: "not_interested", label: "Not Interested" },
] as const;

const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));
// Not Contacted first, then Contacted, In Discussion, Agreement, Not Interested last — same
// order as STATUS_OPTIONS above, so the dropdown and the table's default sort never disagree.
const STATUS_RANK: Record<string, number> = Object.fromEntries(STATUS_OPTIONS.map((o, i) => [o.value, i]));

function statusOf(row: OutreachRow): string {
  return row.outreach?.status ?? "not_contacted";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateIso(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function displayOrNotPublished(value: string | number | null): string {
  return value === null || value === "" ? "Not published" : String(value);
}

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function UpdateForm({
  row,
  onSaved,
  onCancel,
}: {
  row: OutreachRow;
  onSaved: (patch: { status: string; contactName: string | null; contactEmail: string | null; notes: string | null; lastContactedAt: string | null }) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState(statusOf(row));
  const [contactName, setContactName] = useState(row.outreach?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(row.outreach?.contactEmail ?? "");
  const [notes, setNotes] = useState(row.outreach?.notes ?? "");
  const [lastContactedAt, setLastContactedAt] = useState(row.outreach?.lastContactedAt ? dateIso(row.outreach.lastContactedAt) : todayIso());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setPending(true);
    setError(null);
    upsertOutreachRecord(row.program.id, { status, contactName, contactEmail, notes, lastContactedAt }).then((result) => {
      setPending(false);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onSaved({
        status,
        contactName: contactName.trim() || null,
        contactEmail: contactEmail.trim() || null,
        notes: notes.trim() || null,
        lastContactedAt: lastContactedAt || null,
      });
    });
  }

  return (
    <div className="outreach-update-form">
      <div className="programs-form-grid">
        <div className="field">
          <label htmlFor={`status-${row.program.id}`}>Status</label>
          <select id={`status-${row.program.id}`} className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`contact-name-${row.program.id}`}>Contact Name</label>
          <input id={`contact-name-${row.program.id}`} className="input" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`contact-email-${row.program.id}`}>Contact Email</label>
          <input id={`contact-email-${row.program.id}`} className="input" type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`last-contacted-${row.program.id}`}>Last Contacted</label>
          <input
            id={`last-contacted-${row.program.id}`}
            className="input"
            type="date"
            value={lastContactedAt}
            onChange={(e) => setLastContactedAt(e.target.value)}
          />
        </div>
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label htmlFor={`notes-${row.program.id}`}>Notes</label>
        <textarea id={`notes-${row.program.id}`} className="input" style={{ minHeight: 70 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && <p className="syllabi-error">{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" className="btn btn-secondary" disabled={pending} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** /admin/programs (gated by isSiteAdmin() in that page) — outreach tracking over the same
 *  235 seeded DPTProgram rows the public directory reads (see app/actions/dpt-programs.ts
 *  getOutreachRecords/upsertOutreachRecord). A program with no InstitutionalOutreach row yet
 *  just reads as status "not_contacted" throughout (see statusOf above) rather than needing
 *  a seeded row per program. */
export function InstitutionalTargetsTable({
  rows: initialRows,
  states,
  regions,
}: {
  rows: OutreachRow[];
  states: { stateCode: string; stateName: string }[];
  regions: string[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = rows.length;
    const contacted = rows.filter((r) => statusOf(r) !== "not_contacted").length;
    const inDiscussion = rows.filter((r) => statusOf(r) === "in_discussion").length;
    const agreements = rows.filter((r) => statusOf(r) === "agreement").length;
    return { total, contacted, inDiscussion, agreements };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.program.institution.toLowerCase().includes(q));
    if (statusFilter) list = list.filter((r) => statusOf(r) === statusFilter);
    if (regionFilter) list = list.filter((r) => r.program.region === regionFilter);
    if (stateFilter) list = list.filter((r) => r.program.stateCode === stateFilter);
    return [...list].sort((a, b) => STATUS_RANK[statusOf(a)] - STATUS_RANK[statusOf(b)] || a.program.institution.localeCompare(b.program.institution));
  }, [rows, search, statusFilter, regionFilter, stateFilter]);

  function handleSaved(
    programId: number,
    patch: { status: string; contactName: string | null; contactEmail: string | null; notes: string | null; lastContactedAt: string | null }
  ) {
    setRows((prev) =>
      prev.map((r) =>
        r.program.id === programId
          ? {
              ...r,
              outreach: {
                id: r.outreach?.id ?? "",
                programId,
                status: patch.status,
                contactName: patch.contactName,
                contactEmail: patch.contactEmail,
                notes: patch.notes,
                lastContactedAt: patch.lastContactedAt ? new Date(`${patch.lastContactedAt}T00:00:00`) : null,
                createdAt: r.outreach?.createdAt ?? new Date(),
                updatedAt: new Date(),
              },
            }
          : r
      )
    );
    setExpandedId(null);
  }

  function handleExportCsv() {
    const header = ["Institution", "State", "Status", "Contact Name", "Contact Email", "Last Contacted"];
    const lines = [header.map(csvField).join(",")];
    for (const r of filtered) {
      lines.push(
        [
          r.program.institution,
          r.program.stateName,
          STATUS_LABEL[statusOf(r)],
          r.outreach?.contactName ?? "",
          r.outreach?.contactEmail ?? "",
          dateIso(r.outreach?.lastContactedAt),
        ]
          .map(csvField)
          .join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "institutional-targets.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="outreach-stats-bar">
        <div className="outreach-stat-tile">
          <span className="outreach-stat-value">{stats.total}</span>
          <span className="outreach-stat-label">Total Programs</span>
        </div>
        <div className="outreach-stat-tile">
          <span className="outreach-stat-value">{stats.contacted}</span>
          <span className="outreach-stat-label">Contacted</span>
        </div>
        <div className="outreach-stat-tile">
          <span className="outreach-stat-value">{stats.inDiscussion}</span>
          <span className="outreach-stat-label">In Discussion</span>
        </div>
        <div className="outreach-stat-tile">
          <span className="outreach-stat-value">{stats.agreements}</span>
          <span className="outreach-stat-label">Agreements</span>
        </div>
      </div>

      <div className="outreach-filter-bar">
        <input
          type="text"
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Search by institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 180 }} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 180 }} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s.stateCode} value={s.stateCode}>
              {s.stateName}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-secondary" style={{ marginLeft: "auto" }} onClick={handleExportCsv}>
          Export CSV
        </button>
      </div>

      <div className="programs-table-wrap">
        <table className="programs-table outreach-table">
          <thead>
            <tr>
              <th>Institution</th>
              <th>State</th>
              <th>Calendar Type</th>
              <th>Clinical Weeks</th>
              <th>Accredited Since</th>
              <th>Status</th>
              <th>Last Contacted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const status = statusOf(r);
              const expanded = expandedId === r.program.id;
              return (
                <Fragment key={r.program.id}>
                  <tr>
                    <td>{r.program.institution}</td>
                    <td>{r.program.stateName}</td>
                    <td>{displayOrNotPublished(r.program.calendarType)}</td>
                    <td>{displayOrNotPublished(r.program.clinicalWeeksRaw)}</td>
                    <td>{displayOrNotPublished(r.program.accreditedSince)}</td>
                    <td>
                      <span className={`outreach-pill outreach-pill--${status}`}>{STATUS_LABEL[status]}</span>
                    </td>
                    <td>{dateIso(r.outreach?.lastContactedAt) || "—"}</td>
                    <td>
                      <button type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => setExpandedId(expanded ? null : r.program.id)}>
                        {expanded ? "Close" : "Update"}
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={8}>
                        <UpdateForm row={r} onSaved={(patch) => handleSaved(r.program.id, patch)} onCancel={() => setExpandedId(null)} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="atrium-dashboard-empty">No programs match your filters.</p>}
    </div>
  );
}
