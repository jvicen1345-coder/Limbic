/** Content for the Research & Statistics Literacy guide (see app/(app)/pro/research-literacy
 *  and components/pro/ResearchLiteracyGuide.tsx) — kept presentation-agnostic, same
 *  "lib data, page-level presentation" split as lib/nutrition-content.ts,
 *  lib/board-content.ts, etc. General clinical education, not a substitute for formal
 *  biostatistics/EBP coursework — written to help a reader critically read a single paper,
 *  not to make them a statistician. */

export interface LiteracyTopic {
  title: string;
  body: string[];
}

export interface LiteracySection {
  id: string;
  title: string;
  intro: string;
  topics: LiteracyTopic[];
}

export const RESEARCH_LITERACY_SECTIONS: LiteracySection[] = [
  {
    id: "reading-articles",
    title: "How to Break Down a Research Article",
    intro:
      "A paper follows a predictable structure for a reason — reading it in the right order, with the right questions in mind, gets you to \"can I trust this, and does it apply to my patient\" much faster than reading start to finish.",
    topics: [
      {
        title: "Read the abstract for orientation, not for the answer",
        body: [
          "The abstract tells you what the study asked, roughly how, and what they found — enough to decide if the full paper is worth your time, not enough to actually apply the findings. Abstracts are also where authors are most likely to oversell a result, since it's the only part most readers ever see.",
          "Note the population, the intervention or exposure, the comparison, and the outcome (PICO) before you read anything else — you'll re-check every later section against these.",
        ],
      },
      {
        title: "Introduction: what gap is this actually filling?",
        body: [
          "A good introduction narrows from \"here's what's known\" to \"here's the specific unanswered question\" to \"here's our hypothesis.\" If you can't find a clear gap being filled, be skeptical of why the study was done at all.",
          "Watch for how the authors frame prior evidence — cherry-picked citations that only support one side of a debate is an early red flag for the rest of the paper.",
        ],
      },
      {
        title: "Methods: this is where a paper is actually won or lost",
        body: [
          "Study design tells you the ceiling on how much you can trust the result, before you even look at what they found — see the evidence hierarchy below.",
          "For an intervention study, check: was assignment to groups actually random, and was that randomization concealed from whoever enrolled patients? Was there a control or comparison group? Who was blinded — participants, treating clinicians, outcome assessors — and is blinding even possible for this intervention (hard for manual therapy, easy for a pill)?",
          "Check the sample size and where it came from. A study that doesn't report an a priori power calculation may simply be too small to detect a real effect (underpowered), which is different from proving there's no effect.",
          "Look at inclusion/exclusion criteria — a tightly selected sample (e.g., excluding anyone with comorbidities) may not look like the patients in front of you, which limits how far you can generalize the result.",
        ],
      },
      {
        title: "Results: separate what they measured from what they claim",
        body: [
          "Read the actual numbers in the tables before reading the authors' prose description of them — authors sometimes describe a result more favorably in text than the raw data supports.",
          "Distinguish statistical significance from clinical significance (see the Statistics section below) — a real, reproducible effect can still be too small to matter to a patient.",
          "Check the dropout/attrition rate and whether the analysis was intention-to-treat (everyone analyzed in the group they were assigned to, even if they didn't finish) versus per-protocol (only those who completed treatment) — per-protocol-only analyses can inflate how good an intervention looks by dropping the people it didn't work for.",
        ],
      },
      {
        title: "Discussion and limitations: the section most readers skip",
        body: [
          "A trustworthy discussion section states its own limitations plainly — small sample, short follow-up, single-site, industry funding, lack of blinding. If a paper has none of these acknowledged, that's a bigger red flag than any single limitation would be.",
          "Check whether the conclusion actually matches the data, or overreaches beyond what the study design can support — a single small RCT does not \"prove\" anything on its own; it adds one data point to a larger body of evidence.",
        ],
      },
      {
        title: "The evidence hierarchy — what to weigh more heavily",
        body: [
          "Roughly strongest to weakest for a question about whether a treatment works: systematic reviews/meta-analyses of RCTs, individual RCTs, cohort studies, case-control studies, case series/case reports, and expert opinion. This is the same evidence-level system this app tags articles with (SR, RCT, etc.) — a higher tag means the design itself carries more weight, independent of how well any single study was executed.",
          "Design isn't everything — a well-run cohort study can be more trustworthy than a poorly-run, underpowered RCT. Design sets the ceiling; execution (the Methods questions above) determines how close a given study gets to it.",
        ],
      },
      {
        title: "Generalizability — does this apply to the patient in front of you?",
        body: [
          "Generalizability (also called external validity) is how well a study's findings apply beyond the exact sample it was tested on — to a different population, setting, or context. It's a separate question from internal validity (whether the study was designed well enough to correctly measure what it claims within its own sample) — a study can be internally airtight and still generalize poorly.",
          "What narrows it: narrow inclusion/exclusion criteria (excluding anyone with comorbidities, prior surgery, certain ages), a single site or a demographically narrow sample, a highly controlled or artificial setting that's hard to replicate in real practice, and short follow-up that doesn't show whether an effect holds long-term.",
          "In practice: compare the study's stated population against your own patient on the factors that plausibly matter for this question — age, diagnosis and severity, comorbidities, prior treatment history, and setting. The more those diverge, the more caution the result deserves, even if the study itself was well-run. See the Generalizability Checker below for a structured way to work through this comparison for a specific article.",
        ],
      },
    ],
  },
  {
    id: "reading-stats",
    title: "How to Read the Statistics",
    intro:
      "You don't need to be able to run these analyses yourself to read them correctly — you just need to know what each number is actually claiming, and what it isn't.",
    topics: [
      {
        title: "P-values: what they answer, and what they don't",
        body: [
          "A p-value is the probability of seeing a result this extreme (or more extreme) if the null hypothesis (\"no real effect\") were actually true. p < 0.05 is a common but arbitrary cutoff for calling a result \"statistically significant.\"",
          "A p-value is NOT the probability that the treatment doesn't work, and it is NOT the probability that the null hypothesis is true. It also says nothing about the size of the effect — a tiny, clinically meaningless difference can still hit p < 0.05 if the sample is large enough.",
          "\"Not statistically significant\" doesn't mean \"proven no effect\" either — it often just means the study was too small to detect a real, smaller effect (underpowered).",
        ],
      },
      {
        title: "Confidence intervals: usually more informative than the p-value alone",
        body: [
          "A 95% confidence interval (CI) is the range of values the true effect plausibly falls within, given this data. A narrow CI means a more precise estimate; a wide CI means a lot of uncertainty, even if the point estimate looks impressive.",
          "For a difference-between-groups result, if the CI crosses zero (or crosses 1 for a ratio like risk ratio/odds ratio), the result isn't statistically significant — you're looking at the same information the p-value gives you, just with a sense of the plausible range attached.",
        ],
      },
      {
        title: "Statistical significance vs. clinical significance",
        body: [
          "Ask two separate questions: is this effect real (statistical significance), and is this effect big enough to matter to a patient (clinical significance, sometimes reported as the minimal clinically important difference, MCID)? A large trial can produce a statistically significant result that's well below the MCID for a given outcome measure — real, but not worth changing practice over.",
        ],
      },
      {
        title: "Sensitivity, specificity, and likelihood ratios",
        body: [
          "Sensitivity: of everyone who actually has the condition, what fraction does the test correctly identify as positive? A highly sensitive test, when negative, helps rule a condition out (mnemonic: SnNout).",
          "Specificity: of everyone who doesn't have the condition, what fraction does the test correctly identify as negative? A highly specific test, when positive, helps rule a condition in (mnemonic: SpPin).",
          "Likelihood ratios combine both into how much a given test result should shift your probability estimate — a positive LR above 10 or a negative LR below 0.1 meaningfully shifts your thinking; values close to 1 barely move the needle either way. This is exactly what the special tests and clinical decision rules elsewhere in this toolbox report alongside each test.",
        ],
      },
      {
        title: "Number needed to treat (NNT) and number needed to harm (NNH)",
        body: [
          "NNT is how many patients need to receive a treatment for one additional patient to benefit, compared to the control — lower is better (NNT of 1 would mean everyone treated benefits). NNH is the same idea for an adverse outcome — higher is better (fewer harmed).",
          "NNT/NNH turn an abstract effect size into a number that's genuinely useful for a real conversation with a patient about whether a treatment is worth trying.",
        ],
      },
      {
        title: "Correlation isn't causation",
        body: [
          "An association between two variables (X and Y tend to occur together) doesn't establish that one causes the other — a third factor could cause both, the direction of causation could run the other way, or it could be coincidence in a small sample. Only a well-controlled experimental design (randomization, in particular) lets you make a real causal claim; observational studies (cohort, case-control) can only establish association.",
        ],
      },
      {
        title: "Common statistical tests, at a glance",
        body: [
          "t-test: compares the means of two groups (e.g., treatment vs. control) for one continuous outcome.",
          "ANOVA: compares means across three or more groups at once.",
          "Chi-square test: compares proportions between groups for a categorical outcome (e.g., \"improved\" vs. \"not improved\").",
          "Correlation (Pearson/Spearman): measures the strength and direction of a relationship between two continuous variables, from -1 to 1.",
          "Regression: models how one or more variables predict an outcome, and can adjust for confounders (variables that might otherwise distort the relationship you actually care about).",
        ],
      },
    ],
  },
];
