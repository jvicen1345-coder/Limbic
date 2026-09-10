"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserAction,
  grantAccessAction,
  revokeAccessAction,
  grantAdminAreaAction,
  revokeAdminAreaAction,
} from "@/app/actions/admin";
import type { GrantArea } from "@/lib/session";
import { ADMIN_AREAS, ADMIN_AREA_LABELS, ADMIN_AREA_DESCRIPTIONS, type AdminArea } from "@/lib/admin-areas";

export interface AccountRow {
  id: string;
  name: string;
  email: string | null;
  licenseEmail: string | null;
  licenseNumber: string | null;
  isGuest: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
  isPro: boolean;
  grantedAccess: GrantArea[];
  /** The behind-the-scenes areas this account has been delegated (see User.adminAreas in
   *  schema.prisma). Always empty for an owner — see isOwnerAdmin below. */
  adminAreas: AdminArea[];
  /** On the FOUNDING_FUNDERS_ADMIN_EMAILS allowlist, so they hold every area regardless of
   *  the column above, and no chip on this page can add to or take from that. */
  isOwnerAdmin: boolean;
  isFoundingFunder: boolean;
  createdAt: string;
  lastVisitedAt: string | null;
}

const GRANT_AREA_LABELS: Record<GrantArea, string> = {
  pro: "Pro",
  limbicStudent: "Student",
  wellnessPlus: "Wellness+",
};

/** One row's "Granted Access" chips — lets an admin comp LimbicPro/LimbicStudent/
 *  LimbicWellness+ for this specific account for free, without it ever touching a Stripe
 *  subscription (see grantAccessAction/revokeAccessAction in app/actions/admin.ts and
 *  User.compedAccess in schema.prisma). Each chip toggles independently: a reader can be
 *  comped into just Wellness+, just Pro, or any combination. */
function GrantedAccessChips({ userId, grantedAccess }: { userId: string; grantedAccess: GrantArea[] }) {
  const [granted, setGranted] = useState(grantedAccess);
  const [pending, setPending] = useState<GrantArea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (area: GrantArea) => {
    setError(null);
    setPending(area);
    const isGranted = granted.includes(area);
    const action = isGranted ? revokeAccessAction : grantAccessAction;
    action(userId, area).then((result) => {
      setPending(null);
      if (result.ok) {
        setGranted((prev) => (isGranted ? prev.filter((a) => a !== area) : [...prev, area]));
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      {(Object.keys(GRANT_AREA_LABELS) as GrantArea[]).map((area) => {
        const active = granted.includes(area);
        return (
          <button
            key={area}
            type="button"
            disabled={pending === area}
            onClick={() => toggle(area)}
            className="btn"
            style={{
              fontSize: "var(--fs-11)",
              padding: "2px 8px",
              borderRadius: 999,
              border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-neutral-300)",
              background: active ? "color-mix(in srgb, var(--color-accent) 16%, transparent)" : "transparent",
              color: active ? "var(--color-accent)" : "var(--color-neutral-700)",
            }}
            title={active ? `Revoke ${GRANT_AREA_LABELS[area]}` : `Grant ${GRANT_AREA_LABELS[area]}`}
          >
            {pending === area ? "…" : GRANT_AREA_LABELS[area]}
          </button>
        );
      })}
      {error && <span style={{ fontSize: "var(--fs-11)", color: "var(--color-danger)" }}>{error}</span>}
    </span>
  );
}

/** One row's Co-Admin cell — a summary plus the toggle that opens the panel below it. Kept
 *  deliberately quiet (a count, not ten chips) because most rows are ordinary readers and
 *  this column would otherwise dominate a table whose job is accounts, not permissions. */
function CoAdminCell({ row, expanded, onToggle }: { row: AccountRow; expanded: boolean; onToggle: () => void }) {
  // An owner's access comes from FOUNDING_FUNDERS_ADMIN_EMAILS, not from a column this page
  // can write, so there is nothing here to toggle — say where it comes from instead.
  if (row.isOwnerAdmin) {
    return (
      <span style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)" }} title="On FOUNDING_FUNDERS_ADMIN_EMAILS — holds every area">
        Full admin
      </span>
    );
  }

  const count = row.adminAreas.length;
  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ fontSize: 12, padding: "2px 8px" }}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {count === 0 ? "None" : `${count} ${count === 1 ? "area" : "areas"}`}
      <span aria-hidden style={{ marginLeft: 6, color: "var(--color-neutral-700)" }}>{expanded ? "\u2303" : "\u2304"}</span>
    </button>
  );
}

/** The expanded Co-Admin panel for one row — every admin area as a toggle, with what the
 *  area actually opens up written under it. Ten chips is too much to live inside a table
 *  cell, so the cell shows a summary and this drops into a full-width row underneath it.
 *
 *  Read-only (`canManage` false) for an Accounts co-admin looking at the same page: they can
 *  see who holds what, which is genuinely useful when working accounts, but only an
 *  allowlist owner can change it (see requireOwnerForTarget in app/actions/admin.ts). The
 *  server refuses either way; this just doesn't dangle a control that would always fail. */
function CoAdminPanel({
  userId,
  areas,
  canManage,
  onChange,
}: {
  userId: string;
  areas: AdminArea[];
  canManage: boolean;
  onChange: (areas: AdminArea[]) => void;
}) {
  const [pending, setPending] = useState<AdminArea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (area: AdminArea) => {
    setError(null);
    setPending(area);
    const granted = areas.includes(area);
    const action = granted ? revokeAdminAreaAction : grantAdminAreaAction;
    action(userId, area).then((result) => {
      setPending(null);
      // Renders from the server's answer rather than from an optimistic guess: this is an
      // access-control list, and it should show what was actually stored.
      if (result.ok && result.areas) onChange(result.areas);
      else setError(result.error ?? "Something went wrong.");
    });
  };

  return (
    // Capped rather than left to fill the cell: this row spans a table that is wider than its
    // scroll container, so a grid sized off the cell put its last column past the right edge
    // where an owner would never scroll to find it.
    <div style={{ padding: "6px 0 10px", maxWidth: 720 }}>
      <div style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginBottom: 8 }}>
        {canManage
          ? "Pick the behind-the-scenes areas this person can open. Everything else stays hidden from them, and revoking an area takes effect on their next page load."
          : "Read-only — only a full admin can change co-admin access."}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px 14px" }}>
        {ADMIN_AREAS.map((area) => {
          const active = areas.includes(area);
          return (
            <div key={area} style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
              <button
                type="button"
                disabled={!canManage || pending === area}
                onClick={() => toggle(area)}
                className="btn"
                style={{
                  fontSize: "var(--fs-11)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  cursor: canManage ? "pointer" : "default",
                  border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-neutral-300)",
                  background: active ? "color-mix(in srgb, var(--color-accent) 16%, transparent)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-neutral-700)",
                }}
                title={
                  canManage
                    ? `${active ? "Revoke" : "Grant"} ${ADMIN_AREA_LABELS[area]}`
                    : ADMIN_AREA_LABELS[area]
                }
              >
                {pending === area ? "\u2026" : ADMIN_AREA_LABELS[area]}
              </button>
              <span style={{ fontSize: "var(--fs-11)", color: "var(--color-neutral-700)", lineHeight: 1.35 }}>
                {ADMIN_AREA_DESCRIPTIONS[area]}
              </span>
            </div>
          );
        })}
      </div>
      {error && (
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-danger)", margin: "8px 0 0" }}>{error}</p>
      )}
    </div>
  );
}

/** One row's Delete button — a two-click confirm ("Delete" then "Confirm?" for a few
 *  seconds) rather than a native confirm() popup, since this deletes one account at a
 *  time and a lighter but still-deliberate confirm is the right amount of friction. */
function DeleteButton({ userId, onDeleted }: { userId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: "4px 10px", color: "var(--color-danger)" }}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
        >
          Delete
        </button>
        {/* Stays visible after a rejected delete (e.g. trying to delete your own row) even
         *  once back in this collapsed state — cleared the moment "Delete" is clicked again. */}
        {error && <span style={{ fontSize: "var(--fs-11-5)", color: "var(--color-danger)" }}>{error}</span>}
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button
        type="button"
        className="btn"
        disabled={pending}
        style={{ fontSize: 12, padding: "4px 10px", background: "var(--color-danger)", color: "#fff", border: "none" }}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteUserAction(userId);
            if (result.ok) {
              onDeleted();
            } else {
              setError(result.error ?? "Something went wrong.");
              setConfirming(false);
            }
          });
        }}
      >
        {pending ? "Deleting…" : "Confirm?"}
      </button>
      <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </span>
  );
}

/** An account can have both (Google first, a password set later via forgot-password, or the
 *  reverse) — shows every method actually on file rather than picking one, since that's the
 *  real answer to "how does this person sign in." */
function signInMethodLabel(row: Pick<AccountRow, "hasGoogle" | "hasPassword">): string {
  const methods = [row.hasGoogle && "Google", row.hasPassword && "Password"].filter(Boolean);
  return methods.length > 0 ? methods.join(", ") : "None";
}

/** /admin/accounts (gated by hasAdminArea("accounts") in that page) — every account, with a delete
 *  button per row. Client component only for that delete interaction; the row data itself
 *  is fetched server-side and passed in once. */
export function AccountsAdminTable({
  rows: initialRows,
  canManageAdmins,
}: {
  rows: AccountRow[];
  /** True only for an allowlist owner (see isSiteAdmin in lib/admin.ts) — everyone else who
   *  can reach this page sees the Co-Admin panel read-only. */
  canManageAdmins: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  // At most one Co-Admin panel open at a time: it is a full-width row of ten labelled
  // toggles, and two of them open at once turns the table into a wall.
  const [expandedCoAdminId, setExpandedCoAdminId] = useState<string | null>(null);
  // Hidden by default — guest accounts are throwaway, unauthenticated sessions (see
  // User.isGuest in schema.prisma) rather than real registrations, so they'd otherwise
  // drown out the accounts an admin is actually here to manage. Still a toggle, not a
  // server-side exclusion, so a guest-account question (e.g. investigating abuse) doesn't
  // need a code change to answer.
  const [showGuests, setShowGuests] = useState(false);
  // Default sort (server order) is newest-created first — good for "who just signed up,"
  // useless for "has anyone used this account recently" on an account that isn't new. This
  // resorts client-side by lastVisitedAt instead, nulls (never visited Home) sinking to the
  // bottom, so reused/shared/older accounts that suddenly saw activity actually surface.
  const [sortByActivity, setSortByActivity] = useState(false);
  const router = useRouter();

  const guestCount = rows.filter((r) => r.isGuest).length;
  const filteredRows = showGuests ? rows : rows.filter((r) => !r.isGuest);
  const visibleRows = sortByActivity
    ? [...filteredRows].sort((a, b) => {
        if (!a.lastVisitedAt && !b.lastVisitedAt) return 0;
        if (!a.lastVisitedAt) return 1;
        if (!b.lastVisitedAt) return -1;
        return new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime();
      })
    : filteredRows;

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No accounts.</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 10 }}>
        {guestCount > 0 && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-neutral-700)" }}>
            <input type="checkbox" checked={showGuests} onChange={(e) => setShowGuests(e.target.checked)} />
            Show {guestCount} guest {guestCount === 1 ? "account" : "accounts"}
          </label>
        )}
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-neutral-700)" }}>
          <input type="checkbox" checked={sortByActivity} onChange={(e) => setSortByActivity(e.target.checked)} />
          Sort by most recently active
        </label>
      </div>
      {visibleRows.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No accounts.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
                <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Sign-in</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Joined</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Last Active</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Guest</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Sign-in Method</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Pro</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Founding Funder</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Granted Access</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Co-Admin</th>
                <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }} />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((u) => (
                <Fragment key={u.id}>
                  <tr style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
                    <td style={{ padding: "6px 10px 6px 0" }}>{u.name}</td>
                    <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)" }}>
                      {u.email ?? u.licenseEmail ?? u.licenseNumber ?? "N/A"}
                    </td>
                    <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                      {u.lastVisitedAt
                        ? new Date(u.lastVisitedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Never"}
                    </td>
                    <td style={{ padding: "6px 10px" }}>{u.isGuest ? "Yes" : ""}</td>
                    <td style={{ padding: "6px 10px" }}>{signInMethodLabel(u)}</td>
                    <td style={{ padding: "6px 10px" }}>{u.isPro ? "Yes" : ""}</td>
                    <td style={{ padding: "6px 10px" }}>{u.isFoundingFunder ? "Yes" : ""}</td>
                    <td style={{ padding: "6px 10px" }}>
                      <GrantedAccessChips userId={u.id} grantedAccess={u.grantedAccess} />
                    </td>
                    <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                      <CoAdminCell
                        row={u}
                        expanded={expandedCoAdminId === u.id}
                        onToggle={() => setExpandedCoAdminId((prev) => (prev === u.id ? null : u.id))}
                      />
                    </td>
                    <td style={{ padding: "6px 0 6px 10px" }}>
                      {/* Same "don't offer a control that can only fail" rule as the Co-Admin
                          panel: deleteUserAction refuses to let a co-admin delete an owner's
                          account (see app/actions/admin.ts), so their row doesn't carry the
                          button. Owners still see it on each other's rows. */}
                      {u.isOwnerAdmin && !canManageAdmins ? (
                        <span style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)" }}>—</span>
                      ) : (
                        <DeleteButton
                          userId={u.id}
                          onDeleted={() => {
                            setRows((prev) => prev.filter((r) => r.id !== u.id));
                            router.refresh();
                          }}
                        />
                      )}
                    </td>
                  </tr>
                  {expandedCoAdminId === u.id && !u.isOwnerAdmin && (
                    <tr>
                      <td colSpan={11} style={{ padding: "0 10px 0 0" }}>
                        <CoAdminPanel
                          userId={u.id}
                          areas={u.adminAreas}
                          canManage={canManageAdmins}
                          onChange={(areas) =>
                            setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, adminAreas: areas } : r)))
                          }
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
