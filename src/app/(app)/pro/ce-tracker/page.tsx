import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ProGate } from "@/components/pro/ProGate";
import { CELicenseCard } from "@/components/pro/ce-tracker/CELicenseCard";
import { CELogForm } from "@/components/pro/ce-tracker/CELogForm";
import { CELogTable } from "@/components/pro/ce-tracker/CELogTable";
import { dateToLocalIso } from "@/lib/limbic-calendar";

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export default async function ProCeTrackerPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>CE Hours Tracker</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          Track your continuing education hours toward license renewal.
        </p>
        <ProGate toolName="the CE Hours Tracker" />
      </div>
    );
  }

  const logs = await prisma.cELog.findMany({ where: { userId: user.id }, orderBy: { completedAt: "desc" } });
  const hoursLogged = logs.reduce((sum, l) => sum + l.hours, 0);
  const hoursRequired = user.ceTotalRequired ?? 0;
  const hoursRemaining = Math.max(0, hoursRequired - hoursLogged);
  const progressPercent = hoursRequired > 0 ? Math.min(100, Math.round((hoursLogged / hoursRequired) * 100)) : 0;
  const daysUntilRenewal = daysUntil(user.ceLicenseExpiry);

  const rows = logs.map((l) => ({
    id: l.id,
    courseName: l.courseName,
    provider: l.provider,
    completedAt: dateToLocalIso(l.completedAt),
    hours: l.hours,
    category: l.category,
    certificateDataUrl: l.certificateDataUrl,
  }));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>CE Hours Tracker</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Track your continuing education hours toward license renewal.
      </p>

      <CELicenseCard
        ceState={user.ceState ?? ""}
        ceLicenseExpiry={user.ceLicenseExpiry ? dateToLocalIso(user.ceLicenseExpiry) : ""}
        ceRenewalCycle={user.ceRenewalCycle ?? 2}
        ceTotalRequired={user.ceTotalRequired ?? 30}
      />

      <div className="card elev-sm" style={{ marginTop: 12 }}>
        <div className="card-kicker">Progress</div>
        <div className="pro-ce-progress-wrap" style={{ marginTop: 8 }}>
          <div className="pro-ce-progress-bar">
            <div className="pro-ce-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{progressPercent}% of required hours logged</span>
        </div>
        <div className="pro-ce-stats-row">
          <div className="pro-ce-stat">
            <div className="pro-ce-stat-value">{hoursLogged}</div>
            <div className="pro-ce-stat-label">Hours logged</div>
          </div>
          <div className="pro-ce-stat">
            <div className="pro-ce-stat-value">{hoursRemaining}</div>
            <div className="pro-ce-stat-label">Hours remaining</div>
          </div>
          <div className="pro-ce-stat">
            <div className="pro-ce-stat-value">{daysUntilRenewal != null ? daysUntilRenewal : "—"}</div>
            <div className="pro-ce-stat-label">Days until renewal</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <CELogForm />
      </div>

      <div className="card elev-sm" style={{ marginTop: 12 }}>
        <div className="card-kicker" style={{ marginBottom: 8 }}>
          CE log
        </div>
        <CELogTable rows={rows} />
      </div>
    </div>
  );
}
