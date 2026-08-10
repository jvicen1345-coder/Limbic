import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { ExternalLinkIcon, ArrowLeftIcon } from "@/components/icons";

// Free, official FSBPT resources — linked out to, never copied/republished here (FSBPT's
// own site carries only a blanket "All Rights Reserved" notice, no reuse license), same
// "point to the real source" approach as an article's "Read the full story at [source]"
// link. URLs verified live before shipping — not guessed. Moved here from the Atrium page
// (see app/(app)/student/page.tsx) — its own sub-tab under Limbic Student rather than a
// section at the bottom of the Atrium dashboard.
const FSBPT_RESOURCES = [
  {
    title: "NPTE Candidate Handbook",
    description: "Everything about registering for and taking the NPTE, straight from FSBPT.",
    href: "https://www.fsbpt.org/FreeResources/NPTECandidateHandbook.aspx",
  },
  {
    title: "Free NPTE Demo Exam",
    description: "Try real-format sample questions before your actual exam.",
    href: "https://www.fsbpt.org/Secondary-Pages/Exam-Candidates/National-Exam-NPTE/Prepare-for-Exam/NPTE-Demo-Exam",
  },
  {
    title: "State Licensure Requirements",
    description: "Compare licensing requirements across every state and jurisdiction.",
    href: "https://www.fsbpt.org/FreeResources/RegulatoryResources/LicensureReferenceGuide.aspx",
  },
  {
    title: "PT Licensure Compact",
    description: "See which states let you practice across state lines on one license.",
    href: "https://www.fsbpt.org/FreeResources/PhysicalTherapyLicensureCompact.aspx",
  },
];

export default async function NpteResourcesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Same gate as the Atrium page itself (see app/(app)/student/page.tsx) — a .edu email,
  // not studentTier.
  if (!hasStudentAccess(user)) redirect("/home");

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <Link href="/student" className="atrium-back-link" style={{ marginBottom: 14 }}>
        <ArrowLeftIcon size={14} /> Back to Atrium
      </Link>

      <div className="atrium-resources">
        <div className="atrium-resources-heading">Official NPTE Resources</div>
        <p className="atrium-resources-subtitle">
          Free official resources from FSBPT — the national board that runs the NPTE and coordinates PT licensure.
        </p>
        <div className="atrium-resources-grid">
          {FSBPT_RESOURCES.map((resource) => (
            <div key={resource.href} className="atrium-resource-card">
              <span className="atrium-resource-badge">Official Source</span>
              <div className="atrium-dashboard-title">{resource.title}</div>
              <p className="atrium-dashboard-body">{resource.description}</p>
              <a
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="atrium-dashboard-link"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                fsbpt.org <ExternalLinkIcon size={11} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
