var MATCH={
 "Exam tools":[
  ["Modified Ashworth Scale","Tone and spasticity, 0 to 4"],
  ["UMCT","Upright LE control: weak, moderate, strong"],
  ["Fugl-Meyer","Patterned vs selective movement post-stroke"],
  ["MoCA","Screens for mild cognitive impairment"],
  ["PSFS","Patient-chosen functional goals"],
  ["Line bisection","Visual neglect screen"],
  ["Rebound test","Resisted elbow flexion, sudden release"],
  ["Box and Block","Blocks moved in 1 minute"],
  ["Nine-Hole Peg","Timed pegs in and out"]
 ],
 "Cranial nerves":[
  ["CN I","Smell, one nostril at a time"],
  ["CN II","Acuity, pupils, visual fields"],
  ["CN III","Eyelid, most eye movements, ipsilateral pupil"],
  ["CN IV","Diagonal down-and-in eye movement"],
  ["CN V","Face sensation, masseter, pterygoids"],
  ["CN VI","Lateral eye deviation"],
  ["CN VII","Facial expression; taste anterior 2/3"],
  ["CN VIII","Hearing and gaze stability"],
  ["CN XII","Tongue; deviates toward its own lesion"]
 ],
 "Communication":[
  ["Anomia","Difficulty retrieving words"],
  ["Neologism","Made-up, unrecognizable words"],
  ["Phonemic paraphasia","'Wishdasher' for 'dishwasher'"],
  ["Semantic paraphasia","'Table' for 'bed'"],
  ["Telegraphic speech","Omits function words"],
  ["Confabulation","Fabricated info, not on purpose"],
  ["Apraxia of speech","Planning; inconsistent; groping"],
  ["Dysarthria","Execution; slurred; consistent"]
 ],
 "PNF & cues":[
  ["Rhythmic initiation","Passive → active assist → active → resisted"],
  ["Rhythmic stabilization","Alternating isometrics; 'don't let me move you'"],
  ["Dynamic reversals","Alternating concentric; 'push against me'"],
  ["Combination of isotonics","Concentric, hold, eccentric"],
  ["Replication","Start at the end position"],
  ["Repeated stretch","3–4 per pattern; 'and pull'"],
  ["Directional cue","Pressure in the direction of movement"],
  ["Approximation","Compress the joint"],
  ["Loading","Force through the long axis"]
 ],
 "Numbers":[
  ["< 26","MoCA positive screen"],
  ["< 8","GCS in coma"],
  ["1.58","PSFS MCID in stroke"],
  ["3.2","FMA UE total MDC"],
  ["128 Hz","Vibration sense fork"],
  ["≥ 3 lines","DVA drop = VOR impairment"],
  ["~65%","Dysphagia in acute stroke"],
  ["85–95% HRR","HIIT intensity after stroke"],
  ["4.9 mm","Subluxation reduced by FES"]
 ]
};

var SORT={
 "Spasticity or rigidity?":{b:["Spasticity","Rigidity"],items:[
  ["Velocity-dependent",0],["Clasp-knife",0],["Catch",0],["Pyramidal tract damage",0],["Unequal agonist vs antagonist",0],
  ["Lead pipe",1],["Cogwheel",1],["Constant through range",1],["Basal ganglia",1],["Equal in agonist and antagonist",1]
 ]},
 "Which synergy?":{b:["UE flexion","UE extension","LE flexion","LE extension"],items:[
  ["Elbow flexion (strongest)",0],["Scapular elevation and retraction",0],["Forearm supination",0],
  ["Shoulder adduction (strongest)",1],["Forearm pronation",1],["Scapular protraction",1],
  ["Hip flexion (strongest)",2],["Hip abduction and ER",2],["Ankle dorsiflexion",2],
  ["Hip adduction",3],["Knee extension",3],["Ankle plantarflexion",3]
 ]},
 "Aphasia, apraxia or dysarthria?":{b:["Aphasia","Apraxia of speech","Dysarthria"],items:[
  ["Paraphasias across reading and writing",0],["Typically left hemisphere language areas",0],["Word salad",0],
  ["Groping for articulator position",1],["Inconsistent errors",1],["Better when automatic",1],
  ["Slurred speech",2],["Consistent, predictable errors",2],["Affects respiration and phonation",2]
 ]},
 "Hypotonic or hypertonic UE?":{b:["Hypotonia","Hypertonia"],items:[
  ["Weight bearing to increase joint sense",0],["Prevent learned non-use",0],["Increase muscle activity",0],["Approximation and NMES",0],
  ["Deep pressure on the tendon",1],["Rhythmic rotation",1],["Isolate movement out of pattern",1],["Weight bearing to decrease tone",1]
 ]},
 "Mobility or stability PNF?":{b:["Mobility","Stability"],items:[
  ["Rhythmic initiation",0],["Repeated stretch",0],["Combination of isotonics",0],["Replication",0],["Dynamic reversals",0],
  ["Rhythmic stabilization",1],["Dynamic reversals with a hold",1]
 ]},
 "Which SOAP section?":{b:["S","O","A","P"],items:[
  ["\"I didn't sleep well last night\"",0],["Patient consented to treatment",0],
  ["Reverse chop × 8 reps × 3 sets",1],["Vital signs before and after",1],["VC for foot placement 3/5 reps",1],
  ["Reduced fall risk with improved weight shift",2],["Progress limited due to fatigue",2],
  ["Add L UE reaching next session",3],["Instruct caregiver in car transfer",3]
 ]},
 "PIP, N-PIP or AP?":{b:["PIP","N-PIP","AP"],items:[
  ["Patient says she can't get out of bed",0],["Patient reports trouble with stairs",0],
  ["Wife reports he forgets his meds",1],["Nurse notes unsafe transfers",1],
  ["Risk of shoulder pain later",2],["Future contracture risk",2]
 ]}
};

var TF=[
 ["EDGE documents are published by the ANPT.",1,""],
 ["The MCID is the smallest change beyond measurement error.",0,"That's the MDC. The MCID is the smallest meaningful change."],
 ["Anticipated problems need prevention and education.",1,""],
 ["Walking is a discrete task.",0,"It's continuous: no clear beginning or end."],
 ["Regress a task with verbal cues before tactile cues.",1,""],
 ["Rolling is an ANPT core task for movement analysis.",0,"The six: sitting, STS, standing, walking with a turn, step up/down, reach/grasp/manipulate."],
 ["PSFS MCID in stroke is 1.58 points.",1,""],
 ["A MoCA of 24 means the patient has MCI.",0,"It's a positive screen, not a diagnosis."],
 ["Add a MoCA point for less than 12 years of education.",1,""],
 ["Coma corresponds to a GCS below 8.",1,""],
 ["Ideomotor apraxia: can't do it on command but may do it spontaneously.",1,""],
 ["Normal temporal visual field is about 60°.",0,"Temporal is 100°; nasal is 60°."],
 ["Convergence is intact if focus holds to 4 inches.",1,""],
 ["Weber lateralizing left can mean left conductive loss.",1,""],
 ["Rinne: bone louder than air is normal.",0,"That's a conductive hearing loss."],
 ["A ≥ 3-line DVA drop suggests VOR impairment.",1,""],
 ["HIT corrective saccade = loss on the side of the head turn.",1,""],
 ["With a CN XII lesion, the tongue deviates away from it.",0,"Toward a CN XII lesion; away from a cortical one."],
 ["Spasticity is velocity-dependent.",1,""],
 ["Document tone by motion, e.g. 'elbow flexion'.",0,"Document the muscle group: 'elbow flexors'."],
 ["MMT is fine for patterned movement.",0,"MMT is not appropriate if movement is patterned."],
 ["Elbow flexion is the strongest UE flexion synergy component.",1,""],
 ["UMCT ankle dorsiflexion has a Moderate grade.",0,"It has no Moderate grade."],
 ["UMCT allows one graded trial per segment.",1,""],
 ["With a unilateral sensory deficit, test the intact side first.",1,""],
 ["Use a pinwheel for sharp/dull.",0,"Use a safety pin opened wide."],
 ["Post-stroke cognitive impairment affects about 60% in year 1.",1,""],
 ["Working memory stores and manipulates information.",1,""],
 ["Dysarthria errors are inconsistent.",0,"Apraxia errors are inconsistent; dysarthria is consistent."],
 ["Global aphasia is common in acute stroke.",1,""],
 ["About half of people with dysphagia may aspirate silently.",1,""],
 ["HIIT sessions after stroke run about 25–30 minutes.",1,""],
 ["In MS, avoid intensity when fatigued.",0,"Dose it differently: shorter bouts, planned rest."],
 ["Rhythmic stabilization allows motion.",0,"No motion: alternating isometrics."],
 ["Do no more than 3–4 repeated stretches per pattern.",1,""],
 ["People post-stroke roll about 3× slower than controls.",1,""],
 ["Feet closer to the pelvis increases hamstring activity in a bridge.",0,"Closer decreases hamstring activity."],
 ["Highest GRF in sit to stand is at lift-off.",1,""],
 ["Slings clearly prevent subluxation.",0,"Evidence is insufficient; likely not beneficial."],
 ["FES for subluxation targets supraspinatus and posterior deltoid.",1,""],
 ["Resistance training worsens spasticity.",0,"It improves strength and function without exacerbating spasticity."],
 ["Open the fingers before extending the wrist.",1,""],
 ["The A section summarizes the O section.",0,"A is professional judgment, not a summary."]
];

var SEQ=[
 ["Movement continuum",["Initial conditions","Preparation","Initiation","Execution","Termination"]],
 ["Task regression",["Verbal cue","Tactile cue","Physical assistance"]],
 ["Reasoning cycle",["Interview/history","Exam","Evaluation","Plan of care","Reassessment","Outcome"]],
 ["Outcome measure selection",["Referral: initial list","Initial observation","History","Systems review","Final selection"]],
 ["Sit to stand phases",["Flexion-momentum","Momentum-transfer","Extension","Stabilization"]],
 ["Swallow stages",["Oral preparatory","Oral transit","Pharyngeal","Esophageal"]],
 ["Rhythmic initiation",["Passive","Active assisted","Active","Resisted","Independent"]],
 ["Preparing the UE",["Postural and trunk alignment","Strengthen the trunk","Dynamic trunk control in sitting","Check scapulohumeral rhythm","Mobilize the scapula"]],
 ["Opening the hand",["Use gravity: trunk flexion","Flex the wrist","Open the thumb first","Spread the metacarpal heads","Open fingers, then extend the wrist"]],
 ["Hypotonic UE strengthening",["Less-involved UE","Bilateral activities","Involved UE, unilateral skilled"]],
 ["EGRESS test",["Move to edge of surface","March while sitting","Stand and march in place","Step forward and back"]],
 ["Level of consciousness (deepest first)",["Coma","Stupor","Obtunded","Lethargic","Alert"]]
];

var BL=[
 ["EDGE = Evaluation Database to Guide ___","Effectiveness"],
 ["PSFS MCID in stroke = ___ points","1.58"],
 ["MoCA positive screen: score below ___","26"],
 ["Coma: GCS below ___","8"],
 ["Temporal visual field ≈ ___°","100"],
 ["Convergence intact to ___ inches","4"],
 ["DVA: head oscillation at ___ Hz","2"],
 ["Vibration fork: ___ Hz","128"],
 ["FMA UE total MDC: ___ points","3.2"],
 ["Rigidity: lead pipe or ___","cogwheel"],
 ["UE flexion synergy strongest: elbow ___","flexion"],
 ["Short-term memory: 7 ± ___ items","2"],
 ["Dysphagia in acute stroke: ~___%","65"],
 ["HIIT after stroke: ___–95% HRR","85"],
 ["Repeated stretch: 3–___ per pattern","4"],
 ["FES: 2.5 s on, ___ s off","2.5"],
 ["Avoid shoulder ROM above ___° without rhythm facilitation","90"],
 ["Box and Block test length: ___ minute","1"]
];
