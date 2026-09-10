# Neurologic Examination guide — adversarial verification

Step 4 of `docs/joint-playbook-template.md`. The rule that produced this file: **hunt for
errors, do not confirm.** For every value, ask whether the cited paper exists, whether the first
author is right, whether the paper reports that exact number, whether it supports *this* claim,
and whether the population is the one implied.

Two passes were run.

---

## Pass 1 — mechanical, by `verify.py`

Every number the guide attributes to a source must appear verbatim in that source's downloaded
text. This catches transcription drift, which re-reading never catches because a wrong number
reads exactly as fluently as a right one.

**68 claim strings across 8 sources. 0 not found.**

The check is re-runnable and is part of the build:

```sh
python3 docs/neuro-guide-build/verify.py       # claims against source text
python3 docs/neuro-guide-build/checkcites.py   # every citation resolves, no orphan references
```

`checkcites.py` mimics the page's own citation linker — it indexes each reference entry by every
name word plus year, then matches each `.src` span against that index. It reports **113 linked
citations, 0 unlinked, 0 orphan references, 18 no-traceable-source flags.**

---

## Pass 2 — interpretive, by hand

Mechanical matching cannot catch a number that is real and attached to the wrong claim. Each
value whose wording went beyond quoting a figure was re-read against the source paragraph.

**Three defects found in the drafted content. All three were in claims where the number was
correct and the sentence around it was not.**

### Defect 1 — a sentence attributed to a source that the source does not contain · **severity: high**

**Drafted:** "…the same source states that its absence does not indicate absence of pyramidal
dysfunction."

**What Morimoto 2024 actually says:** *"However, because of its low sensitivity, the absence of
the Babinski sign does not always indicate pyramidal tract dysfunction."*

Those are different claims. The source's sentence says absence does not *prove* dysfunction —
which is trivially true and is not what a low sensitivity implies. The sentence the guide needed
(absence does not *exclude* dysfunction) is the correct inference from a sensitivity of 50.8%,
but it is an inference, and the draft put it in the paper's mouth.

**Corrected to:** the inference is now drawn explicitly from the sensitivity figure and labelled
as this guide's, the source's own sentence is quoted verbatim beside it, and the guide says in
one line that the source's wording is best read as a slip. Fixed in two places — the `tone`
section's plantar response row and the checklist's pathological reflexes item.

### Defect 2 — "no standard score exists" where the standard does score it · **severity: high**

**Drafted:** "Joint position sense appears in ISNCSCI only as an optional adjunct, not a required
modality — so there is no standard score for it, and the record is the joint, the excursion and
the error rate."

**What Rupp 2021 actually says:** joint movement appreciation and position sense are *optional*
aspects of the sensory evaluation with no place on the worksheet except the comments section —
**and they are graded, using the same sensory scale (absent, impaired, normal), where a grade of
0 indicates the patient is unable to correctly report joint movement on large movements of the
joint.**

The first half of the draft was right and the conclusion drawn from it was wrong. Worse, the
wrong half was the actionable half: it told a reader to invent a recording scheme when a
published one exists.

**Corrected to:** optional status kept, the grading scale and the definition of grade 0 added,
in both the checklist item and the `sensory` section row.

### Defect 3 — citing a source for a negative it does not state · **severity: medium**

**Drafted:** "Vibration is not one of the required ISNCSCI modalities <span>Rupp 2021</span>."

Rupp 2021 nowhere discusses vibration as a modality — the word appears once in the whole paper,
in a description of Brown-Séquard syndrome. The claim is *true*, but it was sourced as though the
paper asserted it, when what the paper supports is the positive statement of what ISNCSCI does
include.

**Corrected to:** the row now states what the standard requires (light touch and pin prick) and
what it lists as optional (joint movement appreciation with position sense; deep pressure or
deep pain), from which a reader can see that vibration is scored nowhere in it.

---

## Population caveats carried into the page rather than fixed

These are not defects; they are limits that had to be stated in the guide instead of smoothed
over. Each is written into the row that quotes the number.

| Value | Population it was measured in | Where the guide says so |
|---|---|---|
| All sensory and motor scoring | Spinal cord injury | `sensory` lede and the `Rupp 2021` reference note |
| Modified Ashworth ICCs | 23 **children** with cerebral palsy | Every row quoting it, and the drill |
| Modified Ashworth 86.7% / tau 0.847 | 30 adults, **elbow flexors only** | `tone` section and the drill |
| Babinski accuracy | A narrative review of **lumbar spine** disease | The `Morimoto 2024` reference note |
| Oculocephalic reflex | **Unconscious** patients | The `Tarnutzer 2026` reference note, and cited once only |
| Berg / FGA / 10mWT change values | Vary by condition and acuity; quoted per condition | `function` section rows |

## What was rejected rather than corrected

Recorded in `sources.md` under **Read and rejected**: the MoCA-J validation (translated
instrument, 96 Japanese subjects — cannot support "the MoCA cutoff is 26" in an adult
rehabilitation guide) and the Mini-SCALE (children aged 3 months to under 4 years — cannot
support an adult selective-control grade). Both left the corresponding values flagged as having
no traceable source, which is why the guide carries 18 such flags.

## Standing risk

The three defects found were all in the **sentence around a correct number**, not in the numbers.
Pass 1 would have caught none of them. Any future edit that rewrites explanatory prose without
re-reading the source paragraph can reintroduce exactly this class of error, and `verify.py` will
still report zero.
