import type { Metadata } from "next";
import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { LabValuesReference } from "@/components/pro/LabValuesReference";

export const metadata: Metadata = {
  title: "Lab Values",
};

export default async function ProLabValuesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Lab Values Reference</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Common laboratory values with normal ranges and PT-specific clinical implications.
      </p>

      {!hasClinicalReferenceAccess(user) ? <ProGate toolName="Lab Values Reference" /> : <LabValuesReference />}
    </div>
  );
}
