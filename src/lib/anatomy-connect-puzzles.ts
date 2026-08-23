/**
 * Anatomy Connect's static puzzle bank (see app/games/anatomy-connect/page.tsx,
 * lib/anatomy-connect-logic.ts) — each puzzle is a small set of muscles the reader must
 * match to their nerve, primary action, and region, one new puzzle per calendar day.
 */

export interface AnatomyConnectItem {
  muscle: string;
  nerve: string;
  action: string;
  region: string;
}

export interface AnatomyConnectPuzzleEntry {
  id: number;
  title: string;
  size: number;
  items: AnatomyConnectItem[];
}

export const anatomyConnectPuzzles: AnatomyConnectPuzzleEntry[] = [
  {
    id: 1,
    title: "Rotator Cuff",
    size: 4,
    items: [
      { muscle: "Supraspinatus", nerve: "Suprascapular", action: "Shoulder abduction", region: "Posterior shoulder" },
      { muscle: "Infraspinatus", nerve: "Suprascapular", action: "External rotation", region: "Posterior shoulder" },
      { muscle: "Teres Minor", nerve: "Axillary", action: "External rotation", region: "Posterior shoulder" },
      { muscle: "Subscapularis", nerve: "Subscapular", action: "Internal rotation", region: "Anterior shoulder" },
    ],
  },
  {
    id: 2,
    title: "Brachial Plexus — Arm",
    size: 4,
    items: [
      { muscle: "Deltoid", nerve: "Axillary C5-C6", action: "Shoulder abduction", region: "Lateral shoulder" },
      { muscle: "Biceps Brachii", nerve: "Musculocutaneous C5-C6", action: "Elbow flexion", region: "Anterior arm" },
      { muscle: "Triceps Brachii", nerve: "Radial C7-C8", action: "Elbow extension", region: "Posterior arm" },
      { muscle: "Brachioradialis", nerve: "Radial C5-C6", action: "Elbow flexion", region: "Lateral forearm" },
    ],
  },
  {
    id: 3,
    title: "Lumbar Nerve Roots",
    size: 4,
    items: [
      { muscle: "Iliopsoas", nerve: "Femoral L1-L3", action: "Hip flexion", region: "Anterior thigh" },
      { muscle: "Quadriceps", nerve: "Femoral L2-L4", action: "Knee extension", region: "Anterior thigh" },
      { muscle: "Tibialis Anterior", nerve: "Deep Peroneal L4", action: "Ankle dorsiflexion", region: "Anterior leg" },
      { muscle: "Extensor Hallucis Longus", nerve: "Deep Peroneal L5", action: "Great toe extension", region: "Anterior leg" },
    ],
  },
  {
    id: 4,
    title: "Posterior Leg and Ankle",
    size: 4,
    items: [
      { muscle: "Gastrocnemius", nerve: "Tibial S1-S2", action: "Ankle plantarflexion", region: "Posterior leg" },
      { muscle: "Soleus", nerve: "Tibial S1-S2", action: "Ankle plantarflexion", region: "Posterior leg" },
      { muscle: "Tibialis Posterior", nerve: "Tibial L4-L5", action: "Ankle inversion", region: "Deep posterior leg" },
      { muscle: "Peroneus Longus", nerve: "Superficial Peroneal L5-S1", action: "Ankle eversion", region: "Lateral leg" },
    ],
  },
  {
    id: 5,
    title: "Hip Stabilizers",
    size: 4,
    items: [
      { muscle: "Gluteus Maximus", nerve: "Inferior Gluteal L5-S2", action: "Hip extension", region: "Posterior hip" },
      { muscle: "Gluteus Medius", nerve: "Superior Gluteal L4-S1", action: "Hip abduction", region: "Lateral hip" },
      { muscle: "Gluteus Minimus", nerve: "Superior Gluteal L4-S1", action: "Hip abduction", region: "Lateral hip" },
      { muscle: "Tensor Fascia Latae", nerve: "Superior Gluteal L4-S1", action: "Hip flexion and abduction", region: "Lateral hip" },
    ],
  },
  {
    id: 6,
    title: "Forearm and Hand",
    size: 4,
    items: [
      { muscle: "Flexor Carpi Radialis", nerve: "Median C6-C7", action: "Wrist flexion", region: "Anterior forearm" },
      { muscle: "Flexor Carpi Ulnaris", nerve: "Ulnar C7-C8", action: "Wrist flexion and adduction", region: "Anterior forearm" },
      { muscle: "Extensor Carpi Radialis", nerve: "Radial C6-C7", action: "Wrist extension", region: "Posterior forearm" },
      { muscle: "Opponens Pollicis", nerve: "Median C8-T1", action: "Thumb opposition", region: "Thenar eminence" },
    ],
  },
  {
    id: 7,
    title: "Cervical Nerve Roots",
    size: 4,
    items: [
      { muscle: "Deltoid", nerve: "C5", action: "Shoulder abduction", region: "Lateral shoulder" },
      { muscle: "Biceps Brachii", nerve: "C6", action: "Elbow flexion and supination", region: "Anterior arm" },
      { muscle: "Triceps Brachii", nerve: "C7", action: "Elbow extension", region: "Posterior arm" },
      { muscle: "Hand Intrinsics", nerve: "C8-T1", action: "Finger abduction and adduction", region: "Hand" },
    ],
  },
  {
    id: 8,
    title: "Scapular Stabilizers",
    size: 4,
    items: [
      { muscle: "Serratus Anterior", nerve: "Long Thoracic C5-C7", action: "Scapular protraction", region: "Lateral thorax" },
      { muscle: "Trapezius Upper", nerve: "Accessory CN XI", action: "Scapular elevation", region: "Posterior neck" },
      { muscle: "Trapezius Lower", nerve: "Accessory CN XI", action: "Scapular depression", region: "Posterior thorax" },
      { muscle: "Rhomboids", nerve: "Dorsal Scapular C4-C5", action: "Scapular retraction", region: "Posterior thorax" },
    ],
  },
  {
    id: 9,
    title: "Medial Thigh",
    size: 4,
    items: [
      { muscle: "Adductor Longus", nerve: "Obturator L2-L4", action: "Hip adduction", region: "Medial thigh" },
      { muscle: "Adductor Magnus", nerve: "Obturator and Tibial L2-S1", action: "Hip adduction and extension", region: "Medial thigh" },
      { muscle: "Gracilis", nerve: "Obturator L2-L3", action: "Hip adduction and knee flexion", region: "Medial thigh" },
      { muscle: "Pectineus", nerve: "Femoral L2-L3", action: "Hip flexion and adduction", region: "Medial thigh" },
    ],
  },
  {
    id: 10,
    title: "Posterior Thigh",
    size: 4,
    items: [
      { muscle: "Biceps Femoris Long", nerve: "Tibial L5-S2", action: "Knee flexion and hip extension", region: "Posterior thigh" },
      { muscle: "Biceps Femoris Short", nerve: "Common Peroneal L5-S2", action: "Knee flexion", region: "Posterior thigh" },
      { muscle: "Semimembranosus", nerve: "Tibial L5-S2", action: "Knee flexion and hip extension", region: "Posterior thigh" },
      { muscle: "Semitendinosus", nerve: "Tibial L5-S2", action: "Knee flexion and hip extension", region: "Posterior thigh" },
    ],
  },
  {
    id: 11,
    title: "Facial Nerve",
    size: 4,
    items: [
      { muscle: "Frontalis", nerve: "Facial CN VII — Temporal", action: "Forehead elevation", region: "Forehead" },
      { muscle: "Orbicularis Oculi", nerve: "Facial CN VII — Zygomatic", action: "Eye closure", region: "Periorbital" },
      { muscle: "Zygomaticus", nerve: "Facial CN VII — Buccal", action: "Smile", region: "Cheek" },
      { muscle: "Orbicularis Oris", nerve: "Facial CN VII — Buccal", action: "Lip closure", region: "Perioral" },
    ],
  },
  {
    id: 12,
    title: "Deep Hip External Rotators",
    size: 4,
    items: [
      { muscle: "Piriformis", nerve: "Nerve to Piriformis S1-S2", action: "Hip external rotation", region: "Deep posterior hip" },
      { muscle: "Obturator Internus", nerve: "Nerve to Obturator Internus L5-S2", action: "Hip external rotation", region: "Deep posterior hip" },
      { muscle: "Quadratus Femoris", nerve: "Nerve to Quadratus Femoris L4-S1", action: "Hip external rotation", region: "Deep posterior hip" },
      { muscle: "Gemellus Superior", nerve: "Nerve to Obturator Internus L5-S2", action: "Hip external rotation", region: "Deep posterior hip" },
    ],
  },
  {
    id: 13,
    title: "Anterior Leg and Foot",
    size: 4,
    items: [
      { muscle: "Tibialis Anterior", nerve: "Deep Peroneal L4-L5", action: "Dorsiflexion and inversion", region: "Anterior leg" },
      { muscle: "Extensor Digitorum Longus", nerve: "Deep Peroneal L5-S1", action: "Toe extension and dorsiflexion", region: "Anterior leg" },
      { muscle: "Extensor Hallucis Longus", nerve: "Deep Peroneal L5", action: "Great toe extension", region: "Anterior leg" },
      { muscle: "Peroneus Tertius", nerve: "Deep Peroneal L5-S1", action: "Dorsiflexion and eversion", region: "Anterior leg" },
    ],
  },
  {
    id: 14,
    title: "Intrinsic Hand Muscles",
    size: 4,
    items: [
      { muscle: "Abductor Pollicis Brevis", nerve: "Median C8-T1", action: "Thumb abduction", region: "Thenar eminence" },
      { muscle: "Abductor Digiti Minimi", nerve: "Ulnar C8-T1", action: "Little finger abduction", region: "Hypothenar eminence" },
      { muscle: "Dorsal Interossei", nerve: "Ulnar C8-T1", action: "Finger abduction", region: "Dorsal hand" },
      { muscle: "Lumbricals 1-2", nerve: "Median C8-T1", action: "MCP flexion and IP extension", region: "Palm" },
    ],
  },
  {
    id: 15,
    title: "Trunk Stabilizers",
    size: 4,
    items: [
      { muscle: "Transverse Abdominis", nerve: "Thoracoabdominal T7-L1", action: "Intra-abdominal pressure", region: "Anterior trunk" },
      { muscle: "Multifidus", nerve: "Posterior Rami", action: "Spinal extension and stabilization", region: "Posterior spine" },
      { muscle: "Quadratus Lumborum", nerve: "Lumbar Plexus T12-L4", action: "Lateral trunk flexion and hip hike", region: "Posterior abdominal wall" },
      { muscle: "Erector Spinae", nerve: "Posterior Rami", action: "Spinal extension", region: "Posterior trunk" },
    ],
  },
  {
    id: 16,
    title: "Elbow Flexors and Extensors",
    size: 4,
    items: [
      { muscle: "Biceps Brachii", nerve: "Musculocutaneous C5-C6", action: "Elbow flexion and supination", region: "Anterior arm" },
      { muscle: "Brachialis", nerve: "Musculocutaneous C5-C6", action: "Elbow flexion", region: "Anterior arm" },
      { muscle: "Brachioradialis", nerve: "Radial C5-C6", action: "Elbow flexion", region: "Lateral forearm" },
      { muscle: "Triceps Brachii", nerve: "Radial C7-C8", action: "Elbow extension", region: "Posterior arm" },
    ],
  },
  {
    id: 17,
    title: "Wrist Flexors and Extensors",
    size: 4,
    items: [
      { muscle: "Flexor Carpi Radialis", nerve: "Median C6-C7", action: "Wrist flexion and radial deviation", region: "Anterior forearm" },
      { muscle: "Flexor Carpi Ulnaris", nerve: "Ulnar C8-T1", action: "Wrist flexion and ulnar deviation", region: "Anterior forearm" },
      { muscle: "Extensor Carpi Radialis Longus", nerve: "Radial C6-C7", action: "Wrist extension and radial deviation", region: "Posterior forearm" },
      { muscle: "Extensor Carpi Ulnaris", nerve: "Posterior Interosseous C7-C8", action: "Wrist extension and ulnar deviation", region: "Posterior forearm" },
    ],
  },
  {
    id: 18,
    title: "Knee Extensors and Flexors",
    size: 4,
    items: [
      { muscle: "Rectus Femoris", nerve: "Femoral L2-L4", action: "Knee extension and hip flexion", region: "Anterior thigh" },
      { muscle: "Vastus Medialis", nerve: "Femoral L2-L4", action: "Knee extension", region: "Anteromedial thigh" },
      { muscle: "Vastus Lateralis", nerve: "Femoral L2-L4", action: "Knee extension", region: "Anterolateral thigh" },
      { muscle: "Popliteus", nerve: "Tibial L4-S1", action: "Knee unlocking and medial rotation", region: "Posterior knee" },
    ],
  },
  {
    id: 19,
    title: "Neck Flexors and Extensors",
    size: 4,
    items: [
      { muscle: "Sternocleidomastoid", nerve: "Accessory CN XI and C2-C3", action: "Neck flexion and rotation", region: "Lateral neck" },
      { muscle: "Scalenes", nerve: "Cervical Plexus C3-C8", action: "Neck flexion and rib elevation", region: "Lateral neck" },
      { muscle: "Splenius Capitis", nerve: "Posterior Rami C2-C3", action: "Neck extension and ipsilateral rotation", region: "Posterior neck" },
      { muscle: "Suboccipitals", nerve: "Suboccipital C1", action: "Head extension and rotation", region: "Suboccipital region" },
    ],
  },
  {
    id: 20,
    title: "Pelvic Floor",
    size: 4,
    items: [
      { muscle: "Levator Ani", nerve: "Pudendal S2-S4", action: "Pelvic floor support and closure", region: "Pelvic floor" },
      { muscle: "Coccygeus", nerve: "S4-S5", action: "Pelvic floor support", region: "Pelvic floor" },
      { muscle: "External Urethral Sphincter", nerve: "Pudendal S2-S4", action: "Urethral closure", region: "Perineum" },
      { muscle: "Bulbospongiosus", nerve: "Pudendal S2-S4", action: "Genital function", region: "Perineum" },
    ],
  },
  {
    id: 21,
    title: "Shoulder Abductors and Adductors",
    size: 4,
    items: [
      { muscle: "Deltoid Middle", nerve: "Axillary C5-C6", action: "Shoulder abduction", region: "Lateral shoulder" },
      { muscle: "Supraspinatus", nerve: "Suprascapular C5-C6", action: "Initiation of shoulder abduction", region: "Posterior shoulder" },
      { muscle: "Pectoralis Major", nerve: "Medial and Lateral Pectoral C5-T1", action: "Shoulder adduction and internal rotation", region: "Anterior chest" },
      { muscle: "Latissimus Dorsi", nerve: "Thoracodorsal C6-C8", action: "Shoulder adduction and extension", region: "Posterior trunk" },
    ],
  },
  {
    id: 22,
    title: "Ankle Dorsiflexors and Plantarflexors",
    size: 4,
    items: [
      { muscle: "Tibialis Anterior", nerve: "Deep Peroneal L4-L5", action: "Dorsiflexion and inversion", region: "Anterior leg" },
      { muscle: "Extensor Hallucis Longus", nerve: "Deep Peroneal L5", action: "Great toe extension and dorsiflexion", region: "Anterior leg" },
      { muscle: "Gastrocnemius", nerve: "Tibial S1-S2", action: "Plantarflexion", region: "Posterior leg" },
      { muscle: "Soleus", nerve: "Tibial S1-S2", action: "Plantarflexion", region: "Deep posterior leg" },
    ],
  },
  {
    id: 23,
    title: "Cranial Nerves — Motor",
    size: 4,
    items: [
      { muscle: "Extraocular muscles", nerve: "Oculomotor CN III", action: "Eye movement", region: "Orbit" },
      { muscle: "Masseter", nerve: "Trigeminal CN V", action: "Jaw closure", region: "Face" },
      { muscle: "Facial muscles", nerve: "Facial CN VII", action: "Facial expression", region: "Face" },
      { muscle: "Sternocleidomastoid and Trapezius", nerve: "Accessory CN XI", action: "Head rotation and shoulder elevation", region: "Neck and shoulder" },
    ],
  },
  {
    id: 24,
    title: "Finger Flexors",
    size: 4,
    items: [
      { muscle: "Flexor Digitorum Superficialis", nerve: "Median C7-T1", action: "PIP flexion", region: "Anterior forearm" },
      { muscle: "Flexor Digitorum Profundus — Radial", nerve: "Anterior Interosseous C8-T1", action: "DIP flexion digits 2-3", region: "Deep anterior forearm" },
      { muscle: "Flexor Digitorum Profundus — Ulnar", nerve: "Ulnar C8-T1", action: "DIP flexion digits 4-5", region: "Deep anterior forearm" },
      { muscle: "Flexor Pollicis Longus", nerve: "Anterior Interosseous C8-T1", action: "Thumb IP flexion", region: "Deep anterior forearm" },
    ],
  },
  {
    id: 25,
    title: "Hip Flexors",
    size: 4,
    items: [
      { muscle: "Iliopsoas", nerve: "Femoral and Lumbar Plexus L1-L3", action: "Hip flexion", region: "Anterior hip" },
      { muscle: "Rectus Femoris", nerve: "Femoral L2-L4", action: "Hip flexion and knee extension", region: "Anterior thigh" },
      { muscle: "Sartorius", nerve: "Femoral L2-L3", action: "Hip flexion and external rotation", region: "Anterior thigh" },
      { muscle: "Tensor Fascia Latae", nerve: "Superior Gluteal L4-S1", action: "Hip flexion and abduction", region: "Lateral hip" },
    ],
  },
  {
    id: 26,
    title: "Posterior Shoulder",
    size: 4,
    items: [
      { muscle: "Infraspinatus", nerve: "Suprascapular C5-C6", action: "External rotation", region: "Posterior shoulder" },
      { muscle: "Teres Minor", nerve: "Axillary C5-C6", action: "External rotation", region: "Posterior shoulder" },
      { muscle: "Teres Major", nerve: "Lower Subscapular C5-C6", action: "Internal rotation and adduction", region: "Posterior shoulder" },
      { muscle: "Posterior Deltoid", nerve: "Axillary C5-C6", action: "Shoulder extension and external rotation", region: "Posterior shoulder" },
    ],
  },
  {
    id: 27,
    title: "Lumbar Extensors",
    size: 4,
    items: [
      { muscle: "Iliocostalis Lumborum", nerve: "Posterior Rami", action: "Lateral trunk flexion and extension", region: "Lateral posterior trunk" },
      { muscle: "Longissimus Thoracis", nerve: "Posterior Rami", action: "Trunk extension and lateral flexion", region: "Posterior trunk" },
      { muscle: "Multifidus", nerve: "Posterior Rami", action: "Segmental spinal stabilization", region: "Deep posterior spine" },
      { muscle: "Quadratus Lumborum", nerve: "T12-L4", action: "Hip hike and lateral trunk flexion", region: "Posterior abdominal wall" },
    ],
  },
  {
    id: 28,
    title: "Foot Intrinsics",
    size: 4,
    items: [
      { muscle: "Abductor Hallucis", nerve: "Medial Plantar S1-S2", action: "Great toe abduction", region: "Medial plantar foot" },
      { muscle: "Flexor Digitorum Brevis", nerve: "Medial Plantar S1-S2", action: "Toe flexion", region: "Central plantar foot" },
      { muscle: "Abductor Digiti Minimi", nerve: "Lateral Plantar S1-S2", action: "Little toe abduction", region: "Lateral plantar foot" },
      { muscle: "Plantar Interossei", nerve: "Lateral Plantar S1-S2", action: "Toe adduction", region: "Plantar foot" },
    ],
  },
  {
    id: 29,
    title: "Swallowing Muscles",
    size: 4,
    items: [
      { muscle: "Genioglossus", nerve: "Hypoglossal CN XII", action: "Tongue protrusion and depression", region: "Tongue" },
      { muscle: "Mylohyoid", nerve: "Trigeminal CN V", action: "Mouth floor elevation", region: "Suprahyoid" },
      { muscle: "Stylopharyngeus", nerve: "Glossopharyngeal CN IX", action: "Pharynx elevation", region: "Pharynx" },
      { muscle: "Cricothyroid", nerve: "Superior Laryngeal CN X", action: "Vocal cord tension", region: "Larynx" },
    ],
  },
  {
    id: 30,
    title: "Breathing Muscles",
    size: 4,
    items: [
      { muscle: "Diaphragm", nerve: "Phrenic C3-C5", action: "Primary inspiration", region: "Thoracoabdominal" },
      { muscle: "External Intercostals", nerve: "Intercostal T1-T11", action: "Rib elevation and inspiration", region: "Thorax" },
      { muscle: "Sternocleidomastoid", nerve: "Accessory CN XI", action: "Accessory inspiration", region: "Lateral neck" },
      { muscle: "Scalenes", nerve: "Cervical Plexus C3-C8", action: "Rib 1-2 elevation and accessory inspiration", region: "Lateral neck" },
    ],
  },
];
