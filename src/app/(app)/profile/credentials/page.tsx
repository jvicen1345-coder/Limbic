import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { buildLicenseView } from "@/lib/license";
import type { CeCategory } from "@/lib/types";
import { ProfessionalDatesForm } from "@/components/ProfessionalDatesForm";
import { ProfessionalCredentialsCard } from "@/components/ProfessionalCredentialsCard";
import { ForceUnitPreferenceForm } from "@/components/ForceUnitPreferenceForm";
import { isRecentGraduate } from "@/lib/professional-dates";
import { PROFILE_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

/** Split out of the main /profile page — Professional Credentials, Professional Dates, and
 *  License & CE all live here now instead of stacked at the bottom of an already-long
 *  Profile tab. See app/(app)/student/page.tsx's NPTE-date prompts and
 *  components/LimbicCalendarWidgetClient.tsx's "Add your professional dates" link, both of
 *  which point here now (they used to point at /profile[#professional-dates]). */
export default async function ProfileCredentialsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // A reader can hold verified/pending/rejected License rows in more than one state now
  // (see schema.prisma License) — Professional Credentials below lists all of them. License
  // & CE further down still tracks renewal/CE hours off the single "primary" license
  // (user.licenseNumber/licenseState, kept in sync by syncPrimaryLicenseFields in
  // app/actions/license.ts), unchanged from before multi-state support.
  const licenseRows = await prisma.license.findMany({ where: { userId: user.id }, orderBy: { submittedAt: "asc" } });

  const license = user.licenseNumber
    ? buildLicenseView(
        user.licenseNumber,
        user.licenseState ?? "",
        user.licenseExpiration ?? new Date(),
        user.ceCategories as unknown as CeCategory[]
      )
    : null;

  const isStudent = user.studentTier !== "none";
  // Broader than isStudent above (which is purely the paid studentTier) — the Professional
  // Credentials card's "no license needed" badge should also cover a .edu account that
  // hasn't purchased Limbic Student.
  const isStudentForCredentials = isStudentEmail(user.email) || isStudent;
  const showPracticeStartDate = user.isPro || isRecentGraduate(user.graduationDate);

  return (
    <div className="screen-pad page-enter">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Profile</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Your license, continuing education, and the dates that power your Limbic Calendar and renewal reminders.
      </p>
      <SubTabs tabs={PROFILE_TABS} />

      <div className="credentials-stack">
        <div id="professional-dates" className="card elev-sm">
          <div className="card-kicker">Professional dates</div>
          <p className="card-body">
            Powers the orange dots on your Limbic Calendar and your renewal reminders.
          </p>
          <ProfessionalDatesForm
            npteExamDate={user.npteExamDate}
            ceuDeadline={user.ceuDeadline}
            licenseExpiration={user.licenseExpiration}
            certificationExpiry={user.certificationExpiry}
            rotationStartDate={user.rotationStartDate}
            rotationEndDate={user.rotationEndDate}
            graduationDate={user.graduationDate}
            practiceStartDate={user.practiceStartDate}
            isStudent={isStudent}
            showPracticeStartDate={showPracticeStartDate}
          />
        </div>

        <ProfessionalCredentialsCard
          licenses={licenseRows.map((l) => ({
            id: l.id,
            state: l.state,
            licenseNumber: l.licenseNumber,
            status: l.status,
            verifiedAt: l.verifiedAt?.toISOString() ?? null,
          }))}
          isStudent={isStudentForCredentials}
          accountName={user.name}
        />

        <div className="card elev-sm">
          <div className="card-kicker">Force Lab</div>
          <ForceUnitPreferenceForm forceUnit={user.forceUnit} />
        </div>

        <div className="card elev-sm">
          <div className="card-kicker">License & CE</div>
          {license ? (
            <>
              <div className="license-ce-header">
                <div className="license-ce-identity">
                  <div className="license-ce-number">{license.licenseNumber}</div>
                  <div className="license-ce-meta">
                    {license.licenseState} · Expires {license.expirationLabel}
                  </div>
                </div>
                <span className={license.statusClass}>{license.status}</span>
              </div>
              <div className="license-ce-days">{license.daysLeftLabel}</div>

              <div className="license-ce-credits">
                <div className="license-ce-credits-row">
                  <span className="license-ce-credits-label">CE credits</span>
                  <span className="license-ce-credits-value">
                    {license.ceCompletedTotal} / {license.ceRequiredTotal} hrs
                  </span>
                </div>
                <div className="license-ce-bar">
                  <div className="license-ce-bar-fill" style={{ width: `${license.cePercent}%` }} />
                </div>
              </div>

              <div className="license-ce-cats">
                {license.ceCats.map((c) => (
                  <div key={c.name}>
                    <div className="license-ce-cat-row">
                      <span className="license-ce-cat-name">{c.name}</span>
                      <span className="license-ce-cat-value">
                        {c.completed} / {c.required} hrs
                      </span>
                    </div>
                    <div className="license-ce-cat-bar">
                      <div className="license-ce-cat-bar-fill" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="card-body">
              Once your license is verified under Professional Credentials above, renewal dates and CE requirements will show up
              here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
