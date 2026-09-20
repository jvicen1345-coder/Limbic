import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess, hasPlaybookAccess } from "@/lib/session";
import { PLAYBOOKS, playbookChecklist } from "@/lib/playbook-content";
import { GUIDES, guideHref } from "@/lib/guides";
import { isSiteAdmin } from "@/lib/admin";
import { ChevronRightIcon, LockIcon } from "@/components/icons";
import { StudentGate } from "@/components/student/StudentGate";
import { ChooseFreePlaybookButton } from "@/components/playbook/ChooseFreePlaybookButton";

export const metadata: Metadata = {
  title: "Playbooks",
};

const SUBTITLE =
  "Whole regional examinations in the order you'd perform them — the sequence, the numbers each finding is measured against, and the treatment it points to.";

/** Index of the Limbic Playbooks (see lib/playbook-content.ts) and the served guides (see
 *  lib/guides.ts) — one card per item, both pools sharing the same free-pick mechanics
 *  below. Same shape as the Specialty Tracks hub next door.
 *
 *  Free to browse for any .edu sign-in (see hasStudentAccess) — only reading the whole
 *  library costs money. A student without the paid LimbicStudent tier gets exactly one
 *  slug of their choosing for free (see hasPlaybookAccess in lib/session.ts,
 *  chooseFreePlaybookAction in app/actions/playbooks.ts); every other card offers either
 *  the button that spends that pick, while it's unspent, or a plain lock once it's been
 *  spent on something else. A paid subscriber, and a site admin, see every card unlocked. */
export default async function PlaybooksHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Playbooks</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>{SUBTITLE}</p>
        <StudentGate toolName="Playbooks" />
      </div>
    );
  }

  // An unpublished guide keeps its "Coming soon" pill for everyone, and gains a way in for a
  // site admin — the route agrees (see lib/guides.ts canReadGuide), so this is a way in
  // rather than a link to a 404.
  const admin = await isSiteAdmin();
  const paid = user.studentTier === "limbicStudent";
  const freeSlug = user.freePlaybookSlug;

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Playbooks</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>{SUBTITLE}</p>

      {!paid && !admin && (
        <p className="playbook-hub-tier-note">
          {freeSlug
            ? "You've unlocked one playbook for free — every other card below is part of the $3/mo Limbic Student plan."
            : "Pick one playbook below to read for free. Every other one is part of the $3/mo Limbic Student plan."}{" "}
          <Link href="/profile/membership">Upgrade to Limbic Student →</Link>
        </p>
      )}

      {/* One card per served guide, built from lib/guides.ts so the list and the route
          allowlist cannot drift apart. These are fixed HTML assets served whole rather
          than playbooks built from lib/playbooks — see the route handler for why. They
          navigate in place like every other card; each document carries its own link back
          to this hub. */}
      <div className="playbook-hub-grid">
        {GUIDES.map((guide) => {
          const readable = !guide.comingSoon || admin;
          const unlocked = admin || hasPlaybookAccess(user, guide.slug);
          return (
            <div
              className={`playbook-hub-card playbook-hub-card-guide${
                guide.comingSoon && !admin ? " playbook-hub-card--soon" : ""
              }`}
              key={guide.slug}
            >
              <h2 className="playbook-hub-card-name">{guide.name}</h2>
              <p className="playbook-hub-card-desc">{guide.description}</p>
              <span className="playbook-hub-card-meta">
                {guide.sections} sections · {guide.items} exam items · {guide.references} references
              </span>
              {/* A guide that isn't ready keeps its card and its counts — those are real —
                  and loses only the way in. The route 404s the slug too, so the card is not
                  the only thing standing between a reader and it.

                  An admin gets the way in as well, and keeps the pill: the guide's state is
                  the thing they need to see, so the card says both "not published" and
                  "you can open it" rather than looking finished. */}
              {guide.comingSoon && <span className="playbook-hub-soon">Coming soon</span>}
              {readable && unlocked && (
                <Link href={guideHref(guide)} className="specialty-explore-btn">
                  Open
                  <ChevronRightIcon size={14} />
                </Link>
              )}
              {readable && !unlocked && (
                freeSlug == null ? (
                  <ChooseFreePlaybookButton slug={guide.slug} name={guide.name} className="playbook-hub-pick-btn" />
                ) : (
                  <Link href="/profile/membership" className="playbook-hub-locked">
                    <LockIcon size={12} />
                    Limbic Student
                  </Link>
                )
              )}
            </div>
          );
        })}
        {PLAYBOOKS.map((playbook) => {
          const unlocked = admin || hasPlaybookAccess(user, playbook.slug);
          return (
            <div className="playbook-hub-card" key={playbook.slug}>
              <h2 className="playbook-hub-card-name">{playbook.name}</h2>
              <p className="playbook-hub-card-desc">{playbook.summary}</p>
              <span className="playbook-hub-card-meta">
                {playbook.sections.length} sections · {playbookChecklist(playbook).length} exam items
              </span>
              {unlocked ? (
                <Link href={`/student/playbooks/${playbook.slug}`} className="specialty-explore-btn">
                  Open
                  <ChevronRightIcon size={14} />
                </Link>
              ) : freeSlug == null ? (
                <ChooseFreePlaybookButton slug={playbook.slug} name={playbook.name} className="playbook-hub-pick-btn" />
              ) : (
                <Link href="/profile/membership" className="playbook-hub-locked">
                  <LockIcon size={12} />
                  Limbic Student
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
