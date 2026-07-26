"use client";

import { useTransition } from "react";
import { deleteHepAction } from "@/app/actions/hep";
import { TrashIcon } from "@/components/icons";

export function DeleteHepButton({ programId }: { programId: string }) {
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon"
      aria-label="Delete program"
      style={{ width: 28, height: 28, flexShrink: 0 }}
      onClick={() => startTransition(() => deleteHepAction(programId))}
    >
      <TrashIcon size={14} />
    </button>
  );
}
