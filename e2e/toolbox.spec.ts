import { test, expect } from "@playwright/test";
import { CLINICIAN_TOOLBOX, toolboxMatches, toolboxTerms } from "../src/lib/clinician-toolbox";

/**
 * The Clinical Toolbox filter, asserted directly rather than through the page.
 *
 * These are pure-function checks with no browser in them — same shape as tours.spec.ts. They
 * exist because the first version of this filter passed every visual check and still failed
 * on the vocabulary a clinician types: it matched a bare substring, so "ce" hit nine of the
 * fifteen tools through "eviden(ce)", "practi(ce)" and "referen(ce)". Nothing about that is
 * visible in a screenshot, and nothing about it fails a typecheck.
 */

/** Every tool paired with the title of the group it sits in, which is part of what a query
 *  searches. Uses the unfiltered list so the clinic-admin tools are covered too. */
const ALL_TOOLS = CLINICIAN_TOOLBOX.flatMap((g) => g.tools.map((t) => ({ tool: t, group: g.title })));

function search(query: string): string[] {
  const terms = toolboxTerms(query);
  return ALL_TOOLS.filter(({ tool, group }) => toolboxMatches(tool, group, terms)).map(({ tool }) => tool.name);
}

test.describe("Clinical Toolbox filter", () => {
  test("an empty query matches everything", () => {
    expect(search("")).toHaveLength(ALL_TOOLS.length);
    expect(search("   ")).toHaveLength(ALL_TOOLS.length);
  });

  test("a short term matches only where it starts a word", () => {
    // The regression this whole file exists for. Under substring matching "ce" hit nine of
    // the fifteen tools, through "eviden(ce)", "practi(ce)", "referen(ce)" and
    // "specifi(ci)ty". Both survivors are real: CE Tracker by name, and Clinic Report because
    // its description is "...with CE compliance".
    expect(search("ce").sort()).toEqual(["CE Tracker", "Clinic Report"]);
    // The four it used to reach through the middle of a word, and no longer does.
    for (const name of ["Clinical Practice Guidelines", "Clinical Reference", "Special Tests", "Limbic Agent"]) {
      expect(search("ce"), `"ce" should no longer reach ${name}`).not.toContain(name);
    }
  });

  test("a prefix still matches the word it starts", () => {
    expect(search("measur")).toContain("Outcome Measures");
    expect(search("documenta")).toContain("Documentation Templates");
    expect(search("dynamom")).toEqual(["Force Lab"]);
  });

  test("every term has to match, not just one", () => {
    const both = search("special tests");
    expect(both).toEqual(["Special Tests"]);
    // "special" alone is looser — the point is that adding a term narrows rather than widens.
    expect(search("special").length).toBeGreaterThanOrEqual(both.length);
  });

  test("a tool is findable by the group it lives in", () => {
    // "Examine and screen" holds these three; none of them says "examine" in its own copy.
    expect(search("examine").sort()).toEqual(["Outcome Measures", "Screening & Decision Support", "Special Tests"]);
  });

  test("word boundaries include hyphens and ampersands", () => {
    expect(search("auth")).toContain("Documentation Templates"); // "prior-auth"
    expect(search("decision")).toContain("Screening & Decision Support");
  });

  test("a query that matches nothing returns nothing rather than everything", () => {
    expect(search("zzzz")).toEqual([]);
  });

  test("regex metacharacters in a query are literal, not a pattern", () => {
    // A user typing a stray bracket should get no results, not a SyntaxError.
    expect(() => search("(")).not.toThrow();
    expect(search("(")).toEqual([]);
    expect(() => search("a+b[")).not.toThrow();
  });
});
