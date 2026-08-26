import "server-only";
import { prisma } from "@/lib/db";

/**
 * Clinic PRO detection utilities — shared by app/actions/clinic-pro.ts and the dashboard
 * page's server-side clinic-membership check (see app/pro/dashboard/page.tsx). The example
 * this was specced from imported `prisma` from '@/lib/prisma', which doesn't exist in this
 * codebase — every other file imports the shared client from '@/lib/db' (see lib/db.ts),
 * so that's what's used here too.
 */

export async function getClinicForUser(userId: string) {
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: "active" },
    include: { clinic: true },
  });
  return membership?.clinic ?? null;
}

export async function isClinicAdmin(userId: string) {
  const clinic = await prisma.clinic.findFirst({
    where: { adminUserId: userId },
  });
  return !!clinic;
}

export async function getClinicMembers(clinicId: string) {
  return prisma.clinicMembership.findMany({
    where: { clinicId, status: "active" },
    include: { user: true },
  });
}

/** Not called by anything in app/actions/clinic-pro.ts today — every clinic-wide read there
 *  (Team Overview, the dashboard's "Clinic Patients Today" tile, the Clinic Outcome Report)
 *  is computed by joining ClinicMembership -> userId directly rather than depending on
 *  ClinicalPatient.clinicId being populated, since that column is only ever stamped lazily
 *  by transferPatient (see that column's own doc comment in schema.prisma) and would give
 *  a false "no access" for a clinic whose members have never transferred a patient. Kept
 *  here, matching the spec verbatim, as a general-purpose access check available for a
 *  future single-patient-record permission check (e.g. a teammate opening another
 *  clinician's patient detail directly) that isn't wired up by this pass. */
export async function canAccessPatient(userId: string, patientId: string) {
  const patient = await prisma.clinicalPatient.findUnique({
    where: { id: patientId },
    include: { clinic: { include: { memberships: true } } },
  });
  if (!patient) return false;
  if (patient.userId === userId) return true;
  if (patient.clinicId) {
    const isMember = patient.clinic?.memberships.some((m) => m.userId === userId && m.status === "active");
    return !!isMember;
  }
  return false;
}
