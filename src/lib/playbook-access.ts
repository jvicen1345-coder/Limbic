import "server-only";
import { isSiteAdmin } from "@/lib/admin";

/**
 * Whether this reader may see the built playbooks — the ones assembled from lib/playbooks/*
 * (hip, knee, ankle, joint mobilization).
 *
 * Admin-only for now, deliberately and temporarily. Three of the four were written to the
 * shape of the hip playbook rather than to the reasoning a reader needs at that joint: knee
 * and ankle both organise half their sections around tissues (Ligament, Meniscus,
 * Tendons, Heel), which are buckets to look things up in rather than steps in an
 * examination, and neither has the Diagnosis section that turns findings into a plan. They
 * are being rebuilt one at a time. Until then they are not what the Boards subscription is
 * sold on, so they are not shown to the people paying for it.
 *
 * This gate deliberately does NOT cover the shoulder guide
 * (app/(app)/student/guides/shoulder-examination), which is a separate fixed asset, is
 * individually sourced, and stays available to every LimbicStudent subscriber exactly as
 * before.
 *
 * To restore normal access, delete this file and the three call sites that reference it —
 * the playbooks hub, the [slug] page, and the Boards study-guide tab — each of which is
 * marked with a comment pointing here. The underlying paid-tier gate (hasStudentAccess plus
 * studentTier === "limbicStudent") is untouched and still applies underneath.
 */
export async function canSeeBuiltPlaybooks(): Promise<boolean> {
  return isSiteAdmin();
}
