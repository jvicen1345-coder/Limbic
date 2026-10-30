import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { extractPassages, type LibraryPassage, type PassageKind } from "@/lib/library-passages";
import { librarySources } from "@/lib/library-sources";
import { EXAM_PREP_GUIDES, EXAM_PREP_PARTS } from "@/lib/exam-prep";

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

const CONTENT = path.join(process.cwd(), "content");

/** Every document search indexes, read as an ordinary reader would see it. */
const SOURCES = librarySources({ admin: false });

function passagesFor(slug: string): LibraryPassage[] {
  const source = SOURCES.find((entry) => entry.slug === slug);
  assert.ok(source, `${slug} is not a searchable source`);
  const html = readFileSync(path.join(CONTENT, source.dir, `${slug}.html`), "utf8");
  return extractPassages(slug, html, source.profile);
}

/** Lowest plausible passage count per document. Observed counts at the time of writing, in
 *  the same order: 422, 231, 181, 224, 160, 202, 560 | 362, 212, 186. */
const FLOOR: Record<string, number> = {
  "shoulder-examination": 300,
  "neuro-examination": 160,
  "hip-examination": 130,
  "knee-examination": 160,
  "ankle-examination": 110,
  "joint-mobilization": 140,
  "muscle-oina": 400,
  "neuro-exam-prep": 250,
  "cervical-exam-prep": 150,
  "motor-control-exam-prep": 130,
};

/** Kinds every document must produce something of, across both families. `number`, `case`,
 *  `callout`, `statnote` and `keypoint` are all family- or document-specific — an Exam Prep
 *  guide has no numcells, a playbook has no key points — while rows, prose, headings and
 *  references exist in all ten. */
const UNIVERSAL_KINDS: PassageKind[] = ["row", "prose", "heading", "reference"];

describe("playbook passage extraction", () => {
  it("extracts a plausible number of passages from every served guide", () => {
    for (const guide of SOURCES) {
      const floor = FLOOR[guide.slug];
      assert.ok(floor !== undefined, `${guide.slug} has no floor — add one when adding a document`);
      const count = passagesFor(guide.slug).length;
      assert.ok(
        count >= floor,
        `${guide.slug} extracted ${count} passages, below the floor of ${floor} — a selector in lib/library-passages.ts has probably stopped matching this document's markup`
      );
    }
  });

  it("finds every universal kind of passage in every guide", () => {
    for (const guide of SOURCES) {
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
    for (const guide of SOURCES) {
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
    for (const guide of SOURCES) {
      const texts = passagesFor(guide.slug)
        .filter((passage) => passage.kind === "prose")
        .map((passage) => passage.text);
      assert.equal(new Set(texts).size, texts.length, `${guide.slug} has duplicate prose passages`);
    }
  });

  it("leaves the playbooks' own controls out of the text", () => {
    // Recall/Hide buttons and the controls the playbook scripts inject are not content; left
    // in, they would put "Recall" into the searchable text of every table in the library.
    for (const guide of SOURCES) {
      for (const passage of passagesFor(guide.slug)) {
        assert.ok(
          !/\bHide missed\b/.test(passage.text),
          `${guide.slug} leaked a control into a ${passage.kind} passage: ${passage.text.slice(0, 80)}`
        );
      }
    }
  });

  it("skips reference-section headings, which are paper titles rather than topics", () => {
    for (const guide of SOURCES) {
      const refHeadings = passagesFor(guide.slug).filter(
        (passage) => passage.kind === "heading" && passage.sectionId === "refs"
      );
      assert.equal(refHeadings.length, 0, `${guide.slug} indexed ${refHeadings.length} refs headings`);
    }
  });
});

describe("Exam Prep extraction", () => {
  it("finds exactly the key points each guide's card claims", () => {
    // The strongest available check that the profile matches these documents: the registry
    // states a key-point count per guide independently of the markup, so an extractor that
    // drifts off `div.kp` stops agreeing with it. Dropping the breakdowns nested inside each
    // key point would keep the count right, which is why the next test exists too.
    for (const guide of EXAM_PREP_GUIDES) {
      const keypoints = passagesFor(guide.slug).filter((passage) => passage.kind === "keypoint");
      assert.equal(
        keypoints.length,
        guide.keyPoints,
        `${guide.slug} extracted ${keypoints.length} key points, its card claims ${guide.keyPoints}`
      );
    }
  });

  it("keeps a key point's breakdown inside the key point, not beside it", () => {
    // Each `div.kp` holds a prompt, an answer and a `details.bd` breakdown. A student
    // searching any of those wants the one card, so the breakdown must be part of the key
    // point's text and must not also appear as its own `case` passage.
    const cervical = passagesFor("cervical-exam-prep");
    const keypoints = cervical.filter((passage) => passage.kind === "keypoint");
    assert.ok(
      keypoints.some((passage) => passage.text.includes("Break it down")),
      "the breakdown is not inside the key point's text"
    );

    const cases = cervical.filter((passage) => passage.kind === "case");
    for (const entry of cases) {
      assert.ok(
        !keypoints.some((keypoint) => keypoint.text.includes(entry.text)),
        `a breakdown was indexed twice: ${entry.text.slice(0, 70)}`
      );
    }
  });

  it("keeps a key point whole where the playbook profile would fragment it", () => {
    // This is what the profiles are for, and it is not a matter of volume: run the playbook
    // selectors over a study guide and you get *more* passages, not fewer (256 against 212
    // for the cervical guide), because every paragraph inside a key point becomes its own
    // loose result. The reader is then handed half an answer per row, and the card that holds
    // the prompt, the answer and the breakdown together never appears at all.
    const html = readFileSync(path.join(CONTENT, "exam-prep", "cervical-exam-prep.html"), "utf8");
    const withPlaybookProfile = extractPassages("cervical-exam-prep", html);
    const withOwnProfile = passagesFor("cervical-exam-prep");

    assert.equal(
      withPlaybookProfile.filter((passage) => passage.kind === "keypoint").length,
      0,
      "the playbook profile should not know about key points"
    );

    const keypoint = withOwnProfile.find((passage) => passage.kind === "keypoint");
    assert.ok(keypoint, "no key point to compare against");
    // Two fragments far enough apart that only a passage spanning the whole card holds both.
    const head = keypoint.text.slice(0, 40);
    const tail = keypoint.text.slice(-40);
    assert.ok(
      withOwnProfile.some((passage) => passage.text.includes(head) && passage.text.includes(tail)),
      "the Exam Prep profile did not keep the key point whole"
    );
    assert.ok(
      !withPlaybookProfile.some((passage) => passage.text.includes(head) && passage.text.includes(tail)),
      "the playbook profile unexpectedly kept the key point whole — this comparison is no longer meaningful"
    );
  });

  it("leaves the arcade and atlas companions out of the index", () => {
    // Deliberate, not an oversight: both are interactive — five study games and a diagram
    // atlas — with no <section>, no prose and no headings, so they yield nothing to rank.
    // If that ever changes, this fails and the decision gets revisited rather than inherited.
    for (const guide of EXAM_PREP_GUIDES) {
      for (const part of EXAM_PREP_PARTS) {
        const slug = `${guide.slug}-${part}`;
        assert.ok(
          !SOURCES.some((source) => source.slug === slug),
          `${slug} is being indexed; it was excluded on the grounds that it carries no text`
        );
        const html = readFileSync(path.join(CONTENT, "exam-prep", `${slug}.html`), "utf8");
        assert.equal(
          extractPassages(slug, html, SOURCES[0].profile).length + extractPassages(slug, html).length,
          0,
          `${slug} now carries extractable text, so excluding it is no longer free`
        );
      }
    }
  });
});

describe("searchable sources", () => {
  it("covers both pools and no document twice", () => {
    const slugs = SOURCES.map((source) => source.slug);
    assert.equal(new Set(slugs).size, slugs.length, "a slug appears in both pools");
    assert.ok(SOURCES.some((source) => source.pool === "playbook"));
    assert.ok(SOURCES.some((source) => source.pool === "study-guide"));
  });

  it("points every source at a file that exists", () => {
    for (const source of SOURCES) {
      const file = path.join(CONTENT, source.dir, `${source.slug}.html`);
      assert.ok(readFileSync(file, "utf8").length > 0, `${file} is empty or missing`);
    }
  });
});
