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
| 5 · Build the page | `content/playbooks/knee-examination.html` | built with the McMurray figure; not yet served |

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
  free full text, and its full text — unlike its purely descriptive abstract — carries fourteen
  recommendations each with an explicit evidence quality. It is the one graded guideline this
  build can use. But it covers post-arthroplasty management, so it earns a properly graded
  post-surgical sub-section and cannot be stretched across the examination sections.

So the knee's treatment section will not be able to do what the hip's does. That is a fact about
the literature this build can reach, not a gap to paper over, and the guide will say so rather
than quietly sounding as confident about knee treatment as it does about hip treatment.

`lookup.py` is the same Europe PMC query tool the hip build used.
