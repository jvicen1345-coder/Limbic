import type { ReactNode } from "react";
import "@/styles/student.css";
import "@/styles/onboarding.css";
import { LearnSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <LearnSectionTabs />
      {children}
    </>
  );
}
