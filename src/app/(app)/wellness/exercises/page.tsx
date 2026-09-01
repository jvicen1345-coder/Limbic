import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getWellnessProfile } from "@/lib/wellness-profile";
import type { WellnessGoal } from "@/lib/vitals";
import { ExerciseLibraryTabs } from "@/components/wellness/ExerciseLibraryTabs";

export const metadata: Metadata = {
  title: "Exercise Library",
};

export default async function ExerciseLibraryPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getWellnessProfile(user.id);
  const goal = (profile.wellnessGoal as WellnessGoal | null) ?? null;

  return (
    <div className="screen-pad" style={{ maxWidth: 1040, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Exercise Library</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Impactful, functional exercises for general health, and how reps and load relate to your training goal.
      </p>

      <ExerciseLibraryTabs goal={goal} />
    </div>
  );
}
