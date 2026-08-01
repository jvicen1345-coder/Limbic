"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/nexus-utils";

/** Renders nothing until mount, then fills in the relative time — computing "time since"
 *  during SSR and again during client hydration can disagree by a tick (e.g. "1m ago" vs
 *  "2m ago"), which React flags as a hydration mismatch. Deferring to an effect keeps the
 *  server and first client render identical. */
export function TimeAgo({ date }: { date: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // Deliberately deferred to an effect: timeAgo() depends on Date.now(), which can't
    // agree between the server render and the client render it hydrates against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(timeAgo(new Date(date)));
  }, [date]);

  return <>{label ?? " "}</>;
}
