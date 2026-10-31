import type { ReactNode } from "react";
import "@/styles/agent.css";
import { ClinicalSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ClinicalSectionTabs />
      {children}
    </>
  );
}
