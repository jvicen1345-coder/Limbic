"use client";

import { useState } from "react";
import { AddLicenseModal } from "@/components/AddLicenseModal";
import { maskLicenseNumber } from "@/lib/license-verification";

export function ProfessionalCredentialsCard({
  licenseStatus,
  licenseNumber,
  licenseState,
  licenseVerifiedAt,
  isStudent,
  accountName,
}: {
  licenseStatus: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  /** ISO string, not a Date — Server Components can't hand a client component a raw Date. */
  licenseVerifiedAt: string | null;
  isStudent: boolean;
  accountName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

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
      ) : licenseStatus === "verified" && licenseNumber ? (
        <>
          <div style={{ marginTop: 8 }}>
            <span className="license-badge license-badge--verified">Licensed PT, Verified</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 13.5 }}>{maskLicenseNumber(licenseNumber)}</div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 2 }}>
            {licenseState}
            {licenseVerifiedAt &&
              ` · Verified ${new Date(licenseVerifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </div>
        </>
      ) : licenseStatus === "pending" && licenseNumber ? (
        <>
          <div style={{ marginTop: 8 }}>
            <span className="license-badge license-badge--pending">Verification Pending</span>
          </div>
          <p className="card-body" style={{ marginTop: 8 }}>
            Your license is under review. You will receive an email within 24 hours.
          </p>
          <div style={{ marginTop: 6, fontSize: 13.5 }}>{maskLicenseNumber(licenseNumber)}</div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 2 }}>{licenseState}</div>
        </>
      ) : (
        <>
          <div className="card-title" style={{ marginTop: 6 }}>
            License Verification
          </div>
          <p className="card-body" style={{ marginTop: 6 }}>
            {licenseStatus === "rejected"
              ? "Your previous submission wasn't approved. Please review your details and resubmit."
              : "Add your PT license to verify your credentials and unlock PRO features."}
          </p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setModalOpen(true)}>
            Add License
          </button>
        </>
      )}

      <AddLicenseModal open={modalOpen} accountName={accountName} onClose={() => setModalOpen(false)} />
    </div>
  );
}
