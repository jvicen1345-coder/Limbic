/**
 * Home page "Question of the Day" content bank — general-public health & wellness trivia,
 * distinct from Limbic Boards' NPTE-style question bank (see lib/board-content.ts, which
 * stays clinician/student-facing with domain labels and clinical terminology). Everything
 * here is written for a general reader: no jargon, no assumed clinical background. Same
 * "deterministic pick for the day" pattern as lib/wordle-words.ts/lib/board-content.ts, so
 * every reader sees the same question on a given date and it's stable as the bank grows.
 */

export interface HomeQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export const HOME_QUESTIONS: HomeQuestion[] = [
  {
    id: "hq1",
    question: "Which vitamin is primarily produced by the body through sun exposure?",
    choices: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
    correctIndex: 2,
    explanation: "Skin produces vitamin D when exposed to sunlight, which is why it's nicknamed the \"sunshine vitamin.\"",
  },
  {
    id: "hq2",
    question: "What is the recommended amount of moderate exercise per week for adults according to general health guidelines?",
    choices: ["75 minutes", "150 minutes", "300 minutes", "60 minutes"],
    correctIndex: 1,
    explanation: "General guidelines recommend at least 150 minutes of moderate-intensity activity per week for most adults.",
  },
  {
    id: "hq3",
    question: "Which of the following is considered a weight-bearing exercise?",
    choices: ["Swimming", "Cycling", "Walking", "Rowing"],
    correctIndex: 2,
    explanation: "Walking makes your body work against gravity while upright, which is what makes an exercise \"weight-bearing.\"",
  },
  {
    id: "hq4",
    question: "What does stretching before exercise primarily help with?",
    choices: ["Building muscle", "Burning calories", "Preparing muscles for activity", "Improving sleep"],
    correctIndex: 2,
    explanation: "Stretching and warming up helps prepare muscles and joints for the activity ahead.",
  },
  {
    id: "hq5",
    question: "Which muscle group is responsible for stabilizing the core?",
    choices: ["Biceps", "Abdominals", "Quadriceps", "Trapezius"],
    correctIndex: 1,
    explanation: "The abdominal muscles, along with the back and pelvic muscles, work together to stabilize the core.",
  },
  {
    id: "hq6",
    question: "How many hours of sleep do most adults need per night according to general wellness guidelines?",
    choices: ["5-6", "6-7", "7-9", "9-11"],
    correctIndex: 2,
    explanation: "Most adults function best with 7 to 9 hours of sleep per night.",
  },
  {
    id: "hq7",
    question: "What is the primary benefit of regular cardiovascular exercise?",
    choices: ["Increased flexibility", "Improved heart health", "Better balance", "Stronger bones"],
    correctIndex: 1,
    explanation: "Cardiovascular exercise strengthens the heart muscle and improves circulation over time.",
  },
  {
    id: "hq8",
    question: "Which nutrient is the body's main, most readily available source of energy?",
    choices: ["Protein", "Carbohydrates", "Vitamins", "Minerals"],
    correctIndex: 1,
    explanation: "Carbohydrates are broken down into glucose, the body's preferred and most quickly usable fuel source.",
  },
  {
    id: "hq9",
    question: "What is the recommended daily water intake commonly suggested for general health?",
    choices: ["2 cups", "4 cups", "8 cups", "15 cups"],
    correctIndex: 2,
    explanation: "\"8 glasses a day\" is the commonly cited general guideline, though actual needs vary by person and activity level.",
  },
  {
    id: "hq10",
    question: "Which of the following is a common sign of dehydration?",
    choices: ["Frequent urination", "Dark yellow urine", "Clear skin", "Increased appetite"],
    correctIndex: 1,
    explanation: "Dark, concentrated urine is one of the simplest visible signs the body needs more fluids.",
  },
  {
    id: "hq11",
    question: "What does \"BMI\" stand for?",
    choices: ["Body Muscle Index", "Body Mass Index", "Basic Metabolic Index", "Bone Mineral Index"],
    correctIndex: 1,
    explanation: "BMI (Body Mass Index) is a simple ratio of weight to height used as a general screening measure.",
  },
  {
    id: "hq12",
    question: "Which food group provides the most dietary fiber?",
    choices: ["Dairy", "Meat", "Fruits and vegetables", "Oils"],
    correctIndex: 2,
    explanation: "Fruits, vegetables, whole grains, and legumes are the body's main sources of dietary fiber.",
  },
  {
    id: "hq13",
    question: "What is the main function of the lymphatic system?",
    choices: ["Pumping blood", "Digesting food", "Fighting infection and draining fluid", "Producing hormones"],
    correctIndex: 2,
    explanation: "The lymphatic system helps the body fight infection and drains excess fluid from tissues.",
  },
  {
    id: "hq14",
    question: "Which of the following best describes \"aerobic exercise\"?",
    choices: ["Lifting heavy weights", "Sustained activity that raises your heart rate", "Static stretching", "Balance training"],
    correctIndex: 1,
    explanation: "Aerobic (\"cardio\") exercise is sustained activity that raises your heart rate and breathing over time.",
  },
  {
    id: "hq15",
    question: "What is a common early warning sign of high blood pressure?",
    choices: ["There are usually no symptoms", "Sudden weight loss", "Improved vision", "Slower heart rate"],
    correctIndex: 0,
    explanation: "High blood pressure is often called a \"silent\" condition because it usually has no obvious symptoms.",
  },
  {
    id: "hq16",
    question: "Which vitamin helps the body absorb calcium?",
    choices: ["Vitamin C", "Vitamin D", "Vitamin K", "Vitamin B12"],
    correctIndex: 1,
    explanation: "Vitamin D helps the intestines absorb calcium, which is part of why the two are often mentioned together.",
  },
  {
    id: "hq17",
    question: "What is the general recommendation for how often adults should get up and move if they sit for long periods?",
    choices: ["Once a day", "Every few hours", "Every 30-60 minutes", "Only at the end of the day"],
    correctIndex: 2,
    explanation: "General guidance suggests breaking up long sitting periods with movement roughly every 30 to 60 minutes.",
  },
  {
    id: "hq18",
    question: "Which of these is considered a good source of lean protein?",
    choices: ["Butter", "Chicken breast", "White bread", "Soda"],
    correctIndex: 1,
    explanation: "Chicken breast is low in fat relative to its protein content, making it a commonly cited lean protein source.",
  },
  {
    id: "hq19",
    question: "What does \"RICE\" stand for in basic first aid for minor injuries?",
    choices: ["Rest, Ice, Compression, Elevation", "Run, Ice, Cool, Elevate", "Rest, Inflammation, Compress, Exercise", "Reduce, Ice, Contain, Elevate"],
    correctIndex: 0,
    explanation: "RICE (Rest, Ice, Compression, Elevation) is the classic general first-aid approach for minor sprains and strains.",
  },
  {
    id: "hq20",
    question: "Which of these habits is most associated with better long-term heart health?",
    choices: ["Smoking", "Regular physical activity", "High sodium diet", "Sedentary lifestyle"],
    correctIndex: 1,
    explanation: "Regular physical activity is one of the most consistently cited habits for supporting long-term heart health.",
  },
  {
    id: "hq21",
    question: "What is the general guideline for added sugar intake for most adults trying to eat healthily?",
    choices: ["As little as possible", "100 grams a day", "200 grams a day", "There is no limit"],
    correctIndex: 0,
    explanation: "General health guidelines recommend keeping added sugar as low as reasonably possible.",
  },
  {
    id: "hq22",
    question: "Which of the following is a good warm-up before exercise?",
    choices: ["Static stretching only", "Light cardio and dynamic movement", "Heavy lifting", "Skipping it entirely"],
    correctIndex: 1,
    explanation: "Light cardio and dynamic (moving) stretches gradually raise heart rate and prepare muscles for activity.",
  },
  {
    id: "hq23",
    question: "What is the primary purpose of cool-down exercises after a workout?",
    choices: ["To build muscle", "To gradually lower heart rate and aid recovery", "To burn extra calories", "To increase flexibility permanently"],
    correctIndex: 1,
    explanation: "Cooling down helps the heart rate come down gradually rather than stopping activity abruptly.",
  },
  {
    id: "hq24",
    question: "Which mineral is most associated with bone health?",
    choices: ["Iron", "Calcium", "Potassium", "Zinc"],
    correctIndex: 1,
    explanation: "Calcium is a primary building block of bone tissue throughout life.",
  },
  {
    id: "hq25",
    question: "What is a common recommendation for maintaining good posture while sitting at a desk?",
    choices: ["Slouch forward", "Keep your screen well below eye level", "Keep your feet flat and back supported", "Cross your legs at all times"],
    correctIndex: 2,
    explanation: "Feet flat on the floor and a supported back are two of the most commonly cited basics of desk posture.",
  },
  {
    id: "hq26",
    question: "Which of these best describes \"moderate intensity\" exercise?",
    choices: ["You can't talk at all", "You can talk but not sing", "You feel no exertion", "You are sprinting"],
    correctIndex: 1,
    explanation: "A simple rule of thumb for moderate intensity is being able to talk, but not sing, during the activity.",
  },
  {
    id: "hq27",
    question: "What is generally recommended before starting a new exercise program, especially for people with existing health conditions?",
    choices: ["Just start immediately", "Consult a healthcare provider", "Avoid all exercise", "Only do it once a year"],
    correctIndex: 1,
    explanation: "Checking in with a healthcare provider first is the general recommendation for anyone with existing health conditions.",
  },
  {
    id: "hq28",
    question: "Which of the following is a common sign that you may need more sleep?",
    choices: ["Feeling alert", "Difficulty concentrating during the day", "Consistent energy levels", "Fast reaction time"],
    correctIndex: 1,
    explanation: "Trouble concentrating during the day is a common sign of not getting enough restorative sleep.",
  },
  {
    id: "hq29",
    question: "What does \"cardiovascular fitness\" primarily refer to?",
    choices: ["Muscle strength", "Flexibility", "How efficiently your heart and lungs deliver oxygen", "Bone density"],
    correctIndex: 2,
    explanation: "Cardiovascular fitness describes how efficiently the heart and lungs can deliver oxygen to working muscles.",
  },
  {
    id: "hq30",
    question: "Which of these is a simple way to reduce stress according to general wellness advice?",
    choices: ["Skipping meals", "Deep breathing exercises", "Avoiding all rest", "Increasing caffeine intake"],
    correctIndex: 1,
    explanation: "Deep, slow breathing is one of the simplest, most commonly recommended ways to calm the body's stress response.",
  },
  {
    id: "hq31",
    question: "What is the general guideline for how much of your plate should be fruits and vegetables at a meal?",
    choices: ["About a quarter", "About half", "None", "All of it"],
    correctIndex: 1,
    explanation: "General nutrition guidance suggests filling about half of your plate with fruits and vegetables.",
  },
  {
    id: "hq32",
    question: "Which of these is a benefit of regular stretching?",
    choices: ["Decreased flexibility", "Improved range of motion", "Weaker muscles", "Increased injury risk"],
    correctIndex: 1,
    explanation: "Regular stretching helps maintain and improve range of motion around your joints.",
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic question of the day — same question for every reader, rotating once per
 *  calendar day. Salted distinctly from lib/board-content.ts's questionForDate/termForDate
 *  so this and Limbic Boards' own daily question never land on a correlated index. */
export function homeQuestionForDate(dateKey: string): HomeQuestion {
  const index = hashString(`hq:${dateKey}`) % HOME_QUESTIONS.length;
  return HOME_QUESTIONS[index];
}
