# Building the ankle guide

Follows `docs/joint-playbook-template.md`, same five steps as the hip and knee builds.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 39 competencies in examination order |
| 2 · Source bank | `sources.md` | 3 guidelines assessed: ankle and Achilles usable, heel pain excluded; era check done |
| 3 · Draft | `draft.md` | done — 12 sections, 4 sources, 34 graded recommendations |
| 4 · Adversarial verification | `verification.md` | done — 1 defect in 67 claims (a material omission), fixed |
| 5 · Build the page | `content/playbooks/ankle-examination.html` | built with the Ottawa figure; not yet served |

`lookup.py` is the Europe PMC query tool the hip and knee builds used.

## Start here: search the repo before declaring anything unreachable

The knee build made a wrong claim — that no freely readable graded knee examination guideline
exists — and shaped the whole guide around it. The guideline was openly hosted the entire time.
`docs/knee-guide-build/sources.md` records the error in full.

The cause was a bad search order: Europe PMC, then the Academy's guideline index page, then a
conclusion. What was never searched was **this repository**, which already references six openly
hosted guideline PDFs. So, before this build concludes anything is unreachable:

```
grep -rho 'https://[^"'"'"' )]*\.pdf' --include=*.ts --include=*.tsx src/ | sort -u
```

**Three of those are ankle or foot guidelines, and none has been read yet:**

- `Heel_Pain_Plantar_Fasciitis_Revision_2023.pdf`
- `chimenti_et_al_2024_achilles_pain_stiffness_and_muscle_power_deficits_midportion_achilles_tendinopathy_revision_2024.pdf`
- `jospt.2021.0304.pdf` — a 2021 JOSPT guideline; identify it before assuming what it covers.

Also note `Martin RL et al, Ankle Stability and Movement Coordination Impairments: Lateral Ankle
Ligament Sprains Revision 2021` (JOSPT 51(4):CPG1-CPG80, PMID 33789434) is abstract-only in Europe
PMC — **which after the knee experience is not evidence that it is unreachable.** Check whether it
is hosted before recording it as a dead end.

## Already established across hip and knee — do not spend the search again

- **Normative range of motion has no freely readable primary source.** True for the hip and the
  knee; the classic tables are paywalled at the table. Expect the same for the ankle, mark it
  `Convention`, and cite Roach 1991 for the fact that textbook values were off by as much as 18&deg;
  against a measured population — though note Roach covers hip and knee only, so it supports the
  *argument* at the ankle, not an ankle figure.
- **Ottawa rules are rule-outs.** Both the knee and ankle rules pool to very high sensitivity with
  low specificity. The ankle meta-analysis (Sharifi Razavi 2026, free) reads its own numbers
  correctly, where the knee one overstated them — worth contrasting.
- **The recurring finding, now three times over:** a test's headline accuracy depends on who
  performed it and on whom. Pre-selected surgical cohorts inflate figures; primary care cohorts
  deflate them. Look for the population before recording any Sn/Sp.
