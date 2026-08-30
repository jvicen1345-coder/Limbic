"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export interface CalculatorResultView {
  id: string;
  testKey: string;
  testName: string;
  value: string;
  interpretation: string;
  completedAt: string;
}

export interface CalculatorProfileView {
  id: string;
  label: string;
  selectedTests: string[];
  /** Optional — see CalculatorProfile.age/sex in schema.prisma. Read by
   *  CalculatorWorkspace.tsx to pre-fill the shared CalculatorProfileContext, which the
   *  age/sex-normed calculators (30-Second Sit-to-Stand, 6MWT) read on mount. */
  age: number | null;
  sex: "male" | "female" | null;
  createdAt: string;
  results: CalculatorResultView[];
}

function toSelectedTests(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((t): t is string => typeof t === "string") : [];
}

function toSex(raw: string | null): "male" | "female" | null {
  return raw === "male" || raw === "female" ? raw : null;
}

function serializeResult(r: { id: string; testKey: string; testName: string; value: string; interpretation: string; completedAt: Date }): CalculatorResultView {
  return {
    id: r.id,
    testKey: r.testKey,
    testName: r.testName,
    value: r.value,
    interpretation: r.interpretation,
    completedAt: r.completedAt.toISOString(),
  };
}

/** Outcome Measures is free to any signed-in user (see app/(app)/pro/calculators/page.tsx
 *  — no more LimbicPRO/Limbic Student gate there), so this only re-checks that the caller
 *  is signed in at all. Still its own check rather than trusting the page: a Server Action
 *  is its own callable endpoint regardless of which page's UI happens to call it (same
 *  reasoning as requireProUser in app/actions/agent.ts). Returns null (not a thrown error)
 *  so every caller below can short-circuit the same way a signed-out request into any other
 *  action in this app does. */
async function requireCalcAccess() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

/** Loaded server-side by the /pro/calculators page itself (not a client fetch) — exported
 *  mainly so app/(app)/pro/calculators/page.tsx and this file share one query/serialization
 *  shape rather than the page hand-rolling its own. */
export async function getCalculatorProfilesForCurrentUser(): Promise<CalculatorProfileView[]> {
  const user = await requireCalcAccess();
  if (!user) return [];
  const profiles = await prisma.calculatorProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { results: { orderBy: { completedAt: "desc" } } },
  });
  return profiles.map((p) => ({
    id: p.id,
    label: p.label,
    selectedTests: toSelectedTests(p.selectedTests),
    age: p.age,
    sex: toSex(p.sex),
    createdAt: p.createdAt.toISOString(),
    results: p.results.map(serializeResult),
  }));
}

export interface CalculatorProfileActionResult {
  ok: boolean;
  error?: string;
  profile?: CalculatorProfileView;
}

/** Creates a new profile — deliberately just a free-text `label` with no dedicated
 *  name/DOB/MRN fields (see CalculatorProfile in schema.prisma), so this never asks for or
 *  stores real patient-identifying information; CreateProfileForm's placeholder nudges
 *  toward a non-identifying label instead. age/sex are the one exception, and only because
 *  they're inputs the age/sex-normed calculators already ask for individually (30-Second
 *  Sit-to-Stand, 6MWT) — collecting them once here just avoids re-typing the same two
 *  values into each one. Both optional; age validated to a plausible human range. */
export async function createCalculatorProfileAction(
  label: string,
  selectedTests: string[],
  age?: number | null,
  sex?: "male" | "female" | null
): Promise<CalculatorProfileActionResult> {
  const user = await requireCalcAccess();
  if (!user) return { ok: false, error: "Not authorized." };
  const trimmed = label.trim();
  if (!trimmed) return { ok: false, error: "Give this profile a label." };
  if (trimmed.length > 60) return { ok: false, error: "Keep the label under 60 characters." };
  const cleanAge = age != null && Number.isFinite(age) && age >= 0 && age <= 130 ? Math.round(age) : null;
  const cleanSex = toSex(sex ?? null);

  const created = await prisma.calculatorProfile.create({
    data: { userId: user.id, label: trimmed, selectedTests, age: cleanAge, sex: cleanSex },
    include: { results: true },
  });
  revalidatePath("/pro/calculators");
  return {
    ok: true,
    profile: {
      id: created.id,
      label: created.label,
      selectedTests: toSelectedTests(created.selectedTests),
      age: created.age,
      sex: toSex(created.sex),
      createdAt: created.createdAt.toISOString(),
      results: [],
    },
  };
}

/** Edits which tests a profile's checklist covers — a saved result for a test not on this
 *  list is still kept (see saveCalculatorResultAction below), this only changes what shows
 *  as "planned but not yet done" in CalculatorProfilesPanel. */
export async function updateCalculatorProfileTestsAction(profileId: string, selectedTests: string[]): Promise<{ ok: boolean }> {
  const user = await requireCalcAccess();
  if (!user) return { ok: false };
  const { count } = await prisma.calculatorProfile.updateMany({ where: { id: profileId, userId: user.id }, data: { selectedTests } });
  if (count === 0) return { ok: false };
  revalidatePath("/pro/calculators");
  return { ok: true };
}

/** Edits a profile's age/sex after creation — for a clinician who skipped it up front, or
 *  needs to correct it mid-visit. Same validation as createCalculatorProfileAction. */
export async function updateCalculatorProfileDemographicsAction(
  profileId: string,
  age: number | null,
  sex: "male" | "female" | null
): Promise<{ ok: boolean }> {
  const user = await requireCalcAccess();
  if (!user) return { ok: false };
  const cleanAge = age != null && Number.isFinite(age) && age >= 0 && age <= 130 ? Math.round(age) : null;
  const cleanSex = toSex(sex);
  const { count } = await prisma.calculatorProfile.updateMany({ where: { id: profileId, userId: user.id }, data: { age: cleanAge, sex: cleanSex } });
  if (count === 0) return { ok: false };
  revalidatePath("/pro/calculators");
  return { ok: true };
}

export async function deleteCalculatorProfileAction(profileId: string): Promise<{ ok: boolean }> {
  const user = await requireCalcAccess();
  if (!user) return { ok: false };
  await prisma.calculatorProfile.deleteMany({ where: { id: profileId, userId: user.id } });
  revalidatePath("/pro/calculators");
  return { ok: true };
}

export interface SaveCalculatorResultResult {
  ok: boolean;
  error?: string;
  result?: CalculatorResultView;
}

/** Called from CalcModal's "Save to profile" button (see
 *  components/pro/calculators/CalcModal.tsx) — value/interpretation are the exact display
 *  strings the calling calculator showed on screen at save time (see each
 *  components/pro/calculators/*.tsx file's `result` prop passed to CalcModal), not a bare
 *  number, so this table never needs to know any individual test's own scoring scale. */
export async function saveCalculatorResultAction(
  profileId: string,
  testKey: string,
  testName: string,
  value: string,
  interpretation: string
): Promise<SaveCalculatorResultResult> {
  const user = await requireCalcAccess();
  if (!user) return { ok: false, error: "Not authorized." };

  const profile = await prisma.calculatorProfile.findFirst({ where: { id: profileId, userId: user.id }, select: { id: true } });
  if (!profile) return { ok: false, error: "That profile no longer exists." };

  const created = await prisma.calculatorResult.create({
    data: { profileId, testKey, testName, value, interpretation },
  });
  revalidatePath("/pro/calculators");
  return { ok: true, result: serializeResult(created) };
}

export async function deleteCalculatorResultAction(resultId: string): Promise<{ ok: boolean }> {
  const user = await requireCalcAccess();
  if (!user) return { ok: false };
  await prisma.calculatorResult.deleteMany({ where: { id: resultId, profile: { userId: user.id } } });
  revalidatePath("/pro/calculators");
  return { ok: true };
}
