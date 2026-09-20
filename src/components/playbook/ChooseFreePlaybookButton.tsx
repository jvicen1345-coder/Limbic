"use client";

import { useState, useTransition } from "react";
import { chooseFreePlaybookAction } from "@/app/actions/playbooks";

/** The button that spends a non-subscribed student's one free playbook pick (see
 *  hasPlaybookAccess in lib/session.ts). Confirmed client-side because the pick is
 *  permanent — chooseFreePlaybookAction has no counterpart that changes it — so a reader
 *  who taps the wrong card by mistake has one last chance to back out before it's spent. */
export function ChooseFreePlaybookButton({ slug, name, className }: { slug: string; name: string; className: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={pending || done}
      onClick={() => {
        if (
          !window.confirm(
            `Make "${name}" your one free playbook? This can't be changed later — every other playbook stays part of Limbic Student ($3/mo).`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          await chooseFreePlaybookAction(slug);
          setDone(true);
        });
      }}
    >
      {pending || done ? "Unlocking…" : "Get this one free"}
    </button>
  );
}
