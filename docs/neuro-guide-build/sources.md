# Neurologic Examination guide — verified source bank

Same contract as `docs/hip-guide-build/sources.md` and `docs/knee-guide-build/sources.md`.
Every entry below was looked up in Europe PMC and read. **Supports** is what the freely readable
text actually says. **Does not support** is what a reader might expect it to say and it does not.
The second column is the point of the file.

A value goes into the guide **unmarked** only if the freely readable text of a named paper below
carries that exact value. Everything else is marked `Convention`, marked `Contested`, or flagged
in place as having no traceable source.

Tools: `lookup.py` (Europe PMC search, from the knee build), `oa.py` (the same restricted to free
full text), `getdoc.py` (full text via Europe PMC XML, falling back to the PMC HTML page — several
of the sources below expose no `fullTextXML` and are only readable the second way).

---

## The result, up front

The scope file predicted this guide would carry more `Convention` marks than any of the four joint
guides, and that a large minority of values would end up untraceable. **That prediction held.**

| | Count |
|---|---|
| Sources read | 14 |
| Usable as the source of at least one exact value | 9 |
| Existence-only (no abstract indexed, or abstract carries no value) | 3 |
| Read and rejected for this guide's population | 2 |

The examination of the cranial nerves, the coordination battery, the tuning fork, and the reflex
*technique* are, on this search, conventions of the physical examination and not measured
instruments. What **is** measured, and measured well, is the standardized scoring laid over them —
ISNCSCI sensory scoring, the reflex grading scale, the Babinski sign's accuracy, and the core set
of outcome measures. That asymmetry is the honest shape of this literature and the guide is
written to show it rather than to hide it.

---

## Anchor sources — free full text, carrying exact values

### Rupp R, Biering-Sørensen F, Burns SP, Graves DE, Guest J, Jones L, Read MS, Rodriguez GM, Schuld C, Tansey-Md KE, Walden K, Kirshblum S. International Standards for Neurological Classification of Spinal Cord Injury: Revised 2019.
*Top Spinal Cord Inj Rehabil* 2021;27(2):1–22 · PMID 34108832 · PMC8152171 · **free full text**
(no `fullTextXML`; read from the PMC HTML page)

The single most valuable source in this build. It is the only document found that gives a
*standardized, scored* method for the reader's light-touch, sharp/dull and proprioception
competencies rather than describing them.

- **Supports** —
  - the sensory examination tests **key sensory points within each of the 28 dermatomes** from
    **C2 to S4–5**, on the right and left sides, located in relation to bony anatomical landmarks;
  - both **light touch and pin prick (sharp/dull discrimination)** are tested at every point;
  - light touch is tested with **cotton stroked once across an area not to exceed 1 cm of skin**,
    with the **eyes closed or vision blocked**;
  - pin prick uses a **safety pin stretched apart**, the **pointed end for sharp and the rounded
    end for dull**;
  - the scoring is **0 = absent, 1 = altered (impaired or partial appreciation, including
    hyperaesthesia), 2 = normal or intact (similar as on the cheek)**, with **NT** where a point
    is not testable;
  - **the cheek is the control**: normal is defined as feeling the same as on the face;
  - **56 points for pin prick, 56 for light touch, 112 total per side**;
  - the **sensory level** is the most caudal dermatome with normal function for **both** pin prick
    and light touch;
  - the **motor level** is defined by the **lowest key muscle function that has a grade of at
    least 3**, on manual muscle testing in the supine position;
  - **10 key muscles per side, C5–T1 and L2–S1**;
  - motor grading **0 = total paralysis; 1 = palpable or visible contraction; 2 = active movement,
    full ROM with gravity eliminated; 3 = active movement, full ROM against gravity; 4 = active
    movement, full ROM against moderate resistance in a muscle-specific position; 5 = normal,
    full ROM against full resistance expected from an otherwise unimpaired person**;
  - the whole examination needs only a **safety pin and a cotton wisp** and can be performed
    "in virtually any clinical setting and phase of care";
  - **ND** is recorded where a parameter cannot be determined.
- **Does not support** — anything about the cranial nerves, tone, coordination, cognition or
  perception. Its scope is the spinal cord. It also does **not** supply vibration or joint
  position sense scoring: ISNCSCI's required sensory modalities are light touch and pin prick,
  and joint position sense appears only as an optional adjunct.
- **Population caveat the guide must carry** — this is a spinal cord injury standard. Its 0/1/2
  scoring transfers to any sensory examination as a *scoring discipline*; its dermatomal
  interpretation does not transfer to a cortical or peripheral-nerve lesion.

### Moore JL, Potter K, Blankshain K, Kaplan SL, O'Dwyer LC, Sullivan JE. A Core Set of Outcome Measures for Adults With Neurologic Conditions Undergoing Rehabilitation: A Clinical Practice Guideline.
*J Neurol Phys Ther* 2018;42(3):174–220 · PMID 29901487 · PMC6023606 · **free full text**

The graded guideline this guide's functional section hangs on — the neurologic equivalent of the
hip build's CPG. Nine action statements, each with an explicit evidence quality and recommendation
strength.

- **Supports** —
  - the nine action statements: **1 static and dynamic sitting and standing balance assessment;
    2 walking balance assessment; 3 balance confidence assessment; 4 walking speed assessment;
    5 walking distance assessment; 6 transfer assessment; 7 documentation of patient goals;
    8 use of the core set; 9 discuss outcome measure results and use collaborative/shared
    decision-making with patients**;
  - **Berg Balance Scale** for static and dynamic sitting and standing balance — **strong**
    recommendation, level I evidence;
  - **Functional Gait Assessment** for balance while walking — **strong** for acute and chronic
    stable conditions, **moderate** for chronic progressive; a **10-item** clinician-rated test,
    items scored **0–3**, **maximum total 30**, under 20 minutes to administer;
  - **Activities-specific Balance Confidence (ABC) Scale** to assess **self-reported** changes in
    balance confidence;
  - **10 meter Walk Test** for walking speed; **6-Minute Walk Test** for walking distance — each
    phrased as "for adults with neurologic conditions who have goals to improve [it] **and have
    the capacity to change in this area**";
  - transfers are the one action statement with **no recommended instrument**: clinicians "should
    **document** the transfer ability", and documentation "should include the **type of transfer,
    level of required assistance, equipment or context adaptations, and time to complete**." The
    **5 Times Sit-to-Stand "may be used"** for sit-to-stand goals — permissive language, not the
    "should use" of statements 1–5, and the guide must not upgrade it;
  - BBS reliability: interrater **ICC = 0.95** and weighted **κ = 0.92** in acute stroke (Mao et
    al); test–retest **ICC = 0.92** in stroke; interrater **ICC = 0.953** in chronic SCI;
    internal consistency **Cronbach α 0.92–0.98** in acute stroke and **0.86–0.87** in PD;
  - BBS **SEM 2.49 points** in acute stroke, **1.68–2.4** in chronic stroke;
  - BBS **MDC₉₅ of 7** in acute stroke (Stevenson); **4.66 to 6.7 points** in chronic stroke;
    **5** in PD; **1 in premanifest HD rising to 4–5** in other stages of HD;
  - BBS **ceiling effects vary with time post-stroke** — 4.9% at 14 days, 11.8% at 30 days,
    21.5% at 90 days, 28.8% at 180 days (Mao et al); and **floor** effects fall the other way,
    35% at 14 days, 17.3% at 30 days, 6.5% at 90 days, 5% at 180 days;
  - 10mWT **MDC = 0.18 m/s** in chronic stroke; **0.18 m/s comfortable and 0.25 m/s fast** in PD;
    **0.20–0.46 m/s** across stages of HD;
  - **"Sixty-eight percent of consumers surveyed"** reported balance was an important goal and a
    primary reason for seeking physical therapy services;
  - the FGA has demonstrated a **ceiling effect** in balance and vestibular deficits, and a score
    **near 30 of 30** should prompt a more challenging measure;
  - a patient who cannot ambulate should be **documented as 0** on the FGA rather than omitted;
  - the core set is for patients with **goals and potential to improve balance, gait or
    transfers**, used **throughout the episode of care** and passed to the next level of care.
- **Does not support** — any impairment-level examination at all. This CPG is about *outcome
  measures*, not about tone, sensation, cranial nerves or localization. It carries **no MCID for
  the BBS or the FGA** — it says explicitly that none of the five level I studies that assessed
  SEM or MDC for the BBS simultaneously reported an MIC or MCID, and that neither FGA study
  reported an MCID. **The guide must not print an MCID for either measure.**
- **One value deliberately not used** — the CPG reports a postpolio 10mWT "SDC = 1.9 m/s for
  preferred and 1.7 m/s for fast." A smallest detectable change larger than most people's walking
  speed is almost certainly a unit or decimal error in the underlying paper. It is quoted nowhere
  in this guide.

### Morimoto T, Hirata H, Watanabe K, Kato K, Otani K, Mawatari M, Nikaido T. The Usefulness of Deep Tendon Reflexes in the Diagnosis of Lumbar Spine Diseases: A Narrative Review.
*Cureus* 2024;16(3) · PMID 38586775 · PMC10999014 · **free full text**

- **Supports** —
  - the **NINDS myotatic reflex scale**, graded **0 to 4+**, with the definitions:
    **0 reflex absent; 1+ small, less than normal, includes a trace response or a response brought
    out only with reinforcement; 2+ brisk, within the median normal range; 3+ enhanced, high
    normal or hyperreflexia; 4+ enhanced, more than normal, includes intermittent clonus**;
  - the **Babinski sign** has **sensitivity 50.8% (95% CI 41.5–60.1)** and **specificity 99%
    (95% CI 97.7–100)** for identifying pyramidal tract dysfunction, with **intra-observer
    reliability 0.467–0.571**;
  - therefore, **the absence of a Babinski sign does not indicate absence of pyramidal tract
    dysfunction** — the paper states this consequence in terms;
  - the plantar response reflects **decreased inhibition of the spinal flexor reflex modulated by
    the supplementary motor area**.
- **Does not support** — reflex grading in an upper motor neuron population specifically. The
  paper's subject is lumbar spine disease, so its reflex material is framed around radiculopathy.
  The **scale** and the **Babinski accuracy figures** are general claims about the sign and the
  scale; the guide cites it for those and not for anything about lumbar diagnosis.

### Mikša Pušnik D, Pirkmajer S, Tomc Žargi T. Intra- and interrater reliability of the Modified Ashworth Scale and its association with the Tardieu Scale in children with cerebral palsy.
*PeerJ* 2026;14 · PMID 42405253 · PMC13332714 · **free full text**

- **Supports** — in **23 children with cerebral palsy**, MAS graded at the **elbow, knee and
  plantar flexors**: **intrarater ICC 0.91–0.99**; **interrater ICC 0.80–0.89**, with confidence
  intervals indicating only **moderate to good** reliability in some muscle groups; a **moderate
  positive correlation** between the Tardieu Scale and the MAS; and the authors' own conclusion
  that **caution is warranted when interpreting findings at the individual level**.
- **Does not support** — anything in adults. The population is children with CP, and the guide
  must say so wherever it quotes these numbers. It also does not support the MAS as a valid
  measure of spasticity: reliability is agreement between raters, not evidence that the scale
  measures velocity-dependent hypertonia rather than passive stiffness.

### Salti G, Formelli B, Piccardi B, Barucci E, Poggesi A. Unilateral Spatial Neglect After Stroke: A Pragmatic Approach to Assessment and Rehabilitation.
*J Clin Med* 2026 · PMID 42590166 · PMC13466990 · **free full text**

- **Supports** — unilateral spatial neglect is found in **38% of individuals with right-hemisphere
  damage and 18% of those with left-hemisphere damage**, with the caveat in the same passage that
  reported figures vary with lesion location, time since onset and assessment method; that USN can
  co-occur with **hemianopia and hemianaesthesia**, worsening functional impact; that the
  **Behavioural Inattention Test** combines **six conventional paper-and-pencil tasks with nine
  behavioural tasks**; and that the **Catherine Bergego Scale** evaluates neglect in everyday
  activities rather than on paper.
- **Does not support** — cutoff scores or accuracy figures for any individual neglect test. It
  names the instruments and describes what they assess; it does not supply thresholds.

### Bohannon RW, Smith MB. Interrater reliability of a modified Ashworth scale of muscle spasticity.
*Phys Ther* 1987;67(2):206–207 · PMID 3809245 · **abstract only**

The origin of the scale everyone uses. The abstract carries real numbers, so it is citable — but
only for these and only in this population.

- **Supports** — two raters independently graded **elbow flexor** spasticity in **30 patients with
  intracranial lesions**; they **agreed on 86.7% of ratings**; **Kendall's tau = 0.847
  (p < 0.001)**; and the authors' own framing that the results were **limited to the elbow flexor
  muscle group** and were positive enough only "to encourage further trials."
- **Does not support** — the modified Ashworth Scale at any other joint, in any other population,
  or as a validated measure of spasticity. The paper that introduced the scale tested one muscle
  group in thirty people and said so.

### Brott T, Adams HP, Olinger CP, Marler JR, Barsan WG, Biller J, Spilker J, Holleran R, Eberle R, Hertzberg V. Measurements of acute cerebral infarction: a clinical examination scale.
*Stroke* 1989;20(7):864–870 · PMID 2749846 · **abstract only**

- **Supports** — a **15-item** neurologic examination stroke scale; interrater reliability **mean
  κ = 0.69** in 24 patients; test–retest **mean κ = 0.66–0.77**, not differing significantly
  between a neurologist, a neurology house officer, a neurology nurse and an emergency department
  nurse; validity against CT infarct size **r = 0.68** and against 3-month clinical outcome
  **r = 0.79** in 65 patients; and — the finding worth the whole citation — **the most interrater
  reliable item (pupillary response) had low validity, while less reliable items such as upper or
  lower extremity motor function were more valid.**
- **Does not support** — the modern NIHSS scoring, item definitions, or any severity band
  (the familiar 1–4 minor / 5–15 moderate / 16–20 moderate-severe / 21–42 severe cut points are
  **not** in this abstract and are not traceable from it).

### Tarnutzer AA, Shaikh AG, Zee DS. Ocular motor and vestibular examination in the unconscious patient — standard of care.
*Front Neurol* 2026 · PMID 41835076 · PMC12979088 · **free full text**

- **Supports** — that the **oculocephalic reflex** means assessing vestibular responses by
  **passive head-on-body rotations in the horizontal or vertical plane**; that **caloric
  irrigation** and galvanic vestibular stimulation are the alternatives when the head cannot be
  moved; and that caloric irrigation may elicit abnormal spontaneous vertical eye movements in
  coma.
- **Does not support** — any part of the ocular motor examination in an awake patient, which is
  what this guide's cranial nerve section is about. Cited once, for the oculocephalic reflex
  definition in the arousal section, and nowhere else.

---

## Existence-only — cited for what they are, never for a number

### Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale.
*Lancet* 1974;2(7872):81–84 · PMID 4136544 · **abstract only, and no abstract is indexed**

- **Supports** — that the Glasgow Coma Scale exists, its authors, and its year.
- **Does not support** — **the scale itself.** Europe PMC indexes no abstract. The three
  components, their ranges, the 3–15 total and every severity band are, on this search,
  **not traceable to a freely readable text**. The guide names the GCS, cites this paper for its
  existence, and flags the component scores in place rather than printing them unmarked.

### Freeman R, Wieling W, Axelrod FB, et al. Consensus statement on the definition of orthostatic hypotension, neurally mediated syncope and the postural tachycardia syndrome.
*Clin Auton Res* 2011;21(2):69–72 · PMID 21431947 · **abstract only, and no abstract is indexed**

- **Supports** — that a consensus definition exists and where it was published.
- **Does not support** — **the 20/10 mmHg threshold.** This is the paper that defines it and its
  text is not freely readable. Four separate open-access searches for a free paper quoting the
  definition verbatim returned incidental clinical studies, none of which state the criterion in
  full. The guide flags the threshold rather than printing it unmarked.

### Hornby TG, Reisman DS, Ward IG, et al. Clinical Practice Guideline to Improve Locomotor Function Following Chronic Stroke, Incomplete Spinal Cord Injury, and Brain Injury.
*J Neurol Phys Ther* 2020;44(1):49–100 · PMID 31834165 · **abstract only**

- **Supports** — that a graded locomotor CPG exists for these three populations.
- **Does not support** — any dose, intensity threshold or recommendation grade. The guide's scope
  excludes intervention, so this is listed for completeness and is not cited in the page.

---

## Read and rejected

### Fujiwara Y, et al. Validation of the Japanese version of the Montreal Cognitive Assessment. *Geriatr Gerontol Int* 2010;10(3):225–232 · PMID 20141536 · abstract only
Carries a **25/26 cutoff with sensitivity 93.0% and specificity 87.0%** for MCI — but in
**96 older Japanese subjects** using the **MoCA-J**, a translated instrument, in a memory clinic
and community sample. Using it as the source for "the MoCA cutoff is 26" in a neurologic
rehabilitation guide would attach a real number to the wrong population and the wrong version.
**Rejected.** The original (Nasreddine 2005, *JAGS*) is not indexed in Europe PMC at all.

### Staudt LA, Sargent B, Chen L, Fowler EG. Mini-SCALE. *Dev Med Child Neurol* 2026;68(2):211–217 · PMC12766546 · free
Validates a selective-motor-control measure in children **aged 3 months to under 4 years** with
cerebral palsy. The reader's "patterned vs. selective movement" competency is the right concept,
but this instrument's population is infants and toddlers. **Rejected** for an adult guide; the
concept is written from the anatomy and the mechanism instead, and the grading is flagged as
having no traceable source in adults.

---

## What could not be traced at all

These are printed in the guide with an in-place flag, never unmarked. Each was searched for on
title, on free-full-text keyword, and by checking what this repository already cites.

| Value | Why it isn't here |
|---|---|
| Glasgow Coma Scale component scores and 3–15 total | Origin paper has no indexed abstract |
| Orthostatic hypotension 20/10 mmHg threshold | Consensus statement not freely readable |
| MoCA cutoff of 26, and the +1 point education correction | Original not in Europe PMC; only translated validations are free |
| MMSE cutoffs | Same |
| 128 Hz as the tuning fork frequency for vibration | Convention; no source found that measures it |
| The 0–4 muscle-stretch reflex scale's *reliability* | The scale's definitions trace (Morimoto); its reliability does not |
| Perry's household / limited community / community ambulator gait speed bands | No freely readable source found carrying the cut points |
| Brunnstrom stages of recovery | No freely readable source found |
| Romberg test's accuracy for dorsal column disease | Searched; nothing measured found |
| Finger-to-nose, heel-to-shin, rapid alternating movement norms | Convention throughout |
| The order of the cranial nerve examination | Convention |
| Two-point discrimination normative values | No freely readable source found |
