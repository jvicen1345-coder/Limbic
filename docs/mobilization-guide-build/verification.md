# Joint Mobilization Playbook — adversarial verification

Step 4 of `docs/joint-playbook-template.md`. The draft was re-read against source text — **not
against `sources.md`** — because in the hip build two defects survived into the draft by being
copied faithfully from a bank entry that was itself wrong. Guideline claims were re-extracted from
the PDFs; paper claims were re-read from the Europe PMC abstracts.

**Six defects found. All fixed. One was substantive and is corrected at origin in `sources.md`.**

---

## Defect 1 — selective quotation. A guideline's own strength rating was omitted. *(substantive)*

**Where:** the five-guideline table in `sources.md`, and three rows of the draft.

**What the draft said:** the total knee arthroplasty guideline's manual therapy recommendations were
reported as ***moderate***.

**What the guideline says:** *moderate* is the **Evidence Quality**. Both manual therapy
recommendations also carry a **Recommendation Strength of *weak* ♦♦◊◊**, and the guideline states
its own reason for each downgrade:

| Recommendation | Evidence Quality | Recommendation Strength | Downgrade reason, verbatim |
|---|---|---|---|
| ROM, early postoperative | moderate | **weak ♦♦◊◊** | "downgraded due to limited evidence" |
| Pain, time frame not specified | moderate | **weak ♦♦◊◊** | "downgraded due to low certainty of evidence" |

**Why it matters.** Quoting the evidence quality alone made the arthroplasty guideline look like the
third-strongest endorsement in the table when its own authors rate both recommendations weak. This
is the **same failure mode this project has now hit four times** — the hip manual-therapy dose, the
Ottawa knee "high diagnostic performance" against AUC 0.54, FADIR sensitivity without specificity,
and now this: **the headline rating outran the numbers underneath it.**

**Fixed:** both ratings now appear everywhere the recommendation does, with the guideline's own
downgrade language. The `sources.md` table is corrected at origin with a note recording the error,
so the next build does not inherit it. The row also now records that manual therapy within the ROM
recommendation rests on **one high-quality study**.

---

## Defect 2 — lost precision. "Dorsiflexion" where the guideline says "weight-bearing dorsiflexion".

**Where:** two rows citing the ankle guideline's chronic-instability recommendation.

The guideline reads: "to improve **weight-bearing** ankle dorsiflexion and dynamic balance in the
short term for individuals with CAI." The draft had dropped the qualifier. Weight-bearing
dorsiflexion is a different measurement from dorsiflexion, and the guideline elsewhere names the
weight-bearing lunge as the instrument. **Fixed in both rows.**

---

## Defect 3 — absence reported as rejection.

**Where:** section 10, the headline finding.

The draft said manual therapy was "unsupported in the fifth" guideline. The knee meniscal and
cartilage guideline carries **no manual therapy recommendation at all** — it did not consider and
reject the intervention, it is silent on it. "Unsupported" implies a judgement that was never made.
**Fixed to "absent from the fifth — absent, not rejected."**

---

## Defect 4 — an attribution the source does not make.

**Where:** section 5, the posterior talar glide test.

The draft called it "the guideline-recommended posterior talar glide test". The abstract says only
that the test "is recommended for ankle sprain assessment" — it names no guideline, and the ankle
guideline held here does not carry that test under that name. **Fixed:** the sentence is now quoted
as the authors wrote it, with an explicit note that they do not say who recommends it.

---

## Defect 5 — two rows with no provenance state.

Every row must be unmarked-and-traceable, `Convention`, `Contested`, or `No traceable source`. Two
rows carried none:

- §6 "Say that precisely" — now cites the ankle guideline, which is the actual evidence that the
  grade vocabulary is used in published work without being defined.
- §9 "The conventional direction rule" — the word "Contested" appeared as prose rather than as the
  marker. Now carries the `Contested` state and its citation.

A script now checks this mechanically across the draft; it reports **0 unmarked rows**.

---

## Defect 6 — an unearned superlative.

Section 7 called long-axis distraction "the best-evidenced single technique in this guide". No
source ranks the techniques against each other. **Fixed** to state the fact that motivated the
claim: it is the only technique here with a dose-response study.

---

## What was checked and found correct

Re-extracted verbatim from the guideline PDFs, de-hyphenated first, front matter confirmed by
position:

- Hip Grade A wording, including "high- and low-force long-axis hip distraction and hip mobilization
  with movement", and Grade F force-amplitude modification.
- Hip force-level study: **two studies on the same 60 subjects** (mean age 63 ± 9.7; 35 men, 25
  women), three sessions, 1-week follow-up, Grade III hip OA, distraction **in open packed
  position**. ROM figures 10.6 / 8.0 / 6.4 / 3.3 / 5.6 / 7.6°, significant against the **low-force**
  group. Pain pressure threshold d = 2.0 (low force); physical function d = 0.5–0.7 (high force).
- The dose caveat, verbatim: 10 studies, 768 participants, "five of the 10 studies had a high risk of
  bias. Therefore, recommending a specific manual therapy dosage for those with hip OA could not be
  made." And "No harms of manual therapy were reported."
- Single-session hip MWM effect sizes (n = 40, mean age 78 ± 6): 1.9 / 3.0 / 1.4 / 1.0 / 1.7 / 1.5.
- Ankle acute Grade A and chronic-instability Grade A wording.
- Achilles Grade F wording, including that the population is "midportion Achilles tendinopathy **and**
  mobility deficits".
- Knee meniscal and cartilage guideline: no manual therapy recommendation.

Re-read from the abstracts: Nguyen ICCs and MDCs; Scarvell translation, rotation and correlation
values and the exact verb "invite review"; Alqallaf pooled MDs and the null on quality of life;
Shager SMDs with I² and the authors' certainty ratings; Hadjisavvas null pooled result; Jahromi's
"none of them linked cortical changes directly to clinical improvements"; Sillevis joint-space and
EEG findings; Daniels event counts, funding and the excluded study designs.

## Deliberate constraints carried into the build

- **Sillevis 2024 and Sillevis 2025 are one research line**, not two independent findings. The draft
  says so in the row that cites both.
- **No effect size or number is quoted from Cook 2026.** It is a commentary and is cited only for the
  position it takes, labelled as a commentary.
- **The three force levels are never presented as translations of Maitland or Kaltenborn grades.**
- **Every "grade" names its scale.** The 60 hip patients had Kellgren-Lawrence-type radiographic
  Grade III disease, and the draft says so where the number appears.
- **Alqallaf's "positional fault" mechanism is labelled as the model's claim**, with the note that no
  included trial measured one.
