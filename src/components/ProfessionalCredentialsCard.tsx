"use client";

import { useState } from "react";
import { AddLicenseModal } from "@/components/AddLicenseModal";
import { maskLicenseNumber } from "@/lib/license-verification";

export interface CredentialsLicenseRow {
  id: string;
  state: string;
  licenseNumber: string;
  status: string;
  /** ISO string, not a Date — this is a client component. */
  verifiedAt: string | null;
}

function LicenseRow({ license }: { license: CredentialsLicenseRow }) {
  const badgeClass =
    license.status === "verified"
      ? "license-badge license-badge--verified"
      : license.status === "pending"
        ? "license-badge license-badge--pending"
        : "license-badge license-badge--rejected";
  const badgeLabel = license.status === "verified" ? "Verified" : license.status === "pending" ? "Pending" : "Not approved";

  return (
    <div className="license-row">
      <div>
        <div style={{ fontSize: 13.5 }}>{maskLicenseNumber(license.licenseNumber)}</div>
        <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 2 }}>
          {license.state}
          {license.status === "verified" &&
            license.verifiedAt &&
            ` · Verified ${new Date(license.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
        </div>
      </div>
      <span className={badgeClass}>{badgeLabel}</span>
    </div>
  );
}

export function ProfessionalCredentialsCard({
  licenses,
  isStudent,
  accountName,
}: {
  licenses: CredentialsLicenseRow[];
  isStudent: boolean;
  accountName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  // Rejected doesn't block resubmitting that state (see submitLicenseVerification), so it
  // stays out of the "already claimed" set the Add License modal filters its dropdown by.
  const claimedStates = licenses.filter((l) => l.status !== "rejected").map((l) => l.state);
  const rejectedCount = licenses.filter((l) => l.status === "rejected").length;

  return (
    <div className="card elev-sm license-verification-card" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Professional Credentials</div>

      {isStudent ? (
        <>
          <div style={{ marginTop: 8 }}>
            <span className="license-badge license-badge--student">DPT Student</span>
          </div>
          <p className="card-body" style={{ marginTop: 8 }}>
            No license required while you&rsquo;re a student, you&rsquo;ll be able to verify your license once you&rsquo;re
            practicing.
          </p>
        </>
      ) : (
        <>
          {licenses.length === 0 ? (
            <div className="card-title" style={{ marginTop: 6 }}>
              License Verification
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {licenses
                .filter((l) => l.status !== "rejected")
                .map((l) => (
                  <LicenseRow license={l} key={l.id} />
                ))}
            </div>
          )}
          <p className="card-body" style={{ marginTop: licenses.length === 0 ? 6 : 10 }}>
            {licenses.length === 0
              ? "Add your PT license to verify your credentials and unlock PRO features."
              : "A PT licensed in more than one state can add each one, one active license per state."}
            {rejectedCount > 0 &&
              ` ${rejectedCount === 1 ? "A previous submission" : `${rejectedCount} previous submissions`} weren't approved — resubmit that state below with corrected details.`}
          </p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => setModalOpen(true)}>
            Add License
          </button>
        </>
      )}

      <AddLicenseModal open={modalOpen} accountName={accountName} claimedStates={claimedStates} onClose={() => setModalOpen(false)} />
    </div>
  );
}
