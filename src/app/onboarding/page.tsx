import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SUGGESTED_TOPICS } from "@/lib/meta";
import { TopicChip } from "@/components/TopicChip";
import { completeOnboardingAction } from "@/app/actions/onboarding";

/** One-time, post-signup screen — see app/(app)/layout.tsx, which redirects any signed-in
 *  account with hasOnboarded false here before it can reach anything else in the app.
 *  Picking topics here writes to the same User.followedTopics field Profile's "Suggested"
 *  chips use (see TopicChip/toggleTopicAction) — this is just an earlier, first-run
 *  entry point into that same preference, not a separate one. */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.hasOnboarded) redirect("/home");

  const followedTopics = user.followedTopics as unknown as string[];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--color-bg)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand lockup, not a responsive content image */}
      <img src="/logo-lockup.svg" alt="Limbic — Curated Research" width={194} height={70} />

      <div className="card elev-md onboarding-card" style={{ maxWidth: 460, width: "100%" }}>
        <div className="card-kicker">Welcome to Limbic</div>
        <div className="card-title">What are you interested in?</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Pick a few topics to curate your home feed — you can change these anytime from
          Profile.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {SUGGESTED_TOPICS.map((t) => (
            <TopicChip key={t} topic={t} followed={followedTopics.includes(t)} />
          ))}
        </div>

        <form action={completeOnboardingAction}>
          <button type="submit" className="btn btn-primary btn-block">
            Continue to Limbic
          </button>
        </form>
        <form action={completeOnboardingAction}>
          <button type="submit" className="btn btn-ghost" style={{ marginTop: 4 }}>
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
