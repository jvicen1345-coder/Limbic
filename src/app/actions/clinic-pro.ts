"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { appOrigin } from "@/lib/url";
import { emailEnabled, sendClinicInviteEmail } from "@/lib/email";
import { mcidValues } from "@/lib/outcome-benchmarks";
import { todayLocalDateStr } from "@/lib/today";
import type { ClinicianDashboardResult, OutcomeBenchmark } from "./clinician-dashboard";

/**
 * Clinic PRO (/pro/clinic-setup, /clinic/accept-invite, /pro/clinic-report, and the Team
 * tab on /pro/dashboard) server actions — the multi-clinician expansion of the solo
 * clinician dashboard in clinician-dashboard.ts. Same conventions as that file:
 *
 * - Every action re-derives the acting user from the session (getCurrentUser), never from
 *   a client-supplied id — the spec's example signatures (createClinic(userId, name),
 *   inviteClinicMember(adminUserId, email), etc.) are written as if the caller supplies the
 *   acting user's own id; here that id always comes from the session instead. A second id
 *   naming *someone else* (toUserId on transferPatient, targetUserId on
 *   removeClinicMember) is a real, necessary argument and stays a parameter.
 * - Fetch-then-compare access checks (requireClinicAdmin below), same shape as
 *   requireOwnedPatient in clinician-dashboard.ts.
 * - ClinicianDashboardResult<T> (imported from that file rather than redeclared) for every
 *   mutating action; plain data with an empty/null default for read-only queries.
 */

async function requireClinicPro() {
  const user = await getCurrentUser();
  if (!user || !user.isClinicPro) return null;
  return user;
}

/** Fetch-then-compare, same "not found and not yours look identical" reasoning as
 *  requireOwnedPatient — a non-admin caller gets the same "Not authorized." either way. */
async function requireClinicAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  const clinic = await prisma.clinic.findUnique({ where: { adminUserId: user.id } });
  if (!clinic) return null;
  return { user, clinic };
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Same MCID/MDC lookup as clinician-dashboard.ts's own (unexported) lookupBenchmark —
 *  duplicated rather than imported since that file's internal helpers aren't part of its
 *  public surface and this task's constraints only allow *adding* to that file, not
 *  changing what it exports. */
function lookupBenchmark(condition: string, measureName: string): OutcomeBenchmark | null {
  const entry = mcidValues[measureName];
  if (!entry) return null;
  return entry[condition] ?? entry.default ?? null;
}

export interface ClinicRecord {
  id: string;
  name: string;
  maxSeats: number;
}

/** Clinic Setup page's "Create Clinic" submit — one clinic per admin (Clinic.adminUserId is
 *  @unique), so a second call from the same account is rejected rather than silently
 *  creating a duplicate. The admin gets their own ClinicMembership row too (role "admin"),
 *  matching this schema's "membership rows for every clinician on the team including the
 *  admin themselves" design (see Clinic's own doc comment) — Team Overview then reads the
 *  whole roster, admin included, from one membership query. */
export async function createClinic(name: string): Promise<ClinicianDashboardResult<{ clinic: ClinicRecord }>> {
  const user = await requireClinicPro();
  if (!user) return { ok: false, error: "Clinic PRO subscription required." };

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "A clinic name is required." };

  const existing = await prisma.clinic.findUnique({ where: { adminUserId: user.id } });
  if (existing) return { ok: false, error: "You already have a clinic." };

  const clinic = await prisma.$transaction(async (tx) => {
    const created = await tx.clinic.create({ data: { name: trimmed, adminUserId: user.id } });
    await tx.clinicMembership.create({
      data: { clinicId: created.id, userId: user.id, role: "admin", status: "active", acceptedAt: new Date() },
    });
    return created;
  });

  revalidatePath("/pro/dashboard");
  revalidatePath("/pro/clinic-setup");
  return { ok: true, clinic: { id: clinic.id, name: clinic.name, maxSeats: clinic.maxSeats } };
}

/** "Invite Clinician" form on the Team Overview tab — 7-day invite token, emailed via
 *  Resend (see lib/email.ts sendClinicInviteEmail) when RESEND_API_KEY is configured, same
 *  emailEnabled()-gated graceful degradation as requestPasswordResetAction in
 *  app/actions/auth.ts (logged to the server console instead when it isn't, so the flow is
 *  still testable without a real Resend account). */
export async function inviteClinicMember(email: string): Promise<ClinicianDashboardResult> {
  const admin = await requireClinicAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !trimmedEmail.includes("@")) return { ok: false, error: "Enter a valid email address." };

  const activeSeatCount = await prisma.clinicMembership.count({ where: { clinicId: admin.clinic.id, status: "active" } });
  if (activeSeatCount >= admin.clinic.maxSeats) {
    return { ok: false, error: `Your clinic has reached its seat limit of ${admin.clinic.maxSeats}. Add seats to invite more clinicians.` };
  }

  const alreadyMember = await prisma.clinicMembership.findFirst({
    where: { clinicId: admin.clinic.id, status: "active", user: { email: trimmedEmail } },
  });
  if (alreadyMember) return { ok: false, error: "This clinician is already on your team." };

  const invite = await prisma.clinicInvite.create({
    data: { clinicId: admin.clinic.id, email: trimmedEmail, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });

  const origin = await appOrigin();
  const acceptUrl = `${origin}/clinic/accept-invite?token=${invite.token}`;
  if (emailEnabled()) {
    await sendClinicInviteEmail(trimmedEmail, admin.user.name, admin.clinic.name, acceptUrl);
  } else {
    console.error(`[clinic-pro] Email not sent (RESEND_API_KEY unset?) — invite link for ${trimmedEmail}: ${acceptUrl}`);
  }

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface ClinicInvitePreview {
  clinicName: string;
  adminName: string;
}

/** Accept-invite page's server-side token lookup — separate from acceptClinicInvite itself
 *  since the page needs to show "Sign in to accept your invitation to [clinic name]" (or
 *  the Accept button) before the reader has done anything, not just on submit. Returns null
 *  for any invalid/expired/already-accepted token; the page shows one generic "This
 *  invitation link is no longer valid." state for all three rather than distinguishing
 *  them, since none of the three is actionable differently by the reader anyway. */
export async function previewClinicInvite(token: string): Promise<ClinicInvitePreview | null> {
  const invite = await prisma.clinicInvite.findUnique({ where: { token }, include: { clinic: { include: { admin: true } } } });
  if (!invite || invite.accepted || invite.expiresAt < new Date()) return null;
  return { clinicName: invite.clinic.name, adminName: invite.clinic.admin.name };
}

/** "Accept Invitation" button — validates the token itself again (never trusts that
 *  previewClinicInvite's earlier, separate call still reflects current state), same
 *  re-check-everything-in-the-mutating-action reasoning as every other action in this file.
 *  Idempotent for a reader who's already an active member (e.g. a double-click, or
 *  revisiting a link they already used from a different tab) — marks the invite accepted
 *  and returns ok rather than erroring. Doesn't check that the signed-in account's email
 *  matches the invited address — the spec's own acceptClinicInvite(token, userId) doesn't
 *  call for that check either, and enforcing it would block the common case of an admin
 *  inviting a clinician's work email while they're signed in with a personal one. */
export async function acceptClinicInvite(token: string): Promise<ClinicianDashboardResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to accept your invitation." };

  const invite = await prisma.clinicInvite.findUnique({ where: { token } });
  if (!invite) return { ok: false, error: "Invalid invitation." };
  if (invite.expiresAt < new Date()) return { ok: false, error: "This invitation has expired." };

  const existingMembership = await prisma.clinicMembership.findUnique({
    where: { clinicId_userId: { clinicId: invite.clinicId, userId: user.id } },
  });

  if (existingMembership) {
    if (existingMembership.status !== "active") {
      await prisma.clinicMembership.update({ where: { id: existingMembership.id }, data: { status: "active", acceptedAt: new Date() } });
    }
  } else {
    await prisma.clinicMembership.create({
      data: { clinicId: invite.clinicId, userId: user.id, role: "clinician", status: "active", acceptedAt: new Date() },
    });
  }

  if (!invite.accepted) {
    await prisma.clinicInvite.update({ where: { id: invite.id }, data: { accepted: true } });
  }

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/** "Remove" button per clinician row — sets status "inactive" rather than deleting the
 *  membership row (see ClinicMembership's own doc comment on why), so a removed
 *  clinician's own patient records and past transfer history stay intact; they simply stop
 *  counting toward seats used or appearing in Team Overview. */
export async function removeClinicMember(targetUserId: string): Promise<ClinicianDashboardResult> {
  const admin = await requireClinicAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };
  if (targetUserId === admin.user.id) return { ok: false, error: "You can't remove yourself." };

  const membership = await prisma.clinicMembership.findUnique({
    where: { clinicId_userId: { clinicId: admin.clinic.id, userId: targetUserId } },
  });
  if (!membership || membership.status !== "active") return { ok: false, error: "That clinician isn't an active team member." };

  await prisma.clinicMembership.update({ where: { id: membership.id }, data: { status: "inactive" } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface ClinicTeamMember {
  userId: string;
  name: string;
  credential: string;
  role: string;
  activePatients: number;
  seenThisWeek: number;
  ceHours: number;
  lastActive: Date | null;
  isSelf: boolean;
  patients: { patientCode: string; condition: string; visitCount: number; totalVisits: number }[];
}

export interface ClinicTeamOverview {
  clinicName: string;
  maxSeats: number;
  seatsUsed: number;
  members: ClinicTeamMember[];
}

/** Team Overview tab's team table — one query per clinic member for their patient roster
 *  rather than a second client round trip per expandable row, same "hand real data back to
 *  a client component that never navigates away" reasoning this file's sibling
 *  (clinician-dashboard.ts) documents at its own top. CE hours are all-time (same
 *  CELog-sum as getCECountdown), not scoped to any date range — this is a roster snapshot,
 *  not the dated Clinic Outcome Report below. */
export async function getClinicDashboard(): Promise<ClinicTeamOverview | null> {
  const admin = await requireClinicAdmin();
  if (!admin) return null;

  const memberships = await prisma.clinicMembership.findMany({
    where: { clinicId: admin.clinic.id, status: "active" },
    include: { user: true },
    orderBy: { role: "asc" },
  });

  const weekStart = startOfWeek(new Date());

  const members: ClinicTeamMember[] = await Promise.all(
    memberships.map(async (m) => {
      const [patients, ceLogs] = await Promise.all([
        prisma.clinicalPatient.findMany({
          where: { userId: m.userId, status: "active" },
          select: { patientCode: true, condition: true, visitCount: true, totalVisits: true, lastSeen: true },
        }),
        prisma.cELog.findMany({ where: { userId: m.userId }, select: { hours: true } }),
      ]);

      return {
        userId: m.userId,
        name: m.user.name,
        credential: m.user.specialty,
        role: m.role,
        activePatients: patients.length,
        seenThisWeek: patients.filter((p) => p.lastSeen != null && p.lastSeen >= weekStart).length,
        ceHours: ceLogs.reduce((sum, l) => sum + l.hours, 0),
        lastActive: m.user.lastVisitedAt,
        isSelf: m.userId === admin.user.id,
        patients: patients.map((p) => ({ patientCode: p.patientCode, condition: p.condition, visitCount: p.visitCount, totalVisits: p.totalVisits })),
      };
    })
  );

  return { clinicName: admin.clinic.name, maxSeats: admin.clinic.maxSeats, seatsUsed: memberships.length, members };
}

export interface RecentTransfer {
  id: string;
  patientCode: string;
  fromName: string;
  toName: string;
  transferredAt: Date;
}

/** Patient Transfer section's "Recent transfers" list — most recent first, capped since
 *  this is a glance-back list, not full history (a future "view all" could page through
 *  PatientTransfer directly if that's ever needed). */
export async function getRecentTransfers(): Promise<RecentTransfer[]> {
  const admin = await requireClinicAdmin();
  if (!admin) return [];

  const transfers = await prisma.patientTransfer.findMany({
    where: { clinicId: admin.clinic.id },
    include: { patient: true, fromUser: true, toUser: true },
    orderBy: { transferredAt: "desc" },
    take: 10,
  });

  return transfers.map((t) => ({
    id: t.id,
    patientCode: t.patient.patientCode,
    fromName: t.fromUser.name,
    toName: t.toUser.name,
    transferredAt: t.transferredAt,
  }));
}

/** "Transfer" button — moves a patient's ownership from one active clinic member to
 *  another. Validates both the current owner and the destination are active members of
 *  *this* admin's clinic (the spec's "validates clinicId matches" — checked via clinic
 *  membership rather than ClinicalPatient.clinicId, see that column's own doc comment on
 *  why) before touching anything, then stamps clinicId on the patient record as a side
 *  effect — the first time a patient is transferred is also the first time its clinicId
 *  gets set, since createPatient itself is never touched (see this file's own top comment). */
export async function transferPatient(patientId: string, toUserId: string, reason?: string): Promise<ClinicianDashboardResult> {
  const admin = await requireClinicAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const patient = await prisma.clinicalPatient.findUnique({ where: { id: patientId } });
  if (!patient) return { ok: false, error: "Patient not found." };

  const fromUserId = patient.userId;
  if (fromUserId === toUserId) return { ok: false, error: "This patient is already assigned to that clinician." };

  const [fromMembership, toMembership] = await Promise.all([
    prisma.clinicMembership.findUnique({ where: { clinicId_userId: { clinicId: admin.clinic.id, userId: fromUserId } } }),
    prisma.clinicMembership.findUnique({ where: { clinicId_userId: { clinicId: admin.clinic.id, userId: toUserId } } }),
  ]);
  if (!fromMembership || fromMembership.status !== "active") return { ok: false, error: "This patient isn't part of your clinic." };
  if (!toMembership || toMembership.status !== "active") return { ok: false, error: "Choose an active clinician to transfer to." };

  const trimmedReason = reason?.trim() || null;

  await prisma.$transaction([
    prisma.clinicalPatient.update({ where: { id: patientId }, data: { userId: toUserId, clinicId: admin.clinic.id } }),
    prisma.patientTransfer.create({
      data: { clinicId: admin.clinic.id, patientId, fromUserId, toUserId, reason: trimmedReason },
    }),
  ]);

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface ClinicPatientLookup {
  id: string;
  patientCode: string;
  ownerName: string;
}

/** Patient-code autocomplete for the Transfer form — every active patient across the whole
 *  clinic (not just the admin's own), since transferring is specifically for moving a
 *  patient *off* some other clinician's caseload. */
export async function getClinicPatientsForTransfer(): Promise<ClinicPatientLookup[]> {
  const admin = await requireClinicAdmin();
  if (!admin) return [];

  const memberIds = (await prisma.clinicMembership.findMany({ where: { clinicId: admin.clinic.id, status: "active" }, select: { userId: true } })).map(
    (m) => m.userId
  );

  const patients = await prisma.clinicalPatient.findMany({
    where: { userId: { in: memberIds }, status: "active" },
    include: { user: true },
    orderBy: { patientCode: "asc" },
  });

  return patients.map((p) => ({ id: p.id, patientCode: p.patientCode, ownerName: p.user.name }));
}

/** Non-admin clinic member's Daily Brief bar fifth tile ("Clinic Patients Today") — read
 *  only, counts across every active clinician on the team including the caller themselves.
 *  A brand-new export (not a change to getDashboardSummary/getTodaysPatients in
 *  clinician-dashboard.ts) so the existing four-tile summary stays exactly as it was. */
export async function getClinicPatientsTodayCount(): Promise<number | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await prisma.clinicMembership.findFirst({ where: { userId: user.id, status: "active" } });
  if (!membership) return null;

  const memberIds = (await prisma.clinicMembership.findMany({ where: { clinicId: membership.clinicId, status: "active" }, select: { userId: true } })).map(
    (m) => m.userId
  );

  const patients = await prisma.clinicalPatient.findMany({
    where: { userId: { in: memberIds }, status: "active", nextVisit: { not: null } },
    select: { nextVisit: true },
  });

  const today = todayLocalDateStr();
  return patients.filter((p) => p.nextVisit != null && todayLocalDateStr(p.nextVisit) === today).length;
}

export interface ClinicMembershipInfo {
  clinicName: string;
  isAdmin: boolean;
}

/** Sidebar footer's clinic-name pill and the dashboard's Team-tab gating — one query either
 *  page-level check needs, shared here rather than duplicated. */
export async function getClinicMembershipInfo(): Promise<ClinicMembershipInfo | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await prisma.clinicMembership.findFirst({ where: { userId: user.id, status: "active" }, include: { clinic: true } });
  if (!membership) return null;

  return { clinicName: membership.clinic.name, isAdmin: membership.clinic.adminUserId === user.id };
}

interface ClinicReportData {
  practiceOverview: {
    totalPatients: number;
    totalVisits: number;
    newPatients: number;
    returningPatients: number;
    episodeLengthByRegion: { bodyRegion: string; averageVisits: number; patientCount: number }[];
  };
  outcomeMeasureTrends: {
    measureName: string;
    averageImprovement: number;
    patientCount: number;
    benchmark: OutcomeBenchmark;
  }[];
  referralSources: { source: string; count: number }[];
  ceCompliance: { name: string; hoursCompleted: number; hoursRequired: number; onTrack: boolean }[];
}

export interface ClinicReportSummary {
  id: string;
  generatedAt: Date;
  dateRangeStart: Date;
  dateRangeEnd: Date;
}

export interface ClinicReport extends ClinicReportSummary {
  reportData: ClinicReportData;
}

/** "Generate Report" — a single aggregation pass across every active clinic member's
 *  patients, all anonymous (patient codes never appear in reportData, only counts and
 *  averages) per the spec. Saved as one JSON blob (ClinicOutcomeReport.reportData) so
 *  reopening it later from Report History always shows exactly what was computed at
 *  generation time, not a live re-aggregation that could drift if patient data changes
 *  afterward. */
export async function generateClinicReport(dateRangeStart: string, dateRangeEnd: string): Promise<ClinicianDashboardResult<{ report: ClinicReport }>> {
  const admin = await requireClinicAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const start = new Date(`${dateRangeStart}T00:00:00`);
  const end = new Date(`${dateRangeEnd}T23:59:59.999`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return { ok: false, error: "Choose a valid date range." };
  }

  // Currently-active members only, same roster getClinicDashboard uses — a patient whose
  // owning clinician has since been removed from the clinic (see removeClinicMember, which
  // deliberately leaves the patient record where it is) drops out of every report generated
  // afterward, even for a date range predating the removal. A team-roster-at-report-time
  // snapshot rather than a per-patient historical one — the simpler of the two reasonable
  // readings of "aggregate outcomes across your practice" for a change this rare.
  const memberships = await prisma.clinicMembership.findMany({ where: { clinicId: admin.clinic.id, status: "active" }, include: { user: true } });
  const memberIds = memberships.map((m) => m.userId);

  const [patientsInWindow, visitsInWindow, referralRows] = await Promise.all([
    prisma.clinicalPatient.findMany({
      where: { userId: { in: memberIds }, OR: [{ startDate: { gte: start, lte: end } }, { lastSeen: { gte: start, lte: end } }] },
      select: { bodyRegion: true, visitCount: true, status: true, startDate: true, lastSeen: true },
    }),
    prisma.visitLog.count({ where: { patient: { userId: { in: memberIds } }, loggedAt: { gte: start, lte: end } } }),
    prisma.referralSource.groupBy({ by: ["source"], where: { userId: { in: memberIds }, createdAt: { gte: start, lte: end } }, _count: { source: true } }),
  ]);

  const totalPatients = patientsInWindow.length;
  const newPatients = patientsInWindow.filter((p) => p.startDate >= start && p.startDate <= end).length;
  const returningPatients = totalPatients - newPatients;

  // Episode length by region — discharged patients only, same visitCount-at-discharge
  // measure as getEpisodeLengthStats in clinician-dashboard.ts. No dischargedAt timestamp
  // exists on ClinicalPatient, so "discharged within this window" is approximated by
  // status === "discharged" among patients already selected above (startDate or lastSeen
  // falling in the window) — close enough for a practice-overview snapshot, documented
  // here since it's the one place this report leans on an approximation.
  const dischargedInWindow = patientsInWindow.filter((p) => p.status === "discharged");
  const byRegionMap = new Map<string, number[]>();
  for (const p of dischargedInWindow) {
    const list = byRegionMap.get(p.bodyRegion) ?? [];
    list.push(p.visitCount);
    byRegionMap.set(p.bodyRegion, list);
  }
  const episodeLengthByRegion = Array.from(byRegionMap.entries()).map(([bodyRegion, visits]) => ({
    bodyRegion,
    averageVisits: visits.reduce((sum, v) => sum + v, 0) / visits.length,
    patientCount: visits.length,
  }));

  // Outcome measure trends — same per-patient first-to-latest improvement math as
  // getPeerComparisonBenchmarks in clinician-dashboard.ts, scoped to clinic members and to
  // scores recorded within the report window instead of all-time.
  const clinicPatients = await prisma.clinicalPatient.findMany({
    where: { userId: { in: memberIds } },
    select: { condition: true, outcomes: { where: { recordedAt: { gte: start, lte: end } }, orderBy: { recordedAt: "asc" }, select: { measureName: true, score: true } } },
  });
  const perMeasure = new Map<string, { improvements: number[]; benchmark: OutcomeBenchmark }>();
  for (const patient of clinicPatients) {
    const byMeasure = new Map<string, number[]>();
    for (const o of patient.outcomes) {
      const list = byMeasure.get(o.measureName) ?? [];
      list.push(o.score);
      byMeasure.set(o.measureName, list);
    }
    for (const [measureName, scores] of byMeasure) {
      if (scores.length < 2) continue;
      const benchmark = lookupBenchmark(patient.condition, measureName);
      if (!benchmark) continue;
      const rawChange = scores[scores.length - 1] - scores[0];
      const improvement = benchmark.higherIsBetter ? rawChange : -rawChange;
      const bucket = perMeasure.get(measureName) ?? { improvements: [], benchmark };
      bucket.improvements.push(improvement);
      perMeasure.set(measureName, bucket);
    }
  }
  const outcomeMeasureTrends = Array.from(perMeasure.entries())
    .filter(([, bucket]) => bucket.improvements.length >= 2)
    .map(([measureName, bucket]) => ({
      measureName,
      averageImprovement: bucket.improvements.reduce((sum, v) => sum + v, 0) / bucket.improvements.length,
      patientCount: bucket.improvements.length,
      benchmark: bucket.benchmark,
    }));

  // CE Compliance — each member's current renewal standing (same on-track formula as
  // getCECountdown), not scoped to the report's date range since a license renewal cycle
  // isn't the same window as an arbitrary report range.
  const ceCompliance = memberships.map((m) => {
    const hoursRequired = m.user.ceTotalRequired ?? 30;
    return { name: m.user.name, hoursCompleted: 0, hoursRequired, onTrack: true, _userId: m.userId };
  });
  const ceLogsByUser = await prisma.cELog.groupBy({ by: ["userId"], where: { userId: { in: memberIds } }, _sum: { hours: true } });
  const ceHoursByUser = new Map(ceLogsByUser.map((r) => [r.userId, r._sum.hours ?? 0]));
  const finalCeCompliance = ceCompliance.map((c) => {
    const hoursCompleted = ceHoursByUser.get(c._userId) ?? 0;
    const membership = memberships.find((m) => m.userId === c._userId);
    const expiry = membership?.user.ceLicenseExpiry ?? null;
    let onTrack = true;
    if (expiry) {
      const daysUntilRenewal = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
      const weeksRemaining = Math.max(1, daysUntilRenewal / 7);
      const hoursRemaining = Math.max(0, c.hoursRequired - hoursCompleted);
      onTrack = daysUntilRenewal > 0 && hoursRemaining / weeksRemaining <= 1;
    }
    return { name: c.name, hoursCompleted, hoursRequired: c.hoursRequired, onTrack };
  });

  const reportData: ClinicReportData = {
    practiceOverview: { totalPatients, totalVisits: visitsInWindow, newPatients, returningPatients, episodeLengthByRegion },
    outcomeMeasureTrends,
    referralSources: referralRows.map((r) => ({ source: r.source, count: r._count.source })).sort((a, b) => b.count - a.count),
    ceCompliance: finalCeCompliance,
  };

  const saved = await prisma.clinicOutcomeReport.create({
    data: { clinicId: admin.clinic.id, dateRangeStart: start, dateRangeEnd: end, reportData: reportData as object, generatedBy: admin.user.id },
  });

  revalidatePath("/pro/clinic-report");
  return {
    ok: true,
    report: { id: saved.id, generatedAt: saved.generatedAt, dateRangeStart: saved.dateRangeStart, dateRangeEnd: saved.dateRangeEnd, reportData },
  };
}

/** Report History list — summaries only (no reportData), matching the spec's "lists
 *  previously generated reports with date and date range — each has a View link." */
export async function getClinicReports(): Promise<ClinicReportSummary[]> {
  const admin = await requireClinicAdmin();
  if (!admin) return [];

  const reports = await prisma.clinicOutcomeReport.findMany({
    where: { clinicId: admin.clinic.id },
    orderBy: { generatedAt: "desc" },
    select: { id: true, generatedAt: true, dateRangeStart: true, dateRangeEnd: true },
  });
  return reports;
}

/** "View" link on a Report History row — the one place a previously generated report's
 *  full reportData is read back. */
export async function getClinicReportById(reportId: string): Promise<ClinicReport | null> {
  const admin = await requireClinicAdmin();
  if (!admin) return null;

  const report = await prisma.clinicOutcomeReport.findUnique({ where: { id: reportId } });
  if (!report || report.clinicId !== admin.clinic.id) return null;

  return {
    id: report.id,
    generatedAt: report.generatedAt,
    dateRangeStart: report.dateRangeStart,
    dateRangeEnd: report.dateRangeEnd,
    reportData: report.reportData as unknown as ClinicReportData,
  };
}
