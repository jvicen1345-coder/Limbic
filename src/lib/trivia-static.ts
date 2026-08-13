/**
 * Health Trivia's static question bank (see app/(app)/games/trivia/page.tsx,
 * components/HealthTriviaGame.tsx) — general-public health and wellness knowledge, no
 * clinical jargon or diagnosis-adjacent content. Interleaved round-robin by topic (sleep,
 * hydration, exercise, nutrition, mental, general, repeating) so a 5-question daily window
 * naturally samples a mix of topics rather than five questions from the same bucket, same
 * "interleave for variety" reasoning as lib/cases-static.ts's specialty rotation.
 */

export type TriviaTopic = "sleep" | "hydration" | "exercise" | "nutrition" | "mental" | "general";

export interface TriviaQuestion {
  id: string;
  topic: TriviaTopic;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: "sleep-1",
    topic: "sleep",
    question: "How many hours of sleep do most adults need per night?",
    options: ["5-6", "6-7", "7-9", "9-11"],
    correctIndex: 2,
    explanation: "Most adults function best with 7-9 hours of sleep a night, per general sleep health guidelines.",
  },
  {
    id: "hydration-1",
    topic: "hydration",
    question: "What percentage of the human body is water?",
    options: ["30-40%", "45-55%", "55-65%", "70-80%"],
    correctIndex: 2,
    explanation: "The human body is roughly 55-65% water, though this varies somewhat by age, sex, and body composition.",
  },
  {
    id: "exercise-1",
    topic: "exercise",
    question: "How many minutes of moderate exercise per week do general guidelines recommend?",
    options: ["75", "150", "200", "300"],
    correctIndex: 1,
    explanation: "General guidelines recommend at least 150 minutes of moderate-intensity aerobic activity per week.",
  },
  {
    id: "nutrition-1",
    topic: "nutrition",
    question: "Which vitamin does sunlight help your body produce?",
    options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
    correctIndex: 3,
    explanation: "Skin produces Vitamin D when exposed to sunlight, which is why it's sometimes called the \"sunshine vitamin.\"",
  },
  {
    id: "mental-1",
    topic: "mental",
    question: "Which activity is commonly recommended for stress reduction?",
    options: ["Eating more", "Sleeping less", "Regular exercise", "Avoiding social contact"],
    correctIndex: 2,
    explanation: "Regular exercise is one of the most commonly recommended, well-supported habits for reducing stress.",
  },
  {
    id: "general-1",
    topic: "general",
    question: "What is a commonly cited daily step goal for general wellness?",
    options: ["2,000", "5,000", "10,000", "20,000"],
    correctIndex: 2,
    explanation: "10,000 steps a day is a widely cited general wellness benchmark, though any increase in daily movement helps.",
  },
  {
    id: "sleep-2",
    topic: "sleep",
    question: "Which of these habits is most likely to improve sleep quality?",
    options: ["A consistent sleep schedule", "Bright screens right before bed", "A late afternoon nap", "Caffeine in the evening"],
    correctIndex: 0,
    explanation: "Going to bed and waking up at consistent times helps regulate the body's internal clock and improves sleep quality.",
  },
  {
    id: "hydration-2",
    topic: "hydration",
    question: "Which of these is an early sign of dehydration?",
    options: ["Bright yellow, clear urine", "Feeling thirsty", "Increased energy", "Lower heart rate"],
    correctIndex: 1,
    explanation: "Thirst is the body's early signal that fluid intake is running low, a simple, practical cue to drink more water.",
  },
  {
    id: "exercise-2",
    topic: "exercise",
    question: "Which type of exercise is best described as \"weight-bearing\"?",
    options: ["Swimming", "Walking", "Cycling", "Stretching"],
    correctIndex: 1,
    explanation: "Walking is weight-bearing because it requires supporting your own body weight against gravity, which helps bone health.",
  },
  {
    id: "nutrition-2",
    topic: "nutrition",
    question: "Which nutrient is the body's main source of quick energy?",
    options: ["Protein", "Carbohydrates", "Fiber", "Water"],
    correctIndex: 1,
    explanation: "Carbohydrates are broken down into glucose, the body's preferred and quickest source of usable energy.",
  },
  {
    id: "mental-2",
    topic: "mental",
    question: "Which of these is a healthy way to cope with everyday stress?",
    options: ["Bottling up feelings", "Talking with someone you trust", "Skipping meals", "Isolating from others"],
    correctIndex: 1,
    explanation: "Talking with someone you trust is a widely recommended, healthy way to process and manage everyday stress.",
  },
  {
    id: "general-2",
    topic: "general",
    question: "How often is it generally recommended that adults get a routine health checkup?",
    options: ["Every week", "Every year", "Every 10 years", "Never, unless sick"],
    correctIndex: 1,
    explanation: "An annual routine checkup is a common general recommendation for catching issues early, even when feeling well.",
  },
  {
    id: "sleep-3",
    topic: "sleep",
    question: "What is the term for the natural, roughly 24-hour cycle that regulates sleep and wakefulness?",
    options: ["Metabolic cycle", "Circadian rhythm", "REM cycle", "Growth cycle"],
    correctIndex: 1,
    explanation: "The circadian rhythm is the body's internal roughly 24-hour clock that regulates sleep, wakefulness, and other functions.",
  },
  {
    id: "hydration-3",
    topic: "hydration",
    question: "Besides water, which of these also contributes meaningfully to daily hydration?",
    options: ["Fruits and vegetables", "Table salt", "Black pepper", "Dry crackers"],
    correctIndex: 0,
    explanation: "Many fruits and vegetables (like watermelon and cucumber) have high water content and contribute to daily hydration.",
  },
  {
    id: "exercise-3",
    topic: "exercise",
    question: "What is the main purpose of stretching before or after exercise?",
    options: ["To build muscle mass", "To improve flexibility and mobility", "To increase heart rate quickly", "To burn the most calories"],
    correctIndex: 1,
    explanation: "Stretching primarily helps maintain and improve flexibility and joint mobility, not build muscle or maximize calorie burn.",
  },
  {
    id: "nutrition-3",
    topic: "nutrition",
    question: "Which of these is generally considered a lean protein source?",
    options: ["Chicken breast", "Bacon", "Butter", "Fried dough"],
    correctIndex: 0,
    explanation: "Chicken breast is a commonly cited lean protein source, high in protein, relatively low in saturated fat.",
  },
  {
    id: "mental-3",
    topic: "mental",
    question: "Which of these best describes \"mindfulness\"?",
    options: ["Planning far into the future", "Multitasking efficiently", "Paying attention to the present moment", "Avoiding difficult emotions"],
    correctIndex: 2,
    explanation: "Mindfulness generally means paying deliberate, non-judgmental attention to what's happening right now.",
  },
  {
    id: "general-3",
    topic: "general",
    question: "Which of these is a core muscle group that helps stabilize the spine?",
    options: ["Biceps", "Abdominals", "Calves", "Forearms"],
    correctIndex: 1,
    explanation: "The abdominal muscles are a key part of the \"core\" that helps stabilize the spine and support posture.",
  },
  {
    id: "sleep-4",
    topic: "sleep",
    question: "Which of these commonly disrupts sleep quality?",
    options: ["A cool, dark room", "Consistent bedtime", "Caffeine late in the day", "Regular daytime exercise"],
    correctIndex: 2,
    explanation: "Caffeine consumed later in the day can stay in the system for hours and commonly disrupts falling and staying asleep.",
  },
  {
    id: "hydration-4",
    topic: "hydration",
    question: "During exercise, why does the body need more fluids than usual?",
    options: ["To slow digestion", "To replace fluid lost through sweat", "To reduce muscle strength", "To increase body fat"],
    correctIndex: 1,
    explanation: "Exercise increases sweating, and replacing that lost fluid helps maintain performance and prevent dehydration.",
  },
  {
    id: "exercise-4",
    topic: "exercise",
    question: "Which of these is an example of aerobic (cardio) exercise?",
    options: ["Brisk walking", "Heavy weightlifting", "Static stretching", "Balance training"],
    correctIndex: 0,
    explanation: "Brisk walking raises the heart rate over a sustained period, which is the defining feature of aerobic exercise.",
  },
  {
    id: "nutrition-4",
    topic: "nutrition",
    question: "Which of these is a good source of dietary fiber?",
    options: ["White bread", "Whole fruits and vegetables", "Soda", "Candy"],
    correctIndex: 1,
    explanation: "Whole fruits and vegetables retain their natural fiber, which supports digestion and general health.",
  },
  {
    id: "mental-4",
    topic: "mental",
    question: "Which of these is a common sign that someone may benefit from mental health support?",
    options: ["Persistent low mood for weeks", "Feeling tired after a long day", "Being nervous before a big event", "Preferring quiet time occasionally"],
    correctIndex: 0,
    explanation: "A persistent low mood lasting weeks, rather than a brief, situational dip, is a common sign worth discussing with someone.",
  },
  {
    id: "general-4",
    topic: "general",
    question: "What is generally recommended to protect skin from sun damage?",
    options: ["Sunscreen", "More caffeine", "Less water", "Tighter clothing"],
    correctIndex: 0,
    explanation: "Sunscreen is a commonly recommended, simple way to help protect skin from UV damage.",
  },
  {
    id: "sleep-5",
    topic: "sleep",
    question: "Which of these is a commonly recommended wind-down habit before bed?",
    options: ["Intense exercise", "A large heavy meal", "Reading or relaxing quietly", "A loud, bright room"],
    correctIndex: 2,
    explanation: "A quiet, relaxing wind-down routine, like reading, is commonly recommended to help the body prepare for sleep.",
  },
  {
    id: "hydration-5",
    topic: "hydration",
    question: "Which color of urine generally suggests good hydration?",
    options: ["Dark amber", "Pale yellow", "Bright orange", "Cloudy brown"],
    correctIndex: 1,
    explanation: "Pale yellow urine is generally a sign of adequate hydration; darker shades often suggest drinking more water.",
  },
  {
    id: "exercise-5",
    topic: "exercise",
    question: "What does \"weight-bearing exercise\" primarily help support?",
    options: ["Eyesight", "Bone density", "Digestion", "Hearing"],
    correctIndex: 1,
    explanation: "Weight-bearing exercise, like walking or dancing, helps support and maintain bone density over time.",
  },
  {
    id: "nutrition-5",
    topic: "nutrition",
    question: "Which mineral, found in dairy and leafy greens, is important for bone health?",
    options: ["Iron", "Calcium", "Potassium", "Zinc"],
    correctIndex: 1,
    explanation: "Calcium, found in foods like dairy and leafy greens, is a key mineral for building and maintaining strong bones.",
  },
  {
    id: "mental-5",
    topic: "mental",
    question: "Which of these is a simple, commonly recommended relaxation technique?",
    options: ["Holding your breath as long as possible", "Slow, deep breathing", "Rapid shallow breathing", "Skipping breaks entirely"],
    correctIndex: 1,
    explanation: "Slow, deep breathing is a simple, widely recommended technique for calming the body's stress response.",
  },
  {
    id: "general-5",
    topic: "general",
    question: "Which of these habits is generally linked to better long-term heart health?",
    options: ["Smoking", "Regular physical activity", "High sodium diet", "Sedentary lifestyle"],
    correctIndex: 1,
    explanation: "Regular physical activity is one of the most consistently cited habits for supporting long-term heart health.",
  },
  {
    id: "sleep-6",
    topic: "sleep",
    question: "Which age group generally needs the most sleep per night?",
    options: ["Older adults", "Adults", "Teenagers", "Infants"],
    correctIndex: 3,
    explanation: "Infants generally need the most sleep of any age group, often well over 12 hours a day, to support rapid development.",
  },
  {
    id: "hydration-6",
    topic: "hydration",
    question: "Which of these environments typically increases the body's fluid needs?",
    options: ["A cool air-conditioned room", "Hot, humid weather", "A quiet library", "A dimly lit room"],
    correctIndex: 1,
    explanation: "Hot, humid weather increases sweating, which raises the body's fluid needs to stay properly hydrated.",
  },
  {
    id: "exercise-6",
    topic: "exercise",
    question: "Which of these best describes \"flexibility training\"?",
    options: ["Lifting maximum weight", "Sprinting short distances", "Stretching to improve range of motion", "Holding your breath underwater"],
    correctIndex: 2,
    explanation: "Flexibility training focuses on stretching exercises that improve a joint's range of motion.",
  },
  {
    id: "nutrition-6",
    topic: "nutrition",
    question: "Roughly what portion of a healthy plate is often recommended to be fruits and vegetables?",
    options: ["About one-tenth", "About one-quarter", "About one-half", "Almost none"],
    correctIndex: 2,
    explanation: "Many general nutrition guidelines suggest filling about half your plate with fruits and vegetables.",
  },
  {
    id: "mental-6",
    topic: "mental",
    question: "Which of these is a healthy way to manage screen time and mental well-being?",
    options: ["Scrolling right before bed", "Taking regular breaks from screens", "Using screens during every meal", "Avoiding all breaks"],
    correctIndex: 1,
    explanation: "Taking regular breaks from screens is a commonly recommended habit for supporting overall mental well-being.",
  },
  {
    id: "general-6",
    topic: "general",
    question: "Which of these is a simple way to reduce prolonged sitting during a workday?",
    options: ["Standing or walking breaks", "Skipping lunch", "Fewer bathroom breaks", "Sitting closer to the screen"],
    correctIndex: 0,
    explanation: "Taking regular standing or walking breaks is a simple, commonly recommended way to offset long periods of sitting.",
  },
];

const DAY_MS = 86400000;
// A fixed, arbitrary epoch — just needs to be stable across deploys so the same calendar
// day always maps to the same day index (same reasoning as lib/cases-static.ts's EPOCH_MS).
const EPOCH_MS = new Date(2024, 0, 1).getTime();

function dayIndexForDateKey(dateKey: string): number {
  const ms = new Date(dateKey + "T00:00:00Z").getTime();
  return Math.floor((ms - EPOCH_MS) / DAY_MS);
}

/** Today's 5 trivia questions, in order — a rotating cyclic window over TRIVIA_QUESTIONS
 *  keyed off the day index, so every reader sees the same 5 questions on a given date and
 *  the set is stable as the bank grows. */
export function triviaQuestionsForDate(dateKey: string): TriviaQuestion[] {
  const dayIndex = dayIndexForDateKey(dateKey);
  const total = TRIVIA_QUESTIONS.length;
  const start = ((dayIndex * 5) % total + total) % total;
  return Array.from({ length: 5 }, (_, i) => TRIVIA_QUESTIONS[(start + i) % total]);
}

/** YYYY-MM-DD for "today" — the unit the daily 5-question set rotates on. */
export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
