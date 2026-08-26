import "server-only";

/** Published MCID (minimal clinically important difference) / MDC (minimal detectable
 *  change) values per outcome measure, used by both the per-entry benchmark pill in
 *  OutcomeMeasuresSection.tsx and the peer-comparison cards in PracticeMetrics.tsx. Keyed
 *  measure → condition (falling back to "default" — see getOutcomeBenchmarks in
 *  app/actions/clinician-dashboard.ts), so a future condition-specific MCID can be added
 *  under its own key without disturbing every measure's current "default" entry.
 *  `higherIsBetter` is a real field (not parsed out of `description`'s free text) since
 *  the client-side "improved vs. declined" comparison needs it and this whole module is
 *  server-only — see getPatientDetail's `benchmarks` field, which is what actually reaches
 *  the client. */
export const mcidValues: Record<
  string,
  Record<
    string,
    {
      mcid: number;
      mdc: number;
      description: string;
      source: string;
      higherIsBetter: boolean;
    }
  >
> = {
  LEFS: {
    default: {
      mcid: 9,
      mdc: 9,
      description: "Lower Extremity Functional Scale — 0 to 80 — higher is better",
      source: "Binkley et al. 1999",
      higherIsBetter: true,
    },
  },
  DASH: {
    default: {
      mcid: 10.2,
      mdc: 12.7,
      description: "Disabilities of Arm Shoulder Hand — 0 to 100 — lower is better",
      source: "Franchignoni et al. 2004",
      higherIsBetter: false,
    },
  },
  NPRS: {
    default: {
      mcid: 2,
      mdc: 1.74,
      description: "Numeric Pain Rating Scale — 0 to 10 — lower is better",
      source: "Farrar et al. 2001",
      higherIsBetter: false,
    },
  },
  Oswestry: {
    default: {
      mcid: 6,
      mdc: 10,
      description: "Oswestry Disability Index — 0 to 100% — lower is better",
      source: "Fritz and Irrgang 2001",
      higherIsBetter: false,
    },
  },
  KOOS: {
    default: {
      mcid: 8,
      mdc: 10,
      description: "Knee Injury and Osteoarthritis Outcome Score — 0 to 100 — higher is better",
      source: "Collins et al. 2016",
      higherIsBetter: true,
    },
  },
  IKDC: {
    default: {
      mcid: 6.3,
      mdc: 8.5,
      description: "International Knee Documentation Committee — 0 to 100 — higher is better",
      source: "Greco et al. 2010",
      higherIsBetter: true,
    },
  },
  Berg: {
    default: {
      mcid: 4,
      mdc: 4,
      description: "Berg Balance Scale — 0 to 56 — higher is better — below 45 indicates fall risk",
      source: "Donoghue et al. 2009",
      higherIsBetter: true,
    },
  },
  TUG: {
    default: {
      mcid: 1.4,
      mdc: 3.5,
      description: "Timed Up and Go — seconds — lower is better — above 12 seconds indicates fall risk",
      source: "Huang et al. 2011",
      higherIsBetter: false,
    },
  },
  PSFS: {
    default: {
      mcid: 2,
      mdc: 2,
      description: "Patient Specific Functional Scale — 0 to 10 — higher is better",
      source: "Stratford et al. 1995",
      higherIsBetter: true,
    },
  },
  SPADI: {
    default: {
      mcid: 13,
      mdc: 18,
      description: "Shoulder Pain and Disability Index — 0 to 100 — lower is better",
      source: "Schmitt and Di Fabio 2004",
      higherIsBetter: false,
    },
  },
  NDI: {
    default: {
      mcid: 7.5,
      mdc: 10.2,
      description: "Neck Disability Index — 0 to 100 — lower is better",
      source: "Young et al. 2009",
      higherIsBetter: false,
    },
  },
  FAAM: {
    default: {
      mcid: 8,
      mdc: 11,
      description: "Foot and Ankle Ability Measure — 0 to 100 — higher is better",
      source: "Martin et al. 2005",
      higherIsBetter: true,
    },
  },
  "6MWT": {
    default: {
      mcid: 54,
      mdc: 61,
      description: "6 Minute Walk Test — meters — higher is better",
      source: "Redelmeier et al. 1997",
      higherIsBetter: true,
    },
  },
};
