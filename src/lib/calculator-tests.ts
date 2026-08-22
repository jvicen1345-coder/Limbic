/** The canonical (key, display name) pair for each of the 12 tools on /pro/calculators —
 *  shared between the "which tests do you want to run" checklist a Calculator Profile is
 *  created with (see CreateProfileForm in components/pro/calculators/CalculatorProfilesPanel.tsx)
 *  and each calculator's own testKey/testName it saves a CalculatorResult under (see the
 *  `testKey`/`testName` props each passes to CalcModal in
 *  components/pro/calculators/CalcModal.tsx). Order matches the grid on the page itself. */
export const CALCULATOR_TESTS = [
  { key: "nprs", name: "NPRS" },
  { key: "tug", name: "Timed Up and Go" },
  { key: "sts30", name: "30 Second Sit to Stand" },
  { key: "sixmwt", name: "6 Minute Walk Test" },
  { key: "berg", name: "Berg Balance Scale" },
  { key: "lefs", name: "LEFS" },
  { key: "dash", name: "DASH" },
  { key: "oswestry", name: "Oswestry" },
  { key: "psfs", name: "PSFS" },
  { key: "mbess", name: "mBESS" },
  { key: "tug-cognitive", name: "TUG Cognitive" },
  { key: "fga", name: "Functional Gait Assessment" },
] as const;

export type CalculatorTestKey = (typeof CALCULATOR_TESTS)[number]["key"];
