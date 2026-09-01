import { getCurrentUser, hasLicenseAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { HepWorkspace } from "@/components/HepWorkspace";
import { DeleteHepButton } from "@/components/DeleteHepButton";
import { sanitizeMediaUrl } from "@/lib/media-url";
import { ExternalLinkIcon } from "@/components/icons";
import { getHepTemplatesAction } from "@/app/actions/hep";
import { LicenseGate } from "@/components/pro/LicenseGate";
import { MovementLabBrowser } from "@/components/movement-lab/MovementLabBrowser";
import { ExerciseProgramsTabs } from "@/components/ExerciseProgramsTabs";
import {
  getMovementExercise,
  getMovementProtocol,
  protocolPhaseToHepExercises,
  MOVEMENT_LAB_TOTAL,
  MOVEMENT_PROTOCOLS,
} from "@/lib/movement-lab";
import type { HepInitialDraft } from "@/components/HepBuilder";

/**
 * Resolves the Movement Lab's two deep-links into a builder draft, server-side:
 *
 *   /hep?exercises=id,id,id      — a selection made on the browse page
 *   /hep?protocol=slug&phase=0   — one phase of a reference protocol
 *
 * Resolved here rather than on the client so the builder mounts already populated (no flash
 * of an empty form), and so an unknown id or a phase index that doesn't exist just yields no
 * draft rather than a broken row — a hand-edited URL should degrade to the ordinary empty
 * builder, not to an error.
 */
function draftFromParams(params: { exercises?: string; protocol?: string; phase?: string }): HepInitialDraft | null {
  if (params.protocol) {
    const protocol = getMovementProtocol(params.protocol);
    if (!protocol) return null;
    const index = Number(params.phase ?? 0);
    const phase = Number.isInteger(index) ? protocol.phases[index] : undefined;
    if (!phase) return null;
    return { programName: `${protocol.name} — ${phase.name}`, exercises: protocolPhaseToHepExercises(phase) };
  }

  if (params.exercises) {
    const exercises = params.exercises
      .split(",")
      .map((id) => getMovementExercise(id.trim()))
      .filter((ex) => ex != null)
      .map((ex) => ({
        name: ex.name,
        sets: ex.dosage.sets,
        reps: ex.dosage.reps,
        // Not something a Movement Lab pick specifies — see HepTemplateExercise's own
        // comment in lib/hep-templates.ts on why that's fine (optional context).
        weight: "",
        frequency: ex.dosage.frequency,
        hold: ex.dosage.hold ?? "",
        equipment: ex.equipment.join(" · "),
        // Same shape the picker/autocomplete build (see movementExerciseFields in
        // HepBuilder) — just the patient-facing cue, since frequency, hold, and equipment
        // now have their own fields above.
        notes: ex.cue.replace(/^“|”$/g, ""),
        imageUrl: "",
        videoUrl: "",
      }));
    if (exercises.length === 0) return null;
    // Left blank deliberately: the clinician names the program for the patient it's for, and
    // a placeholder like "Movement Lab selection" is the kind of thing that gets saved by
    // accident. `canSave` in the builder keeps Save disabled until they fill it in.
    return { programName: "", exercises };
  }

  return null;
}

export default async function HepPage({
  searchParams,
}: {
  searchParams: Promise<{ exercises?: string; protocol?: string; phase?: string; tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const initialTab = params.tab === "movement-lab" ? "movement-lab" : "builder";
  const licensed = hasLicenseAccess(user);

  // The Builder tab needs a license on file (see hasLicenseAccess above); the Movement Lab
  // tab doesn't — it's reference content, not a practice tool, same as Special Tests/
  // Guidelines/Lab Values (see the Movement Lab's own former page-level comment on this, now
  // moved here). So only the Builder tab's data and content are gated; the page itself, and
  // the Movement Lab tab, render for any signed-in user.
  let builderTab: React.ReactNode;
  if (!licensed) {
    builderTab = <LicenseGate toolName="The HEP Builder" />;
  } else {
    const [programs, templatesByKindAndBodyPart] = await Promise.all([
      prisma.hepProgram.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      }),
      getHepTemplatesAction(),
    ]);
    const initialDraft = draftFromParams(params);

    builderTab = (
      <>
        {initialDraft && (
          <div className="free-tool-banner" style={{ marginBottom: 22 }}>
            Loaded {initialDraft.exercises.length} {initialDraft.exercises.length === 1 ? "exercise" : "exercises"}{" "}
            from the Movement Lab. Adjust the dosage for this patient before saving — the numbers are typical
            starting ranges, not a prescription.
          </div>
        )}

        {/* HEP Builder itself only requires a license on file (see hasLicenseAccess above) —
            LimbicPRO isn't a hard gate here, it just unlocks exercise media (see
            isPro={user.isPro} below and sanitizeMediaUrl gating in app/actions/hep.ts). This
            note is the "upsell messaging" the LimbicPRO repositioning calls for, without
            actually locking a licensed-but-not-Pro clinician out of building programs. */}
        {!user.isPro && (
          <div className="free-tool-banner" style={{ marginBottom: 22 }}>
            Build and assign home exercise programs to your patients. Exercise images and videos are available with
            LimbicPRO — <a href="/profile/membership">$15/month</a>.
          </div>
        )}

        <HepWorkspace isPro={user.isPro} templatesByKindAndBodyPart={templatesByKindAndBodyPart} initialDraft={initialDraft}>
          {programs.length > 0 && (
            <>
              <div
                style={{
                  fontSize: "var(--fs-11)",
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {p.exercises.map((ex) => {
                        const imageUrl = sanitizeMediaUrl(ex.imageUrl);
                        const videoUrl = sanitizeMediaUrl(ex.videoUrl);
                        return (
                          <div key={ex.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            {imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element -- clinician-pasted external URL, not a local/optimizable asset
                              <img
                                src={imageUrl}
                                alt={ex.name}
                                loading="lazy"
                                decoding="async"
                                style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }}
                              />
                            )}
                            <div style={{ fontSize: 12.5, color: "var(--color-text)" }}>
                              {ex.name}, {ex.sets}x{ex.reps}
                              {ex.weight && ` @ ${ex.weight} lbs`}
                              {ex.hold && `, hold ${ex.hold}`}
                              {ex.frequency && `, ${ex.frequency}`}
                              {ex.equipment && ` (${ex.equipment})`}{" "}
                              <span style={{ color: "var(--color-neutral-700)" }}>{ex.notes}</span>
                              {videoUrl && (
                                <>
                                  {" "}
                                  <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                                  >
                                    Watch video
                                    <ExternalLinkIcon size={11} />
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </HepWorkspace>
      </>
    );
  }

  const movementLabTab = (
    <>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 6px", maxWidth: 680 }}>
        {MOVEMENT_LAB_TOTAL} therapeutic exercises and {MOVEMENT_PROTOCOLS.length} phased protocols. Every entry
        carries its setup, technique, typical dosage, patient-facing cue, common errors, regression and progression,
        and its precautions. Send anything here straight to the Builder tab.
      </p>
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "0 0 18px", maxWidth: 680 }}>
        Dosages are typical starting ranges, not prescriptions — this patient&rsquo;s presentation and the treating
        surgeon&rsquo;s or clinician&rsquo;s own protocol override everything here.
      </p>
      <MovementLabBrowser />
    </>
  );

  return (
    <div className="screen-pad hep-page-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Exercise Programs</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 18px" }}>
        Build a home or in-clinic exercise program for a patient, or browse the Movement Lab&rsquo;s exercise and
        protocol reference. Available to any signed-in user — building and saving a program needs a license on file.
      </p>

      <ExerciseProgramsTabs initialTab={initialTab} builder={builderTab} movementLab={movementLabTab} />
    </div>
  );
}
