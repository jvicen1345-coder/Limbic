import "@/styles/paywall.css";
import type { ReactNode } from "react";
import "@/styles/connexion.css";
import { ConnexionSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ConnexionSectionTabs />
      {children}
    </>
  );
}
