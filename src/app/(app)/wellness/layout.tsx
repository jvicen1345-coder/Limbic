import "@/styles/paywall.css";
import "@/styles/metrics.css";
import type { ReactNode } from "react";
import "@/styles/wellness.css";
import "@/styles/vitals.css";
import "@/styles/nutrition.css";
import "@/styles/onboarding.css";
import { WellnessSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <WellnessSectionTabs />
      {children}
    </>
  );
}
