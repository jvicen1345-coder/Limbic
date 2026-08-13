import type { Clip } from "@/lib/types";

// Real YouTube videos (mostly Shorts) from PTs/clinicians, found via search and linked
// directly — not fabricated, same integrity standard as WELLNESS_VIDEOS. Spans all five
// specialties so the feed doesn't skew toward any one area of practice.
export const CLIPS: Clip[] = [
  {
    id: "c1",
    title: "Top Knee Exercise, Physical Therapy Tip",
    source: "YouTube",
    specialty: "ortho",
    url: "https://www.youtube.com/shorts/02wqRrOBgWY",
  },
  {
    id: "c2",
    title: "3 Exercises to Prevent ACL Injury",
    source: "Spooner Sports Institute",
    specialty: "sports",
    url: "https://www.youtube.com/shorts/Vvy8076gzx0",
  },
  {
    id: "c3",
    title: "Shoulder Impingement Strengthening Exercises",
    source: "Professional Physical Therapy",
    specialty: "ortho",
    url: "https://www.youtube.com/shorts/sRePteALL00",
  },
  {
    id: "c4",
    title: "The Best Exercise to Improve Balance, Walking, and Strength for Seniors",
    source: "Doug Weiss, DPT",
    specialty: "geriatric",
    url: "https://www.youtube.com/shorts/0FdZvpe4owk",
  },
  {
    id: "c5",
    title: "The #1 Exercise to Improve Balance for Seniors",
    source: "YouTube",
    specialty: "geriatric",
    url: "https://www.youtube.com/shorts/Cc31IPcVGOQ",
  },
  {
    id: "c6",
    title: "What Is the Role of Physical Therapy in Stroke Recovery?",
    source: "Kristen Bolen, PT, St. Luke's Hospital",
    specialty: "neuro",
    url: "https://www.youtube.com/watch?v=EMOCEu_Ve4k",
  },
  {
    id: "c7",
    title: "Ankle Sprain Rehab: Return to Sport Drills",
    source: "YouTube",
    specialty: "sports",
    url: "https://www.youtube.com/shorts/yv0AsPOp_Hg",
  },
  {
    id: "c8",
    title: "Return to Sport Criteria After Ankle Sprain",
    source: "YouTube",
    specialty: "sports",
    url: "https://www.youtube.com/shorts/hqwweJmPxUY",
  },
  {
    id: "c9",
    title: "Pediatric Physical Therapy and Occupational Therapy",
    source: "YouTube",
    specialty: "pediatric",
    url: "https://www.youtube.com/shorts/ek8X0XknpSU",
  },
];
