// Patient-facing "Common Pathologies" content for Health & Wellness (see
// app/(app)/wellness/pathologies/page.tsx) — plain-language condition explanations for a
// general/patient audience, distinct from LimbicPRO's clinician-facing reference tools
// (e.g. components/pro/SpecialTestsLibrary.tsx, which assumes clinical background). Each
// entry deliberately avoids specific statistics, prognoses, or treatment prescriptions that
// would need a citation to state responsibly — general, widely-accepted patient-education
// framing only, plus a standing "talk to a physician or PT" pointer rather than any
// diagnostic or treatment claim specific to the reader.

export interface Pathology {
  slug: string;
  name: string;
  category: string;
  /** One-line summary shown on the card before it's expanded. */
  summary: string;
  /** Plain-language explanation — what it is, common symptoms, what usually helps. */
  explanation: string[];
  /** Video search query — see lib/pathology-videos.ts. Written to bias toward a patient-
   *  education explainer rather than a clinical/technique video. */
  videoQuery: string;
}

export const PATHOLOGIES: Pathology[] = [
  {
    slug: "low-back-pain",
    name: "Low Back Pain",
    category: "Back & Neck",
    summary: "The most common reason people miss work or see a physical therapist — usually mechanical, not dangerous.",
    explanation: [
      "Low back pain is discomfort felt anywhere between the bottom of the ribs and the top of the legs. Most cases are \"nonspecific,\" meaning the pain comes from how the muscles, joints, and discs of the low back are moving and loading, rather than from a single structural problem visible on imaging.",
      "Symptoms often include stiffness after sitting or first thing in the morning, an ache that shifts with position, and pain that eases with gentle movement. Most episodes improve over several weeks with continued activity — prolonged bed rest tends to slow recovery rather than help it.",
      "A physical therapist can help identify which movements aggravate or relieve your pain and build a plan around them. See a physician promptly if pain follows a fall or injury, or comes with numbness, weakness, or changes in bladder or bowel control.",
    ],
    videoQuery: "low back pain explained physical therapy patient education",
  },
  {
    slug: "sciatica",
    name: "Sciatica",
    category: "Back & Neck",
    summary: "Pain that travels down the leg along the path of the sciatic nerve, usually from irritation in the low back.",
    explanation: [
      "Sciatica isn't a diagnosis on its own — it describes pain, tingling, or numbness that radiates from the low back or buttock down the back of the leg, following the path of the sciatic nerve. It's usually caused by irritation or compression of a nerve root in the lower spine, often from a disc bulge.",
      "Many people notice the leg symptoms are worse than the back pain itself, and that certain positions (like sitting) make it worse while others (like walking) ease it. Most cases improve over weeks to a few months with activity modification and targeted exercise.",
      "A physical therapist can guide which positions and movements to favor. Seek prompt medical care for progressive leg weakness, numbness in the groin/inner thigh, or new bladder or bowel changes.",
    ],
    videoQuery: "sciatica explained physical therapy patient education",
  },
  {
    slug: "neck-pain",
    name: "Neck Pain",
    category: "Back & Neck",
    summary: "Stiffness or ache in the neck, often linked to posture, stress, or sleeping position.",
    explanation: [
      "Neck pain is extremely common and usually mechanical — related to how the joints and muscles of the cervical spine are moving and loading rather than a serious underlying condition. Long periods in one position (like at a desk or on a phone) are a frequent contributor.",
      "It typically shows up as stiffness, a dull ache, or difficulty turning the head fully in one direction, sometimes with a headache. Gentle range-of-motion exercise, posture changes, and staying active generally help more than resting the neck completely.",
      "A physical therapist can assess your neck's movement and build a plan to restore it. See a physician if neck pain follows an injury or trauma, or comes with arm weakness, numbness, or fever.",
    ],
    videoQuery: "neck pain explained physical therapy patient education",
  },
  {
    slug: "rotator-cuff-tendinopathy",
    name: "Rotator Cuff Tendinopathy",
    category: "Shoulder & Arm",
    summary: "Irritation of the shoulder tendons that help lift and rotate the arm, common with overhead activity.",
    explanation: [
      "The rotator cuff is a group of four muscles and tendons that stabilize the shoulder and help lift and rotate the arm. Tendinopathy means those tendons have become irritated, usually from repeated overhead activity, a change in training load, or after periods of underuse.",
      "Common symptoms are an ache on the outer or front shoulder, pain with reaching overhead or behind the back, and discomfort lying on the affected side at night. It tends to respond well to a gradual, progressive strengthening program rather than complete rest.",
      "A physical therapist can guide safe loading of the shoulder as it recovers. See a physician if there was a specific injury, sudden severe weakness, or an inability to lift the arm at all, which can suggest a tear rather than tendinopathy.",
    ],
    videoQuery: "rotator cuff tendinopathy explained physical therapy patient education",
  },
  {
    slug: "frozen-shoulder",
    name: "Frozen Shoulder (Adhesive Capsulitis)",
    category: "Shoulder & Arm",
    summary: "A gradual, significant loss of shoulder motion that gets better on its own but often takes many months.",
    explanation: [
      "Frozen shoulder happens when the capsule surrounding the shoulder joint thickens and tightens, progressively limiting motion in multiple directions — not just one. It's more common in people with diabetes and often develops without a clear injury.",
      "It typically moves through phases: increasing pain and stiffness, a plateau of significant stiffness with less pain, and then a gradual return of motion. The whole process commonly takes many months, and staying gently active within a comfortable range tends to help more than forcing movement through pain.",
      "A physical therapist can guide gentle mobility work appropriate to each phase. See a physician to confirm the diagnosis, since other shoulder problems can look similar early on.",
    ],
    videoQuery: "frozen shoulder adhesive capsulitis explained patient education",
  },
  {
    slug: "tennis-elbow",
    name: "Tennis Elbow (Lateral Epicondylalgia)",
    category: "Shoulder & Arm",
    summary: "Pain on the outside of the elbow from overuse of the forearm muscles that extend the wrist.",
    explanation: [
      "Despite the name, this is common in anyone who repeatedly grips, types, or uses tools — not just tennis players. It involves irritation of the tendons on the outside of the elbow where the wrist-extending muscles attach.",
      "The main symptom is tenderness or pain on the outer elbow that increases with gripping, lifting with a straight arm, or repetitive wrist motion. It generally improves with load management and a progressive strengthening program for the forearm.",
      "A physical therapist can help you gradually reload the tendon without flaring it up. See a physician if there's significant swelling, an inability to bend or straighten the elbow, or symptoms after a direct injury.",
    ],
    videoQuery: "tennis elbow lateral epicondylitis explained patient education",
  },
  {
    slug: "carpal-tunnel-syndrome",
    name: "Carpal Tunnel Syndrome",
    category: "Shoulder & Arm",
    summary: "Numbness and tingling in the hand from compression of the median nerve at the wrist.",
    explanation: [
      "Carpal tunnel syndrome occurs when the median nerve, which runs through a narrow tunnel of bone and ligament at the wrist, becomes compressed. It's often linked to repetitive hand or wrist use, though it can also occur without an obvious cause.",
      "Typical symptoms include numbness or tingling in the thumb, index, and middle fingers — often worse at night or after repetitive tasks — and, in more advanced cases, weakness in the hand. Symptoms often improve with wrist positioning changes, activity modification, and nerve-gliding exercises.",
      "A physical therapist can assess wrist and nerve mobility and suggest positioning strategies. See a physician if hand weakness or muscle wasting develops, or symptoms don't improve, since more advanced cases may need further evaluation.",
    ],
    videoQuery: "carpal tunnel syndrome explained patient education",
  },
  {
    slug: "knee-osteoarthritis",
    name: "Knee Osteoarthritis",
    category: "Hip & Knee",
    summary: "Gradual wear-related changes in the knee joint that cause stiffness and ache, especially with activity.",
    explanation: [
      "Osteoarthritis is the most common form of arthritis, involving gradual changes to the cartilage and other tissues of a joint over time. In the knee, it typically causes stiffness (especially after rest), a dull ache with activity, and sometimes swelling.",
      "Contrary to older advice to rest an arthritic joint, regular movement and strengthening the muscles around the knee are now considered central to managing symptoms and maintaining function. Low-impact activity like walking, cycling, or swimming is generally well tolerated.",
      "A physical therapist can build a strengthening and activity plan suited to your knee. See a physician for a formal diagnosis and to discuss options if symptoms significantly limit daily activity.",
    ],
    videoQuery: "knee osteoarthritis explained physical therapy patient education",
  },
  {
    slug: "hip-osteoarthritis",
    name: "Hip Osteoarthritis",
    category: "Hip & Knee",
    summary: "Wear-related changes in the hip joint causing groin or thigh stiffness and pain, especially after rest.",
    explanation: [
      "Like knee osteoarthritis, hip osteoarthritis involves gradual changes to the joint's cartilage and surrounding tissue. It commonly causes stiffness after sitting, pain felt in the groin or front of the thigh (sometimes mistaken for a different problem), and a limited range of motion.",
      "Staying active, maintaining hip and core strength, and pacing activity tend to help manage symptoms better than avoiding movement. Many people find low-impact exercise reduces stiffness over time.",
      "A physical therapist can help build hip strength and mobility around your symptoms. See a physician for diagnosis and to discuss options if pain is significantly limiting your daily activity or sleep.",
    ],
    videoQuery: "hip osteoarthritis explained physical therapy patient education",
  },
  {
    slug: "patellofemoral-pain-syndrome",
    name: "Patellofemoral Pain Syndrome",
    category: "Hip & Knee",
    summary: "\"Runner's knee\" — an ache around or behind the kneecap, often worse with stairs, squatting, or sitting.",
    explanation: [
      "Patellofemoral pain syndrome refers to pain around or behind the kneecap related to how it tracks and loads against the thigh bone. It's especially common in runners and other active people, and can also affect people who sit for long periods.",
      "Typical triggers are stairs (especially going down), squatting, kneeling, and prolonged sitting with bent knees. It generally responds well to a graded strengthening program for the hip and thigh muscles, which helps control how the kneecap tracks.",
      "A physical therapist can identify strength or movement patterns contributing to your symptoms. See a physician if there's swelling, locking, or a sense of the knee giving way, which can suggest a different issue.",
    ],
    videoQuery: "patellofemoral pain syndrome runners knee explained patient education",
  },
  {
    slug: "acl-sprain",
    name: "ACL Sprain / Tear",
    category: "Hip & Knee",
    summary: "An injury to a key stabilizing ligament in the knee, often from a sudden pivot, landing, or direct blow.",
    explanation: [
      "The anterior cruciate ligament (ACL) is one of the main ligaments stabilizing the knee, and it's commonly injured during sports involving sudden changes of direction, jumping, or landing. Many people report feeling or hearing a \"pop\" at the time of injury, followed by swelling and a feeling of instability.",
      "Not every ACL injury requires surgery — the right path depends on the severity of the tear, your activity goals, and other factors a physician and physical therapist assess together. Either way, a structured rehabilitation program is central to regaining strength, stability, and confidence in the knee.",
      "See a physician promptly after a suspected ACL injury for an accurate diagnosis. A physical therapist can then guide rehab, whether or not surgery is part of your plan.",
    ],
    videoQuery: "ACL tear explained physical therapy patient education",
  },
  {
    slug: "achilles-tendinopathy",
    name: "Achilles Tendinopathy",
    category: "Foot & Ankle",
    summary: "Irritation of the tendon connecting the calf to the heel, common in runners and after a jump in activity.",
    explanation: [
      "The Achilles tendon connects the calf muscles to the heel bone and absorbs significant load during walking, running, and jumping. Tendinopathy develops when the tendon is loaded faster than it can adapt — often after a sudden increase in running volume or intensity.",
      "It typically causes stiffness and pain in the back of the ankle, often worse with the first steps in the morning or after sitting, and with pushing off during walking or running. A gradual, progressive loading program (rather than complete rest) is generally the most effective approach.",
      "A physical therapist can guide a safe return to loading and activity. See a physician if there was a sudden sharp pain with a snap or pop, which can indicate a rupture rather than tendinopathy.",
    ],
    videoQuery: "achilles tendinopathy explained physical therapy patient education",
  },
  {
    slug: "plantar-fasciitis",
    name: "Plantar Fasciitis",
    category: "Foot & Ankle",
    summary: "Heel pain from irritation of the tissue band that supports the arch of the foot.",
    explanation: [
      "The plantar fascia is a thick band of tissue running along the bottom of the foot from the heel to the toes, supporting the arch. Plantar fasciitis is irritation of this tissue, often related to a change in activity, footwear, or standing/walking load.",
      "The hallmark symptom is a sharp pain at the bottom of the heel with the first steps in the morning or after sitting, which often eases somewhat with continued walking. Calf and foot stretching, activity modification, and gradual strengthening tend to help most people over time.",
      "A physical therapist can guide stretching and strengthening specific to your foot and gait. See a physician if pain is severe, one-sided with swelling and redness, or doesn't improve after several weeks of self-care.",
    ],
    videoQuery: "plantar fasciitis explained physical therapy patient education",
  },
  {
    slug: "shin-splints",
    name: "Shin Splints (Medial Tibial Stress Syndrome)",
    category: "Foot & Ankle",
    summary: "An ache along the inner shin bone, common after a sudden increase in running or jumping activity.",
    explanation: [
      "\"Shin splints\" describes pain along the inner edge of the shin bone (tibia), usually from repeated stress on the bone and surrounding tissue exceeding what it's adapted to handle — most often after a sudden jump in running distance, intensity, or a change in surface or footwear.",
      "It typically causes a diffuse ache along a length of the shin during and after activity, distinct from a sharp, pinpoint pain in one spot (which can suggest a stress fracture and needs medical evaluation). Reducing training load temporarily, addressing footwear, and gradually rebuilding tolerance are the usual approach.",
      "A physical therapist can help assess training load and build a graded return-to-running plan. See a physician if pain is sharply localized to one point on the bone, or persists despite reduced activity.",
    ],
    videoQuery: "shin splints medial tibial stress syndrome explained patient education",
  },
  {
    slug: "tension-headache",
    name: "Tension-Type Headache",
    category: "Chronic & Widespread",
    summary: "The most common type of headache — a dull, band-like pressure often linked to neck and shoulder tension.",
    explanation: [
      "Tension-type headaches are the most common headache type, typically felt as a dull, pressing ache or tightness on both sides of the head, sometimes described as a band around the head. They're often related to muscle tension in the neck and upper shoulders, stress, or prolonged postures.",
      "Unlike migraines, they usually aren't accompanied by nausea or sensitivity to light, and they don't typically worsen with routine physical activity. Addressing neck mobility, posture, and stress management can reduce how often they occur for many people.",
      "A physical therapist can assess whether neck mobility or muscle tension is contributing to your headaches. See a physician for any headache that's sudden and severe, follows a head injury, or comes with vision changes, confusion, or weakness.",
    ],
    videoQuery: "tension headache explained neck related patient education",
  },
  {
    slug: "fibromyalgia",
    name: "Fibromyalgia",
    category: "Chronic & Widespread",
    summary: "A chronic condition causing widespread pain, fatigue, and heightened sensitivity to pain throughout the body.",
    explanation: [
      "Fibromyalgia is a chronic condition characterized by widespread musculoskeletal pain, often along with fatigue, sleep difficulties, and cognitive symptoms sometimes called \"fibro fog.\" It's thought to involve the nervous system processing pain signals differently, rather than damage to a specific joint or tissue.",
      "Because symptoms are widespread and can vary day to day, management is usually multi-part — commonly including graded low-impact exercise, sleep and stress management, and pacing activity to avoid symptom flares from overexertion.",
      "A physical therapist can help design a gentle, progressive activity plan that respects flare-ups rather than pushing through them. A physician can help confirm the diagnosis and coordinate broader care.",
    ],
    videoQuery: "fibromyalgia explained patient education",
  },
];

export function getPathology(slug: string): Pathology | undefined {
  return PATHOLOGIES.find((p) => p.slug === slug);
}
