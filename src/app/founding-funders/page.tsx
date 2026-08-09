import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getFoundingFundersData, isFoundingFundersAdmin } from "@/app/actions/founding-funders";
import { FOUNDING_FUNDERS_OPEN, FOUNDING_FUNDERS_PRICE_USD, FOUNDING_FUNDERS_ZELLE_CONTACT } from "@/lib/founding-funders-config";
import { ArrowLeftIcon, LogoIcon } from "@/components/icons";
import { WaitlistForm } from "@/components/founding-funders/WaitlistForm";
import { FoundingAdminPanel } from "@/components/founding-funders/FoundingAdminPanel";

const BENEFITS = [
  {
    title: "Lifetime Access",
    description: "Every LimbicPRO feature, forever. No monthly fee. No renewals. Yours permanently.",
  },
  {
    title: "Founding Badge",
    description:
      "A permanent gold badge on your Limbic profile. Everyone who sees your name will know you were here first.",
  },
  {
    title: "Your Name in Limbic",
    description:
      "Listed permanently as one of the original 25 founding funders. The founding era closes when these spots fill.",
  },
  {
    title: "Shape What Gets Built",
    description:
      "Your feedback goes directly to the founder. Founding funders have shaped every major feature decision from day one.",
  },
  {
    title: "First Access Always",
    description: "Every new feature — Limbic Agent, Limbic Boards, The Movement Lab — you get it before anyone else.",
  },
];

const TIMELINE = [
  {
    year: "2025",
    description:
      "The idea — a Chapman University DPT student notices something missing in how physical therapy knowledge reaches clinicians, students, and patients.",
  },
  {
    year: "2026",
    description:
      "The build — a working platform with research feeds, clinical tools, professional networking, daily games, and an AI clinical decision support system.",
  },
  {
    year: "August 14, 2026",
    description: "The founding — 25 people say yes first.",
  },
];

export default async function FoundingFundersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [data, isAdmin] = await Promise.all([getFoundingFundersData(), isFoundingFundersAdmin()]);
  const slots = Array.from({ length: data.totalSlots }, (_, i) => data.funders[i] ?? null);

  return (
    <div className="ff-page">
      <Link href="/" className="ff-back-link" aria-label="Back to home">
        <ArrowLeftIcon size={17} />
      </Link>

      <div className="ff-container">
        {/* Section 1 — The Letter */}
        <div className="ff-letter">
          <p>To the Founding Funders,</p>
          <p>I am a Doctor of Physical Therapy student at Chapman University.</p>
          <p>
            From the beginning of this program I noticed something missing — a single place where clinicians and
            students could access current, evidence based physical therapy without hunting through paywalls,
            outdated textbooks, or resources that were never built for us.
          </p>
          <p>I built Limbic to change that.</p>
          <p>
            Not just for clinicians. Not just for students. But for everyone within the field — and for the
            patients who deserve to understand their own care before they ever walk through our doors.
          </p>
          <p>
            Limbic exists to bring evidence based physical therapy into the hands of everyone who needs it. This is
            that platform.
          </p>
          <p>I am looking for 25 people who believe in what this could become.</p>
          <div className="ff-letter-signature">
            <div>— Jonathan Vicencio</div>
            <div>— Doctor of Physical Therapy Candidate</div>
            <div>— Chapman University, Class of 2028</div>
            <div>— Newport Beach, California</div>
          </div>
        </div>
        <hr className="ff-divider" />

        {/* Section 2 — The Offer */}
        <div className="ff-offer">
          <h1 className="ff-offer-title">Founding Funders</h1>
          <p className="ff-offer-line">25 spots. ${FOUNDING_FUNDERS_PRICE_USD}. Lifetime access. Your name in Limbic forever.</p>
          <p className="ff-offer-line ff-offer-muted">
            This offer closes when the 25 spots are filled. It will never be offered again.
          </p>
        </div>

        {/* Section 3 — What You Get */}
        <div className="ff-benefits-grid">
          {BENEFITS.map((b) => (
            <div className="ff-benefit-card" key={b.title}>
              <h3 className="ff-benefit-card-title">{b.title}</h3>
              <p className="ff-benefit-card-desc">{b.description}</p>
            </div>
          ))}
        </div>

        {/* Section 4 — The 25 Slots */}
        <div className="ff-slots-section">
          <h2 className="ff-slots-title">The Founding 25</h2>
          <p className="ff-slots-subtitle">
            {data.claimedCount} of {data.totalSlots} spots claimed
          </p>
          <div className="ff-slots-grid">
            {slots.map((funder, i) => (
              <div className="ff-slot" key={i}>
                {funder ? (
                  <>
                    <div className="ff-slot-circle ff-slot-circle-claimed">{funder.displayName.split(" ")[0]}</div>
                    <div className="ff-slot-credential">{funder.credential ?? "Founding Funder"}</div>
                  </>
                ) : (
                  <>
                    <div className="ff-slot-circle ff-slot-circle-empty">{i + 1}</div>
                    <div className="ff-slot-label">Available</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5 — Coming Soon / Waitlist or Payment */}
        <div className="ff-cta-section">
          {FOUNDING_FUNDERS_OPEN ? (
            <>
              <h2 className="ff-cta-title">Ready to claim your spot?</h2>
              <p className="ff-cta-body">
                Send ${FOUNDING_FUNDERS_PRICE_USD} via Zelle to the contact below. Include your name and credential
                in the memo. Your spot is reserved immediately. Your name appears in the grid within 24 hours once
                payment is confirmed.
              </p>
              <div className="ff-zelle-box">{FOUNDING_FUNDERS_ZELLE_CONTACT}</div>
            </>
          ) : (
            <>
              <h2 className="ff-cta-title">Founding Funders opens August 14th</h2>
              <p className="ff-cta-body">
                Be the first to know when spots open. Leave your email and you&rsquo;ll be notified the moment the
                founding era begins.
              </p>
              <WaitlistForm initialCount={data.waitlistCount} />
            </>
          )}
        </div>

        {/* Section 6 — The Story So Far */}
        <div className="ff-timeline">
          <h2 className="ff-timeline-title">The Story So Far</h2>
          <div className="ff-timeline-entries">
            {TIMELINE.map((t) => (
              <div className="ff-timeline-entry" key={t.year}>
                <div className="ff-timeline-year">{t.year}</div>
                <p className="ff-timeline-desc">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7 — Footer */}
        <div className="ff-footer">
          <LogoIcon size={28} />
          <p className="ff-footer-tagline">
            Limbic
            <br />
            Built by a PT student, for everyone.
          </p>
          <p className="ff-footer-url">limbic.center</p>
        </div>
      </div>

      {isAdmin && <FoundingAdminPanel />}
    </div>
  );
}
