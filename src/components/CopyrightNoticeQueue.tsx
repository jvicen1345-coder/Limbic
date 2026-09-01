"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  recordCopyrightNoticeAction,
  removeReportedContentAction,
  rejectCopyrightNoticeAction,
  reinstateContentAction,
  suspendUserAction,
  unsuspendUserAction,
} from "@/app/actions/copyright";
import { NOTICE_STATUS_LABELS, type NoticeStatus } from "@/lib/copyright";

export interface NoticeRow {
  id: string;
  /** ISO strings, not Dates — this is a client component. */
  receivedAt: string;
  complainantName: string;
  complainantEmail: string;
  workDescription: string;
  targetType: string;
  targetId: string;
  status: string;
  actionedAt: string | null;
  notes: string | null;
  authorId: string;
  authorName: string;
  /** Null when the reported content no longer exists — its author may have deleted it
   *  after the notice arrived. The notice still has to be resolvable in that case. */
  contentPreview: string | null;
  contentRemoved: boolean | null;
}

export interface InfringerRow {
  userId: string;
  name: string;
  email: string | null;
  strikes: number;
  suspendedAt: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  received: "var(--color-neutral-700)",
  removed: "var(--color-danger, #9E2B25)",
  rejected: "var(--color-neutral-700)",
  reinstated: "var(--color-success, #24614F)",
};

function statusLabel(status: string): string {
  return NOTICE_STATUS_LABELS[status as NoticeStatus] ?? status;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Admin-only DMCA queue (see app/(app)/admin/copyright/page.tsx, which gates on
 * isSiteAdmin() before this ever renders). Three panels: record an incoming notice, work
 * the notices already on file, and review accounts with upheld takedowns against them.
 *
 * Recording and acting are deliberately separate — logging a notice takes nothing down,
 * because whether a notice is valid is a judgment rather than a form submission, and a
 * facially defective one has to be recordable without ever costing a reader their content
 * or a strike.
 */
export function CopyrightNoticeQueue({
  rows,
  infringers,
  strikeThreshold,
}: {
  rows: NoticeRow[];
  infringers: InfringerRow[];
  strikeThreshold: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  };

  const handleRecord = (formData: FormData) => {
    run(async () => {
      const result = await recordCopyrightNoticeAction({
        complainantName: String(formData.get("complainantName") ?? ""),
        complainantEmail: String(formData.get("complainantEmail") ?? ""),
        workDescription: String(formData.get("workDescription") ?? ""),
        targetType: String(formData.get("targetType") ?? "post"),
        targetId: String(formData.get("targetId") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });
      return result;
    });
  };

  // Prompt-based rather than inline forms: rejecting, reinstating and suspending all
  // require a written reason (the actions refuse without one), but they're rare enough
  // that a per-row textarea would be more clutter than the flow is worth.
  const promptThen = (message: string, fn: (reason: string) => Promise<{ ok: boolean; error?: string }>) => {
    const reason = window.prompt(message);
    if (reason === null) return;
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    run(() => fn(reason));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {error && (
        <div className="card elev-sm" style={{ borderLeft: "3px solid var(--color-danger, #9E2B25)" }}>
          <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
        </div>
      )}

      <div className="card elev-sm">
        <div className="card-kicker">Record a notice</div>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "6px 0 14px" }}>
          Log the notice exactly as received. This takes nothing down — decide below, once it&rsquo;s on file. The
          content ID is the post or comment ID from the reported URL.
        </p>
        <form action={handleRecord} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label htmlFor="cn-name">Complainant name</label>
            <input className="input" id="cn-name" name="complainantName" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="cn-email">Complainant email</label>
            <input className="input" id="cn-email" name="complainantEmail" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="cn-work">Work claimed to be infringed</label>
            <input className="input" id="cn-work" name="workDescription" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="cn-type">Content type</label>
            <select className="input" id="cn-type" name="targetType" defaultValue="post">
              <option value="post">Post</option>
              <option value="comment">Comment</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="cn-target">Content ID</label>
            <input className="input" id="cn-target" name="targetId" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="cn-notes">Notes (optional)</label>
            <input className="input" id="cn-notes" name="notes" type="text" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
            {pending ? "Saving…" : "Record notice"}
          </button>
        </form>
      </div>

      <div className="card elev-sm">
        <div className="card-kicker">Notices on file</div>
        {rows.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
            No copyright notices have been received.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ borderTop: "1px solid var(--color-neutral-200)", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {r.workDescription}
                  </div>
                  <div style={{ fontSize: 12, color: STATUS_COLORS[r.status] ?? "var(--color-neutral-700)" }}>
                    {statusLabel(r.status)}
                    {r.actionedAt && ` · ${formatDate(r.actionedAt)}`}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 4 }}>
                  From {r.complainantName} ({r.complainantEmail}) · received {formatDate(r.receivedAt)}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 2 }}>
                  Targets {r.targetType} <code>{r.targetId}</code> by {r.authorName}
                </div>

                {r.contentPreview === null ? (
                  <p style={{ fontSize: 12.5, fontStyle: "italic", color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
                    This content no longer exists — the author deleted it. The notice can still be resolved.
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: 12.5,
                      margin: "8px 0 0",
                      padding: "8px 10px",
                      background: "var(--color-neutral-100, #f2f4f5)",
                      borderRadius: 4,
                      opacity: r.contentRemoved ? 0.6 : 1,
                    }}
                  >
                    {r.contentRemoved && <strong>[removed] </strong>}
                    {r.contentPreview}
                  </p>
                )}

                {r.notes && (
                  <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "6px 0 0", whiteSpace: "pre-wrap" }}>
                    {r.notes}
                  </p>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {r.status !== "removed" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={pending}
                      onClick={() => run(() => removeReportedContentAction(r.id))}
                    >
                      Remove content
                    </button>
                  )}
                  {r.status === "received" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={pending}
                      onClick={() =>
                        promptThen("Why is this notice being rejected?", (reason) =>
                          rejectCopyrightNoticeAction(r.id, reason)
                        )
                      }
                    >
                      Reject notice
                    </button>
                  )}
                  {r.status === "removed" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={pending}
                      onClick={() =>
                        promptThen(
                          "Why is this content being reinstated? (e.g. valid counter-notice received on <date>)",
                          (reason) => reinstateContentAction(r.id, reason)
                        )
                      }
                    >
                      Reinstate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card elev-sm">
        <div className="card-kicker">Repeat infringers</div>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "6px 0 10px" }}>
          Accounts with at least one upheld takedown. Flagged for review at {strikeThreshold}; suspension is
          always your decision, and the reason you give is stored as the record of it.
        </p>
        {infringers.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>
            No account has an upheld takedown against it.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
                  <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Account</th>
                  <th style={{ padding: "4px 10px", fontWeight: 600 }}>Strikes</th>
                  <th style={{ padding: "4px 10px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {infringers.map((p) => (
                  <tr key={p.userId} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
                    <td style={{ padding: "8px 10px 8px 0" }}>
                      {p.name}
                      {p.email && (
                        <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>{p.email}</div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontWeight: p.strikes >= strikeThreshold ? 600 : 400,
                        color: p.strikes >= strikeThreshold ? "var(--color-danger, #9E2B25)" : undefined,
                      }}
                    >
                      {p.strikes}
                      {p.strikes >= strikeThreshold && " · review"}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {p.suspendedAt ? `Suspended ${formatDate(p.suspendedAt)}` : "Active"}
                    </td>
                    <td style={{ padding: "8px 0 8px 10px" }}>
                      {p.suspendedAt ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={pending}
                          onClick={() => run(() => unsuspendUserAction(p.userId))}
                        >
                          Lift suspension
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={pending}
                          onClick={() =>
                            promptThen(
                              `Why is ${p.name}'s account being suspended? This is stored as the record of the decision.`,
                              (reason) => suspendUserAction(p.userId, reason)
                            )
                          }
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
