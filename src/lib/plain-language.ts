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
export const PLAIN_TERM_LOOKUP: ReadonlyMap<string, PlainTerm> = new Map(
  PLAIN_TERMS.flatMap((t) => [t.term, ...(t.also ?? [])].map((k) => [k.toLowerCase(), t] as const))
);
