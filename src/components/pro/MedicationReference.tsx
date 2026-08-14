import { ChevronRightIcon } from "@/components/icons";

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

export function MedicationReference() {
  return (
    <div className="pro-accordion">
      {DRUG_CLASSES.map((drug) => (
        <details className="card elev-sm" key={drug.name}>
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
