# -*- coding: utf-8 -*-
# Key points by topic. Each kp: (tag, question, gist, watch, answer_html)
T = []

def topic(id, name, title, sub, kps):
    T.append(dict(id=id, name=name, title=title, sub=sub, kps=kps))

# ---------------- TOPIC 1 ----------------
topic('1', 'Reasoning & outcomes', 'Topic 1 · Neurologic practice, clinical reasoning &amp; outcome measures',
 'Scope of neurologic PT · the streamlined decision-making cycle · problem types · outcome measure selection', [
('1A', 'What neurologic PT covers, and where its practice resources come from',
 'Neurologic PT is the evaluation and treatment of people with movement problems caused by disease or injury of the nervous system. The Academy of Neurologic Physical Therapy (ANPT) publishes the practice resources.',
 'EDGE = <b>Evaluation Database to Guide Effectiveness</b>. EDGE documents exist for PD, MS, TBI, SCI, stroke and vestibular disorders.',
 '''<ul>
<li><b>Definition:</b> "evaluation and treatment of individuals with movement problems due to disease or injury of the nervous system." {{u_intro}}</li>
<li><b>ANPT</b> (neuropt.org): many resources free to members and nonmembers, including student blogs and podcasts, with more access for members; publishes the <i>Journal of Neurologic Physical Therapy</i>, clinical practice guidelines (CPGs) and EDGE documents.</li>
<li><b>CPGs:</b> vestibular hypofunction (Apr 2016, revised Apr 2022), core outcome measures (Jul 2018), concussion (Apr 2020), locomotion in chronic stroke/SCI/TBI (Jan 2020), AFOs and FES post-stroke (Apr 2021), Parkinson disease (Jan 2022); balance and falls, and locomotion in subacute stroke/SCI/TBI, in process.</li>
<li><b>Person-first language</b> <span class="mine">inference</span> (answers to the fill-in exercise): "stroke patient" → person with (or after) a stroke; "dizzy patient" → person with dizziness; "spastic arm" → arm with spasticity; "Parki's" → person with Parkinson disease; "he's a TBI" → he has a TBI. Person-first language is the standard in government documents, scientific journals and UN publications. Some communities, such as the Deaf community, prefer not to use it. {{crocker19}}</li>
</ul>'''),
('1B', 'How a neuro exam differs from an ortho exam',
 'Treat the whole person: nervous system plus musculoskeletal system. The neuro exam swaps several ortho defaults.',
 'MMT and myotomes are the ortho default. In neuro, motor control is examined as <b>patterned vs selective movement</b> and with the <b>UMCT</b>.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:24%"><col style="width:38%"><col style="width:38%"></colgroup>
<thead><tr><th>Exam part</th><th>Ortho (musculoskeletal)</th><th>Neuro (neuromuscular)</th></tr></thead><tbody>
<tr><td class="name">Subjective</td><td>Pain focus</td><td>Social support and environment</td></tr>
<tr><td class="name">Sensory exam</td><td>Dermatomes</td><td>Areas</td></tr>
<tr><td class="name">Motor control</td><td>MMT and myotomes</td><td>Patterned vs selective movement; UMCT</td></tr>
<tr><td class="name">Muscle tone</td><td>Normal</td><td>Hyper- or hypotonia</td></tr>
</tbody></table></div><p>{{u_intro}}</p>'''),
('1C', 'Clinical reasoning vs clinical decision-making',
 'Clinical reasoning is the thinking process. Decision-making is the choice it leads to: treat, or refer, co-manage or consult.',
 'Clinical reasoning in this framing <b>emphasizes movement analysis</b> and is an interactive, patient-collaboration process.',
 '''<ul>
<li><b>Clinical reasoning:</b> a complex process used to identify problem-framing, problem-solving and decision-making, the active pathology, the reason for the problem, and the consequences of the illness or disease process. It emphasizes movement analysis and is interactive, in collaboration with the patient. {{gilli17}}</li>
<li><b>Decision-making:</b> the PT decides whether to provide interventions or refer to one or more providers for management, co-management or consultation. {{u_intro}}</li>
<li><b>Models:</b> HOAC-II (Hypothesis-Oriented Algorithm for Clinicians II) {{roth03}}; Patient/Client Management model from the APTA Guide {{apta4}}; Integrated Framework {{schenk06}}; ICF-based tool for reasoning and reflection {{atk11}}; revised Integrated Framework {{deutsch22}}.</li>
</ul>'''),
('1D', 'The streamlined clinical reasoning and decision-making cycle',
 'A loop with shared decision-making at its center: interview → exam → evaluation → plan of care → reassessment → outcome, with reflection between every step.',
 'Hypotheses (Ho) are formed early (initial observation, interview) and <b>guide</b> which tests you pick. They aren\'t something you form only at the end.',
 '''<ul>
<li><b>Initial impression</b> → <b>Interview/history:</b> focused questions, review of systems, formulate Ho.</li>
<li><b>Exam:</b> systems review, task and movement analysis, outcome measures, impairment testing.</li>
<li><b>Evaluation:</b> diagnosis (plan and referral), prognosis and goals, problems (PIP, N-PIP, AP), plan of care.</li>
<li><b>POC/interventions</b> → <b>Reassessment</b> (outcome measures) → <b>Outcome</b> (goals met or modified).</li>
<li>Reflection sits between each step; patient and therapist share decisions at the center. {{roth03,schenk06,atk11,deutsch22}}</li>
<li><b>Hypothesis:</b> a diagnostic idea that may identify pathology, impairments, functional deficits, and causes of and factors influencing disability and ability. It guides data collection and treatment; consider the ICF.</li>
<li><b>Ho process</b> (also a way to structure the evaluation): initial observation → Ho → subjective exam → Ho → task/movement analysis → Ho of potential impairments → test of potential impairments, with reflection throughout. {{u_intro}}</li>
</ul>'''),
('1E', 'PIP vs N-PIP vs AP',
 'Problems either exist now or may happen later. Existing problems need remediation; future ones need prevention.',
 'A family member or the care team can identify a problem the patient doesn\'t report: that is an <b>N-PIP</b>, not a PIP.',
 '''<ul>
<li><b>Patient-identified problems (PIP):</b> reported by the patient, usually functional limitations and disabilities; may exist now (react) or be anticipated. The therapist generates hypotheses about their cause and sets testing criteria to judge outcomes and whether the hypothesis was right.</li>
<li><b>Non-patient-identified problems (N-PIP):</b> functional problems not reported by the patient, identified by the therapist, other team members, or family/care providers; may exist now or be anticipated.</li>
<li><b>Anticipated problems (AP):</b> may occur in the future; require prevention and education, so you are proactive instead of reactive. {{roth03}}</li>
<li><b>2 ways to manage:</b> existing problems → remediation; future problems → prevention. {{u_intro}}</li>
</ul>'''),
('1F', 'Review of systems (subjective) vs systems review (exam)',
 'Same idea, two moments. The <b>review of systems</b> is asked in the history. The <b>systems review</b> is a quick look during the physical exam.',
 'Systems review includes <b>communication, affect, cognition, language, ability to read and learning style</b>, plus movement.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:50%"><col style="width:50%"></colgroup>
<thead><tr><th>Review of systems (subjective)</th><th>Systems review (examination)</th></tr></thead><tbody>
<tr><td>Cardiovascular · pulmonary · endocrine · eyes, ears, nose and throat · GI · genitourinary/reproductive · hematologic/lymphatic · immune · integumentary · nervous · musculoskeletal; plus overall physical and emotional well-being (weight loss, fatigue, lethargy, malaise, anxiety, hopelessness, depression)</td><td>Cardiovascular and pulmonary · integumentary · musculoskeletal · neuromuscular · communication, affect, cognition, language, ability to read and learning style · movement</td></tr>
</tbody></table></div>
<ul><li><b>Evaluation</b> = interpret and synthesize history and exam findings to establish a diagnosis, determine a prognosis with goals, develop a plan of care if indicated, and build a working diagnosis list to decide whether referral or consultation is needed. {{apta4}}</li></ul>'''),
('1G', 'Reflection, the expert clinician, and the four ways a PT can involve others',
 'Reflection happens in action (during) or on action (after). Experts self-monitor and reflect well. When care goes beyond you, you co-manage, consult, manage or refer.',
 '<b>Manage</b> means you stay accountable while using assistive personnel. <b>Refer</b> means the need is outside your personal, jurisdictional or professional scope, or you want specific testing.',
 '''<ul>
<li><b>Reflection:</b> develops clinical reasoning and professional growth. <b>In action</b> = during the event (e.g., thinking out loud). <b>On action</b> = after the event, internally or externally focused (e.g., a journal entry). {{schon83,atk11}}</li>
<li><b>Expert clinician:</b> patient empowerment; collaborative problem-solving; caring, humble, loves clinical care; recognizes many presentations; good self-monitoring and reflection; prioritizes and modifies interventions efficiently; fast, efficient work and problem-solving; commitment to professional growth; deep understanding of the complexities of care; understands the patient\'s viewpoint and the wider implications; inquisitive learner with area-specific knowledge; limited delegation of care. {{resnik03,edwards04}}</li>
<li><b>Co-manage:</b> collaborate with other professionals to direct or coordinate management. <b>Consult:</b> give or receive expert opinion. <b>Manage:</b> remain accountable when using assistive personnel. <b>Refer:</b> send to another provider for services outside your scope, or for specific testing. {{apta4}}</li>
</ul>'''),
('1H', 'Outcome measures: purpose, selection and MDC vs MCID',
 'Outcome measures discriminate, predict or evaluate. Choose them deductively, narrowing the list at each step of the visit.',
 '<b>MDC</b> = smallest change that is a <i>true</i> change beyond error. <b>MCID</b> = smallest change that is <i>meaningful</i> to the person.',
 '''<ul>
<li><b>Purposes:</b> discriminate (aid clinical decisions, POC, diagnosis); predict (goal setting, communicating with patients, providers and payers, predicting future status, motivating); evaluate (track change, determine treatment effectiveness).</li>
<li><b>Deductive selection:</b> referral → initial list → refine after initial observation → refine after history → refine after systems review → final selection.</li>
<li><b>Factors:</b> what to measure (ICF: body function/structure, activity, participation); purpose; type (disease-specific vs generic; performance-based vs self-report); patient and clinic factors (patient goals and perceptions, clinic requirements); psychometrics (reliability, validity for the population, diagnostic accuracy = sensitivity and specificity, responsiveness = MDC and MCID); feasibility (time, space, equipment, training, cost or proprietary, culture/language). {{potter11}}</li>
<li><b>MDC</b> (minimal detectable change): the minimum change needed to exceed measurement error and variability, i.e., the smallest change that is a true change. <b>MCID</b> (minimal clinically important difference): the smallest difference considered worthwhile or important, which tells you whether a change is meaningful. {{u_intro}}</li>
<li><b>Considerations:</b> performance-based measures may not reflect actual performance at home and in the community; consider the population a measure was developed on; no measure does it all, so combine them (e.g., activity + participation + body structure; performance + self-report; steady-state + anticipatory + reactive balance). {{u_intro}}</li>
</ul>'''),
])

# ---------------- TOPIC 2 ----------------
topic('2', 'Subjective & movement analysis', 'Topic 2 · Subjective exam, task analysis &amp; movement analysis',
 'Running the interview · PSFS · task vs movement analysis · the movement continuum · observable constructs', [
('2A', 'How to run the subjective exam',
 'Respect plus three P\'s: introduce yourself, ask how the person wants to be addressed, protect privacy, position both of you well, and pace it.',
 'Empower the <b>patient first</b>, then ask permission to involve family or caregivers.',
 '''<ul>
<li><b>Respect:</b> self-introduction; ask how the patient wishes to be addressed; family/caregivers.</li>
<li><b>Privacy.</b></li>
<li><b>Position:</b> patient in a supported position (back, feet, arms), head neutral; PT in the patient\'s line of vision, at the same level.</li>
<li><b>Pace:</b> allow time for the patient to respond.</li>
<li><b>Focus:</b> equipment, life roles, social support and environment (ICF categories), and social determinants of health. {{u_subj}}</li>
<li><b>ICF model:</b> health condition (disorder or disease) at the top; body functions and structures ↔ activities ↔ participation in the middle; environmental and personal factors underneath, feeding all three.</li>
<li><b>SDOH, 5 domains (Healthy People 2030):</b> economic stability; education access and quality; health care access and quality; neighborhood and built environment; social and community context.</li>
</ul>'''),
('2B', 'Subjective pearls: PLOF, PSFS and shared decision-making',
 'For chronic conditions, anchor PLOF in time. Use standardized tools for goals (PSFS) and self-reported outcomes.',
 'PSFS numbers differ by population: stroke <b>MDC 1.94 / MCID 1.58</b>; MS <b>MDC 2.1 / MCID 2.5</b>.',
 '''<ul>
<li><b>PLOF</b> in a chronic neuro condition: ask about 6 months ago, 1 year ago, or before the most recent change.</li>
<li><b>Standardized subjective tools:</b> patient goals via the Patient-Specific Functional Scale (PSFS); self-reported outcomes such as participation measures (PSFS, Stroke Impact Scale) and self-rating scales (e.g., fatigue).</li>
<li>To optimize shared decision-making, seek the patient\'s preferences. {{u_subj}}</li>
<li><b>PSFS form:</b> the patient names up to 3 activities (up to 5 on extended versions) they have trouble with; each is rated <b>0 = unable to perform</b> to <b>10 = able to perform at the same level as before the injury or problem</b>; total score = sum of activity scores ÷ number of activities. Complete it at the end of the history, before the physical exam. Original MDC (90% CI): <b>2 points</b> for the average score, <b>3 points</b> for a single activity (Stratford 1995, as cited). {{u_subj}}</li>
</ul>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:34%"><col style="width:33%"><col style="width:33%"></colgroup>
<thead><tr><th>PSFS</th><th>MDC</th><th>MCID</th></tr></thead><tbody>
<tr><td class="name">Stroke</td><td>1.94 points</td><td>1.58 points</td></tr>
<tr><td class="name">Multiple sclerosis</td><td>2.1 points</td><td>2.5 points</td></tr>
</tbody></table></div><p>{{evensen23,manago23}}</p>'''),
('2C', 'Question sets that bring out the patient\'s perspective',
 'Six question groups: why they came, goals, roles, resources and constraints, barriers and facilitators, and readiness and learning style.',
 'If a patient can\'t state goals, probe: "What do you want to do better, or faster?" "Is there anything you don\'t do but would like to?" "What gives you joy?"',
 '''<ul>
<li><b>Why seeking care:</b> what would you like to do; when could you last do it; how limiting is it; how long; what do you think contributes; other health conditions.</li>
<li><b>Goal setting:</b> what do you hope to achieve; what benchmarks would show progress.</li>
<li><b>Role in society:</b> what roles do you play at home and work; how do the problems interfere with them.</li>
<li><b>Resources and constraints:</b> prior PT experience, knowledge of the condition, recent activity; daily help from family and friends; additional help needed; access to care (finances, distance, transportation, schedule, insurance).</li>
<li><b>Barriers and solutions:</b> what might make it difficult to participate; what facilitates reaching goals.</li>
<li><b>Responsibility and learning:</b> readiness to take an active role; comfort changing a behavior; learning preference (verbal, written, by doing). {{deutsch22}}</li>
</ul>'''),
('2D', 'What a complete neuro history collects',
 'Beyond the diagnosis: ROS, meds and imaging, family and social support, economics, education, roles, home and community, PLOF and CLOF, learning style, safety and goals.',
 'Safety in the history covers <b>home, food and finances</b>. CLOF includes the current exercise routine.',
 '''<ul>
<li>Name; date of birth/age; reason for seeking PT; knowledge of and experience with PT; medical diagnosis and history of the current condition.</li>
<li><b>ROS</b> by system, with smoking history under pulmonary and drinking history under GU; overall physical and psychological condition (sleep, unexplained weight change, fatigue, lethargy, malaise, cognitive and emotional well-being: anxiety, depression, hopelessness).</li>
<li>Imaging/labs; medications; family history/social support; economic status; education history; life roles/participation; home and community environment/equipment.</li>
<li><b>PLOF; CLOF</b> including current exercise routine; learning style; <b>safety</b> (home, food, finances); patient/family goals. {{u_tmpl}}</li>
</ul>'''),
('2E', 'Task analysis vs movement analysis',
 'Task analysis asks <b>how</b> the person did the task (steps, devices, effectiveness, efficiency, safety). Movement analysis looks at the <b>quality</b> of the movement while you watch.',
 'Movement analysis starts at the <b>first observation</b> (when the person enters, after the subjective and baseline vitals) and continues through exam and treatment.',
 '''<ul>
<li><b>Task analysis:</b> what steps and in what order; what items/devices; how effective, efficient and safe. Tasks are affected by cognitive demands, familiarity/experience and environment. Example: getting out of bed by side-lying to sit, supine to sit, or a "flat spin"; making vegetable soup from a can, from frozen vegetables, or from fresh-cut vegetables.</li>
<li><b>Context:</b> the 2013 APTA vision, "transforming society by optimizing movement to improve the human experience", casts PTs as movement system experts. Movement analysis = observing movement during tasks and activities; movement system diagnoses categorize problems by impairments and limitations of movement. {{u_exam}}</li>
<li><b>Movement analysis</b> occurs during observation of the task. <b>Influencing factors:</b> starting posture, reflexes, environment (space, time constraints, external forces), emotional state, sensory input, repetition/experience, neural pathways, cardiopulmonary and MSK systems.</li>
<li><b>Observable constructs:</b> symmetry, speed, amplitude/trajectory, alignment, verticality, stability, smoothness, sequencing, timing, accuracy, force production, force sustainability, symptom provocation.</li>
<li><b>When:</b> early; the PT generates hypotheses during observation, which guides test selection. {{quinn21,u_exam}}</li>
</ul>'''),
('2F', 'Categorizing tasks two ways',
 'By individual and environment (Gentile\'s stationary/moving grid), and by task attributes (discrete, continuous, serial).',
 'Whenever possible, analyze tasks in the environmental context where the patient actually does them.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:42%"><col style="width:58%"></colgroup>
<thead><tr><th>Individual &amp; environment</th><th>Example</th></tr></thead><tbody>
<tr><td class="name">1 · Stationary individual, stationary environment</td><td>Sitting quietly on a mat in a quiet area</td></tr>
<tr><td class="name">2 · Moving individual, stationary environment</td><td>Walking in a quiet treatment area</td></tr>
<tr><td class="name">3 · Stationary individual, moving environment</td><td>Standing still in a busy clinic</td></tr>
<tr><td class="name">4 · Moving individual, moving environment</td><td>Walking in a busy clinic</td></tr>
</tbody></table></div><p>{{schenk06}}</p>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:22%"><col style="width:38%"><col style="width:40%"></colgroup>
<thead><tr><th>Task type</th><th>Attribute</th><th>Example</th></tr></thead><tbody>
<tr><td class="name">Discrete</td><td>Recognizable beginning and end</td><td>Standing to sitting</td></tr>
<tr><td class="name">Continuous</td><td>No discernible beginning or end</td><td>Walking</td></tr>
<tr><td class="name">Serial</td><td>Discrete movements performed sequentially</td><td>Armchair → stand → walk → turn → sit at the kitchen table</td></tr>
</tbody></table></div><p>{{u_exam}}</p>'''),
('2G', 'Breaking a task down: big picture, sub-goals and the movement continuum',
 'Start with an un-cued, un-assisted attempt and four big-picture questions. Then break it into sub-goals or into the five movement-continuum phases.',
 'The five phases in order: <b>initial conditions → preparation → initiation → execution → termination</b>. Preparation is internal (understanding, selecting a response).',
 '''<ul>
<li><b>Big picture:</b> (1) successful? (2) timing: longer than usual? (3) how did it look; compensations? (4) safe and stable?</li>
<li><b>Sub-goals</b> (log-roll out of bed): decide to get up → remove covers → scoot over → bend LEs → roll to side → push trunk up with UE as LEs lower → finish in sitting → reposition at edge of bed. {{u_exam}}</li>
</ul>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:20%"><col style="width:36%"><col style="width:44%"></colgroup>
<thead><tr><th>Phase</th><th>Description</th><th>Constructs to observe</th></tr></thead><tbody>
<tr><td class="name">Initial conditions</td><td>Individual and environment</td><td>Alignment, symmetry, stability, verticality</td></tr>
<tr><td class="name">Preparation</td><td>Understanding instructions and task requirements</td><td>Timing of response to commands; facial communication</td></tr>
<tr><td class="name">Initiation</td><td>How the movement starts</td><td>Timing of muscle firing, direction, smoothness</td></tr>
<tr><td class="name">Execution</td><td>Patterns and strategies through the task</td><td>Speed, symmetry, symptom provocation, stability, verticality, coordination</td></tr>
<tr><td class="name">Termination</td><td>Outcome; how they end</td><td>Goal achievement, alignment, stability, verticality, symmetry</td></tr>
</tbody></table></div><p>{{quinn21}}</p>'''),
('2H', 'Compensations, task regression and the ANPT core tasks',
 'If they succeed with a compensation, ask them to repeat it without. If they fail, regress in a fixed order: verbal cue → tactile cue → physical assistance.',
 'If a person <b>can\'t modify the pattern with cueing or instruction</b>, they are likely unable to fractionate and are synergistically bound.',
 '''<ul>
<li><b>Compensation example:</b> in sit to stand, the more impacted foot is placed forward. Ask them to bring it back in line and try again.</li>
<li><b>Regression order:</b> 1) add a verbal cue; 2) add a tactile cue; 3) add physical assistance, noting how much, how and where. {{quinn21}}</li>
<li><b>6 ANPT core tasks for movement analysis:</b> sitting, sit to stand, standing, walking (including a turn), step up/down, reach/grasp/manipulate. {{quinn21,hedman18}}</li>
<li><b>Functional status measurement:</b> time, distance, assist level, assistive devices, environment, quality (movement analysis); tasks include rolling, supine to sit, transfers (bed, toilet, shower, floor) and wheelchair mobility; gait in m/s with deviations. {{u_exam}}</li>
</ul>'''),
('2I', 'Glossary: define each observable construct',
 'Each construct has a definition and a way to measure it. Know which ones are grouped under coordination and postural control.',
 '<b>Verticality</b> = orientation relative to gravity. <b>Stability</b> = controlling the center of mass over the base of support.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:22%"><col style="width:46%"><col style="width:32%"></colgroup>
<thead><tr><th>Construct</th><th>Definition</th><th>Measurement example</th></tr></thead><tbody>
<tr><td class="name">Symmetry</td><td>Agreement of external kinetics and kinematics (e.g., left vs right)</td><td>Symmetry index or ratios</td></tr>
<tr><td class="name">Speed</td><td>Rate of change of segment or body displacement, start to finish</td><td>Speed or movement time</td></tr>
<tr><td class="name">Amplitude</td><td>Extent or range of movement used</td><td>ROM, step/stride length, distance</td></tr>
<tr><td class="name">Alignment</td><td>Orientation of body segments to one another and to the base of support</td><td>Segment position relative to other segments or environment</td></tr>
<tr><td class="name">Verticality</td><td>Ability to orient the body relative to gravity</td><td>Segment position relative to a plumb line</td></tr>
<tr><td class="name">Stability</td><td>Control of COM relative to BOS, quasi-static and dynamic</td><td>Sway; center of pressure</td></tr>
<tr><td class="name">Smoothness</td><td>Continual, without interruptions in velocity or trajectory</td><td>Acceleration and jerk</td></tr>
<tr><td class="name">Sequencing</td><td>Specific order of motor output to reach the goal</td><td>Joint coordination</td></tr>
<tr><td class="name">Timing</td><td>Temporal structure, including relative time in initiation, execution, termination</td><td>Reaction time; relative timing</td></tr>
<tr><td class="name">Accuracy</td><td>Closeness to a standard; freedom from error</td><td>Spatial or variable errors</td></tr>
<tr><td class="name">Force production / sustainability</td><td>Energy/tension applied / how long it is applied</td><td>MMT, dynamometry, force plate / timed postures</td></tr>
<tr><td class="name">Symptom provocation</td><td>Observed or reported symptoms evoked by movement</td><td>SpO<sub>2</sub>, HR; reported pain, dizziness, fear</td></tr>
</tbody></table></div><p>{{quinn21}} Smoothness, sequencing, timing, accuracy and force production and sustainability are grouped under <b>coordination</b> (the force rows are an addition to the published table); <b>verticality and stability</b> under <b>postural control</b>.</p>'''),
])

# ---------------- TOPIC 3 ----------------
topic('3', 'Cognition, perception & CNs', 'Topic 3 · Consciousness, cognition, perception &amp; cranial nerves',
 'Levels of consciousness · visual perception and neglect · apraxia · MoCA · cranial nerve screen · visual field lesions', [
('3A', 'Levels of consciousness, from coma to alert',
 'Five levels, ordered by how hard it is to rouse the person and whether they stay engaged.',
 '<b>Lethargic</b> = arousable but falls back asleep easily, still shows awareness. <b>Obtunded</b> = difficult to arouse, needs repeated stimulation, slowed responses.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:24%"><col style="width:76%"></colgroup>
<thead><tr><th>Level</th><th>Description</th></tr></thead><tbody>
<tr><td class="name">Coma</td><td>Unarousable even with noxious stimuli; reflex motor responses; GCS &lt; 8</td></tr>
<tr><td class="name">Stupor</td><td>Responds only to noxious stimuli; unable to interact when aroused; unaware</td></tr>
<tr><td class="name">Obtunded <small>minimally conscious state</small></td><td>Arousable but difficult; requires repeated stimulation (loud voice, gentle shake to open eyes); slowed responses</td></tr>
<tr><td class="name">Lethargic</td><td>Severe drowsiness; aroused with stimulation but falls back asleep easily; trouble maintaining attention; shows awareness</td></tr>
<tr><td class="name">Alert</td><td>Awake and attentive</td></tr>
</tbody></table></div><p>{{tindall90,fell18}}</p>'''),
('3B', 'Visual perception: closure, figure-ground, neglect and depth',
 'Three perceptual impairments each have a functional signature. Neglect is screened with line bisection and star cancellation.',
 'Neglect means the person <b>doesn\'t attend</b> to part of the environment: trips, leaves food, misses meds. That is different from a field cut the person knows about. <span class="mine">inference</span>',
 '''<ul>
<li><b>Visual perceptual screen</b> covers visual closure, figure-ground, visual neglect, apraxia and agnosia. {{u_exam}}</li>
<li><b>Visual closure:</b> difficulty recognizing partially obscured objects.</li>
<li><b>Figure-ground:</b> difficulty locating objects on a busy background (e.g., the peeler in a cluttered drawer).</li>
<li><b>Visual neglect:</b> does not attend to a portion of the environment; may trip, not finish food, miss meds. Screening: <b>line bisection</b> and <b>star cancellation</b>. {{ting11}}</li>
<li><b>Depth perception (stereopsis):</b> the brain perceives depth from both eyes working together to form a 3-D image. Relevant to falls, stairs, tripping, driving and wheelchair maneuvering. {{u_exam}}</li>
</ul>'''),
('3C', 'Apraxia: ideational vs ideomotor, and how to test it',
 'Apraxia is a disorder of skilled purposeful movement from impaired motor planning, not from comprehension or sensorimotor loss.',
 '<b>Ideational</b> = can\'t sequence a multi-step activity or know how to use a tool. <b>Ideomotor</b> = can\'t do it on command but may do it spontaneously later.',
 '''<ul>
<li><b>Ideational:</b> inability to coordinate activities with multiple sequential movements (dressing, eating, bathing); e.g., seals the envelope before writing the letter; doesn\'t know how to use a tool.</li>
<li><b>Ideomotor:</b> inability to produce expected movements to a verbal command; e.g., can\'t use scissors on command but later picks them up and uses them spontaneously. {{heilman03}}</li>
<li><b>Clinical test:</b> ask the patient to wave goodbye, beckon "come here", salute, hitch a lift; show how they would use a comb, toothbrush, scissors, or hammer a nail. If they fail, mimic it for them. {{u_exam}}</li>
</ul>'''),
('3D', 'MoCA: what it screens, the cut-off, and how to document it',
 'A screen for mild cognitive impairment (MCI) across 7 domains. It does <b>not</b> diagnose.',
 'Document "positive screen for MCI", never "has MCI". Add 1 point if &lt; 12 years of education. The blind version is scored out of 22.',
 '''<ul>
<li><b>Domains:</b> short-term memory; visuospatial (clock drawing, cube copy); executive function (trail making, phonemic fluency, verbal abstraction); attention; concentration and working memory; language (confrontation naming of animals, sentence repetition); orientation.</li>
<li><b>Cut-off:</b> &lt; 26 = positive screen for MCI; sensitivity 51%, specificity 96%, LR 13.5. Clinically meaningful difference: 1.7 points. {{krish17}}</li>
<li><b>Documentation:</b> &lt; 26 → "positive screen for mild cognitive impairment" (can\'t say the patient has MCI). &gt; 26 → "negative screen" (can\'t say cognition is normal).</li>
<li>Formal certification training takes about an hour (mocacognition.com). {{u_exam}} <span class="gaptag">Source conflict</span> The wording gives &lt; 26 as positive and &gt; 26 as negative, which leaves a score of exactly 26 unstated; by the &lt; 26 cut-off, 26 is a negative screen. <span class="mine">inference</span></li>
</ul>'''),
('3E', 'Cranial nerves I and II: smell, acuity, pupils and fields',
 'CN I: one nostril at a time, eyes closed, non-noxious smells. CN II: Snellen acuity, swinging flashlight, confrontation fields.',
 'In the swinging flashlight test, CN II is judged by the <b>contralateral</b> pupil (consensual) and CN III by the <b>ipsilateral</b> pupil.',
 '''<ul>
<li><b>Why screen CNs:</b> referral, baseline (neurodegenerative disease), assessing recovery (Bell\'s palsy), guiding treatment (vestibular, vision), screening for pathology (PD, AD, COVID-19). {{u_exam}}</li>
<li><b>CN I (olfactory):</b> eyes closed, close one nostril, distinctive non-noxious smell (coffee, vanilla, pepper, mint, soap); identify and compare sides. Document e.g. "+ vanilla L = R; + coffee L, − coffee R".</li>
<li><b>CN II acuity:</b> Snellen chart, one eye at a time, glasses on if worn; lowest line with most optotypes read; e.g., "L 20/30; R 20/30", noting corrective lenses.</li>
<li><b>Pupils (II &amp; III):</b> shine the penlight obliquely, swinging eye to eye every 2–3 s; the contralateral pupil should constrict. Present, absent or diminished.</li>
<li><b>Visual fields (confrontation):</b> patient looks at your nose and covers one eye; you cover your opposite eye; wiggle fingers at arm\'s length (~2 ft), bring in slowly; test superior/inferior nasal and temporal quadrants. Normal: superior 60°, inferior 75°, nasal 60°, temporal 100°. Document full or restricted. {{u_cn}}</li>
</ul>'''),
('3F', 'Cranial nerves III, IV and VI: lids, the "H", convergence and saccades',
 'III opens the lid and moves the eye in most directions; IV handles down-and-in; VI handles lateral gaze. Test them together.',
 'Convergence is intact if focus holds from <b>24" to 4"</b>. Saccade targets are held <b>no more than 40°</b> apart; normal = on target in 1–2 reps.',
 '''<ul>
<li><b>Eyelid (III):</b> observe for ptosis (palpebral fissure asymmetry); ask for upward gaze without moving the head.</li>
<li><b>"H" pattern:</b> head still, move slowly; note ROM, weakness direction or saccades (e.g., "impaired R downward gaze").</li>
<li><b>Convergence/divergence:</b> start 2 ft away, bring the target toward the nose until blurry/double; measure the distance. Intact to 4"; impaired if blurry or double &gt; 4". Then follow the target out for divergence. Also note saccades, or pupils that don\'t constrict as the target comes in.</li>
<li><b>Volitional saccades:</b> finger and pen ≤ 40° apart; "look at my finger… pen… finger"; check horizontal, vertical, diagonal. Impaired if overshoot/undershoot, slow, delayed, jerky or ratchet-like. Not indicated with eye muscle paralysis; saccade problems can be central, so differential diagnosis is needed.</li>
<li><b>IV (trochlear)</b> = diagonal downward-medial movement; <b>VI (abducens)</b> = lateral deviation; both assessed during the H, convergence and saccades. {{u_cn}}</li>
</ul>'''),
('3G', 'Cranial nerves V and VII: face sensation, chewing and facial expression',
 'V = sensation to the face (3 divisions) plus masseter and lateral pterygoid. VII = facial movement plus taste on the anterior 2/3 of the tongue.',
 'Test V sensation on the <b>forehead, cheek and jaw</b>. Test VII with smile, eyebrows, pursed lips, tight eye closure and platysma.',
 '''<ul>
<li><b>V sensory:</b> eyes closed; cotton wisp on a known intact area first, then forehead, cheek, jaw; sharp/dull; tactile extinction. Intact, diminished/impaired or absent.</li>
<li><b>V motor:</b> palpate masseters for atrophy and during clench/unclench; lateral pterygoids: push the jaw forward with the mouth slightly open, watch for deviation. Normal, weak or absent.</li>
<li><b>VII motor:</b> smile widely (zygomaticus); wrinkle forehead (frontalis); purse lips (orbicularis oris); close eyes tightly while you try to open them (orbicularis oculi); "draw down hard on the corners of your mouth" (platysma). Compare upper and lower face.</li>
<li>Document VII motor as normal, weak or absent.</li>
<li><b>VII taste</b> (often not tested): sweet, sour and salty on the anterior 2/3; test sweet on the tip of the tongue, eyes closed; intact or absent. {{u_cn}}</li>
</ul>'''),
('3H', 'Cranial nerve VIII: hearing, gaze holding, DVA and the head impulse test',
 'Hearing: finger rub, Weber, Rinne. Vestibular: gaze holding, dynamic visual acuity, head impulse test.',
 'HIT: a corrective saccade back to target means likely peripheral vestibular loss <b>on the side the head was turned toward</b>. Head turned R, eyes correct L → "+R HIT".',
 '''<ul>
<li><b>Finger rub:</b> compare L vs R; intact, impaired or absent.</li>
<li><b>Weber:</b> 256 or 512 Hz fork on the vertex. <b>Negative</b> (normal) = heard midline. <b>Positive</b> = lateralizes: ipsilateral conductive loss or contralateral sensorineural loss. Document the side it lateralizes to.</li>
<li><b>Rinne</b> (tests conductive loss): fork on the mastoid, then 2.5 cm from the ear. <b>Negative</b> (normal) = air conduction louder than bone (AC &gt; BC). <b>Positive</b> = bone louder or longer than air = conductive loss on the tested side.</li>
<li><b>Gaze holding:</b> target 12–15" away, hold 5–15 s. Negative: moves both eyes through range, no diplopia, no nystagmus at 25–30°, &lt; 3 beats at end range. Positive: &gt; 3 beats at end range, any nystagmus at 25–30°, diplopia, or unable to reach ranges (lack of upward gaze is a central sign). End-gaze nystagmus may occur beyond 30°. Document − or + with the eye position.</li>
<li><b>DVA:</b> static acuity first (may miss 1 optotype per line); flex head 30°, oscillate at 2 Hz (10–20° each way) while reading; ≥ 3-line drop = VOR impairment. Yaw or pitch.</li>
<li><b>HIT:</b> head flexed 30°, eyes on your nose; after slow movements, a quick, small (5–10°) unexpected rotation. Negative = eyes stay on target. {{u_cn}}</li>
</ul>'''),
('3I', 'Cranial nerves IX–XII: palate, swallow, shrug and tongue',
 'IX/X: voice, palate and uvula, swallowing, gag. XI: traps and SCM. XII: tongue protrusion and strength.',
 'Tongue deviates <b>toward</b> a CN XII (LMN) lesion but <b>away from</b> a cortical or corticobulbar lesion.',
 '''<ul>
<li><b>IX/X:</b> taste sour/bitter on the posterior 1/3 (often not tested); voice hoarse or nasal; palate elevates symmetrically on "ah" (document palate normal, weak or absent; uvula midline or deviated L/R); have the patient swallow a few times and ask about difficulty, documenting impaired if you observe it (when in doubt, defer to speech therapy); gag with tongue depressor (normal = gag present; intact or absent).</li>
<li><b>XI:</b> shrug and hold against downward pressure (traps); resist cervical rotation with hands on the head, not the jaw, plus flexion and lateral flexion (SCM). Grade 0–5.</li>
<li><b>XII:</b> protrude and hold; check deviation and fasciculations; move tongue around as if clearing a bolus; push against each cheek against your resistance; lift toward the roof against a tongue depressor. Note dysarthria: slow or slurred speech.</li>
<li><b>Documentation:</b> list which nerves were tested; if screened and normal, e.g., "Cranial nerves II–IX, XI, XII intact". {{u_cn}}</li>
</ul>'''),
('3J', 'Visual field defects by lesion site',
 'Anterior to the chiasm, one eye is affected. At the chiasm, both temporal fields go. Behind the chiasm, the same side of both fields goes (homonymous), opposite the lesion.',
 'A right optic tract <b>or</b> right occipital lobe lesion both give a <b>left homonymous hemianopia</b>. Optic radiation lesions give <b>quadrant</b> cuts instead of half-field cuts.',
 '''<ol>
<li>Complete right optic nerve lesion → total blindness of the right eye.</li>
<li>Midline chiasmal lesion → loss of both temporal half-fields (labeled "bipolar hemianopia" in the source figure).</li>
<li>Right perichiasmal lesion → right nasal hemianopia.</li>
<li>Right optic tract lesion or pressure → left homonymous hemianopia.</li>
<li>Lower right optic radiations → left homonymous inferior quadrantanopia.</li>
<li>Upper right optic radiations → left homonymous superior quadrantanopia.</li>
<li>Right occipital lobe → left homonymous hemianopia.</li>
</ol><p>{{u_exam}} <span class="gaptag">Source conflict</span> The radiation-to-quadrant pairings above follow the source figure as labeled; verify them against your neuroanatomy text.</p>'''),
])

# ---------------- TOPIC 4 ----------------
topic('4', 'Motor control & sensation', 'Topic 4 · Tone, motor control, coordination &amp; somatosensation',
 'Spasticity vs rigidity · MAS · selective vs patterned movement · synergies · UMCT · cerebellar tests · sensory testing', [
('4A', 'Tone, spasticity and rigidity',
 'Tone is the neuromuscular activity present during passive movement. Spasticity depends on velocity; rigidity doesn\'t.',
 'Spasticity = <b>velocity- and amplitude-dependent</b>, "catch" or "clasp-knife", often unequal in agonist and antagonist, corticoreticulospinal (pyramidal) damage. Rigidity = <b>constant</b> through range, equal in both, "lead pipe" or "cogwheel", extrapyramidal (usually basal ganglia).',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:20%"><col style="width:40%"><col style="width:40%"></colgroup>
<thead><tr><th>Feature</th><th>Spasticity</th><th>Rigidity</th></tr></thead><tbody>
<tr><td class="name">Type</td><td>Hypertonia</td><td>Hypertonia</td></tr>
<tr><td class="name">Dependence</td><td>Amplitude- and velocity-dependent</td><td>Constant through ROM</td></tr>
<tr><td class="name">Feel</td><td>"Catch", "clasp-knife"</td><td>"Lead pipe", "cogwheel"</td></tr>
<tr><td class="name">Agonist vs antagonist</td><td>Often unequal</td><td>Equal in both (co-contraction)</td></tr>
<tr><td class="name">Lesion</td><td>Corticoreticulospinal (pyramidal) tracts</td><td>Extrapyramidal pathways, usually basal ganglia; also mesencephalon and spinal cord lesions</td></tr>
</tbody></table></div><p>{{u_exam}}</p>'''),
('4B', 'Testing tone and grading it with the Modified Ashworth Scale',
 'Supported supine; slow stretch for tone, quick stretch from the shortened range for spasticity; test the less-affected side first for a baseline.',
 'Document the <b>muscle group</b>, not the motion: "hypertonicity in L elbow flexors", not "in L elbow flexion". MAS 1 vs 1+: 1+ has a catch <b>followed by</b> minimal resistance through less than half the range.',
 '''<ul>
<li><b>Tone:</b> elongate slowly through range. <b>Spasticity:</b> start at the end of the shortened range and elongate quickly. Note resistance; test bilaterally. {{masi08}}</li>
<li>Grade as normal, decreased/hypotonic, or increased/hypertonic; MAS measures tone and spasticity. {{u_exam}}</li>
</ul>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:14%"><col style="width:86%"></colgroup>
<thead><tr><th>MAS</th><th>Description</th></tr></thead><tbody>
<tr><td class="name">0</td><td>No increase in tone</td></tr>
<tr><td class="name">1</td><td>Slight increase: catch and release, or minimal resistance at end of ROM</td></tr>
<tr><td class="name">1+</td><td>Slight increase: catch, then minimal resistance through the remainder (less than half) of ROM</td></tr>
<tr><td class="name">2</td><td>More marked increase through most of ROM, but the part moves easily</td></tr>
<tr><td class="name">3</td><td>Considerable increase; passive movement difficult</td></tr>
<tr><td class="name">4</td><td>Rigid in flexion or extension</td></tr>
</tbody></table></div><p>{{bohan87}}</p>'''),
('4C', 'Selective vs patterned movement, and the four synergies',
 'Selective = one joint moves without unplanned motion elsewhere (fractionated). Patterned = muscle groups fire together in stereotyped flexion or extension synergies.',
 'If a muscle shows patterned movement, <b>MMT is not appropriate</b>. Strongest components: UE flexion = <b>elbow flexion</b>; UE extension = <b>shoulder adduction and forearm pronation</b>; LE flexion = <b>hip flexion</b>; LE extension = <b>hip adduction, knee extension, ankle PF</b>.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:22%"><col style="width:39%"><col style="width:39%"></colgroup>
<thead><tr><th>Synergy</th><th>Flexion</th><th>Extension</th></tr></thead><tbody>
<tr class="grp"><td colspan="3">Upper extremity</td></tr>
<tr><td class="name">Scapula</td><td>Elevation, retraction</td><td>Protraction</td></tr>
<tr><td class="name">Shoulder</td><td>Abduction, ER</td><td><b>Adduction</b>, IR</td></tr>
<tr><td class="name">Elbow</td><td><b>Flexion</b></td><td>Extension</td></tr>
<tr><td class="name">Forearm</td><td>Supination</td><td><b>Pronation</b></td></tr>
<tr><td class="name">Wrist / fingers</td><td>Flexion / flexion</td><td>Flexion / flexion</td></tr>
<tr class="grp"><td colspan="3">Lower extremity</td></tr>
<tr><td class="name">Hip</td><td><b>Flexion</b>, abduction, ER</td><td>Extension, <b>adduction</b>, IR</td></tr>
<tr><td class="name">Knee</td><td>Flexion</td><td><b>Extension</b></td></tr>
<tr><td class="name">Ankle</td><td>Dorsiflexion (inversion)</td><td><b>Plantarflexion</b> (inversion)</td></tr>
<tr><td class="name">Toes</td><td>Dorsiflexion/extension</td><td>Plantarflexion/flexion</td></tr>
</tbody></table></div>
<p>Bold = strongest component. {{sathian11,fell18,u_exam}}</p>
<ul><li><b>Equinovarus:</b> ankle inverted, forefoot supinated. <b>Associated reactions:</b> involuntary contractions that occur with other voluntary effort, usually under stress.</li></ul>'''),
('4D', 'Documenting patterned vs selective movement, and the Fugl-Meyer',
 'Document joint by joint within each synergy direction, and only give an MMT grade where movement is selective.',
 'FMA UE MDC: <b>3.2</b> points total; <b>1.7</b> proximal; <b>1.7</b> hand/wrist.',
 '''<ul>
<li><b>Narrative:</b> "Motor control: L LE flexion: selective at hip, patterned at knee and ankle. L LE extension: patterned at hip, knee and ankle. MMT: L hip flexion 4/5."</li>
<li><b>Table form:</b> rows for L LE flexion and extension; columns hip, knee, ankle; each cell "selective (MMT 4/5)" or "patterned". {{u_exam}}</li>
<li><b>Fugl-Meyer Assessment:</b> post-stroke hemiparesis; recommended by StrokEDGE; UE and LE versions; formal assessment of patterned vs selective movement; most used in research; based on Brunnstrom stages. {{see13}}</li>
</ul>'''),
('4E', 'Upright Motor Control Test: purpose, setup and grading',
 'The UMCT tests voluntary control of the hemiparetic LE in upright, simulating gait. Flexion control (parts 1–3) = swing limb. Extension control (parts 4–6) = single-limb stance.',
 'Grades are <b>Weak / Moderate / Strong</b> (plus Excessive and Unable to Test for extension). Up to 2 practice trials, then <b>one graded trial</b> per segment. Ankle dorsiflexion has <b>no Moderate</b> grade.',
 '''<ul>
<li><b>Point of the test:</b> to identify <b>patterned</b> movement. Cue "soft knees" (don\'t lock the knees out) during standing. {{u_exam}}</li>
<li><b>Indications:</b> CNS lesions with patterned movement or spasticity. Identifies the muscle groups most impaired in producing sufficient force or speed during stance or swing. The knee subtest can predict walking ability. {{u_exam,tajane22}}</li>
<li><b>Setup:</b> examiner plus an assistant; patient must understand instructions and need no more than one person\'s assistance for single- or double-limb stance. {{hislop95}}</li>
<li><b>Flexion (3 reps, "as high and as fast as you can"):</b> hip and knee: W = &lt; 30° or &gt; 10 s for 3 reps; M = 30–60° ×3 in 10 s; S = &gt; 60° ×3 in 10 s. Ankle DF: W = &lt; 90° or &gt; 10 s; S = DF to a right angle or more ×3 in 10 s.</li>
<li><b>Hip extension:</b> stand on the test limb; examiner reduces hand support. W = uncontrolled trunk flexion; M = can\'t hold fully erect but stops forward momentum, wobbles, or hyperextends trunk; S = trunk erect.</li>
<li><b>Knee extension:</b> both knees at 30°, lift the stronger limb. W = continues to collapse; M = holds flexed knee without further collapse or heel rise; S = holds, then straightens on request; E = can\'t flex due to extensor thrust/tone; UT = no plantigrade foot. Knee flexion contracture caps the grade at M.</li>
<li><b>Ankle PF:</b> knee at 0°, then heel rise. W = knee collapses/wobbles or extensor thrust; M = knee 0° and ankle 90° with vertical tibia; S = heel rise with knee at 0°; E = severe equinus or varus prevents a stable plantigrade ankle; UT = knee flexion contracture.</li>
<li><b>Reliability:</b> 96% agreement (flexion), 90% (extension); gait prediction validity not established in this source. {{hislop95}}</li>
</ul>'''),
('4F', 'Cerebellar and coordination tests, and grading coordination',
 'Match each test to the impairment it shows: dysmetria, tremor, ataxia; dysdiadochokinesia; rebound; dysarthria.',
 'Rebound: resist 90° elbow flexion and release suddenly. Abnormal = no antagonist contraction to stop the ballistic motion → "+ rebound phenomenon".',
 '''<ul>
<li><b>Finger-to-nose / heel-to-shin</b> (also heel to knee, heel to examiner\'s hand): dysmetria (over/undershoot), tremor (oscillations), ataxia.</li>
<li><b>Rapid alternating movements</b> (finger-thumb tap, pronation/supination, toe tap, heel tap): dysdiadochokinesia.</li>
<li><b>Speech:</b> impaired intelligibility = dysarthria; SLP for formal assessment. {{u_exam}}</li>
<li><b>Motor control tests and measures</b> overall: tone/spasticity, reflexes, selective vs patterned movement, UMCT, MMT, cerebellar tests, coordination, and qualitative observation. {{u_exam}}</li>
</ul>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:12%"><col style="width:88%"></colgroup>
<thead><tr><th>Grade</th><th>Description</th></tr></thead><tbody>
<tr><td class="name">5</td><td>Normal performance</td></tr>
<tr><td class="name">4</td><td>Minimal impairment: slightly slow; supervision/minimal contact guarding</td></tr>
<tr><td class="name">3</td><td>Moderate: slow, awkward, unsteady; moderate contact guarding</td></tr>
<tr><td class="name">2</td><td>Severe: initiates only, without completion; maximal contact guarding</td></tr>
<tr><td class="name">1</td><td>Activity impossible</td></tr>
</tbody></table></div><p>{{lanzino12}}</p>'''),
('4G', 'Somatosensory testing technique and grading',
 'Bare skin, relaxed and supported, demonstrate with eyes open on an intact area, then occlude vision and test with random timing.',
 'Unilateral deficits: test the <b>intact side first</b>. Bilateral (e.g., neuropathy): start at the <b>suspected impaired area</b> and move toward intact. With CNS lesions, go <b>distal to proximal</b>. Intact vs impaired both need &gt; 80% accuracy; impaired responses are delayed or feel duller.',
 '''<ul>
<li><b>Modalities:</b> light touch, protective sensation, graphesthesia, stereognosis, sharp/dull, vibration, proprioception.</li>
<li><b>Technique:</b> supported, relaxed, bare skin; instruct with eyes open on a known intact area and check understanding; remove vision; minimize extra input (clothing, sheets); random timing; systematic, distal to proximal. {{u_exam}}</li>
</ul>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:18%"><col style="width:22%"><col style="width:60%"></colgroup>
<thead><tr><th>Grade</th><th>Stimuli</th><th>Description</th></tr></thead><tbody>
<tr><td class="name">Intact</td><td>3–5, up to 10</td><td>Accurate (&gt; 80%), prompt</td></tr>
<tr><td class="name">Impaired</td><td>3–5, up to 10</td><td>Accurate (&gt; 80%) but delayed; duller; or hypersensitive</td></tr>
<tr><td class="name">Absent</td><td>3–5, up to 10</td><td>Doesn\'t feel, or inaccurate (&lt; 80%)</td></tr>
<tr><td class="name">NT</td><td>—</td><td>Not tested</td></tr>
</tbody></table></div><p>{{han16,u_exam}}</p>'''),
('4H', 'Specific sensory tests: from light touch to joint position',
 'Each modality has its tool and a trap: don\'t drag the cotton, use a safety pin (not a pinwheel), use a 128 Hz fork on bone.',
 'Joint position: grip the <b>lateral borders</b> or bony prominences, test one joint at a time, start with large arcs and progress to small, avoid end range, randomize direction and timing (10 reps).',
 '''<ul>
<li><b>Graphesthesia:</b> draw letters or numbers on the skin. <b>Stereognosis:</b> place an object in the hand to identify.</li>
<li><b>Light touch:</b> cotton ball or tissue; touch, don\'t drag.</li>
<li><b>Sharp/dull:</b> safety pin opened wide, not a pinwheel. Precautions: diabetes, poor arterial circulation, lymphedema.</li>
<li><b>Vibration:</b> 128 Hz tuning fork on bony prominences.</li>
<li><b>Proprioception:</b> joint position test as above (or have them estimate position); <b>joint space mirroring</b>: you move one side passively and the patient mirrors with the other limb. {{han16,u_exam}}</li>
</ul>'''),
])

# ---------------- TOPIC 5 ----------------
topic('5', 'Speech, cognition & swallow', 'Topic 5 · Speech, language, cognition &amp; swallowing',
 'SLP scope · attention and memory · executive function · motor speech · aphasia · dysphagia · when to refer', [
('5A', 'The "Big 9" areas of speech-language pathology',
 'Nine domains, from cognitive-communication to aural rehabilitation. Knowing them tells you what to refer.',
 '<b>Motor speech</b> (apraxia, dysarthria) is articulation. <b>Receptive and expressive language</b> (aphasia) is reading, writing, speaking and listening.',
 '''<ul>
<li><b>Cognitive-communication:</b> memory, attention, problem-solving, organization, decision-making.</li>
<li><b>Social communication</b> (pragmatics: social rules, taking turns, position); <b>motor speech</b> (articulation and the movements for speech sounds: apraxia, dysarthria); <b>receptive and expressive language</b> (reading comprehension, writing, verbal expression, auditory comprehension: aphasia); <b>AAC</b> (augmentative and alternative communication: modalities other than speech); <b>feeding and swallowing</b> (suck, chew, swallow: dysphagia); <b>voice and resonance</b> (hoarse, too quiet, nasal, mute, painful, or a voice that doesn\'t match the person); <b>fluency</b> (rate and smoothness of speech: stuttering, cluttering); <b>aural rehabilitation</b> (communication affected by being Deaf or hard of hearing). {{asha_slp}}</li>
<li><b>Common medical diagnoses:</b> acquired brain injury (stroke, TBI, concussion), PD, ALS, PSP, MS, Alzheimer disease and other dementias including primary progressive aphasia, other neurodegenerative diseases, viral diseases (long COVID, Guillain-Barré), bypass surgery, anoxia, head/neck, brain and lung cancer, intubation trauma, metabolic encephalopathy, vocal pathologies, airway disorders (tracheostomy, laryngectomy), aging, general weakness, FND. {{u_slp}}</li>
<li>PT and SLP work as a team: know the signs, communicate effectively with people with aphasia, and know when to refer. {{u_slp}}</li>
</ul>'''),
('5B', 'Cognitive-communication deficits and what to rule out first',
 'Post-stroke cognitive impairment affects about 60% in the first year. Before judging cognition, account for sensory, baseline and state factors.',
 'Consider <b>vision and hearing</b>, baseline communication level and education, fatigue, meds, pain, personality, mood, motivation and self-efficacy before labeling a cognitive deficit.',
 '''<ul>
<li><b>PSCI</b> in ~60% in the first year. {{husseini23}}</li>
<li>Deficit areas: memory, attention, executive function, reasoning, safety awareness and judgment. Also consider mental endurance, processing speed, insight/anosognosia and initiation.</li>
<li>Cognition is a complex, multi-layered, non-linear, dynamic system that integrates perception, memory, emotion, language and reasoning into context-sensitive, adaptive thought; it allows metacognition and is affected by emotion.</li>
<li><b>Consider before judging:</b> vision and hearing (baseline and new changes; can they self-advocate?); baseline daily communication level, demands, use and needs (education); fatigue; meds; pain; personality; mood, motivation, desire and self-efficacy. Why it matters: everyone can present differently. {{u_slp}}</li>
</ul>'''),
('5C', 'Attention types and memory systems',
 'Attention runs from sustained (basic vigilance) to divided (multitasking). Memory splits into short-term, working and long-term, and long-term into declarative and non-declarative.',
 'Short-term memory holds <b>7 ± 2</b> items. Working memory also <b>manipulates</b> them (prefrontal cortex). Procedural memory is <b>non-declarative</b>.',
 '''<p><b>Attention</b> = focusing on an object, person or activity at the expense of other information. It is biased, fragile, capacity-limited, changes across life, is needed for learning, and is pulled by internal and external distractions. {{u_slp}}</p>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:24%"><col style="width:46%"><col style="width:30%"></colgroup>
<thead><tr><th>Attention</th><th>Description</th><th>Example</th></tr></thead><tbody>
<tr><td class="name">Sustained</td><td>Most basic vigilance; maintain consistent performance</td><td>Attending to a talk</td></tr>
<tr><td class="name">Focused/selective</td><td>Prioritize features despite competing stimuli</td><td>Conversation in a noisy café</td></tr>
<tr><td class="name">Switching</td><td>Move focus quickly and flexibly between tasks</td><td>Writing, answering a call, back to notes</td></tr>
<tr><td class="name">Divided</td><td>Attend to several tasks at once; some argue it rarely works</td><td>Driving while on the phone</td></tr>
</tbody></table></div>
<ul>
<li><b>Memory</b> = storing, retaining and retrieving processed information; it can fade and distort over time, reactivation strengthens it, and parts can be deliberate and effortful or automatic.</li>
<li><b>Flow:</b> sensory input → sensory memory → (attention) → short-term memory, kept by maintenance rehearsal → (encoding) → long-term memory → (retrieval) back to short-term. Unattended information is lost from sensory memory, unrehearsed information from short-term memory, and some is lost from long-term memory over time.</li>
<li><b>Short-term memory:</b> transient storage of 7 ± 2 items (recall a number string). <b>Working memory:</b> temporary storage plus manipulation; fragile; prefrontal cortex; the executive component or supervisor; capacity-limited (mental math, problem-solving, composing sentences).</li>
<li><b>Long-term, declarative</b> (explicit, "our knowledge"; stored and accessed consciously, needs active thought): semantic (facts, context-independent), episodic (events, context-dependent, autobiographical), prospective (tasks to recall in the future).</li>
<li><b>Long-term, non-declarative</b> (implicit; stored unconsciously, changes behavior, triggered automatically by prior experience): procedural (skills and habits: typing, tying shoes, riding a bike; cognitive skills like arithmetic); priming (an unconscious environmental trigger, e.g., a food ad leading to buying that food); classical conditioning (stimulus-response learning, emotional and skeletal). {{u_slp}}</li>
</ul>'''),
('5D', 'Executive function and the three core EF skills',
 'EF is a set of high-level supervisory abilities that generate, plan and monitor goal-directed behavior. Picture cognition as a building with attention as the foundation.',
 'The three core EF skills: <b>inhibitory control</b>, <b>working memory</b> and <b>cognitive flexibility</b>.',
 '''<ul>
<li><b>Definition:</b> a set of high-level, interrelated supervisory abilities for generating, selecting, planning and monitoring goal-directed, adaptive responses; it initiates and sustains independent, purposeful or novel behavior; metacognition is thought to be essential to it. EF processes are performed in the <b>frontal lobe</b>.</li>
<li><b>EF wheel (5):</b> planning and organizing; flexible thinking; problem solving; inhibition and self-regulation; insight and awareness.</li>
<li><b>Building metaphor:</b> foundation = attention (cracks make every floor shaky); lobby = processing; next floor = memory (depends on attention and processing); higher floors = organization, problem-solving, reasoning; penthouse = higher EF; elevator = working memory (limited space, constantly moving, nothing lives there); maintenance crew = the 3 core EF skills.</li>
<li><b>Inhibitory control:</b> response inhibition (behavioral self-control) and interference control (selective attention, cognitive inhibition).</li>
<li><b>Working memory:</b> monitoring, updating, temporary storage and manipulation.</li>
<li><b>Cognitive flexibility:</b> shifting perspective, creative thinking, adapting to change. {{u_slp,schwabish26}}</li>
</ul>'''),
('5E', 'Pragmatic (social communication) problems',
 'Pragmatics is the social use of language. Problems show up in humor, inference, topic management, amount of talk, reading the room and nonverbal cues.',
 '<b>Confabulation</b> = fabricated information that is <b>not on purpose</b>; it reflects a memory breakdown.',
 '''<ul>
<li>Humor and nonliteral language; inferencing (implied info, ambiguity); topic management (too few or too many topics, switching, disorganized).</li>
<li>Talking too much or too little (tangential details, abandoned thoughts); "reading the room"; confabulation; egocentric/over-personalized output.</li>
<li>Nonverbal: flat affect, decreased eye contact, inappropriate gestures or distance. {{u_slp}}</li>
</ul>'''),
('5F', 'Apraxia of speech vs dysarthria',
 'Apraxia of speech is a <b>planning</b> (motor programming) problem. Dysarthria is an <b>execution</b> problem from weakness, abnormal tone or incoordination of speech muscles.',
 'Apraxia errors are <b>inconsistent</b> (better when automatic; groping; high awareness). Dysarthria errors are <b>predictable and consistent</b> across contexts.',
 '''<ul>
<li><b>Apraxia of speech:</b> difficulty volitionally positioning, planning and sequencing speech movements; not due to weakness, slowness or discoordination; high awareness and frustration; inconsistent (may be fine when automatic); trial and error; groping; repetition helps; rarely isolated; minimal to profound; hard to separate from non-fluent aphasia, dysarthria and acquired stuttering.</li>
<li><b>Dysarthria:</b> "slurred speech" from weakness, abnormal tone, incoordination or imprecise movement of the speech muscles; affects respiration, phonation, articulation, prosody, resonance. Types: flaccid, spastic, hypokinetic, ataxic, hyperkinetic, mixed, unilateral UMN. Ranges from very mild to unintelligible. Often accompanied by dysphagia. <span class="mine">inference</span> {{u_slp}}</li>
<li><b>Prosody</b> (the rise and fall of speech) is carried by loudness and pitch, and it conveys meaning and emotion. {{u_slp}}</li>
</ul>'''),
('5G', 'Aphasia: what it is, what it isn\'t, and fluent vs non-fluent',
 'Aphasia is an acquired disruption of using and understanding language after neurological injury, typically left hemisphere, across reading, writing, listening and speaking.',
 'Non-fluent = effortful, aware, short telegraphic phrases, often with apraxia/dysarthria. Fluent = effortless, poor insight, long empty sentences, neologisms, word salad.',
 '''<ul>
<li><b>Not aphasia:</b> sensory deficits, agnosia, motor impairment, dysarthria, apraxia, diffuse cognitive impairment, dementia, confusion, occasional word-finding problems (though these can co-occur). Not usually applied to TBI, right-hemisphere damage or dementia, where cognition is the root cause.</li>
<li><b>Stats:</b> ~1 million in the US; 80,000 new per year; 20–40% of acute stroke survivors; 6 months after stroke, about 20% of ischemic stroke survivors aged 65 and older (excluding primary progressive aphasia and tumor). {{u_slp}}</li>
<li><b>A survivor\'s view</b> (a neuroanatomist with aphasia after a left-hemisphere stroke, paraphrased): speaking louder doesn\'t help; come closer, speak slowly and clearly, and treat the person as injured, not unintelligent; they are still in there.</li>
<li>Why the receptive vs expressive split is a poor fit: most people with aphasia have some of both, so the label hides the real profile. <span class="mine">inference</span></li>
</ul>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:50%"><col style="width:50%"></colgroup>
<thead><tr><th>Fluent</th><th>Non-fluent</th></tr></thead><tbody>
<tr><td>Effortless; decreased insight; articulation usually WNL; normal or long phrases; few, short pauses; long sentences with few content words; empty speech, word salad; word replacements; neologisms</td><td>Effortful; aware and frustrated; usually concomitant apraxia/dysarthria; short phrases; frequent long pauses; telegraphic; meaningful content words with few function words; mostly sound errors</td></tr>
</tbody></table></div>
<ul><li><b>Global aphasia:</b> significant impairment in all modalities; larger anterior and posterior lesions; most common type in acute stroke. Payers may read it as a poor prognosis and deny treatment. {{u_slp}}</li></ul>'''),
('5H', 'Aphasic error types and how to communicate with a person with aphasia',
 'Name the error: anomia, jargon, neologism, phonemic vs semantic paraphasia, telegraphic speech. Then adapt how you talk.',
 '<b>Phonemic</b> paraphasia swaps sounds ("wishdasher"). <b>Semantic</b> paraphasia swaps words ("table" for "bed"). People with aphasia can look like they understand everything, because intonation and context are processed by the intact right hemisphere.',
 '''<ul>
<li><b>Comprehension:</b> needs extra time; trouble with long, rapid or complex grammar (passive sentences), without visual support (phone), nonliteral language, competing conversation; lacks error awareness.</li>
<li><b>Expression:</b> anomia (difficulty retrieving words); jargon/word salad (fluent but meaningless, real words lacking semantic meaning); neologisms (novel, unrecognizable words); phonemic and semantic paraphasias; telegraphic speech (omitting function words like "the", "of", "was"); grammatical errors; halting, effortful speech; single words or short, fragmented phrases.</li>
<li><b>Agraphia</b> (written expression): trouble writing, typing or copying letters, words and sentences; single words only; letter or word substitutions; nonmeaningful syllables; incorrect grammar; letter formation. <b>Alexia</b> (reading comprehension): trouble recognizing words by sight, understanding written material from letters to books, sounding out words, function words (articles, prepositions, pronouns); misreading meaning ("couch" read as chair); slow and effortful.</li>
<li><b>Communication tips:</b> quiet, fewer distractions, breaks for fatigue or frustration; relax and don\'t show concern about errors; allow time; speak as to a competent adult, not as to a child or someone deaf or cognitively impaired, and don\'t speak for them; verify ("I heard you say ___. Is that right?"); don\'t pretend to understand.</li>
<li><b>If they didn\'t understand:</b> repeat, simplify, or say it another way; ask the same question several ways (yes/no may be inconsistent); short, concise speech; don\'t bombard; simple direct words without figures of speech; emphasize key words.</li>
<li><b>Encourage all modes:</b> speaking, writing, drawing, yes/no, gestures, facial expressions. If stuck on a word: deep breath and retry; ask what it looks like, where it\'s found, what it\'s used for; ask if it\'s OK to come back to it; be kind and patient.</li>
<li><b>AAC</b> uses residual language abilities and trains partners in <b>augmented input</b> to aid comprehension; offer written or visual choices so the person can show preferences, ideas and feelings (gestures, writing, pointing, books, devices); it isn\'t one-way and isn\'t the last step. {{asha_slp,u_slp}}</li>
<li><b>SLP goals with a person with aphasia:</b> maximize function; improve quality of life; assess emotional adjustment within scope; make family and friends better communication partners; help each person be the best communicator they can be with aphasia. Resource: the Aphasia Institute\'s Supported Conversation for Adults with Aphasia (free; moderate to severe aphasia). {{u_slp}}</li>
</ul>'''),
('5I', 'Dysphagia: stages, stats, warning signs and silent aspiration',
 'Swallowing has 4 stages. Stroke is the most common cause of neurogenic dysphagia, and about half of people with dysphagia can aspirate silently.',
 'Warning signs include a <b>wet voice after swallowing</b>, fevers after eating, and recurrent pulmonary infections. MBSS and FEES are the instrumental tests.',
 '''<ul>
<li><b>Why it matters:</b> early diagnosis and management improve quality of life and may prevent or delay death.</li>
<li><b>Stages:</b> oral preparatory, oral transit/propulsion, pharyngeal, esophageal. ~50 pairs of striated cranial muscles are excited and inhibited in sequence from mouth to stomach; dysphagia is an impairment of this sensorimotor system.</li>
<li><b>Prevalence:</b> 400,000–800,000 neurogenic cases per year worldwide; acute stroke ~65% (most common cause); PD ~50% (other studies up to ~90%); MS ~31.3%; dementia 13–57%; motor neuron disease 30–100% depending on type, all in later stages. {{panebi20}}</li>
<li><b>Instrumental tests:</b> MBSS = modified barium swallow study; FEES = fiberoptic endoscopic evaluation of swallowing. <b>Silent aspiration</b> in ~50% of people with dysphagia: without a cough to warn you, aspiration goes unnoticed, so clinical signs and instrumental testing matter. <span class="mine">inference</span> {{u_slp}}</li>
<li><b>Risks:</b> aspiration, lung inflammation and infection, respiratory distress, dehydration and malnutrition, lung scarring, fear/avoidance, chest pain.</li>
<li><b>Warning signs:</b> coughing or throat clearing, wet voice, fevers after intake, congestion or wheezing after intake, drooling, unintentional weight loss, long meals, recurrent pneumonia, regurgitation, food sticking, fear of eating or pills.</li>
<li><b>Neurogenic changes:</b> sensation (taste, smell, numbness, pocketing), oral weakness (poor lip seal → drooling, spillage), poor coordination (timing breath with swallow, moving food), trunk and neck weakness (positioning), cognitive issues (insight, memory, attention), impulsivity (gulping, rapid eating, large bites, bites while food is still in the mouth).</li>
<li><b>Aspiration</b> = food or liquid misdirected into the lungs. Food "sticking" can come from pharyngeal weakness or discoordination, or from the esophagus (GI).</li>
<li><b>Aspiration pneumonia risk factors:</b> dependence for feeding or oral care, poor oral hygiene, limited ambulation, compromised respiration or cough, prior aspiration pneumonia, compromised immunity, GI disease, current smoking. {{u_slp}}</li>
</ul>'''),
('5J', 'Voice, fluency, depression and when to refer to SLP',
 'Refer when there is a known neuro diagnosis, signs of aspiration, frequent throat clearing, or cognitive-communication behavior you wouldn\'t expect for the person.',
 'Suicidal ideation: listen and respond; the US crisis line is <b>988</b>. Depression can limit therapy progress and cognitive performance.',
 '''<ul>
<li><b>Voice:</b> causes include ABI, PD, CN X damage (surgery or trauma of the head, neck or chest), aging (presbylarynx), head and neck cancer radiation, prolonged intubation (granulomas), reflux, stress and psychological factors, overuse, deconditioning, extensive coughing; voice therapy also serves gender affirmation. Observe quality (hoarse, strained, strangled, harsh, raspy), breath (breathy, poor support), tremor, pitch (too high or low, monotone, unstable), loudness (too loud or soft, unstable), effort, throat pain, voice loss by day\'s end, coughing or throat clearing, and a voice that doesn\'t match age, gender or identity.</li>
<li><b>Voice and upper airway:</b> tracheostomy (speaking valves, weaning), laryngectomy, paradoxical vocal fold motion, irritable larynx (behavioral cough management), respiratory exercise for speech, voice and swallow.</li>
<li><b>Neurogenic and psychogenic stuttering:</b> an acquired stuttering disorder, or the re-emergence or worsening of a resolved developmental stutter; after ABI (including concussion), progressive disease (PD) or long COVID; may resemble developmental stuttering (repetitions, prolongations, pauses, accessory behaviors) or be atypical; less common than apraxia or dysarthria.</li>
<li><b>Depression:</b> prevalent (diagnosis, loss, life changes, worry, brain chemistry changes); limits therapy progress and participation; affects cognitive performance; carries stigma; refer when needed.</li>
<li>A major social consequence of these conditions is isolation. <span class="mine">inference</span> Mild impairments matter too: a high-functioning person isn\'t having an easier time; they are just easier for others to deal with.</li>
<li><b>Refer to SLP:</b> known CVA, PD, TBI, brain tumor, head/neck cancer; signs of aspiration; excessive throat clearing and coughing; unexpected cognitive or communication behaviors. Ask whether they have seen speech therapy. {{u_slp}}</li>
</ul>'''),
('5K', 'Aphasia types by lesion site, and the stages of word retrieval',
 'Seven classic aphasia types split by where the lesion sits: in the central speech areas or their connections, or in the border zone around them.',
 'Central: <b>Broca\'s, Wernicke\'s, conduction, global</b>. Border zone (watershed): <b>transcortical motor, transcortical sensory, anomic</b>.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:30%"><col style="width:22%"><col style="width:48%"></colgroup>
<thead><tr><th>Type</th><th>Group</th><th>Lesion site</th></tr></thead><tbody>
<tr><td class="name">Broca\'s</td><td>Central</td><td>Inferior frontal</td></tr>
<tr><td class="name">Wernicke\'s</td><td>Central</td><td>Posterior superior temporal</td></tr>
<tr><td class="name">Conduction</td><td>Central</td><td>Perisylvian, between Broca\'s and Wernicke\'s areas (arcuate region)</td></tr>
<tr><td class="name">Global</td><td>Central</td><td>Large perisylvian lesion, anterior and posterior</td></tr>
<tr><td class="name">Transcortical motor</td><td>Border zone</td><td>Frontal, around Broca\'s area</td></tr>
<tr><td class="name">Transcortical sensory</td><td>Border zone</td><td>Posterior temporo-parietal, around Wernicke\'s area</td></tr>
<tr><td class="name">Anomic</td><td>Border zone</td><td>Scattered temporo-parietal</td></tr>
</tbody></table></div><p>The classification is used by both SLP and neurology. {{u_slp}}</p>
<p><b>Word retrieval, in order:</b></p>
<ol>
<li><b>Semantic concept</b>: the idea (an apple).</li>
<li><b>Lemma / lexical item</b>: the word with its base and inflections (apple, apples).</li>
<li><b>Phonological code</b>: the word\'s sound representation.</li>
<li><b>Phonological word</b>: the motor plan for the sounds.</li>
<li><b>Articulatory score</b>: execution as the spoken word.</li>
</ol><p>A semantic paraphasia points to an early stage; phonemic errors to the sound stages; apraxia of speech to the motor plan; dysarthria to execution. <span class="mine">inference</span> {{u_slp}}</p>'''),
])

# ---------------- TOPIC 6 ----------------
topic('6', 'Ther ex & PNF', 'Topic 6 · Therapeutic exercise, aerobic training &amp; PNF',
 'Aerobic priming · HIIT dosing after stroke · PD and MS · developmental positions · PNF techniques', [
('6A', 'General exercise principles for neurologic populations',
 'Aerobic exercise primes the brain for motor learning. Strength training is effective and supported. Make it task-specific, and dose with FITT.',
 'Aerobic exercise has <b>direct</b> effects (neurotrophic factors such as BDNF, neurotransmitters, neuroplasticity) and <b>indirect</b> effects (fitness, blood flow, less inflammation), both feeding brain health.',
 '''<ul>
<li><b>Aerobic:</b> priming for motor learning and functional intervention; an aerobic bout raises BDNF (cerebral cortex, hippocampus, cerebellum, spinal cord), supporting LTP and dendrite formation in movement and learning circuits, which primes the response to motor training. {{mang13}}</li>
<li><b>Effects on brain health:</b> indirect: ↑ cardiorespiratory and muscular fitness → ↓ systemic and CNS inflammation and ↑ cerebral blood flow. Direct: ↑ neurotrophic factors (BDNF, NT-3) → ↑ neuroplasticity, neurogenesis and neuroprotection; ↑ neurotransmitters (dopamine, serotonin). Result: ↑ cognitive function (learning, memory, attention), ↑ mood, ↑ arousal, ↓ neurodegeneration. {{mang13}}</li>
<li><b>Strength/resistance:</b> evidence supports it in neurological disorders; maximizes functional capacity; prevents or reverses inactivity effects and comorbidities.</li>
<li><b>Task-specific and functional</b>; <b>FITT</b> = frequency, intensity, time, type. {{u_ther}}</li>
</ul>'''),
('6B', 'Stroke: resistance training and HIIT dosing',
 'After stroke, resistance and high-intensity training help in both acute and chronic stages. HIIT improves functional, cardiovascular and neuroplastic outcomes.',
 'High intensity = <b>60–80%</b> of max strength or HR max. HIIT: <b>2–5 days/week for 2–4 weeks</b>, <b>25–30 min</b> sessions, 85–95% HRR (or fastest safe walking speed).',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:22%"><col style="width:78%"></colgroup>
<thead><tr><th>HIIT (FITT)</th><th>Dosing range</th></tr></thead><tbody>
<tr><td class="name">Frequency</td><td>2–5 days per week for 2–4 weeks</td></tr>
<tr><td class="name">Intensity</td><td>Fastest safe walking speed (for mobility gains), or 85–95% heart rate reserve, or power at 90–100% VO<sub>2</sub>peak</td></tr>
<tr><td class="name">Time</td><td>Sessions 25–30 min; burst:recovery from 30 s:30–60 s up to 3 min:4 min</td></tr>
<tr><td class="name">Type</td><td>Treadmill if safe, or recumbent stepper with careful monitoring for hypotensive responses</td></tr>
</tbody></table></div>
<p>{{crozier18}} A 12-week program can improve cognition, even in chronic stroke. {{u_ther}}</p>'''),
('6C', 'Parkinson disease: exercise emphasis',
 'Moderate strength training at least 2–3×/week, moderate-to-high aerobic intensity (&gt; 60% HR max), big amplitude, rotational and reciprocal movement.',
 'Aerobic exercise primes dopamine and cholinergic systems; follow it with gait, balance and dual-task training. Complex multi-task training (e.g., resistance with instability) reduced freezing of gait by up to 60%.',
 '''<ul>
<li>Moderate-intensity strength training ≥ 2–3×/week; moderate-to-high aerobic intensity (&gt; 60% HR max); large amplitude; rotational and reciprocal movements; strength vs power.</li>
<li>Aerobic exercise improved cognitive processing, quality of life and gait. {{tabak13}}</li>
<li>Aerobic exercise reorganized dopamine and cholinergic brain networks, suggesting possible disease-modifying effects. {{reimers26}}</li>
<li>Complex, multi-task exercise (adapted resistance with instability) improved cognition and freezing of gait. {{u_ther}}</li>
</ul>'''),
('6D', 'Multiple sclerosis: dosing around fatigue',
 'Combine strength and aerobic training; use interval-style bouts that switch muscle groups. Fatigue changes the dose, not whether you challenge.',
 'Fatigue changes how you dose intensity, not whether you use it. <b>Shorten bouts, don\'t eliminate challenge</b>; plan rest; let symptoms guide progression.',
 '''<ul>
<li>Strength and aerobic training improve fitness, function and quality of life; strength ≥ 2×/week at moderate intensity; aerobic exercise is beneficial without causing exacerbations. {{halab17,grazioli19,tallner12}}</li>
<li>MS fatigue is neurologic, not just muscular; heat sensitivity and recovery time matter. Shorter, intentional bouts are better tolerated; strength and function can improve without high loads; monitoring response matters more than rigid parameters.</li>
<li><b>Clinically:</b> 1) shorten duration or reps, keep the task; 2) plan rest before fatigue overwhelms performance, and use rest to return to the task; 3) progress when recovery is reasonable, pull back when it worsens. Avoiding challenge limits adaptation, reinforces fear of effort and reduces long-term participation. {{u_ther}}</li>
</ul>'''),
('6E', 'Developmental positions as functional training',
 'Developmental positions follow the natural motor sequence and give a graded ladder of mobility, stability and skill.',
 'Six reasons: replicate the motor sequence, manage spasticity, facilitate postural control/strength/balance, promote transitions, grade challenge up or down, and provide a framework for neuroplasticity.',
 '''<ul>
<li><b>Positions:</b> prone on elbows, quadruped, half-kneeling, tall kneeling, side sitting, rolling, long sitting (with and without UE support), short sitting (LEs over the edge), modified plantigrade (UEs on a surface), standing.</li>
<li><b>Stages:</b> mobility → stability → skill. {{u_ther}}</li>
</ul>'''),
('6F', 'PNF techniques: what each does and how to cue it',
 'PNF techniques are applied to patterns or postures to facilitate a desired motor response. Sort them by goal: mobility or stability.',
 'Stability techniques: <b>rhythmic stabilization</b> and <b>dynamic reversals with a hold</b>. Everything else here is for mobility. Limit repeated stretch to <b>3–4 per pattern</b>.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:20%"><col style="width:36%"><col style="width:22%"><col style="width:22%"></colgroup>
<thead><tr><th>Technique</th><th>Description</th><th>Goals</th><th>Verbal cue</th></tr></thead><tbody>
<tr><td class="name">Rhythmic initiation</td><td>PROM → AAROM → AROM → resisted → independent; therapist does the return motion</td><td>Initiation, mobility, teach the pattern, coordination, timing; a great place to start treatment</td><td>"Relax and let me move you… now move with me… now help a little more… now I\'ll resist you"</td></tr>
<tr><td class="name">Dynamic (slow) reversals</td><td>Resisted rhythmic concentric agonist/antagonist contractions, no relaxation; begin with the antagonist</td><td>Mobility, strength, ROM, endurance, smooth reversals; a hold at the end before reversing promotes stability</td><td>"Push against me, I\'m going to resist you"</td></tr>
<tr><td class="name">Rhythmic stabilization</td><td>Alternating isometrics, no motion, no relaxation; build resistance gradually; slide hands to change the pressure direction; may approximate first</td><td>Stability, co-contraction, balance, postural control</td><td>"Don\'t let me move you"; "Hold"</td></tr>
<tr><td class="name">Repeated stretch (through range)</td><td>Repeated stretch reflex during resisted motion</td><td>AROM, strength, reduce fatigue, guide direction</td><td>"And pull"; "and push"</td></tr>
<tr><td class="name">Combination of isotonics</td><td>Concentric, isometric and eccentric of the same agonists without relaxation</td><td>Controlled mobility, coordination, ↑ AROM, ↑ strength, functional eccentric control</td><td>"Push/pull, hold, let me move you slowly"</td></tr>
<tr><td class="name">Replication</td><td>Start at the end position, resist and hold, move back passively, return; increase distance</td><td>Teach the final position; motor learning of a task</td><td>"Hold", "relax", "move to starting position"</td></tr>
</tbody></table></div><p>{{u_ther}}</p>'''),
('6G', 'PNF diagonals: D1 and D2 flexion and extension, UE and LE',
 'Each limb has two diagonals (D1, D2), each with a flexion and an extension end. Every pattern combines flexion or extension, abduction or adduction, and rotation, and the distal joints follow the proximal ones.',
 'UE: <b>flexion patterns always go with ER and supination</b>, extension with IR and pronation. D1 flexion crosses midline (adduction, hand closes); D2 flexion goes up and out (abduction, hand opens). LE: D1 flexion = up and across with ER; <b>D2 flexion = up and out with IR</b>.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:17%"><col style="width:17%"><col style="width:26%"><col style="width:40%"></colgroup>
<thead><tr><th>UE pattern</th><th>Scapula</th><th>Shoulder</th><th>Forearm · wrist · fingers (thumb)</th></tr></thead><tbody>
<tr><td class="name">D1 flexion</td><td>Elevation, protraction (anterior elevation)</td><td>Flexion, adduction, ER</td><td>Supination · radial deviation + flexion · finger flexion, adduction (thumb adduction)</td></tr>
<tr><td class="name">D1 extension</td><td>Depression, retraction (posterior depression)</td><td>Extension, abduction, IR</td><td>Pronation · ulnar deviation + extension · finger extension, abduction (thumb abduction)</td></tr>
<tr><td class="name">D2 flexion</td><td>Elevation, retraction (posterior elevation)</td><td>Flexion, abduction, ER</td><td>Supination · radial deviation + extension · finger extension, abduction (thumb extension)</td></tr>
<tr><td class="name">D2 extension</td><td>Depression, protraction (anterior depression)</td><td>Extension, adduction, IR</td><td>Pronation · ulnar deviation + flexion · finger flexion, adduction (thumb opposition)</td></tr>
</tbody></table></div>
<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:17%"><col style="width:23%"><col style="width:27%"><col style="width:33%"></colgroup>
<thead><tr><th>LE pattern</th><th>Pelvis</th><th>Hip</th><th>Ankle · toes</th></tr></thead><tbody>
<tr><td class="name">D1 flexion</td><td>Anterior elevation</td><td>Flexion, adduction, ER</td><td>DF + inversion · toe extension</td></tr>
<tr><td class="name">D1 extension</td><td>Posterior depression</td><td>Extension, abduction, IR</td><td>PF + eversion · toe flexion</td></tr>
<tr><td class="name">D2 flexion</td><td>Posterior elevation</td><td>Flexion, abduction, IR</td><td>DF + eversion · toe extension</td></tr>
<tr><td class="name">D2 extension</td><td>Anterior depression</td><td>Extension, adduction, ER</td><td>PF + inversion · toe flexion</td></tr>
</tbody></table></div>
<ul>
<li>The elbow (UE) and knee (LE) can stay straight, flex or extend in any pattern. Each extension pattern is the exact reverse of its flexion pattern along the same diagonal. {{beckers21}}</li>
<li><b>Cues:</b> UE D1 flexion "squeeze, turn and pull up and across" (eyes and head follow the hand when used for rolling); UE D1 extension "open, turn and push down and away"; LE D1 flexion "toes up, heel up and across". {{u_roll}} UE D2 flexion "open, turn and lift up and out"; UE D2 extension "squeeze, turn and pull down and across"; LE D2 flexion "toes up, foot out, lift up and out". {{beckers21}}</li>
<li><b>Memory aids:</b> D2 flexion = drawing a sword from the opposite hip; D2 extension = putting it back. D1 flexion = bringing the hand to the opposite side of the face. <span class="mine">inference</span></li>
<li><b>Uses in this guide:</b> resisted UE D1 flexion and LE D1 flexion to facilitate rolling; chop and lift (combined bilateral UE patterns) for rolling and supine to sit; any PNF technique (rhythmic initiation, combination of isotonics, etc.) can be applied within a diagonal. {{u_roll,u_sts,u_ther}}</li>
</ul>'''),
])

# ---------------- TOPIC 7 ----------------
topic('7', 'Bed mobility & transfers', 'Topic 7 · Functional training: bed mobility, sit to stand &amp; transfers',
 'Rolling · manual cues · bridging · supine scooting · supine to sit · sit to stand · seated scooting · transfers · floor transfers', [
('7A', 'Functional task training starts with task analysis',
 'Observe an un-cued trial first, analyze the movement, then treat. Sometimes you keep the strategy; sometimes you change it.',
 'Use functional tasks not only for function but as the vehicle for <b>strengthening, ROM, coordination and timing</b>.',
 '''<ul>
<li><b>Observe</b> an un-cued trial → <b>perform</b> movement analysis (what they can do and where they struggle) → <b>treat</b>.</li>
<li>Consider individual, task and environment for every transition. {{u_roll,u_sts}}</li>
</ul>'''),
('7B', 'Rolling: movement analysis, key muscles and what changes after stroke',
 'Assess both directions, segmental vs log roll, and initiation from head, UE or LE. Healthy adults use many patterns; people post-stroke take about 3× longer and compensate.',
 'Rolling muscles: <b>SCM</b>, <b>ipsilateral pectoralis major</b>, <b>contralateral external oblique</b>, <b>contralateral rectus femoris</b>.',
 '''<ul>
<li><b>Individual:</b> weight shift, selective movement generation, multi- vs uniplanar, coupled vs individual segments, crossing midline, coordination and sequencing. <b>Environment:</b> surface type and size, distractions, lighting. <b>Task:</b> timing, clothing, covers, purpose/motivation. <b>Assess:</b> both directions; segmental vs log roll; repetitions; initiation from UE, LE or head. {{u_roll}}</li>
<li><b>Healthy adults:</b> 32 combinations of UE, head-trunk and LE patterns; most common = UE lift and reach above shoulder, LE unilateral push. {{richter89}}</li>
<li>Healthy rolling starts with sagittal spinal flexion and lateral trunk translation toward the roll, then pelvic elevation (gluteals off the mat) with lateral pelvic shift. Healthy rolling is selectively generated, multiplanar and coupled.</li>
<li><b>Post-stroke:</b> difficulty with planning and coordination. Toward the affected side, push off with the non-paretic UE and LE (pelvic and scapular elevation on the non-impaired side, forceful push/extension of the non-paretic LE); toward the non-affected side, pull with the non-paretic UE toward the edge of bed with lateral spinal flexion, the paretic side following passively; 3× longer than controls. {{zukow25}}</li>
</ul>'''),
('7C', 'Rolling: outcome measures, benefits and treatment cues',
 'Three measures include rolling: PASS, Trunk Control Test and the 30-s roll to quadruped. Treat with cues to the eyes, head, trunk and limbs.',
 '"Where the eyes, head and neck go, the trunk will follow" (irradiation). Teach rolling from the end position backward using <b>replication</b>.',
 '''<ul>
<li><b>PASS:</b> 12 items, balance in lying, sitting, standing; good for acute care; rolling to affected and non-affected side; each item scored 0–3 (0 = cannot perform, 1 = with much help, 2 = with little help, 3 = without help). {{benaim99}}</li>
<li><b>Trunk Control Test:</b> 4 items (rolling both ways, supine to sit, sitting balance) scored 0, 12 or 25; at 6 weeks post-stroke it can predict walking. {{collin90}}</li>
<li><b>30-s roll to quadruped:</b> number of alternating supine-to-quadruped rolls in 30 s; strength and strategy. {{deck25}}</li>
<li><b>Benefits:</b> functional, whole-body exercise, vestibular stimulation, lateral weight bearing, any population or setting. {{u_roll}}</li>
<li><b>Cues:</b> visual, verbal, tactile, environment, equipment. PNF D1 flexion (UE): "Follow your hand with your eyes and head… squeeze, turn and pull up and across". D1 extension: "Open, turn and push down and away". LE D1 flexion: "Toes up, heel up and across". Also resisted rolling with MC on pelvis and pecs, reverse chop, reverse lift. {{hooge09,u_roll}}</li>
</ul>'''),
('7D', 'Six kinds of manual cues',
 'Manual cues differ by what your hands are doing: telling a muscle to fire, showing direction, compressing, loading, resisting or shaping.',
 '<b>Directional</b> cues push in the direction of movement. <b>Resistance</b> pushes opposite the movement. <b>Approximation</b> compresses the joint.',
 '''<ul>
<li><b>Muscle-specific:</b> over the contracting muscle.</li>
<li><b>Directional:</b> in the direction of movement.</li>
<li><b>Approximation:</b> in the direction of compressing the joint.</li>
<li><b>Loading:</b> through the long axis.</li>
<li><b>Resistance:</b> opposite the movement.</li>
<li><b>Alignment:</b> shaping posture. {{u_fisher}}</li>
</ul>'''),
('7E', 'Bridging for function and exercise',
 'Bridging trains hip extensors and trunk control and feeds real tasks (pulling up pants, scooting). Small changes shift which muscles work.',
 'Feet <b>closer</b> to the pelvis → less hamstring (and fewer cramps). Heel lift or ankle DF → more glute max. Single-leg bridge → more trunk co-activation, more still with hip abduction.',
 '''<ul>
<li>Post-stroke bridging on a mat, a compliant air cushion or whole-body vibration all improved step length, step width and gait speed; vibration (amplitude 2–12 mm, frequency 1–25 Hz, vertical and lateral) improved most, measured with the 10-meter walk test and Figure-of-8 walk test (Yang &amp; Uhm 2020, as cited). Adding a heel lift decreases hamstring and increases glute max activation. {{u_roll}}</li>
<li>Ankle DF increases glute max; feet closer to the pelvis decrease hamstring activation (and cramps); single-leg bridge increases trunk co-activation, more with hip abduction. {{colonna25,yoon18}}</li>
<li><b>Combination of isotonics:</b> resist pelvic elevation (concentric), hold (isometric), lower slowly against your push (eccentric); hands stay in place.</li>
<li><b>Rhythmic stabilization:</b> resist rotation in the hold, hands on opposite surfaces.</li>
<li><b>Variables:</b> individual (base of support); environment (stable vs unstable surface); task (ther ex, pulling up pants, scooting sideways); resistance and manual contacts to direct the motion; external cues; adapt and progress; promote transfer; error enhancement; autonomy; enhanced expectations; random practice; implicit learning. Positions: supine on extended elbows, sitting or standing bridges. {{u_roll}}</li>
</ul>'''),
('7F', 'Supine scooting and supine to sit',
 'Supine scooting: practice all four directions, facilitating and resisting. Supine to sit is foundational for dressing and transfers, and varies by person and home setup.',
 'Supine to sit from the side: patient\'s bottom UE extended, top arm reaches over to the mat; PT hands under the shoulder and on the iliac crest; pressure through the hip toward the feet.',
 '''<ul>
<li><b>Supine scooting up</b> in 36 healthy adults aged 19–44: 6 axial, 8 UE and 6 LE versions. Most common UE = bilateral simultaneous hand push; most common LE = double push; most common overall = a <b>sit slide</b> (sit up, push back with hands and feet, lie back down). {{mount99}}</li>
<li>Problem-solve lateral toward and away from the hemiplegic side, vertical up and down; use external cues, part-to-whole, progression and regression. {{u_roll}}</li>
<li><b>Supine to sit</b> is a foundational skill for ADLs (dressing) and transfers. Ask for a trial and just observe first; the method varies by person and environment, so ask about the home setup.</li>
<li><b>Supine to sit facilitation:</b> (1) <b>ischial spin</b>: angle body and LEs toward the edge; thumbs below the clavicle, fingers on the back of the scapula, guiding it <b>forward and in toward you</b>. (2) <b>Tibia</b>: proximal tibia plus posterior scapula/trunk; pivot on the ischial tuberosity; tibial input gets the foot off the edge, trunk input is graded. (3) <b>From the side</b>: prep by bringing both knees up and rolling to the side; patient\'s bottom UE extended, top arm reaches over to the mat; PT under the shoulder and on the iliac crest; pressure through the hip toward the feet as the feet come off; graded input at the shoulder.</li>
<li><b>Other techniques:</b> <b>resistance</b>: MC on the anterior shoulders, start on an incline with heels off the mat, "push into my hands, sit up". <b>Chop</b>: MC on the anterior shoulder/UE or upper arm and wrist; patient brings hands to the therapist\'s shoulder or down toward the therapist\'s hip; the therapist moves to let the patient move. <b>Reverse lift</b>: same contacts; patient brings hands down toward their own opposite hip. {{u_sts}}</li>
</ul>'''),
('7G', 'Sit to stand and stand to sit: four phases and muscle activity',
 'Sit to stand: flexion-momentum → momentum-transfer → extension → stabilization. Stand to sit mirrors it with eccentric control throughout.',
 'Highest ground reaction force occurs at <b>buttocks lift-off</b>. In stand to sit, <b>max DF comes just before the buttocks touch</b> and max trunk flexion at contact.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:22%"><col style="width:36%"><col style="width:42%"></colgroup>
<thead><tr><th>Phase (sit to stand)</th><th>Span</th><th>Muscle activity</th></tr></thead><tbody>
<tr><td class="name">I · Flexion-momentum</td><td>Initiation to just before lift-off</td><td>Iliopsoas, abs, tibialis anterior concentric; erector spinae eccentric</td></tr>
<tr><td class="name">II · Momentum-transfer</td><td>Lift-off to max DF</td><td>Hip and knee extensors (rectus femoris, vastus lateralis, biceps femoris, glut max)</td></tr>
<tr><td class="name">III · Extension</td><td>Max DF until hips stop extending</td><td>Co-activation of hip and knee extensors; abdominals</td></tr>
<tr><td class="name">IV · Stabilization</td><td>Motion associated with stabilizing stops</td><td>Varies with sway; co-contraction for upright</td></tr>
</tbody></table></div><p>{{schenk90,fell18}}</p>
<ul><li><b>Sit to stand</b> is functional, done many times a day, and transitional.</li>
<li><b>Stand to sit:</b> I = hips and knees flex together to max DF and hip flexion (pelvis rotates forward, trunk closer to thighs than in STS; COM moves <b>posteriorly and downward</b>); II = from max DF and hip flexion until the buttocks touch (max DF just before contact, max trunk flexion at contact); III = once the buttocks touch, the hips extend: trunk extension, hip extension, PF, pelvis rotates posteriorly; IV = max hip extension with an upright trunk until the motion stops, with trunk co-contraction (abdominals and erector spinae). Controlled eccentric forces throughout. {{u_sts}}</li>
<li><b>Sitting postural control:</b> look for symmetry, weight distribution, and head, UE and LE posture; ask whether tone or weakness explains it and start hypothesizing; facilitate trunk symmetry front to back and side to side. {{u_sts}}</li></ul>'''),
('7H', 'Determinants and facilitation of sit to stand',
 'STS depends on the chair, the person and the strategy. Facilitate with hands on the trunk and femur, allowing the tibia to move forward.',
 'Phases I–II: pressure <b>anterior/inferior</b> on the trunk and femur; allow forward tibial motion. Phases III–IV: posterior and superior/anterior at the pelvis; use your forearm for hip extension.',
 '''<ul>
<li><b>Chair-related (environment):</b> height, armrests, backrests, type of chair; surface-related: size of the seated surface, compliance, angle. <b>Person-related (individual):</b> age, disease/pathology, muscle force, footwear, cognition. <b>Strategy-related (task):</b> speed, foot or trunk position, UE use and movement, terminal constraint, light conditions, fixed joint (e.g., rigid AFO), knee position, attention, training. {{janssen02}}</li>
<li><b>Manual facilitation</b> (PT sits lateral; pressure direction changes through one fluid motion): <b>phases I–II</b>: hands on the posterior trunk and distal femur pressing <b>anterior/inferior</b>; your LEs at the posterior femur and proximal tibia allow <b>forward</b> tibial motion and <b>superior</b> femoral motion. <b>Phases III–IV</b>: hands on the anterior/posterior trunk guiding <b>posterior and superior/anterior</b> at the pelvis with trunk stabilization, forearm for hip extension; your LEs move the femur <b>superior</b> and the proximal tibia <b>posterior</b>.</li>
<li><b>Other techniques:</b> manual and tactile cues, error augmentation, forced use, external focus, environmental changes, strategy changes, part-task practice of phases, combination of isotonics. {{u_sts}}</li>
</ul>'''),
('7I', 'Seated scooting: purposes and techniques',
 'Seated scooting improves sitting skill, sets up transfers and STS, and doubles as ther ex. Segmental scooting dissociates upper from lower trunk.',
 'Lateral scooting with more assist: raise the bottom only about an inch, trunk forward → lift → move; <b>the head goes opposite the hips</b>.',
 '''<ul>
<li><b>Purposes:</b> skill in sitting; optimal position for transfers and STS; ther ex for strength, timing, coordination; comfort and stability; function in their environment; segmental scooting for trunk dissociation and rotation; LE weight bearing.</li>
<li><b>Lateral, more assist:</b> PT lateral (like STS setup); UE toward the scooting side abducted if on the mat. Less assist: many choices; problem-solve.</li>
<li><b>Forward/backward symmetrical:</b> both hips at once, one-inch lift; position the UEs and LEs; facilitate trunk flexion and lift-off like STS initiation; backward is easy symmetrically.</li>
<li><b>Segmental:</b> one hip at a time; lateral weight shift and pelvic tilt, then move the unweighted side. MC at the posterior hip (forward) or anterior pelvis (backward); resistance at the proximal tibia (forward) or posterior knee (backward). {{u_tr}}</li>
</ul>'''),
('7J', 'Transfers, including toward the more involved side and to the floor',
 'Teach both directions and many surfaces; a one-sided approach isn\'t realistic. Floor transfers are a basic skill and a fall predictor.',
 'Floor transfer levels: <b>1) independent</b>, <b>2) modified assisted</b> using furniture, <b>3) unable</b>. Two parts: getting down and getting back up.',
 '''<ul>
<li><b>Transfers</b> teach safe movement between surfaces; in neurotypical people they are fast, fluid and automatic; they build independence, encourage symmetrical LE weight bearing and weight shift; early mobilization improves quality and speed of recovery.</li>
<li><b>More assist, toward the involved side:</b> (1) PT sits beside, like STS: PT\'s LE behind the patient\'s thigh, one hand on the distal femur, other arm around the posterior trunk; heels toward the target; slight lift, shift, reposition. (2) PT in front with contact on both sides of the involved proximal tibia; hands on posterior trunk as needed.</li>
<li><b>Less assist:</b> squat pivot and stand pivot, problem-solved toward the involved side. {{u_tr}}</li>
<li><b>Why transfer toward the more involved side</b> (the source leaves the list blank): weight bearing and weight shift through the involved LE, real-life transfers go both ways, it uses rather than neglects the involved side, and it builds safety for when the setup forces that direction. <span class="mine">inference</span></li>
<li><b>Floor transfers:</b> a basic independence skill, fall predictor, indicator of decreased mobility and frailty, key to safety, independence and QOL, simple performance test; should be part of routine evaluation of older adults. {{ardali19,ardali20,bergland05}}</li>
<li><b>Floor transfer sequence</b> (one way): <b>down</b>: sit at the edge of the mat → lower to half-kneeling → kneel with hands to the floor (quadruped) → turn the hips and side sit onto the floor. <b>Up with a chair</b>: quadruped near the chair → hands on the chair seat → tall kneel → half-kneel → push up → sit on the chair. {{u_tr}}</li>
</ul>'''),
])

# ---------------- TOPIC 8 ----------------
topic('8', 'UE in hemiplegia', 'Topic 8 · Upper extremity management in hemiplegia',
 'UE complications · positioning · NMES/FES · slings, splints, taping · hand opening · hypotonia vs hypertonia · weight bearing · NHPT and BBT', [
('8A', 'Hemiplegic UE: complications and guiding principles',
 'Mobilize early, prevent learned non-use, prevent shoulder pain. Distal (hand) function lags and needs early, frequent focus.',
 'Working the <b>hand</b> early creates purposeful demand for proximal motion, which <b>reduces shoulder complications</b>.',
 '''<ul>
<li><b>Conditions:</b> shoulder subluxation, hypertonia, hypotonia, spasticity, subacromial trauma, adhesive capsulitis, bursitis, shoulder-hand syndrome (CRPS), contracture/adaptive shortening.</li>
<li>Promote upright mobilization, movement and motor control of the involved side as soon as possible.</li>
<li>Up to <b>40%</b> of people post-stroke have persistent shoulder pain; <b>&gt; 70%</b> have some UE dysfunction (weakness, impaired coordination, abnormal synergies, sensory deficits), more pronounced distally because fine motor control has the highest neural control demands; hand recovery often lags proximal recovery. {{u_ue1}}</li>
<li><b>Ways we use the UE:</b> ADLs, weight bearing and support, reaching and tool use, sport, protective reactions, communication (gesture).</li>
</ul>'''),
('8B', 'Minimizing complications, and UE outcome measures',
 'Passive options protect; active options drive recovery. Measure with dexterity, grip, Fugl-Meyer and self-report.',
 'Passive: taping, slings, handling, PROM, AAROM. Active: NMES, biofeedback, supported therapies, BCI, graded motor imagery, bilateral/contralateral strengthening, forced use, constraint-induced, VR.',
 '''<ul>
<li><b>More passive:</b> taping, slings, handling techniques, PROM, AAROM.</li>
<li><b>More active:</b> NMES; biofeedback; UE-supported therapies (aquatics, mobile arm support); brain-computer interface; graded motor imagery (mirror therapy, mental imagery); bilateral or contralateral strengthening; forced use; constraint-induced therapy; virtual reality.</li>
<li><b>Tests:</b> Box and Block, Nine-Hole Peg, pinch grip, grip strength, Fugl-Meyer UE, handedness inventory, Stroke Impact Scale, AROM/PROM. {{u_ue1}}</li>
</ul>'''),
('8C', 'Positioning the hemiplegic UE in bed and in a wheelchair',
 'Pillows support the affected arm in every lying position; in a wheelchair, use an arm support or clear lap tray.',
 'Lying on the <b>affected</b> side: affected shoulder positioned comfortably, unaffected leg forward on pillows. Lying on the <b>unaffected</b> side: affected arm forward on a pillow, affected leg back on pillows.',
 '''<ul>
<li><b>On the affected side:</b> 1–2 pillows for the head; affected shoulder positioned comfortably; unaffected leg forward on 1–2 pillows; pillows in front and behind.</li>
<li><b>On the unaffected side:</b> 1–2 pillows for the head; affected shoulder forward with arm on a pillow; affected leg back on 1–2 pillows; pillow behind.</li>
<li><b>On the back (if desired):</b> 3 pillows under both shoulders and head; affected arm on a pillow; optional pillow under the affected hip; feet neutral.</li>
<li><b>Sitting in bed:</b> short periods only; upright, supported by pillows; both arms on pillows; legs supported.</li>
<li><b>Sitting up:</b> well back in the chair; arms forward on 2 pillows on a table; feet flat; knees above feet.</li>
<li><b>Wheelchair:</b> sliding arm supports or a clear flip-away lap tray. {{u_ue1}}</li>
</ul>'''),
('8D', 'Mental practice, NMES and FES for subluxation',
 'Mental practice activates muscles and cortex in the imagined pattern and can be used at any stage. NMES comes in cyclic, EMG-triggered and functional forms.',
 'FES for subluxation: electrodes over <b>supraspinatus and posterior deltoid</b>; <b>10–50 Hz</b>; <b>2.5 s on / 2.5 s off</b>; 3–5 days/week for at least 4 weeks (inpatient rehab); reduced subluxation ~<b>4.9 mm</b> vs conventional therapy.',
 '''<ul>
<li><b>Mental practice/imagery</b> (from sports psychology): rehearsing tasks mentally activates musculature (EMG) and cortical representation (fMRI) in the same pattern; improves learning and performance; supports neuroplasticity; any stage; as a supplement, active rest or HEP. {{braun06,jackson01}}</li>
<li><b>Cyclic NMES:</b> preset schedule, no active participation. <b>EMG-triggered:</b> must move to reach a threshold that triggers stimulation. <b>FES:</b> during functional activity or retraining, as a supplement or combined with other interventions; e.g., FES with an arm ergometer. {{u_ue1}} NMES for motor restoration is reviewed in Knutson 2015. {{knutson15}}</li>
<li><b>FES for subluxation:</b> parameters above. {{lavi22,vafadar15}}</li>
</ul>'''),
('8E', 'Slings, splints and orthoses, and taping',
 'Slings are debated and likely not beneficial. Resting hand splints shouldn\'t be routine. Taping is a reminder, not a brace.',
 '<b>McConnell</b> tape = posture and shoulder alignment <b>reminder</b>. <b>Kinesio</b> tape = more <b>dynamic</b> alignment.',
 '''<ul>
<li><b>Slings:</b> originally meant to decrease subluxation and pain; many sling types (e.g., GivMohr), so research varies; insufficient evidence that slings or wheelchair attachments prevent subluxation, decrease pain, increase function or worsen contracture; likely not beneficial for the hemiplegic shoulder. {{ada05}}</li>
<li><b>Resting hand splint:</b> at night in a functional position; a PROM program was more effective; not routine, but used to prevent contracture if present.</li>
<li><b>Botox:</b> follow with splinting and PT/OT to work on movement. <b>Serial casting:</b> high maintenance, hygiene issues. Air cast can assist positioning or allow shoulder strengthening without elbow involvement.</li>
<li>Examples: resting hand splints, Neuro-IFRAH wrist-hand orthosis, SaeboStretch dynamic splint. {{u_ue1}}</li>
</ul>'''),
('8F', 'Preparing the UE for function, and the hand-opening sequence',
 'Start proximal: posture and trunk, then dynamic trunk control, then scapulohumeral rhythm, then scapular mobility. Open the hand thumb first, never over the palm.',
 'No ROM above <b>90°</b> unless you facilitate scapulohumeral rhythm (upward rotation + humeral ER, thumb up); stop at <b>140°</b> max. Open fingers <b>before</b> extending the wrist.',
 '''<ol>
<li>Postural and trunk alignment; 2) achieve the posture, then strengthen the trunk; 3) dynamic trunk control in sitting; 4) check scapulohumeral rhythm (rule above); 5) mobilize the scapula if appropriate.</li>
</ol>
<ul><li><b>Opening the hand:</b> note alignment; use gravity (trunk flexion, guide the UE forward to relax); flex the wrist so the fingers relax; open the thumb first with pressure on the thenar eminence and abduction; enter from the thumb side and spread the metacarpal heads, staying out of the palm; don\'t overextend fingers; open fingers before extending the wrist; place the heel of the hand on a surface, wait for the fingers to relax, then slide your hand out. {{u_ue1}}</li></ul>'''),
('8G', 'Hypotonia (flaccidity): principles and interventions',
 'Early mobility in the early high-neuroplasticity window; increase muscle activity, prevent contractures and learned non-use.',
 'Strengthening order: <b>less-involved UE first → bilateral → unilateral skilled</b> with the involved UE, keeping the scapula mobile.',
 '''<ul>
<li><b>Focus:</b> increase muscle activity, prevent contractures, prevent learned non-use. Compensation may be needed when the person risks injury or secondary impairment. Incorporate techniques in functional, task-specific, high-repetition practice, especially the hand.</li>
<li><b>Complementary:</b> approximation, verbal and tactile cues, NMES.</li>
<li><b>Techniques:</b> positioning and handling (protect, prevent contracture and shoulder complications, add sensory input); ROM including self-ROM with scapulohumeral rhythm; weight bearing with facilitation, ideally in functional positions; strengthening (reaching, grabbing, pulling, pushing). {{u_ue2}}</li>
</ul>'''),
('8H', 'Hypertonia (spasticity): principles, inhibition and evidence',
 'Goals are always patient-centered and functional, never "decrease spasticity". Current evidence strongly favors strengthening.',
 'Resistance training increases strength, gait speed and function <b>without exacerbating spasticity</b>. Treat spasticity when it interferes with function, is painful, or causes contracture or skin breakdown.',
 '''<ul>
<li><b>Focus:</b> minimize hypertonicity, promote isolated movement out of pattern, balance muscle groups, improve motor control for function and QOL. Unaddressed spasticity usually leads to progressive restriction.</li>
<li><b>Inhibition (temporary):</b> deep pressure on the tendon (non-noxious, sustained); rhythmic rotation (slow, low-amplitude); sustained stretch; warmth; weight bearing; patient education and HEP; strengthening out of pattern when possible. {{u_ue2}}</li>
<li><b>Evidence:</b> weakness affects function more than spasticity {{ross07}}; resistance training improves strength, gait speed, function and QOL without worsening spasticity {{pak08}}; resistance training benefits spasticity, function, strength, gait and balance {{chacon24}}; when to treat spasticity {{gelber99}}.</li>
<li><b>Vagus nerve stimulation</b> paired with rehab in chronic stroke (moderate to severe deficits): improved impairment and function, especially wrist and hand, plus patient-reported outcomes and participation; the control group reached similar gains after crossover; gains held to 1 year; FDA approved and now in clinical use. {{francisco23}} <span class="gaptag">Source conflict</span> The source credits approval to pilot-trial results; approval followed the larger pivotal trial. Verify against the current literature.</li>
</ul>'''),
('8I', 'Weight bearing through the UE: hypotonic vs hypertonic goals',
 'Same activity, different purpose. In hypotonia it builds joint sense, recruitment and stability. In hypertonia it reduces tone and promotes isolated, out-of-pattern motion.',
 'Standing progression: bilateral support first, weight shift all directions with the hand open (or on forearms), then both UEs on a towel, then the less-involved UE reaches while the involved UE bears weight.',
 '''<ul>
<li><b>Both:</b> increases awareness of the involved UE and facilitates alignment.</li>
<li><b>Sitting:</b> hypotonic → keep shoulder girdle aligned with the hand on the surface; hypertonic → use hand-opening principles, keep the hand in contact. In hypotonia, WB increases joint sense, promotes recruitment, facilitates <b>stability</b> and the brain-UE connection; in hypertonia, it decreases tone, facilitates <b>mobility</b>, balances antagonists and isolates joint motion out of pattern.</li>
<li><b>Standing:</b> at a rail, counter, raised mat, bedside table or wall; guard the more involved side; facilitate at trunk, pelvis or LE for alignment and equal weight shift. {{u_ue2}}</li>
</ul>'''),
('8J', 'Using the UE inside functional training, and task-oriented strength training',
 'Build the UE into bed mobility, side sitting, quadruped, prone, scooting, STS and gait. Meaningful task-specific training beats isolated motions.',
 'In gait, a <b>rolling table</b> can support the involved UE in extension while it weight-bears on the therapist\'s hand.',
 '''<ul>
<li>Rolling supine to the less involved and to the more involved side; supine to sit both directions incorporating the UE; side sitting on the more vs the less involved side with shoulder-hip counter-rotation; quadruped for proximal stability at the shoulder and pelvic girdles (modify the UE; core, motor control, balance); prone on elbows to plank or quadruped; lateral scooting using the UEs; STS with a UE ranger or a box in front; ADLs in standing and gait.</li>
<li><b>Task-oriented strength training:</b> functional activities that transfer to skills; facilitates activity-dependent neuroplasticity; improves strength and endurance with a possible aerobic effect; repetition matters; dynamic tasks against load (push, pull, lift). {{u_ue2}}</li>
</ul>'''),
('8K', 'Nine-Hole Peg Test and Box and Block Test: how to run them',
 'NHPT is timed (seconds, in and out). BBT is a count (blocks moved in 1 minute). Both start with the dominant hand and include practice.',
 'NHPT: stopwatch starts when the patient <b>touches the first peg</b> and stops when the <b>last peg hits the container</b>. BBT: two blocks at once count as one; fingertips must cross the partition.',
 '''<div class="tbl-wrap"><table class="rt"><colgroup><col style="width:22%"><col style="width:39%"><col style="width:39%"></colgroup>
<thead><tr><th></th><th>Nine-Hole Peg Test</th><th>Box and Block Test</th></tr></thead><tbody>
<tr><td class="name">Setup</td><td>Square board, 9 holes 3.2 cm (1.25 in) apart and 1.3 cm (0.5 in) deep; 9 wooden pegs 0.64 cm (0.25 in) diameter, 3.2 cm (1.25 in) long; container of 0.7 cm plywood, 13 × 13 cm sides; non-slip backing; board in front, container on the dominant-hand side</td><td>Box with a center partition, placed lengthwise along the edge of a standard-height table; patient in a standard chair facing it; 150 blocks in the dominant-side compartment; examiner faces the patient to see the blocks</td></tr>
<tr><td class="name">Practice</td><td>Instructions given while you demonstrate; one practice trial per arm ("see how fast you can do it")</td><td>Demonstrate moving 3 blocks in the same direction the patient will; hands on the sides of the box; 15-second trial starting at "go", "stop" at 15 s; correct mistakes, return the blocks; repeat the practice before the second hand</td></tr>
<tr><td class="name">Task</td><td>Pegs in one at a time with the tested hand, any order, until all holes are filled, then out one at a time to the container; other hand stabilizes the board; test: same instructions, as quickly as possible; dominant first, then move the container to the other side for the non-dominant hand</td><td>Grasp one block at a time, carry it over the partition (fingertips must cross) and drop it, for 1 minute; dominant hand first, then non-dominant</td></tr>
<tr><td class="name">Cues</td><td>"Faster"; "Out again… faster"</td><td>"Ready" (wait 3 s) "Go" … "Stop"</td></tr>
<tr><td class="name">Score</td><td>Seconds, each hand</td><td>Examiner counts after the trial: blocks moved in 1 min, each hand; blocks carried together count as one (subtract the extras); no penalty for blocks that bounce out after crossing; blocks tossed without the fingertips crossing don\'t count</td></tr>
</tbody></table></div><p>{{math85n,math85b}}</p>'''),
])

# ---------------- TOPIC 9 ----------------
topic('9', 'Documentation', 'Topic 9 · Documentation: daily SOAP note &amp; the acute care evaluation',
 'Writing S, O, A and P for a neuro treatment · acute care evaluation structure · EGRESS test', [
('9A', 'S and O in a neuro treatment note',
 'S is what the patient says at the start. O is the session in chronological order, showing skilled PT and progress.',
 'Every O entry names the <b>task</b>, <b>MC and VC</b>, direction of force or resistance, reps, assist level, setup, equipment and <b>outcome</b>. Quantify cues (%, min/mod/max, 3/5).',
 '''<ul>
<li><b>S:</b> what the patient says when the encounter begins, e.g., patient consented to treatment and reports being ready to exercise, or reports not sleeping well last night.</li>
<li><b>O:</b> vital signs before, after and at other times, with the reason (e.g., orthostatic hypotension); movement analysis during functional activities; specific task details as above.</li>
<li>Example format: reverse chop to the R in supine against resistance, 3 sets × 8 reps, incorporating the R UE to improve efficiency and speed of rolling to the L.</li>
<li><span class="mine">example</span> "Supine: resisted lift pattern toward the L, 3 × 10, VC for eyes and head to lead, to improve speed and independence rolling to the L for bed mobility." {{u_soap}}</li>
</ul>'''),
('9B', 'Writing O by intervention category',
 'Group O entries by therapeutic exercise, neuromuscular re-education, functional/therapeutic activities, and education/HEP, and state the purpose of each.',
 'Neuromuscular re-ed entries state <b>body part, how, how long</b> and the functional reason (e.g., forced use to improve paretic-limb weight acceptance for gait and transfers).',
 '''<ul>
<li><b>Ther ex:</b> ROM/flexibility to assist with…; progression (more resistance, sets/reps, closed → open chain, higher step to simulate home); verbal cues for technique, posture, alignment, speed; session modified due to….</li>
<li><b>Neuromuscular re-ed:</b> postural correction (to improve upright posture, reduce anterior fall risk and repetitive stress injuries at work); compliant surface training (surface type and use, for safety with community ambulation); forced use (body part, how, how long; for weight acceptance and stabilization of the paretic limb in gait and transfers); error augmentation (body part, placement, direction of motion); resisted progression (specific application, for balance during challenges to the COG and reduced fall risk).</li>
<li><b>Functional/therapeutic activities</b> (state the specific use of each): transfer and bed mobility training (functional performance, safety, reduced caregiver burden); balance and gait training (independence and performance in home and community; surfaces, static/dynamic/anticipatory balance, gait deviations with the gait-cycle phase); reaching, pinching, gripping, throwing, swinging, carrying, climbing, pushing, pulling, lifting, sitting, standing; cues for technique, safety, weight shift, alignment, visual scanning, visual fixation.</li>
<li><b>Education/HEP:</b> "Pt educated in…/instructed in…". {{u_soap}}</li>
</ul>'''),
('9C', 'A and P',
 'A is your professional judgment of progress, not a summary of O. P is what you will do next visit.',
 'Useful A language: <b>increase safety</b> in home or community, <b>reduce fall risk</b>, <b>reduce caregiver burden</b>, reduced reliance on compensations.',
 '''<ul>
<li><b>A:</b> functional improvement this session ("good progress with…; progress limited due to…"); factors helping or interfering with goals; not a restatement of O.</li>
<li><b>A templates</b> (paraphrased): the patient shows ___ progress with improvements in ___, contributing to better completion of functional tasks such as ___ with less reliance on compensation, less caregiver assistance and lower fall risk · the patient continues to show deficits in ___ that contribute to ___ · the patient would benefit from continued skilled PT to address remaining deficits and improve function with ___.</li>
<li>A strong A ties a change in an impairment to a change in a task, names what is still limiting the patient, and states why skilled care should continue.</li>
<li><b>P:</b> e.g., continue balance/gait training; instruct patient and caregiver in car transfer; add L UE reaching exercises. {{u_soap}}</li>
</ul>'''),
('9D', 'The acute care evaluation and the EGRESS test',
 'Acute care evaluations lean on discharge planning: home setup, support, vitals across activity, lines and tubes, and functional mobility.',
 'EGRESS progression: <b>move to edge of surface → march seated → stand and march in place → step forward and back</b>. If any step is unsafe, stop and get the right help or equipment.',
 '''<ul>
<li><b>S:</b> PLOF and social history; home environment (stairs, rails, alone or with family); support; pain; goals.</li>
<li><b>O:</b> systems review (HR, BP, RR, SpO<sub>2</sub> before, during and after activity; alert and oriented, consent; manage IVs, catheters, drains before moving); functional mobility (bed mobility, transfers, gait, stairs); impairments (ROM, strength, neuro if indicated).</li>
<li><b>A:</b> connects impairment to functional limitation to justify skilled care; problem list (e.g., balance deficits affecting safety); PT diagnosis; rehab potential (good, fair, poor).</li>
<li><b>Plan:</b> short- and long-term goals, interventions, frequency and duration (e.g., 2×/week for 3 weeks), discharge planning (home vs SNF vs rehab), identify barriers early with the case manager. {{u_acute}}</li>
<li><b>EGRESS:</b> quick bedside screen of safe mobility, often used by nursing for fall risk. Once all four steps are completed safely, go for a walk. {{u_acute,u_egress}}</li>
</ul>'''),
('9E', 'Exam documentation phrases worth memorizing',
 'Several exam findings have a required wording. Getting the wording right is part of getting the finding right.',
 'Screening tools produce a "positive/negative screen", not a diagnosis. Tone is documented by <b>muscle group</b>.',
 '''<ul>
<li><b>Tone:</b> "Hypertonicity in L elbow flexors" (muscle group, not motion). {{u_exam}}</li>
<li><b>MoCA:</b> "Score 23/30: positive screen for mild cognitive impairment." <span class="mine">example</span> {{u_exam}}</li>
<li><b>Motor control:</b> "L LE flexion: selective at hip (MMT 4/5), patterned at knee and ankle." {{u_exam}}</li>
<li><b>Cranial nerves:</b> "Cranial nerves II–IX, XI, XII intact"; acuity "L 20/30; R 20/30 with corrective lenses"; "+R head impulse test". {{u_cn}}</li>
<li><b>Coordination:</b> "+ rebound phenomenon"; coordination graded 1–5. {{u_exam,lanzino12}}</li>
</ul>'''),
('9F', 'Writing patient-centered functional goals',
 'A goal names a meaningful activity the patient can\'t do now but wants to, written so anyone can observe and measure it: who, does what, under what conditions, how well, by when.',
 'Goals are about <b>function</b>, never about an impairment for its own sake: never "decrease spasticity". Write what the patient will <b>do</b>, not what they will "be able to" do.',
 '''<ul>
<li><b>Functional goal:</b> an individually meaningful activity the person can\'t perform because of their condition but wants to accomplish through PT; observable, repeatable, with a definite beginning and end; self-care, work or leisure. {{rand00}}</li>
<li><b>Five parts:</b> (1) <b>Who</b>: the patient; (2) <b>What</b>: the observable activity (the third word of the goal names it; avoid "will be able to"); (3) <b>Conditions</b>: environment, device, surface, setup or precautions specific to this patient; (4) <b>How well</b>: describe the help or accuracy concretely (where you assist, how often you cue, how many successful trials), not just "min A"; (5) <b>By when</b>: a target date from healing, evidence, experience and the patient\'s progress. {{rand00}}</li>
<li><b>SMART check:</b> Specific, Measurable, Achievable, Realistic/Relevant, Timed. Set goals <b>with</b> the patient. {{bovend09}}</li>
<li><b>Where they come from:</b> the patient\'s own goals (PSFS, goal-setting questions) for realistic, patient-centered goals {{u_subj}}; SDOH and environment shape prognosis and goals {{u_subj}}; acute care plans list short- and long-term goals {{u_acute}}; with hypertonia, goals stay functional and never target spasticity itself {{u_ue2}}.</li>
<li><b>Making "how well" measurable:</b> tie it to a test with a known meaningful change (e.g., a PSFS gain of at least the MCID: 1.58 after stroke, 2.5 in MS) or to time, distance, repetitions, assist level and cue frequency. <span class="mine">inference</span> {{evensen23,manago23}}</li>
<li><b>Short- vs long-term:</b> the long-term goal is the function you expect at discharge; short-term goals are the steps toward it, often the same task with more help, an easier condition or a lower standard. <span class="mine">inference</span></li>
<li><span class="mine">example</span> Strong: "Mr. R will transfer from bed to wheelchair toward his L (more involved) side by stand pivot, with contact guard at the trunk and one verbal cue for hand placement, in 4 of 5 trials within 3 weeks." Weak: "Pt will decrease tone in L elbow flexors" (impairment, not function) or "Pt will be able to walk better" (not observable or measurable).</li>
</ul>'''),
])
