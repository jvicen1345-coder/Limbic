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

**Still to do**
- Section 01: 12 rows, 8 of them section pointers rather than competencies, against 37 in
  `scope.md`. This is the most visible gap and the next piece of work.
- Purpose-built table columns per section, replacing the repeated generic three.
- A "what fakes a result" column wherever a knee test is commonly done wrong.
- Figures: 1 → 6-8.
- The remaining `Convention` claims (44 of them) re-checked against the two new guidelines.

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
