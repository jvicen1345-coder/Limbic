/** The Wellness Overview's "Today's Wellness Tip" card (see app/(app)/wellness/page.tsx) —
 *  general wellness/fitness/recovery facts, deliberately distinct from the homepage's
 *  Clinical Insight tips (which are PT-practice focused) and from Nutrition's own daily tip
 *  (see lib/nutrition-content.ts nutritionTipForDate, food-specific). Rotates deterministically
 *  by calendar day — same hash-by-dateKey approach as nutritionTipForDate, so every reader
 *  sees the same tip on the same day rather than a random one per page load. */

export const WELLNESS_TIPS: string[] = [
  "Walking 7,000 to 10,000 steps per day is associated with significantly lower all-cause mortality in adults — source: JAMA Internal Medicine 2021",
  "Resistance training twice per week reduces all-cause mortality risk by up to 23% independent of aerobic exercise — source: British Journal of Sports Medicine 2022",
  "Sleep duration of 7 to 9 hours per night is associated with optimal cognitive function and physical recovery — source: National Sleep Foundation",
  "High intensity interval training produces equivalent cardiovascular adaptations to moderate continuous exercise in significantly less time — source: Journal of Physiology 2016",
  "Stretching for 30 seconds per muscle group is as effective as 60 seconds for improving flexibility in most populations — source: Journal of Strength and Conditioning Research",
  "Hydration status affects strength performance — even 2% dehydration can reduce muscular strength by up to 10% — source: Journal of Athletic Training",
  "Progressive overload — gradually increasing training demand — is the primary driver of long term strength and fitness improvement — source: NSCA Guidelines",
  "Foam rolling for 60 to 120 seconds per muscle group acutely improves range of motion without reducing muscle performance — source: International Journal of Sports Physical Therapy",
  "Zone 2 aerobic training — conversational pace cardio — is the most effective intensity for building mitochondrial density and long term cardiovascular health — source: Iñigo San Millán research",
  "Cold water immersion after intense exercise reduces muscle soreness but may blunt long term training adaptations — source: Journal of Physiology 2015",
  "Grip strength is one of the strongest single predictors of all-cause mortality across large population studies — source: The Lancet 2015",
  "Muscle mass peaks around age 30 and declines roughly 3 to 8% per decade after — resistance training slows this loss significantly — source: Journal of Applied Physiology",
  "A single night of poor sleep can reduce next-day strength output and increase perceived exertion during exercise — source: Sleep Medicine Reviews",
  "Standing up and moving for a few minutes every 30 to 60 minutes offsets some of the metabolic harm of prolonged sitting — source: Diabetes Care",
  "VO2 max — your body's maximal oxygen uptake — is one of the strongest predictors of longevity, on par with smoking status — source: JAMA 2018",
  "Consistent bedtime and wake time — not just total sleep hours — improves sleep quality and next-day recovery — source: Sleep Health journal",
  "Balance training reduces fall risk in older adults by roughly 25% when practiced regularly — source: Cochrane Database of Systematic Reviews",
  "Static stretching immediately before maximal-effort activity can slightly reduce power output — dynamic warm-ups are generally preferred pre-exercise — source: Journal of Strength and Conditioning Research",
  "Just two minutes of light activity after meals can meaningfully blunt post-meal blood sugar spikes — source: Sports Medicine journal",
  "Deep, slow breathing — roughly 6 breaths per minute — can measurably increase heart rate variability and activate the parasympathetic nervous system — source: Frontiers in Psychology",
  "Eccentric (lengthening) muscle contractions build strength and tendon resilience more efficiently than concentric-only training for injury prevention — source: British Journal of Sports Medicine",
  "Sun exposure earlier in the day helps anchor your circadian rhythm and can improve nighttime sleep onset — source: Sleep Foundation",
  "Core stability training reduces low back pain recurrence more effectively than general strengthening alone in several clinical trials — source: Spine journal",
  "Two to three resistance training sessions per week is enough to produce meaningful strength gains for most beginners — more isn't always better early on — source: ACSM Guidelines",
  "Cardiorespiratory fitness improvements of even one MET (metabolic equivalent) are linked to roughly a 10 to 25% reduction in mortality risk — source: Mayo Clinic Proceedings",
  "Warming up with dynamic movements that mimic your workout reduces injury risk more than static stretching alone — source: American Journal of Sports Medicine",
  "Protein intake spread evenly across 3 to 4 meals a day supports muscle protein synthesis better than one large serving — source: Journal of the International Society of Sports Nutrition",
  "Chronic under-recovery — not just overtraining volume — is a leading contributor to performance plateaus and injury — source: Sports Medicine journal",
  "Mobility work targeting the ankle and hip improves squat depth and can reduce compensatory strain on the lower back — source: International Journal of Sports Physical Therapy",
  "Regular moderate exercise measurably reduces symptoms of anxiety and depression, with effects comparable to some first-line treatments in mild-to-moderate cases — source: British Journal of Sports Medicine",
  "Time under tension and total training volume both matter for hypertrophy — neither alone tells the whole story — source: Journal of Strength and Conditioning Research",
  "Walking outdoors, especially in green spaces, is associated with greater reductions in stress hormones than indoor walking at the same intensity — source: International Journal of Environmental Research and Public Health",
];

export function wellnessTipForDate(dateKey: string): string {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (Math.imul(h, 31) + dateKey.charCodeAt(i)) >>> 0;
  return WELLNESS_TIPS[h % WELLNESS_TIPS.length];
}
