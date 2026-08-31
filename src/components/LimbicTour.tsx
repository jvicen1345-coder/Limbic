"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { completeTour } from "@/app/actions/tour";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  action?: string;
}

// Every target below is a real selector already present on Home (see the data-tour
// attributes added to AppShell.tsx and HomeFeed.tsx) — "Weekly Roundup" and "Today's
// Clinical Insight" don't exist on the main Home feed (that's a Student Atrium-only panel),
// so this points at the two Home-feed widgets that actually cover the same ground: the
// Daily Dashboard's metrics row and the Limbic Agent card's personalized reading insights.
const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Limbic",
    description: "This is your home on Limbic. Let us take 60 seconds to show you around.",
    target: "body",
    position: "bottom",
  },
  {
    id: "sidebar",
    title: "Your Navigation",
    description:
      "Everything on Limbic lives here. The sidebar reorders based on your role — student, clinician, or general user.",
    target: '[data-tour="sidebar"]',
    position: "right",
  },
  {
    id: "daily-dashboard",
    title: "Your Daily Dashboard",
    description: "New studies and guidelines today, your reading streak, CE hours, and what's still unread — at a glance.",
    target: '[data-tour="daily-dashboard"]',
    position: "bottom",
  },
  {
    id: "limbic-agent",
    title: "Limbic Agent",
    description: "A personalized read on your week — what you've covered and the topics you haven't touched yet.",
    target: '[data-tour="limbic-agent"]',
    position: "bottom",
  },
  {
    id: "home-feed",
    title: "The Research Feed",
    description: "Fresh PT research, clinical guidelines, and industry news — curated daily. Filtered by type with the tabs above it.",
    target: '[data-tour="home-feed"]',
    position: "top",
  },
  {
    id: "limbic-student",
    title: "Limbic Student",
    description: "Your DPT academic hub. Specialty Tracks, Boards prep, Daily Sharpening, and your program timeline — all in one place.",
    target: '[data-tour="limbic-student"]',
    position: "right",
  },
  {
    id: "limbic-pro",
    title: "LimbicPRO",
    description: "Clinical tools for licensed PTs. Calculators, decision rules, red flag screening, Limbic Agent, Force Lab, and your patient dashboard.",
    target: '[data-tour="limbic-pro"]',
    position: "right",
  },
  {
    id: "atlas",
    title: "Limbic Atlas",
    description: "Interactive clinical anatomy. Click any region on the body map to see muscles, conditions, special tests, and board pearls.",
    target: '[data-tour="atlas"]',
    position: "right",
  },
  {
    id: "founding-funders",
    title: "Founding Funders",
    description: "Limbic is new. The people who back it early get lifetime access at a founding price. 50 spots total.",
    target: '[data-tour="founding-funders"]',
    position: "right",
  },
  {
    id: "complete",
    title: "You're ready",
    description:
      "That is Limbic. Start with the home feed or jump into Daily Sharpening if you are a student. Come back every day — the platform builds with you.",
    target: "body",
    position: "bottom",
    action: "Start exploring",
  },
];

const TOOLTIP_WIDTH = 320;

function getTooltipStyle(step: TourStep, targetRect: DOMRect | null): CSSProperties {
  if (!targetRect || step.target === "body") {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const offset = 20;

  switch (step.position) {
    case "right":
      return { top: Math.max(20, targetRect.top + targetRect.height / 2 - 100), left: targetRect.right + offset };
    case "left":
      return { top: Math.max(20, targetRect.top + targetRect.height / 2 - 100), left: targetRect.left - TOOLTIP_WIDTH - offset };
    case "bottom":
      return { top: targetRect.bottom + offset, left: Math.max(20, targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2) };
    case "top":
      return { top: Math.max(20, targetRect.top - offset - 200), left: Math.max(20, targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2) };
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}

/** One-time, post-onboarding guided tour of Home (see app/(app)/home/page.tsx, which
 *  renders this only when user.hasCompletedTour is false) — replayable anytime from
 *  Profile's "Platform Tour" section (see components/ReplayTourButton.tsx). Highlights a
 *  handful of real elements marked with a `data-tour` attribute (the sidebar and four of
 *  its items in AppShell.tsx, three widgets on Home in HomeFeed.tsx); a step whose target
 *  is "body" (or whose element isn't found — e.g. a role-gated sidebar item that isn't
 *  rendered for this account) just centers the tooltip with no highlight ring, rather than
 *  erroring. */
export function LimbicTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [steps, setSteps] = useState<TourStep[]>(TOUR_STEPS);

  // Five of the ten steps point at sidebar items, and the sidebar is display:none below 800px
  // (see AppShell.tsx) — so on a phone the tour walked through "Your Navigation", "Limbic
  // Student", "LimbicPRO", "Limbic Atlas" and "Founding Funders" describing things the reader
  // could not see, with no highlight ring to look at either (globals.css hides it below
  // 640px). Drop any step whose target isn't actually rendered and visible at this size.
  // Filtered after mount rather than during render so SSR and hydration agree; the first step
  // targets "body", so the list settles before anyone can reach a dropped one. The setState
  // sits inside the timeout callback for the same reason the effect below does it that way —
  // a synchronous one in the effect body is a cascading render (see react-hooks/set-state-in-effect).
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSteps(
        TOUR_STEPS.filter((s) => {
          if (s.target === "body") return true;
          const el = document.querySelector(s.target);
          return el instanceof HTMLElement && el.offsetParent !== null;
        }),
      );
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const step = steps[Math.min(currentStep, steps.length - 1)];
  const isFirst = currentStep === 0;
  const isLast = currentStep >= steps.length - 1;

  // targetRect is cleared eagerly by goToStep below, in the same tick as the step change —
  // by the time this effect runs for the new step there's nothing stale to clear, so the
  // only setState left in the effect body is the one inside the (already-async) timeout
  // callback, not a synchronous call directly in the effect.
  useEffect(() => {
    if (!visible || step.target === "body") return;

    const el = document.querySelector(step.target);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = window.setTimeout(() => setTargetRect(el.getBoundingClientRect()), 300);
    return () => window.clearTimeout(timeout);
  }, [currentStep, step.target, visible]);

  async function finish() {
    setVisible(false);
    await completeTour();
  }

  function goToStep(next: number) {
    setTargetRect(null);
    setCurrentStep(next);
  }

  function handleNext() {
    if (isLast) {
      void finish();
      return;
    }
    goToStep(currentStep + 1);
  }

  function handlePrev() {
    if (!isFirst) goToStep(currentStep - 1);
  }

  if (!visible) return null;

  const tooltipStyle = getTooltipStyle(step, targetRect);

  return (
    <>
      <div className="tour-overlay" />

      {targetRect && (
        <div
          className="tour-highlight"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      <div className="tour-tooltip" style={tooltipStyle}>
        <div className="tour-progress">
          {steps.map((s, i) => (
            <div key={s.id} className={i <= currentStep ? "tour-progress-seg tour-progress-seg--done" : "tour-progress-seg"} />
          ))}
        </div>

        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-desc">{step.description}</p>

        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={finish}>
            Skip tour
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {!isFirst && (
              <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                Back
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              {isLast ? (step.action ?? "Done") : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
