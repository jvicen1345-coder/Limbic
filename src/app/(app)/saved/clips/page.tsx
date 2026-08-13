import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SavedClipCard } from "@/components/SavedClipCard";
import type { Clip } from "@/lib/types";

export default async function SavedClipsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const rows = await prisma.savedClip.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Clips</h1>

      {rows.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          No saved clips yet, bookmark one from the Clips feed to see it here.
        </p>
      ) : (
        <div className="video-grid">
          {rows.map((r) => (
            <SavedClipCard
              key={r.id}
              clip={{ id: r.clipId, title: r.title, source: r.source, url: r.url, specialty: r.specialty as Clip["specialty"] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
