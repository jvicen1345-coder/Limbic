import { redirect } from "next/navigation";

/**
 * Superseded by the Movement Lab tab on Exercise Programs (/hep?tab=movement-lab), which is
 * the same content at a useful size — this page rendered a TherapeuticExerciseLibrary
 * accordion over the single entry that library held, behind a PRO/Student gate. Both that
 * component and its data module were deleted with this change; the Movement Lab tab is free
 * to any signed-in user.
 *
 * Kept as a redirect rather than deleted: /pro/exercises is linked from lib/session.ts's
 * comment on hasClinicalReferenceAccess and may be bookmarked, and a redirect costs nothing
 * next to a 404. Same treatment /pro/red-flags already gets, which redirects into
 * /pro/decision-rules after those two merged.
 */
export default function ProExercisesPage() {
  redirect("/hep?tab=movement-lab");
}
