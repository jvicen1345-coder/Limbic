/**
 * Shared vocabulary for the DMCA moderation surface: the notice lifecycle, what counts as
 * a strike, and the one visibility filter every reader-facing content query has to use.
 *
 * Deliberately free of `server-only` and of any Prisma import — the admin client component
 * needs the labels and the strike threshold too, and a `where` fragment is plain data.
 */

/** Notice lifecycle. See the CopyrightNotice model comment in schema.prisma for what each
 *  state means; `countsAsStrike` below is the only place the strike rule is expressed. */
export const NOTICE_STATUSES = ["received", "removed", "rejected", "reinstated"] as const;
export type NoticeStatus = (typeof NOTICE_STATUSES)[number];

export const NOTICE_TARGET_TYPES = ["post", "comment"] as const;
export type NoticeTargetType = (typeof NOTICE_TARGET_TYPES)[number];

export const NOTICE_STATUS_LABELS: Record<NoticeStatus, string> = {
  received: "Received",
  removed: "Content removed",
  rejected: "Rejected",
  reinstated: "Reinstated",
};

/**
 * Only an actual takedown is a strike.
 *
 * A notice that was merely logged ("received") has not been assessed yet, and one that was
 * "rejected" (facially defective, or the material wasn't infringing) or "reinstated" (a
 * valid counter-notice arrived, or the complainant withdrew) must not count against the
 * account. Counting either would mean terminating readers on the strength of unexamined or
 * withdrawn accusations, which is both unfair and its own liability — §512(f) exists
 * precisely because bad-faith notices are common.
 */
export function countsAsStrike(status: string): boolean {
  return status === "removed";
}

/**
 * How many upheld takedowns before an account is suspended under the published policy
 * (app/dmca/page.tsx §6).
 *
 * §512(i) does not name a number, and deliberately so — it requires a policy that is
 * reasonably implemented "in appropriate circumstances", not a specific count. Three is the
 * common industry line and gives an honest reader room to make a mistake, but the threshold
 * is advisory in the UI: it flags an account for review rather than suspending anyone
 * automatically. Suspension stays a decision an admin makes and signs, because "appropriate
 * circumstances" is a judgment the statute assigns to the provider, not to a counter.
 */
export const STRIKE_THRESHOLD = 3;

/**
 * The visibility filter for reader-facing Nexus content.
 *
 * **Every query that returns posts or comments to a reader must spread this.** Missing one
 * means content taken down under a DMCA notice stays publicly visible, which is a failure
 * of §512(c)(1)(C) rather than a cosmetic bug — so it lives here, in one place, instead of
 * being retyped as `removedAt: null` at each call site.
 *
 * Current consumers, all of which pass it as a `where` (or a nested `where`, for comments
 * included on a post):
 *
 *   - app/(app)/nexus/page.tsx            the main feed, and its included comments
 *   - app/(app)/nexus/profile/[userId]    one person's posts, and their included comments
 *   - lib/threads.ts                      the Nexus match scanned for Limbic Threads
 *   - lib/calendar-data.ts                event posts on the calendar
 *   - components/LimbicCalendarWidget.tsx event posts on the home widget
 *
 * The admin surface (/admin/copyright) intentionally does *not* use it: an admin has to be
 * able to see removed material to review a counter-notice and decide whether to reinstate.
 */
export const visibleContentWhere = { removedAt: null } as const;
