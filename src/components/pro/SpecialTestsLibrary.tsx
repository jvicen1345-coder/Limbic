"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

interface SpecialTest {
  name: string;
  region: string;
  assesses: string;
}

const REGIONS = ["All", "Cervical", "Shoulder", "Elbow/Wrist", "Lumbar", "Hip", "Knee", "Ankle/Foot", "Neurological"] as const;

// TODO: Every test below needs its real technique/positive-finding/sensitivity/specificity/
// clinical-note content before launch (see the placeholder block each renders). Content
// coming soon, this is the structural library only.
const TESTS: SpecialTest[] = [
  { name: "Spurling Test", region: "Cervical", assesses: "Cervical radiculopathy/nerve root compression" },
  { name: "Distraction Test", region: "Cervical", assesses: "Cervical radiculopathy relief with distraction" },
  { name: "Upper Limb Tension Test", region: "Cervical", assesses: "Cervical/upper extremity neural tension" },
  { name: "Vertebral Artery Test", region: "Cervical", assesses: "Vertebrobasilar insufficiency" },
  { name: "Sharp-Purser Test", region: "Cervical", assesses: "Atlantoaxial instability" },

  { name: "Hawkins-Kennedy Test", region: "Shoulder", assesses: "Subacromial impingement" },
  { name: "Neer Sign", region: "Shoulder", assesses: "Subacromial impingement" },
  { name: "Empty Can Test", region: "Shoulder", assesses: "Supraspinatus pathology" },
  { name: "Drop Arm Test", region: "Shoulder", assesses: "Rotator cuff tear" },
  { name: "Speed Test", region: "Shoulder", assesses: "Biceps tendon pathology" },
  { name: "O'Brien Test", region: "Shoulder", assesses: "Labral tear/SLAP lesion" },
  { name: "Apprehension Test", region: "Shoulder", assesses: "Anterior shoulder instability" },
  { name: "Load and Shift Test", region: "Shoulder", assesses: "Glenohumeral translation/instability" },
  { name: "Sulcus Sign", region: "Shoulder", assesses: "Inferior shoulder instability" },

  { name: "Cozen Test", region: "Elbow/Wrist", assesses: "Lateral epicondylalgia" },
  { name: "Mill Test", region: "Elbow/Wrist", assesses: "Lateral epicondylalgia" },
  { name: "Valgus Stress Test", region: "Elbow/Wrist", assesses: "Elbow UCL integrity" },
  { name: "Phalen Test", region: "Elbow/Wrist", assesses: "Carpal tunnel syndrome" },
  { name: "Tinel Sign at wrist", region: "Elbow/Wrist", assesses: "Median nerve irritability" },
  { name: "Finkelstein Test", region: "Elbow/Wrist", assesses: "De Quervain tenosynovitis" },

  { name: "Straight Leg Raise", region: "Lumbar", assesses: "Lumbar nerve root tension/disc pathology" },
  { name: "Slump Test", region: "Lumbar", assesses: "Neural tension, lumbar/sciatic" },
  { name: "FABER Test", region: "Lumbar", assesses: "Hip, SI joint, or lumbar pathology" },
  { name: "FADIR Test", region: "Lumbar", assesses: "Hip impingement/intra-articular pathology" },
  { name: "Spring Test", region: "Lumbar", assesses: "Segmental hypomobility" },
  { name: "Prone Instability Test", region: "Lumbar", assesses: "Lumbar segmental instability" },

  { name: "FABER", region: "Hip", assesses: "Hip, SI joint, or lumbar pathology" },
  { name: "FADIR", region: "Hip", assesses: "Hip impingement/intra-articular pathology" },
  { name: "Trendelenburg Test", region: "Hip", assesses: "Hip abductor weakness" },
  { name: "Thomas Test", region: "Hip", assesses: "Hip flexor tightness" },
  { name: "Ober Test", region: "Hip", assesses: "IT band/TFL tightness" },
  { name: "FADDIR", region: "Hip", assesses: "Hip impingement/intra-articular pathology" },

  { name: "Lachman Test", region: "Knee", assesses: "ACL integrity" },
  { name: "Anterior Drawer", region: "Knee", assesses: "ACL integrity" },
  { name: "Valgus Stress Test", region: "Knee", assesses: "MCL integrity" },
  { name: "Varus Stress Test", region: "Knee", assesses: "LCL integrity" },
  { name: "McMurray Test", region: "Knee", assesses: "Meniscal tear" },
  { name: "Thessaly Test", region: "Knee", assesses: "Meniscal tear" },
  { name: "Patellar Grind Test", region: "Knee", assesses: "Patellofemoral pathology" },
  { name: "Posterior Drawer", region: "Knee", assesses: "PCL integrity" },

  { name: "Anterior Drawer, Ankle", region: "Ankle/Foot", assesses: "ATFL integrity" },
  { name: "Talar Tilt Test", region: "Ankle/Foot", assesses: "CFL integrity" },
  { name: "Thompson Test", region: "Ankle/Foot", assesses: "Achilles tendon rupture" },
  { name: "Ottawa Ankle Rules", region: "Ankle/Foot", assesses: "Ankle/foot fracture screening" },
  { name: "Squeeze Test", region: "Ankle/Foot", assesses: "Syndesmosis injury" },

  { name: "Babinski Sign", region: "Neurological", assesses: "Upper motor neuron lesion" },
  { name: "Hoffman Sign", region: "Neurological", assesses: "Upper motor neuron lesion" },
  { name: "Clonus Test", region: "Neurological", assesses: "Upper motor neuron lesion" },
  { name: "Romberg Test", region: "Neurological", assesses: "Proprioceptive/vestibular balance deficit" },
  { name: "Finger to Nose", region: "Neurological", assesses: "Cerebellar coordination" },
];

function TestCard({ test }: { test: SpecialTest }) {
  return (
    <details className="card elev-sm">
      <summary className="pro-accordion-summary">
        <div>
          <div>{test.name}</div>
          <div className="pro-accordion-summary-sub">
            <span className="tag tag-accent" style={{ marginRight: 6 }}>
              {test.region}
            </span>
            {test.assesses}
          </div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>Content coming soon.</p>
        <div style={{ fontSize: 12.5, display: "flex", flexDirection: "column", gap: 4 }}>
          <div>
            <strong>How to perform:</strong> TODO
          </div>
          <div>
            <strong>Positive finding:</strong> TODO
          </div>
          <div>
            <strong>Sensitivity:</strong> TODO
          </div>
          <div>
            <strong>Specificity:</strong> TODO
          </div>
          <div>
            <strong>Clinical note:</strong> TODO
          </div>
        </div>
      </div>
    </details>
  );
}

export function SpecialTestsLibrary() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const filtered = region === "All" ? TESTS : TESTS.filter((t) => t.region === region);

  return (
    <>
      <div className="pro-filter-bar">
        {REGIONS.map((r) => (
          <button key={r} type="button" className={`pro-filter-chip${region === r ? " active" : ""}`} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="pro-accordion">
        {filtered.map((test, i) => (
          <TestCard test={test} key={`${test.region}-${test.name}-${i}`} />
        ))}
      </div>
    </>
  );
}
