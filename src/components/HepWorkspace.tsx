"use client";

import { useRef, useState, useTransition } from "react";
import { HepBuilder, type HepBuilderHandle } from "@/components/HepBuilder";
import { HepTemplateLibrary } from "@/components/HepTemplateLibrary";
import { loadHepTemplateAction, saveHepTemplateAction } from "@/app/actions/hep";
import type { HepTemplateBodyPart, HepTemplateExercise } from "@/lib/hep-templates";
import type { HepTemplateSummary } from "@/app/actions/hep";

/**
 * Ties HepBuilder (the existing, unmodified-in-behavior program builder) together with
 * HepTemplateLibrary (the new right-hand panel) — they're siblings, not parent/child, so
 * "Load" and "Save current as template" go through HepBuilder's imperative handle (see
 * HepBuilder.tsx) rather than lifted state. The rest of the page (saved programs list)
 * stays a plain Server Component in app/(app)/hep/page.tsx, outside this workspace, since
 * it doesn't need to talk to either the builder or the template panel.
 */
export function HepWorkspace({
  isPro,
  templatesByBodyPart,
  children,
}: {
  isPro: boolean;
  templatesByBodyPart: Record<HepTemplateBodyPart, HepTemplateSummary[]>;
  /** The saved-programs list below the builder — stays a plain Server Component tree in
   *  app/(app)/hep/page.tsx, passed through here just so it renders inside the middle
   *  column instead of full page width. */
  children?: React.ReactNode;
}) {
  const builderRef = useRef<HepBuilderHandle>(null);
  const [, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  function loadTemplate(templateId: string) {
    startTransition(async () => {
      const data = await loadHepTemplateAction(templateId);
      if (data) builderRef.current?.loadTemplate(data.name, data.exercises);
    });
  }

  function saveCurrentAsTemplate(bodyPart: HepTemplateBodyPart): boolean {
    const draft = builderRef.current?.getDraft();
    if (!draft) {
      setSaveError("Add a program name and at least one exercise in the builder first.");
      return false;
    }
    setSaveError(null);
    const exercises: HepTemplateExercise[] = draft.exercises;
    startTransition(() => {
      saveHepTemplateAction(draft.programName, bodyPart, exercises);
    });
    return true;
  }

  return (
    <div className="hep-layout">
      <div className="hep-builder-col">
        <HepBuilder ref={builderRef} isPro={isPro} />
        {children}
      </div>
      <HepTemplateLibrary
        templatesByBodyPart={templatesByBodyPart}
        onLoad={loadTemplate}
        onSaveCurrent={saveCurrentAsTemplate}
        saveError={saveError}
        clearSaveError={() => setSaveError(null)}
      />
    </div>
  );
}
