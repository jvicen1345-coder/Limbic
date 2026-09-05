"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import {
  APPRAISAL_STATUSES,
  SOURCE_ACCESS,
  EFFECT_MEASURES,
  emptyAppraisalInput,
  runAppraisalChecks,
  publishBlockers,
  type AppraisalInput,
} from "@/lib/appraisal";
import { draftAppraisal, DRAFT_FAILED_MESSAGE, type AppraisalDraft } from "@/lib/appraisal-draft";

/**
 * Admin-only actions behind /admin/appraisals (see lib/appraisal.ts for the design, and
 * lib/appraisal-draft.ts for what is and is not sent to a model).
 *
 * Three rules hold across all of them. Every action re-checks isSiteAdmin() itself rather
 * than trusting the page that rendered the button, since each is a callable endpoint in its
 * own right (same reasoning as app/actions/copyright.ts). Every input is re-normalised
 * server-side through coerceInput() below, so a hand-rolled request cannot store a shape the
 * reader surface will later choke on. And publishing is guarded by publishBlockers() here as
 * well as in the editor — the editor's copy of that check is a courtesy to the writer, not
 * the enforcement.
 */

export interface AppraisalActionResult {
  ok: boolean;
  error?: string;
  id?: string;
  /** Set only by draftAppraisalAction — the prose the model wrote, for the editor to drop
   *  into its fields. Never persisted by that action: a draft the appraiser has not looked
   *  at yet is not something to save on their behalf. */
  draft?: AppraisalDraft;
}

/** Parses a number the way a form field should: an empty string is "not reported", which is
 *  a real state on every numeric field here, and anything unparseable is treated the same
 *  way rather than silently becoming zero — a study with no reported attrition and a study
 *  recorded as having zero attrition are different claims. */
function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Rebuilds a complete, well-typed AppraisalInput from whatever arrived. Every field is
 *  named explicitly rather than spread from the request, so a client cannot add keys to the
 *  stored JSON — which matters more here than usual, because that JSON is the provenance
 *  record and it should contain exactly the fields this app defines and nothing else. */
function coerceInput(raw: Partial<AppraisalInput> | undefined): AppraisalInput {
  const base = emptyAppraisalInput();
  if (!raw) return base;
  const measure = EFFECT_MEASURES.includes(raw.effectMeasure as never) ? (raw.effectMeasure as AppraisalInput["effectMeasure"]) : base.effectMeasure;
  const access = SOURCE_ACCESS.includes(raw.sourceAccess as never) ? (raw.sourceAccess as AppraisalInput["sourceAccess"]) : base.sourceAccess;
  return {
    title: str(raw.title),
    authors: str(raw.authors),
    journal: str(raw.journal),
    year: num(raw.year),
    doi: str(raw.doi),
    pmid: str(raw.pmid),
    sourceUrl: str(raw.sourceUrl),
    design: str(raw.design),
    population: str(raw.population),
    setting: str(raw.setting),
    intervention: str(raw.intervention),
    comparator: str(raw.comparator),
    followUpWeeks: num(raw.followUpWeeks),
    nRandomised: num(raw.nRandomised),
    nAnalysed: num(raw.nAnalysed),
    primaryOutcomeName: str(raw.primaryOutcomeName),
    effectMeasure: measure,
    effectPoint: num(raw.effectPoint),
    effectCiLower: num(raw.effectCiLower),
    effectCiUpper: num(raw.effectCiUpper),
    effectUnit: str(raw.effectUnit),
    // Stored as a magnitude regardless of which direction favours the intervention, which
    // is how runAppraisalChecks() compares it — a negative MCID would silently invert the
    // clinical-magnitude verdict.
    mcid: num(raw.mcid) === null ? null : Math.abs(num(raw.mcid) as number),
    mcidSource: str(raw.mcidSource),
    pValue: str(raw.pValue),
    registered: raw.registered === true,
    registrationId: str(raw.registrationId),
    primaryOutcomeChanged: raw.primaryOutcomeChanged === true,
    fundingSource: str(raw.fundingSource),
    conflictsDeclared: raw.conflictsDeclared === true,
    sourceAccess: access,
    notes: typeof raw.notes === "string" ? raw.notes.trim() : "",
  };
}

function coerceBody(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean);
}

function coerceTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean).slice(0, 8);
}

async function requireAdminUser(): Promise<{ id: string } | null> {
  if (!(await isSiteAdmin())) return null;
  const user = await getCurrentUser();
  return user ? { id: user.id } : null;
}

/**
 * Creates or updates one appraisal. A single save action rather than separate create/update
 * endpoints, because the editor is one form either way and the distinction is an id.
 *
 * Saving never publishes. `status` is set only by publishAppraisalAction/unpublish below, so
 * an autosave or a stray submit cannot put an unfinished appraisal in front of readers.
 */
export async function saveAppraisalAction(payload: {
  id?: string;
  input: Partial<AppraisalInput>;
  summary?: string;
  body?: unknown;
  specialty?: string;
  tags?: unknown;
}): Promise<AppraisalActionResult> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Not authorised." };

  const input = coerceInput(payload.input);
  if (!input.title) return { ok: false, error: "The study needs a title before it can be saved." };

  const data = {
    input: input as unknown as object,
    summary: str(payload.summary),
    body: coerceBody(payload.body) as unknown as object,
    specialty: str(payload.specialty) || "ortho",
    tags: coerceTags(payload.tags) as unknown as object,
    sourceAccess: input.sourceAccess,
    doi: input.doi,
  };

  try {
    if (payload.id) {
      // Scoped to the signed-in admin's own rows: site admin is a role, but an appraisal is
      // a signed opinion, and one admin editing another's byline is not a thing this should
      // allow by accident.
      const existing = await prisma.studyAppraisal.findFirst({ where: { id: payload.id, authorId: admin.id }, select: { id: true } });
      if (!existing) return { ok: false, error: "That appraisal no longer exists, or was written by someone else." };
      await prisma.studyAppraisal.update({ where: { id: payload.id }, data });
      revalidatePath("/admin/appraisals");
      return { ok: true, id: payload.id };
    }
    const created = await prisma.studyAppraisal.create({ data: { ...data, authorId: admin.id, status: "draft" } });
    revalidatePath("/admin/appraisals");
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("Saving appraisal failed:", err);
    return { ok: false, error: "Could not save this appraisal." };
  }
}

/**
 * Drafts the prose from the entered fields. Takes the form's current state rather than
 * reading the saved row, so an appraiser can draft against edits they have not saved yet.
 *
 * The deterministic checks are computed here and handed to the model as settled findings —
 * see lib/appraisal-draft.ts. Nothing about the study beyond these fields exists to send.
 */
export async function draftAppraisalAction(payload: { input: Partial<AppraisalInput> }): Promise<AppraisalActionResult> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Not authorised." };

  const input = coerceInput(payload.input);
  if (!input.title) return { ok: false, error: "Enter the study's title first." };
  if (!input.notes) return { ok: false, error: "Write your own take first — that is what the draft is built around." };

  const draft = await draftAppraisal(input, runAppraisalChecks(input));
  if (!draft) return { ok: false, error: DRAFT_FAILED_MESSAGE };
  return { ok: true, draft };
}

/** Publishes a saved appraisal. Re-reads the row rather than trusting the payload, so what
 *  gets checked against publishBlockers() is exactly what readers will get. */
export async function publishAppraisalAction(id: string): Promise<AppraisalActionResult> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Not authorised." };

  try {
    const row = await prisma.studyAppraisal.findFirst({ where: { id, authorId: admin.id } });
    if (!row) return { ok: false, error: "That appraisal no longer exists, or was written by someone else." };

    const blockers = publishBlockers(row.input as unknown as AppraisalInput, (row.body as string[]) ?? []);
    if (blockers.length > 0) return { ok: false, error: blockers.join(" ") };

    await prisma.studyAppraisal.update({
      where: { id },
      // publishedAt is set once and kept: re-publishing after an edit should not re-date the
      // piece to the top of the feed, since the study and the reading are the same.
      data: { status: "published", publishedAt: row.publishedAt ?? new Date() },
    });
    revalidatePath("/admin/appraisals");
    revalidatePath("/home");
    revalidatePath(`/article/appraisal-${id}`);
    return { ok: true, id };
  } catch (err) {
    console.error("Publishing appraisal failed:", err);
    return { ok: false, error: "Could not publish this appraisal." };
  }
}

/** Pulls a published appraisal back to draft. Keeps publishedAt so the original publication
 *  date survives a correction — an appraisal that was public is a thing that happened, and
 *  re-dating it would quietly rewrite that. */
export async function unpublishAppraisalAction(id: string): Promise<AppraisalActionResult> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Not authorised." };

  try {
    const row = await prisma.studyAppraisal.findFirst({ where: { id, authorId: admin.id }, select: { id: true } });
    if (!row) return { ok: false, error: "That appraisal no longer exists, or was written by someone else." };
    await prisma.studyAppraisal.update({ where: { id }, data: { status: "draft" } });
    revalidatePath("/admin/appraisals");
    revalidatePath("/home");
    revalidatePath(`/article/appraisal-${id}`);
    return { ok: true, id };
  } catch (err) {
    console.error("Unpublishing appraisal failed:", err);
    return { ok: false, error: "Could not unpublish this appraisal." };
  }
}

/** Deletes a draft outright. Only ever a draft: a published appraisal is unpublished first,
 *  deliberately two steps, so nothing that readers have seen disappears on a single click. */
export async function deleteAppraisalDraftAction(id: string): Promise<AppraisalActionResult> {
  const admin = await requireAdminUser();
  if (!admin) return { ok: false, error: "Not authorised." };

  try {
    const row = await prisma.studyAppraisal.findFirst({ where: { id, authorId: admin.id }, select: { status: true } });
    if (!row) return { ok: false, error: "That appraisal no longer exists, or was written by someone else." };
    if (row.status !== APPRAISAL_STATUSES[0]) {
      return { ok: false, error: "Unpublish this appraisal before deleting it." };
    }
    await prisma.studyAppraisal.delete({ where: { id } });
    revalidatePath("/admin/appraisals");
    return { ok: true };
  } catch (err) {
    console.error("Deleting appraisal failed:", err);
    return { ok: false, error: "Could not delete this appraisal." };
  }
}
