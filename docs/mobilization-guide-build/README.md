# Building the joint mobilization guide

Follows `docs/joint-playbook-template.md`, but **this one is not a regional examination guide** and
the twelve-section shape from the shoulder, hip, knee and ankle does not transfer unchanged. Scope
needs rethinking rather than copying.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 28 competencies, template IDs kept, headings redesigned |
| 2 · Source bank | `sources.md` | done — 5 guidelines as one manual-therapy table, 12 papers read, 4 recorded untraceable |
| 3 · Draft | `draft.md` | done — 12 sections, 16 references, 0 unmarked rows |
| 4 · Adversarial verification | `verification.md` | done — 6 defects, all fixed; 1 corrected at origin |
| 5 · Build the page | `content/playbooks/joint-mobilization.html` | done — 132 rows, 173 citations, 18 references, 17 untraceable flags; not served |

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

## What the withheld playbook claimed — and why the takedown was right

This guide replaces `src/lib/playbooks/joint-mobilization.ts`, which sits in `UNVERIFIED_PLAYBOOKS`
and whose slug deliberately does not resolve. Reading it back after completing the source bank is
the sharpest possible test of whether that takedown was justified. It was.

The withheld playbook asserts, as plain fact, precise numbers for **exactly the two scales this
build could not trace to any reachable source**:

| Claim in the withheld playbook | What the source bank found |
|---|---|
| Stamp: **"5 Maitland grades"** | No reachable definition, origin or reliability figure for the Maitland system. Zero of five guidelines define a grade. |
| Stamp: **"0–6 joint play scale"**, elaborated as "0 ankylosis · 1–2 hypomobile · 3 normal · 4–5 hypermobile · 6 unstable" | Never encountered in any reachable source. A seven-point ordinal scale with named anchors and no citation. |
| **"Grade I–II: 10–30 seconds. Grade III–IV: 60 seconds. Standard dose is 3 bouts of 30 seconds to 1 minute with 30 seconds rest"** | No reachable study specifies or compares oscillation rate, amplitude or bout length. And the hip guideline explicitly concluded that recommending a specific manual therapy dosage "could not be made". |
| **"Ease out of a grade III or IV: 5–10 seconds of grade I–II"** | Same. A procedure specified to the second, resting on scales that are themselves undefined. |
| **"4+: the grade at which you stop mobilizing and start stabilizing"** | A clinical threshold on an untraceable scale. |

**The concept underneath one of those claims is sound, and the guide keeps it.** The playbook's
"grades I–II treat pain, before resistance begins; III–IV treat length, past the point resistance
begins" is recognisably the same idea as the hip guideline's force vocabulary — *where you stop
relative to resistance*. The difference is that the guideline defines it **without a numeral**, and
attaches measured outcomes to each level: high force moved range in all six hip directions, low
force produced the largest effect on pain pressure threshold (d = 2.0).

So the new guide keeps the insight and drops the numerals. That is the whole argument of the guide,
and the withheld playbook is the worked example of what happens without it: **real clinical
reasoning, expressed in invented precision.**

Nothing from the withheld playbook was copied into the new guide. Every value in the new guide comes
from `sources.md`.
