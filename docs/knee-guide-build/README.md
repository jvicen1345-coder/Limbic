# Building the knee guide

Follows `docs/joint-playbook-template.md`, same five steps as the hip build in
`docs/hip-guide-build/`, and the same rule: a value goes in unmarked only if the freely readable
text of a named paper carries that exact value.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 37 competencies in examination order; limits paragraph revised twice |
| 2 · Source bank | `sources.md` | done — 11 sources usable, incl. two AAOS guidelines found in the second correction |
| 3 · Draft | `draft.md` | superseded by the built page |
| 4 · Adversarial verification | `verification.md` | done — 4 defects in 48 claims, all fixed |
| 5 · Build the page | `content/playbooks/knee-examination.html` | built, **not served** — carries `comingSoon` in `src/lib/guides.ts` |
| 6 · Rebuild to shoulder depth | in progress | see below |

## Rebuild — why, and what is left

The built page passes its own verification and is still the weakest of the served guides, for a
reason that is structural rather than factual. Measured against the shoulder:

| | knee | shoulder |
|---|---|---|
| Checklist items | 12 | 32 |
| Tables | 10 | 28 |
| **Distinct table column signatures** | **1** | **28** |
| Figures | 1 | 8 |
| References | 12 | 83 |

The single number that explains the gap is the third one. Nine of the knee's ten tables are the
same three columns — `Item | How it is performed | Finding / norm`. The shoulder builds a
different table for each question it asks: `Muscle | Position & what you stabilize | Normal |
Short means | What fakes a result`, `Test | What it compresses or contracts | Set-up | Positive |
Does it change your mind?`, `Pain location | Candidate source | The test that addresses it | The
finding that confirms it`. The brief asks for decision tables and for a "what fakes a result"
column wherever something is commonly done wrong; the knee currently has neither. That, not the
prose, is what makes it read thinner.

**Done in this pass**
- Second correction to the source bank: two graded AAOS guidelines found, both already cited
  elsewhere in this repository (`sources.md`).
- Five false claims removed from the page — the guide told students that graded evidence existed
  for arthroplasty only, and that ligament management had none.
- Section 10 gained the graded osteoarthritis and ACL sets, 9 rows under 2 group headings.
- The limb-symmetry entry moved from `no traceable source` to a sourced, graded uncertainty.

- Section 01 rebuilt: 12 pointer rows → 37 competencies under the ten questions `scope.md`
  already uses, each with a finding rather than a description of the section.
- Section 05 rebuilt into three purpose-built tables, including the brief's mandated
  "What fakes a result" column — the first one anywhere in the knee, hip or ankle guides —
  and a decision table keyed on end feel.

Distinct table column signatures: **1 → 5**. Tables 10 → 12.

- Sections 03, 04, 06, 07, 08 and 09 restructured. Column signatures **1 → 15** across 16
  tables. Only sections 02 and 10 still carry the generic three.
- A second figure: a forest plot of the four meniscal odds ratios against the null at 1.

### The figure-label bug, which is not only the knee's

`figure text{fill:currentColor}` is a CSS rule, and a presentation attribute loses to a CSS
rule. Every `fill="var(--accent)"` on every figure label in every guide was therefore ignored
and painted one colour. Measured: **45 labels across four guides, all 45 ignored** — knee 4,
hip 1, ankle 2, **shoulder 38**. In the knee's McMurray figure that meant "sensitivity" and
"specificity" rendered identically, so the colour legend did not work at all.

Fixed here by splitting the rule on `:not([fill])` / `[fill]`. **The same one-line fix is
still owed to the hip, ankle and shoulder guides** — the shoulder is served to users now, and
its eight figures are the ones most affected.

Fixing it made three colours visible for the first time, so they got validated for the first
time: `--accent` against `--d2` is ΔE 11.7 in light, below the 15 floor — two blues a reader
cannot reliably separate. The specificity line moved to `--mod`, which passes at ΔE 30.1 light
and 27.7 dark. `--mod` and `--low` appear only in CSS in this guide, so neither carries status
meaning here.

- Section 02 is now a `.numgrid` of **20 cells**, in the shoulder's format: one value per cell,
  four columns, five full rows and no ragged last row. Four of the twenty record an absence,
  which is how the shoulder handles its own conventions. The six argument rows were cut rather
  than reformatted - the "Five questions" table added to section 07 in phase 4 had duplicated
  them, which only became visible on re-reading the two sections side by side.

**Still to do**
- Section 10, the last generic table - and its real defect is not the columns. Three
  incommensurable grading scales share one column, distinguished only by a dash in the row
  name: JOSPT letters (`- B`), TKA evidence quality (`- high`), and AAOS recommendation
  strength (`- Strong`). "Moderate" appears in two of them meaning different things. The grade
  needs its own column carrying its scale.
- Figures: 2 → 6-8.
- The remaining `Convention` claims re-checked against the two new guidelines.

**A gap this rebuild exposed.** A guide carrying `comingSoon` is skipped by the served-guides
test, so its card counts — sections, items, references — are asserted by nothing. Both counts
moved in this rebuild (items 12 → 37, references 10 → 12) and had to be verified by hand against
the file. Either the counts should be derived from the document, or the test should check
coming-soon guides against the file on disk rather than over HTTP.

## CORRECTION: the knee guideline I said was unreachable

An earlier version of this file claimed the knee has **no freely readable graded examination
guideline**, and the whole knee guide was framed around that. It was wrong, and `sources.md`
records the error in full rather than quietly editing it away.

*Knee Pain and Mobility Impairments: Meniscal and Articular Cartilage Lesions, Revision 2018* is
openly hosted by the Academy of Orthopaedic Physical Therapy, all 50 pages, and graded. It carries
19 lettered recommendations, meniscal test accuracy for McMurray, Thessaly, Apley and joint line
tenderness, reliability figures for three of them, and the essential data elements.

**How I missed it.** I searched Europe PMC, found the *Knee Ligament Sprain* guideline
abstract-only, checked the Academy's guideline index page, saw it links no PDFs, and concluded the
hip CPG had been reachable only by a lucky direct URL. I never searched **this repository**, which
already references six openly hosted guideline PDFs including the hip one. One `grep` would have
found it.

**The rule that follows, and the ankle build inherits:** when a source is *hosted* rather than
*indexed*, absence from a search engine and absence from an index page are both weak evidence.
Check what the project already cites before declaring anything unreachable.

What stands from the earlier finding: the *Knee Ligament Sprain* guideline really is abstract-only
and really does carry nothing quotable, so ligament management still has no graded source here.
And the `no traceable source` flags for patellofemoral test accuracy, the Q angle and normative
knee ROM are unaffected — the 2018 guideline's scope is meniscal and cartilage lesions.

`lookup.py` is the same Europe PMC query tool the hip build used.
