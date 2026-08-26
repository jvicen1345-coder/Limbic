import "server-only";

/** Pre-written SMART goals for the Patient Goals section's "Suggested Goals" panel (see
 *  getGoalBankSuggestions in app/actions/clinician-dashboard.ts and the Goal category
 *  dropdown in components/pro/dashboard/PatientGoalsSection.tsx) — keyed on the exact
 *  "Region — Function" category label shown in that dropdown. Each string is a complete
 *  goal statement a clinician can use as-is (via "Use This Goal") or edit before saving. */
export const goalBank: Record<string, string[]> = {
  "Spine — Mobility": [
    "Patient will demonstrate full lumbar flexion ROM without pain in order to tie shoes independently within 4 weeks.",
    "Patient will tolerate 30 minutes of sustained sitting with pain below 2 out of 10 in order to return to desk work within 6 weeks.",
    "Patient will perform forward bending to retrieve objects from the floor without pain in order to complete household tasks independently within 4 weeks.",
    "Patient will demonstrate cervical rotation to 70 degrees bilaterally without pain in order to safely check blind spots while driving within 3 weeks.",
    "Patient will tolerate 20 minutes of walking on level surfaces with pain below 3 out of 10 in order to complete grocery shopping independently within 4 weeks.",
  ],
  "Spine — Strength": [
    "Patient will demonstrate independent core stabilization exercises with proper technique in order to maintain spinal stability during daily activities within 3 weeks.",
    "Patient will perform 3 sets of 15 repetitions of lumbar stabilization exercises independently with correct form within 4 weeks.",
    "Patient will lift 25 pounds from floor to waist height using proper body mechanics without pain in order to return to job duties within 8 weeks.",
    "Patient will demonstrate proper hip hinge mechanics during all lifting activities in order to prevent symptom recurrence within 4 weeks.",
    "Patient will perform 10 repetitions of cervical chin tuck with chin tuck hold for 10 seconds to improve deep cervical flexor endurance within 3 weeks.",
  ],
  "Shoulder — Mobility": [
    "Patient will achieve full shoulder flexion to 170 degrees without pain in order to reach overhead kitchen cabinets independently within 6 weeks.",
    "Patient will demonstrate external rotation to 60 degrees in order to perform hair care and dressing tasks independently within 4 weeks.",
    "Patient will achieve shoulder abduction to 150 degrees without compensatory trunk lean in order to perform overhead work tasks within 8 weeks.",
    "Patient will perform behind-the-back reach to L3 level in order to complete independent grooming tasks within 6 weeks.",
    "Patient will tolerate full overhead reaching for 10 repetitions without pain in order to return to swimming within 12 weeks.",
  ],
  "Shoulder — Strength": [
    "Patient will demonstrate 4 out of 5 rotator cuff strength symmetrical to uninvolved side in order to return to recreational tennis within 12 weeks.",
    "Patient will perform 3 sets of 15 repetitions of scapular stabilization exercises with correct technique within 4 weeks.",
    "Patient will lift 10 pounds overhead for 10 repetitions without pain in order to return to job duties involving overhead work within 8 weeks.",
    "Patient will demonstrate normal scapular kinematics during arm elevation to 120 degrees within 6 weeks.",
    "Patient will perform 20 repetitions of side-lying external rotation with 5-pound weight without fatigue within 6 weeks.",
  ],
  "Knee — Mobility": [
    "Patient will achieve knee flexion to 120 degrees in order to negotiate stairs reciprocally within 4 weeks.",
    "Patient will demonstrate full knee extension to 0 degrees in order to normalize gait pattern within 3 weeks.",
    "Patient will achieve knee flexion to 90 degrees in order to transfer from standard chair height independently within 3 weeks.",
    "Patient will perform full squat to 90 degrees of knee flexion without pain in order to return to recreational basketball within 12 weeks.",
    "Patient will demonstrate pain-free knee ROM through full available range during aquatic therapy within 4 weeks.",
  ],
  "Knee — Strength": [
    "Patient will demonstrate quadriceps strength of 4 out of 5 in order to negotiate stairs without upper extremity support within 6 weeks.",
    "Patient will perform 20 repetitions of single leg press at body weight in order to progress to running program within 8 weeks.",
    "Patient will achieve limb symmetry index above 90% on single leg hop test in order to return to competitive sport within 9 months.",
    "Patient will perform 15 repetitions of step-down without knee valgus collapse in order to demonstrate movement quality for return to sport within 8 weeks.",
    "Patient will demonstrate quad set and straight leg raise independently with correct technique in order to maintain quad activation during early post-surgical phase within 1 week.",
  ],
  "Hip — Mobility": [
    "Patient will achieve hip flexion to 110 degrees without posterior pelvic tilt in order to don lower extremity clothing independently within 4 weeks.",
    "Patient will demonstrate hip internal rotation to 20 degrees in order to normalize gait mechanics within 6 weeks.",
    "Patient will perform hip flexion to 90 degrees without compensatory lumbar flexion in order to negotiate standard stair height within 3 weeks.",
    "Patient will achieve full hip extension to 0 degrees in order to normalize terminal stance gait pattern within 4 weeks.",
    "Patient will demonstrate pain-free hip ROM in all planes in order to return to recreational golf within 8 weeks.",
  ],
  "Hip — Strength": [
    "Patient will demonstrate hip abductor strength of 4 out of 5 in order to eliminate Trendelenburg sign during ambulation within 6 weeks.",
    "Patient will perform 20 repetitions of side-lying hip abduction with 5-pound weight without fatigue within 4 weeks.",
    "Patient will demonstrate single leg stance for 30 seconds without upper extremity support in order to normalize balance during functional activities within 4 weeks.",
    "Patient will perform 10 repetitions of single leg squat to 45 degrees without knee valgus in order to progress to return to sport activities within 8 weeks.",
    "Patient will demonstrate glute max strength of 4 out of 5 in order to achieve normal hip extension during gait within 4 weeks.",
  ],
  "Ankle — Mobility": [
    "Patient will achieve ankle dorsiflexion to 10 degrees in order to normalize gait mechanics and stair negotiation within 4 weeks.",
    "Patient will demonstrate full ankle plantar flexion without pain in order to perform calf raises for push-off during gait within 4 weeks.",
    "Patient will achieve pain-free subtalar inversion and eversion in order to ambulate on uneven surfaces without ankle instability within 6 weeks.",
    "Patient will perform single leg calf raise for 20 repetitions without pain in order to progress to running program within 6 weeks.",
    "Patient will demonstrate pain-free ankle ROM during sport-specific movements in order to return to competitive soccer within 8 weeks.",
  ],
  "Ankle — Strength": [
    "Patient will perform 25 single leg calf raises without fatigue in order to meet return to running criteria within 6 weeks.",
    "Patient will demonstrate peroneal strength of 4 out of 5 in order to protect against lateral ankle instability during sport within 8 weeks.",
    "Patient will perform single leg balance for 30 seconds on foam surface without upper extremity support within 4 weeks.",
    "Patient will complete single leg hop for distance at 90% limb symmetry index in order to meet return to sport criteria within 8 weeks.",
    "Patient will perform lateral shuffle for 30 seconds without loss of balance or ankle pain in order to return to basketball within 8 weeks.",
  ],
  "Balance — Fall Prevention": [
    "Patient will ambulate 150 feet on level surfaces without assistive device and without loss of balance in order to increase household independence within 6 weeks.",
    "Patient will demonstrate Timed Up and Go below 12 seconds in order to reduce fall risk to community-dwelling norms within 8 weeks.",
    "Patient will achieve Berg Balance Scale score above 45 in order to reduce fall risk and maintain independent ambulation within 8 weeks.",
    "Patient will perform 10 repetitions of sit to stand from standard chair height without upper extremity support within 4 weeks.",
    "Patient will negotiate 12 steps with single railing independently in order to safely access all areas of home within 6 weeks.",
  ],
  "Neurological — Mobility": [
    "Patient will perform sit to stand independently from 17-inch surface in order to transfer without assistance within 4 weeks.",
    "Patient will ambulate 50 feet with single point cane on level surfaces without loss of balance in order to move through home independently within 6 weeks.",
    "Patient will demonstrate independent bed mobility including rolling and supine to sit in order to reduce caregiver burden within 3 weeks.",
    "Patient will negotiate 5 steps with bilateral upper extremity support in order to access home entrance independently within 6 weeks.",
    "Patient will perform community ambulation of 300 feet on level surfaces with appropriate assistive device within 8 weeks.",
  ],
  "Neurological — Strength": [
    "Patient will demonstrate antigravity strength in right upper extremity in order to assist with bilateral upper extremity tasks within 6 weeks.",
    "Patient will perform 10 repetitions of affected limb reaching tasks against gravity in order to expand functional reach within 4 weeks.",
    "Patient will demonstrate dorsiflexion strength of 3 out of 5 in order to clear foot during swing phase of gait within 6 weeks.",
    "Patient will perform 20 repetitions of affected upper extremity task-specific movements in order to improve cortical reorganization and motor recovery within 6 weeks.",
    "Patient will demonstrate sufficient hip flexor strength to ambulate with step-to pattern on level surfaces within 4 weeks.",
  ],
  "Cardiopulmonary — Endurance": [
    "Patient will ambulate 300 meters in 6-Minute Walk Test in order to meet minimum community ambulation threshold within 8 weeks.",
    "Patient will tolerate 20 minutes of continuous aerobic activity at Borg RPE of 12 to 14 in order to meet Phase II cardiac rehab criteria within 6 weeks.",
    "Patient will climb one flight of stairs with single railing with heart rate response below 120 bpm in order to safely access home entrance within 4 weeks.",
    "Patient will perform all basic ADLs without dyspnea above Borg level 3 in order to return to independent living within 6 weeks.",
    "Patient will tolerate 30-minute low-intensity walk without supplemental oxygen requirement in order to reduce activity-limiting dyspnea within 8 weeks.",
  ],
  "General — Function": [
    "Patient will demonstrate independence with all basic ADLs without pain or assistance in order to return to independent living within 6 weeks.",
    "Patient will return to full-time work duties without symptom exacerbation within 8 weeks.",
    "Patient will perform recreational activity of choice for 30 minutes without pain above 3 out of 10 within 8 weeks.",
    "Patient will demonstrate correct home exercise program technique independently in order to maintain gains after discharge within 3 weeks.",
    "Patient will report pain below 3 out of 10 with all daily activities in order to meet discharge criteria within 6 weeks.",
  ],
};
