import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { GUIDES } from "@/lib/guides";
import { extractPassages, type PassageKind } from "@/lib/playbook-passages";

/**
 * The guard on cross-playbook search's one real liability.
 *
 * The extractor couples to markup nobody authors with search in mind. The guide route treats
 * these files as opaque bytes, so nothing else in the codebase breaks if a class is renamed
 * or a table loses its tbody — the index just quietly stops carrying those passages, and the
 * only symptom is a student not finding something. These floors turn that into a failed
 * build.
 *
 * The numbers are deliberately below what each guide extracts today, not equal to it: a
 * playbook gaining a section or an author rewriting a table should not fail CI. They are set
 * to catch a whole kind of passage disappearing, which is what a markup change actually does.
 */

const DIR = path.join(process.cwd(), "content", "playbooks");

function passagesFor(slug: string) {
  return extractPassages(slug, readFileSync(path.join(DIR, `${slug}.html`), "utf8"));
}

/** Lowest plausible passage count per guide. Observed counts at the time of writing, in the
 *  same order: 426, 233, 184, 227, 161, 204, 561. */
const FLOOR: Record<string, number> = {
  "shoulder-examination": 300,
  "neuro-examination": 160,
  "hip-examination": 130,
  "knee-examination": 160,
  "ankle-examination": 110,
  "joint-mobilization": 140,
  "muscle-oina": 400,
};

/** Kinds every guide must produce something of. Deliberately short: only `number`, `case`,
 *  `callout` and `statnote` are genuinely optional per guide — not every guide has a numbers
 *  grid or a drill — while rows, prose, headings and references exist in all seven. */
const UNIVERSAL_KINDS: PassageKind[] = ["row", "prose", "heading", "reference"];

describe("playbook passage extraction", () => {
  it("extracts a plausible number of passages from every served guide", () => {
    for (const guide of GUIDES) {
      const floor = FLOOR[guide.slug];
      assert.ok(floor !== undefined, `${guide.slug} has no floor — add one when adding a guide`);
      const count = passagesFor(guide.slug).length;
      assert.ok(
        count >= floor,
        `${guide.slug} extracted ${count} passages, below the floor of ${floor} — a selector in lib/playbook-passages.ts has probably stopped matching this document's markup`
      );
    }
  });

  it("finds every universal kind of passage in every guide", () => {
    for (const guide of GUIDES) {
      const kinds = new Set(passagesFor(guide.slug).map((passage) => passage.kind));
      for (const kind of UNIVERSAL_KINDS) {
        assert.ok(kinds.has(kind), `${guide.slug} produced no "${kind}" passages at all`);
      }
    }
  });

  it("gives every passage a section anchor to link to", () => {
    // A passage with no anchor still ranks, but its result links to the top of a
    // quarter-megabyte document, which is the same as not linking. Today every passage in
    // every guide sits inside an identified section; this holds that.
    for (const guide of GUIDES) {
      const orphans = passagesFor(guide.slug).filter((passage) => !passage.sectionId);
      assert.equal(orphans.length, 0, `${guide.slug} has ${orphans.length} passages with no section id`);
    }
  });

  it("indexes the prose and statnotes the in-page filter cannot match", () => {
    // The reason this index exists. The playbooks' own filter collects table rows, numcells,
    // reference entries, drill cases and callouts — a `p.statnote` is none of those, so it is
    // unreachable from inside the document it lives in.
    const knee = passagesFor("knee-examination");
    const statnotes = knee.filter((passage) => passage.kind === "statnote");
    assert.ok(statnotes.length >= 5, `expected the knee's statnotes, found ${statnotes.length}`);

    const apley = statnotes.find((passage) => passage.text.includes("Apley sums"));
    assert.ok(apley, "the meniscal-test arithmetic statnote is missing from the index");
    assert.equal(apley.sectionId, "special", "it should deep-link to the special tests section");

    assert.ok(
      knee.some((passage) => passage.kind === "prose"),
      "the knee guide produced no prose passages"
    );
  });

  it("does not index a paragraph twice when another unit already carries it", () => {
    // Prose inside a callout, a drill case or a table is that unit's text. Indexing it again
    // would spend two result rows on one answer.
    for (const guide of GUIDES) {
      const texts = passagesFor(guide.slug)
        .filter((passage) => passage.kind === "prose")
        .map((passage) => passage.text);
      assert.equal(new Set(texts).size, texts.length, `${guide.slug} has duplicate prose passages`);
    }
  });

  it("leaves the playbooks' own controls out of the text", () => {
    // Recall/Hide buttons and the controls the playbook scripts inject are not content; left
    // in, they would put "Recall" into the searchable text of every table in the library.
    for (const guide of GUIDES) {
      for (const passage of passagesFor(guide.slug)) {
        assert.ok(
          !/\bHide missed\b/.test(passage.text),
          `${guide.slug} leaked a control into a ${passage.kind} passage: ${passage.text.slice(0, 80)}`
        );
      }
    }
  });

  it("skips reference-section headings, which are paper titles rather than topics", () => {
    for (const guide of GUIDES) {
      const refHeadings = passagesFor(guide.slug).filter(
        (passage) => passage.kind === "heading" && passage.sectionId === "refs"
      );
      assert.equal(refHeadings.length, 0, `${guide.slug} indexed ${refHeadings.length} refs headings`);
    }
  });
});
