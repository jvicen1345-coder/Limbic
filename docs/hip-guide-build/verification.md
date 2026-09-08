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

## What this pass does not cover

Sensitivity to selective quotation. Every figure above is correctly transcribed, but a guide can
mislead with only true numbers by choosing which to carry. The clearest risk here is the CPG
section: it is quoted almost entirely for what it recommends, and a reader should also know how
thin some of the underlying evidence is. Worth a second pass before the page is built.

Nor does it cover the four values recorded as untraceable in `sources.md` — by definition there is
nothing to check them against. Their correctness is the correctness of the search, not of a
transcription.

**Next:** a second adversarial pass focused on selective quotation and on the CPG section, then
step 5, building the page.
