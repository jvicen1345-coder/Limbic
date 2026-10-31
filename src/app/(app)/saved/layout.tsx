import type { ReactNode } from "react";
import { SavedSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SavedSectionTabs />
      {children}
    </>
  );
}
