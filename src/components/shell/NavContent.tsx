"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import type { ZoneTwoKey } from "@/lib/user-role";
import {
  HomeIcon,
  SearchIcon,
  ProfileIcon,
  WellnessIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ZapIcon,
  AlertCircleIcon,
  BandageIcon,
  CrownIcon,
  FilmIcon,
  UsersIcon,
  GridIcon,
  ListIcon,
  UserPlusIcon,
  MessageCircleIcon,
  GraduationCapIcon,
  FileTextIcon,
  NetworkIcon,
  ActivityIcon,
  DumbbellIcon,
  ShieldIcon,
  HeartIcon,
  LayoutDashboardIcon,
  BodyIcon,
  LockIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudentVerifiedBadge } from "@/components/StudentVerifiedBadge";
import { NavLink, NavToggle, FoundingFundersNavLink } from "./nav-items";

/** The eight expandable sidebar sections — see the accordion state in NavContent below. */
type SidebarSection = "nexus" | "pro" | "connexion" | "student" | "wellness" | "saved" | "articles" | "admin";

interface NavContentProps {
  profileName: string;
  specialtyLabel: string;
  practiceState: string;
  /** Shown in the footer nameplate instead of specialty/practiceState for a
   *  hasStudentAccess account (see the footer below) — null until set via the Profile
   *  "About you" form, in which case the subtitle falls back to "DPT Student" alone. */
  school: string | null;
  hasLicense: boolean;
  isPro: boolean;
  /** True for a .edu sign-in email or a site admin account (see lib/session.ts
   *  hasStudentAccess) — gates the Limbic Student section's paid-tier sub-links below: a
   *  non-qualifying account still sees the section toggle, its landing link (labeled
   *  "Overview" rather than "Atrium" — see the student zoneTwoSections entry below, which
   *  itself renders a sales pitch rather than the real dashboard, see app/(app)/student/
   *  page.tsx's own !hasStudentAccess branch), and NPTE Resources (free FSBPT/NPTE
   *  reference links, gated on nothing but being signed in — see app/(app)/student/
   *  resources/page.tsx), but never sees the individual paid-tier sub-links (Break Down
   *  Slides, SOAP Note, etc.) as locked list items — same "collapse to just the overview"
   *  treatment the pro zoneTwoSections entry gives LimbicPRO's own sub-links. Limbic Games
   *  (/daily-term) is open to everyone regardless of this flag. This is a separate concern from
   *  zoneTwoOrder below — isStudent only ever changes what renders inside the section;
   *  zoneTwoOrder only ever reorders sections that already render. */
  isStudent: boolean;
  /** True only for a real, paid LimbicStudent subscription (studentTier === "limbicStudent",
   *  see lib/session.ts) — narrower than isStudent above, which also includes any .edu
   *  account that hasn't paid. Shows the "Verified Student" badge in the footer nameplate
   *  (see components/StudentVerifiedBadge.tsx), same "paid tier gets a small trust signal"
   *  idea as the Founding Funder badge elsewhere in the app. */
  isVerifiedStudent: boolean;
  /** True for a site admin account (see lib/admin.ts isSiteAdmin) — gates the Admin section
   *  below, hidden entirely for everyone else. */
  isAdmin: boolean;
  /** Populated after mount by /api/navigation-badges; absent while loading or on failure. */
  aptaCount?: number;
  /** Populated with the same non-blocking request as aptaCount. */
  nexusRequestCount?: number;
  /** The seven-section order from lib/user-role.ts zoneTwoOrder(), computed in
   *  app/(app)/layout.tsx off the account's userRole — every section still renders
   *  (isStudent/isAdmin above are the only actual visibility gates), this just changes
   *  which order they render in. */
  zoneTwoOrder: ZoneTwoKey[];
  /** Clinic PRO team membership (see getClinicMembershipInfo in app/actions/clinic-pro.ts)
   *  — null for an account with no active clinic membership, in which case none of the
   *  clinic-specific nav below renders. isAdmin on this object (not the site-admin `isAdmin`
   *  prop above, an unrelated concept) gates "Team Dashboard"/"Clinic Report"; every member
   *  including a non-admin one gets the footer's clinic-name pill. */
  clinicMembership: { clinicName: string; isAdmin: boolean } | null;
  /** Called after any nav link is clicked — used to close the mobile drawer on navigation. */
  onNavigate?: () => void;
}

/** The full nav — links, section labels, and the "signed in as" footer — shared by the
 *  desktop sidebar and the mobile drawer so the two never drift out of sync. */
export function NavContent({ profileName, specialtyLabel, practiceState, school, hasLicense, isPro, isStudent, isVerifiedStudent, isAdmin, aptaCount, nexusRequestCount, zoneTwoOrder, clinicMembership, onNavigate }: NavContentProps) {
  const pathname = usePathname();
  // Accordion behavior — at most one of the eight expandable sections open at a time, so
  // opening one always collapses whatever else was open, rather than letting the list grow
  // without bound. Starts on whichever section the current route already belongs to (so
  // landing on, say, /nexus/messages via a direct link or a widget elsewhere in the app
  // doesn't hide the very section that link belongs to), or none expanded otherwise. The
  // route-prefix checks are mutually exclusive by construction (no two sections share a
  // route), so at most one ever matches here.
  const [expandedSection, setExpandedSection] = useState<SidebarSection | null>(() => {
    if (pathname.startsWith("/nexus")) return "nexus";
    if (pathname.startsWith("/pro") || pathname.startsWith("/hep") || pathname.startsWith("/agent")) return "pro";
    if (pathname.startsWith("/connexion")) return "connexion";
    if (pathname.startsWith("/student") || pathname.startsWith("/boards")) return "student";
    if (pathname.startsWith("/wellness") || pathname.startsWith("/games")) return "wellness";
    if (pathname.startsWith("/saved")) return "saved";
    if (pathname.startsWith("/news") || pathname.startsWith("/under-review")) return "articles";
    if (pathname.startsWith("/admin")) return "admin";
    return null;
  });
  const toggleSection = (key: SidebarSection) => setExpandedSection((cur) => (cur === key ? null : key));
  const nexusExpanded = expandedSection === "nexus";
  const proExpanded = expandedSection === "pro";
  const connexionExpanded = expandedSection === "connexion";
  const studentExpanded = expandedSection === "student";
  const wellnessExpanded = expandedSection === "wellness";
  const savedExpanded = expandedSection === "saved";
  const articlesExpanded = expandedSection === "articles";
  const adminExpanded = expandedSection === "admin";

  // One ReactNode per zoneTwoOrder key (see lib/user-role.ts) — each is the exact same
  // section markup this sidebar always had, just named so zoneTwoOrder.map() below can
  // render them in whichever order the account's role calls for instead of this fixed
  // declaration order.
  const zoneTwoSections: Record<ZoneTwoKey, React.ReactNode> = {
    connexion: (
      <>
        <NavToggle
          icon={<ShieldIcon />}
          label="Connexion Method"
          expanded={connexionExpanded}
          onClick={() => toggleSection("connexion")}
        />
        {connexionExpanded && (
          <>
            <NavLink href="/connexion" icon={<ShieldIcon />} label="Overview" bold={false} onNavigate={onNavigate} />
            <NavLink href="/connexion/afit" icon={<DumbbellIcon />} label="AFIT Assessment" bold={false} onNavigate={onNavigate} />
            <NavLink href="/connexion/protocol" icon={<FileTextIcon />} label="What to Expect" locked={!isPro} bold={false} onNavigate={onNavigate} />
            <NavLink href="/connexion/safety-score" icon={<ActivityIcon />} label="Safety Score" locked={!isPro} bold={false} onNavigate={onNavigate} />
            <NavLink href="/connexion/caregiver" icon={<HeartIcon />} label="Caregiver Education" bold={false} onNavigate={onNavigate} />
            <NavLink href="/connexion/delia" icon={<ProfileIcon />} label="About Delia Vicencio, PT, DPT" bold={false} onNavigate={onNavigate} />
          </>
        )}
      </>
    ),
    student: (
      <>
        <NavToggle
          icon={<GraduationCapIcon />}
          label="Limbic Student"
          expanded={studentExpanded}
          onClick={() => toggleSection("student")}
          dataTour="limbic-student"
        />
        {studentExpanded && (
          <>
            <NavLink href="/student" icon={<GraduationCapIcon />} label={isStudent ? "Atrium" : "Overview"} bold={false} onNavigate={onNavigate} />
            {/* Licensed clinicians get this link too, not just students: /boards itself
                says Boards is "available to PT students and licensed clinicians" and loads
                fine for them, but the link used to be student-only — so a clinician who
                reached /boards found this section auto-expanded around it with nothing
                active, no entry for the page they were standing on, and no way back to it.
                The STUDENT+ lock badge only applies to the student route into it. */}
            {(isStudent || hasLicense) && (
              <NavLink
                href="/boards"
                icon={<CheckCircleIcon />}
                label="Boards"
                locked={!isVerifiedStudent && !hasLicense}
                lockLabel="STUDENT+"
                bold={false}
                onNavigate={onNavigate}
              />
            )}
            {isStudent && (
              <NavLink href="/pro/lab-values" icon={<GridIcon />} label="Clinical Reference" bold={false} onNavigate={onNavigate} />
            )}
            {isStudent && (
              <NavLink href="/student/study-guide" icon={<FileTextIcon />} label="Study Guide" bold={false} onNavigate={onNavigate} />
            )}
            {/* The playbooks are Boards' study guide and sit behind the same paid line the
                rest of its prep tools do, so the link carries the badge Boards does. */}
            {isStudent && (
              <NavLink
                href="/student/playbooks"
                icon={<BandageIcon />}
                label="Playbooks"
                locked={!isVerifiedStudent}
                lockLabel="STUDENT+"
                bold={false}
                onNavigate={onNavigate}
              />
            )}
            <NavLink href="/student/resources" icon={<ListIcon />} label="NPTE Resources" bold={false} onNavigate={onNavigate} />
          </>
        )}
      </>
    ),
    pro: (
      <>
        <NavToggle
          icon={<CrownIcon />}
          label="LimbicPRO"
          expanded={proExpanded}
          onClick={() => toggleSection("pro")}
          dataTour="limbic-pro"
        />
        {proExpanded && (
          <>
            {/* Four rows, in the order you would reach for them. The first three are the
                ones you can open without already knowing what you want — your caseload, the
                index of everything, and the one you can just ask. Exercise Programs follows
                because it is the one workspace with no other way in: Special Tests, Outcome
                Measures and Force Lab all left this list, but the Dashboard already carries
                them (Quick Tools for the first two, each patient's Force Lab card for the
                third, scoped to that patient), while nothing in the app links to /hep except
                the Toolbox and the /pro overview.

                Everything not listed here lives on the Toolbox page, which describes each
                tool instead of just naming it — see lib/clinician-toolbox.ts.

                Dashboard and Limbic Agent are shown locked rather than hidden for a non-Pro
                reader, the same treatment Exercise Programs already had, so a signed-in
                reader sees what LimbicPRO contains and which pieces are paywalled rather
                than some tools silently not existing for them. */}
            <NavLink href="/pro/dashboard" icon={<LayoutDashboardIcon />} label="Dashboard" locked={!isPro} bold={false} onNavigate={onNavigate} />
            {/* ListIcon, not GridIcon: the Toolbox sits directly under the Dashboard now, and
                LayoutDashboardIcon is itself a four-part grid — stacked, the two marks read as
                the same icon. A list is also the honest description of what the page is. */}
            <NavLink href="/pro/toolbox" icon={<ListIcon />} label="Toolbox" bold={false} onNavigate={onNavigate} />
            <NavLink href="/agent" icon={<NetworkIcon />} label="Limbic Agent" locked={!isPro} bold={false} onNavigate={onNavigate} />
            <NavLink href="/hep" icon={<BandageIcon />} label="Exercise Programs" locked={!isPro} bold={false} onNavigate={onNavigate} />
          </>
        )}
      </>
    ),
    wellness: (
      <>
        <NavToggle
          icon={<WellnessIcon />}
          label="Health & Wellness"
          expanded={wellnessExpanded}
          onClick={() => toggleSection("wellness")}
        />
        {wellnessExpanded && (
          <>
            {/* Three sub-items, not seven — Nutrition, Assess Yourself, and Exercise
                Library are all one click from the Overview hub's card grid (see
                app/(app)/wellness/page.tsx), and Connexion Method has its own Zone 2
                section already, so duplicating any of them here only made the longest
                sidebar section longer. Every route is unchanged and still reachable. */}
            <NavLink href="/wellness" icon={<WellnessIcon />} label="Overview" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/metrics" icon={<ActivityIcon />} label="Metrics" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/activity" icon={<ZapIcon />} label="Activity Log" bold={false} onNavigate={onNavigate} />
          </>
        )}
      </>
    ),
    nexus: isAdmin ? (
      <>
        <NavToggle
          icon={<UsersIcon />}
          label="Nexus"
          expanded={nexusExpanded}
          onClick={() => toggleSection("nexus")}
        />
        {nexusExpanded && (
          <>
            <NavLink href="/nexus" icon={<UsersIcon />} label="Feed" bold={false} onNavigate={onNavigate} />
            <NavLink href="/nexus/directory" icon={<ListIcon />} label="Directory" bold={false} onNavigate={onNavigate} />
            <NavLink
              href="/nexus/connections"
              icon={<UserPlusIcon />}
              label="Connections"
              badge={nexusRequestCount}
              bold={false}
              onNavigate={onNavigate}
            />
            <NavLink
              href="/nexus/messages"
              icon={<MessageCircleIcon />}
              label="Messages"
              exact={false}
              bold={false}
              onNavigate={onNavigate}
            />
          </>
        )}
      </>
    ) : (
      // Nexus isn't launched for non-admins yet — every /nexus/* route redirects them to the
      // same "coming soon" waitlist screen regardless of which sub-page they land on (see
      // app/(app)/nexus/layout.tsx), so a 4-link expandable section here would just be four
      // paths to one identical screen. One plain link in, straight to the waitlist.
      <NavLink href="/nexus" icon={<UsersIcon />} label="Nexus" exact={false} onNavigate={onNavigate} />
    ),
    saved: (
      <>
        <NavToggle
          icon={<BookmarkIcon />}
          label="Saved"
          expanded={savedExpanded}
          onClick={() => toggleSection("saved")}
        />
        {savedExpanded && (
          <>
            <NavLink href="/saved/articles" icon={<BookmarkIcon />} label="Saved Articles" bold={false} onNavigate={onNavigate} />
            <NavLink href="/saved/guidelines" icon={<CheckCircleIcon />} label="Saved Guidelines" bold={false} onNavigate={onNavigate} />
            <NavLink href="/saved/wellness" icon={<WellnessIcon />} label="Saved Wellness" bold={false} onNavigate={onNavigate} />
            <NavLink href="/saved/clips" icon={<FilmIcon />} label="Saved Clips" bold={false} onNavigate={onNavigate} />
          </>
        )}
      </>
    ),
    articles: (
      <>
        <NavToggle
          icon={<FileTextIcon />}
          label="Articles"
          expanded={articlesExpanded}
          onClick={() => toggleSection("articles")}
        />
        {articlesExpanded && (
          <>
            <NavLink href="/news" icon={<ZapIcon />} label="News" badge={aptaCount} bold={false} onNavigate={onNavigate} />
            {hasLicense && <NavLink href="/under-review" icon={<AlertCircleIcon />} label="Retracted Articles" bold={false} onNavigate={onNavigate} />}
          </>
        )}
      </>
    ),
  };

  return (
    <>
      <NavLink href="/home" icon={<HomeIcon />} label="Home" onNavigate={onNavigate} />
      <NavLink href="/search" icon={<SearchIcon />} label="Search" onNavigate={onNavigate} />
      <NavLink href="/clips" icon={<FilmIcon />} label="Clips" onNavigate={onNavigate} />
      <NavLink href="/games" icon={<GridIcon />} label="Limbic Games" onNavigate={onNavigate} />
      <NavLink href="/atlas" icon={<BodyIcon />} label="Limbic Atlas" onNavigate={onNavigate} dataTour="atlas" />

      {zoneTwoOrder.map((key) => (
        <Fragment key={key}>{zoneTwoSections[key]}</Fragment>
      ))}

      {isAdmin && (
        <>
          <NavToggle
            icon={<LockIcon />}
            label="Admin"
            expanded={adminExpanded}
            onClick={() => toggleSection("admin")}
          />
          {adminExpanded && (
            <>
              <NavLink href="/admin/appraisals" icon={<FileTextIcon />} label="Appraisals" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/suggestions" icon={<MessageCircleIcon />} label="Suggestions" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/licenses" icon={<CheckCircleIcon />} label="License Queue" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/copyright" icon={<ShieldIcon />} label="Copyright Notices" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/connexion-visits" icon={<ShieldIcon />} label="Connexion Visits" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/connexion-safety-score" icon={<ShieldIcon />} label="Connexion Safety Score" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/boards-tagging" icon={<GraduationCapIcon />} label="Boards Question Tagging" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/accounts" icon={<UsersIcon />} label="Accounts" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/programs" icon={<GraduationCapIcon />} label="Programs" bold={false} onNavigate={onNavigate} />
              <NavLink
                href="/admin/movement-lab-requests"
                icon={<DumbbellIcon />}
                label="Movement Lab Requests"
                bold={false}
                onNavigate={onNavigate}
              />
            </>
          )}
        </>
      )}

      {/* /founding-funders is intentionally its own standalone page (no sidebar, no
       *  AppShell — see app/founding-funders/page.tsx) once you land there; this is just
       *  the entry point into it from the normal nav. */}
      <FoundingFundersNavLink onNavigate={onNavigate} />

      <div className="nav-footer">
        <Link href="/profile" className="nav-footer-nameplate" onClick={onNavigate}>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginBottom: 4 }}>Signed in as</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{profileName}</div>
            {isVerifiedStudent && <StudentVerifiedBadge compact />}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
            {isStudent ? (school ? `DPT Student · ${school}` : "DPT Student") : `${specialtyLabel} · ${practiceState}`}
          </div>
          {clinicMembership && <div className="nav-footer-clinic-pill">{clinicMembership.clinicName}</div>}
        </Link>
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            type="submit"
            className="btn btn-ghost"
            style={{ padding: "4px 0", fontSize: 12, color: "var(--color-neutral-700)" }}
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
