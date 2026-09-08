# Ankle guide — verification

Step 4, both passes. Run the same way as the hip and knee: sources re-read rather than recalled,
and every figure checked against the source text rather than against `sources.md`.

**Result: 1 defect in 67 cited claims — a material omission, not a transcription error.** Pass 1
found nothing wrong at all.

---

## Pass 1 — transcription

Twenty-nine quoted values and phrases were checked **verbatim against the extracted source text**,
mechanically rather than by eye: the Ottawa sensitivity and specificity ranges, the 88% partial-rule
sensitivity, the paediatric 85.7% against 100%, the 20-minute median length of stay, the unchanged
laxity at P>.05, both bone-marrow-contusion comparisons with both p values, the four Star Excursion
reach directions, the three hip movements, both instability instruments, the weight-bearing lunge,
the eyes-closed balance test, the seven-item classification set, the talar mobilisation, lymphatic
drainage, motivational interviewing, and eight Achilles recommendations including the 2024 tape
position.

**All 29 present verbatim. Zero misses.**

The Ottawa meta-analysis figures were re-fetched and confirmed digit by digit: 0.92 (0.91-0.93),
0.35 (0.34-0.36), +LR 1.76 (1.46-2.13), &minus;LR 0.13 (0.09-0.19), DOR 16.21 (10.15-25.89).

Pass 1 finding nothing is a first for this series, and the reason is method rather than luck: this
bank was built after the knee correction, so era headers were checked by position before anything
was drafted, and each recommendation came from a front-matter summary rather than from the body.

### An extraction hazard found while verifying

Searching for `prevalence of CAI was 40%` returned nothing. The phrase is in the document; the PDF
extraction had split it across a line break as `preva- lence`. Any figure could hide behind a
hyphen this way, and a search that comes back empty would be read as "not in the source" — the
exact reasoning that produced the knee error.

**Fixed by de-hyphenating before searching** (`(\\w)- (\\w)` &rarr; `\\1\\2`), which is now how this
build searches guideline text. Worth carrying into any future build.

---

## Pass 2 — selective quotation

**Defect 1 — the entire clinical course was missing.** The draft carried 34 graded
recommendations, an excellent screening rule and a set of measurement instruments, and said
nothing about what actually happens to these patients. The guideline does:

- **40%** of people who sought care for a first-time lateral ankle sprain developed **chronic
  ankle instability**, in the only prospective study to date — and the guideline adds that
  retrospective designs likely **underrepresent** the true burden.
- Return to participation takes **1 day to a little more than 3 weeks**, but **"full recovery with
  no symptoms or limitations may take months or years to obtain, and cannot be expected in all
  patients"**.
- There is **conflicting evidence** for the role of injury severity in the clinical course, so a
  mild sprain is not a promise.
- Recurrence runs near **12%** in collegiate athletes, **14.2%** in professional football and
  basketball, **13.7%** in elite soccer.

A guide that lists Grade A interventions for a condition without saying that two in five
care-seekers end up with chronic instability has quoted its source selectively, however accurately
each individual number was transcribed. **Fixed:** six rows added to §2, two to §8, the §10 lede
rewritten, the introduction reframed, and three drill questions added.

**It also changes what the guide argues.** Prevention was a section; it is now the point. An acute
ankle sprain reads as a self-limiting nuisance, and the prospective data say otherwise.

---

## What these passes do not cover

The values recorded as having no traceable source — normative ankle ROM, and accuracy for the
anterior drawer and talar tilt tests — cannot be checked against anything. Their correctness is the
correctness of the search.

The Achilles guideline was read for its front-matter recommendations and its one reversal. Its body
has not been read for prognosis the way the ankle guideline now has, so **midportion Achilles
tendinopathy may have the same kind of clinical-course gap this pass just closed for sprains.**
Recorded rather than assumed away.

**Next:** step 5, build the page.
