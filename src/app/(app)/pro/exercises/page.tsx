import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { TherapeuticExerciseLibrary } from "@/components/pro/TherapeuticExerciseLibrary";

export default async function ProExercisesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Therapeutic Exercises</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Condition-specific exercises with setup, technique, dosage, and patient cueing.
      </p>

      {!hasClinicalReferenceAccess(user) ? <ProGate toolName="Therapeutic Exercises" /> : <TherapeuticExerciseLibrary />}
    </div>
  );
}
