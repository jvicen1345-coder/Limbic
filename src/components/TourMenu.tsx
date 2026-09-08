"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startTour } from "@/components/TourHost";
import { resetTour } from "@/app/actions/tour";
import { SECTION_TOURS, WELCOME_TOUR_ID, findTour } from "@/lib/tours";

/**
 * Profile's "Platform Tour" section — the welcome tour plus one per section (see
 * lib/tours.ts).
 *
 * The welcome tour is started differently from the rest, and the difference is not
 * cosmetic. It is gated on User.hasCompletedTour, so replaying it means clearing that flag
 * server-side and then landing on Home for the host to pick it back up — the same full
 * navigation the button this replaces used, and for the same reason: revalidatePath alone
 * does not reliably bust the client router cache in time for a same-tick push, which would
 * silently no-op the button. Section tours are gated on nothing, so they start on the client
 * and the host navigates to wherever the tour begins.
 */
export function TourMenu({ toursSeen }: { toursSeen: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const welcome = findTour(WELCOME_TOUR_ID);

  return (
    <div className="tour-menu">
      {welcome ? (
        <div className="tour-menu-row">
          <div className="tour-menu-text">
            <p className="tour-menu-name">{welcome.name}</p>
            <p className="tour-menu-blurb">{welcome.blurb}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary tour-menu-start"
            disabled={pending !== null}
            onClick={async () => {
              setPending(WELCOME_TOUR_ID);
              await resetTour();
              // Deliberate full navigation, not router.push — see the note above.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/home";
            }}
          >
            {pending === WELCOME_TOUR_ID ? "Starting…" : "Replay"}
          </button>
        </div>
      ) : null}

      <p className="tour-menu-heading">Section tours</p>
      <p className="tour-menu-intro">
        Longer walkthroughs of one part of Limbic. Each moves between pages as it goes, and you can leave at any
        point.
      </p>

      {SECTION_TOURS.map((tour) => {
        const seen = toursSeen.includes(tour.id);
        return (
          <div className="tour-menu-row" key={tour.id}>
            <div className="tour-menu-text">
              <p className="tour-menu-name">
                {tour.name}
                {seen ? <span className="tour-menu-seen">Seen</span> : null}
              </p>
              <p className="tour-menu-blurb">{tour.blurb}</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary tour-menu-start"
              disabled={pending !== null}
              onClick={() => {
                setPending(tour.id);
                startTour(tour.id);
                // The host navigates from the step's own route, but pushing here means the
                // reader leaves Profile immediately rather than watching the button sit
                // disabled while the first step resolves.
                router.push(tour.route);
              }}
            >
              {pending === tour.id ? "Starting…" : seen ? "Again" : "Start"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
