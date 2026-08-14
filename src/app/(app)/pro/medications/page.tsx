import { getCurrentUser } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { MedicationReference } from "@/components/pro/MedicationReference";

export default async function ProMedicationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Medication Reference</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Common drug classes encountered in PT practice, with exercise precautions and treatment implications.
      </p>

      {!user.isPro ? (
        <ProGate toolName="Medication Reference" />
      ) : (
        <>
          <div className="pro-disclaimer">
            This reference is for clinical awareness only. Always verify current medications with the patient and
            medical team.
          </div>
          <MedicationReference />
        </>
      )}
    </div>
  );
}
