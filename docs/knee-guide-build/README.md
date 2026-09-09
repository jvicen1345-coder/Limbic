# Building the knee guide

Follows `docs/joint-playbook-template.md`, same five steps as the hip build in
`docs/hip-guide-build/`, and the same rule: a value goes in unmarked only if the freely readable
text of a named paper carries that exact value.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 37 competencies in examination order |
| 2 · Source bank | `sources.md` | in progress — 7 papers read, 5 usable; 5 values untraceable |
| 3 · Draft | `draft.md` | done — 12 sections, 47 citations, 7 references |
| 4 · Adversarial verification | `verification.md` | done — 4 defects in 48 claims, all fixed |
| 5 · Build the page | `content/playbooks/knee-examination.html` | done — built with the McMurray figure; **served** at `/student/guides/knee-examination` |

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
