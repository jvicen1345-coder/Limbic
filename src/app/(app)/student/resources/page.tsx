import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "NPTE Resources",
};
import { ExternalLinkIcon } from "@/components/icons";

const FSBPT_LINKS = [
  { title: "FSBPT Content Outline", href: "https://www.fsbpt.org/Free-Resources/NPTE-Content-Outline" },
  { title: "FSBPT Candidate Handbook", href: "https://www.fsbpt.org/Free-Resources/Candidate-Handbooks" },
  { title: "FSBPT Practice Exam", href: "https://www.fsbpt.org/Free-Resources/Practice-Examinations" },
] as const;

// Distinct URLs from FSBPT_LINKS above (an older FSBPT URL structure the site still serves)
// and different content (registration/licensure rather than the exam content outline/
// practice exam), so kept as its own card rather than merged into that list.
const NPTE_RESOURCES = [
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
] as const;

/**
 * Free, official FSBPT/NPTE reference links — previously a card inside Limbic Boards'
 * Resources tab (see components/BoardsTabs.tsx), which meant reaching them required the
 * paid LimbicStudent tier that gates the rest of Boards (see app/(app)/boards/page.tsx).
 * These are just links to FSBPT's own free public pages, so they don't belong behind that
 * paywall — moved back out to their own Limbic Student sidebar entry (see
 * components/AppShell.tsx), gated on nothing but being signed in, same as Home or Search.
 */
export default async function NpteResourcesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>NPTE Resources</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: "0 0 20px" }}>
        Free, official resources from FSBPT, the national board that runs the NPTE and coordinates PT licensure —
        open to everyone, no Limbic Student subscription required.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card elev-sm">
          <div className="card-title">Official FSBPT Resources</div>
          <div className="boards-resource-link-list" style={{ marginTop: 8 }}>
            {FSBPT_LINKS.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="boards-resource-link">
                {l.title}
              </a>
            ))}
          </div>
          <p className="boards-resource-disclaimer">External links: opens FSBPT website</p>
        </div>

        <div className="card elev-sm">
          <div className="card-title">Official NPTE Resources</div>
          <p className="boards-resource-disclaimer" style={{ margin: "4px 0 12px" }}>
            Free official resources from FSBPT, the national board that runs the NPTE and coordinates PT licensure.
          </p>
          <div className="boards-npte-resource-grid">
            {NPTE_RESOURCES.map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer" className="boards-npte-resource-card">
                <div className="boards-npte-resource-title">
                  {r.title}
                  <ExternalLinkIcon size={12} />
                </div>
                <p className="boards-npte-resource-desc">{r.description}</p>
              </a>
            ))}
          </div>
          <p className="boards-resource-disclaimer">External links: opens FSBPT website</p>
        </div>
      </div>
    </div>
  );
}
