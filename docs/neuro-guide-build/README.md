# Building the neurologic examination guide

Follows `docs/joint-playbook-template.md`, the same five steps as the hip and knee builds, and
the same rule: **a value goes in unmarked only if the freely readable text of a named paper
carries that exact value.**

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 36 competencies in dependency order, 39 checklist rows as built |
| 2 · Source bank | `sources.md` | done — 14 sources read, 9 usable, 3 existence-only, 2 rejected |
| 3 · Draft | `content.py` | done — see `draft.md` for why the draft is executable here |
| 4 · Adversarial verification | `verification.md` | done — 3 defects found and fixed; 68 claim strings machine-checked |
| 5 · Build the page | `content/playbooks/neuro-examination.html` | done — **served** at `/student/guides/neuro-examination` |

## This is the first guide in the series that is not a joint

The four before it examine a region and route a finding to a tissue. This one examines a system,
which changes two things, and `scope.md` argues both at length:

- **The order is gating, not anatomy.** Each phase decides whether the next one can be believed
  — cognition before sensation, sensation before coordination. That dependency is the spine of
  the checklist.
- **The finding is a level, not a tissue.** So the last column of every table carries the
  discriminator between two levels, and the guide ends in a localization table rather than a
  treatment section.

## What the sourcing found, which was not what the joint builds found

Most of the classical neurologic examination is **taught everywhere and measured nowhere.**
`scope.md` predicted this before searching and the search confirmed it: the guide carries **18
no-traceable-source flags** and more `Convention` marks than any of the four joint guides. The
coma scale totals, the orthostatic threshold, the cognitive screen cutoffs, the tuning-fork
frequency, the named stages of motor recovery and every coordination norm are flagged in place
rather than filled in.

What *is* well measured is the scoring laid over the examination, and that is where the guide's
weight sits: the international standards for classifying spinal cord injury (Rupp 2021) for
sensory and motor scoring, and the Academy of Neurologic Physical Therapy's core outcome
measures guideline (Moore 2018) for everything functional. Between them they carry 67 of the
guide's 113 citations.

## Reproducing the checks

```sh
python3 docs/neuro-guide-build/verify.py       # 68 claim strings against the cited source text
python3 docs/neuro-guide-build/checkcites.py   # every citation resolves; no orphan reference
python3 docs/neuro-guide-build/build.py        # regenerate the page from content.py
```

`verify.py` re-fetches any source text it needs, so nothing third-party is committed here. Both
checks are fast and both should be re-run after any edit to `content.py`.

## Tools

`lookup.py` is the Europe PMC query tool the hip and knee builds used, unchanged. `oa.py` is the
same restricted to free full text. `getdoc.py` was added for this build: several of these sources
expose no `fullTextXML` through Europe PMC and are only readable from the PMC HTML page, which is
how the ISNCSCI standard — the most-cited source here — was read.

## The rule the knee build left behind, applied

*"Check what the project already cites before declaring anything unreachable."* Done first, and
it came back empty: the four existing guides cite 80-odd musculoskeletal sources and nothing
neurologic. This build inherited no source bank and started from zero.
