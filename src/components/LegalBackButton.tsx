"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";

/** "Returns to previous page" (browser history), not a fixed destination — /terms and
 *  /privacy are reachable both from signed-out (the sign-in screen) and signed-in
 *  contexts, so there's no one right place to always send someone back to. Distinct from
 *  the generic components/BackButton.tsx (a labeled inline button used elsewhere) — this
 *  one's the same fixed top-left circular icon treatment as .ff-back-link, just built off
 *  the standard --color-* tokens instead of that page's own warm palette. */
export function LegalBackButton() {
  const router = useRouter();
  return (
    <button type="button" className="legal-back-link" aria-label="Go back" onClick={() => router.back()}>
      <ArrowLeftIcon size={17} />
    </button>
  );
}
