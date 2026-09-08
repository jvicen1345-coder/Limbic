# Building the knee guide

Follows `docs/joint-playbook-template.md`, same five steps as the hip build in
`docs/hip-guide-build/`, and the same rule: a value goes in unmarked only if the freely readable
text of a named paper carries that exact value.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — competencies in examination order |
| 2 · Source bank | `sources.md` | in progress — 4 papers read (2 with quotable figures) |
| 3 · Draft | — | not started |
| 4 · Adversarial verification | — | not started |
| 5 · Build the page | — | not started |

## The knee is harder than the hip, and it is worth knowing why now

The hip guide's spine is the Koc 2025 clinical practice guideline: openly hosted by the Academy
of Orthopaedic Physical Therapy, all 31 pages readable free, and carrying **graded**
recommendations, so every treatment value could be quoted with its strength of evidence attached.

The knee has no equivalent that this build can reach.

- **Logerstedt 2017**, *Knee Stability and Movement Coordination Impairments: Knee Ligament
  Sprain Revision 2017* (JOSPT 47(11):A1-A47, PMID 29089004) is abstract-only, and the abstract
  is **purely descriptive** — it states the guideline's purpose and carries not one value. It
  cannot support a single number.
- The Academy's clinical practice guideline index page links no guideline PDFs at all; the hip
  CPG was reachable by direct URL rather than from that index, and the same trick does not
  produce a knee equivalent.
- **Bove 2026**, the total knee arthroplasty CPG revision (Phys Ther 106(7), PMC13403188), *is*
  free full text — but it covers post-arthroplasty management, which is a narrow slice of a knee
  examination guide rather than its spine.

So the knee's treatment section will not be able to do what the hip's does. That is a fact about
the literature this build can reach, not a gap to paper over, and the guide will say so rather
than quietly sounding as confident about knee treatment as it does about hip treatment.

`lookup.py` is the same Europe PMC query tool the hip build used.
