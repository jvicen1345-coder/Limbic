import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { HepBuilder } from "@/components/HepBuilder";
import { DeleteHepButton } from "@/components/DeleteHepButton";

export default async function HepPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.licenseNumber) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Home Exercise Programs</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          Available to signed-in clinicians only — add your license from your profile to unlock this.
        </p>
      </div>
    );
  }

  const programs = await prisma.hepProgram.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { exercises: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Home Exercise Programs</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Build a home exercise program for a patient. Available to signed-in clinicians only.
      </p>

      <HepBuilder />

      {programs.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              marginBottom: 10,
            }}
          >
            Saved programs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {programs.map((p) => (
              <div key={p.id} className="card elev-sm">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <div className="card-title" style={{ margin: 0 }}>
                    {p.programName}
                  </div>
                  <DeleteHepButton programId={p.id} />
                </div>
                <div className="card-body" style={{ marginBottom: 8 }}>
                  {p.exercises.length} {p.exercises.length === 1 ? "exercise" : "exercises"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {p.exercises.map((ex) => (
                    <div key={ex.id} style={{ fontSize: 12.5, color: "var(--color-text)" }}>
                      {ex.name} — {ex.sets}x{ex.reps} <span style={{ color: "var(--color-neutral-700)" }}>{ex.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
