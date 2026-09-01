import { redirect } from "next/navigation";

/**
 * Superseded by the Movement Lab tab on Exercise Programs (/hep?tab=movement-lab) — same
 * content (MovementLabBrowser), just folded into the page that already consumes it instead of
 * living at its own route. Kept as a redirect rather than deleted: /movement-lab may still be
 * bookmarked or linked externally (AppShell.tsx's own nav now points straight at
 * /hep?tab=movement-lab, the same pattern Team Dashboard uses for /pro/dashboard?tab=team) —
 * a redirect costs nothing next to a 404. Same treatment /pro/exercises and /pro/red-flags
 * already got for their own merges.
 */
export default function MovementLabPage() {
  redirect("/hep?tab=movement-lab");
}
