const TEST_ROWS: { test: string; when: string; tellsYou: string }[] = [
  { test: "t-test", when: "Comparing two group means", tellsYou: "Is the difference between groups likely real" },
  { test: "ANOVA", when: "Comparing three or more group means", tellsYou: "Is there a difference somewhere among the groups" },
  { test: "Chi-square", when: "Comparing proportions or categorical outcomes", tellsYou: "Are two categorical variables related" },
  { test: "Pearson r", when: "Correlation between two continuous variables", tellsYou: "How strongly are two variables related" },
  { test: "Intraclass Correlation (ICC)", when: "Reliability between raters or measurements", tellsYou: "How consistent are the measurements" },
  { test: "Odds Ratio", when: "Risk in case-control studies", tellsYou: "How much more likely is the outcome in the exposed group" },
  { test: "Relative Risk", when: "Risk in cohort studies", tellsYou: "How much more likely is the outcome compared to control" },
  { test: "Forest Plot", when: "Summarizing multiple studies in a meta-analysis", tellsYou: "Are the study results consistent and what is the overall effect" },
];

/** Replaces the old collapsed-accordion "How to Read the Statistics" topic (see
 *  ResearchLiteracyGuide.tsx / research-literacy-content.ts on the standalone
 *  /pro/research-literacy guide, which this doesn't touch) with an always-open card grid —
 *  every card's core content is visible without clicking anything; the hover border shift
 *  is just a visual affordance, not a gate on content. Heterogeneous card layouts (a
 *  two-column comparison, side-by-side memory boxes, a CSS-only scale bar, a CSS-only flow
 *  diagram, a reference table) so each card is its own block rather than driven off one
 *  generic shape. */
export function StatisticsCardGrid() {
  return (
    <div>
      <div className="stats-card-grid">
        {/* Card 1 — P-value */}
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-name">P-value</div>
            <span className="stats-formula-pill stats-formula-pill--brand">p &lt; 0.05</span>
          </div>
          <p className="stats-card-def">
            If the treatment truly had no effect, results this extreme would occur by chance less than 5% of the time.
          </p>
          <div className="stats-callout stats-callout--amber">
            <div className="stats-callout-label stats-callout-label--amber">Common misconception</div>
            <p className="stats-callout-text">
              A small p-value does not mean the treatment works well or matters clinically. It only says the result is
              unlikely to be random.
            </p>
          </div>
          <div className="stats-callout stats-callout--green">
            <div className="stats-callout-label stats-callout-label--green">PT Example</div>
            <p className="stats-callout-text">
              A study finds p = 0.03 for a new shoulder exercise. Statistically significant — but the improvement was
              1.5 points on a 100-point scale. Clinically irrelevant.
            </p>
          </div>
        </div>

        {/* Card 2 — Confidence Intervals */}
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-name">Confidence Interval</div>
            <span className="stats-formula-pill stats-formula-pill--purple">95% CI</span>
          </div>
          <p className="stats-card-def">
            If we repeated this study 100 times, 95 of those studies would produce a confidence interval that
            contains the true value.
          </p>
          <div className="stats-callout stats-callout--brand">
            <div className="stats-callout-label stats-callout-label--brand">Why CI beats p-value</div>
            <p className="stats-callout-text">
              The confidence interval tells you the range of plausible effect sizes. A narrow CI means precision. A
              wide CI means uncertainty. Always check the CI, not just the p-value.
            </p>
          </div>
          <div className="stats-callout stats-callout--green">
            <div className="stats-callout-label stats-callout-label--green">PT Example</div>
            <p className="stats-callout-text">
              Manual therapy improved pain by 3 points (95% CI: 0.5 to 5.5). The true effect could be anywhere in
              that range — including barely meaningful.
            </p>
          </div>
        </div>

        {/* Card 3 — Statistical vs. Clinical Significance */}
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-name">Statistical vs. Clinical Significance</div>
          </div>
          <div className="stats-compare">
            <div className="stats-compare-col">
              <div className="stats-compare-col-title">Statistically Significant</div>
              <ul className="stats-compare-list">
                <li>p &lt; 0.05</li>
                <li>Unlikely to be random</li>
                <li>Sample size dependent</li>
                <li>Does NOT mean important</li>
              </ul>
            </div>
            <div className="stats-compare-divider" aria-hidden="true" />
            <div className="stats-compare-col">
              <div className="stats-compare-col-title">Clinically Significant</div>
              <ul className="stats-compare-list">
                <li>Exceeds MCID</li>
                <li>Meaningful to the patient</li>
                <li>Function or pain change</li>
                <li>What actually matters</li>
              </ul>
            </div>
          </div>
          <div className="stats-callout stats-callout--green">
            <div className="stats-callout-label stats-callout-label--green">PT Example</div>
            <p className="stats-callout-text">
              MCID for NPRS is 2 points. A study showing 1.2 point improvement with p = 0.01 is statistically
              significant but clinically insignificant. The patient would not notice the difference.
            </p>
          </div>
        </div>

        {/* Card 4 — Sensitivity, Specificity, and Likelihood Ratios */}
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-name">Sensitivity and Specificity</div>
          </div>
          <div className="stats-memory-boxes">
            <div className="stats-memory-box">
              <div className="stats-memory-box-title" style={{ color: "var(--color-accent)" }}>
                SnNout
              </div>
              <p className="stats-memory-box-text">Sensitive test — Negative result — rules OUT</p>
              <p className="stats-memory-box-example">
                Lachman 85% sensitive — negative Lachman makes ACL tear unlikely
              </p>
            </div>
            <div className="stats-memory-box">
              <div className="stats-memory-box-title" style={{ color: "#16a34a" }}>
                SpPin
              </div>
              <p className="stats-memory-box-text">Specific test — Positive result — rules IN</p>
              <p className="stats-memory-box-example">
                Pivot Shift 98% specific — positive Pivot Shift strongly suggests ACL tear
              </p>
            </div>
          </div>
          <div className="stats-lr-card">
            <div className="stats-lr-row">
              <strong>LR+ above 10</strong> — strong evidence condition present
            </div>
            <div className="stats-lr-row">
              <strong>LR+ 2-5</strong> — weak to moderate evidence
            </div>
            <div className="stats-lr-row">
              <strong>LR- below 0.1</strong> — strong evidence condition absent
            </div>
          </div>
        </div>

        {/* Card 5 — NNT and NNH */}
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-name">Number Needed to Treat</div>
            <span className="stats-formula-pill stats-formula-pill--brand">NNT = 1 / ARR</span>
          </div>
          <p className="stats-card-def">
            How many patients need to receive the treatment for one additional patient to benefit compared to the
            control group.
          </p>
          <div className="stats-nnt-scale">
            <div className="stats-nnt-segment stats-nnt-segment--good">
              <span className="stats-nnt-segment-value">NNT 1-2</span>
              <span className="stats-nnt-segment-label">Excellent</span>
            </div>
            <div className="stats-nnt-arrow" aria-hidden="true">→</div>
            <div className="stats-nnt-segment stats-nnt-segment--mid">
              <span className="stats-nnt-segment-value">NNT 5-10</span>
              <span className="stats-nnt-segment-label">Moderate</span>
            </div>
            <div className="stats-nnt-arrow" aria-hidden="true">→</div>
            <div className="stats-nnt-segment stats-nnt-segment--poor">
              <span className="stats-nnt-segment-value">NNT 20+</span>
              <span className="stats-nnt-segment-label">Marginal</span>
            </div>
          </div>
          <div className="stats-callout stats-callout--red">
            <div className="stats-callout-label stats-callout-label--red">Number Needed to Harm</div>
            <p className="stats-callout-text">
              How many patients need to receive the treatment for one additional patient to experience harm. Always
              weigh NNT against NNH.
            </p>
          </div>
          <div className="stats-callout stats-callout--green">
            <div className="stats-callout-label stats-callout-label--green">PT Example</div>
            <p className="stats-callout-text">
              An exercise program has NNT of 4 for reducing fall risk in geriatric patients. For every 4 patients
              treated, 1 avoids a fall they otherwise would have had.
            </p>
          </div>
        </div>

        {/* Card 6 — Correlation vs. Causation */}
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-name">Correlation is Not Causation</div>
          </div>
          <div className="stats-causation-flow">
            <div className="stats-causation-step stats-causation-step--brand">
              <div className="stats-causation-step-title">A and B occur together</div>
            </div>
            <div className="stats-causation-arrow stats-causation-arrow--brand" aria-hidden="true" />
            <div className="stats-causation-step stats-causation-step--amber">
              <div className="stats-causation-step-title">A causes B?</div>
              <div className="stats-causation-step-sub">Maybe</div>
            </div>
            <div className="stats-causation-arrow stats-causation-arrow--amber" aria-hidden="true" />
            <div className="stats-causation-step stats-causation-step--green">
              <div className="stats-causation-step-title">Or C causes both?</div>
              <div className="stats-causation-step-sub">More likely</div>
            </div>
          </div>
          <div className="stats-card-subhead">Common confounders in PT research</div>
          <ul className="stats-confounder-list">
            <li>Healthier patients seek more treatment and also recover faster</li>
            <li>Patients who adhere to exercise also make other healthy choices</li>
            <li>Pain often improves with time regardless of treatment</li>
          </ul>
          <div className="stats-callout stats-callout--green">
            <div className="stats-callout-label stats-callout-label--green">PT Example</div>
            <p className="stats-callout-text">
              Studies show patients who attend more PT visits have better outcomes. Does PT cause improvement — or do
              patients who are already improving attend more visits? Correlation only.
            </p>
          </div>
        </div>
      </div>

      {/* Card 7 — Common Statistical Tests at a Glance */}
      <div className="stats-card stats-card--wide">
        <div className="stats-card-header">
          <div className="stats-card-name">Common Statistical Tests</div>
        </div>
        <div className="stats-table-wrap">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>When Used</th>
                <th>What It Tells You</th>
              </tr>
            </thead>
            <tbody>
              {TEST_ROWS.map((row) => (
                <tr key={row.test}>
                  <td>{row.test}</td>
                  <td>{row.when}</td>
                  <td>{row.tellsYou}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
