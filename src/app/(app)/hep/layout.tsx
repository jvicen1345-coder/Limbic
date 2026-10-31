import type { ReactNode } from "react";
import "@/styles/hep.css";
import "@/styles/movement-lab.css";
import { ClinicalSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ClinicalSectionTabs />
      {children}
    </>
  );
}
