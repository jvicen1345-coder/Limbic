"use client";

import { useState, useTransition } from "react";
import { updateProgramTimelineAction, type ProgramTimelineInput } from "@/app/actions/profile";
import { ChevronRightIcon } from "@/components/icons";

const ROTATION_SETTINGS = [
  "Outpatient Orthopedic",
  "Outpatient Neuro",
  "Inpatient Acute Care",
  "Inpatient Rehab",
  "Pediatrics",
  "Geriatrics",
  "Sports Medicine",
  "Home Health",
  "School-Based",
  "Other",
];

interface RotationValues {
  site: string;
  city: string;
  setting: string;
  start: string;
  end: string;
  supervisor: string;
}

function RotationBlock({
  number,
  values,
  onChange,
}: {
  number: 1 | 2 | 3;
  values: RotationValues;
  onChange: (next: RotationValues) => void;
}) {
  const set = (field: keyof RotationValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...values, [field]: e.target.value });

  return (
    <details className="program-timeline-rotation">
      <summary className="pro-accordion-summary" style={{ fontSize: 14 }}>
        <div>Rotation {number}</div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <div className="field">
          <label htmlFor={`rotation${number}-site`}>Site Name</label>
          <input
            id={`rotation${number}-site`}
            className="input"
            type="text"
            placeholder="e.g. Hoag Orthopedic Institute"
            value={values.site}
            onChange={set("site")}
          />
        </div>
        <div className="field">
          <label htmlFor={`rotation${number}-city`}>City and State</label>
          <input
            id={`rotation${number}-city`}
            className="input"
            type="text"
            placeholder="e.g. Newport Beach, CA"
            value={values.city}
            onChange={set("city")}
          />
        </div>
        <div className="field">
          <label htmlFor={`rotation${number}-setting`}>Setting</label>
          <select id={`rotation${number}-setting`} className="input" value={values.setting} onChange={set("setting")}>
            <option value="">Select a setting</option>
            {ROTATION_SETTINGS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`rotation${number}-start`}>Start Date</label>
          <input id={`rotation${number}-start`} className="input" type="date" value={values.start} onChange={set("start")} />
        </div>
        <div className="field">
          <label htmlFor={`rotation${number}-end`}>End Date</label>
          <input id={`rotation${number}-end`} className="input" type="date" value={values.end} onChange={set("end")} />
        </div>
        <div className="field">
          <label htmlFor={`rotation${number}-supervisor`}>Supervisor Name</label>
          <input
            id={`rotation${number}-supervisor`}
            className="input"
            type="text"
            placeholder="CI name"
            value={values.supervisor}
            onChange={set("supervisor")}
          />
        </div>
      </div>
    </details>
  );
}

export function ProgramTimelineSection({
  dptProgramStart,
  dptGraduation,
  npteExamDate,
  rotation1,
  rotation2,
  rotation3,
}: {
  dptProgramStart: string;
  dptGraduation: string;
  npteExamDate: string;
  rotation1: RotationValues;
  rotation2: RotationValues;
  rotation3: RotationValues;
}) {
  const [programStart, setProgramStart] = useState(dptProgramStart || "2025-08-25");
  const [graduation, setGraduation] = useState(dptGraduation || "2028-08-05");
  const [npte, setNpte] = useState(npteExamDate);
  const [r1, setR1] = useState(rotation1);
  const [r2, setR2] = useState(rotation2);
  const [r3, setR3] = useState(rotation3);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const payload: ProgramTimelineInput = {
      dptProgramStart: programStart,
      dptGraduation: graduation,
      npteExamDate: npte,
      rotation1Site: r1.site,
      rotation1City: r1.city,
      rotation1Setting: r1.setting,
      rotation1Start: r1.start,
      rotation1End: r1.end,
      rotation1Supervisor: r1.supervisor,
      rotation2Site: r2.site,
      rotation2City: r2.city,
      rotation2Setting: r2.setting,
      rotation2Start: r2.start,
      rotation2End: r2.end,
      rotation2Supervisor: r2.supervisor,
      rotation3Site: r3.site,
      rotation3City: r3.city,
      rotation3Setting: r3.setting,
      rotation3Start: r3.start,
      rotation3End: r3.end,
      rotation3Supervisor: r3.supervisor,
    };
    startTransition(async () => {
      await updateProgramTimelineAction(payload);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Program Timeline</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Your DPT journey — used to personalize your Atrium experience
      </p>

      <div className="program-timeline-academic">
        <div className="field">
          <label htmlFor="pt-program-start">Program Start Date</label>
          <input
            id="pt-program-start"
            className="input"
            type="date"
            value={programStart}
            onChange={(e) => setProgramStart(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="pt-graduation">Expected Graduation</label>
          <input
            id="pt-graduation"
            className="input"
            type="date"
            value={graduation}
            onChange={(e) => setGraduation(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="pt-npte">NPTE Target Date</label>
          <input
            id="pt-npte"
            className="input"
            type="date"
            placeholder="When do you plan to sit for boards?"
            value={npte}
            onChange={(e) => setNpte(e.target.value)}
          />
        </div>
      </div>

      <div className="program-timeline-rotations">
        <div className="card-kicker" style={{ marginTop: 20 }}>
          Clinical Rotations
        </div>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: 2, marginBottom: 12 }}>
          Add your rotation details when assigned
        </p>
        <div className="program-timeline-rotation-list">
          <RotationBlock number={1} values={r1} onChange={setR1} />
          <RotationBlock number={2} values={r2} onChange={setR2} />
          <RotationBlock number={3} values={r3} onChange={setR3} />
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 18 }}
        disabled={pending}
        onClick={handleSave}
      >
        {pending ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
