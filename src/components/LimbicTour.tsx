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

/** How long to keep watching for a smooth scroll to settle before placing the card anyway. */
const SETTLE_TIMEOUT_MS = 700;

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
  /** False only until the first step has been measured. The card is centred whenever there
   *  is no rect, so without this it would appear dead centre on mount and jump to its anchor
   *  a moment later — the same flash that used to happen on every step change. */
  const [positioned, setPositioned] = useState(false);
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

  // The previous step's rect is deliberately *not* cleared when the step changes (see
  // goToStep below). A null rect means "centre the card", so clearing it sent the card to the
  // middle of the screen for the whole measuring window before it moved to the new element —
  // the flash this effect's timing is built to avoid. Holding the old rect means the card
  // stays put and then travels once, which the CSS transition renders as a glide.
  //
  // Measured by watching the rect until it stops moving, rather than guessing at a duration.
  // scrollIntoView is smooth, so a rect read too early is the pre-scroll position; the old
  // fixed 300ms was both a guess and a floor, making a target already on screen wait for a
  // scroll that never happened. Every setState here is inside a rAF callback, never the
  // effect body — see react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!visible) return;

    let frame = 0;
    let cancelled = false;
    const el = step.target === "body" ? null : document.querySelector(step.target);

    // No element — a "body" step, or one whose target this account doesn't render. Centring
    // is the intent here, so the rect is cleared rather than left pointing at the last step.
    if (!el) {
      frame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        setTargetRect(null);
        setPositioned(true);
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(frame);
      };
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    let prev: DOMRect | null = null;
    let stableFrames = 0;
    const startedAt = performance.now();
    const tick = () => {
      if (cancelled) return;
      const rect = el.getBoundingClientRect();
      const settled = prev !== null && Math.abs(rect.top - prev.top) < 0.5 && Math.abs(rect.left - prev.left) < 0.5;
      stableFrames = settled ? stableFrames + 1 : 0;
      prev = rect;
      // Two still frames, or the cap — a scroll that never settles (an animation on the page,
      // a user scrolling along with it) must not leave the card stranded on the old step.
      if (stableFrames >= 2 || performance.now() - startedAt > SETTLE_TIMEOUT_MS) {
        setTargetRect(rect);
        setPositioned(true);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [currentStep, step.target, visible]);

  async function finish() {
    setVisible(false);
    await completeTour();
  }

  function goToStep(next: number) {
    // Deliberately does not clear targetRect — see the measuring effect above.
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

      <div className="tour-tooltip" style={{ ...tooltipStyle, opacity: positioned ? 1 : 0 }}>
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
