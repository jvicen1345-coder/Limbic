import { test, expect } from "@playwright/test";
import {
  MOVEMENT_EXERCISES,
  MOVEMENT_EXERCISE_BY_ID,
  MOVEMENT_PROTOCOLS,
  MOVEMENT_LAB_COUNTS,
  MOVEMENT_REGIONS,
  formatDosage,
  protocolPhaseToHepExercises,
  resolveProtocolSteps,
  searchExercises,
} from "@/lib/movement-lab";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Data-integrity checks over the Movement Lab bank. No browser needed — these are pure
 * assertions over the static content, run here because Playwright is this repo's only test
 * runner (see playwright.config.ts).
 *
 * The reason these exist rather than trusting review: protocols reference exercises by id
 * across ten separate files, and a renamed or mistyped id would otherwise show up as a
 * quietly shorter program in the HEP Builder rather than as any kind of error. The field
 * checks enforce the content bar the bank is built on — every entry carries at least one
 * precaution and a plain-language patient paragraph, or it doesn't ship.
 */
test.describe("Movement Lab data", () => {
  test("every exercise id is unique", () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const ex of MOVEMENT_EXERCISES) {
      if (seen.has(ex.id)) duplicates.push(`${ex.id} (${seen.get(ex.id)} and ${ex.name})`);
      seen.set(ex.id, ex.name);
    }
    expect(duplicates).toEqual([]);
    expect(MOVEMENT_EXERCISE_BY_ID.size).toBe(MOVEMENT_EXERCISES.length);
  });

  test("every exercise carries the fields the content bar requires", () => {
    const problems: string[] = [];
    for (const ex of MOVEMENT_EXERCISES) {
      if (ex.precautions.length === 0) problems.push(`${ex.id}: no precautions`);
      if (ex.patientInstructions.trim().length < 40) problems.push(`${ex.id}: patientInstructions too short`);
      if (ex.steps.length === 0) problems.push(`${ex.id}: no steps`);
      if (ex.indications.length === 0) problems.push(`${ex.id}: no indications`);
      if (!ex.cue.trim()) problems.push(`${ex.id}: no cue`);
      if (!ex.dosage.sets.trim() || !ex.dosage.frequency.trim()) problems.push(`${ex.id}: incomplete dosage`);
      if (ex.difficulty < 1 || ex.difficulty > 5) problems.push(`${ex.id}: difficulty out of range`);
      if (ex.positions.length === 0) problems.push(`${ex.id}: no positions`);
      if (ex.equipment.length === 0) problems.push(`${ex.id}: no equipment`);
      if (ex.phases.length === 0) problems.push(`${ex.id}: no rehab phases`);
    }
    expect(problems).toEqual([]);
  });

  test("every protocol step resolves to a real exercise", () => {
    const unresolved: string[] = [];
    let stepCount = 0;
    for (const protocol of MOVEMENT_PROTOCOLS) {
      expect(protocol.phases.length, `${protocol.id} has no phases`).toBeGreaterThan(0);
      expect(protocol.caution.trim(), `${protocol.id} has no caution`).not.toBe("");
      for (const phase of protocol.phases) {
        expect(phase.steps.length, `${protocol.id}/${phase.name} has no steps`).toBeGreaterThan(0);
        expect(phase.criteriaToProgress.length, `${protocol.id}/${phase.name} has no progression criteria`).toBeGreaterThan(0);
        for (const step of phase.steps) {
          stepCount += 1;
          if (!MOVEMENT_EXERCISE_BY_ID.has(step.exerciseId)) {
            unresolved.push(`${protocol.id}/${phase.name}: ${step.exerciseId}`);
          }
        }
        // resolveProtocolSteps drops unresolved ids, so an equal length is the same
        // assertion from the other direction — nothing silently disappeared.
        expect(resolveProtocolSteps(phase)).toHaveLength(phase.steps.length);
      }
    }
    expect(unresolved).toEqual([]);
    expect(stepCount).toBeGreaterThan(0);
  });

  test("a protocol phase converts to complete HEP Builder rows", () => {
    for (const protocol of MOVEMENT_PROTOCOLS) {
      for (const phase of protocol.phases) {
        const rows = protocolPhaseToHepExercises(phase);
        expect(rows).toHaveLength(phase.steps.length);
        for (const row of rows) {
          expect(row.name.trim()).not.toBe("");
          expect(row.notes.trim()).not.toBe("");
          // The bank carries no media, and the builder gates those fields on LimbicPRO.
          expect(row.imageUrl).toBe("");
          expect(row.videoUrl).toBe("");
        }
      }
    }
  });

  test("region counts add up to the whole bank", () => {
    const total = MOVEMENT_REGIONS.reduce((sum, region) => sum + MOVEMENT_LAB_COUNTS[region], 0);
    expect(total).toBe(MOVEMENT_EXERCISES.length);
    // Every region is represented — an empty chip on the browse page would be a gap in the
    // bank, not a valid state.
    for (const region of MOVEMENT_REGIONS) {
      expect(MOVEMENT_LAB_COUNTS[region], `${region} is empty`).toBeGreaterThan(0);
    }
  });

  test("formatDosage handles hold-only and rep-based entries", () => {
    expect(formatDosage({ sets: "2–3", reps: "10", hold: "5 s", frequency: "Daily" })).toBe(
      "2–3 sets × 10 · hold 5 s · Daily",
    );
    // The case the old therapeutic-exercises library's parseDosage regex silently returned
    // empty strings for.
    expect(formatDosage({ sets: "3–5", reps: "", hold: "30 s", frequency: "Daily" })).toBe(
      "3–5 sets · hold 30 s · Daily",
    );
    // Both singular cases: one set, and a hold-based entry whose rep count is 1 — "1 sets"
    // and "× 1" both read as bugs.
    expect(formatDosage({ sets: "1", reps: "8–10", frequency: "Daily" })).toBe("1 set × 8–10 · Daily");
    expect(formatDosage({ sets: "1–2", reps: "1", hold: "5–10 min", frequency: "2–3x/day" })).toBe(
      "1–2 sets · hold 5–10 min · 2–3x/day",
    );
  });

  test("search narrows on multiple words rather than widening", () => {
    const shoulder = searchExercises("shoulder");
    const shoulderBand = searchExercises("shoulder band");
    expect(shoulder.length).toBeGreaterThan(0);
    expect(shoulderBand.length).toBeGreaterThan(0);
    expect(shoulderBand.length).toBeLessThan(shoulder.length);

    // Searching by condition is how a clinician actually looks for an exercise.
    expect(searchExercises("sciatica").length).toBeGreaterThan(0);
    // …and by the name they were taught, which may only be in `aka`.
    expect(searchExercises("codman").map((ex) => ex.id)).toContain("pendulum");

    // Filters compose with the query.
    const noEquipment = searchExercises("", { region: "Knee", equipment: "None" });
    expect(noEquipment.length).toBeGreaterThan(0);
    expect(noEquipment.every((ex) => ex.region === "Knee" && ex.equipment.includes("None"))).toBe(true);
  });
});

test.describe("Movement Lab page", () => {
  test("browses, filters and selects exercises", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("browse"));

    await page.goto("/movement-lab");
    await expect(page.getByRole("heading", { name: "Limbic Movement Lab" })).toBeVisible();

    const count = page.getByText(/^\d+ exercises$/);
    await expect(count).toBeVisible();
    const allText = await count.textContent();
    const all = Number(allText?.match(/\d+/)?.[0]);
    expect(all).toBe(MOVEMENT_EXERCISES.length);

    // A region chip narrows the list to that region's own count.
    await page.getByRole("button", { name: `Knee (${MOVEMENT_LAB_COUNTS["Knee"]})` }).click();
    await expect(count).toHaveText(`${MOVEMENT_LAB_COUNTS["Knee"]} exercises`);

    // Searching within the region narrows it further.
    await page.getByLabel("Search the bank").fill("quad");
    const narrowed = Number((await count.textContent())?.match(/\d+/)?.[0]);
    expect(narrowed).toBeGreaterThan(0);
    expect(narrowed).toBeLessThan(MOVEMENT_LAB_COUNTS["Knee"]);

    // Opening a card shows the full record, precautions included. Scoped to the card's own
    // id — every <details> keeps its content in the DOM whether open or not, so an
    // unscoped text locator matches every card on the page.
    const quadSet = page.locator("#quad-set");
    await quadSet.getByText("Quad Set", { exact: true }).click();
    await expect(quadSet.getByText("Precautions")).toBeVisible();
    await expect(quadSet.getByText(/Tighten your thigh and pull your kneecap up/)).toBeVisible();

    // Selecting it raises the tray with the send-to-builder link.
    await quadSet.getByRole("button", { name: "Add to program" }).click();
    await expect(page.getByText("1 exercise selected")).toBeVisible();
    await expect(page.getByRole("link", { name: "Send to HEP Builder" })).toHaveAttribute(
      "href",
      "/hep?exercises=quad-set",
    );
  });

  test("protocols list their phases and link each one into the builder", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("protocols"));

    await page.goto("/movement-lab");
    await page.getByRole("button", { name: `Protocols (${MOVEMENT_PROTOCOLS.length})` }).click();

    const acl = page.locator("#acl-reconstruction");
    await acl.getByText("ACL Reconstruction", { exact: true }).click();
    await expect(acl.getByText("Before you use this")).toBeVisible();
    await expect(acl.getByText("Phase 1 — Protection and quadriceps activation")).toBeVisible();
    // Each phase links to its own index, and every exercise in it resolved to a real name.
    await expect(acl.getByRole("link", { name: "Open in HEP Builder" }).first()).toHaveAttribute(
      "href",
      "/hep?protocol=acl-reconstruction&phase=0",
    );
    await expect(acl.getByText("Quad Set", { exact: true })).toBeVisible();
  });

  test("/pro/exercises redirects to the Movement Lab", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("redirect"));
    await page.goto("/pro/exercises");
    await expect(page).toHaveURL(/\/movement-lab/);
  });
});

test.describe("Movement Lab → HEP Builder", () => {
  /** The builder is gated on a license being on file (hasLicenseAccess in lib/session.ts),
   *  which a fresh sign-up doesn't have. Setting it directly is the smallest way in — the
   *  real credential flow is Profile > Credentials and isn't what's under test here. The dev
   *  server and this test share the same local SQLite file (see playwright.config.ts), so
   *  the write is visible to the next request.
   *
   *  Goes through @libsql/client rather than lib/db.ts because that module imports the
   *  Prisma client from the generated `@/generated/prisma/client`, which Playwright's TS
   *  loader can't resolve — and this needs one UPDATE, not an ORM. */
  async function grantLicense(email: string) {
    const { createClient } = await import("@libsql/client");
    const db = createClient({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
    // User.licenseNumber is unique, so it's derived from the (already unique) email rather
    // than being a fixed constant — otherwise these tests collide with each other in
    // parallel, and with every previous run against the same local database.
    await db.execute({
      sql: "UPDATE User SET licenseNumber = ? WHERE email = ?",
      args: [`PW-${email}`, email],
    });
    db.close();
  }

  test("a protocol phase deep-link arrives as a prefilled draft", async ({ page }) => {
    const email = freshEmail("protocol-draft");
    await signUpAndEnterApp(page, email);
    await grantLicense(email);

    await page.goto("/hep?protocol=acl-reconstruction&phase=0");
    await expect(page.getByText(/Loaded \d+ exercises from the Movement Lab/)).toBeVisible();
    await expect(page.getByLabel("Program name")).toHaveValue(
      "ACL Reconstruction — Phase 1 — Protection and quadriceps activation",
    );

    const rows = page.locator('input[placeholder="Straight leg raise"]');
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toHaveValue("Quad Set");
  });

  test("an exercise selection deep-link prefills dosage but not the program name", async ({ page }) => {
    const email = freshEmail("selection-draft");
    await signUpAndEnterApp(page, email);
    await grantLicense(email);

    await page.goto("/hep?exercises=clamshell,glute-bridge");
    await expect(page.getByText("Loaded 2 exercises from the Movement Lab")).toBeVisible();

    const rows = page.locator('input[placeholder="Straight leg raise"]');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toHaveValue("Clamshell");
    await expect(rows.nth(1)).toHaveValue("Glute Bridge");

    // Sets and reps come straight from the bank's structured dosage — no string parsing.
    await expect(page.locator('input[placeholder="3"]').first()).toHaveValue("2–3");
    await expect(page.locator('input[placeholder="12"]').first()).toHaveValue("10–15 each side");

    // The program name is deliberately left for the clinician to fill in, which is also
    // what keeps Save disabled until they do.
    await expect(page.getByLabel("Program name")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Save program" })).toBeDisabled();
  });

  test("an unknown protocol falls back to an empty builder rather than an error", async ({ page }) => {
    const email = freshEmail("bad-params");
    await signUpAndEnterApp(page, email);
    await grantLicense(email);

    await page.goto("/hep?protocol=not-a-real-protocol&phase=99");
    await expect(page.getByRole("heading", { name: "Home Exercise Programs" })).toBeVisible();
    await expect(page.getByText(/Loaded \d+ exercises/)).toBeHidden();
    await expect(page.locator('input[placeholder="Straight leg raise"]')).toHaveCount(0);
  });
});
