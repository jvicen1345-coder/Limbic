import { RuleAccordion } from "./RuleAccordion";

// TODO: Build the full interactive Wells PE criteria (clinical signs of DVT +3, PE most
// likely diagnosis +3, HR >100 +1.5, immobilization/surgery in prior 4 weeks +1.5, prior
// DVT/PE +1.5, hemoptysis +1, malignancy +1) with running score and probability bands,
// same interactive structure as WellsDvtRule.tsx, before launch.
export function WellsPeRule() {
  return (
    <RuleAccordion title="Wells Criteria for PE" summary="Pulmonary embolism risk stratification">
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
        Interactive scoring coming soon. TODO: same interactive structure as Wells Criteria for DVT above, clinical
        signs of DVT, PE as likely or more likely diagnosis, heart rate over 100, immobilization or surgery in the
        prior 4 weeks, prior DVT or PE, hemoptysis, malignancy.
      </p>
    </RuleAccordion>
  );
}
