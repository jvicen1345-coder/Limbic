# Muscle OINA guide — adversarial verification

Step 4 of `docs/oina-guide-build/README.md`. The rule that produced this file: **hunt for
errors, do not confirm.** For every muscle row, ask whether the cited chapter supports the
origin, insertion, nerve and action, and whether a sentence the chapter states clearly was
dropped or reversed.

177 muscle rows in 13 regional tables, plus the group, movement and nerve tables that restate
the same facts. Each row's name cell cites one StatPearls chapter (`refs.json`, 108 chapters).
Manual muscle test positions stay marked Convention. They are taught positions from texts that
are not free to read, so they were not treated as claims of the cited chapter.

---

## How the chapters were read

NCBI Bookshelf and Europe PMC both answer an automated fetch with a bot wall (reCAPTCHA and
Cloudflare). PubMed abstracts for these chapters are the introduction only, which is not
enough to check an origin or an insertion.

The full chapter text is in the NLM Literature Archive open-access package:

`https://ftp.ncbi.nlm.nih.gov/pub/litarch/3d/12/statpearls_NBK430685.tar.gz`

The copy used here was fetched on 24 September 2026. The archive listing dates that package
**18 May 2026**. Each cited PMID was mapped through PubMed to its `article-#####.nxml` file,
and the Introduction, Structure and Function, Nerves and Muscles sections were read against
the row.

That snapshot is the text this pass can stand behind. It is not a guarantee that the live
Bookshelf page is byte-for-byte the same today.

---

## Defects fixed in the draft

Each item is a place the row contradicted the cited chapter, or stated one nerve or one
attachment as the whole story when the chapter describes the usual pattern as split.
Corrected in the source files and rebuilt into `content/playbooks/muscle-oina.html`.

### Pectoralis minor — nerve · **severity: medium**

**Drafted:** "Medial pectoral n. (C8, T1)."

**Cited chapter** (*Anatomy, Shoulder and Upper Limb, Pectoral Muscles*): "The nerve supply
of the pectoralis minor is a function of the lateral pectoral nerve and the medial pectoral
nerve."

**Corrected to:** medial and lateral pectoral nerves (C8, T1 and C5–C7). The lateral pectoral
row in the nerve table now lists pectoralis minor with the clavicular head of pectoralis major.

### Pectoralis major, sternocostal head — nerve and origin · **severity: medium**

**Drafted:** "Lateral and medial pectoral nn. (C7, C8, T1)." Origin stopped at costal
cartilages 1–6.

**Cited chapter** (*Anatomy, Thorax, Pectoralis Major Major*): "The clavicular head derives
its nerve supply from the lateral pectoral nerve. The medial pectoral nerve innervates the
sternocostal head." The same introduction places the origin on the medial half of the
clavicle, the sternum, the first 7 costal cartilages, the sternal end of the sixth rib, and
the external oblique aponeurosis.

**Corrected to:** sternocostal head on the medial pectoral nerve (C8, T1), origin through
costal cartilages 1–7 and the sternal end of rib 6. The clavicular head stays on the lateral
pectoral nerve. Some dissection texts also give the sternocostal head a lateral-pectoral
twig through the ansa pectoralis; the cited chapter assigns the two heads separately, and the
row now follows that.

### Psoas major — origin and nerve · **severity: medium**

**Drafted:** bodies and discs of T12–L5, lumbar transverse processes; anterior rami of L1–L3.

**Cited chapter** (*Psoas Major*): the deep part from the first four lumbar vertebrae, the
superficial part from the twelfth thoracic vertebra and the discs between; transverse
processes of L1–L4. "The psoas major muscle is innervated via the anterior rami of L1–L4, and
also receives small branches from the femoral nerve." The chapter never mentions L5.

**Corrected to:** T12–L4, discs, and transverse processes of L1–L4, with a Contested marker
that many dissection texts also include L5. Nerve: anterior rami of L1–L4, plus small femoral
branches.

### Sartorius — action · **severity: medium**

**Drafted:** flexes, abducts and laterally rotates the hip, and flexes the knee.

**Cited chapter:** "At the knee, it acts to flex as well as internally rotate."

**Corrected to:** the knee action now includes medial rotation of the tibia.

### Gastrocnemius — origin · **severity: medium**

**Drafted:** medial head from the popliteal surface of the femur above the medial condyle.

**Cited chapter** (*Calf*): "the lateral head originates from the lateral surface of the
lateral femoral condyle and the medial head from the posterior, nonarticular aspect of the
medial femoral condyle."

**Corrected to:** that wording.

### Spinalis — insertion · **severity: medium**

**Drafted:** upper thoracic spinous processes, "and the skull, capitis."

**Cited chapter** (*Anatomy, Back, Muscles*): spinalis thoracis runs from T11–L2 to the upper
thoracic spinous processes. Spinalis cervicis, when present, runs from the ligamentum nuchae
and C7 to the axis and C3–C4. "Spinalis capitis: Usually, a few fibers of semispinalis
capitis that inserts onto the spinous processes of C7 and T1."

**Corrected to:** those three attachments. Capitis is not described as reaching the skull.

### External urethral sphincter — nerve · **severity: high**

**Drafted:** the perineal-muscle row, which includes the external urethral sphincter, said
only "Pudendal n., perineal branches (S2–S4)."

**Cited chapter** (*Deep Perineal Space*): "The urethral sphincter complex exhibits dual
somatic innervation, receiving fibers from both the pudendal nerve and direct branches of the
sacral plexus. The latter descend along the surface of the levator ani."

**Corrected to:** the row keeps the pudendal supply for the group and adds the direct sacral
branches for the external urethral sphincter. Bulbospongiosus, ischiocavernosus and
transverse perinei stay on the pudendal nerve.

### Medial pterygoid — origin · **severity: medium**

**Drafted:** pyramidal process of the palatine bone with the deep head.

**Cited chapter:** the superficial head arises from the maxillary tuberosity and the
pyramidal process of the palatine; the deep head arises from the medial side of the lateral
pterygoid plate.

**Corrected to:** the pyramidal process sits with the superficial head.

### Genioglossus — insertion and action · **severity: medium**

**Drafted:** insertion "dorsum of the tongue and the body of the hyoid"; action "protrudes
the tongue and depresses its centre."

**Cited chapter** (*Genioglossus*): inserts on the hyoid and the inferior portion of the
tongue. "The primary function of the genioglossus muscle is to protrude the tongue anteriorly
and deviate the tongue to the opposite side." Bilateral action depresses the middle of the
tongue. (The broader tongue chapter says the fibres reach the dorsum. The row cites the
genioglossus chapter, which does not.)

**Corrected to:** inferior tongue and hyoid; protrusion, contralateral deviation, and
depression of the centre when both sides act. The bedside finding is unchanged: the tongue
deviates toward the weak side because the intact muscle pushes it across.

### Palatopharyngeus and salpingopharyngeus — insertion and action · **severity: medium**

**Drafted:** one row for levator, uvulae and palatopharyngeus listed the palatine aponeurosis
as an insertion of the group. A second row put salpingopharyngeus on the pharyngeal raphe and
gave it the constrictors' action.

**Cited chapter** (*Pharyngeal Muscles*): palatopharyngeus originates from the posterior hard
palate and the palatine aponeurosis and inserts on the thyroid cartilage. Salpingopharyngeus
originates from the auditory tube and inserts on palatopharyngeus; it raises the pharynx and
opens the auditory tube.

**Corrected to:** palatopharyngeus inserts on the posterior border of the thyroid cartilage.
Salpingopharyngeus blends into palatopharyngeus and is no longer described as a constrictor.
The constrictors still meet in the pharyngeal raphe, and cricopharyngeus remains the upper
oesophageal sphincter.

### Intrinsic laryngeal muscles — action · **severity: medium**

**Drafted:** "tension (cricothyroid, thyroarytenoid)."

**Cited chapter:** every intrinsic muscle except posterior cricoarytenoid adducts the fold.
"The cricothyroid muscle is unique in that it elongates the vocal cords as well, which
creates tension on the vocal cords."

**Corrected to:** thyroarytenoid is listed with the closers and shortens the fold.
Cricothyroid is the muscle that lengthens and tenses it.

### Posterior scalene — origin and insertion · **severity: medium**

**Drafted:** posterior tubercles of C4–C6, external border of rib 2.

**Cited chapter:** "the posterior tubercles of the transverse processes of the last 3 or 4
cervical vertebrae" and "the anterior surface of the 2nd rib."

**Corrected to:** that origin and the anterior surface of rib 2.

### Serratus anterior — nerve · **severity: low**

**Drafted:** long thoracic nerve (C5–C7) as the whole supply.

**Cited chapter:** the superior slips also receive an independent cervical branch (C4, C5 or
C6), separate from the long thoracic trunk.

**Corrected to:** long thoracic nerve, with that superior cervical branch named.

### Smaller mismatches with the same chapters · **severity: low**

| Row | Draft | Chapter | Change |
|---|---|---|---|
| Middle and lower trapezius | Spinal accessory nerve only | CN XI is motor; C3–C4 carry pain and proprioception for the whole muscle | Same sensory line as the upper-trapezius row |
| Levator scapulae | Lateral neck flexion only | Also assists neck extension and ipsilateral rotation | Those two assists added |
| Latissimus dorsi | No scapular attachment | Includes the inferior angle of the scapula | Added |
| Abductor pollicis longus | Base of the 1st metacarpal only | Two slips: 1st metacarpal and trapezium | Trapezium added |
| Adductor pollicis | Proximal phalanx only | Proximal phalanx and the extensor hood | Hood added |
| Sternocleidomastoid | Medial third of the clavicle; lateral half of the superior nuchal line; bilateral extension "when the head is forward" | Medial quarter of the clavicle; anterior part of the superior nuchal line; extension when the cervical spine is free to move, flexion when it is held rigid | Wording matched to the chapter |
| Platysma | Arises below and above the clavicle | Arises from fascia over deltoid and pectoralis; fibres cross the clavicle | Origin moved to the upper-chest fascia |
| Abductor digiti minimi (foot) | Proximal phalanx only | Chapter names only the base of the 5th metatarsal | Phalanx kept; metatarsal slip added. See below |

---

## Chapter errors that were not copied

These are false or incomplete statements in the cited chapter. The row was not "corrected"
into them.

**Trapezius chapter, Muscles section.** It assigns latissimus dorsi to the dorsal scapular
nerve, and it has the rhomboids adducting, extending and medially rotating the arm. Latissimus
is the thoracodorsal nerve (C6–C8) in its own chapter, which is what the row says. The
rhomboid row keeps scapular retraction and downward rotation.

**Trapezius chapter, Structure and Function.** It lists ribs among the attachments and says
the descending fibres internally rotate the arm. The rows do not.

**Foot muscles chapter, abductor digiti minimi.** The prose and the table put the tendon on
the base of the 5th metatarsal and give the muscle abduction only. The usual insertion is the
lateral base of the proximal phalanx of the 5th toe, which is what flexion of that toe
requires; a slip to the 5th-metatarsal tuberosity is common and is the attachment the chapter
actually names. The row keeps the phalanx, adds the slip, and still says the muscle abducts
and flexes the toe.

**Pharyngeal muscles chapter, introduction.** It says the pharyngeal muscles receive both
glossopharyngeal and vagus nerves. The same chapter then says stylopharyngeus is the only
pharyngeal muscle on cranial nerve IX. The rows follow that specific assignment.

---

## Checked and left as written

- **Rhomboid roots C4, C5.** The rhomboid chapter says the dorsal scapular nerve originates
  from C5. The levator scapulae chapter says the same nerve originates from C4 and C5 and
  supplies the rhomboids. The row keeps C4, C5.
- **Contested rows that already stated the disagreement:** supinator roots, flexor pollicis
  brevis's split supply, pectineus (femoral, sometimes obturator), flexor digitorum longus
  and flexor hallucis longus roots, and the plantar intrinsic roots. Psoas major's caudal
  attachment was added to that list.
- **Manual muscle test positions.** Still Convention. Nothing in the free chapters replaces
  them.
- **0–5 grades and the ten key muscles (C5 elbow flexors through S1 ankle plantar flexors).**
  The wording matches the sentences the neurologic guide already traced to Rupp 2021
  (`docs/neuro-guide-build/content.py`). PMC returns only the article shell for PMC8152171
  ("The publisher of this article does not allow downloading of the full text in XML form"),
  so this pass did not re-read the booklet.
- **Row count.** Still 177 muscle rows. `src/lib/guides.ts` still records 21 sections, 34
  items and 101 references.

---

## Catalog drift, not rewritten

PubMed's current year or title differs from `refs.json` for a few chapters. The snapshot XML
still carries the title and the year stored in `refs.json` (a 2026 year inside those files is
a citation year, not a new chapter date). The live page may have been revised after 18 May
2026. Bookshelf could not be re-read, so the citation year was not bumped to a text this pass
did not see.

| Key | Stored | Live PubMed on 24 Sep 2026 |
|---|---|---|
| snuffbox, interossei | 2025 | 2026 |
| thigh | 2022 | 2026 |
| medthigh, fb, subocc | 2023 | 2026 |
| pharynx | Anatomy, Head and Neck: Pharyngeal Muscles | same title with "(Archived)" appended; year still 2024 |
| middleear | Anatomy, Head and Neck: Middle Ear | Middle Ear Anatomy and Physiology |

---

## Standing limit

The pass compared each row with the cited chapter's anatomy sections. It will not catch a
later edit to a Bookshelf page that post-dates the 18 May 2026 archive, and it will not catch
an error that both the row and the chapter share unless that statement is plainly false
against the chapter's own other sentences or against the muscle's own chapter. Manual muscle
test positions remain unchecked against a primary source.
