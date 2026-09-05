"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  parseIntakeAnswers,
  hasSubstance,
  INTAKE_LINK_DAYS,
  type IntakeAnswers,
} from "@/lib/intake";

/**
 * Client intake links: a clinician generates a single-use URL, sends it to a new client, and
 * the answers land in a review queue on the dashboard rather than on a patient record.
 *
 * Two of these actions are callable by anyone on the internet — previewIntakeLink and
 * submitIntake are what the unauthenticated /intake page runs — so the split matters:
 *
 *   public   previewIntakeLink   says only whether a token is usable. No clinician name, no
 *                                practice details, no patient data, and the same answer for
 *                                expired, used, and never-existed.
 *   public   submitIntake        writes one IntakeSubmission and burns the token.
 *   private  everything else     requires a signed-in PRO user and re-checks ownership.
 */

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const GENERIC_LINK_ERROR = "This intake link is no longer valid.";

async function requireProUser() {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return null;
  return user;
}

/** 32 bytes of crypto randomness, not the cuid() default ClinicInvite leans on. A clinic
 *  invite goes to a named colleague who is expecting it; this URL is the only thing between
 *  the open internet and a write into someone's caseload. */
function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createIntakeLink(label: string): Promise<Result<{ token: string }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const link = await prisma.intakeLink.create({
    data: {
      userId: user.id,
      token: newToken(),
      label: label.trim().slice(0, 120) || null,
      expiresAt: new Date(Date.now() + INTAKE_LINK_DAYS * 86400000),
    },
  });
  revalidatePath("/pro/dashboard");
  return { ok: true, token: link.token };
}

export async function revokeIntakeLink(linkId: string): Promise<Result> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const link = await prisma.intakeLink.findUnique({ where: { id: linkId } });
  if (!link || link.userId !== user.id) return { ok: false, error: "Link not found." };

  // Expiring it rather than deleting keeps any submission already made against it — and its
  // link row — intact, so revoking a link can never orphan a client's answers.
  await prisma.intakeLink.update({ where: { id: linkId }, data: { expiresAt: new Date(), usedAt: new Date() } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/** PUBLIC. Whether this token can still be filled in. Returns a bare boolean's worth of
 *  information on purpose: anything richer — whose link it is, when it was made — would leak
 *  to anyone who guesses or intercepts a URL. Expired, already used and never-existed all
 *  return the same thing, so the endpoint can't be used to probe for live tokens. */
export async function previewIntakeLink(token: string): Promise<{ usable: boolean }> {
  if (!token) return { usable: false };
  const link = await prisma.intakeLink.findUnique({ where: { token } });
  if (!link || link.usedAt || link.expiresAt < new Date()) return { usable: false };
  return { usable: true };
}

/** PUBLIC. Records one completed intake and burns the token.
 *
 *  Nothing here trusts its input: the answers go through parseIntakeAnswers (which drops
 *  anything the form doesn't offer), and the owning clinician comes from the link row rather
 *  than from the caller. The token is marked used in the same transaction as the insert, so
 *  two simultaneous submits can't both get through. */
export async function submitIntake(
  token: string,
  clientName: string,
  clientEmail: string,
  rawAnswers: unknown
): Promise<Result> {
  if (!token) return { ok: false, error: GENERIC_LINK_ERROR };

  const link = await prisma.intakeLink.findUnique({ where: { token } });
  if (!link || link.usedAt || link.expiresAt < new Date()) return { ok: false, error: GENERIC_LINK_ERROR };

  const answers = parseIntakeAnswers(rawAnswers);
  if (!hasSubstance(answers)) {
    return { ok: false, error: "Please tell us at least one thing you'd like to work towards." };
  }

  try {
    await prisma.$transaction([
      prisma.intakeSubmission.create({
        data: {
          userId: link.userId,
          linkId: link.id,
          clientName: clientName.trim().slice(0, 120) || null,
          clientEmail: clientEmail.trim().slice(0, 160) || null,
          answers: answers as unknown as object,
        },
      }),
      // Conditional on usedAt still being null, so the loser of a race updates zero rows and
      // the whole transaction rolls back rather than writing a second submission.
      prisma.intakeLink.updateMany({ where: { id: link.id, usedAt: null }, data: { usedAt: new Date() } }),
    ]);
  } catch (err) {
    console.error("Intake submission failed:", err);
    return { ok: false, error: "Something went wrong saving your answers. Please try again." };
  }

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface IntakeSubmissionView {
  id: string;
  clientName: string | null;
  clientEmail: string | null;
  answers: IntakeAnswers;
  submittedAt: Date;
  status: string;
  patientId: string | null;
}

export interface IntakeLinkView {
  id: string;
  token: string;
  label: string | null;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface IntakeInboxData {
  pending: IntakeSubmissionView[];
  openLinks: IntakeLinkView[];
}

/** The dashboard's intake card: submissions still awaiting a decision, plus links that have
 *  been generated and not yet used. */
export async function getIntakeInbox(): Promise<IntakeInboxData> {
  const user = await requireProUser();
  if (!user) return { pending: [], openLinks: [] };

  const [submissions, links] = await Promise.all([
    prisma.intakeSubmission.findMany({
      where: { userId: user.id, status: "pending" },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.intakeLink.findMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    pending: submissions.map((s) => ({
      id: s.id,
      clientName: s.clientName,
      clientEmail: s.clientEmail,
      answers: parseIntakeAnswers(s.answers),
      submittedAt: s.submittedAt,
      status: s.status,
      patientId: s.patientId,
    })),
    openLinks: links.map((l) => ({
      id: l.id,
      token: l.token,
      label: l.label,
      expiresAt: l.expiresAt,
      usedAt: l.usedAt,
    })),
  };
}

/** Attach a submission to a patient — existing, or one createPatient just made — and close
 *  it out.
 *
 *  The identifying fields are cleared here, not merely hidden. The dashboard identifies
 *  patients by patientCode and that stays true: a client's name and email exist only for as
 *  long as it takes the clinician to recognize who submitted, and never reach
 *  ClinicalPatient. The answers themselves stay, linked to the patient, so the structured
 *  intake is still readable later instead of being flattened into a notes blob.
 *
 *  Goals become PatientGoal rows because that is where the rest of the dashboard looks for
 *  them — an intake goal and one typed in by the clinician should be the same object. */
export async function acceptIntakeSubmission(submissionId: string, patientId: string): Promise<Result> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const [submission, patient] = await Promise.all([
    prisma.intakeSubmission.findUnique({ where: { id: submissionId } }),
    prisma.clinicalPatient.findUnique({ where: { id: patientId } }),
  ]);
  if (!submission || submission.userId !== user.id) return { ok: false, error: "Submission not found." };
  if (!patient || patient.userId !== user.id) return { ok: false, error: "Patient not found." };
  if (submission.status !== "pending") return { ok: false, error: "This intake has already been dealt with." };

  const answers = parseIntakeAnswers(submission.answers);
  const goals: { goalText: string; timeframe: string }[] = [];
  if (answers.goalShort) goals.push({ goalText: answers.goalShort, timeframe: "Short-term" });
  if (answers.goalLong) goals.push({ goalText: answers.goalLong, timeframe: "Long-term" });

  await prisma.$transaction([
    ...goals.map((g) =>
      prisma.patientGoal.create({
        data: {
          patientId,
          userId: user.id,
          goalText: g.goalText,
          // "Client-stated" rather than a clinical category: these are the client's own words
          // from before the first session, and shouldn't be mistaken for a clinician's goal.
          category: "Client-stated",
          timeframe: g.timeframe,
        },
      })
    ),
    prisma.intakeSubmission.update({
      where: { id: submissionId },
      data: { status: "accepted", patientId, reviewedAt: new Date(), clientName: null, clientEmail: null },
    }),
  ]);

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/** Drop a submission without attaching it — a duplicate, a test, or someone who never became
 *  a client. Same clearing of identifying fields as accepting: whichever way a submission
 *  leaves the queue, the name and email go with it. */
export async function dismissIntakeSubmission(submissionId: string): Promise<Result> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const submission = await prisma.intakeSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.userId !== user.id) return { ok: false, error: "Submission not found." };

  await prisma.intakeSubmission.update({
    where: { id: submissionId },
    data: { status: "dismissed", reviewedAt: new Date(), clientName: null, clientEmail: null },
  });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}
