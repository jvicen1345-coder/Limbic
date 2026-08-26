import "server-only";

/** Static condition → clinical-intelligence lookup for the Condition Intelligence card
 *  (see components/pro/dashboard/ConditionIntelligenceCard.tsx and
 *  getConditionIntelligence in app/actions/clinician-dashboard.ts) — keyed on
 *  ClinicalPatient.condition exactly as a clinician typed it on the Add Patient form, so
 *  only an exact match surfaces a card; no fuzzy matching. schema.prisma's
 *  ConditionIntelligence model is a placeholder for a future DB-backed version of this
 *  same table — nothing reads or writes it yet. */
export const conditionIntelligenceMap: Record<
  string,
  {
    topMeasures: string[];
    episodeLength: string;
    guideline: string;
    boardPearl: string;
  }
> = {
  "ACL Tear": {
    topMeasures: ["IKDC", "LEFS", "ACL-RSI"],
    episodeLength: "9-12 months to return to sport — 16-24 visits typical",
    guideline: "APTA Clinical Practice Guideline — Knee Ligament Sprain",
    boardPearl: "Lachman is most sensitive — 85%. LSI above 90% required for return to sport.",
  },
  "Rotator Cuff Tear": {
    topMeasures: ["DASH", "Penn Shoulder Score", "WORC"],
    episodeLength: "12-16 weeks post-surgical — 20-30 visits typical",
    guideline: "APTA Clinical Practice Guideline — Shoulder Pain and Mobility Deficits",
    boardPearl:
      "Subscapularis tears — positive Lift-Off and Bear Hug. External Rotation Lag Sign most specific for full thickness tear.",
  },
  "Lumbar Disc Herniation": {
    topMeasures: ["Oswestry", "NPRS", "FABQ"],
    episodeLength: "6-12 weeks — 12-18 visits typical",
    guideline: "APTA Clinical Practice Guideline — Low Back Pain",
    boardPearl: "Centralization with repeated extension predicts good conservative outcome. McKenzie directional preference assessment first.",
  },
  Stroke: {
    topMeasures: ["Fugl-Meyer", "Berg Balance Scale", "FIM", "10MWT"],
    episodeLength: "Variable — acute inpatient 10-14 days — outpatient 3-6 months",
    guideline: "AHA/ASA Stroke Rehabilitation Guidelines",
    boardPearl: "Neuroplasticity is use-dependent. High repetition task-specific practice drives cortical reorganization.",
  },
  COPD: {
    topMeasures: ["6MWT", "Borg Dyspnea Scale", "mMRC"],
    episodeLength: "12-week pulmonary rehab program standard",
    guideline: "GOLD COPD Management Guidelines",
    boardPearl: "Pursed lip breathing creates back pressure preventing dynamic airway collapse. FEV1/FVC below 0.70 confirms obstruction.",
  },
  "Patellofemoral Pain Syndrome": {
    topMeasures: ["AKPS", "NPRS", "LEFS"],
    episodeLength: "6-12 weeks — 12-18 visits typical",
    guideline: "APTA Clinical Practice Guideline — Patellofemoral Pain",
    boardPearl: "Hip abductor and ER strengthening more effective than isolated quad training. Address proximal cause of distal symptoms.",
  },
  "Parkinson Disease": {
    topMeasures: ["Berg Balance Scale", "TUG", "UPDRS", "10MWT"],
    episodeLength: "Ongoing — LSVT BIG is 16 sessions over 4 weeks",
    guideline: "APTA Clinical Practice Guideline — Parkinson Disease",
    boardPearl: "LSVT BIG — high amplitude high intensity — evidence-based. Rhythmic auditory stimulation improves gait cadence.",
  },
  "Ankle Sprain": {
    topMeasures: ["FAAM", "VISA-A", "NPRS"],
    episodeLength: "Grade I — 1-3 weeks. Grade II — 3-6 weeks. Grade III — 6-12 weeks.",
    guideline: "APTA Clinical Practice Guideline — Ankle Stability and Movement Coordination Impairments",
    boardPearl: "Ottawa rules negative — no X-ray needed. 40% develop chronic instability — proprioception training essential.",
  },
  "Total Knee Arthroplasty": {
    topMeasures: ["KOOS", "LEFS", "WOMAC"],
    episodeLength: "12-16 weeks — 20-30 visits typical",
    guideline: "APTA Clinical Practice Guideline — Knee Arthroplasty",
    boardPearl: "Quad strength recovery is primary predictor of functional outcome. Full weight bearing immediately post-op is standard.",
  },
  "Total Hip Arthroplasty": {
    topMeasures: ["HOOS", "LEFS", "Harris Hip Score"],
    episodeLength: "12-16 weeks — 16-24 visits typical",
    guideline: "APTA Clinical Practice Guideline — Hip Arthroplasty",
    boardPearl:
      "Posterior approach — no flexion past 90, no IR, no adduction past midline. Anterior approach — no ER, no extension past neutral.",
  },
  "Heart Failure": {
    topMeasures: ["6MWT", "Borg RPE", "NYHA Classification"],
    episodeLength: "Phase II cardiac rehab — 12 weeks — 36 sessions",
    guideline: "AHA Heart Failure Exercise Recommendations",
    boardPearl: "Stop exercise if systolic BP drops more than 10mmHg with increased workload. MET equivalents guide activity progression.",
  },
  "Multiple Sclerosis": {
    topMeasures: ["EDSS", "Berg Balance Scale", "MSWS-12"],
    episodeLength: "Ongoing — relapse-driven episodes 6-12 weeks",
    guideline: "APTA Clinical Practice Guideline — Multiple Sclerosis",
    boardPearl: "Fatigue is most disabling symptom. Uhthoff phenomenon — symptoms worsen with heat. Energy conservation central to management.",
  },
  Concussion: {
    topMeasures: ["SCAT5", "BESS", "Buffalo Concussion Treadmill Test"],
    episodeLength: "1-4 weeks typical — vestibular involvement extends timeline",
    guideline: "Consensus Statement on Concussion in Sport — Amsterdam 2022",
    boardPearl: "Strict rest beyond 48 hours not recommended. Early controlled aerobic activity below symptom threshold improves recovery.",
  },
  "Plantar Fasciitis": {
    topMeasures: ["FAAM", "NPRS", "FFI"],
    episodeLength: "6-12 weeks — 12-18 visits typical",
    guideline: "APTA Clinical Practice Guideline — Heel Pain and Plantar Fasciitis",
    boardPearl: "Pain worst with first steps in morning — calcaneal tubercle tenderness. Positive windlass test. Calf stretching and orthoses first line.",
  },
  "Cervical Radiculopathy": {
    topMeasures: ["NDI", "NPRS", "PSFS"],
    episodeLength: "6-12 weeks — 12-18 visits typical",
    guideline: "APTA Clinical Practice Guideline — Neck Pain",
    boardPearl: "Spurling test most specific for radiculopathy. Cervical traction effective for centralization. ULTT sensitive for nerve tension.",
  },
  "Frozen Shoulder": {
    topMeasures: ["DASH", "SPADI", "Penn Shoulder Score"],
    episodeLength: "12-24 months natural history — PT 3-6 months",
    guideline: "APTA Clinical Practice Guideline — Shoulder Pain and Mobility Deficits",
    boardPearl: "Capsular pattern — ER most limited, then ABD, then IR. Equal loss of active and passive ROM. Diabetics at highest risk.",
  },
  "Post-op ACL Reconstruction": {
    topMeasures: ["IKDC", "LEFS", "ACL-RSI"],
    episodeLength: "9-12 months — 24-36 visits typical",
    guideline: "APTA Clinical Practice Guideline — Knee Ligament Sprain",
    boardPearl: "LSI above 90% on hop testing required for return to sport. Time alone never sufficient. Psychological readiness — ACL-RSI above 65.",
  },
  "Knee Osteoarthritis": {
    topMeasures: ["KOOS", "WOMAC", "LEFS"],
    episodeLength: "8-12 weeks — 16-24 visits typical",
    guideline: "APTA Clinical Practice Guideline — Knee Osteoarthritis",
    boardPearl: "Exercise is first-line treatment — stronger evidence than cortisone for long-term outcomes. Quad strengthening primary intervention.",
  },
  "Hip Osteoarthritis": {
    topMeasures: ["HOOS", "WOMAC", "Harris Hip Score"],
    episodeLength: "8-12 weeks — 16-24 visits typical",
    guideline: "APTA Clinical Practice Guideline — Hip Osteoarthritis",
    boardPearl: "Manual therapy plus exercise superior to exercise alone. Patient education on weight management essential.",
  },
  "Spinal Cord Injury": {
    topMeasures: ["ASIA Classification", "SCIM", "Berg Balance Scale"],
    episodeLength: "Acute inpatient 30-60 days — outpatient ongoing",
    guideline: "ASIA International Standards for SCI Classification",
    boardPearl: "Autonomic dysreflexia above T6 — sit up immediately, find and remove noxious stimulus. Medical emergency.",
  },
};
