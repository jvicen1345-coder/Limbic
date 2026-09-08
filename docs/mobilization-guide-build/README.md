# Building the joint mobilization guide

Follows `docs/joint-playbook-template.md`, but **this one is not a regional examination guide** and
the twelve-section shape from the shoulder, hip, knee and ankle does not transfer unchanged. Scope
needs rethinking rather than copying.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 28 competencies, template IDs kept, headings redesigned |
| 2 · Source bank | `sources.md` | done — 5 guidelines as one manual-therapy table, 12 papers read, 4 recorded untraceable |
| 3 · Draft | — | not started |
| 4 · Adversarial verification | — | not started |
| 5 · Build the page | — | not started |

## The rules inherited from the previous three builds

1. **Search the repository before declaring anything unreachable.** The knee build got this wrong
   and had to be corrected after the page was built. `grep -rho 'https://[^" )]*\.pdf' --include=*.ts src/`
2. **Check era headers by position.** These guidelines reprint superseded recommendations beside
   current ones, and at least one reversed direction between revisions. Draft from the front-matter
   Summary of Recommendations, confirmed by character position.
3. **De-hyphenate before searching PDF text.** `(\w)- (\w)` &rarr; `\1\2`. A figure split across a
   line break makes a search return nothing, which reads as "not in the source".
4. **Check which section a search hit sits in.** A full-text search hits appendices, reference
   lists and search strategies as readily as findings.
5. **New, from this build: check which *scale* a "grade" belongs to.** See below.

## The finding that shapes this guide

The central vocabulary of joint mobilization — Maitland grades I to IV, Kaltenborn grades I to III
— **has no reachable definition, origin or reliability figure.** Two targeted searches for the
grading systems and for whether clinicians can reproduce a given grade returned nothing usable.

What the guidelines do instead is more interesting. The ankle guideline's only mention of Maitland
is descriptive — *"anterior-to-posterior Maitland grade III joint mobilizations"* — using the grade
as a label while summarising someone else's trial, not defining it. And the **hip guideline
specifies mobilization dose without grade numbers at all**, describing force functionally:
**high-force (stretching exceeding resistance), medium-force (stopping at the point of resistance),
low-force (no resistance)** — and it reports outcomes by that scale, with high force moving range
and low force moving pain.

So the guide's argument is likely to be: *the grading system every student memorises is a
convention with no reachable origin, while the thing that actually predicts the outcome — where
you stop relative to resistance — is defined and measured.* That is worth a guide on its own.

**The completed source bank strengthened this rather than softening it.** Two further conventions
failed to trace: **open-packed and close-packed positions**, which decide the position every
mobilization is performed in, and **the concave-convex rule**, which decides the direction — the
only clinical paper that engages the latter (Scarvell 2019, *Phys Ther*) measures 36 mm of
posterior femoral translation in deep knee flexion and asks for the rule to be reviewed. Meanwhile
the things that *are* measured came out modest and honest: two clinicians agree on an accessory
glide at ICC 0.64 (Nguyen 2026), the only poolable proprioception result was null (Hadjisavvas
2026), and across 26 neuroimaging studies "none of them linked cortical changes directly to
clinical improvements" (Jahromi 2026).

So the guide has three untraceable conventions to name — grades, packed positions, the
concave-convex rule — and a small set of real numbers to put beside them. The honest version of
this guide is mostly about the gap between the two.

## A conflation to avoid, found while searching

Searching guideline text for "grade III" returns **Kellgren-Lawrence Grade III hip osteoarthritis**
— a radiographic severity scale — as readily as anything about mobilization. Two entirely different
scales share the word. Any "grade" quoted in this guide must name which scale it belongs to.
