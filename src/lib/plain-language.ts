/** Plain-English readings of the clinical vocabulary that appears in reader-facing prose —
 *  currently the Limbic Atlas (see components/PlainText.tsx, which does the matching, and
 *  components/atlas/AtlasClient.tsx, which is where it is used).
 *
 *  The problem this solves: "flexion" appears 85 times in lib/atlas-content.ts and
 *  "specificity" 67, in copy a patient or a first-week student reads alongside a clinician.
 *  A term nobody outside the profession knows is, for that reader, a blank — and a glossary
 *  page they have to leave to visit is a page they don't visit.
 *
 *  Every entry carries an **example**, not just a definition, because that is the half that
 *  actually lands: "moving a limb away from the midline" is another sentence to decode,
 *  "raising your arm out to the side like a snow angel" is not.
 *
 *  Client-safe on purpose — the matcher runs during render in a client component. */

export interface PlainTerm {
  /** Matched case-insensitively, on word boundaries. */
  term: string;
  /** Other spellings and inflections that should open the same explanation. Kept explicit
   *  rather than stemmed: "extension" and "extensor" are related, "lateral" and "laterally"
   *  are the same word, and guessing which is which is how a matcher starts underlining
   *  things that aren't terms at all. */
  also?: string[];
  /** One sentence, no jargon of its own. */
  what: string;
  /** Something the reader can picture or do in their chair. */
  example: string;
}

/** Longest first at match time (see components/PlainText.tsx) so "plantarflexion" is never
 *  read as the "flexion" inside it. Order here is by theme, for whoever edits this next. */
export const PLAIN_TERMS: PlainTerm[] = [
  // — the six movements —
  {
    term: "flexion",
    also: ["flexed", "flex", "flexors", "flexor"],
    what: "Bending a joint so the two bones fold closer together.",
    example: "Curling your hand up toward your shoulder is elbow flexion.",
  },
  {
    term: "extension",
    also: ["extended", "extensors", "extensor"],
    what: "Straightening a joint so the two bones open away from each other — the opposite of flexion.",
    example: "Straightening your knee to kick a ball is knee extension.",
  },
  {
    term: "abduction",
    also: ["abducted", "abduct"],
    what: "Moving a limb away from the middle of your body.",
    example: "Raising your arm out to the side, the way you start a snow angel.",
  },
  {
    term: "adduction",
    also: ["adducted", "adduct", "adductors", "adductor"],
    what: "Moving a limb back in toward the middle of your body.",
    example: "Lowering your raised arm back down against your side — it adds the limb back to you.",
  },
  {
    term: "rotation",
    also: ["rotate", "rotated", "rotators", "rotator"],
    what: "Turning a bone around its own long axis, without moving it closer or further away.",
    example: "Turning your head to look over your shoulder.",
  },
  {
    term: "internal rotation",
    also: ["medial rotation", "internally rotated"],
    what: "Turning a limb inward, so the front of it faces more toward the middle of your body.",
    example: "Standing with your toes pointed in toward each other.",
  },
  {
    term: "external rotation",
    also: ["lateral rotation", "externally rotated"],
    what: "Turning a limb outward, so the front of it faces more away from the middle of your body.",
    example: "Standing like a ballet dancer, toes turned out.",
  },

  // — foot and ankle —
  {
    term: "dorsiflexion",
    also: ["dorsiflexed", "dorsiflex"],
    what: "Pulling your foot upward at the ankle, toes toward your shin.",
    example: "Lifting your toes off the floor while your heel stays down.",
  },
  {
    term: "plantarflexion",
    also: ["plantar flexion", "plantarflexed"],
    what: "Pointing your foot downward at the ankle.",
    example: "Standing up on tiptoe, or pressing a car pedal.",
  },
  {
    term: "inversion",
    also: ["inverted"],
    what: "Tilting the sole of the foot inward, toward the other foot.",
    example: "The way an ankle rolls under you when you 'turn' it — the usual ankle sprain.",
  },
  {
    term: "eversion",
    also: ["everted"],
    what: "Tilting the sole of the foot outward, away from the other foot.",
    example: "Rocking your weight onto the inner edge of your foot so the sole angles out.",
  },

  // — forearm —
  {
    term: "supination",
    also: ["supinated", "supinator"],
    what: "Turning your forearm so the palm faces up. In the foot, the arch rolling outward.",
    example: "Holding your hand out flat to carry a bowl of soup — supination.",
  },
  {
    term: "pronation",
    also: ["pronated", "pronator"],
    what: "Turning your forearm so the palm faces down. In the foot, the arch rolling inward and flattening.",
    example: "Turning your palm over to pour the soup out.",
  },

  // — directions —
  {
    term: "anterior",
    also: ["anteriorly"],
    what: "Toward the front of the body.",
    example: "Your kneecap is on the anterior side of your knee.",
  },
  {
    term: "posterior",
    also: ["posteriorly"],
    what: "Toward the back of the body.",
    example: "Your calf is on the posterior side of your lower leg.",
  },
  {
    term: "medial",
    also: ["medially"],
    what: "Toward the middle line of the body.",
    example: "Your big toe is on the medial side of your foot.",
  },
  {
    term: "lateral",
    also: ["laterally"],
    what: "Toward the outside of the body, away from the middle.",
    example: "Your little toe is on the lateral side of your foot.",
  },
  {
    term: "proximal",
    also: ["proximally"],
    what: "Closer to where the limb joins the body.",
    example: "Your elbow is proximal to your wrist — nearer the shoulder.",
  },
  {
    term: "distal",
    also: ["distally"],
    what: "Further out along the limb, away from the body.",
    example: "Your fingers are the most distal part of your arm.",
  },
  {
    term: "superior",
    what: "Higher up on the body.",
    example: "Your shoulder is superior to your elbow.",
  },
  {
    term: "inferior",
    what: "Lower down on the body. Nothing to do with quality.",
    example: "Your hip is inferior to your ribs.",
  },

  // — sides —
  { term: "bilateral", also: ["bilaterally"], what: "Both sides.", example: "Bilateral knee pain means both knees." },
  { term: "unilateral", also: ["unilaterally"], what: "One side only.", example: "Unilateral weakness means one arm or one leg, not both." },
  {
    term: "ipsilateral",
    what: "On the same side as the problem being described.",
    example: "A left-sided injury with ipsilateral weakness means the weakness is also on the left.",
  },
  {
    term: "contralateral",
    what: "On the opposite side from the problem being described.",
    example: "A left-sided injury with contralateral weakness means the weakness is on the right.",
  },

  // — positions and examination —
  { term: "prone", what: "Lying face down.", example: "Lying on your stomach on a treatment table." },
  { term: "supine", what: "Lying face up.", example: "Lying flat on your back." },
  {
    term: "palpation",
    also: ["palpate", "palpated"],
    what: "Feeling an area with the hands to find what is tender, tight or out of place.",
    example: "The clinician pressing along your shoulder to find the sore spot.",
  },
  {
    term: "apprehension",
    what: "In a test, the patient's fear that the joint is about to give way — a different signal from pain.",
    example: "Flinching or bracing as a shoulder is moved toward the position it dislocated in.",
  },

  // — tissues —
  {
    term: "tendon",
    also: ["tendons", "tendinous"],
    what: "The cord that anchors a muscle to a bone.",
    example: "The Achilles, the thick cord you can feel above your heel.",
  },
  {
    term: "ligament",
    also: ["ligaments", "ligamentous"],
    what: "A band that holds two bones together at a joint. Different from a tendon, which joins muscle to bone.",
    example: "The ACL, inside the knee, is the one athletes tear.",
  },
  {
    term: "origin",
    what: "The end of a muscle attached to the bone that stays put when the muscle pulls.",
    example: "The biceps pulls your forearm up, not your shoulder down — the shoulder end is its origin.",
  },
  {
    term: "insertion",
    what: "The end of a muscle attached to the bone that actually moves when the muscle pulls.",
    example: "The biceps inserts on the forearm, which is the part that lifts.",
  },
  {
    term: "atrophy",
    also: ["atrophied"],
    what: "A muscle shrinking and losing bulk, usually from not being used.",
    example: "The wasted look of a leg after weeks in a cast.",
  },
  {
    term: "hypertrophy",
    also: ["hypertrophied"],
    what: "A muscle growing bigger.",
    example: "What months of resistance training is meant to produce.",
  },

  // — what goes wrong —
  {
    term: "tendinopathy",
    also: ["tendinitis", "tendonitis"],
    what: "A tendon that has become painful and irritated, usually from more load than it was ready for.",
    example: "Tennis elbow.",
  },
  {
    term: "impingement",
    also: ["impinged"],
    what: "A tissue being pinched between two bones as a joint moves.",
    example: "Shoulder pain that appears only in a certain part of the arc when you lift your arm.",
  },
  {
    term: "instability",
    also: ["unstable"],
    what: "A joint that moves further than it should, so it feels like it may give way.",
    example: "A knee that buckles when you turn on it.",
  },
  {
    term: "laxity",
    also: ["lax"],
    what: "Looseness in the tissues holding a joint. Some people are naturally loose everywhere.",
    example: "Being able to bend your thumb back to your forearm.",
  },
  {
    term: "subluxation",
    also: ["subluxed", "sublux"],
    what: "A joint slipping partly out of place and going back on its own.",
    example: "A kneecap that shifts sideways and pops back.",
  },
  {
    term: "dislocation",
    also: ["dislocated", "dislocate"],
    what: "A joint coming fully out of place and staying out until it is put back.",
    example: "A shoulder that has to be reduced in an emergency room.",
  },
  {
    term: "stenosis",
    what: "A narrowing of a space the nerves or spinal cord pass through.",
    example: "Leg pain on walking that eases when you sit or lean on a trolley.",
  },
  {
    term: "paresthesia",
    also: ["paresthesias", "paraesthesia"],
    what: "Pins and needles, tingling, or a numb patch.",
    example: "The feeling of a foot that has gone to sleep.",
  },
  {
    term: "radicular",
    what: "Pain or tingling that travels down a limb because a nerve is irritated where it leaves the spine.",
    example: "Sciatica — back pain that shoots down the leg.",
  },
  {
    term: "valgus",
    what: "The lower part of a limb angling outward, so the joint above it falls inward.",
    example: "Knock knees — the knees drift together, the feet apart.",
  },
  {
    term: "varus",
    what: "The lower part of a limb angling inward, so the joint above it pushes outward.",
    example: "Bow legs — a gap between the knees when the feet are together.",
  },

  // — how muscles work —
  {
    term: "eccentric",
    also: ["eccentrically"],
    what: "A muscle working while it lengthens — braking a movement rather than driving it.",
    example: "Lowering a heavy bag slowly to the floor.",
  },
  {
    term: "concentric",
    also: ["concentrically"],
    what: "A muscle working while it shortens, producing the movement.",
    example: "Lifting the bag back up.",
  },
  {
    term: "isometric",
    also: ["isometrically"],
    what: "A muscle working hard without the joint moving at all.",
    example: "Holding a plank.",
  },
  {
    term: "compression",
    what: "Pressing a joint or a nerve together.",
    example: "A test that presses down through the top of your head to see if it reproduces neck symptoms.",
  },
  {
    term: "traction",
    what: "Gently pulling a joint apart to take pressure off it.",
    example: "A clinician drawing your arm away from your shoulder to unload the joint.",
  },

  // — reading the numbers —
  {
    term: "sensitivity",
    also: ["sensitive"],
    what: "How good a test is at catching people who really do have the problem. A very sensitive test that comes back negative is good evidence you don't have it.",
    example: "Sensitivity of 95% means the test finds 95 out of every 100 people who have the condition.",
  },
  {
    term: "specificity",
    also: ["specific"],
    what: "How good a test is at clearing people who don't have the problem. A very specific test that comes back positive is good evidence you do have it.",
    example: "Specificity of 95% means only 5 of every 100 healthy people are wrongly flagged.",
  },
];

/** Every string that should be matched, mapped back to its entry — built once. */
export const PLAIN_TERM_LOOKUP: ReadonlyMap<string, PlainTerm> = buildLookup(PLAIN_TERMS);

function buildLookup(terms: readonly PlainTerm[]): ReadonlyMap<string, PlainTerm> {
  return new Map(terms.flatMap((t) => [t.term, ...(t.also ?? [])].map((k) => [k.toLowerCase(), t] as const)));
}

/** The vocabulary of a study write-up — used on study breakdowns and the public evidence
 *  pages (components/ArticleBreakdown.tsx), where the reader may be a patient who has never
 *  seen a confidence interval. Same rule as the anatomy list: every entry gets an example
 *  someone can picture.
 *
 *  Abbreviations are included only where they cannot collide with an ordinary English word
 *  under case-insensitive matching — "RCT" and "MCID" are safe, "OR" and "MD" are not. */
export const RESEARCH_TERMS: PlainTerm[] = [
  {
    term: "randomized controlled trial",
    also: ["randomised controlled trial", "RCT", "RCTs", "randomized", "randomised"],
    what: "A study where people are assigned by chance to different treatments, so the groups start out alike and differences at the end are more likely due to the treatment.",
    example: "Like flipping a coin to decide who gets the new exercise program and who gets usual care.",
  },
  {
    term: "systematic review",
    also: ["systematic reviews"],
    what: "A study of studies: researchers search for every trial on a question and weigh them together, using rules set in advance.",
    example: "Instead of trusting one trial of 40 people, looking at all 15 trials on the same question.",
  },
  {
    term: "meta-analysis",
    also: ["meta-analyses", "meta analysis"],
    what: "The math step in many systematic reviews, where results from several studies are combined into one overall estimate.",
    example: "Pooling five small trials into one bigger answer.",
  },
  {
    term: "cohort study",
    also: ["cohort", "prospective cohort", "retrospective cohort"],
    what: "A study that follows a group of people over time to see who develops an outcome. It can show links, but not prove cause.",
    example: "Following 1,000 runners for a year to see who gets injured.",
  },
  {
    term: "cross-sectional",
    what: "A snapshot study: everything is measured at one point in time.",
    example: "Surveying people once about both their sleep and their back pain.",
  },
  {
    term: "control group",
    // Not bare "control": "motor control exercise" would open the wrong explanation.
    also: ["comparison group"],
    what: "The group that does not get the treatment being tested, so there is something to compare against.",
    example: "The group that keeps their usual routine while the other group starts a new program.",
  },
  {
    term: "placebo",
    also: ["sham"],
    what: "A fake treatment that looks like the real one, used to separate the treatment's real effect from the effect of expecting to get better.",
    example: "Ultrasound with the machine switched off.",
  },
  {
    term: "blinded",
    also: ["blinding", "double-blind", "single-blind", "assessor-blinded"],
    what: "Keeping people from knowing who got which treatment, so expectations don't sway the results.",
    example: "The person measuring your strength doesn't know which group you were in.",
  },
  {
    term: "intention-to-treat",
    also: ["intention to treat", "ITT"],
    what: "Analyzing everyone in the group they were assigned to, even if they stopped or switched, which keeps the comparison fair.",
    example: "Counting someone in the exercise group even though they quit after two weeks.",
  },
  {
    term: "confidence interval",
    also: ["confidence intervals", "95% CI", "CI"],
    what: "The range where the true result probably lies. A narrow range means a precise estimate; a wide one means more uncertainty.",
    example: "\"Pain improved by 2 points (CI 1 to 3)\" means the real improvement is probably somewhere between 1 and 3.",
  },
  {
    term: "p-value",
    also: ["p value", "p-values"],
    what: "A number showing how surprising a result would be if the treatment actually did nothing. Small values (under 0.05) are called statistically significant. It does not say how big or important an effect is.",
    example: "p = 0.01 means a result this large would rarely happen by chance alone.",
  },
  {
    term: "statistically significant",
    also: ["statistical significance", "not statistically significant"],
    what: "The result is unlikely to be due to chance alone. It does not mean the difference is large enough to matter to a patient.",
    example: "A pill that lowers pain by a statistically significant 0.3 out of 10 — real, but too small to feel.",
  },
  {
    term: "effect size",
    also: ["effect sizes"],
    what: "How big the difference between groups was, not just whether there was one.",
    example: "Knowing a treatment helped is one thing; knowing it cut pain in half is the effect size.",
  },
  {
    term: "standardized mean difference",
    also: ["SMD"],
    what: "An effect size that lets studies using different scales be compared. Roughly: 0.2 is small, 0.5 medium, 0.8 large.",
    example: "Comparing two pain studies when one used a 0-10 scale and the other a 0-100 scale.",
  },
  {
    term: "mean difference",
    what: "The average result in one group minus the average in the other.",
    example: "If one group's pain dropped 4 points and the other's dropped 2, the mean difference is 2.",
  },
  {
    term: "odds ratio",
    also: ["risk ratio", "relative risk", "hazard ratio"],
    what: "Compares how likely an outcome is in one group versus another. A value of 1 means no difference.",
    example: "A risk ratio of 0.5 for falls means half as many falls in the treated group.",
  },
  {
    term: "MCID",
    also: ["minimal clinically important difference", "minimal important difference"],
    what: "The smallest change on a scale that patients typically notice as meaningful.",
    example: "On a 0-10 pain scale, a drop of about 2 points is usually the smallest change people feel.",
  },
  {
    term: "MDC",
    also: ["minimal detectable change"],
    what: "The smallest change that is bigger than measurement error. Anything smaller could just be noise.",
    example: "If a balance test varies by 4 points day to day, a 3-point change isn't a real change.",
  },
  {
    term: "primary outcome",
    also: ["primary outcomes", "primary endpoint"],
    what: "The main result the study was designed to measure, chosen before it started.",
    example: "A back pain trial's primary outcome might be disability after 12 weeks.",
  },
  {
    term: "secondary outcome",
    also: ["secondary outcomes"],
    what: "Extra results measured alongside the main one. Useful, but more likely to show chance findings.",
    example: "Sleep quality measured in a trial that was really about pain.",
  },
  {
    term: "follow-up",
    also: ["follow up"],
    what: "How long after the treatment people were checked on.",
    example: "A 1-year follow-up tells you whether the benefit lasted, not just whether it showed up.",
  },
  {
    term: "baseline",
    what: "Measurements taken at the start of a study, before treatment.",
    example: "Your pain score on day one, before any exercises.",
  },
  {
    term: "adverse events",
    also: ["adverse event", "side effects"],
    what: "Anything harmful or unwanted that happened to participants during the study.",
    example: "Muscle soreness that lasted a week after starting a program.",
  },
  {
    term: "heterogeneity",
    what: "How much the results of the studies in a review disagree with one another. High heterogeneity makes a pooled answer less trustworthy.",
    example: "Five trials where two found big benefits and three found none.",
  },
  {
    term: "certainty of evidence",
    // Not "GRADE": matched case-insensitively it would catch "Grade II sprain".
    also: ["quality of evidence", "low certainty", "moderate certainty", "high certainty", "very low certainty"],
    what: "A rating of how confident reviewers are that the result is close to the truth. Low certainty means future studies could easily change the answer.",
    example: "\"Low-certainty evidence\" is a promising early sign, not a settled fact.",
  },
  {
    term: "pilot study",
    also: ["feasibility study", "feasibility"],
    what: "A small trial run to test whether a bigger study is practical. Not designed to prove the treatment works.",
    example: "Trying a program with 20 people to see if they'll stick with it.",
  },
  {
    term: "non-inferiority",
    also: ["noninferiority", "non-inferior"],
    what: "A study designed to show a treatment is not meaningfully worse than an existing one — often because it is cheaper or easier.",
    example: "Showing telehealth physical therapy works about as well as in-person visits.",
  },
  {
    term: "usual care",
    also: ["standard care"],
    what: "Whatever treatment people would normally get, used as the comparison.",
    example: "The usual advice and pain medication from a family doctor.",
  },
];

/** Anatomy entries that also appear in study write-ups and read cleanly there. Chosen by
 *  hand: "specific" and "lateral" are glossary words in the Atlas but ordinary English in a
 *  study summary, and underlining them would be noise. */
const RESEARCH_ANATOMY_TERMS = new Set([
  "flexion",
  "extension",
  "abduction",
  "adduction",
  "tendinopathy",
  "impingement",
  "instability",
  "stenosis",
  "radicular",
  "paresthesia",
  "eccentric",
  "concentric",
  "isometric",
  "bilateral",
  "atrophy",
  "laxity",
]);

export const RESEARCH_TERM_LOOKUP: ReadonlyMap<string, PlainTerm> = buildLookup([
  ...RESEARCH_TERMS,
  ...PLAIN_TERMS.filter((t) => RESEARCH_ANATOMY_TERMS.has(t.term)),
]);
