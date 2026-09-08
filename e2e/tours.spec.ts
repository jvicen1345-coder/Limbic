import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { TOURS, SECTION_TOURS, WELCOME_TOUR_ID, findTour } from "../src/lib/tours";

/**
 * The tour registry (src/lib/tours.ts), checked as data — no page, no database, so this adds
 * nothing to the suite's write-lock contention.
 *
 * The check that earns its place is the last one. A tour step points at an element by a
 * `data-tour` attribute somewhere else in the tree, and nothing links the two: delete the
 * attribute while tidying a page and the tour still compiles, still runs, and silently skips
 * that step at TARGET_WAIT_MS. That is the kind of breakage nobody notices for months,
 * because tours are the thing existing users never run.
 */

/** Every source file that could carry a data-tour attribute. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "node_modules" && entry !== "generated") sourceFiles(full, acc);
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      acc.push(full);
    }
  }
  return acc;
}

const SOURCE = sourceFiles("src")
  // The registry itself names every target; including it would make the check tautological.
  .filter((f) => !f.endsWith("lib/tours.ts"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

test.describe("tour registry", () => {
  test("every tour is uniquely identified and complete", () => {
    const ids = TOURS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findTour(WELCOME_TOUR_ID), "the welcome tour must exist — the app auto-starts it by id").not.toBeNull();
    expect(SECTION_TOURS.some((t) => t.id === WELCOME_TOUR_ID)).toBe(false);

    for (const tour of TOURS) {
      expect(tour.name, `${tour.id} needs a name`).toBeTruthy();
      expect(tour.blurb, `${tour.id} needs a blurb for the picker`).toBeTruthy();
      expect(tour.route.startsWith("/"), `${tour.id} route must be absolute`).toBe(true);
      expect(tour.steps.length, `${tour.id} needs steps`).toBeGreaterThan(1);

      const stepIds = tour.steps.map((s) => s.id);
      expect(new Set(stepIds).size, `${tour.id} has duplicate step ids`).toBe(stepIds.length);

      for (const step of tour.steps) {
        expect(step.title, `${tour.id}/${step.id} needs a title`).toBeTruthy();
        expect(step.description, `${tour.id}/${step.id} needs a description`).toBeTruthy();
        if (step.route) expect(step.route.startsWith("/"), `${tour.id}/${step.id} route must be absolute`).toBe(true);
      }
    }
  });

  test("every step route sits inside its tour's scope", () => {
    // The player ends a tour the moment the pathname leaves this prefix — that is what stops
    // a tour card following a reader onto an unrelated page. A step routed outside its own
    // tour's scope would end the tour by navigating to itself.
    for (const tour of TOURS) {
      expect(tour.scope.startsWith("/"), `${tour.id} scope must be an absolute prefix`).toBe(true);
      expect(tour.route.startsWith(tour.scope), `${tour.id} starts at ${tour.route}, outside its scope ${tour.scope}`).toBe(
        true,
      );
      for (const step of tour.steps) {
        if (!step.route) continue;
        expect(
          step.route.startsWith(tour.scope),
          `${tour.id}/${step.id} routes to ${step.route}, outside its scope ${tour.scope}`,
        ).toBe(true);
      }
    }
  });

  test("a tour that walks between pages starts on a route its first step agrees with", () => {
    for (const tour of TOURS) {
      const firstRoute = tour.steps.find((s) => s.route)?.route;
      if (!firstRoute) continue;
      expect(tour.route, `${tour.id} starts at ${tour.route} but its first routed step wants ${firstRoute}`).toBe(
        firstRoute,
      );
    }
  });

  test("every step target resolves to a real anchor in the source", () => {
    const missing: string[] = [];

    for (const tour of TOURS) {
      for (const step of tour.steps) {
        if (step.target === "center") continue;
        const match = step.target.match(/^\[data-tour="([a-z0-9-]+)"\]$/);
        // Targets are data-tour selectors by convention — a raw class or tag selector would
        // couple a tour to styling that changes for unrelated reasons.
        expect(match, `${tour.id}/${step.id} target ${step.target} is not a data-tour selector`).not.toBeNull();
        const name = match![1];

        // Three ways an anchor is written in this codebase, all of which render the same
        // attribute: literally on an element; as the `dataTour` prop AppShell's NavLink and
        // NavToggle forward (the sidebar anchors, which is most of the welcome tour); or
        // built from a template (the toolbox groups derive theirs from each group's title —
        // see app/(app)/pro/toolbox/page.tsx).
        const literal = SOURCE.includes(`data-tour="${name}"`);
        const viaProp = SOURCE.includes(`dataTour="${name}"`);
        const templated = name.startsWith("toolbox-group-") && SOURCE.includes("data-tour={`toolbox-group-");
        if (!literal && !viaProp && !templated) missing.push(`${tour.id}/${step.id} → ${name}`);
      }
    }

    expect(missing, `tour steps pointing at anchors that no longer exist:\n${missing.join("\n")}`).toEqual([]);
  });
});
