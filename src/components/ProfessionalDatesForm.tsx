"use client";

import { useState, useTransition } from "react";
import { updateProfessionalDates } from "@/app/actions/profile";
import { CheckIcon } from "@/components/icons";
import { dateToLocalIso } from "@/lib/limbic-calendar";

type ProfessionalDateField =
  | "npteExamDate"
  | "ceuDeadline"
  | "licenseExpiration"
  | "certificationExpiry"
  | "rotationStartDate"
  | "rotationEndDate"
  | "graduationDate"
  | "practiceStartDate";

/** How long the "saved" checkmark stays mounted — matches the .profile-date-saved-check
 *  fade-in-out animation's duration (see globals.css) so it unmounts right as the fade
 *  finishes rather than vanishing mid-animation or lingering invisibly. */
const SAVED_CHECK_MS = 1600;

function DateField({
  field,
  id,
  label,
  hint,
  value,
}: {
  field: ProfessionalDateField;
  id: string;
  label: string;
  hint: string;
  value: string;
}) {
  const [, startTransition] = useTransition();
  const [showSaved, setShowSaved] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className="input"
        type="date"
        id={id}
        defaultValue={value}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => updateProfessionalDates(field, next));
          setShowSaved(true);
          window.setTimeout(() => setShowSaved(false), SAVED_CHECK_MS);
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, minHeight: 14 }}>
        <span style={{ fontSize: 10.5, color: "var(--color-neutral-700)" }}>{hint}</span>
        {showSaved && <CheckIcon size={11} className="profile-date-saved-check" />}
      </div>
    </div>
  );
}

export function ProfessionalDatesForm({
  npteExamDate,
  ceuDeadline,
  licenseExpiration,
  certificationExpiry,
  rotationStartDate,
  rotationEndDate,
  graduationDate,
  practiceStartDate,
  isStudent,
  showPracticeStartDate,
}: {
  npteExamDate: Date | null;
  ceuDeadline: Date | null;
  licenseExpiration: Date | null;
  certificationExpiry: Date | null;
  rotationStartDate: Date | null;
  rotationEndDate: Date | null;
  graduationDate: Date | null;
  practiceStartDate: Date | null;
  isStudent: boolean;
  showPracticeStartDate: boolean;
}) {
  const iso = (d: Date | null) => (d ? dateToLocalIso(d) : "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
      {isStudent && (
        <DateField
          field="npteExamDate"
          id="pd-npte"
          label="NPTE exam date"
          hint="Shown on your Limbic Calendar as a countdown."
          value={iso(npteExamDate)}
        />
      )}
      <DateField
        field="ceuDeadline"
        id="pd-ceu"
        label="CEU deadline"
        hint="Used for your continuing-education deadline reminder."
        value={iso(ceuDeadline)}
      />
      <DateField
        field="licenseExpiration"
        id="pd-license-expiration"
        label="License expiration"
        hint="Used for your license renewal reminder."
        value={iso(licenseExpiration)}
      />
      <DateField
        field="certificationExpiry"
        id="pd-cert-expiry"
        label="Specialty Certification eg OCS SCS NCS"
        hint="Used for your certification renewal reminder."
        value={iso(certificationExpiry)}
      />
      {isStudent && (
        <>
          <DateField
            field="rotationStartDate"
            id="pd-rotation-start"
            label="Clinical rotation start date"
            hint="Shown on your Limbic Calendar."
            value={iso(rotationStartDate)}
          />
          <DateField
            field="rotationEndDate"
            id="pd-rotation-end"
            label="Clinical rotation end date"
            hint="Shown on your Limbic Calendar."
            value={iso(rotationEndDate)}
          />
          <DateField
            field="graduationDate"
            id="pd-graduation"
            label="Graduation date"
            hint="Used to tailor your feed as you transition to practice."
            value={iso(graduationDate)}
          />
        </>
      )}
      {showPracticeStartDate && (
        <DateField
          field="practiceStartDate"
          id="pd-practice-start"
          label="Practice start date"
          hint="Used to track your time in practice."
          value={iso(practiceStartDate)}
        />
      )}
    </div>
  );
}
