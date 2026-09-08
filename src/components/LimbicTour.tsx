"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Tour, TourStep } from "@/lib/tours";

const TOOLTIP_WIDTH = 320;

/** How long to keep watching for a smooth scroll to settle before placing the card anyway. */
const SETTLE_TIMEOUT_MS = 700;

/** How long to wait for a step's target to appear after arriving on its route. A step whose
 *  target never shows up is skipped rather than left pointing at nothing — several targets
 *  are role-gated, and the sidebar is display:none below 800px. */
const TARGET_WAIT_MS = 2500;


/** Kept clear of every edge, so a clamped card never sits flush against the viewport. */
const EDGE_MARGIN = 20;

/**
 * Where the card goes for one step.
 *
 * The final clamp is the part that matters. Each `position` is a preference, not a promise:
 * anchoring a card *below* a tall target pushed it past the bottom of the screen, taking its
 * Back and Next buttons with it — a tour the reader cannot advance, since the overlay means
 * they cannot scroll to reach them either. It needs the card's real height, because the
 * descriptions vary enough that a fixed guess would still clip a long one.
 */
function getTooltipStyle(step: TourStep, targetRect: DOMRect | null, cardHeight: number): CSSProperties {
  if (!targetRect || step.target === "center") {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const offset = 20;
  const viewportH = typeof window === "undefined" ? 0 : window.innerHeight;
  const viewportW = typeof window === "undefined" ? 0 : window.innerWidth;

  let top: number;
  let left: number;

  // A target taller than the screen has no "above" or "below" — the player has scrolled it
  // to its top, so the part the reader is meant to look at is the part the card would land
  // on. Put the card at the bottom instead and leave that clear.
  if (viewportH > 0 && targetRect.height > viewportH) {
    return {
      top: Math.max(EDGE_MARGIN, viewportH - cardHeight - EDGE_MARGIN),
      left: Math.max(
        EDGE_MARGIN,
        Math.min(targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2, viewportW - TOOLTIP_WIDTH - EDGE_MARGIN),
      ),
    };
  }

  switch (step.position) {
    case "right":
      top = targetRect.top + targetRect.height / 2 - 100;
      left = targetRect.right + offset;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - 100;
      left = targetRect.left - TOOLTIP_WIDTH - offset;
      break;
    case "bottom":
      top = targetRect.bottom + offset;
      left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "top":
      top = targetRect.top - offset - cardHeight;
      left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  // Clamp last, and to the *measured* card. A viewport shorter than the card itself would
  // make the lower bound smaller than the upper one, so the top edge wins — a card running
  // off the bottom is still readable from its start, one running off the top is not.
  if (viewportH > 0) top = Math.max(EDGE_MARGIN, Math.min(top, viewportH - cardHeight - EDGE_MARGIN));
  else top = Math.max(EDGE_MARGIN, top);
  if (viewportW > 0) left = Math.max(EDGE_MARGIN, Math.min(left, viewportW - TOOLTIP_WIDTH - EDGE_MARGIN));
  else left = Math.max(EDGE_MARGIN, left);

  return { top, left };
}

/**
 * The tour player (see lib/tours.ts for the tours themselves, components/TourHost.tsx for
 * what mounts this and keeps its position across navigation).
 *
 * The thing that makes this different from the Home-only tour it replaces is that a step can
 * name a route. When it does, the player navigates and then *waits* for the step's target to
 * appear before measuring it — a fresh route renders progressively, so the element a step
 * points at usually does not exist at the moment the URL changes. A target that never
 * arrives within TARGET_WAIT_MS means the step is skipped in the direction of travel, which
 * covers both a role-gated element and the sidebar being hidden on a phone.
 *
 * Positioning is unchanged from the version this replaces, including the two subtleties that
 * were expensive to find: the previous step's rect is never cleared on a step change (a null
 * rect means "centre the card", so clearing it sent the card through the middle of the
 * screen on every step), and the rect is measured by watching it until it stops moving
 * rather than by guessing at a scroll duration.
 */
export function LimbicTour({
  tour,
  startIndex = 0,
  onStepChange,
  onFinish,
  entered,
  onEnterScope,
  onExit,
}: {
  tour: Tour;
  startIndex?: number;
  /** Called on every step change so the host can persist the position across navigation. */
  onStepChange: (index: number) => void;
  /** Called on finish or skip. `completed` is false when the reader skipped out. */
  onFinish: (completed: boolean) => void;
  /** Whether the tour has reached its scope yet — see components/TourHost.tsx, which owns
   *  and persists this. Until it has, being out of scope is just the opening navigation. */
  entered: boolean;
  /** Called the first time the tour is inside its own scope. */
  onEnterScope: () => void;
  /** Called when the reader navigates out of the tour's scope under their own steam — they
   *  clicked a sidebar link mid-tour. Distinct from onFinish: nothing is recorded, because
   *  leaving is not a decision about the tour. */
  onExit: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(startIndex);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  /** False only until the current step has been measured. The card is centred whenever there
   *  is no rect, so without this it would appear dead centre and jump to its anchor a moment
   *  later — the flash this whole timing dance exists to avoid. */
  const [positioned, setPositioned] = useState(false);
  /** Which direction the reader is moving, so a skipped step is skipped the same way. */
  const direction = useRef<1 | -1>(1);
  const cardRef = useRef<HTMLDivElement>(null);
  /** The card's measured height, for the clamp in getTooltipStyle. The initial value is a
   *  typical card; it is replaced as soon as one renders, and every step re-measures because
   *  a longer description makes a taller card. */
  const [cardHeight, setCardHeight] = useState(240);

  const step = tour.steps[Math.min(currentStep, tour.steps.length - 1)];
  const isFirst = currentStep === 0;
  const isLast = currentStep >= tour.steps.length - 1;

  const goToStep = useCallback(
    (next: number) => {
      // Deliberately does not clear targetRect — see the measuring effect below.
      setPositioned(false);
      setCurrentStep(next);
      onStepChange(next);
    },
    [onStepChange],
  );

  // The reader left. A tour that walks between pages necessarily survives navigation, which
  // means it also survives a reader clicking a sidebar link mid-tour — and a card anchored
  // to Home has no business sitting on top of an unrelated page, blocking it. Anything
  // outside the tour's own route prefix ends it. A step's own route is always inside that
  // prefix (e2e/tours.spec.ts enforces it), so tour-driven navigation never trips this.
  useEffect(() => {
    // Armed only once the tour has actually reached its own scope. A tour is started from
    // wherever the reader happens to be — the picker lives on Profile — so the first render
    // is always out of scope, and an unarmed watcher would end every tour before its opening
    // navigation landed.
    if (pathname.startsWith(tour.scope)) {
      if (!entered) onEnterScope();
      return;
    }
    if (entered) onExit();
  }, [pathname, tour.scope, entered, onEnterScope, onExit]);

  // Navigate first, as its own effect. Measuring cannot start until the route matches, and
  // splitting the two keeps the measuring effect from re-running on every router tick.
  useEffect(() => {
    if (step.route && pathname !== step.route) router.push(step.route);
  }, [step.route, pathname, router]);

  // Then measure — but only once we are actually on the step's route, and only once its
  // target exists. Every setState sits inside a rAF or timeout callback, never the effect
  // body (see react-hooks/set-state-in-effect).
  useEffect(() => {
    if (step.route && pathname !== step.route) return;

    let frame = 0;
    let cancelled = false;
    const startedWaiting = performance.now();

    const measure = (el: Element) => {
      // Centring is right for a target that fits. For one taller than the viewport it is
      // exactly wrong: centring a 1603px region in a 720px window puts its middle on screen,
      // so the card describes something the reader is looking at the middle of, with a ring
      // running off both edges and no clue where it starts. Align those to their top so the
      // reader at least sees where the region begins.
      // scrollIntoView both times, rather than a window.scrollTo for the tall case: the app
      // scrolls an inner container, not the document, so scrolling the window moves nothing
      // — measured, the ring stayed 1056px below the fold. scrollIntoView finds whichever
      // ancestor actually scrolls.
      const height = el.getBoundingClientRect().height;
      el.scrollIntoView({ behavior: "smooth", block: height > window.innerHeight ? "start" : "center" });
      let prev: DOMRect | null = null;
      let stableFrames = 0;
      const startedAt = performance.now();
      const tick = () => {
        if (cancelled) return;
        const rect = el.getBoundingClientRect();
        const settled = prev !== null && Math.abs(rect.top - prev.top) < 0.5 && Math.abs(rect.left - prev.left) < 0.5;
        stableFrames = settled ? stableFrames + 1 : 0;
        prev = rect;
        // Two still frames, or the cap — a scroll that never settles (an animation on the
        // page, a reader scrolling along with it) must not strand the card on the old step.
        if (stableFrames >= 2 || performance.now() - startedAt > SETTLE_TIMEOUT_MS) {
          setTargetRect(rect);
          setPositioned(true);
          return;
        }
        frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };

    // A "center" step has no anchor by design: clear the rect rather than leave it pointing
    // at the previous step's element.
    if (step.target === "center") {
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

    const wait = () => {
      if (cancelled) return;
      const el = document.querySelector(step.target);
      // offsetParent is null for a display:none ancestor — which is how the sidebar hides
      // below 800px, and the reason the old tour narrated invisible things on a phone.
      if (el instanceof HTMLElement && el.offsetParent !== null) {
        measure(el);
        return;
      }
      if (performance.now() - startedWaiting > TARGET_WAIT_MS) {
        // Never arrived. Skip in the direction of travel; if there is nowhere left to go,
        // centre the card rather than trapping the reader on a step with no anchor.
        const next = currentStep + direction.current;
        if (next >= 0 && next < tour.steps.length) {
          goToStep(next);
        } else {
          setTargetRect(null);
          setPositioned(true);
        }
        return;
      }
      frame = window.requestAnimationFrame(wait);
    };
    frame = window.requestAnimationFrame(wait);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [currentStep, step.target, step.route, pathname, tour.steps.length, goToStep]);

  // Measure the card after each step renders, so the clamp above works off its real height
  // rather than a guess. Guarded on an actual change, and rounded, so a sub-pixel difference
  // cannot bounce between two values and re-render forever.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const measured = cardRef.current?.offsetHeight;
      if (measured && Math.abs(measured - cardHeight) > 1) setCardHeight(measured);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentStep, cardHeight]);

  function handleNext() {
    direction.current = 1;
    if (isLast) {
      onFinish(true);
      return;
    }
    goToStep(currentStep + 1);
  }

  function handlePrev() {
    direction.current = -1;
    if (!isFirst) goToStep(currentStep - 1);
  }

  const tooltipStyle = getTooltipStyle(step, targetRect, cardHeight);

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

      <div ref={cardRef} className="tour-tooltip" style={{ ...tooltipStyle, opacity: positioned ? 1 : 0 }}>
        <div className="tour-progress">
          {tour.steps.map((s, i) => (
            <div key={s.id} className={i <= currentStep ? "tour-progress-seg tour-progress-seg--done" : "tour-progress-seg"} />
          ))}
        </div>

        {/* Which tour this is. The welcome tour was the only one when this card was
            designed; with five of them, a reader who started one from Profile needs to see
            which one they are in. */}
        <p className="tour-kicker">{tour.name}</p>
        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-desc">{step.description}</p>

        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={() => onFinish(false)}>
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
