# Ankle Examination Playbook — verified source bank

Same contract as the hip and knee banks. Every entry was looked up and read. **Supports** is what
the freely readable text actually says; **Does not support** is what a reader might expect it to
say and it does not.

Status: **in progress.** Nothing below has been drafted into content yet.

---

## The guideline — and the search rule that found it

The knee build wrongly concluded its guideline was unreachable, because it searched Europe PMC and
an index page but never the repository. This build followed `README.md` and checked the hosting
pattern first. **It worked on the first attempt.**

The Academy hosts guideline PDFs at a path ending in the article's own DOI suffix. Martin 2021's
DOI is `10.2519/jospt.2021.0302`, so:

```
https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf   →  HTTP 200, 80 pages
```

Europe PMC lists this guideline as abstract-only. That was never evidence it could not be read.

*(The same pattern also resolves `jospt.2021.0304.pdf`, which is the 2021 Low Back Pain guideline —
not ankle, but worth knowing for later work.)*

### Martin RL, Davenport TE, Fraser JJ, Sawdon-Bea J, Carcia CR, Carroll LA, Kivlan BR, Carreira D. Ankle Stability and Movement Coordination Impairments: Lateral Ankle Ligament Sprains Revision 2021.
*J Orthop Sports Phys Ther* 2021;51(4):CPG1-CPG80 · PMID 33789434 · **free full text, openly hosted, 80 pages**

The best-sourced spine of any guide in this series — better than the hip's. **39 distinct lettered
recommendations** were extracted, spanning diagnosis, outcome measures, prevention, acute
management and chronic ankle instability.

- **Supports — the Ottawa Ankle Rules, with a caveat the knee guide's source lacked.**
  The guideline reports the OAR as having **sensitivity 92%–100% with specificity 7.8%–68%**.
  That specificity *range* is the finding: it is not one number but a fourteen-fold spread across
  studies. It also states that **the OAR must be applied in their entirety** — omitting malleolar
  tenderness and relying on inability to bear weight and take four steps dropped sensitivity to
  **88%**. In paediatric patients the low-risk ankle rules' sensitivity of **85.7%** is inferior to
  the OAR's **100%**. Implementation in emergency departments reduced cost, wait time, length of
  stay (median **20 minutes**) and imaging **without sacrificing outcomes**.

- **Supports — examination, Grade B.** Use special tests *including the reverse anterolateral
  drawer test and anterolateral talar palpation* **in addition to** the traditional anterior drawer
  test, alongside history and physical examination, to aid diagnosis of a lateral ankle sprain.
  Classify acute sprains using level of function, ligamentous laxity, haemorrhaging, point
  tenderness, total ankle motion, swelling and pain.

- **Supports — what to document, Grade A.** Assess and document **ankle swelling, ROM, talar
  translation, talar inversion and single-leg balance** at baseline and **two or more times** over
  an episode of care. Use validated outcome measures — PROMIS physical function and pain
  interference, the Foot and Ankle Ability Measure, and the LEFS (Grade A). The **CAIT** may be
  used to identify presence and severity of instability (Grade B). PSEQ, TSK-11 and FABQ may be
  used for coping and fear-avoidance (Grade C).

- **Supports — prevention, Grade A.** Prophylactic **bracing** to reduce first-time sprain risk,
  particularly with risk factors; prophylactic bracing **plus** proprioceptive and balance-focused
  exercise to reduce subsequent injury. Prophylactic balance training for those who have never
  sprained is only **Grade C**.

- **Supports — acute management.** **A:** advise external supports (brace or taping) and
  **progressive weight bearing**; repeated intermittent **ice** to reduce pain, reduce analgesic
  need and improve weight bearing; **rehabilitation with therapeutic exercise for severe sprains**.
  **A, against:** **do not use ultrasound** for acute ankle sprains. **B:** a return-to-work
  schedule with early bracing, occupational or sport-related training, and/or work hardening.
  **C:** pulsed shortwave diathermy for oedema and gait deviation; low-level laser for early pain;
  NSAIDs where practice acts allow.

- **Supports — chronic ankle instability.** **A:** proprioceptive and neuromuscular exercise for
  dynamic postural stability and perceived stability; **manual therapy including graded joint
  mobilisations, manipulations, and weight-bearing and non-weight-bearing mobilisation with
  movement**, to improve dorsiflexion, proprioception and balance. **B, against:** **do not use
  bracing or taping as a stand-alone intervention** to improve balance and postural stability.
  **B:** multiple interventions may supplement balance training, guided by patient values.
  **C:** dry needling of the fibularis group alongside proprioceptive training.

- **Supports — prognosis.** Predictors of chronic ankle instability at 6 months include
  **inability to complete jumping and landing tasks within 2 weeks** of injury, poorer dynamic
  postural control, and lower self-reported function. Not using prophylactic bracing and not
  participating in a balance-training exercise programme are risk factors for a subsequent sprain.

- **Supports — what to measure specifically, Grade A.** Beyond the general list, the guideline
  names the instruments: dorsiflexion by the **weight-bearing lunge test**; **static single-limb
  balance on a firm surface with eyes closed**; and dynamic balance by the **Star Excursion
  Balance Test** in the **anterior, anteromedial, posteromedial and posterolateral** reach
  directions. In CAI, hip **abduction, extension and external rotation strength** may also be
  assessed and documented two or more times (Grade C).

- **Supports — classifying chronic instability, Grade B.** Use a reliable and valid discriminative
  instrument — the **Cumberland Ankle Instability Tool** or the **Identification of Functional
  Ankle Instability** — together with a battery of functional performance tests with established
  validity to differentiate people with CAI from healthy controls.

- **Supports — two prognostic findings worth a row each.**
  **Laxity and function come apart:** over six weeks after a sprain, self-reported function
  improved significantly while **ankle laxity did not change** on the anterior drawer test
  (P > .05). A patient can feel much better with an unchanged drawer.
  **MRI bone marrow contusion predicts a slower course:** a medial joint bone marrow contusion on
  the tibia and/or talus within two weeks of injury meant **25 versus 16 days** to normal walking
  (P = .0002) and **92 versus 56 days** to sport (P = .0001).

### A near-miss recorded, because it is the failure mode this file exists to catch

Searching this 80-page PDF for "talar tilt" returns a confident-looking hit. It is inside the
guideline's **literature search-strategy appendix** — a list of database query terms
(`talar tilt inversion[tw] OR talar tilt eversion[tw] OR ...`), not a finding, not a
recommendation, and not a number. Quoting accuracy for the talar tilt test from that passage would
have produced a fabricated claim attached to a real guideline and a real page.

**So: no Sn/Sp for the anterior drawer or talar tilt tests has been found in this guideline.** It
*recommends* the anterior drawer test alongside the reverse anterolateral drawer test and
anterolateral talar palpation at Grade B, without publishing their accuracy in the text read so
far. Until a figure is found and read, those tests get the recommendation and **no numbers**.

**The general rule this adds:** a full-text search of a guideline hits its appendices, reference
list and search strategy as readily as its findings. Check what section a match sits in before
treating it as content.

- **Does not support** — ankle *osteoarthritis*, Achilles tendinopathy, plantar heel pain, or
  medial ankle injury. Its scope is **lateral** ankle ligament sprains and chronic ankle
  instability. Two further hosted guidelines cover Achilles and plantar heel pain and are listed
  below as located-not-yet-read.

---

## The other two hosted guidelines: one usable, one deliberately not

### Chimenti RL, Neville C, Houck J, Cuddeford T, Carreira D, Martin RL. Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision 2024.
*J Orthop Sports Phys Ther* · **free full text, openly hosted, 32 pages** · no access restriction on the document

**Usable.** 25 distinct lettered recommendations. The headline is **A: tendon loading exercise
with loads as high as tolerated, as first-line treatment** to improve function and decrease pain,
and **A: mechanical loading either as eccentric or heavy-load slow-speed work**. **B:** education
and counselling, with either a pain-science or pathoanatomic focus, combined with loading; and
**B: complete rest is not indicated** — patients should continue activities within pain tolerance.
**B:** iontophoresis with dexamethasone in acute midportion tendinopathy. **C, against:** low-level
laser; therapeutic ultrasound alone; night splints. **C:** heel lifts to temporarily reduce
dorsiflexion; plantar flexor stretching with knee flexed and extended where dorsiflexion is
limited; multimodal treatment to enhance exercise. **D:** no recommendation possible on orthoses,
because the evidence is contradictory. **F:** manual therapy, dry needling, neuromuscular exercise.

- **The recommendation that reversed, and why the year header matters.** Therapeutic elastic tape
  appears twice with opposite advice. The **2018** recommendation was **F: should *not* use** it.
  The **2024** recommendation is **E: *may* use** it. Both are weak grades, and the direction
  flipped between revisions. A extraction that ignored the era header would have put a flat
  self-contradiction into the guide with both halves correctly cited. **The 2024 recommendation is
  the current one.**

### Heel Pain — Plantar Fasciitis: Revision 2023 — **not used, deliberately**

The URL resolves and the PDF downloads, but **every one of its 49 pages is watermarked**: *"This
document is strictly confidential and solely for selective stakeholder review. This draft document
may not be reproduced or circulated."*

It is not used here, for two independent reasons. It is a **draft under stakeholder review**, so
its values may differ from whatever was finally published — quoting them as the guideline would
misstate the guideline. And it asks not to be reproduced or circulated, which quoting it into a
paid study guide would do.

**A note for the project, not for the guide:** `src/lib/orthopt-cpg-static.ts:100` links this same
PDF to users, described as "AOPT's third revision of the heel pain / plantar fasciitis guideline".
That is a product decision rather than a sourcing one, so it has been left alone and raised with
the user instead of changed unilaterally.

---

## Located, not yet read

Both have now been read. See above: the Achilles guideline is usable, the heel pain draft is not.

---

## Era check — done, and resolved

The 39 extracted recommendations were re-run with the era header tracked. They split three ways:

| Where it came from | Count | Status |
|---|---|---|
| **Front-matter "Summary of Recommendations"** | **18** | **Current. Draft from these.** |
| Body, headed *2013 Recommendation* | 11 | Prior revision. Do not quote as current. |
| Body, headed *2021 Recommendation* | 10 | Current, restating the summary |

**The structure, confirmed by position rather than assumed.** "Summary of Recommendations" begins
on page 2 (character 1930 of the extracted text); the first graded recommendation follows at 3464;
the first `20XX Recommendation` header does not appear until character 69817, deep in the body. So
everything graded before that point is the front-matter summary, and the body then works through
each topic as a *2013* / *2021* pair.

**The rule for this build:** draft from the **front-matter Summary of Recommendations only**. It is
unambiguously the current set, and it is the same part of the document the hip guide was built
from. Body recommendations are useful for the reasoning and the harms beside them, but the era
header must be read before any of them is quoted.

Several 2013 recommendations restate their 2021 counterparts almost word for word — "should not
use ultrasound" appears in both — which is what makes eyeballing them unsafe. Sameness in most
cases is exactly what hides the one case that changed, and the Achilles guideline has such a case:
therapeutic elastic tape went from *should not* (2018, F) to *may* (2024, E).

## Still to chase

Anterior drawer and talar tilt **accuracy figures from a source that actually reports them** —
see the near-miss above; the guideline recommends the tests without publishing their accuracy ·
syndesmosis tests · weight-bearing lunge
test reliability and normative values · the Cumberland Ankle Instability Tool's cut-off ·
the exact figures behind the jumping-and-landing predictor.

## Expected to be untraceable, from the hip and knee builds

Normative ankle range of motion. Both prior joints returned nothing free, and the classic tables
are paywalled at the table. Confirm briefly rather than searching from scratch, and mark it
`Convention`. Note that Roach 1991 covers hip and knee only, so it supports the *argument* here
but is not an ankle figure.
