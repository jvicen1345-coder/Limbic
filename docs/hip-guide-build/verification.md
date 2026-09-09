# Hip guide — verification pass 1

Step 4 of `docs/joint-playbook-template.md`. Every claim in `draft.md` was checked against the
paper's own freely readable text, re-fetched for this pass rather than read from `sources.md` —
because `sources.md` is where two of the errors below had already taken hold.

The instruction the template gives is to look for errors, not to confirm. Five questions per
claim: does the cited paper exist, is the first author right, does the paper report that exact
number, does it support *this* claim, and is the population the one implied.

**Result: 4 defects in 63 cited claims.** Two factual, one provenance, one imprecision. None
would have been found by re-reading the draft; all four were found by going back to the abstract.

---

## Defect 1 — invented precision · Roach 1991 · **factual**

**Draft said:** differences between "the youngest group (25–39) and the oldest (60–74)".

**The abstract says:** "youngest age group", "oldest age group", and "at least to age 74 years".
It reports 12 sex-race-age-group categories and never names their boundaries.

The numbers 25–39 and 60–74 are plausible, conventional NHANES-shaped brackets, and they are not
in the source. This is the exact failure mode the guide exists to prevent: a real paper, a real
finding, and a specific detail supplied from expectation rather than from the text.

**Fixed** in `draft.md` and at its origin in `sources.md`, where the brackets had been recorded
first and from which the draft inherited them.

## Defect 2 — wrong population for a statistic · Bird 2001 · **factual**

**Draft said:** intraobserver kappa 0.676 (95% CI 0.270–1.08), "in 24 patients".

**The abstract says:** "In 12 patients, the 3 physical signs were assessed at study entry and at
2 months by the same observer and the intraobserver reliability for each of the signs was
calculated."

The study enrolled 24; the reliability figure comes from half of them. Attaching the larger n to
the smaller sample overstates it — and a kappa whose interval already runs 0.270 to above 1 is
fragile enough without being credited to twice its sample.

**Fixed** in both files, and the reliability row now states the 12-patient subset and the
two-month retest interval.

## Defect 3 — unmarked convention · likelihood-ratio bands · **provenance**

**Draft said,** with no citation and no marker: "+LR above 10 or −LR below 0.1 shifts probability
decisively; between 2 and 5, slightly."

Under this guide's own rule an unmarked value claims to be traced to a source a reader can reach
for free. These bands are a widely taught heuristic and are not in any source in this bank. Left
unmarked in a section arguing that hip tests are weaker than they look, an unsourced number is
worse than none.

**Fixed:** marked `Convention`, with the part that *is* sourced — that a high sensitivity with a
DOR interval crossing 1 is a screening test — kept and cited.

## Defect 4 — misattributed heterogeneity · González-de-la-Flor 2026 · **imprecision**

**Draft said:** the Thomas test's ICC of 0.62 came "with heterogeneity near 99%".

I² = 99% is the *overall pooled intrarater* figure across all five tests; 98.3% is the overall
interrater. The authors attribute the heterogeneity "particularly" to the modified Thomas and
Thomas tests, which is a weaker and different claim than assigning 99% to the Thomas test's own
interrater estimate.

**Fixed:** both figures stated as overall, with the authors' attribution quoted as attribution.

---

## Checked and correct

Verified digit by digit against re-fetched abstracts, with first author and journal confirmed:

- **Sutlive 2008** — 72 subjects, 21 (29%), K-L ≥ 2, ≥4 of 5 variables, +LR 24.3 (4.4–142.1),
  91%, "validation study should be done". Eight authors, first author Sutlive TG. Clean.
- **Bijl 1998** — 200 patients, hip pattern "not present as a distinct pattern", knee pattern
  indicated in subgroups, "cannot be regarded as a valid test". Clean.
- **Willett 2016** — no significant change after ITB transection; P < .0001 for intact vs gluteus
  and intact vs capsule; gluteus vs capsule Ober P < .0001, modified Ober P = .0036; Ober n=28,
  modified n=34, 18 limbs through all conditions. Every quoted conclusion verbatim. Clean.
- **Reiman 2015** (BJSM 49(12):811) — FADIR SN 0.94–0.99, DOR 5.71–7.82; flexion-IR SN 0.96, DOR
  8.36; "only screening accuracy"; 21 articles, one high quality, nine pooled. Clean.
- **Reiman 2017** — CTA SN 0.91, SP 0.89, +LR 6.28, −LR 0.11; pretest 81% ALT, 74% FAI; limited
  generalisability stated by the authors. Clean.
- **Owusu-Akyaw 2019** — 75 patients, 53.6% vs 45.5%, p=0.02. Clean.
- **Schmid 2026** — 5 of 10 failed after gluteus medius/minimus block with 1 Trendelenburg sign;
  5 of 10 after gluteus maximus with 2 Duchenne signs; ten-second stance. Clean.
- **Koc 2025 CPG** — read from the openly hosted PDF: diagnostic criteria, IR < 24°, morning
  stiffness < 1 hr, the Grade A impairment set, K-L 0–4, and every intervention grade and dose.
  Clean.

**Improved rather than corrected:** Willett's intact baselines (modified Ober 4.28°, Ober −2.90°)
were available and omitted. Without them the reader cannot see that the ITB step moves the number
by less than a degree, which is the whole argument. Added.

---

## Pass 2 — selective quotation

Pass 1 checked whether each number was transcribed correctly. Pass 2 asked the harder question:
does the draft mislead using only true numbers, by choosing which ones to carry? The CPG section
was the predicted risk, and it was the actual one.

**Defect 5 — a dose the guideline declines to recommend · Koc 2025 · material omission**

The draft quoted the manual therapy dose as "1–3 times per week for 6–12 weeks", correctly and
with the Grade A beside it. What it omitted sits two pages earlier in the same guideline: the
dosage systematic review it draws on (10 studies, 768 participants) found **five of ten studies
at high risk of bias**, and concluded that **"recommending a specific manual therapy dosage for
those with hip OA could not be made"**.

Both statements are in the guideline. Quoting only the first turns a summary of what studies
happened to use into a prescription, which is the difference between reporting evidence and
laundering it. **Fixed:** the dose stays, with its own caveat row.

**Also added, because leaving them out flattered the recommendations:**

- Higher versus lower force actually differ in what they achieve — high-force long-axis
  distraction moved ROM (flexion 10.6°, extension 8.0°, abduction 6.4°, adduction 3.3°, ER 5.6°,
  IR 7.6°) where low and medium force did not, while low force had the largest effect on pain
  pressure threshold (d = 2.0). That is more useful than the Grade A alone, and it was missing.
- Manual therapy's benefits are described by the guideline as "the recognized short-term
  benefits"; long-term follow-up is an open gap. The draft implied durability it does not claim.
- Dry needling's three weeks is the ceiling of the evidence, not a course length, and it has
  mostly been tested standalone rather than alongside exercise.
- Patient education is a B because the literature is thin since 2017, not because it underperformed.
  A grade that reflects volume of evidence reads as a verdict on the intervention unless you say
  otherwise.
- Exercise's 1–5×/week, 30–120 min, 5–16 weeks is the span studies used, not a titration.

**Structural fix:** the section now opens by saying what a grade does *not* tell you — effect
size, durability, or confidence in a dose — because every letter in it was being read as all
three.

---

## What these passes still do not cover

The four values recorded as untraceable in `sources.md` cannot be checked against anything; their
correctness is the correctness of the search, not of a transcription. If a free source for
normative hip ROM or the Sutlive variables exists and was missed, no amount of re-reading this
draft will surface it.

Nor has anything here been checked for **omission at the level of scope** — a competency in
`scope.md` that the draft covers thinly because the evidence was easy to find for something else.
Worth a look when the page is built and the sections can be seen at their finished lengths.

**Next:** step 5, building the page from `docs/joint-playbook-template.html`.
