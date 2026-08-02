import type { Article } from "@/lib/types";
import { TYPE_META } from "@/lib/meta";
import { estimateReadMins } from "@/lib/news-live";

/**
 * Real clinical practice guidelines published by the Academy of Orthopaedic Physical
 * Therapy (orthopt.org — see https://www.orthopt.org/content/publications/pub-cpg),
 * curated by hand rather than scraped live (that page isn't reachable from this app's
 * fetch environment). Every entry links out to the actual guideline PDF or its JOSPT
 * record — no fabricated content, same integrity bar as lib/retraction-watch-data.ts
 * and the REAL_PEOPLE half of lib/nexus-seed.ts. Always included in getArticles() (see
 * lib/articles.ts) rather than only surfacing on a live-fetch topped-up count, since
 * unlike the Google-News-sourced categories these are the authoritative documents
 * themselves, not news coverage about them.
 */
function cpg(
  id: string,
  title: string,
  specialty: Article["specialty"],
  date: string,
  sourceUrl: string,
  summary: string,
  tags: string[]
): Article {
  return {
    id: `cpg-${id}`,
    type: "guideline",
    specialty,
    title,
    source: "Journal of Orthopaedic & Sports PT",
    sourceUrl,
    date,
    readMins: estimateReadMins(summary),
    summary,
    tags: [TYPE_META.guideline.label, ...tags],
    live: true,
  };
}

export const ORTHOPT_CPG_SEED: Article[] = [
  cpg(
    "neck-pain-2017",
    "Neck Pain: Revision 2017",
    "ortho",
    "2017-07-01",
    "https://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf",
    "AOPT's evidence-based recommendations for the examination, classification, and physical therapist management of neck pain, updating the 2008 guideline.",
    ["Neck pain"]
  ),
  cpg(
    "low-back-pain-2021",
    "Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021",
    "ortho",
    "2021-11-01",
    "https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf",
    "AOPT's 2021 update to its low back pain guideline, adding recommendations on interventions not covered in the 2012 version — including dry needling, cognitive functional therapy, and pain neuroscience education.",
    ["Low back pain"]
  ),
  cpg(
    "hip-oa-2025",
    "Hip Pain and Mobility Deficits—Hip Osteoarthritis: Revision 2025",
    "ortho",
    "2025-11-01",
    "https://www.orthopt.org/uploads/content_files/files/koc_et_al_2025_hip_pain_and_mobility_deficits_hip_osteoarthritis_revision_2025(1).pdf",
    "AOPT's second revision of the hip osteoarthritis guideline, addressing the evidence for physical therapist interventions in patients with hip OA.",
    ["Hip osteoarthritis"]
  ),
  cpg(
    "knee-meniscal-cartilage-2018",
    "Knee Pain and Mobility Impairments: Meniscal and Articular Cartilage Lesions Revision 2018",
    "ortho",
    "2018-02-01",
    "https://www.orthopt.org/uploads/content_files/files/Knee%20pain%20and%20mobility%20impairments%202018.pdf",
    "AOPT's guideline on physical therapist diagnosis, examination, and treatment of meniscal and articular cartilage lesions of the knee.",
    ["Knee pain"]
  ),
  cpg(
    "ankle-lateral-ligament-sprains-2021",
    "Ankle Stability and Movement Coordination Impairments: Lateral Ankle Ligament Sprains Revision 2021",
    "sports",
    "2021-04-01",
    "https://www.jospt.org/doi/10.2519/jospt.2021.0302",
    "AOPT's revised guideline covering both first-time lateral ankle sprains and chronic ankle instability, with updated recommendations on bracing, manual therapy, and balance training.",
    ["Ankle sprain"]
  ),
  cpg(
    "achilles-tendinopathy-2024",
    "Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision 2024",
    "sports",
    "2024-12-01",
    "https://www.orthopt.org/uploads/content_files/files/chimenti_et_al_2024_achilles_pain_stiffness_and_muscle_power_deficits_midportion_achilles_tendinopathy_revision_2024.pdf",
    "AOPT's third guideline revision on midportion Achilles tendinopathy, covering diagnosis, risk factors, and physical therapist management.",
    ["Achilles tendinopathy"]
  ),
  cpg(
    "heel-pain-plantar-fasciitis-2023",
    "Heel Pain–Plantar Fasciitis: Revision 2023",
    "ortho",
    "2023-12-01",
    "https://www.orthopt.org/uploads/content_files/files/Heel_Pain_Plantar_Fasciitis_Revision_2023.pdf",
    "AOPT's third revision of the heel pain / plantar fasciitis guideline, incorporating over 100 new studies into updated manual therapy, stretching, and orthotic recommendations.",
    ["Plantar fasciitis", "Heel pain"]
  ),
  cpg(
    "rotator-cuff-tendinopathy-2025",
    "Rotator Cuff Tendinopathy Diagnosis, Nonsurgical Medical Care, and Rehabilitation",
    "ortho",
    "2025-04-01",
    "https://www.jospt.org/doi/10.2519/jospt.2025.13182",
    "Evidence-based and consensus recommendations for the assessment, nonsurgical management, and return-to-sport care of adults with rotator cuff tendinopathy.",
    ["Rotator cuff", "Shoulder pain"]
  ),
];
