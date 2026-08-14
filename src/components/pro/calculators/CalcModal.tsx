"use client";

import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon } from "@/components/icons";

/** Shared modal shell for every /pro/calculators card's "Calculate" button — same
 *  .cal-modal-* visual language as the calendar's Add Event modal and AddLicenseModal
 *  (see .cal-modal-backdrop/.cal-modal in globals.css), widened via .pro-calc-modal for
 *  calculators with long item lists (Berg, LEFS). */
export function CalcModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 200);
  if (!shouldRender) return null;

  return (
    <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={onClose}>
      <div className="cal-modal pro-calc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <div className="cal-modal-title">{title}</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CalcCardShell({
  name,
  fullName,
  measures,
  population,
  itemCount,
  onOpen,
}: {
  name: string;
  fullName: string;
  measures: string;
  population: string;
  itemCount: string;
  onOpen: () => void;
}) {
  return (
    <div className="card elev-sm pro-calc-card">
      <div className="pro-calc-title">{name}</div>
      <p className="pro-calc-fullname">{fullName}</p>
      <p className="pro-calc-desc">{measures}</p>
      <p className="pro-calc-meta">
        {population} &middot; {itemCount}
      </p>
      <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={onOpen}>
        Calculate
      </button>
    </div>
  );
}
