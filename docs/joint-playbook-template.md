# Building a joint playbook from the template

`joint-playbook-template.html` is the shoulder playbook with every clinical claim removed and
the machinery kept. It runs as-is: open it in a browser and recall, filtering, the practice
planner, the PDF importer and the citation linker all work against one worked example row.

**Fill it in. Do not regenerate it.** The CSS and JavaScript took a long session to get right,
and several of the bugs fixed along the way are invisible until you hit them.

---

## The order that matters

The single most important thing about this series is that the content survives being checked.
The shoulder guide's first draft contained **37 errors across 545 claims** — roughly one claim
in fourteen — including one fabricated citation and two references to studies that do not
exist. None of those were found by re-reading. They were found by chasing every claim to a
primary source.

So the order is:

1. **Scope.** Decide the competencies the guide covers, in the order the examination is
   performed. This is yours, not the literature's.
2. **Draft.** Write the content with a citation on every value.
3. **Verify — adversarially, section by section.** Give an agent the extracted text of one
   section and instruct it to find errors, not to confirm. Ask specifically: does the cited
   paper exist, is the first author right, does the paper report that exact number, does it
   support *this* claim, and is the population the same one implied. Have it report problems
   only, with severity.
4. **Correct**, and add references for anything the corrections introduce.
5. **Then** build the page.

Building before verifying wastes the build, because corrections change the structure.

---

## Conventions the machinery depends on

### Provenance
Every clinical value carries one of three states, and the guide's credibility rests on the
distinction being real:

- **unmarked** — traced to a source a reader can reach for free
- `<span class="prov c">Convention</span>` — taught everywhere, tested by nobody
- `<span class="prov x">Contested</span>` — measured, and the studies disagree; quote the range

If you cannot trace a value at all, say so in place rather than leaving it unmarked.

### Citations
`<span class="src">Author 2019</span>` auto-links to the reference entry whose `.au` field
starts with that surname and whose `.jo` field contains that year. So:

- the surname in the inline citation must match the first author in the entry
- a reference entry needs both `.au` and `.jo`; the linker parses those two fields
- year-less citations (a textbook, an organization) link if the surname is unique
- editorial notes like "no traceable source" are styled as flags, not citations
- accuracy figures with no citation are styled as data, not sources

### Import keywords
`data-imp="term|term|term"` on an answer cell is what the PDF importer matches a student's
own handout against. The rules, learned the hard way:

- **3-5 terms**, at least one of six characters or more
- terms must be able to **co-occur in one real sentence** — a match needs two hits, so a list
  of pure synonyms can never score
- **never bare numbers** (`60`, `120`) — they match any figure containing them
- exactly **one generic context word** per lane (`test`, `palpat`, `assess`). Two generics let
  any sentence score on every lane.

### Rows
`td.name` is the prompt, never the answer — the recall system leaves it visible. Lead each
answer cell with the decision or the number; provenance and caveats follow.

---

## What to change per joint

| Where | What |
|---|---|
| `<title>`, `<h1>`, eyebrow | Joint name |
| `.ver` spans (2 places) | Version and date — keep them in sync |
| Nav links | Section labels, if your sections differ |
| Section `<h2>` and `.lede` | Per joint |
| Table rows | The content |
| `#refs` groups and entries | The sources you actually cite |
| `<footer>` | What is original, what is sourced, principal sources by author and year |
| **localStorage keys** (6, all in the scripts) | `JOINT-comp-v1`, `JOINT-recall-v1/v2/v3`, `JOINT-missed-v1`, `JOINT-add-v1` |

Section IDs are referenced by the nav, the filter and the planner. If you rename one, rename
it everywhere.

**The storage keys are not optional.** On claude.ai every artifact has its own origin, so the
keys never collided no matter what they were called. Served from one site they share an
origin: two guides carrying the same keys share check-off state, recall state, missed cells
and taught lanes, and a student ticking off the knee watches the shoulder's progress bar move.
The template ships them as `JOINT-*` so a miss is obvious rather than silent.

---

## What not to touch

The `<style>` block and both `<script>` blocks. They contain, among other things: a citation
linker that handles accented surnames and name particles, a sentence splitter tuned to how
PDF.js hands back lecture slides, private-use glyph stripping, an exclusive
passage-to-lane assignment so one sentence cannot claim six rows, contrast-safe theming in
light and dark, print handling that forces dropdowns open, and accessibility work (skip link,
landmark, table names, heading order).

---

## Before you publish any of them

- Every citation resolves and no reference is orphaned
- Contrast passes in both themes
- No horizontal overflow from 320px to 1400px
- Dropdowns print open
- The importer suggests content in the right rows, tested against a real lecture PDF
- Version stamp updated in both places

---

# The diagrams

The shoulder guide has eight. None of them are decorative, and none were drawn because the
section looked bare. Each one exists because it shows a mechanism a student would otherwise
have to assemble from prose — and that test is what you should apply before drawing anything.

The template carries **one worked figure** demonstrating every convention. What follows is the
taxonomy: the eight jobs the shoulder figures do, and what the equivalent is for another joint.
The anatomy doesn't transfer. The job does.

## The eight patterns

**1 · A value that isn't constant across its range.**
*Shoulder: scapulohumeral rhythm, drawn across elevation so the 2:1 everyone memorizes visibly
fails at both ends.* Use this wherever a single taught number is really an average. Knee: the
patellofemoral joint reaction force across flexion. Elbow: the biceps lever arm.

**2 · Which structure is loaded at which position.**
*Shoulder: the glenohumeral ligaments across the abduction arc.* The strongest pattern in the
set, because it converts a list into a spatial fact. Knee: which ligament restrains at which
flexion angle. Ankle: the lateral ligaments through inversion.

**3 · Normative ranges compared on one axis.**
*Shoulder: the full range by plane, so the planes can be compared rather than read serially.*
Any joint with per-plane norms.

**4 · What each measurement is referenced against.**
*Shoulder: three muscle-length tests, drawn against the table and the spine.* Students lose
marks on the reference point more than on the technique. Draw the reference, not the movement.

**5 · What a test actually loads, versus what its name implies.**
*Shoulder: what is genuinely being compressed under the arch.* Use wherever an eponymous test's
name misleads about its mechanism.

**6 · A resting position and the threshold that makes it a fault.**
*Shoulder: humeral head alignment from the side, normal beside two faults.* This is the
"draw the difference" pattern, and it's the one the template's worked figure demonstrates.

**7 · A mechanism shown twice — intact, then failed.**
*Shoulder: the deltoid–cuff force couple with and without the cuff.* The most transferable of
all. Any force couple, any passive restraint, any structure whose job is only visible in its
absence.

**8 · A procedural sequence that happens in one position.**
*Shoulder: the proximal humerus from above — rotate the bone, not your hand.* Use where the
sequence is the content and a student's instinct is to move the wrong thing.

## Conventions the machinery depends on

- **`currentColor` for structure.** Bones, outlines, reference lines. It themes for free in
  light and dark; a hardcoded hue will fail one of them.
- **`var(--accent)` for the thing being measured, `var(--hi)` for the fault.** One meaning per
  color, used consistently across every figure in the guide.
- **`role="img"` and an `aria-label`** carrying the same claim the picture makes. Not a
  description of the shapes — the claim.
- **`<text>` labels are masked by Recall** and lift individually on click. Keep them to a word
  or three; the explanation belongs in the `figcaption`.
- **Legends go in `.figgrid` below the SVG, not inside it.** In-SVG legend text cannot reflow,
  and on a phone it collides with the drawing. This cost a full round of rework on the shoulder
  ligament figure — the legend went into the SVG, then out to HTML, then back in for desktop
  with the HTML version kept for narrow screens.
- **Swap the `viewBox` at narrow widths** rather than letting a wide drawing shrink into
  illegibility. A three-line `matchMedia` listener; the shoulder ligament figure does this.
- **Measure, don't eyeball.** After drawing, check every `<text>` for overlap with
  `getBBox()` and for escaping the `viewBox`, at 390px as well as desktop. Every figure in the
  shoulder guide passes at zero overlaps; several did not on the first attempt.

## Before you draw

If a sentence says it faster, write the sentence. Six of the eight shoulder figures replaced
a paragraph that had failed to land. The two that were drawn first, because the section felt
like it needed a picture, were both rebuilt.
