"use client";

import { useState } from "react";
import { resetTour } from "@/app/actions/tour";

/** Profile's "Platform Tour" section — clears User.hasCompletedTour (see app/actions/
 *  tour.ts resetTour) and sends the reader to Home, where components/LimbicTour.tsx picks
 *  the gate back up on render. A full navigation (not router.push) on purpose — this is a
 *  rare, deliberate "reset a flag, then land on the page that reads it" action, not a hot
 *  path worth risking the client router cache serving Home's server component a payload
 *  from before hasCompletedTour flipped back to false. */
export function ReplayTourButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await resetTour();
        // Deliberate full navigation, not router.push: confirmed via testing that revalidatePath
        // alone doesn't reliably bust the client router cache in time for a same-tick push to
        // Home to pick up the just-reset hasCompletedTour, which would silently no-op this button.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/home";
      }}
    >
      {pending ? "Starting…" : "Replay Tour"}
    </button>
  );
}
