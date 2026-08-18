import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { RedFlagCategory } from "@/components/pro/red-flags/RedFlagCategory";
import { ReferralTriggersCategory } from "@/components/pro/red-flags/ReferralTriggersCategory";

const ONCOLOGY = [
  "Age over 50 with new onset back pain",
  "History of cancer",
  "Unexplained weight loss greater than 10 pounds in 6 months",
  "Night pain not relieved by position change",
  "Pain at rest or at night",
  "Failure to improve with conservative treatment after 4-6 weeks",
  "Multiple levels involved",
];

const CARDIOVASCULAR = [
  "Chest pain or pressure with exertion",
  "Pain radiating to left arm or jaw",
  "Syncope or near-syncope",
  "Severe hypertension at rest",
  "Irregular pulse",
  "Unexplained dyspnea",
  "Ankle edema, bilateral",
  "Claudication symptoms",
];

const NEUROLOGICAL = [
  "Bilateral upper or lower extremity symptoms",
  "Saddle anesthesia",
  "Bowel or bladder dysfunction",
  "Hyperreflexia",
  "Positive Babinski",
  "Cranial nerve symptoms",
  "Sudden severe headache, worst of life",
  "Progressive neurological deficit",
];

const INFECTION = [
  "Fever over 100.4",
  "Recent infection, UTI, skin, respiratory",
  "Immunocompromised status",
  "IV drug use history",
  "Recent surgical procedure",
  "Night sweats",
  "Fatigue disproportionate to activity",
];

const FRACTURE_RISK = [
  "History of osteoporosis",
  "Prolonged corticosteroid use",
  "Age over 70",
  "Female, post-menopausal",
  "Trauma mechanism, even minor",
  "Point tenderness over vertebral body",
  "Pain severity disproportionate to mechanism",
];

export default async function ProRedFlagsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Red Flag Screening</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Systematic screening for conditions requiring urgent referral or medical evaluation.
      </p>

      {!hasClinicalReferenceAccess(user) ? (
        <ProGate toolName="Red Flag Screening" />
      ) : (
        <>
          <div className="pro-disclaimer">
            Red flags indicate the need for further evaluation, not a diagnosis. Always use clinical judgment.
          </div>
          <div className="pro-accordion">
            <RedFlagCategory title="Oncology" flags={ONCOLOGY} />
            <RedFlagCategory title="Cardiovascular" flags={CARDIOVASCULAR} />
            <RedFlagCategory title="Neurological" flags={NEUROLOGICAL} />
            <RedFlagCategory title="Systemic, Infection" flags={INFECTION} />
            <RedFlagCategory title="Fracture Risk" flags={FRACTURE_RISK} />
            <ReferralTriggersCategory />
          </div>
        </>
      )}
    </div>
  );
}
