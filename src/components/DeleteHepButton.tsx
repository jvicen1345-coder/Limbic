"use client";

import { useTransition } from "react";
import { deleteHepAction } from "@/app/actions/hep";
import { TrashIcon } from "@/components/icons";

export function DeleteHepButton({ programId }: { programId: string }) {
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon icon-btn-sized"
      aria-label="Delete program"
      style={{ "--icon-btn-dim": "28px", flexShrink: 0 } as React.CSSProperties}
      onClick={() => startTransition(async () => void (await deleteHepAction(programId)))}
    >
      <TrashIcon size={14} />
    </button>
  );
}
