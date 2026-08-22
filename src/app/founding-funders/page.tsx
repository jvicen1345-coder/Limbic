import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import {
  getFoundingFundersData,
  confirmFoundingFunderPaymentIfNeeded,
  cleanupCanceledFoundingFunderCheckout,
} from "@/app/actions/founding-funders";
import { FOUNDING_FUNDERS_OPEN, FOUNDING_FUNDERS_PRICE_USD } from "@/lib/founding-funders-config";
import { ArrowLeftIcon, LogoIcon } from "@/components/icons";
import { WaitlistForm } from "@/components/founding-funders/WaitlistForm";
import { ClaimSpotButton } from "@/components/founding-funders/ClaimSpotButton";
import { FoundingAdminPanel } from "@/components/founding-funders/FoundingAdminPanel";
import { FoundingFundersRoster } from "@/components/founding-funders/FoundingFundersRoster";
import { RegisteredUsersPanel } from "@/components/founding-funders/RegisteredUsersPanel";

// Was falling back to the root layout's generic metadata (see app/layout.tsx) — a page
// with no metadata of its own, so Google was improvising both the title and description
// from whatever text on the page it judged most representative (Jonathan's letter, in this
// case), the same problem "/" avoided by already having its own metadata export.
export const metadata: Metadata = {
  title: "Founding Funders",
  description:
    "Become one of the first 25 Founding Funders and help build Limbic: lifetime access, a permanent founding badge, and a direct hand in shaping every feature that comes next.",
  openGraph: {
    title: "Limbic, Founding Funders",
    description: "The first 25 people who believe in what Limbic could become.",
    url: "https://limbic.center/founding-funders",
    siteName: "Limbic",
  },
};

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
    description: "Every new feature (Limbic Agent, Limbic Boards, The Movement Lab) you get it before anyone else.",
  },
];

const TIMELINE = [
  {
    year: "2025",
    description:
      "The idea: a Chapman University DPT student notices something missing in how physical therapy knowledge reaches clinicians, students, and patients.",
  },
  {
    year: "2026",
    description:
      "The build: a working platform with research feeds, clinical tools, professional networking, daily games, and an AI clinical decision support system.",
  },
  {
    year: "Coming Soon",
    description: "The founding: 25 people say yes first.",
  },
];

// Public — a signed-out visitor can read the pitch and join the waitlist without an
// account (see robots.ts, which allow-lists this path specifically for that reason).
// getFoundingFundersData()/joinWaitlistAction() below don't touch any per-user data, and
// the admin-only panels stay gated behind isSiteAdmin(), which already safely returns
// false for a signed-out visitor.
export default async function FoundingFundersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; session_id?: string }>;
}) {
  const { success, canceled, session_id: sessionId } = await searchParams;

  // Backup confirmation / cleanup — the checkout.session.completed webhook
  // (app/api/stripe/webhook/route.ts) is the primary path, but it can lag behind the
  // browser's own redirect back from Stripe, so this page re-checks the session directly
  // before rendering the grid/counts below. Both are safe no-ops without a session_id (e.g.
  // a visitor bookmarked/shared a bare "?success=true" URL).
  if (success === "true" && sessionId) await confirmFoundingFunderPaymentIfNeeded(sessionId);
  if (canceled === "true" && sessionId) await cleanupCanceledFoundingFunderCheckout(sessionId);

  const [data, isAdmin] = await Promise.all([getFoundingFundersData(), isSiteAdmin()]);
  const slots = Array.from({ length: data.totalSlots }, (_, i) => data.funders[i] ?? null);
  // Only fetched for an admin — no reason to run these for every visitor.
  const [registeredUsers, rosterEntries] = isAdmin
    ? await Promise.all([
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          select: { name: true, email: true, licenseNumber: true, licenseEmail: true, isPro: true, createdAt: true },
        }),
        prisma.foundingFunder.findMany({
          where: { paymentStatus: { in: ["confirmed", "pending"] } },
          orderBy: { claimedAt: "asc" },
          select: { id: true, displayName: true, credential: true, paymentStatus: true },
        }),
      ])
    : [[], []];

  return (
    <div className="ff-page">
      <Link href="/" className="ff-back-link" aria-label="Back to home">
        <ArrowLeftIcon size={17} />
      </Link>

      {success === "true" && (
        <div className="ff-banner ff-banner--success">
          Payment confirmed. You&rsquo;re a Founding Funder. Welcome to the beginning.
        </div>
      )}
      {canceled === "true" && (
        <div className="ff-banner ff-banner--canceled">No charge was made. Your spot is still available.</div>
      )}

      <div className="ff-container">
        {/* Section 1 — The Letter */}
        <div className="ff-letter">
          <p className="ff-letter-opening">To the Founding Funders,</p>
          <p>My name is Jonathan Vicencio. I am a Doctor of Physical Therapy Student at Chapman University.</p>
          <p>
            From the beginning of this program, I noticed something missing. A single place where clinicians and
            students could access current, evidence-based physical therapy without hunting through paywalls,
            outdated textbooks, or resources never built for us.
          </p>
          <p>I built Limbic to change that.</p>
          <p>
            Not just for clinicians. Not just for students. But for everyone within the field. For the patients who
            deserve to understand their own care before they ever walk through our doors.
          </p>
          <p>
            Limbic exists to bring evidence-based physical therapy into the hands of everyone who needs it. This is
            that platform.
          </p>
          <p>I am looking for 25 people who believe in what this could become.</p>
          <hr className="ff-letter-signature-rule" />
          <div className="ff-letter-signature">
            <div>Jonathan Vicencio</div>
            <div>Doctor of Physical Therapy Student</div>
            <div>Chapman University, Class of 2028</div>
            <div>Newport Beach, California</div>
          </div>
        </div>
        <hr className="ff-divider" />

        {/* Section 2 — The Offer */}
        <div className="ff-offer">
          <h1 className="ff-offer-title">Founding Funders</h1>
          <p className="ff-offer-line">25 spots. ${FOUNDING_FUNDERS_PRICE_USD}. Lifetime access. Your name in Limbic forever.</p>
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
                {!funder ? (
                  <>
                    <div className="ff-slot-circle ff-slot-circle-empty">{i + 1}</div>
                    <div className="ff-slot-label">Open</div>
                  </>
                ) : funder.paymentStatus === "pending" ? (
                  <>
                    <div className="ff-slot-circle ff-slot-circle-pending">{funder.displayName.split(" ")[0]}</div>
                    <div className="ff-slot-label ff-slot-label-pending">Pending</div>
                  </>
                ) : (
                  <>
                    <div className="ff-slot-circle ff-slot-circle-claimed">{funder.displayName.split(" ")[0]}</div>
                    <div className="ff-slot-credential">{funder.credential ?? "Founding Funder"}</div>
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
                ${FOUNDING_FUNDERS_PRICE_USD}, once, for lifetime access. Your spot is reserved the moment checkout
                starts and confirmed automatically the moment payment goes through.
              </p>
              <ClaimSpotButton />
            </>
          ) : (
            <>
              <h2 className="ff-cta-title">Founding Funders: Coming Soon</h2>
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

        {/* Legal disclaimer — the very last thing on the page */}
        <div className="ff-disclaimer">
          <p className="ff-disclaimer-title">Important: Please Read</p>
          <p className="ff-disclaimer-body">
            A Founding Funder membership is a lifetime subscription to Limbic. It is not an investment, equity
            stake, or ownership interest of any kind in Limbic, its research curation, its intellectual property, or
            any affiliated entity.
          </p>
          <p className="ff-disclaimer-body">
            Founding Funders receive lifetime access to LimbicPRO features and founding member recognition. They do
            not acquire any financial interest, ownership rights, or claims to Limbic content, data, or future
            revenue.
          </p>
          <p className="ff-disclaimer-body">This is a membership.</p>
        </div>
      </div>

      {isAdmin && (
        <>
          <FoundingFundersRoster entries={rosterEntries} confirmedCount={data.confirmedCount} pendingCount={data.pendingCount} />
          <FoundingAdminPanel />
          <RegisteredUsersPanel users={registeredUsers} />
        </>
      )}
    </div>
  );
}
