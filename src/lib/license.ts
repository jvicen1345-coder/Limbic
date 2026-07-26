import type { CeCategory } from "@/lib/types";

export interface LicenseView {
  licenseNumber: string;
  licenseState: string;
  status: "Expired" | "Renew soon" | "Active";
  statusClass: string;
  daysLeftLabel: string;
  expirationLabel: string;
  cePercent: number;
  ceCompletedTotal: number;
  ceRequiredTotal: number;
  ceCats: (CeCategory & { pct: number })[];
}

export function buildLicenseView(
  licenseNumber: string,
  licenseState: string,
  expiration: Date,
  categories: CeCategory[]
): LicenseView {
  const daysLeft = Math.ceil((expiration.getTime() - Date.now()) / 86400000);
  const status = daysLeft < 0 ? "Expired" : daysLeft <= 60 ? "Renew soon" : "Active";
  const statusClass = daysLeft < 0 ? "tag tag-neutral" : daysLeft <= 60 ? "tag tag-accent" : "tag tag-accent-2";
  const ceCats = categories.map((c) => ({ ...c, pct: Math.round(Math.min(100, (c.completed / c.required) * 100)) }));
  const ceRequiredTotal = categories.reduce((sum, c) => sum + c.required, 0);
  const ceCompletedTotal = categories.reduce((sum, c) => sum + c.completed, 0);

  return {
    licenseNumber,
    licenseState,
    status,
    statusClass,
    daysLeftLabel: daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`,
    expirationLabel: expiration.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    cePercent: Math.round(Math.min(100, (ceCompletedTotal / ceRequiredTotal) * 100)),
    ceCompletedTotal,
    ceRequiredTotal,
    ceCats,
  };
}
