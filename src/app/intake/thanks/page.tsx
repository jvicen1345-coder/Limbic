import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intake received",
  robots: { index: false, follow: false },
};

/** Where a client lands after submitting, and a separate route rather than a piece of state
 *  inside IntakeForm for a specific reason.
 *
 *  Submitting burns the token. A Server Action also re-renders the route it was called from,
 *  so the moment submitIntake returned, /intake re-rendered, previewIntakeLink correctly
 *  reported the token as spent, and the page swapped itself for "this link is no longer
 *  valid" — unmounting the form and any "thank you" living in its state. The client's reward
 *  for completing the form was being told their link was dead.
 *
 *  This page depends on nothing: no token, no database, no session. It cannot be invalidated
 *  by the submission that led to it. */
export default function IntakeThanksPage() {
  return (
    <div className="intake-page">
      <div className="intake-card">
        <div className="intake-masthead">
          <h1 className="intake-title">Thank you</h1>
          <span className="intake-brand">Limbic Center</span>
        </div>
        <div className="intake-done">
          <h2 className="intake-done-title">That&rsquo;s everything.</h2>
          <p className="intake-done-body">
            Your answers have gone straight to your clinician, and they&rsquo;ll use them to put your program
            together. There&rsquo;s nothing else to do — you can close this page.
          </p>
        </div>
      </div>
    </div>
  );
}
