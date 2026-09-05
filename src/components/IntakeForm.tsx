"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitIntake } from "@/app/actions/intake";
import {
  EMPTY_INTAKE_ANSWERS,
  INTAKE_ACTIVITIES,
  INTAKE_ACTIVITY_LEVELS,
  INTAKE_EQUIPMENT,
  INTAKE_VENUES,
  type IntakeAnswers,
} from "@/lib/intake";

/** The client-facing intake, rendered by app/intake/page.tsx for anyone holding a valid
 *  link. Same six sections as the PDF that preceded it, in the same order, so a client who
 *  was sent one and then the other isn't answering a different set of questions.
 *
 *  Written as one screen rather than a wizard on purpose: it is fifteen questions, and a
 *  client can see the whole ask before starting instead of discovering it a step at a time. */
export function IntakeForm() {
  const [answers, setAnswers] = useState<IntakeAnswers>(EMPTY_INTAKE_ANSWERS);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const set = <K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const toggle = (key: "activities" | "equipment" | "venues", value: string) =>
    setAnswers((a) => ({
      ...a,
      [key]: a[key].includes(value) ? a[key].filter((v) => v !== value) : [...a[key], value],
    }));

  const handleSubmit = () => {
    if (!answers.goalShort.trim() && !answers.goalLong.trim()) {
      setError("Please tell us at least one thing you'd like to work towards.");
      return;
    }
    setError(null);
    startTransition(async () => {
      // The token stays in the URL and is read here rather than held in state, so a reload
      // mid-form resumes against the same link instead of losing it.
      const token = new URLSearchParams(window.location.search).get("token") ?? "";
      const result = await submitIntake(token, firstName, lastName, answers);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Navigate rather than flip local state. Submitting spends the token, and a Server
      // Action re-renders the route it was called from — so this page re-evaluates, finds
      // the token spent, and replaces itself with "no longer valid", taking any success
      // state here down with it. /intake/thanks depends on nothing and can't be invalidated.
      router.replace("/intake/thanks");
    });
  };

  return (
    <div className="intake-form">
      <section className="intake-section">
        <h2 className="intake-section-title">About you</h2>
        {/* Name only — no email, no phone. Whoever sent this link already has a way to
            reach the client, so asking again collects a contact detail for nothing. */}
        <div className="intake-grid-2">
          <label className="intake-field">
            <span>First name</span>
            <input
              className="input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </label>
          <label className="intake-field">
            <span>Last name</span>
            <input
              className="input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </label>
        </div>
      </section>

      <section className="intake-section">
        <h2 className="intake-section-title">What you are doing now</h2>
        <p className="intake-prompt">Which best describes your current activity level?</p>
        <div className="intake-options intake-options-2">
          {INTAKE_ACTIVITY_LEVELS.map((level) => (
            <label className="intake-check" key={level}>
              <input
                type="radio"
                name="activityLevel"
                checked={answers.activityLevel === level}
                onChange={() => set("activityLevel", level)}
              />
              <span>{level}</span>
            </label>
          ))}
        </div>

        <p className="intake-prompt">What are you doing at the moment? Tick any that apply.</p>
        <div className="intake-options intake-options-3">
          {INTAKE_ACTIVITIES.map((a) => (
            <label className="intake-check" key={a}>
              <input type="checkbox" checked={answers.activities.includes(a)} onChange={() => toggle("activities", a)} />
              <span>{a}</span>
            </label>
          ))}
        </div>

        <div className="intake-grid-3">
          <label className="intake-field">
            <span>Days per week</span>
            <input className="input" value={answers.daysPerWeek} onChange={(e) => set("daysPerWeek", e.target.value)} />
          </label>
          <label className="intake-field">
            <span>Typical session length</span>
            <input className="input" value={answers.sessionLength} onChange={(e) => set("sessionLength", e.target.value)} />
          </label>
          <label className="intake-field">
            <span>How long at this level</span>
            <input className="input" value={answers.howLong} onChange={(e) => set("howLong", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="intake-section">
        <h2 className="intake-section-title">Where you want to get to</h2>
        <label className="intake-field">
          <span>Short term — what would you like to be different in the next 4 to 8 weeks?</span>
          <textarea className="input" rows={3} value={answers.goalShort} onChange={(e) => set("goalShort", e.target.value)} />
        </label>
        <label className="intake-field">
          <span>Long term — what about 6 to 12 months from now?</span>
          <textarea className="input" rows={3} value={answers.goalLong} onChange={(e) => set("goalLong", e.target.value)} />
        </label>
      </section>

      <section className="intake-section">
        <h2 className="intake-section-title">Anything that limits you</h2>
        <p className="intake-prompt">
          Keep it brief — a line is plenty. This is asked so your clinician can avoid exercises that will hurt, not to
          build a medical history.
        </p>
        <label className="intake-field">
          <textarea className="input" rows={2} value={answers.limits} onChange={(e) => set("limits", e.target.value)} />
        </label>
        <label className="intake-check">
          <input type="checkbox" checked={answers.cleared} onChange={(e) => set("cleared", e.target.checked)} />
          <span>A healthcare provider has cleared me for exercise</span>
        </label>
      </section>

      <section className="intake-section">
        <h2 className="intake-section-title">What you have to train with</h2>
        <p className="intake-prompt">
          Tick anything you can reliably get to — it doesn&rsquo;t have to be yours. A chair, a wall and a set of
          stairs all count.
        </p>
        <div className="intake-options intake-options-3">
          {INTAKE_EQUIPMENT.map((item) => (
            <label className="intake-check" key={item}>
              <input
                type="checkbox"
                checked={answers.equipment.includes(item)}
                onChange={() => toggle("equipment", item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <label className="intake-field">
          <span>Anything else worth knowing about?</span>
          <input className="input" value={answers.equipmentOther} onChange={(e) => set("equipmentOther", e.target.value)} />
        </label>

        <p className="intake-prompt">Where will you usually be training?</p>
        <div className="intake-options intake-options-3">
          {INTAKE_VENUES.map((v) => (
            <label className="intake-check" key={v}>
              <input type="checkbox" checked={answers.venues.includes(v)} onChange={() => toggle("venues", v)} />
              <span>{v}</span>
            </label>
          ))}
        </div>
        <div className="intake-grid-2">
          <label className="intake-field">
            <span>Days a week you can realistically train</span>
            <input className="input" value={answers.availableDays} onChange={(e) => set("availableDays", e.target.value)} />
          </label>
          <label className="intake-field">
            <span>Time you have per session</span>
            <input className="input" value={answers.availableTime} onChange={(e) => set("availableTime", e.target.value)} />
          </label>
        </div>
      </section>

      {error && <p className="intake-error">{error}</p>}

      <div className="intake-submit-row">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSubmit}>
          {pending ? "Sending…" : "Send to my clinician"}
        </button>
        <span className="intake-submit-note">You can only submit this once.</span>
      </div>
    </div>
  );
}
