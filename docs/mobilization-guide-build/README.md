# Building the joint mobilization guide

Follows `docs/joint-playbook-template.md`, but **this one is not a regional examination guide** and
the twelve-section shape from the shoulder, hip, knee and ankle does not transfer unchanged. Scope
needs rethinking rather than copying.

| Step | File | State |
|---|---|---|
| 1 · Scope | — | not started — needs rethinking, see below |
| 2 · Source bank | `sources.md` | in progress |
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

## A conflation to avoid, found while searching

Searching guideline text for "grade III" returns **Kellgren-Lawrence Grade III hip osteoarthritis**
— a radiographic severity scale — as readily as anything about mobilization. Two entirely different
scales share the word. Any "grade" quoted in this guide must name which scale it belongs to.
