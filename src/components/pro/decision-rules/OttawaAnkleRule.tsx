"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

export function OttawaAnkleRule() {
  const [ankle, setAnkle] = useState({ lateral: false, medial: false });
  const [foot, setFoot] = useState({ fifthMT: false, navicular: false });
  const [unableToBearWeight, setUnableToBearWeight] = useState(false);

  const ankleIndicated = ankle.lateral || ankle.medial || unableToBearWeight;
  const footIndicated = foot.fifthMT || foot.navicular || unableToBearWeight;

  return (
    <RuleAccordion title="Ottawa Ankle Rules" summary="Ankle fracture screening, sensitivity ~96%">
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Ankle series, bone tenderness at:</div>
        <label className="pro-check-row">
          <input type="checkbox" checked={ankle.lateral} onChange={(e) => setAnkle({ ...ankle, lateral: e.target.checked })} />
          Posterior edge or tip of lateral malleolus
        </label>
        <label className="pro-check-row">
          <input type="checkbox" checked={ankle.medial} onChange={(e) => setAnkle({ ...ankle, medial: e.target.checked })} />
          Posterior edge or tip of medial malleolus
        </label>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Foot series, bone tenderness at:</div>
        <label className="pro-check-row">
          <input type="checkbox" checked={foot.fifthMT} onChange={(e) => setFoot({ ...foot, fifthMT: e.target.checked })} />
          Base of fifth metatarsal
        </label>
        <label className="pro-check-row">
          <input type="checkbox" checked={foot.navicular} onChange={(e) => setFoot({ ...foot, navicular: e.target.checked })} />
          Navicular
        </label>
      </div>
      <label className="pro-check-row">
        <input type="checkbox" checked={unableToBearWeight} onChange={(e) => setUnableToBearWeight(e.target.checked)} />
        Unable to bear weight, immediately and in the ED, 4 steps
      </label>
      <div className={`pro-result-banner pro-result-banner--${ankleIndicated ? "positive" : "negative"}`}>
        Ankle series: {ankleIndicated ? "X-ray indicated" : "X-ray not indicated"}
      </div>
      <div className={`pro-result-banner pro-result-banner--${footIndicated ? "positive" : "negative"}`}>
        Foot series: {footIndicated ? "X-ray indicated" : "X-ray not indicated"}
      </div>
    </RuleAccordion>
  );
}
