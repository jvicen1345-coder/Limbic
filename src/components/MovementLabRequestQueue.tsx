"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markMovementLabRequestAdded, declineMovementLabRequest } from "@/app/actions/movement-lab-requests";

/** What the bank currently holds for a request, worked out server-side against the static
 *  catalog (see findMatch in app/(app)/admin/movement-lab-requests/page.tsx). */
export interface RequestMatch {
  /** Doubles as the deep-link hash on /movement-lab, where each card renders id={ex.id}. */
  id: string;
  name: string;
  region: string;
  /** The query matched this exercise's name or alias, rather than merely something it treats. */
  confident: boolean;
  /** The next couple of hits, shown only when the top one is not confident. */
  alsoSee: string[];
}

export interface PendingMovementLabRequestRow {
  id: string;
  accountName: string;
  name: string;
  region: string | null;
  note: string | null;
  /** ISO string, not a Date — this is a client component. */
  createdAt: string;
  /** null when nothing in the bank matches the requested name at all. */
  match: RequestMatch | null;
}

/**
 * The "is it in yet?" cell — the whole point of which is that an admin can mark a row added
 * without leaving the page to search for it.
 *
 * Three states, deliberately distinct rather than one badge with a colour: a confident match
 * names the exercise and links to it, a weak match is offered as candidates to eyeball rather
 * than presented as an answer, and no match at all says so plainly, since "still missing" is
 * as useful to an admin working through the queue as "already there".
 */
function MatchCell({ match, requestedRegion }: { match: RequestMatch | null; requestedRegion: string | null }) {
  if (!match) {
    return <span style={{ color: "var(--color-neutral-600)" }}>Not in the Lab yet</span>;
  }

  if (!match.confident) {
    const names = [match.name, ...match.alsoSee];
    return (
      <span style={{ color: "var(--color-neutral-700)" }}>
        Possibly: {names.join(", ")}
      </span>
    );
  }

  const movedRegion = requestedRegion && requestedRegion !== match.region;
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
      <span aria-hidden="true" style={{ color: "var(--color-success)", fontWeight: 700 }}>
        ✓
      </span>
      <a href={`/movement-lab#${match.id}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
        {match.name}
      </a>
      {movedRegion && <span style={{ color: "var(--color-neutral-600)" }}>in {match.region}</span>}
    </span>
  );
}

/** Admin-only Mark Added/Decline queue (see app/(app)/admin/movement-lab-requests/page.tsx,
 *  which gates on isSiteAdmin() before this ever renders) — same shape as
 *  LicenseVerificationQueue.tsx. "Mark Added" doesn't write anything into Movement Lab
 *  itself (a static TS catalog, not a database table) — it just records that an admin has
 *  since added the exercise to the appropriate region file by hand. */
export function MovementLabRequestQueue({ rows }: { rows: PendingMovementLabRequestRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleAdded = (id: string) => {
    startTransition(async () => {
      await markMovementLabRequestAdded(id);
      router.refresh();
    });
  };

  const handleDecline = (id: string) => {
    startTransition(async () => {
      await declineMovementLabRequest(id);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No pending exercise requests.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
            <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Requested by</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Exercise</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Region</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Note</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>In Movement Lab</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Requested</th>
            <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
              <td style={{ padding: "8px 10px 8px 0" }}>{r.accountName}</td>
              <td style={{ padding: "8px 10px", fontWeight: 600 }}>{r.name}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{r.region ?? "—"}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", maxWidth: 280 }}>{r.note ?? "—"}</td>
              <td style={{ padding: "8px 10px", maxWidth: 260 }}>
                <MatchCell match={r.match} requestedRegion={r.region} />
              </td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td style={{ padding: "8px 0 8px 10px", whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={pending}
                    onClick={() => handleAdded(r.id)}
                    title={r.match?.confident ? `${r.match.name} is already in Movement Lab` : undefined}
                  >
                    Mark Added
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => handleDecline(r.id)}>
                    Decline
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
