import { ChevronRightIcon } from "@/components/icons";
import { matchesSearch, searchTerms } from "@/lib/reference-search";

interface DrugClass {
  name: string;
  examples: string[];
  mechanism: string;
  relevance: string;
  exercise: string;
  redFlags: string;
}

const DRUG_CLASSES: DrugClass[] = [
  {
    name: "Anticoagulants",
    examples: ["Warfarin", "Rivaroxaban", "Apixaban", "Heparin"],
    mechanism: "Reduce the blood's ability to clot",
    relevance: "Bleeding precautions, manual therapy intensity, fall risk",
    exercise: "Avoid high impact, contact sports, aggressive joint mobilization",
    redFlags: "Unexplained bruising, blood in urine or stool, prolonged bleeding",
  },
  {
    name: "Beta Blockers",
    examples: ["Metoprolol", "Atenolol", "Carvedilol", "Propranolol"],
    mechanism: "Block beta-adrenergic receptors, slowing heart rate and reducing contractility",
    relevance: "Heart rate response is blunted, cannot use HR for exercise intensity",
    exercise: "Use RPE scale instead of heart rate targets, Borg scale",
    redFlags: "Bradycardia at rest, dizziness, orthostatic hypotension",
  },
  {
    name: "Corticosteroids",
    examples: ["Prednisone", "Methylprednisolone", "Dexamethasone"],
    mechanism: "Suppress inflammation and immune response",
    relevance: "Bone density loss, tissue healing impairment, muscle weakness",
    exercise: "Bone precautions, wound healing awareness",
    redFlags: "Osteoporotic fracture risk, immunosuppression, adrenal suppression with abrupt discontinuation",
  },
  {
    name: "NSAIDs",
    examples: ["Ibuprofen", "Naproxen", "Celecoxib", "Meloxicam"],
    mechanism: "Inhibit cyclooxygenase, reducing prostaglandin-mediated inflammation and pain",
    relevance: "Tissue healing, NSAIDs inhibit the early inflammatory phase",
    exercise: "May mask pain, monitor for overexertion",
    redFlags: "GI bleeding risk, renal function, cardiovascular risk",
  },
  {
    name: "Muscle Relaxants",
    examples: ["Cyclobenzaprine", "Baclofen", "Tizanidine", "Methocarbamol"],
    mechanism: "CNS-acting agents that reduce skeletal muscle tone and spasm",
    relevance: "CNS depression, fall risk, coordination impairment",
    exercise: "Assess balance and coordination, fall precautions",
    redFlags: "Excessive sedation, respiratory depression, withdrawal if abruptly discontinued",
  },
  {
    name: "Opioids",
    examples: ["Oxycodone", "Hydrocodone", "Tramadol", "Morphine"],
    mechanism: "Bind opioid receptors to reduce pain perception",
    relevance: "Sedation, fall risk, pain masking, constipation",
    exercise: "Fall precautions, do not rely on pain as an exercise guide",
    redFlags: "Respiratory depression, excessive sedation, signs of withdrawal",
  },
  {
    name: "Diuretics",
    examples: ["Furosemide", "Hydrochlorothiazide", "Spironolactone"],
    mechanism: "Increase renal excretion of sodium and water",
    relevance: "Electrolyte imbalances, dehydration, orthostatic hypotension",
    exercise: "Monitor for dizziness, check potassium if on loop diuretics",
    redFlags: "Hypokalemia signs, muscle cramps, weakness, arrhythmia",
  },
  {
    name: "Antihypertensives",
    examples: ["Lisinopril", "Amlodipine", "Losartan", "Hydralazine"],
    mechanism: "Lower blood pressure through varied mechanisms, ACE inhibition, calcium channel blockade, vasodilation",
    relevance: "Orthostatic hypotension, exercise BP response",
    exercise: "Rise slowly, monitor BP response to exercise",
    redFlags: "Orthostatic hypotension, syncope, angioedema with ACE inhibitors",
  },
];

function drugMatches(terms: string[], drug: DrugClass): boolean {
  return matchesSearch(terms, drug.name, drug.examples, drug.mechanism, drug.relevance, drug.exercise, drug.redFlags);
}

/** Match count for this tab's label in the Clinical Reference search — see
 *  countLabValueMatches in LabValuesReference.tsx for the shape and why. Searching a drug
 *  class matches on its example drug names too, so "warfarin" finds Anticoagulants. */
export function countMedicationMatches(query: string): number {
  const terms = searchTerms(query);
  return DRUG_CLASSES.filter((d) => drugMatches(terms, d)).length;
}

export function MedicationReference({ query = "" }: { query?: string }) {
  const terms = searchTerms(query);
  const filtered = DRUG_CLASSES.filter((d) => drugMatches(terms, d));

  if (filtered.length === 0) return <p className="clinref-empty">No medication classes match this search.</p>;

  // A search narrow enough to leave a handful of classes standing opens them, so the
  // reader lands on the answer instead of a row of cards they still have to click.
  const autoExpand = terms.length > 0 && filtered.length <= 3;

  return (
    <div className="pro-accordion">
      {filtered.map((drug) => (
        <details className="card elev-sm" key={drug.name} open={autoExpand}>
          <summary className="pro-accordion-summary">
            <div>{drug.name}</div>
            <ChevronRightIcon size={16} className="pro-accordion-chevron" />
          </summary>
          <div className="pro-accordion-content">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {drug.examples.map((ex) => (
                <span className="tag tag-neutral" key={ex}>
                  {ex}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <strong>Mechanism:</strong> {drug.mechanism}
              </div>
              <div>
                <strong>PT relevance:</strong> {drug.relevance}
              </div>
              <div>
                <strong>Exercise implications:</strong> {drug.exercise}
              </div>
              <div style={{ color: "#dc2626" }}>
                <strong>Precautions and red flags:</strong> {drug.redFlags}
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
