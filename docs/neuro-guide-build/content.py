# -*- coding: utf-8 -*-
"""The neurologic examination guide's content — this file IS the draft (step 3 of
docs/joint-playbook-template.md). build.py renders it into the template.

Every value carries one of:
  <span class="src">Author Year</span>      traced to the free text of that paper (sources.md)
  <span class="prov c">Convention</span>    taught everywhere, tested by nobody
  <span class="prov x">Contested</span>     measured, and the studies disagree
  <span class="src">no traceable source</span>   searched for, not found (renders as a flag)

The last column of every table is the FINDING — the number, threshold or discriminator that
turns the step into information. Never a restatement of the step.
"""

C = lambda: '<span class="prov c">Convention</span>'
X = lambda: '<span class="prov x">Contested</span>'
def S(t): return '<span class="src">%s</span>' % t
NOSRC = '<span class="src">no traceable source</span>'

# ---------------------------------------------------------------- checklist
# (name, how, finding, import-keywords)
CHECK = [
 ("PHASE", "Interview — before you touch anything"),
 ("Onset tempo",
  "Ask when the deficit began and how fast it reached its worst: seconds, hours, days, weeks or years.",
  "<b>Tempo names the mechanism before the exam starts.</b> Seconds-to-minutes to maximum deficit is vascular; hours-to-days is inflammatory or demyelinating; weeks-to-months is compressive or neoplastic; years is degenerative. " + C() + " A deficit that was maximal at onset and is improving behaves differently from one still progressing, and that difference decides how much of today's exam is a baseline.",
  "onset|tempo|progression|maximal"),
 ("Course since onset",
  "Ask whether it is better, worse, unchanged, or relapsing-remitting since it began.",
  "<b>Relapsing-remitting with recovery between events points at demyelination; stepwise worsening points at repeated vascular events; steady decline points at a degenerative process.</b> " + C() + " Ask for the best day since onset — patients report their current state, and the best day is what tells you the ceiling.",
  "relapsing|remitting|stepwise|decline"),
 ("Deficits the patient names",
  "Ask what they cannot do now that they could do before, in their words, before offering any of your own.",
  "<b>The patient's own list is the goal set the outcome measures have to answer to.</b> The core-measures CPG conditions every recommendation on the patient having <i>goals and the capacity to change</i> in that area " + S("Moore 2018") + ", so a measure chosen before the goals are known is a measure that may not apply.",
  "patient|goals|capacity|deficit"),
 ("Handedness and premorbid function",
  "Ask which hand they write with, and what their function was the week before onset.",
  "<b>Handedness predicts which hemisphere is language-dominant, and premorbid function is the ceiling for every goal you set.</b> " + C() + " A 10 metre walk of 0.6 m/s means something different in someone who was housebound before onset than in someone who was running.",
  "handedness|premorbid|dominant|baseline"),
 ("Red-flag and safety screen",
  "Screen for new or worsening headache, fever, neck stiffness, bowel or bladder change, saddle anaesthesia, and any deficit still progressing right now.",
  "<b>Any of these stops the examination and routes to medical review rather than continuing.</b> " + C() + " A still-progressing deficit is the one that most often gets examined instead of escalated — the examination will still be there in an hour, and the window for treatment may not be.",
  "red flag|saddle|progressive|escalate"),
 ("PHASE", "Vitals — before anything upright or exertional"),
 ("Resting vital signs",
  "Take heart rate, blood pressure, respiratory rate and oxygen saturation in the position the patient is already in, before you move them.",
  "<b>The resting set is the comparator for everything that follows</b>; a post-activity value without a pre-activity value is uninterpretable. " + C() + " Record the position it was taken in — supine, sitting or standing changes the number.",
  "resting|baseline|vital signs|position"),
 ("Orthostatic challenge",
  "Measure supine after 5 minutes, then again at 1 and 3 minutes after sitting and after standing, keeping the cuff at heart level.",
  "<b>A sustained fall in systolic or diastolic pressure on standing, with symptoms, means upright testing is unsafe today.</b> The 20/10 mmHg consensus threshold is defined in a statement whose text is not freely readable " + S("Freeman 2011") + ", so the exact cut point is " + NOSRC + " here. The symptom — greying vision, light-headedness — decides the session either way.",
  "orthostatic|supine|standing|systolic"),
 ("Autonomic dysreflexia screen",
  "In a spinal cord injury at or above T6, ask about pounding headache, flushing and sweating above the level, and check blood pressure against that patient's own baseline.",
  "<b>A rising blood pressure with headache above a T6 lesion is a medical emergency, not a finding to document.</b> " + C() + " Sit the patient up, loosen constrictions, and look for the noxious stimulus below the level — most often a blocked catheter or a full bowel. Baseline systolic in tetraplegia is often low, so a 'normal' reading can already be a large rise for that person.",
  "dysreflexia|noxious|tetraplegia|headache"),
 ("PHASE", "Cognition and communication — the gate on everything downstream"),
 ("Arousal and level of consciousness",
  "Grade the least stimulus that produces a response: voice, touch, then noxious stimulus.",
  "<b>Arousal is graded before content, because an unarousable patient has no interpretable exam.</b> The Glasgow Coma Scale is the standard vocabulary " + S("Teasdale 1974") + ", but its component scores and 3–15 total are " + NOSRC + " in freely readable form. Record what the patient did and to what stimulus, which survives any scale.",
  "arousal|stimulus|consciousness|noxious"),
 ("Orientation and sustained attention",
  "Ask person, place, time and situation, then test attention with a task that has to be held — months backwards, or serial subtraction.",
  "<b>Orientation can be intact while attention is not, and it is attention that invalidates the rest of the exam.</b> " + C() + " A patient who cannot hold months-of-the-year backwards cannot give a reliable sensory exam, and any sensory finding recorded after that point should be marked provisional.",
  "orientation|attention|months|serial"),
 ("Standardized cognitive screen",
  "Administer the screen your service uses, in a quiet room, with hearing aids and glasses on.",
  "<b>Record the score with its version and the education correction applied.</b> The MoCA's cutoff of 26 and its +1 point education adjustment are " + NOSRC + " in freely readable form — the original is not indexed, and only translated validations are free (see sources.md). Score the instrument, then say which domains failed; the profile is worth more than the total.",
  "cognitive|screen|education|domain"),
 ("Communication screen",
  "Separate comprehension, expression and articulation: follow a one-step command without gesture, name three objects, and repeat a phrase.",
  "<b>A patient who fails a command may not have a motor deficit — they may not have understood it.</b> " + C() + " Aphasia is a language failure and dysarthria is an articulation failure; a dysarthric patient writes the correct answer, an aphasic one does not. Every 'unable to follow instruction' in the notes below this line has to say which of the two it was.",
  "aphasia|dysarthria|comprehension|repetition"),
]

CHECK += [
 ("PHASE", "Cranial nerves — tested in order, because the order is a map of the brainstem"),
 ("CN II — acuity, fields, pupils",
  "Test acuity one eye at a time with correction on, confront the fields in four quadrants each eye, then swing a light between the pupils.",
  "<b>Where the field loss stops tells you where the lesion is.</b> Monocular loss is prechiasmal; bitemporal loss is chiasmal; a homonymous loss respecting the vertical midline is retrochiasmal and contralateral. " + C() + " A relative afferent pupillary defect — the pupil dilating as the light swings to it — is the one pupil finding that localizes to the optic nerve rather than the iris.",
  "confrontation|homonymous|afferent|quadrant"),
 ("CN III, IV, VI — extraocular movement",
  "Track an H pattern, then hold the end positions and watch for nystagmus and for one eye lagging.",
  "<b>A single-nerve palsy moves the eye in a nerve pattern; a gaze palsy moves both eyes together.</b> " + C() + " CN IV is the one you have to look for deliberately: the eye is highest in adduction, so the patient tilts the head away from the affected side. An adduction lag with nystagmus in the abducting eye is an internuclear ophthalmoplegia and is a brainstem finding, not a nerve finding.",
  "extraocular|nystagmus|adduction|palsy"),
 ("CN V — sensation and mastication",
  "Test light touch in all three divisions on both sides, then palpate masseter and temporalis on clench.",
  "<b>Loss that follows V1, V2 or V3 is trigeminal; loss that stops at the jawline is not.</b> " + C() + " Facial sensation is also the reference standard for the whole sensory exam: the ISNCSCI definition of normal sensation is that it feels the same as on the cheek " + S("Rupp 2021") + ", so an abnormal face invalidates the control you are about to compare every dermatome against.",
  "trigeminal|division|masseter|cheek"),
 ("CN VII — facial movement",
  "Ask for raised brows, tight eye closure, and a wide smile, and compare the two halves at each.",
  "<b>Forehead spared means upper motor neuron; forehead involved means lower motor neuron.</b> " + C() + " The upper face has bilateral cortical supply, so a hemispheric lesion weakens the lower face only. This is the single most useful discriminator on the cranial nerve exam and the one most often skipped by testing only the smile.",
  "forehead|sparing|facial|closure"),
 ("CN VIII — hearing and vestibular",
  "Rub fingers beside each ear, then look for spontaneous nystagmus with fixation and again with fixation removed.",
  "<b>Nystagmus that suppresses with fixation is peripheral; nystagmus that does not suppress, or that changes direction with gaze, is central.</b> " + C() + " In an unconscious patient the vestibular system is tested instead by the oculocephalic reflex — passive head-on-body rotation in the horizontal or vertical plane " + S("Tarnutzer 2026") + ".",
  "nystagmus|fixation|vestibular|oculocephalic"),
 ("CN IX, X — palate, voice, swallow",
  "Watch the palate rise on 'ah', listen to voice quality, and ask about coughing or wet voice after drinking.",
  "<b>The uvula deviates away from the weak side, and a wet voice after swallowing is an aspiration flag that stops oral intake until it is cleared.</b> " + C() + " This is the one cranial nerve finding with an immediate safety consequence, which is why it is tested before anything is given by mouth rather than at the end.",
  "palate|uvula|aspiration|swallow"),
 ("CN XI, XII — SCM, trapezius, tongue",
  "Resist head rotation and shoulder shrug, then have the tongue protrude and push into each cheek.",
  "<b>The tongue deviates toward the weak side on protrusion, because the intact genioglossus pushes it across.</b> " + C() + " Sternocleidomastoid turns the head to the <i>opposite</i> side, so a weak right SCM shows as weak head rotation to the left — the pairing students most often invert.",
  "protrusion|deviation|sternocleidomastoid|shrug"),
 ("PHASE", "Sensation — before motor, because sensory loss explains motor findings"),
 ("Light touch",
  "With vision blocked, stroke cotton once across an area not exceeding 1 cm of skin at each key sensory point, comparing every point against the cheek.",
  "<b>Score each point 0 = absent, 1 = altered including hyperaesthesia, 2 = normal, and NT where it cannot be tested</b> " + S("Rupp 2021") + ". Twenty-eight dermatomes from C2 to S4–5 per side, 56 points maximum per side for light touch. The single stroke matters: a repeated or dragged stroke recruits pressure and moving-touch afferents and turns an absent point into an altered one.",
  "cotton|dermatome|hyperaesthesia|stroke"),
 ("Sharp/dull discrimination",
  "Use a safety pin stretched apart — the pointed end for sharp, the rounded end for dull — and ask the patient to distinguish the two, not to rate intensity.",
  "<b>The same 0/1/2 scoring, and 56 points maximum per side, giving 112 points per side across both modalities</b> " + S("Rupp 2021") + ". <b>The question is 'sharp or dull', never 'is this sharp'</b>: without the dull comparator a patient who feels only pressure scores as intact. Inability to distinguish sharp from dull is scored 0 even when touch is felt.",
  "safety pin|sharp|dull|discrimination"),
 ("Vibration",
  "Strike a tuning fork and place it on a bony prominence distally first, then move proximally until it is felt, comparing side to side.",
  "<b>The finding is the most distal bony landmark at which vibration is felt, and the level at which it changes.</b> The 128 Hz frequency is " + NOSRC + " — universally taught, no source found that measures it. Vibration and proprioception travel together in the dorsal columns, so a vibration level that disagrees with the pin-prick level is the finding that separates a dorsal-column from a spinothalamic lesion.",
  "tuning fork|vibration|bony|prominence"),
 ("Proprioception / joint position sense",
  "Hold the digit at its sides, demonstrate up and down with vision, then with vision blocked move it a few degrees and ask which way.",
  "<b>Grip the sides, never the top and bottom.</b> " + C() + " Gripping dorsally and volarly lets the patient answer from the pressure change alone, which is the commonest way this test is faked into a normal result. ISNCSCI lists joint movement appreciation and position sense as <i>optional</i> rather than required, and grades them on the same absent / impaired / normal scale — 0 meaning the patient cannot correctly report joint movement on large movements of the joint " + S("Rupp 2021") + ".",
  "position sense|excursion|digit|vision"),
 ("Cortical sensation",
  "Only when light touch and pin prick are intact: test stereognosis, graphaesthesia and double simultaneous stimulation.",
  "<b>These are only interpretable with intact primary sensation — a patient who cannot feel the object cannot be expected to name it.</b> " + C() + " Extinction on double simultaneous stimulation, with both sides felt individually, is a parietal finding and overlaps with the neglect examination further down.",
  "stereognosis|graphaesthesia|extinction|parietal"),
]

CHECK += [
 ("PHASE", "Tone and reflexes — the upper-versus-lower motor neuron decision"),
 ("Tone at rest",
  "With the limb fully supported and the patient not assisting, move each joint slowly through range and feel the resistance.",
  "<b>Slow movement is the point: it removes the velocity that provokes spasticity, so what is left is the resting state.</b> " + C() + " Hypotonia with a hyporeflexic limb is a lower motor neuron or cerebellar picture; normal resting tone does not exclude spasticity, because spasticity is only visible at speed.",
  "resting tone|supported|slowly|resistance"),
 ("Velocity-dependent resistance",
  "Repeat the same movement fast, and grade the resistance and the point in range at which it appears.",
  "<b>Resistance that appears only at speed is spasticity; resistance that is the same at every speed is rigidity or contracture.</b> The Modified Ashworth Scale is the usual grading, with interrater agreement of 86.7% and Kendall's tau 0.847 — but in <i>elbow flexors only, in 30 patients</i>, which is all its origin paper tested " + S("Bohannon 1987") + ". A later study in 23 children with cerebral palsy found intrarater ICC 0.91–0.99 and interrater ICC 0.80–0.89, and warned against interpreting it at the individual level " + S("Pušnik 2026") + ".",
  "velocity|spasticity|Ashworth|rigidity"),
 ("Deep tendon reflexes",
  "Test biceps, brachioradialis, triceps, patellar and Achilles with the limb relaxed and the tendon slightly stretched, comparing side to side.",
  "<b>Grade on the NINDS scale: 0 absent; 1+ small, less than normal, including a trace or a response only with reinforcement; 2+ brisk, within the median normal range; 3+ enhanced, high normal or hyperreflexia; 4+ enhanced with intermittent clonus</b> " + S("Morimoto 2024") + ". <b>Asymmetry is worth more than the absolute grade</b> — a symmetric 3+ can be normal for that person, and a 2+ on one side against 1+ on the other cannot.",
  "NINDS|reflex|reinforcement|asymmetry"),
 ("Clonus and pathological reflexes",
  "Dorsiflex the ankle briskly and hold, then stroke the lateral sole from heel to forefoot and across.",
  "<b>An upgoing great toe has specificity 99% (95% CI 97.7–100) but sensitivity only 50.8% (95% CI 41.5–60.1) for pyramidal tract dysfunction</b> " + S("Morimoto 2024") + ". <b>So a present Babinski settles it, and an absent one settles nothing</b> — that follows from the sensitivity figure, not from the paper's own sentence on the point, which is worded the other way round and cannot mean what its numbers do. Intra-observer reliability is 0.467–0.571, so record what the toe did, not your conclusion.",
  "Babinski|plantar|clonus|pyramidal"),
 ("PHASE", "Motor control — what escapes the synergy"),
 ("Patterned versus selective movement",
  "Ask for one joint to move while the others stay still, then watch whether the neighbouring joints move with it.",
  "<b>The finding is whether the movement can be isolated, and which joints are dragged along when it cannot.</b> " + C() + " Obligatory coupling of shoulder abduction with elbow flexion, or hip flexion with knee flexion and ankle dorsiflexion, is patterned movement. The named stages of recovery through which this is classically described are " + NOSRC + " in freely readable form.",
  "selective|isolated|coupling|synergy"),
 ("Selective control, graded per joint",
  "Grade each joint separately through its available range, holding the proximal segment so it cannot substitute.",
  "<b>Record a grade per joint, not an impression per limb</b> " + C() + " — selective control is not uniform down a limb, and a patient with no selective ankle control may have full selective hip control. Published ordinal instruments for this exist but are validated in children with cerebral palsy, not adults (see sources.md), so the adult grading here is " + NOSRC + ".",
  "graded|proximal|substitution|ordinal"),
 ("Upper motor control test",
  "Take the limb through range passively, then ask for the same movement actively, and note where in the range control is lost.",
  "<b>The finding is the arc, not a yes or no</b> " + C() + " — control is commonly present through the first part of range and lost as the limb approaches the position that demands the most selective activation. Comparing the passive and active arcs separates a control problem from a range problem: equal arcs mean control, a shorter active arc means the deficit is neural.",
  "passive|active|arc|control"),
 ("Strength, where it is interpretable",
  "Test key muscles against gravity and then against resistance, in a muscle-specific position, with the joint supported.",
  "<b>Grade 0 total paralysis; 1 palpable or visible contraction; 2 full ROM gravity eliminated; 3 full ROM against gravity; 4 full ROM against moderate resistance; 5 full ROM against full resistance</b> " + S("Rupp 2021") + ". <b>A manual muscle test is not interpretable through significant spasticity or through patterned movement</b>: the resistance you feel is the tone, and the movement you grade may be the synergy. Test what the patient can isolate, and say so when you could not.",
  "manual muscle|gravity|resistance|paralysis"),
 ("PHASE", "Coordination and perception"),
 ("Non-equilibrium coordination",
  "Finger-to-nose, heel-to-shin and rapid alternating movements, each performed with vision and then with vision removed.",
  "<b>Worsening markedly when vision is removed makes it sensory, not cerebellar</b> " + C() + " — the cerebellar patient is roughly as inaccurate either way, because the cerebellum is not being fed by vision in the first place. Norms for speed and accuracy on all three are " + NOSRC + "; the comparators are the other side and the change over time.",
  "finger to nose|heel shin|alternating|vision"),
 ("Equilibrium coordination and Romberg",
  "Stand with feet together, arms at the sides, eyes open for 30 seconds, then eyes closed, with a guard in place.",
  "<b>Romberg is positive only if standing is steady with eyes open and unsteady with them closed</b> " + C() + " — that pattern isolates proprioception, because vision was compensating for it. A patient unsteady with the eyes already open has a cerebellar or vestibular problem and has not performed a Romberg at all. Accuracy figures for the test are " + NOSRC + ".",
  "Romberg|eyes closed|proprioception|steady"),
 ("Visual field versus neglect",
  "Confront the fields, then present stimuli in both hemifields at once, and watch how the patient scans a page.",
  "<b>A field cut that the patient compensates for by turning the head is hemianopia; failure to attend to a side the eyes can see is neglect.</b> Unilateral spatial neglect is found in 38% of individuals with right-hemisphere damage and 18% with left-hemisphere damage, with reported figures varying by lesion location, time since onset and assessment method " + S("Salti 2026") + ". The two can coexist and worsen each other " + S("Salti 2026") + ".",
  "hemianopia|neglect|hemifield|scanning"),
 ("Visual-perceptual and praxis screen",
  "Ask for a cancellation or line-bisection task on paper, then watch a familiar action performed to command and then with the real object.",
  "<b>Paper tasks and daily-life tasks disagree often enough that both are needed</b>: the Behavioural Inattention Test pairs six conventional paper-and-pencil tasks with nine behavioural ones, and the Catherine Bergego Scale rates neglect in everyday activity rather than on paper " + S("Salti 2026") + ". A patient who performs an action correctly with the object but not to command has a praxis problem, not a motor one " + C() + ".",
  "cancellation|bisection|praxis|behavioural"),
 ("PHASE", "Function and synthesis"),
 ("Functional task analysis",
  "Watch the whole task once at the patient's own pace, then name the phase in which it breaks down and the impairment that explains it.",
  "<b>The finding is the phase, not the score</b> " + C() + " — 'loss of control in mid-stance on the left' is actionable and 'poor gait' is not. Run the task before the impairment measures where you can: what fails in the task tells you which impairment measures are worth taking.",
  "task analysis|phase|breakdown|impairment"),
 ("Core outcome measures",
  "Administer the core set for the areas the patient has goals in, at admission and discharge and between when feasible.",
  "<b>Berg Balance Scale for sitting and standing balance (strong, level I); Functional Gait Assessment for balance while walking; ABC Scale for balance confidence; 10 metre Walk Test for speed; 6-Minute Walk Test for distance</b> " + S("Moore 2018") + ". Each is conditioned on the patient having goals <i>and the capacity to change</i> in that area " + S("Moore 2018") + ".",
  "core set|admission|discharge|outcome"),
 ("Localize the lesion",
  "Before writing anything, state the one level that explains every finding you recorded.",
  "<b>One lesion should account for the whole list; where it cannot, say so explicitly rather than writing a level that fits most of it.</b> " + C() + " The commonest error is a level that explains the motor findings and ignores the sensory ones. A finding that does not fit is either a second lesion, a pre-existing deficit, or a testing error — and each of those is a different next step.",
  "localize|level|explain|discrepancy"),
]

# ---------------------------------------------------------------- numbers grid
NUMBERS = [
 ("28", "dermatomes tested per side, C2 to S4–5, each at a defined key sensory point " + S("Rupp 2021")),
 ("112", "sensory points per side — 56 light touch plus 56 pin prick " + S("Rupp 2021")),
 ("0 / 1 / 2", "sensory scoring: absent, altered (including hyperaesthesia), normal " + S("Rupp 2021")),
 ("≤ 1 cm", "the skin a single cotton stroke may cross when testing light touch " + S("Rupp 2021")),
 ("the cheek", "the control every sensory point is compared against " + S("Rupp 2021")),
 ("grade 3", "the lowest key muscle grade that still defines the motor level " + S("Rupp 2021")),
 ("10", "key muscles per side, C5–T1 and L2–S1 " + S("Rupp 2021")),
 ("0 to 4+", "the NINDS myotatic reflex scale; 4+ includes intermittent clonus " + S("Morimoto 2024")),
 ("50.8%", "Babinski sensitivity for pyramidal tract dysfunction (95% CI 41.5–60.1) " + S("Morimoto 2024")),
 ("99%", "Babinski specificity (95% CI 97.7–100) — present settles it, absent settles nothing " + S("Morimoto 2024")),
 ("86.7%", "interrater agreement of the Modified Ashworth Scale, elbow flexors, 30 patients " + S("Bohannon 1987")),
 ("0.80–0.89", "MAS interrater ICC in 23 children with cerebral palsy " + S("Pušnik 2026")),
 ("κ = 0.69", "mean interrater reliability of the original 15-item stroke scale " + S("Brott 1989")),
 ("38% / 18%", "spatial neglect after right- versus left-hemisphere damage " + S("Salti 2026")),
 ("MDC₉₅ 7", "Berg Balance Scale change needed in acute stroke to exceed measurement error " + S("Moore 2018")),
 ("0.18 m/s", "10 metre Walk Test MDC in chronic stroke " + S("Moore 2018")),
 ("30", "maximum Functional Gait Assessment score; 10 items scored 0–3 " + S("Moore 2018")),
 ("no MCID", "for the Berg or the FGA — the CPG says none of its studies reported one " + S("Moore 2018")),
]

# ---------------------------------------------------------------- sections
# block kinds: ("table", [col2, col3], [(name, how, finding, imp), ...])
#              ("callout", lead, body)  ("note", text)
SECTIONS = []

SECTIONS.append(dict(id="subjective", nav="Interview", title="The interview, and what it has already told you",
  note="tempo before anything else",
  lede="""The neurologic interview is not a preamble to the examination — it is the part that
  narrows the differential most. Tempo, course and distribution together name the mechanism
  before a hand is laid on the patient, and the examination that follows is largely a test of
  that hypothesis. Read the last column as what the answer <i>buys</i> you, not as what to write
  down.""",
  blocks=[
  ("table", ["What to ask", "What the answer buys you"], [
   ("Time to maximum deficit",
    "“From the first thing you noticed, how long until it was at its worst?”",
    "<b>Seconds to minutes = vascular; hours to days = inflammatory or demyelinating; weeks to months = compressive or neoplastic; years = degenerative.</b> " + C() + " This single question separates the four mechanisms better than any part of the physical examination.",
    "maximum deficit|vascular|demyelinating|compressive"),
   ("Course since onset",
    "“Better, worse, the same, or comes and goes?”",
    "<b>Relapsing with recovery between = demyelinating; stepwise = repeated vascular events; steadily progressive = degenerative or compressive; improving from a maximal onset = a completed vascular event.</b> " + C(),
    "relapsing|stepwise|progressive|recovery"),
   ("Distribution, in the patient's words",
    "Ask them to draw or point to the border of the numbness or weakness rather than naming it.",
    "<b>A border that follows a dermatome is a root; one that follows a nerve territory is a peripheral nerve; a stocking-glove border is a length-dependent neuropathy; a whole-side border is central.</b> " + C() + " The pointed border is more reliable than the named body part, which patients use loosely.",
    "distribution|dermatome|stocking|border"),
   ("Positive versus negative symptoms",
    "“Is it that you cannot feel it, or that it feels wrong?”",
    "<b>Negative symptoms (loss) localize; positive symptoms (tingling, burning, jerking) tell you the pathway is irritable but not where.</b> " + C() + " A patient reporting only positive symptoms may have a normal examination, and that is a finding rather than a failure to examine.",
    "positive|negative|tingling|irritable"),
   ("Diurnal or activity pattern",
    "“Is there a time of day, or an activity, that reliably makes it worse?”",
    "<b>Worse with sustained activity and better with rest suggests a neuromuscular junction problem; worse with heat suggests demyelination; worse with a posture suggests compression.</b> " + C(),
    "fatigable|heat|posture|activity"),
   ("Goals, in their words",
    "“What can you not do now that you could do before?”",
    "<b>This list decides which outcome measures apply at all.</b> The core-set CPG conditions every one of its recommendations on the patient having goals <i>and the capacity to change</i> in that area " + S("Moore 2018") + " — so measures chosen before the goals are known may be measures that do not apply to this patient.",
    "goals|capacity|change|outcome"),
   ("Red flags",
    "New severe headache, fever with neck stiffness, bowel or bladder change, saddle anaesthesia, or a deficit still progressing now.",
    "<b>Any one of these ends the examination and starts a referral.</b> " + C() + " The dangerous one is the still-progressing deficit, because it looks like an examination opportunity and is actually a time-critical one.",
    "red flag|saddle|bladder|referral"),
  ]),
  ("callout", "The interview is where the examination is designed.",
   """A neurologic examination performed without a hypothesis is a long list of normal findings
   with one abnormality buried in it. Tempo and distribution tell you which parts of the
   examination are load-bearing today — a stocking-glove history makes the dermatomal map
   almost irrelevant and the distal reflexes central; a sudden hemibody history inverts that.
   Decide before you start which findings would change your mind."""),
  ]))

SECTIONS.append(dict(id="vitals", nav="Vitals", title="Vital signs, and the two that are emergencies",
  note="taken before anything upright",
  lede="""Two of the rows below are not measurements but stopping rules. In neurologic populations
  the vital signs are frequently the reason a session is modified or abandoned, and both of the
  emergencies here are missed the same way — by comparing the patient to a population norm
  instead of to their own baseline.""",
  blocks=[
  ("table", ["How it is taken", "The finding, and what it decides"], [
   ("Resting set",
    "Heart rate, blood pressure, respiratory rate and oxygen saturation, in the position the patient is already in.",
    "<b>Record the position with the number.</b> " + C() + " Supine, sitting and standing values are not interchangeable, and a post-activity value without a matching pre-activity value in the same position cannot be interpreted.",
    "resting|position|saturation|baseline"),
   ("Orthostatic challenge",
    "Supine 5 minutes, then repeat at 1 and 3 minutes after sitting and after standing, cuff at heart level.",
    "<b>A sustained postural fall with symptoms means upright work is unsafe today.</b> The 20 mmHg systolic / 10 mmHg diastolic consensus definition is published in a statement that is not freely readable " + S("Freeman 2011") + ", so the exact cut point is " + NOSRC + " here. Time the readings — a fall at 3 minutes that is absent at 1 minute is the commonest miss.",
    "orthostatic|supine|three minutes|cuff"),
   ("Autonomic dysreflexia",
    "In an SCI at or above T6: blood pressure against that patient's own baseline, plus headache, flushing and sweating above the level.",
    "<b>A rise above that person's baseline with a pounding headache is an emergency — sit them up, loosen everything, and find the noxious stimulus below the level.</b> " + C() + " Resting systolic pressure in tetraplegia is often low, so a reading inside the population normal range can already be a large rise for that patient. This is why the baseline, not the norm, is the comparator.",
    "dysreflexia|noxious|tetraplegia|baseline"),
   ("Exertional response",
    "Recheck heart rate, blood pressure and saturation at the same point in the same task each session.",
    "<b>A blunted or absent heart-rate rise is itself a finding</b> " + C() + " — above roughly the mid-thoracic level, sympathetic cardiac drive is interrupted, so the usual exertional tachycardia may not appear and heart rate stops being a useful measure of effort. Rate of perceived exertion and the ability to talk carry the load instead.",
    "exertional|blunted|tachycardia|effort"),
   ("Temperature regulation",
    "Ask about sweating above and below the lesion, and check the room temperature during long sessions.",
    "<b>Absent sweating below the lesion means the patient cannot dump heat normally</b> " + C() + " and can become hyperthermic in a warm gym without reporting discomfort in the usual way. Ask; do not wait for the complaint.",
    "sweating|hyperthermia|regulation|lesion"),
  ]),
  ("callout", "Both emergencies here are found by comparison, not by threshold.",
   """Orthostatic hypotension and autonomic dysreflexia are each defined as a <i>change</i> from
   that patient's own resting value. A patient whose usual systolic is 90 can be in dysreflexic
   crisis at 140, which no population threshold flags. Take a real baseline early, on a quiet
   day, and write it where the next clinician will find it."""),
  ]))

SECTIONS.append(dict(id="cognition", nav="Cognition", title="Arousal, attention and communication",
  note="everything below this depends on it",
  lede="""This section is a gate. A sensory examination recorded on an inattentive patient, or a
  motor command failed by an aphasic one, is not a finding — it is an artefact, and it will be
  read by the next clinician as a deficit. The purpose here is to establish how much of what
  follows can be believed, and to say so in the notes when the answer is 'not much'.""",
  blocks=[
  ("table", ["How it is tested", "The finding, and what it invalidates"], [
   ("Arousal",
    "Grade the least stimulus that produces a response: spontaneous, to voice, to touch, then to a noxious stimulus.",
    "<b>Record the stimulus and the response, not a label.</b> The Glasgow Coma Scale is the shared vocabulary " + S("Teasdale 1974") + " but its component scores and 3–15 total are " + NOSRC + " in freely readable form. “Opens eyes to voice, localizes to pressure, confused speech” survives any scale change and is what the next examiner can actually reproduce.",
    "arousal|noxious|localizes|stimulus"),
   ("Sustained attention",
    "Months of the year backwards, or serial sevens; note where it breaks down rather than pass/fail.",
    "<b>A patient who cannot hold this cannot give a reliable sensory or coordination examination.</b> " + C() + " Attention failure is the single commonest reason a neurologic examination is internally inconsistent, and it is testable in twenty seconds. Mark every downstream finding provisional when this fails.",
    "attention|months backwards|serial|provisional"),
   ("Orientation",
    "Person, place, time and situation, asked in that order.",
    "<b>Orientation can be fully intact while attention is not — so a correct answer here does not license the rest of the exam.</b> " + C() + " Situation (“why are you here?”) is the item most often omitted and the one most often failed after brain injury.",
    "orientation|situation|intact|license"),
   ("Standardized cognitive screen",
    "The screen your service uses, in a quiet room, glasses and hearing aids on, scored to its own manual.",
    "<b>Report the domain profile, not only the total.</b> The MoCA's cutoff of 26 and its education adjustment are " + NOSRC + " here — the original is not indexed in Europe PMC and only translated validations are freely readable (see sources.md). Two patients with the same total and different failed domains have different problems.",
    "screen|domain|profile|quiet"),
   ("Aphasia versus dysarthria",
    "One-step command with no gesture; name three objects; repeat a phrase; then ask the patient to write the answer.",
    "<b>The patient who writes the correct answer is dysarthric; the one who cannot is aphasic.</b> " + C() + " This distinction changes every instruction you give for the rest of the session, and it changes whether a failed motor command is a motor finding at all.",
    "aphasia|dysarthria|repetition|writing"),
   ("Insight and safety awareness",
    "Ask what they think they can do now, then compare with what you observed.",
    "<b>The gap between the two is the finding, and it predicts falls better than the motor exam does in some patients.</b> " + C() + " A patient who overestimates their transfer ability needs a different discharge plan from one with the same motor findings and accurate insight.",
    "insight|awareness|overestimate|discharge"),
  ]),
  ("callout", "Say in the notes what you could not test, and why.",
   """The honest record of a limited examination is more useful than a complete-looking one.
   “Light touch not formally tested — unable to sustain attention past two trials” tells the
   next clinician exactly what to repeat. “Sensation intact” on the same patient is worse than
   no entry at all, because it will be believed."""),
  ]))

SECTIONS.append(dict(id="cranial", nav="Cranial N.", title="The cranial nerves, and the discriminator in each",
  note="the order is a map of the brainstem",
  lede="""Almost nothing in this section has a measured accuracy figure — the cranial nerve
  examination is convention, and this guide says so on every row rather than dressing it up.
  What the section carries instead is the <i>discriminator</i>: for each nerve, the one
  observation that separates two lesions which produce a similar-looking deficit. That is what
  the examination is for, and it is what gets asked.""",
  blocks=[
  ("table", ["How it is tested", "The discriminator"], [
   ("I — olfactory",
    "One nostril at a time with a non-irritant odour, eyes closed.",
    "<b>Usually omitted, and its omission should be recorded rather than implied.</b> " + C() + " Bilateral loss is far more often nasal than neural; unilateral loss without nasal disease is the finding that matters.",
    "olfactory|nostril|irritant|unilateral"),
   ("II — optic",
    "Acuity each eye with correction; confrontation fields in four quadrants; swinging light test.",
    "<b>Where the field defect stops localizes it: monocular = prechiasmal, bitemporal = chiasmal, homonymous respecting the vertical midline = retrochiasmal and contralateral.</b> " + C() + " A relative afferent pupillary defect localizes to the optic nerve and is the only pupil sign that does.",
    "confrontation|bitemporal|homonymous|afferent"),
   ("III — oculomotor",
    "Pupil size and light response; lid position; adduction, elevation and depression.",
    "<b>A pupil-involving third nerve palsy is a compressive lesion until proven otherwise; a pupil-sparing one is more often microvascular.</b> " + C() + " The pupillary fibres run superficially, so compression reaches them first — which is why pupil size is checked before eye movement in a deteriorating patient.",
    "oculomotor|pupil|ptosis|compressive"),
   ("IV — trochlear",
    "Look for vertical diplopia worse on looking down and in; check for a compensatory head tilt.",
    "<b>The head tilt away from the affected side is the sign, and it is present at rest before any eye movement is tested.</b> " + C() + " This is the nerve most often missed, because the deficit is small and the patient has already compensated for it.",
    "trochlear|diplopia|head tilt|compensatory"),
   ("V — trigeminal",
    "Light touch in V1, V2 and V3 both sides; masseter and temporalis on clench; corneal reflex if indicated.",
    "<b>A border that follows a trigeminal division is trigeminal; one that stops at the jawline is not.</b> " + C() + " The face is also the reference for the whole sensory examination — normal is defined as feeling the same as on the cheek " + S("Rupp 2021") + " — so an abnormal face costs you your control.",
    "trigeminal|division|masseter|corneal"),
   ("VI — abducens",
    "Abduction of each eye; horizontal diplopia worse on looking to the affected side.",
    "<b>An isolated sixth nerve palsy localizes poorly, because the nerve has the longest intracranial course</b> " + C() + " — it is often a false localizing sign of raised intracranial pressure rather than a pointer to the sixth nucleus.",
    "abducens|abduction|diplopia|localizing"),
   ("VII — facial",
    "Raise the brows, squeeze the eyes shut, show the teeth; compare halves at each.",
    "<b>Forehead spared = upper motor neuron; forehead weak = lower motor neuron.</b> " + C() + " The upper face has bilateral cortical input, so a hemispheric lesion spares it. Testing only the smile cannot make this distinction, which is the most consequential one on this table.",
    "forehead|sparing|hemispheric|bilateral"),
   ("VIII — vestibulocochlear",
    "Finger rub beside each ear; then look for nystagmus with and without visual fixation.",
    "<b>Nystagmus suppressed by fixation is peripheral; nystagmus unsuppressed, or direction-changing with gaze, is central.</b> " + C() + " In the unconscious patient the same system is probed by the oculocephalic reflex — passive head-on-body rotation in the horizontal or vertical plane " + S("Tarnutzer 2026") + ".",
    "nystagmus|fixation|direction changing|oculocephalic"),
   ("IX and X — glossopharyngeal, vagus",
    "Palate elevation on “ah”; voice quality; a sip of water with a hand on the larynx if swallowing is in question.",
    "<b>The uvula deviates <i>away</i> from the weak side, and a wet or gurgly voice after a sip is an aspiration flag that suspends oral intake.</b> " + C() + " This is the one cranial nerve row with an immediate safety action attached, which is why it is not left to the end.",
    "palate|uvula|aspiration|wet voice"),
   ("XI — accessory",
    "Resisted head rotation and resisted shoulder shrug, compared side to side.",
    "<b>Sternocleidomastoid turns the head to the opposite side, so a weak right SCM shows as weak rotation to the left.</b> " + C() + " Students invert this pairing more reliably than any other on the cranial nerve exam.",
    "accessory|rotation|shrug|opposite"),
   ("XII — hypoglossal",
    "Tongue protrusion, then push into each cheek against your finger.",
    "<b>The tongue deviates <i>toward</i> the weak side, pushed across by the intact genioglossus.</b> " + C() + " Fasciculations with atrophy point to a lower motor neuron lesion; deviation without either, in the presence of hemiparesis, is upper motor neuron.",
    "hypoglossal|protrusion|genioglossus|fasciculation"),
  ]),
  ("callout", "Two directions, and the mnemonic that keeps them apart.",
   """The tongue points <b>at</b> the lesion; the uvula points <b>away</b> from it. Both follow
   from the same mechanic — the intact muscle wins — but they look opposite because one is a
   pusher and the other a lifter. Reason it out once from the anatomy and you will not need
   to remember which is which."""),
  ]))

SECTIONS.append(dict(id="sensory", nav="Sensation", title="The four modalities, and the two pathways they split across",
  note="the best-sourced section here",
  lede="""This is the one part of the neurologic examination with a standardized, scored,
  freely readable method behind it — the international standards for classifying spinal cord
  injury define exactly how light touch and sharp/dull are performed and scored (Rupp 2021).
  Borrow the scoring discipline even when the patient does not have a cord injury: a modality,
  a point, a 0/1/2 and a control beats “sensation grossly intact” in every setting.""",
  blocks=[
  ("table", ["How it is performed", "The finding, scored"], [
   ("Light touch",
    "Cotton stroked <b>once</b> across an area not exceeding 1 cm of skin, at the key sensory point of each dermatome, with the eyes closed or vision blocked.",
    "<b>0 = absent, 1 = altered (impaired or partial appreciation, including hyperaesthesia), 2 = normal or intact — normal meaning it feels as it does on the cheek</b> " + S("Rupp 2021") + ". 28 dermatomes C2–S4–5 per side; maximum 56 per side. Points that cannot be tested are recorded <b>NT</b> rather than guessed " + S("Rupp 2021") + ".",
    "cotton|single stroke|hyperaesthesia|key sensory"),
   ("Sharp/dull discrimination",
    "A safety pin stretched apart: the <b>pointed end for sharp, the rounded end for dull</b>, asking the patient to say which — not to rate how sharp.",
    "<b>Same 0/1/2 scoring, maximum 56 per side, 112 per side across both modalities</b> " + S("Rupp 2021") + ". <b>Inability to distinguish sharp from dull scores 0 even if touch is felt</b>, because pressure alone is not spinothalamic function. Asking “is this sharp?” without the dull comparator is the standard way this test is faked normal.",
    "safety pin|rounded end|discriminate|spinothalamic"),
   ("Vibration",
    "A struck tuning fork on a distal bony prominence first, moving proximally until it is felt; compare sides and record the most distal level at which it is present.",
    "<b>The finding is the level, and whether that level matches the pin-prick level.</b> A vibration level that disagrees with the pin level separates a dorsal-column from a spinothalamic lesion — they are different tracts and they can be damaged separately. The 128 Hz frequency is " + NOSRC + ". Note that vibration is scored nowhere in ISNCSCI: its required modalities are light touch and pin prick, and the only sensory functions it lists as optional are joint movement appreciation with position sense, and deep pressure or deep pain " + S("Rupp 2021") + ".",
    "tuning fork|bony prominence|distal|dorsal column"),
   ("Proprioception",
    "Hold the digit <b>at the sides</b>, demonstrate up and down with vision, then move a few degrees with vision blocked and ask the direction.",
    "<b>Holding the digit top and bottom lets the patient answer from the pressure change and is the commonest false negative on the sensory exam.</b> " + C() + " ISNCSCI treats joint movement appreciation and position sense as <i>optional</i>, with no place on the worksheet except the comments — but it does grade them, on the same absent / impaired / normal scale, where <b>0 means the patient cannot correctly report joint movement on large movements of the joint</b> " + S("Rupp 2021") + ". Use that scale rather than inventing one.",
    "joint position|sides|excursion|error rate"),
   ("Stereognosis and graphaesthesia",
    "Only once light touch and pin prick are intact: identify a familiar object in the hand, and a number traced on the palm.",
    "<b>Failure with intact primary sensation is a parietal finding.</b> " + C() + " Performed on a hand with impaired light touch it tests nothing, which is why it sits below the primary modalities rather than beside them.",
    "stereognosis|graphaesthesia|parietal|primary"),
   ("Double simultaneous stimulation",
    "Touch both sides at once after establishing each is felt alone.",
    "<b>Extinction — feeling only one side when both are touched, having felt each alone — is a parietal or attentional finding and links directly to the neglect examination.</b> " + C(),
    "extinction|simultaneous|attentional|parietal"),
   ("Sensory level",
    "Work from the area of loss toward normal skin, in both modalities, and mark where each becomes normal.",
    "<b>The sensory level is the most caudal dermatome with normal function for <i>both</i> pin prick and light touch</b> " + S("Rupp 2021") + ". A level in one modality only is not a sensory level — it is a tract finding, and it is more informative than a level, because it names which tract.",
    "sensory level|caudal|both modalities|tract"),
  ]),
  ("callout", "Why sensation comes before motor.",
   """A patient with dense proprioceptive loss will fail heel-to-shin, look unsteady in
   standing, and move a limb clumsily — all of which read as cerebellar or as weakness if the
   sensory examination has not been done yet. Testing sensation first means the coordination
   and balance findings arrive already interpretable. Doing it the other way round produces a
   confident cerebellar impression that the sensory exam then contradicts."""),
  ("callout-warn", "Two ways to record a normal sensory exam, only one of which is true.",
   """“Sensation grossly intact” records that you did not test formally. If that is what
   happened, write that. If you did test, write the modality, the points, the score and the
   control — “light touch 2 at all C5–T1 key points bilaterally, cheek as control.” The first
   is not a shorter version of the second; it is a different claim."""),
  ]))

SECTIONS.append(dict(id="tone", nav="Tone", title="Tone, reflexes, and the upper-versus-lower motor neuron decision",
  note="speed is the variable",
  lede="""Every row here turns on one manipulation: change the speed, and see whether the
  resistance changes with it. That single contrast separates spasticity from rigidity and from
  contracture, and it is the reason tone is tested twice — once slowly and once fast — rather
  than once.""",
  blocks=[
  ("table", ["How it is performed", "The finding"], [
   ("Tone at rest",
    "Limb fully supported, patient not assisting, joint moved slowly through range.",
    "<b>Slow movement removes the velocity that provokes spasticity, so what remains is the resting state.</b> " + C() + " Normal resting tone does not exclude spasticity — a limb can be entirely normal slowly and catch hard at speed.",
    "resting|supported|slow|velocity"),
   ("Velocity-dependent resistance",
    "The same movement performed fast; note the resistance and where in range it appears.",
    "<b>Resistance only at speed = spasticity; the same at every speed = rigidity or contracture.</b> " + C() + " A catch that appears at the same point in range regardless of speed, and does not release, is more likely to be a contracture — and a contracture will not respond to anything aimed at tone.",
    "catch|velocity dependent|rigidity|contracture"),
   ("Modified Ashworth grading",
    "Grade the resistance felt through a single fast passive movement.",
    "<b>Interrater agreement 86.7%, Kendall's tau 0.847 — in elbow flexors only, in 30 patients with intracranial lesions, which is the whole of its origin study</b> " + S("Bohannon 1987") + ". In 23 children with cerebral palsy, intrarater ICC 0.91–0.99 and interrater 0.80–0.89, with the authors warning against individual-level interpretation " + S("Pušnik 2026") + ". <b>Agreement between raters is not evidence the scale measures spasticity rather than passive stiffness.</b>",
    "Ashworth|interrater|Kendall|stiffness"),
   ("Deep tendon reflexes",
    "Limb relaxed, tendon slightly stretched, compared side to side; reinforce if absent.",
    "<b>0 absent; 1+ small, less than normal, including a trace or a response only with reinforcement; 2+ brisk, within the median normal range; 3+ enhanced, high normal or hyperreflexia; 4+ enhanced, more than normal, including intermittent clonus</b> " + S("Morimoto 2024") + ". <b>Asymmetry outweighs the absolute grade</b> " + C() + " — a symmetric 3+ may be that person's normal.",
    "NINDS|reinforcement|hyperreflexia|asymmetry"),
   ("Clonus",
    "Brisk ankle dorsiflexion, held.",
    "<b>Sustained clonus is an upper motor neuron sign; a few unsustained beats can occur without pathology.</b> " + C() + " Count and record the beats rather than writing “clonus present”, since sustained and unsustained carry different weight.",
    "clonus|dorsiflexion|sustained|beats"),
   ("Plantar response",
    "Stroke the lateral sole from heel to forefoot, then across the metatarsal heads, with a blunt point.",
    "<b>Specificity 99% (95% CI 97.7–100) but sensitivity 50.8% (95% CI 41.5–60.1) for pyramidal tract dysfunction</b> " + S("Morimoto 2024") + ". <b>An upgoing toe settles the question; a downgoing toe settles nothing</b> — a sensitivity of 50.8% means about half the patients with pyramidal dysfunction have a normal plantar response. <b>That inference is this guide's, drawn from the figure.</b> The source's own sentence on the consequence reads &ldquo;the absence of the Babinski sign does not always indicate pyramidal tract dysfunction&rdquo; " + S("Morimoto 2024") + ", which is not what a low sensitivity implies and is best read as a slip in its wording. Intra-observer reliability 0.467–0.571, so record the movement, not the interpretation.",
    "plantar|upgoing|pyramidal|specificity"),
   ("Putting it together",
    "Combine tone, reflexes, plantar response, atrophy and fasciculation.",
    "<b>Increased tone + hyperreflexia + upgoing toe, without atrophy = upper motor neuron. Decreased tone + hyporeflexia + atrophy + fasciculation = lower motor neuron.</b> " + C() + " A mixed picture is a real finding — it points at two lesions, or at a disorder that affects both, rather than at a testing error.",
    "upper motor|lower motor|atrophy|fasciculation"),
  ]),
  ("callout-warn", "Spinal shock inverts the whole table.",
   """In the days to weeks after an acute cord injury, an upper motor neuron lesion presents
   with <i>flaccidity and absent reflexes</i> — the lower motor neuron picture. A tone
   examination performed in that window and read at face value gives exactly the wrong level.
   Date every tone finding, and re-examine."""),
  ]))

SECTIONS.append(dict(id="motor", nav="Motor control", title="Patterned versus selective movement, and what strength means here",
  note="grade the joint, not the limb",
  lede="""A manual muscle test asks how much force a muscle can produce. After an upper motor
  neuron lesion that is often the wrong question: the limb may produce plenty of force and be
  unable to produce it in isolation. This section is about the second question — what the
  patient can move on its own — and about when a strength grade is worth recording at all.""",
  blocks=[
  ("table", ["How it is performed", "The finding"], [
   ("Patterned movement",
    "Ask for one joint's movement and watch the neighbouring joints.",
    "<b>The finding is which joints are dragged along.</b> " + C() + " Obligatory coupling — shoulder abduction pulling elbow flexion, hip flexion pulling knee flexion and dorsiflexion — is patterned movement, and it means the observed “movement” at any one joint is not under separate control. The classical named stages describing this progression are " + NOSRC + " in freely readable form.",
    "patterned|obligatory|coupling|abduction"),
   ("Selective movement",
    "Stabilize the proximal segment so it cannot substitute, then ask for the isolated movement.",
    "<b>Selective control is present when the joint moves alone through some arc; record the arc.</b> " + C() + " Stabilizing proximally is not a refinement — without it, trunk and pelvic substitution reproduce the movement and the test reads normal.",
    "selective|stabilize|substitution|arc"),
   ("Grading it per joint",
    "Repeat at each joint of the limb rather than forming an impression of the whole limb.",
    "<b>Selective control is not uniform down a limb</b> " + C() + " — full selective hip control with none at the ankle is common and has entirely different implications from the reverse. Published ordinal instruments exist but are validated in children with cerebral palsy rather than adults (see sources.md), so an adult ordinal grade here is " + NOSRC + ".",
    "per joint|uniform|ordinal|ankle"),
   ("Upper motor control test",
    "Move the limb passively through range, then ask for the same movement actively; note where control is lost.",
    "<b>The finding is the arc over which control holds, and the comparison between the passive and active arcs.</b> " + C() + " Equal arcs mean the limitation is control-independent; a shorter active arc means the deficit is neural rather than a range problem. Control is typically lost approaching the position that demands the most selective activation.",
    "passive arc|active arc|control|neural"),
   ("Manual muscle testing",
    "Key muscles against gravity, then against resistance, in a muscle-specific position with the joint supported.",
    "<b>0 total paralysis; 1 palpable or visible contraction; 2 full ROM gravity eliminated; 3 full ROM against gravity; 4 full ROM against moderate resistance; 5 full ROM against full resistance, as expected from an otherwise unimpaired person</b> " + S("Rupp 2021") + ". Ten key muscles per side, C5–T1 and L2–S1 " + S("Rupp 2021") + ".",
    "manual muscle|gravity eliminated|key muscle|resistance"),
   ("When a grade is not interpretable",
    "Before recording a grade, ask whether tone or synergy produced the movement.",
    "<b>Through significant spasticity the resistance you feel is tone, and through patterned movement the movement you grade is the synergy.</b> " + C() + " Record “not interpretable — movement occurs only in flexor pattern” rather than a number. A wrong grade is used by everyone downstream; an honest omission is not.",
    "interpretable|synergy|tone|omission"),
   ("Motor level",
    "Find the lowest key muscle with a grade of at least 3, with the segment above it normal.",
    "<b>The motor level is defined by the lowest key muscle function graded at least 3 on manual testing in the supine position</b> " + S("Rupp 2021") + ". The grade-3 threshold is the convention that makes levels comparable between examiners; a level quoted from a grade-2 muscle is not the same measurement.",
    "motor level|grade three|supine|comparable"),
  ]),
  ("callout", "The order inside this section is deliberate.",
   """Selective control is tested before strength, because the answer decides whether the
   strength test means anything. A limb that moves only in synergy cannot be meaningfully
   graded muscle by muscle, and grading it anyway produces a table of numbers that will be
   treated as real by the next reader."""),
  ]))

SECTIONS.append(dict(id="coordination", nav="Coordination", title="Coordination, and the one manipulation that makes it interpretable",
  note="test it twice — with and without vision",
  lede="""Nothing in this section has a published norm; the whole battery is convention. What
  makes it worth performing is a single contrast that costs nothing: run each test with vision
  and again without it. Vision substitutes for proprioception, so the difference between the
  two attempts separates a sensory ataxia from a cerebellar one — which the tests alone cannot
  do.""",
  blocks=[
  ("table", ["How it is performed", "The finding"], [
   ("Finger-to-nose",
    "Patient's finger from their nose to your finger and back, your finger moved between repetitions; then repeated with eyes closed.",
    "<b>Roughly equal inaccuracy with and without vision = cerebellar; markedly worse without vision = sensory.</b> " + C() + " Moving your target between repetitions is the part that makes it a test — a stationary target can be reached by a memorized trajectory. Norms for accuracy are " + NOSRC + ".",
    "finger to nose|moving target|dysmetria|vision"),
   ("Heel-to-shin",
    "Heel placed on the opposite knee and run down the shin, then repeated with eyes closed.",
    "<b>The finding is whether the heel wanders off the line and whether closing the eyes makes it worse.</b> " + C() + " Weakness produces a heel that falls off the shin from lack of control against gravity; ataxia produces one that oscillates across it. Watch which.",
    "heel to shin|wander|oscillate|weakness"),
   ("Rapid alternating movements",
    "Rapid forearm pronation and supination on the thigh, or finger tapping, compared side to side.",
    "<b>Breakdown of rhythm and amplitude on one side is the finding; absolute speed is not, because it varies with age, hand dominance and effort.</b> " + C() + " Normative speeds are " + NOSRC + ".",
    "alternating|rhythm|amplitude|dominance"),
   ("Rebound",
    "Resist elbow flexion, then release suddenly with a guard across the patient's chest.",
    "<b>A limb that does not check its own movement on release is a cerebellar finding.</b> " + C() + " Guard first — this is the coordination test most likely to result in the patient striking themselves.",
    "rebound|check|release|guard"),
   ("Romberg",
    "Feet together, arms at sides, 30 seconds eyes open, then eyes closed, with a guard.",
    "<b>Positive only if steady with eyes open and unsteady with them closed.</b> " + C() + " That pattern isolates proprioception, because vision had been compensating. A patient already unsteady with eyes open has a cerebellar or vestibular problem and has not performed a Romberg at all. Accuracy figures for the test are " + NOSRC + ".",
    "Romberg|feet together|eyes closed|compensating"),
   ("Standing and walking balance, measured",
    "Where a number is wanted, use the core set rather than an ad hoc test.",
    "<b>Berg Balance Scale for static and dynamic sitting and standing balance — strong recommendation on level I evidence; Functional Gait Assessment for balance while walking</b> " + S("Moore 2018") + ". These carry published change values; the bedside battery above does not.",
    "Berg|Functional Gait|level one|change"),
  ]),
  ("callout", "A dense proprioceptive loss will fail every test above.",
   """That is why this section sits after sensation rather than before it. If joint position
   sense is impaired, the coordination battery measures the sensory loss and says nothing about
   the cerebellum — and the eyes-closed contrast will be dramatic for a reason that has no
   cerebellar content at all."""),
  ]))

SECTIONS.append(dict(id="perception", nav="Perception", title="Fields, neglect and praxis — three ways to fail a task without a motor deficit",
  note="a field cut and a neglect are not the same lesion",
  lede="""Every row here describes a patient who cannot do something and whose motor system is
  intact. They are grouped because they share a failure mode in the notes: each gets recorded
  as “unable”, and “unable” routes to the wrong treatment for all three.""",
  blocks=[
  ("table", ["How it is tested", "The finding"], [
   ("Visual field defect",
    "Confrontation in four quadrants of each eye, one eye at a time.",
    "<b>A homonymous defect respecting the vertical midline is retrochiasmal and contralateral to the lesion.</b> " + C() + " The patient with a field cut usually <i>knows</i> and turns the head to compensate — which is the behavioural difference from neglect.",
    "confrontation|homonymous|midline|compensate"),
   ("Unilateral spatial neglect",
    "Cancellation or line bisection on paper, plus observation of how they scan a tray, a room and their own body.",
    "<b>Found in 38% of people with right-hemisphere damage and 18% with left-hemisphere damage, with figures varying by lesion site, time since onset and assessment method</b> " + S("Salti 2026") + ". The patient does not compensate, because they do not experience anything as missing.",
    "neglect|cancellation|bisection|scan"),
   ("Neglect versus hemianopia",
    "Ask the patient to find an object placed on the affected side, and watch whether they search for it.",
    "<b>Searching and finding = field cut; not searching = neglect.</b> " + C() + " The two frequently coexist, and their co-occurrence worsens functional impact " + S("Salti 2026") + ", so finding one does not end the examination for the other.",
    "search|coexist|functional|impact"),
   ("Paper versus daily-life testing",
    "Use both a pencil-and-paper task and an observation of real activity.",
    "<b>They disagree often enough that both are needed.</b> The Behavioural Inattention Test pairs six conventional paper-and-pencil tasks with nine behavioural ones, and the Catherine Bergego Scale rates neglect during everyday activities rather than on paper " + S("Salti 2026") + ". A normal cancellation sheet does not clear a patient who eats half a plate.",
    "Behavioural Inattention|Bergego|everyday|plate"),
   ("Personal versus peripersonal versus extrapersonal",
    "Test grooming and dressing, a tabletop task, and a task at a distance across the room.",
    "<b>Neglect can be confined to one spatial domain, and the domain that is spared is not evidence the others are.</b> " + C() + " Testing on a tabletop only can miss a neglect that appears at conversational distance " + S("Salti 2026") + ".",
    "personal|peripersonal|extrapersonal|domain"),
   ("Praxis",
    "Ask for a familiar action to command, then with the real object in hand.",
    "<b>Correct with the object and incorrect to command is apraxia — a failure of the plan, not the muscles.</b> " + C() + " An apraxic patient who is treated as weak will be given strengthening for a problem strength cannot reach.",
    "apraxia|to command|object|plan"),
  ]),
  ("callout-warn", "“Unable to follow instruction” is not a finding.",
   """It is a placeholder that hides at least four different lesions: aphasia, neglect, apraxia
   and inattention. Each has a different treatment and a different prognosis. Whenever that
   phrase is about to go into a note, replace it with which of the four you ruled out and how."""),
  ]))

SECTIONS.append(dict(id="function", nav="Function", title="Task analysis, and the measures that carry published change values",
  note="the phase, then the number",
  lede="""The impairment examination tells you what is wrong; the task tells you what it costs.
  Run the task first where you can — what breaks down in it decides which impairment measures
  are worth taking. Then attach a number that someone else can compare against at discharge,
  and take it from the core set rather than inventing one.""",
  blocks=[
  ("table", ["How it is done", "The finding, or the published value"], [
   ("Whole-task observation",
    "Watch the task once at the patient's own pace, without cueing, before analysing anything.",
    "<b>Name the phase in which it breaks down.</b> " + C() + " “Loss of control in mid-stance on the left” is actionable; “poor gait” is not. Cueing on the first repetition destroys the observation you came for.",
    "whole task|own pace|phase|cueing"),
   ("Sitting and standing balance",
    "Berg Balance Scale, administered to its protocol at admission and discharge.",
    "<b>Strong recommendation, level I evidence</b> " + S("Moore 2018") + ". Interrater ICC 0.95 and weighted κ 0.92 in acute stroke; test-retest ICC 0.92; ICC 0.953 in chronic SCI " + S("Moore 2018") + ".",
    "Berg Balance|admission|interrater|protocol"),
   ("Berg — what counts as change",
    "Compare against the measurement error for that population, not against any change at all.",
    "<b>MDC₉₅ of 7 in acute stroke; 4.66 to 6.7 points in chronic stroke; 5 in Parkinson disease; 1 in premanifest Huntington disease rising to 4–5 in later stages</b> " + S("Moore 2018") + ". <b>No MCID exists for the Berg</b> — the CPG states that none of its five level I studies reporting SEM or MDC also reported one " + S("Moore 2018") + ".",
    "MDC|measurement error|premanifest|change"),
   ("Berg — where it stops working",
    "Check where the patient sits in the range before choosing it again.",
    "<b>Ceiling effects rise with time after stroke — 4.9% at 14 days, 11.8% at 30 days, 21.5% at 90 days, 28.8% at 180 days; floor effects fall the other way, 35% at 14 days to 5% at 180 days</b> " + S("Moore 2018") + ". A measure at its ceiling cannot show the improvement you are working for.",
    "ceiling|floor|180 days|range"),
   ("Balance while walking",
    "Functional Gait Assessment, 10 items scored 0 to 3, maximum 30, under 20 minutes.",
    "<b>Strong for acute and chronic stable conditions, moderate for chronic progressive</b> " + S("Moore 2018") + ". A score near 30 of 30 means switch to something harder; a patient unable to walk is documented as 0 rather than omitted " + S("Moore 2018") + ". No MCID has been reported " + S("Moore 2018") + ".",
    "Functional Gait|thirty|documented zero|progressive"),
   ("Balance confidence",
    "Activities-specific Balance Confidence Scale — self-reported, not observed.",
    "<b>It measures confidence, which can move independently of measured balance</b> " + S("Moore 2018") + ". A patient whose Berg improves and whose ABC does not has a different problem from one where both move.",
    "confidence|self report|independent|Berg"),
   ("Walking speed",
    "10 metre Walk Test, same protocol each time.",
    "<b>MDC 0.18 m/s in chronic stroke; 0.18 m/s comfortable and 0.25 m/s fast in Parkinson disease; 0.20 to 0.46 m/s across stages of Huntington disease</b> " + S("Moore 2018") + ". The household / limited-community / community speed bands everyone quotes are " + NOSRC + " here.",
    "ten metre|walk test|comfortable|fast"),
   ("Walking distance",
    "6-Minute Walk Test, for patients with distance goals and capacity to change.",
    "<b>Recommended for walking distance</b> " + S("Moore 2018") + ". Distance and speed answer different questions — a patient can walk faster and no further, and the goals decide which one you are treating.",
    "six minute|distance|capacity|goals"),
   ("Transfers",
    "Document the transfer rather than score it.",
    "<b>Documentation should include the type of transfer, level of required assistance, equipment or context adaptations, and time to complete</b> " + S("Moore 2018") + ". The 5 Times Sit-to-Stand <i>may</i> be used for sit-to-stand goals — permissive language in the CPG, not the “should use” attached to the balance and gait measures " + S("Moore 2018") + ".",
    "transfer|assistance|adaptations|sit to stand"),
   ("Goals, documented",
    "Record the patient's stated goals in their words, and revisit them.",
    "<b>Documenting patient goals is its own action statement, and the whole core set is conditioned on goals plus capacity to change</b> " + S("Moore 2018") + ". “Sixty-eight percent of consumers surveyed” named balance an important goal and a primary reason for seeking physical therapy " + S("Moore 2018") + ".",
    "goals|documented|consumers|capacity"),
  ]),
  ("callout", "Measure at admission, or the discharge number means nothing.",
   """The CPG's recommendation is not “use these measures” but use them under the same test
   conditions at admission and discharge, and where feasible in between, passing the results to
   the next level of care """ + S("Moore 2018") + """. A discharge score with no
   admission comparator documents a level of function, which is not what anyone needed."""),
  ]))

SECTIONS.append(dict(id="localize", nav="Localize", title="Findings to level — the table the whole examination was for",
  note="one lesion should explain the list",
  lede="""Every phase above produced findings. This is where they resolve into a level. Read it
  as a decision table: the first column is what you found, the second is the qualifier that
  makes it discriminating, and the last is where the lesion is. Where two levels remain
  possible, the qualifier column names the test that separates them.""",
  blocks=[
  ("table", ["The qualifier that discriminates", "Where the lesion is"], [
   ("Weakness with increased tone, hyperreflexia, upgoing toe",
    "No atrophy, no fasciculation; distribution is a whole limb or a whole side rather than a nerve or a root.",
    "<b>Upper motor neuron — cortex, internal capsule, brainstem or cord.</b> " + C() + " The upgoing toe carries 99% specificity for pyramidal dysfunction " + S("Morimoto 2024") + ", so its presence is close to decisive; its absence is not, at 50.8% sensitivity " + S("Morimoto 2024") + ".",
    "upper motor|hyperreflexia|upgoing|capsule"),
   ("Weakness with decreased tone, hyporeflexia, atrophy",
    "Fasciculations present; distribution follows a root, a plexus or a named nerve.",
    "<b>Lower motor neuron — anterior horn, root, plexus or peripheral nerve.</b> " + C() + " Which of the four is decided by the distribution, not by the tone.",
    "lower motor|atrophy|fasciculation|plexus"),
   ("Face and body weak on the same side",
    "Lower face only, forehead spared.",
    "<b>Contralateral hemisphere, above the facial nucleus.</b> " + C() + " Forehead sparing is the discriminator; testing only the smile cannot produce it.",
    "hemisphere|forehead|contralateral|nucleus"),
   ("Face weak on one side, body on the other",
    "Crossed findings, with any cranial nerve palsy on the face side.",
    "<b>Brainstem, at the level of that cranial nerve nucleus.</b> " + C() + " Crossed signs are the most specific localization the bedside examination produces, because the tracts have crossed and the nerve has not.",
    "crossed|brainstem|nucleus|specific"),
   ("A sensory level on the trunk",
    "Both pin prick and light touch become normal at the same dermatome, with weakness below it.",
    "<b>Spinal cord, at or above that level.</b> The sensory level is the most caudal dermatome normal for <i>both</i> modalities " + S("Rupp 2021") + ". A level in one modality only is a tract finding, not a level.",
    "sensory level|dermatome|cord|caudal"),
   ("Vibration and position lost, pin preserved",
    "Loss follows the dorsal columns; Romberg positive with a steady eyes-open stance.",
    "<b>Dorsal column — posterior cord, or a large-fibre neuropathy.</b> " + C() + " The dissociation between modalities is the finding; either modality alone would be uninformative.",
    "dorsal column|vibration|dissociation|Romberg"),
   ("Pin and temperature lost, vibration preserved",
    "Loss is contralateral to the weakness, or in a cape distribution.",
    "<b>Spinothalamic tract — anterolateral cord.</b> " + C() + " Contralateral pin loss with ipsilateral weakness and dorsal column loss is a hemicord picture.",
    "spinothalamic|anterolateral|cape|hemicord"),
   ("Stocking-glove sensory loss",
    "Symmetric, distal, longest nerves first, with reduced or absent ankle reflexes.",
    "<b>Length-dependent peripheral neuropathy.</b> " + C() + " No level will be found on the trunk, and looking for one wastes the examination.",
    "stocking glove|length dependent|symmetric|ankle"),
   ("Dysmetria equally bad with eyes open and closed",
    "Steady in stance with eyes open; no proprioceptive loss on testing.",
    "<b>Cerebellum, ipsilateral to the limb.</b> " + C() + " The eyes-open/eyes-closed contrast is what separates this from sensory ataxia, and it costs one extra repetition.",
    "cerebellum|ipsilateral|dysmetria|ataxia"),
   ("Clumsiness that worsens sharply with eyes closed",
    "Joint position sense impaired on formal testing; Romberg positive.",
    "<b>Sensory ataxia — dorsal column or large-fibre peripheral.</b> " + C() + " Not cerebellar, and treating it as cerebellar misses that vision is the compensation being relied on.",
    "sensory ataxia|position sense|worsens|compensation"),
   ("Inattention to one side that the eyes can see",
    "The patient does not search; paper and daily-life tasks both affected.",
    "<b>Contralateral hemisphere, most often right parietal.</b> Present in 38% of right-hemisphere and 18% of left-hemisphere damage " + S("Salti 2026") + ". Distinguish from hemianopia by whether the patient searches " + C() + ".",
    "inattention|parietal|search|hemianopia"),
   ("Fatigable weakness with normal sensation and reflexes",
    "Worse with sustained or repeated effort, better with rest; often ocular or bulbar first.",
    "<b>Neuromuscular junction.</b> " + C() + " The examination is normal at the start and abnormal at the end, so a single-repetition test will miss it entirely.",
    "fatigable|junction|repeated|ocular"),
  ]),
  ("callout-warn", "A finding that does not fit is information, not noise.",
   """The temptation at this table is to pick the level that explains most of the list and let
   the rest go. A finding that does not fit means one of three things — a second lesion, a
   pre-existing deficit, or a testing error — and each has a different next step. Name which
   one you think it is in the note, so the next examiner can check it."""),
  ("callout", "Spinal shock, again.",
   """In the first days to weeks after an acute cord injury the upper motor neuron rows of this
   table read as lower motor neuron ones — flaccid, areflexic, no upgoing toe. Localize with the
   date of injury in front of you."""),
  ]))

# ---------------------------------------------------------------- drill
DRILL = [
 ("What single question in the interview separates a vascular from a demyelinating mechanism?",
  "Time to maximum deficit. Seconds to minutes is vascular; hours to days is inflammatory or demyelinating; weeks to months is compressive; years is degenerative. " + C(),
  "tempo|maximum deficit|vascular|demyelinating"),
 ("Light touch is scored 0, 1 or 2. What does each mean, and what is the control?",
  "0 = absent; 1 = altered, including hyperaesthesia; 2 = normal or intact — normal meaning it feels the same as on the cheek. The cheek is the control " + S("Rupp 2021") + ". Points that cannot be tested are NT.",
  "scoring|altered|cheek|control"),
 ("How many sensory points are there per side, and how do they divide?",
  "112 per side — 56 light touch and 56 pin prick, across 28 dermatomes from C2 to S4–5 " + S("Rupp 2021") + ".",
  "points|dermatome|fifty six|divide"),
 ("Why must sharp/dull be asked as “sharp or dull?” rather than “is this sharp?”",
  "Without the dull comparator, a patient who feels only pressure scores as intact. Inability to distinguish the two scores 0 even when touch is felt " + S("Rupp 2021") + ".",
  "comparator|pressure|distinguish|intact"),
 ("A Babinski sign is absent. What have you ruled out?",
  "Almost nothing. Sensitivity is 50.8% (95% CI 41.5–60.1) against a specificity of 99% (95% CI 97.7–100) " + S("Morimoto 2024") + " — its presence is close to decisive, its absence is not.",
  "Babinski|sensitivity|specificity|absent"),
 ("Give the NINDS reflex scale from 0 to 4+.",
  "0 absent; 1+ small, less than normal, including a trace or a response only with reinforcement; 2+ brisk, within the median normal range; 3+ enhanced, high normal or hyperreflexia; 4+ enhanced with intermittent clonus " + S("Morimoto 2024") + ".",
  "NINDS|reinforcement|median normal|clonus"),
 ("What did the original Modified Ashworth paper actually test?",
  "Elbow flexors, in 30 patients with intracranial lesions, by two raters: 86.7% agreement and Kendall's tau 0.847 " + S("Bohannon 1987") + ". Nothing about other joints, other populations, or whether the scale measures spasticity rather than passive stiffness.",
  "Ashworth|elbow|thirty|Kendall"),
 ("How do you tell spasticity from rigidity at the bedside?",
  "Change the speed. Resistance that appears only with fast movement is spasticity; resistance that is the same at every speed is rigidity or contracture " + C() + ".",
  "speed|spasticity|rigidity|contracture"),
 ("Forehead spared on a weak face — what does that tell you?",
  "Upper motor neuron: the upper face has bilateral cortical supply, so a hemispheric lesion weakens the lower face only " + C() + ". Forehead involvement means the lesion is at or below the facial nucleus.",
  "forehead|bilateral|hemispheric|nucleus"),
 ("Which way does the tongue deviate, and which way does the uvula?",
  "The tongue points toward the weak side; the uvula points away from it " + C() + ". Both follow from the intact muscle winning — one pushes, the other lifts.",
  "tongue|uvula|deviate|intact"),
 ("A patient is unsteady in stance with their eyes already open. Is Romberg positive?",
  "No — they have not performed a Romberg. It is positive only if stance is steady with eyes open and unsteady with them closed, which is what isolates proprioception " + C() + ". Unsteady from the start is cerebellar or vestibular.",
  "Romberg|eyes open|isolates|vestibular"),
 ("What separates a cerebellar from a sensory ataxia on finger-to-nose?",
  "Removing vision. The cerebellar patient is about as inaccurate either way; the sensory patient is markedly worse with the eyes closed, because vision had been substituting for proprioception " + C() + ".",
  "vision|cerebellar|sensory|substituting"),
 ("How do you distinguish neglect from hemianopia?",
  "Whether the patient searches. A field cut prompts head-turning and searching; neglect does not, because nothing feels missing " + C() + ". They coexist often, and coexistence worsens functional impact " + S("Salti 2026") + ".",
  "search|field cut|coexist|impact"),
 ("How common is spatial neglect after stroke?",
  "38% after right-hemisphere damage and 18% after left-hemisphere damage, with figures varying by lesion site, time since onset and assessment method " + S("Salti 2026") + ".",
  "prevalence|right hemisphere|left|varying"),
 ("What change on the Berg Balance Scale exceeds measurement error in acute stroke?",
  "MDC₉₅ of 7 points; in chronic stroke 4.66 to 6.7 " + S("Moore 2018") + ". There is no MCID for the Berg — the CPG says none of its five level I studies reporting SEM or MDC also reported one " + S("Moore 2018") + ".",
  "MDC|acute stroke|measurement error|MCID"),
 ("Why is a Berg score of 54 at 6 months less useful than the same score at 14 days?",
  "Ceiling effects rise with time after stroke — 4.9% at 14 days to 28.8% at 180 days " + S("Moore 2018") + ". Near the ceiling the scale cannot show the improvement you are working for.",
  "ceiling|180 days|improvement|scale"),
 ("Which core-set measure is recommended with permissive rather than directive language?",
  "The 5 Times Sit-to-Stand: it “may be used” for sit-to-stand goals, while transfers themselves are to be <i>documented</i> — type, assistance, equipment or context adaptations, and time to complete " + S("Moore 2018") + ".",
  "permissive|sit to stand|documented|adaptations"),
 ("The original stroke examination scale found its most reliable item was also nearly useless. Which, and why does it matter?",
  "Pupillary response — the most interrater-reliable item had low validity, while less reliable items such as limb motor function were more valid " + S("Brott 1989") + ". Reliability and validity are different properties, and an examination optimized for agreement can be optimized away from meaning.",
  "pupillary|reliable|validity|agreement"),
 ("When is a manual muscle grade not worth recording?",
  "Through significant spasticity or patterned movement: the resistance you feel is tone and the movement you grade may be the synergy " + C() + ". Record why it is not interpretable instead — a wrong grade gets used by everyone downstream.",
  "interpretable|synergy|tone|downstream"),
 ("What defines the motor level?",
  "The lowest key muscle function graded at least 3 on manual testing in the supine position, with the segment above normal " + S("Rupp 2021") + ". Ten key muscles per side, C5–T1 and L2–S1 " + S("Rupp 2021") + ".",
  "motor level|grade three|supine|key muscle"),
 ("Crossed findings — face weak on one side, body on the other. Where is the lesion?",
  "The brainstem, at the level of that cranial nerve nucleus " + C() + ". The long tracts have already crossed and the nerve has not, which is why crossed signs are the most specific localization the bedside exam produces.",
  "crossed|brainstem|tracts|specific"),
 ("Why does the tone examination mislead in the first weeks after a cord injury?",
  "Spinal shock: an upper motor neuron lesion presents flaccid and areflexic " + C() + ", so the findings read as lower motor neuron. Date every tone finding and re-examine.",
  "spinal shock|flaccid|areflexic|re-examine"),
]

# ---------------------------------------------------------------- references
# (group, [(au, title, url, jo, note), ...])  — .au and .jo are what the linker parses.
REFS = [
 ("Standards and clinical practice guidelines", [
  ("Rupp R, Biering-Sørensen F, Burns SP, Graves DE, Guest J, Jones L, Read MS, Rodriguez GM, Schuld C, Tansey-Md KE, Walden K, Kirshblum S",
   "International Standards for Neurological Classification of Spinal Cord Injury: Revised 2019",
   "https://pmc.ncbi.nlm.nih.gov/articles/PMC8152171/",
   "Top Spinal Cord Inj Rehabil 2021;27(2):1-22",
   "The source of every sensory and motor scoring value in this guide: 28 dermatomes C2-S4-5, the single cotton stroke across no more than 1 cm, the stretched safety pin for sharp and dull, 0/1/2 scoring against the cheek, 56+56=112 points per side, the 0-5 motor grades, and the motor level as the lowest key muscle graded at least 3. It is a spinal cord injury standard: the scoring discipline transfers anywhere, the dermatomal interpretation does not."),
  ("Moore JL, Potter K, Blankshain K, Kaplan SL, O'Dwyer LC, Sullivan JE",
   "A Core Set of Outcome Measures for Adults With Neurologic Conditions Undergoing Rehabilitation: A Clinical Practice Guideline",
   "https://pmc.ncbi.nlm.nih.gov/articles/PMC6023606/",
   "J Neurol Phys Ther 2018;42(3):174-220",
   "Nine action statements with explicit evidence quality. Berg Balance Scale strong on level I evidence; Functional Gait Assessment, ABC Scale, 10 metre Walk Test and 6-Minute Walk Test each recommended, and each conditioned on the patient having goals and the capacity to change in that area. Carries the reliability, SEM, MDC, floor and ceiling figures quoted here — and states plainly that no MCID was reported for either the Berg or the FGA, which is why this guide prints none."),
 ]),
 ("Reflexes, tone and the upper motor neuron", [
  ("Morimoto T, Hirata H, Watanabe K, Kato K, Otani K, Mawatari M, Nikaido T",
   "The Usefulness of Deep Tendon Reflexes in the Diagnosis of Lumbar Spine Diseases: A Narrative Review",
   "https://pmc.ncbi.nlm.nih.gov/articles/PMC10999014/",
   "Cureus 2024;16(3):e56391",
   "The NINDS myotatic reflex scale with its 0 to 4+ definitions, and the Babinski sign's accuracy for pyramidal tract dysfunction: sensitivity 50.8% (95% CI 41.5-60.1), specificity 99% (95% CI 97.7-100), intra-observer reliability 0.467-0.571. The paper's own subject is lumbar spine disease; it is cited here only for the scale and for those accuracy figures, which are claims about the sign itself."),
  ("Bohannon RW, Smith MB",
   "Interrater reliability of a modified Ashworth scale of muscle spasticity",
   "https://pubmed.ncbi.nlm.nih.gov/3809245/",
   "Phys Ther 1987;67(2):206-207",
   "Abstract only, and the abstract is the whole of what can be cited: two raters, 30 patients with intracranial lesions, elbow flexors alone, 86.7% agreement and Kendall's tau 0.847. The authors say the results are limited to the elbow flexors and are positive enough only to encourage further trials. It does not establish the scale at any other joint or as a valid measure of spasticity."),
  ("Mikša Pušnik D, Pirkmajer S, Tomc Žargi T",
   "Intra- and interrater reliability of the Modified Ashworth Scale and its association with the Tardieu Scale in children with cerebral palsy",
   "https://pmc.ncbi.nlm.nih.gov/articles/PMC13332714/",
   "PeerJ 2026;14:e21349",
   "23 children with cerebral palsy; elbow, knee and plantar flexors. Intrarater ICC 0.91-0.99, interrater ICC 0.80-0.89, moderate positive correlation with the Tardieu Scale, and an explicit warning against interpreting the scale at the individual level. The population is children, which is stated wherever this is quoted."),
 ]),
 ("Perception, cognition and the cranial nerves", [
  ("Salti G, Formelli B, Piccardi B, Barucci E, Poggesi A",
   "Unilateral Spatial Neglect After Stroke: A Pragmatic Approach to Assessment and Rehabilitation",
   "https://pmc.ncbi.nlm.nih.gov/articles/PMC13466990/",
   "J Clin Med 2026;15(1):tbc",
   "Neglect in 38% of right-hemisphere and 18% of left-hemisphere damage, with the caveat in the same passage that reported figures vary by lesion location, time since onset and assessment method. Also the description of the Behavioural Inattention Test (six paper-and-pencil plus nine behavioural tasks) and the Catherine Bergego Scale. It names instruments; it supplies no cutoffs, and none are quoted here."),
  ("Tarnutzer AA, Shaikh AG, Zee DS",
   "Ocular motor and vestibular examination in the unconscious patient - standard of care",
   "https://pmc.ncbi.nlm.nih.gov/articles/PMC12979088/",
   "Front Neurol 2026;16:tbc",
   "Cited once, for the definition of the oculocephalic reflex as assessment of vestibular responses by passive head-on-body rotation in the horizontal or vertical plane. Its population is unconscious patients, so it supports nothing about the awake ocular motor examination."),
  ("Brott T, Adams HP, Olinger CP, Marler JR, Barsan WG, Biller J, Spilker J, Holleran R, Eberle R, Hertzberg V",
   "Measurements of acute cerebral infarction: a clinical examination scale",
   "https://pubmed.ncbi.nlm.nih.gov/2749846/",
   "Stroke 1989;20(7):864-870",
   "Abstract only. A 15-item scale; interrater mean kappa 0.69, test-retest 0.66-0.77, validity against infarct size r=0.68 and 3-month outcome r=0.79. Cited here for one finding: the most interrater-reliable item, pupillary response, had low validity, while less reliable items such as limb motor function were more valid. The familiar modern severity bands are not in this abstract and are not quoted."),
  ("Teasdale G, Jennett B",
   "Assessment of coma and impaired consciousness. A practical scale",
   "https://pubmed.ncbi.nlm.nih.gov/4136544/",
   "Lancet 1974;2(7872):81-84",
   "Cited for the existence and authorship of the Glasgow Coma Scale and for nothing else. Europe PMC indexes no abstract, so the component scores and the 3-15 total are flagged in this guide as having no traceable source rather than printed unmarked."),
  ("Freeman R, Wieling W, Axelrod FB, Benditt DG, Benarroch E, Biaggioni I, Cheshire WP, et al",
   "Consensus statement on the definition of orthostatic hypotension, neurally mediated syncope and the postural tachycardia syndrome",
   "https://pubmed.ncbi.nlm.nih.gov/21431947/",
   "Clin Auton Res 2011;21(2):69-72",
   "Cited for the existence of the consensus definition. The text is not freely readable and no abstract is indexed, so the 20/10 mmHg threshold it defines is flagged in place rather than printed unmarked."),
 ]),
]

# --------------------------------------------------- additions after the citation-count check
def _sec(sid):
    for s in SECTIONS:
        if s["id"] == sid:
            return s
    raise KeyError(sid)

# The sensory lede referred to Rupp in plain text; make it a real citation.
_sec("sensory")["lede"] = _sec("sensory")["lede"].replace(
    "performed and scored (Rupp 2021).",
    "performed and scored " + S("Rupp 2021") + ".")

_sec("function")["lede"] += (" The measures named here are the ones the Academy of Neurologic "
    "Physical Therapy's core-set guideline recommends " + S("Moore 2018") + ".")

_sec("tone")["lede"] += (" Where a grade is wanted, the Modified Ashworth is the usual one, and "
    "the guide quotes what its studies actually measured rather than what it is assumed to "
    "measure " + S("Bohannon 1987") + " " + S("Pušnik 2026") + ".")

# rows that carry values from the same sources, and that the sections were thin without
_sec("sensory")["blocks"][0][2].extend([
 ("Not testable, and not determined",
  "When a point cannot be tested — a dressing, an amputation, a patient who cannot report — record it rather than inferring it.",
  "<b>A point that cannot be examined is recorded NT; a classification parameter that cannot be derived is recorded ND</b> " + S("Rupp 2021") + ". An inferred score is indistinguishable from a measured one once it is written down, which is the entire reason the standard carries two separate codes for the two kinds of missing.",
  "not testable|not determined|inferred|record"),
 ("Sensation below the level",
  "Where a cord lesion is suspected, test the lowest sacral segments specifically rather than stopping at the trunk.",
  "<b>Light touch or pin prick at S4–5, or deep anal pressure, is what separates a complete from an incomplete lesion</b> " + S("Rupp 2021") + ". Stopping the sensory exam at the level you have already found is the commonest way an incomplete injury is recorded as complete.",
  "sacral|S4-5|incomplete|deep anal"),
])

_sec("function")["blocks"][0][2].extend([
 ("Functional Gait Assessment — reliability",
  "Administer to the CPG's protocol, and establish consistency between raters in your service annually.",
  "<b>Excellent internal consistency in acute and chronic stable conditions and excellent reliability across acute, chronic stable and chronic progressive conditions</b> " + S("Moore 2018") + ". The guideline recommends each facility adopt one testing protocol and re-establish rater consistency annually, since no single protocol has been validated " + S("Moore 2018") + ".",
  "Functional Gait|protocol|rater|annually"),
 ("Choosing between the balance measures",
  "Match the measure to the task the patient's goal names.",
  "<b>The Berg covers static and dynamic sitting and standing balance; the FGA covers balance while walking</b> " + S("Moore 2018") + ". They are not interchangeable, and a patient with a walking-balance goal scored only on the Berg has been measured on the wrong axis.",
  "choosing|interchangeable|walking balance|axis"),
])

_sec("tone")["blocks"][0][2].append(
 ("Ashworth against Tardieu",
  "Where both are available, compare what each is grading.",
  "<b>Only a moderate positive correlation between the two scales across elbow, knee and plantar flexors</b> " + S("Pušnik 2026") + " — they are not measuring the same thing, and the Tardieu's separation of the fast and slow catch is the part the Ashworth collapses. Both figures come from 23 children with cerebral palsy " + S("Pušnik 2026") + ".",
  "Tardieu|correlation|catch|collapses"))

_sec("cognition")["blocks"][0][2].append(
 ("Reliability is not validity",
  "Before adopting any scored screen, ask what its most reproducible item actually predicts.",
  "<b>In the original acute stroke examination scale the most interrater-reliable item — pupillary response — had low validity, while less reliable items such as limb motor function were more valid</b> " + S("Brott 1989") + ". An instrument optimized for agreement between examiners can be optimized away from meaning.",
  "reliability|validity|pupillary|agreement"))

DRILL.extend([
 ("A sensory point cannot be tested because of a dressing. What do you write?",
  "NT — not testable " + S("Rupp 2021") + ". A parameter that cannot be derived from the examination is ND, not determined. The standard carries two codes for missing data precisely because an inferred score reads as a measured one afterwards.",
  "not testable|dressing|determined|inferred"),
 ("What separates a complete from an incomplete cord lesion on the sensory exam?",
  "Sensation in the lowest sacral segments: light touch or pin prick at S4–5, or deep anal pressure " + S("Rupp 2021") + ". Stopping at the trunk level already found is how an incomplete injury gets recorded as complete.",
  "sacral|deep anal|incomplete|trunk"),
 ("Do the Ashworth and Tardieu scales measure the same thing?",
  "No — only a moderate positive correlation between them across elbow, knee and plantar flexors in 23 children with cerebral palsy " + S("Pušnik 2026") + ". The Tardieu separates the fast from the slow catch; the Ashworth collapses that distinction.",
  "Ashworth|Tardieu|correlation|catch"),
 ("Your patient's goal is to walk safely in a crowded corridor. Berg or FGA?",
  "The FGA — the Berg covers static and dynamic sitting and standing balance, the FGA covers balance while walking " + S("Moore 2018") + ". Scoring a walking-balance goal only on the Berg measures the wrong axis.",
  "corridor|walking balance|Berg|axis"),
])

# ---------------------------------------------------------------- the one figure
# Pattern 2 from docs/joint-playbook-template.md — "which structure is where", converting a
# list into a spatial fact. It is here because the crossing level is the mechanism behind the
# vibration-versus-pin dissociation, the sensory-level rule, and the hemicord row in the
# localization table, and three sections had been trying to carry it in prose.
PATHWAY_FIGURE = '''    <figure>
      <p class="figtitle">The two sensory pathways cross at different levels</p>
      <svg viewBox="100 8 500 302" role="img" aria-label="Two schematic spinal cords side by side, each with a foot entering on the right. In the dorsal column pathway the fibre ascends on the same side it entered and only crosses the midline high, in the medulla. In the spinothalamic pathway the fibre crosses the midline within a segment or two of entering, low in the cord, and ascends on the opposite side. One hemicord lesion therefore takes vibration and position sense on its own side and pain and temperature on the other.">
        <defs>
          <marker id="up" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 10 L 5 0 L 10 10" fill="none" stroke="var(--accent)" stroke-width="2"></path>
          </marker>
        </defs>

        <!-- panel A - dorsal column: ascends ipsilaterally, crosses high -->
        <rect x="110" y="30" width="120" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".75"></rect>
        <text class="mono" x="170" y="49" text-anchor="middle">MEDULLA</text>
        <rect x="130" y="64" width="80" height="186" rx="11" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <line x1="170" y1="64" x2="170" y2="250" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".55"></line>
        <circle cx="204" cy="258" r="3.4" fill="currentColor" opacity=".8"></circle>
        <path d="M 204 258 L 190 246 L 190 60 L 152 40 L 152 26" fill="none" stroke="var(--accent)" stroke-width="2.2" marker-end="url(#up)"></path>
        <text class="mono" x="240" y="45" fill="var(--accent)">crosses</text>
        <text class="mono" x="205" y="276" text-anchor="middle">R foot</text>
        <text class="mono" x="175" y="298" text-anchor="middle">DORSAL COLUMN</text>

        <!-- panel B - spinothalamic: crosses within a segment or two of entry -->
        <rect x="390" y="30" width="120" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".75"></rect>
        <text class="mono" x="450" y="49" text-anchor="middle">MEDULLA</text>
        <rect x="410" y="64" width="80" height="186" rx="11" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <line x1="450" y1="64" x2="450" y2="250" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".55"></line>
        <circle cx="484" cy="258" r="3.4" fill="currentColor" opacity=".8"></circle>
        <path d="M 484 258 L 470 248 L 430 238 L 430 26" fill="none" stroke="var(--accent)" stroke-width="2.2" marker-end="url(#up)"></path>
        <text class="mono" x="500" y="243" fill="var(--accent)">crosses</text>
        <text class="mono" x="485" y="276" text-anchor="middle">R foot</text>
        <text class="mono" x="450" y="298" text-anchor="middle">SPINOTHALAMIC</text>
      </svg>
      <div class="figgrid">
        <div><span class="lbl">Dorsal column</span><span class="t2">Vibration and joint position sense ascend on the <span class="em">same side</span> they entered and cross high, in the medulla.</span></div>
        <div><span class="lbl">Spinothalamic</span><span class="t2">Pain and temperature cross within a segment or two of entering and ascend on the <span class="em">opposite side</span>.</span></div>
      </div>
      <figcaption><b>This is why one lesion can produce two different-sided losses.</b> A lesion
      of the left half of the cord takes the left dorsal column — so vibration and position sense
      go on the <i>left</i> — and takes the left spinothalamic tract, which is carrying pain and
      temperature that crossed over from the <i>right</i>. That is the hemicord row in the
      localization table, and it is also why a vibration level that disagrees with the pin-prick
      level is a finding rather than an inconsistency. The crossing levels themselves are
      standard neuroanatomy and carry no citation here; what is sourced is the scoring used to
      find each level.</figcaption>
    </figure>
'''
_sec("sensory")["blocks"].insert(1, ("figure", PATHWAY_FIGURE, ""))
