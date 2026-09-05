import type { Metadata } from "next";
import { previewIntakeLink } from "@/app/actions/intake";
import { IntakeForm } from "@/components/IntakeForm";

export const metadata: Metadata = {
  title: "New Client Intake",
  // A link sent to one person has no business showing up in search results, and the page
  // itself is worthless to a crawler — every useful state needs a token.
  robots: { index: false, follow: false },
};

/** Public page — no sign-in, no account, no onboarding gate. Outside the (app) route group
 *  for the same reason /clinic/accept-invite is: the person opening this has almost
 *  certainly never heard of Limbic and shouldn't meet an app shell before the form.
 *
 *  The invalid state is deliberately incurious. Expired, already used, and never-existed all
 *  render the same words, and previewIntakeLink returns nothing beyond a boolean, so the URL
 *  can't be used to find out whose link it was or whether a guess landed near a real one. */
export default async function IntakePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const { usable } = await previewIntakeLink(token ?? "");

  return (
    <div className="intake-page">
      <div className="intake-card">
        <div className="intake-masthead">
          <h1 className="intake-title">New Client Intake</h1>
          <span className="intake-brand">Limbic Center</span>
        </div>

        {!usable ? (
          <>
            <p className="intake-intro">This intake link is no longer valid.</p>
            <p className="intake-note">
              It may have expired, or already been filled in. Ask your clinician to send you a new one — it only takes
              them a moment.
            </p>
          </>
        ) : (
          <>
            <p className="intake-intro">
              How active you are now, what you want from training, and what you have to train with. About five minutes.
            </p>
            <div className="intake-privacy">
              <div className="intake-privacy-title">How your information is used</div>
              <p>
                Your answers go only to your clinician, and are used only to design and adjust your program. They are
                never sold, and never shared without your written permission.
              </p>
              <p>
                Please don&rsquo;t include medical records, imaging, insurance details or your Social Security number —
                they aren&rsquo;t needed here. If something about your health affects what you can do, one line under
                &ldquo;Anything that limits you&rdquo; is enough.
              </p>
            </div>
            <IntakeForm />
          </>
        )}
      </div>
    </div>
  );
}
