import type { Metadata } from "next";
import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { ResearchLiteracyGuide } from "@/components/pro/ResearchLiteracyGuide";
import { GeneralizabilityChecker } from "@/components/pro/GeneralizabilityChecker";
import { ArticleHistogramExplorer } from "@/components/pro/ArticleHistogramExplorer";

export const metadata: Metadata = {
  title: "Research & Statistics Literacy",
};

export default async function ResearchLiteracyPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Research & Statistics Literacy</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        How to critically read a research article and interpret the statistics inside it.
      </p>

      {!hasClinicalReferenceAccess(user) ? (
        <ProGate toolName="Research & Statistics Literacy" />
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <GeneralizabilityChecker />
          </div>
          <div style={{ marginBottom: 28 }}>
            <ArticleHistogramExplorer />
          </div>
          <ResearchLiteracyGuide />
        </>
      )}
    </div>
  );
}
