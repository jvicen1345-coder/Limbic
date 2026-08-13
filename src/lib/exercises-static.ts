/** Static content for /wellness/exercises — ten of the most impactful functional exercises
 *  for general health, with safety guidance. YouTube links point to real, verified public
 *  demonstration videos (checked before shipping — not guessed), same "point to the real
 *  source" approach as the FSBPT resource links on the Student Atrium. General wellness
 *  education only — see the page's own disclaimer to consult a physician or PT first. */

export type ExerciseDifficulty = "Medium" | "Hard";

export interface Exercise {
  id: string;
  name: string;
  difficulty: ExerciseDifficulty;
  muscles: string[];
  benefits: string;
  youtubeUrl: string;
  steps: string[];
  commonErrors: string[];
  regression: string;
  progression: string;
  setsReps: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "turkish-get-up",
    name: "Turkish Get Up",
    difficulty: "Hard",
    muscles: ["Full body", "Shoulder stability", "Core"],
    benefits:
      "Develops shoulder stability, full body coordination, and mobility simultaneously. One of the most comprehensive single exercises for functional fitness.",
    youtubeUrl: "https://www.youtube.com/watch?v=D6Ed9jmniqw",
    steps: [
      "Lie on your back holding a weight (or fist) pressed straight up over one shoulder",
      "Bend the knee on the loaded side, plant that foot, and roll onto your opposite forearm",
      "Press up onto your hand, then bridge your hips up off the floor",
      "Sweep your back leg through into a kneeling lunge position, arm still locked overhead",
      "Stand up out of the lunge, then reverse the whole sequence back down to the floor",
    ],
    commonErrors: [
      "Letting the loaded arm bend or drift away from vertical",
      "Rushing the transitions instead of moving deliberately through each position",
      "Losing tension through the core during the hip bridge",
    ],
    regression: "Perform without weight",
    progression: "Add kettlebell load progressively",
    setsReps: "2-3 sets of 3-5 slow, controlled reps per side, as a general guideline",
  },
  {
    id: "single-leg-deadlift",
    name: "Single Leg Deadlift",
    difficulty: "Hard",
    muscles: ["Hamstrings", "Glutes", "Core", "Balance"],
    benefits:
      "Builds posterior chain strength while challenging balance and proprioception. Highly transferable to daily activities.",
    youtubeUrl: "https://www.youtube.com/watch?v=Zfr6wizR8rs",
    steps: [
      "Stand on one leg with a soft bend in the knee",
      "Hinge at the hips, letting your torso lower toward the floor as your free leg extends behind you",
      "Keep your back flat and hips roughly square to the floor",
      "Reach toward the floor (or a weight) with control",
      "Drive through the standing leg to return to upright",
    ],
    commonErrors: [
      "Rotating the hips open instead of keeping them square",
      "Rounding the lower back instead of hinging from the hips",
      "Rushing the movement, which sacrifices balance",
    ],
    regression: "Touch down single leg deadlift with toe tap",
    progression: "Add dumbbell or kettlebell load",
    setsReps: "2-3 sets of 8-10 reps per side, as a general guideline",
  },
  {
    id: "pistol-squat",
    name: "Pistol Squat",
    difficulty: "Hard",
    muscles: ["Quadriceps", "Glutes", "Core", "Ankle stability"],
    benefits:
      "Demands significant single leg strength, mobility, and balance. One of the best bodyweight lower body exercises.",
    youtubeUrl: "https://www.youtube.com/watch?v=vq5-vdgJc0I",
    steps: [
      "Stand on one leg with the other leg extended out in front of you",
      "Reach your arms forward for balance as you sit back and down",
      "Lower until your hip is below your knee, keeping your extended leg off the floor",
      "Keep your heel planted and chest up throughout the descent",
      "Drive through your heel to stand back up",
    ],
    commonErrors: [
      "Letting the heel lift off the floor",
      "Rounding the lower back to reach greater depth",
      "Letting the knee cave inward on the way down",
    ],
    regression: "Box assisted pistol squat",
    progression: "Add weight vest or hold a plate",
    setsReps: "2-3 sets of 4-6 reps per side, as a general guideline",
  },
  {
    id: "pull-up",
    name: "Pull Up",
    difficulty: "Hard",
    muscles: ["Latissimus dorsi", "Biceps", "Core"],
    benefits:
      "The gold standard upper body pulling exercise. Builds functional strength that transfers to many daily activities.",
    youtubeUrl: "https://www.youtube.com/watch?v=aNUSgyWRJYA",
    steps: [
      "Hang from a bar with an overhand grip, slightly wider than shoulder width",
      "Engage your shoulder blades; pull them down and back",
      "Pull your chest up toward the bar, leading with your elbows",
      "Get your chin over the bar without excessive swinging",
      "Lower back down under control to a full hang",
    ],
    commonErrors: [
      "Using momentum or kipping instead of controlled strength",
      "Not achieving a full range of motion (partial reps)",
      "Shrugging the shoulders up toward the ears instead of engaging the lats",
    ],
    regression: "Band assisted pull up or inverted row",
    progression: "Weighted pull up",
    setsReps: "3-4 sets of as many quality reps as possible, as a general guideline",
  },
  {
    id: "plank-with-reach",
    name: "Plank with Reach",
    difficulty: "Medium",
    muscles: ["Core", "Shoulder stability", "Anti-rotation"],
    benefits:
      "Challenges core stability while adding rotational demand. Superior to standard plank for functional core training.",
    youtubeUrl: "https://www.youtube.com/watch?v=PqUi-H1edcE",
    steps: [
      "Start in a forearm or high plank position with a neutral spine",
      "Brace your core so your hips don't shift or rotate",
      "Reach one arm straight forward without letting your torso rotate or sag",
      "Return the arm to the starting position with control",
      "Repeat on the opposite side",
    ],
    commonErrors: [
      "Letting the hips rotate or sag as the arm reaches forward",
      "Reaching too fast, using momentum instead of control",
      "Holding your breath instead of breathing steadily",
    ],
    regression: "Standard forearm plank",
    progression: "Add ankle weight to reaching arm",
    setsReps: "2-3 sets of 6-8 reaches per side, as a general guideline",
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    difficulty: "Hard",
    muscles: ["Quadriceps", "Glutes", "Hip flexors"],
    benefits:
      "Among the most effective single leg exercises for building lower body strength and addressing asymmetries.",
    youtubeUrl: "https://www.youtube.com/watch?v=VPhhE6bBzZE",
    steps: [
      "Stand a couple feet in front of a bench, resting the top of one foot on it behind you",
      "Lower your back knee toward the floor, keeping most of your weight on your front leg",
      "Keep your front shin roughly vertical and chest up",
      "Descend until your back knee nearly touches the floor",
      "Drive through your front heel to stand back up",
    ],
    commonErrors: [
      "Placing the back foot too close, forcing the front knee too far past the toes",
      "Letting the front knee cave inward",
      "Pushing off the back foot instead of the front leg doing the work",
    ],
    regression: "Rear foot elevated lunge without bench elevation",
    progression: "Add dumbbells or barbell",
    setsReps: "2-3 sets of 8-10 reps per side, as a general guideline",
  },
  {
    id: "push-up-plus",
    name: "Push Up Plus",
    difficulty: "Medium",
    muscles: ["Chest", "Triceps", "Serratus anterior", "Shoulder stability"],
    benefits:
      "The plus at the top of the push up activates the serratus anterior, which is critical for shoulder blade stability and injury prevention.",
    youtubeUrl: "https://www.youtube.com/watch?v=RR5xJ1mXEV4",
    steps: [
      "Start in a push up position with hands slightly wider than shoulders",
      "Lower your chest toward the floor with elbows at roughly a 45-degree angle",
      "Push back up to the top of the push up",
      "At the top, push a little further; round your upper back and let your shoulder blades spread apart (the 'plus')",
      "Return to the standard top position and repeat",
    ],
    commonErrors: [
      "Skipping the 'plus', stopping at a standard push up top position",
      "Letting the hips sag or pike up",
      "Shrugging the shoulders instead of protracting the shoulder blades",
    ],
    regression: "Wall push up plus",
    progression: "Add weight vest",
    setsReps: "2-3 sets of 10-12 reps, as a general guideline",
  },
  {
    id: "nordic-hamstring-curl",
    name: "Nordic Hamstring Curl",
    difficulty: "Hard",
    muscles: ["Hamstrings, eccentric emphasis"],
    benefits:
      "The most evidence supported exercise for hamstring injury prevention. Eccentric loading builds resilience that concentric training cannot.",
    youtubeUrl: "https://www.youtube.com/watch?v=Yn7aqLkeF0U",
    steps: [
      "Kneel with your ankles secured (a partner holding them, or an anchor)",
      "Keep your body in a straight line from knees to head",
      "Slowly lower your torso toward the floor, resisting with your hamstrings as long as possible",
      "Catch yourself with your hands as you reach the floor",
      "Push back up to the starting kneeling position",
    ],
    commonErrors: [
      "Bending at the hips instead of staying in a straight line",
      "Dropping too fast instead of resisting the descent with control",
      "Attempting too many reps too soon; this exercise causes significant soreness for beginners",
    ],
    regression: "Partner assisted with resistance band",
    progression: "Slow tempo increase",
    setsReps: "2-3 sets of 3-6 reps, as a general guideline; start very conservatively",
  },
  {
    id: "bear-crawl",
    name: "Bear Crawl",
    difficulty: "Medium",
    muscles: ["Core", "Shoulders", "Hips", "Coordination"],
    benefits:
      "Develops contralateral coordination, core stability, and shoulder endurance. Used in elite athletic training and PT rehabilitation.",
    youtubeUrl: "https://www.youtube.com/watch?v=Gb2e9edK8a4",
    steps: [
      "Start on hands and knees, then lift your knees an inch off the floor",
      "Keep your back flat and core braced",
      "Move your opposite hand and foot forward together",
      "Then move the other hand and foot forward",
      "Continue crawling forward while keeping your hips low and steady",
    ],
    commonErrors: [
      "Letting the hips rise up too high, turning it into a bear-shaped walk instead of a crawl",
      "Moving the same-side hand and foot together instead of opposite limbs",
      "Holding your breath instead of breathing steadily",
    ],
    regression: "Dead bug on the floor",
    progression: "Bear crawl with resistance band around waist",
    setsReps: "2-3 sets of 20-30 feet of crawling, as a general guideline",
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    difficulty: "Medium",
    muscles: ["Deep core", "Anti-extension stability"],
    benefits:
      "One of the safest and most effective core exercises. Teaches the core to stabilize while the limbs move, exactly what it needs to do in real life.",
    youtubeUrl: "https://www.youtube.com/watch?v=bxn9FBrt4-A",
    steps: [
      "Lie on your back with arms reaching toward the ceiling and knees bent 90 degrees over your hips",
      "Press your lower back flat into the floor and brace your core",
      "Slowly lower one arm overhead and the opposite leg toward the floor",
      "Keep your lower back pressed flat the whole time; stop before it arches",
      "Return to the starting position and repeat on the other side",
    ],
    commonErrors: [
      "Letting the lower back arch off the floor as the limbs lower",
      "Moving too fast to maintain control",
      "Holding your breath instead of exhaling as the limbs extend",
    ],
    regression: "Single leg extension only",
    progression: "Add resistance band",
    setsReps: "2-3 sets of 8-10 reps per side, as a general guideline",
  },
];
