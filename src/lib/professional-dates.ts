/** How recent a graduationDate counts as "New Grad" for Practice Start Date's visibility
 *  (see app/(app)/profile/page.tsx, ProfessionalDatesForm) — there's no existing "new grad"
 *  flag on User, so this derives one from graduationDate, added by the same migration as
 *  this field. 24 months is a judgment call, not a value the product spec pinned down. */
export const NEW_GRAD_WINDOW_DAYS = 730;

export function isRecentGraduate(graduationDate: Date | null): boolean {
  if (!graduationDate) return false;
  const daysSince = Math.floor((Date.now() - graduationDate.getTime()) / 86400000);
  return daysSince >= 0 && daysSince <= NEW_GRAD_WINDOW_DAYS;
}
