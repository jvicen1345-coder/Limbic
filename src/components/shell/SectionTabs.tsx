import type { ReactNode } from "react";
import { SubTabs } from "@/components/SubTabs";
import { getCurrentUser, hasLicenseAccess, hasStudentAccess } from "@/lib/session";
import {
  SAVED_TABS,
  WELLNESS_TABS,
  clinicalTabs,
  connexionTabs,
  learnTabs,
  newsTabs,
} from "@/lib/section-nav";

function TabBar({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? "section-subtabs section-subtabs-wide" : "section-subtabs"}>{children}</div>;
}

async function access() {
  const user = await getCurrentUser();
  if (!user) return null;
  return {
    isStudent: hasStudentAccess(user),
    isVerifiedStudent: user.studentTier === "limbicStudent",
    hasLicense: hasLicenseAccess(user),
    isPro: user.isPro,
  };
}

export async function LearnSectionTabs() {
  const flags = await access();
  if (!flags) return null;
  return (
    <TabBar>
      <SubTabs tabs={learnTabs(flags)} />
    </TabBar>
  );
}

export async function ClinicalSectionTabs() {
  const flags = await access();
  if (!flags) return null;
  return (
    <TabBar wide>
      <SubTabs tabs={clinicalTabs(flags)} />
    </TabBar>
  );
}

export function SavedSectionTabs() {
  return (
    <TabBar>
      <SubTabs tabs={SAVED_TABS} />
    </TabBar>
  );
}

export function WellnessSectionTabs() {
  return (
    <TabBar>
      <SubTabs tabs={WELLNESS_TABS} />
    </TabBar>
  );
}

export async function ConnexionSectionTabs() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <TabBar>
      <SubTabs tabs={connexionTabs(user.isPro)} />
    </TabBar>
  );
}

export async function NewsSectionTabs() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <TabBar>
      <SubTabs tabs={newsTabs(hasLicenseAccess(user))} />
    </TabBar>
  );
}
