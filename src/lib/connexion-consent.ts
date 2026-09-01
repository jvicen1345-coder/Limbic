/**
 * The consent a visitor gives when requesting a Connexion home safety visit.
 *
 * One constant, rendered by the checkbox on the form (ConnexionScheduleSection.tsx) and
 * stored verbatim on the resulting ConnexionVisitRequest row (app/actions/connexion.ts).
 * Storing the wording rather than just a boolean is the point: the on-page copy will be
 * edited over time, and a consent record that can't show *what* was agreed to on the day
 * proves very little. Because both sides read this same constant, the stored text is always
 * exactly what the person saw.
 *
 * Why there is a checkbox here at all, when most of the form's fields are mundane contact
 * details: this is a first-party collection by Limbic, not a clinician recording their own
 * patient under Privacy §2. The visit leads to a Connexion Safety Score — a named older
 * adult's home address and a 208-point fall-risk profile, stored under Limbic's own admin
 * surface. That is consumer health data outside HIPAA, and the Washington My Health My Data
 * Act and Nevada SB 370 both require affirmative opt-in before collecting it. Washington's
 * act also carries a private right of action, so the difference between an opt-in and an
 * assumption is not academic. The contact half matters separately: a phone number given for
 * scheduling is not consent to be called for anything else.
 *
 * If this wording changes materially, just edit it — old rows keep the text they were
 * created with, which is the whole design.
 */
export const CONNEXION_CONSENT_TEXT =
  "I agree that Limbic may use the contact details and information I've provided here to " +
  "reach me by phone, text, or email about scheduling this visit, and to record the " +
  "information I provide about my home and mobility needs. I can withdraw this at any time " +
  "by contacting Limbic.";
