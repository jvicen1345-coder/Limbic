"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

type DashScale = "difficulty" | "interference" | "limited" | "severity" | "sleep" | "agreement";

const SCALE_LABELS: Record<DashScale, string[]> = {
  difficulty: ["1, no difficulty", "2, mild difficulty", "3, moderate difficulty", "4, severe difficulty", "5, unable"],
  interference: ["1, not at all", "2, slightly", "3, moderately", "4, quite a bit", "5, extremely"],
  limited: ["1, not limited at all", "2, slightly limited", "3, moderately limited", "4, very limited", "5, unable"],
  severity: ["1, none", "2, mild", "3, moderate", "4, severe", "5, extreme"],
  sleep: ["1, no difficulty", "2, mild difficulty", "3, moderate difficulty", "4, severe difficulty", "5, so much difficulty that I can't sleep"],
  agreement: ["1, strongly disagree", "2, disagree", "3, neither agree nor disagree", "4, agree", "5, strongly agree"],
};

// The full published 30-item DASH (Disabilities of the Arm, Shoulder and Hand) — items
// 1-21 ask about difficulty with an activity, 22-23 ask about interference/limitation,
// 24-28 ask about symptom severity, 29 asks about sleep difficulty, and 30 is a single
// agreement statement. All 30 still contribute a 1-5 value to the same average, only the
// anchor wording shown to the patient differs by item type, matching the real instrument.
const DASH_ITEMS: { text: string; scale: DashScale }[] = [
  { text: "Open a tight or new jar", scale: "difficulty" },
  { text: "Write", scale: "difficulty" },
  { text: "Turn a key", scale: "difficulty" },
  { text: "Prepare a meal", scale: "difficulty" },
  { text: "Push open a heavy door", scale: "difficulty" },
  { text: "Place an object on a shelf above your head", scale: "difficulty" },
  { text: "Do heavy household chores (e.g., wash walls, wash floors)", scale: "difficulty" },
  { text: "Garden or do yard work", scale: "difficulty" },
  { text: "Make a bed", scale: "difficulty" },
  { text: "Carry a shopping bag or briefcase", scale: "difficulty" },
  { text: "Carry a heavy object (over 10 lbs)", scale: "difficulty" },
  { text: "Change a lightbulb overhead", scale: "difficulty" },
  { text: "Wash or blow dry your hair", scale: "difficulty" },
  { text: "Wash your back", scale: "difficulty" },
  { text: "Put on a pullover sweater", scale: "difficulty" },
  { text: "Use a knife to cut food", scale: "difficulty" },
  { text: "Recreational activities which require little effort (e.g., cardplaying, knitting)", scale: "difficulty" },
  { text: "Recreational activities in which you take some force or impact through your arm, shoulder, or hand (e.g., golf, hammering, tennis)", scale: "difficulty" },
  { text: "Recreational activities in which you move your arm freely (e.g., playing frisbee, badminton)", scale: "difficulty" },
  { text: "Manage transportation needs (getting from one place to another)", scale: "difficulty" },
  { text: "Sexual activities", scale: "difficulty" },
  {
    text: "During the past week, to what extent has your arm, shoulder, or hand problem interfered with your normal social activities with family, friends, neighbors, or groups?",
    scale: "interference",
  },
  {
    text: "During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder, or hand problem?",
    scale: "limited",
  },
  { text: "Arm, shoulder, or hand pain", scale: "severity" },
  { text: "Arm, shoulder, or hand pain when you performed any specific activity", scale: "severity" },
  { text: "Tingling (pins and needles) in your arm, shoulder, or hand", scale: "severity" },
  { text: "Weakness in your arm, shoulder, or hand", scale: "severity" },
  { text: "Stiffness in your arm, shoulder, or hand", scale: "severity" },
  { text: "During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder, or hand?", scale: "sleep" },
  { text: "I feel less capable, less confident, or less useful because of my arm, shoulder, or hand problem", scale: "agreement" },
];

export function DashCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(DASH_ITEMS.length).fill(1));

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const dashScore = Math.round((average - 1) * 25 * 10) / 10;

  return (
    <>
      <CalcCardShell
        name="DASH"
        fullName="Disabilities of Arm, Shoulder, and Hand"
        measures="Patient-reported upper extremity disability and symptoms."
        population="Any upper extremity condition"
        itemCount="30 items"
        onOpen={() => setOpen(true)}
      />
      <CalcModal
        open={open}
        title="DASH, Disabilities of Arm, Shoulder, and Hand"
        onClose={() => setOpen(false)}
        testKey="dash"
        testName="DASH"
        result={{ value: `${dashScore} / 100`, label: "Formula: ((sum of items / 30) - 1) x 25, higher indicates more disability" }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {DASH_ITEMS.map((item, i) => (
            <div className="pro-item-row" key={item.text}>
              <span className="pro-item-row-label">
                {i + 1}. {item.text}
              </span>
              <select
                className="input pro-item-row-select"
                value={scores[i]}
                onChange={(e) => {
                  const next = [...scores];
                  next[i] = Number(e.target.value);
                  setScores(next);
                }}
              >
                {SCALE_LABELS[item.scale].map((label, idx) => (
                  <option key={idx} value={idx + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value">{dashScore} / 100</div>
          <div className="pro-calc-result-label">Formula: ((sum of items / 30) - 1) &times; 25, higher indicates more disability</div>
        </div>
        <p style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 8 }}>
          The full score requires at least 27 of 30 items answered per the published scoring manual, unanswered items
          here default to 1 (no difficulty/none).
        </p>
      </CalcModal>
    </>
  );
}
