"use client";

import { createContext, useContext } from "react";

/** Consumed by CalcModal's "Save to profile" button (see CalcModal.tsx) — every calculator
 *  under /pro/calculators is a client component nested arbitrarily deep inside the page's
 *  server-rendered grid, so a shared context (provided once by
 *  CalculatorWorkspace.tsx) is what lets each one reach the active profile without prop-
 *  drilling through app/(app)/pro/calculators/page.tsx. */
export interface CalculatorProfileContextValue {
  activeProfileLabel: string | null;
  /** Resolves true on success. CalcModal shows a brief "Saved" confirmation either way
   *  based on the result, rather than assuming success. */
  saveResult: (testKey: string, testName: string, value: string, interpretation: string) => Promise<boolean>;
}

const CalculatorProfileContext = createContext<CalculatorProfileContextValue>({
  activeProfileLabel: null,
  saveResult: async () => false,
});

export const CalculatorProfileProvider = CalculatorProfileContext.Provider;

export function useCalculatorProfile(): CalculatorProfileContextValue {
  return useContext(CalculatorProfileContext);
}
