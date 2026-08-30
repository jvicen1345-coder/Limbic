import { getCurrentUser, hasLicenseAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { HepWorkspace } from "@/components/HepWorkspace";
import { DeleteHepButton } from "@/components/DeleteHepButton";
import { sanitizeMediaUrl } from "@/lib/media-url";
import { ExternalLinkIcon } from "@/components/icons";
import { getHepTemplatesAction } from "@/app/actions/hep";

export default async function HepPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasLicenseAccess(user)) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Home Exercise Programs</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          Available to signed-in clinicians only, add your license from your profile to unlock this.
        </p>
      </div>
    );
  }

  const [programs, templatesByBodyPart] = await Promise.all([
    prisma.hepProgram.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { exercises: { orderBy: { order: "asc" } } },
    }),
    getHepTemplatesAction(),
  ]);

  return (
    <div className="screen-pad hep-page-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Home Exercise Programs</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Build a home exercise program for a patient. Available to signed-in clinicians only.
      </p>

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

      <HepWorkspace isPro={user.isPro} templatesByBodyPart={templatesByBodyPart}>
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
                            {ex.name}, {ex.sets}x{ex.reps} <span style={{ color: "var(--color-neutral-700)" }}>{ex.notes}</span>
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
    </div>
  );
}
