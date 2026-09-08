"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LimbicTour } from "@/components/LimbicTour";
import { findTour, WELCOME_TOUR_ID, type Tour } from "@/lib/tours";
import { completeTour, markTourSeen } from "@/app/actions/tour";

/** sessionStorage, not localStorage, and not a database write per step. A half-finished tour
 *  is worth surviving a page navigation — which is the whole reason this exists, since a
 *  tour that walks between routes unmounts everything on the way — but it is not worth
 *  surviving a closed tab. Someone who comes back tomorrow wants to start it or not start
 *  it, not resume it at step four. */
const ACTIVE_KEY = "limbic-active-tour";

/** Set once the welcome tour has been started in this session, so it cannot restart itself.
 *  The auto-start below is driven by `autoStartWelcome`, which comes from the server render
 *  — and that prop is still true for the rest of the session after completeTour() flips the
 *  flag, because nothing re-renders the layout on the client. Without this, clicking "Skip
 *  tour" on Home cleared the active tour and the effect immediately started it again.
 *  sessionStorage rather than a ref alone: navigating away from Home and back remounts this
 *  component, and the stale prop would still be true. */
const WELCOME_DONE_KEY = "limbic-welcome-tour-handled";

/** Fired by components/TourMenu.tsx after it writes the key above. The host is mounted in
 *  the app layout and the picker lives on Profile, so a DOM event is the cheapest honest
 *  channel between them — a context provider would mean threading state through a server
 *  component boundary for one message. */
export const TOUR_START_EVENT = "limbic:tour-start";

interface ActiveTour {
  tourId: string;
  step: number;
  /** Whether the tour has reached its own route scope yet.
   *
   *  Persisted rather than kept in a ref because both states survive a full page load and
   *  they need opposite treatment. A tour is *started* from wherever the reader happens to
   *  be — the picker is on Profile — so being out of scope before the opening navigation is
   *  normal and must not end it. A tour that has already been in scope and is now somewhere
   *  else means the reader walked off, and it must end. A ref cannot tell those apart after
   *  a reload, which is exactly when it matters. */
  entered: boolean;
}

function readActive(): ActiveTour | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveTour>;
    if (typeof parsed?.tourId !== "string") return null;
    return {
      tourId: parsed.tourId,
      step: typeof parsed.step === "number" ? parsed.step : 0,
      entered: parsed.entered === true,
    };
  } catch {
    // Private browsing, cleared storage, or a value from an older shape. Not an error state:
    // no active tour is the normal case.
    return null;
  }
}

function welcomeHandled(): boolean {
  try {
    return sessionStorage.getItem(WELCOME_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

function markWelcomeHandled() {
  try {
    sessionStorage.setItem(WELCOME_DONE_KEY, "1");
  } catch {
    // Storage unavailable — the ref guard below still stops a same-session restart while
    // this component stays mounted, which is the case that actually bit.
  }
}

function writeActive(active: ActiveTour | null) {
  try {
    if (active) sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
    else sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Storage unavailable. The tour still runs; it just will not survive a navigation, which
    // degrades a multi-route tour rather than breaking it.
  }
}

/** Starts a tour from anywhere on the client. Writes the position first so the host picks up
 *  the right step even if the event is missed (a listener attaching a tick late). */
export function startTour(tourId: string) {
  writeActive({ tourId, step: 0, entered: false });
  window.dispatchEvent(new CustomEvent(TOUR_START_EVENT));
}

/**
 * Mounts the tour player for the whole app (see app/(app)/layout.tsx).
 *
 * It used to be rendered by Home alone, which was fine when there was one tour and every
 * step pointed at Home. A section tour walks between routes, so the player has to outlive
 * any single page — hence mounting here and keeping the position in sessionStorage.
 *
 * Two ways a tour starts. The welcome tour starts itself, once, for an account that has not
 * seen it — and only on Home, because that is where its first steps point; a new account
 * that lands somewhere else should not get a tour about a page they are not on. Every other
 * tour starts only when someone picks it (see components/TourMenu.tsx).
 */
export function TourHost({ autoStartWelcome }: { autoStartWelcome: boolean }) {
  const pathname = usePathname();
  const [active, setActive] = useState<ActiveTour | null>(null);
  /** Until the first read, we do not know whether a tour is in progress. Rendering nothing
   *  in the meantime keeps the server and the first client render agreeing. */
  const [ready, setReady] = useState(false);
  /** Backs up WELCOME_DONE_KEY for the case where storage throws. */
  const welcomeStarted = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setActive(readActive());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const onStart = () => setActive(readActive());
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, []);

  // The welcome tour's own start. Deliberately not folded into the mount effect above: it
  // depends on the route, and a reader who arrives at Home later in the session should still
  // get it if they never have.
  useEffect(() => {
    if (!ready || active || !autoStartWelcome || pathname !== "/home") return;
    if (welcomeStarted.current || welcomeHandled()) return;
    const timeout = window.setTimeout(() => {
      welcomeStarted.current = true;
      markWelcomeHandled();
      // The welcome tour only ever starts on Home, which is its scope — so it is in scope
      // from the first frame.
      writeActive({ tourId: WELCOME_TOUR_ID, step: 0, entered: true });
      setActive({ tourId: WELCOME_TOUR_ID, step: 0, entered: true });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [ready, active, autoStartWelcome, pathname]);

  const handleStepChange = useCallback(
    (step: number) => {
      setActive((cur) => {
        if (!cur) return cur;
        const next = { ...cur, step };
        writeActive(next);
        return next;
      });
    },
    [],
  );

  const handleEnterScope = useCallback(() => {
    setActive((cur) => {
      if (!cur || cur.entered) return cur;
      const next = { ...cur, entered: true };
      writeActive(next);
      return next;
    });
  }, []);

  const handleFinish = useCallback(
    (tour: Tour) => {
      writeActive(null);
      setActive(null);
      // Finishing and skipping are recorded the same way, matching the original tour's
      // "either way, do not show it again" shape. For the welcome tour that flips the gate
      // that auto-starts it; for a section tour it only sets the label in the picker.
      if (tour.id === WELCOME_TOUR_ID) {
        welcomeStarted.current = true;
        markWelcomeHandled();
        void completeTour();
      } else {
        void markTourSeen(tour.id);
      }
    },
    [],
  );

  const handleExit = () => {
    // No completeTour, no markTourSeen: navigating away is not a decision about the tour.
    // The welcome tour still will not restart this session — WELCOME_DONE_KEY is set when it
    // starts, not when it ends.
    writeActive(null);
    setActive(null);
  };

  if (!ready || !active) return null;
  const tour = findTour(active.tourId);
  // A stored id that no longer exists — a tour removed while someone had it open in another
  // tab. Clear it rather than rendering nothing forever.
  if (!tour) {
    writeActive(null);
    return null;
  }

  return (
    <LimbicTour
      key={tour.id}
      tour={tour}
      startIndex={active.step}
      onStepChange={handleStepChange}
      onFinish={() => handleFinish(tour)}
      entered={active.entered}
      onEnterScope={handleEnterScope}
      onExit={handleExit}
    />
  );
}
