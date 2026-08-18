import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { SPECIALTIES } from "@/lib/specialty-content";
import { ChevronRightIcon } from "@/components/icons";
import { StudentGate } from "@/components/student/StudentGate";

export default async function SpecialtyTracksHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Specialty Tracks</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
        Six major areas of physical therapy practice, built for DPT students preparing for rotations, boards, and career
        focus.
      </p>

      {!hasStudentAccess(user) ? (
        <StudentGate toolName="Specialty Tracks" />
      ) : (
        <div className="specialty-hub-grid">
          {SPECIALTIES.map((specialty) => {
            const href = specialty.slug === "sports" ? "/student/specialties/sports" : `/student/specialties/${specialty.slug}`;
            return (
              <div className={`specialty-hub-card specialty-accent-${specialty.slug}`} key={specialty.slug}>
                <h2 className="specialty-hub-card-name">{specialty.name}</h2>
                <p className="specialty-hub-card-desc">{specialty.description}</p>
                <span className="specialty-hub-card-meta">{specialty.conditions.length} sections</span>
                <Link href={href} className="specialty-explore-btn">
                  Explore
                  <ChevronRightIcon size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
