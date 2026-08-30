"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import type { ZoneTwoKey } from "@/lib/user-role";
import {
  LogoIcon,
  HomeIcon,
  SearchIcon,
  ProfileIcon,
  WellnessIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ZapIcon,
  AlertCircleIcon,
  BandageIcon,
  MenuIcon,
  XIcon,
  CrownIcon,
  DiamondIcon,
  FilmIcon,
  UsersIcon,
  GridIcon,
  ListIcon,
  UserPlusIcon,
  MessageCircleIcon,
  GraduationCapIcon,
  FileTextIcon,
  NetworkIcon,
  LockIcon,
  CalendarIcon,
  ActivityIcon,
  AppleIcon,
  DumbbellIcon,
  ChevronRightIcon,
  ShieldIcon,
  HeartIcon,
  PencilIcon,
  LayoutDashboardIcon,
  BodyIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudentVerifiedBadge } from "@/components/StudentVerifiedBadge";
import { readStoredThemePreference, resolveTheme } from "@/lib/theme-client";

/** First letter of each of up to the first two words in a name, uppercased — the sidebar
 *  footer's avatar circle (see the redesigned desktop nav-footer below). Falls back to a
 *  single "?" for an empty/whitespace-only name rather than rendering a blank circle. */
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const bottomNavStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  border: "none",
  background: "none",
  cursor: "pointer",
  color: active ? "var(--color-accent-700)" : "var(--color-neutral-700)",
  flex: 1,
  padding: "6px 0",
  textDecoration: "none",
});

function NavLink({
  href,
  icon,
  label,
  badge,
  locked = false,
  lockLabel = "PRO",
  exact = true,
  bold = true,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  /** A number renders as a count badge (hidden at 0); a string renders as-is (e.g. "Pro"). */
  badge?: number | string;
  /** Same lock-badge treatment as LimbicAgentCard's "Ask Limbic Agent" button (icon + a
   *  short pill label) — for a nav item that's shown to everyone but only fully usable by
   *  a gated account (PRO, a .edu Limbic Student sign-in, etc). Takes precedence over
   *  `badge` when both are set. */
  locked?: boolean;
  /** Pill text shown next to the lock icon when `locked` is true — "PRO" for LimbicPRO
   *  items, "STUDENT" for Limbic Student ones (see lockLabel="STUDENT" below). */
  lockLabel?: string;
  /** False for sub-links whose section also covers nested/dynamic routes (e.g. a message
   *  thread at /nexus/messages/[userId] should still highlight "Messages"). */
  exact?: boolean;
  /** False for a link grouped under a (bold) section label, so the label reads as the
   *  heavier element and its sub-links as lighter items underneath it. */
  bold?: boolean;
  /** Called after the link is clicked — used to close the mobile drawer on navigation. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  const showBadge = typeof badge === "string" ? badge.length > 0 : badge != null && badge > 0;
  // bold=false already marks every sub-link under a NavToggle section (see every
  // zoneTwoSections entry below) — reused directly as the "is this a sub-item" signal for
  // the redesigned desktop sidebar's indent/12px-font treatment, rather than a second prop
  // that would just have to be kept in sync with this one at every call site.
  const className = `nav-link${bold ? "" : " nav-link--sub"}${active ? " nav-link--active" : ""}`;
  return (
    <Link href={href} className={className} onClick={onNavigate} data-active={active}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {locked ? (
        <span
          className="tag tag-accent"
          style={{ marginLeft: "auto", background: "var(--color-bg)", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}
        >
          <LockIcon size={10} />
          {lockLabel}
        </span>
      ) : (
        showBadge && (
          <span className="tag tag-accent" style={{ marginLeft: "auto", flexShrink: 0 }}>
            {badge}
          </span>
        )
      )}
    </Link>
  );
}

/** A section toggle (Connexion Method, LimbicPRO, Nexus, etc.) — same row treatment as
 *  NavLink (icon left, label, right-aligned element) rather than a distinct all-caps
 *  section-header style, so every top-level sidebar item reads as one consistent list. The
 *  chevron in NavLink's usual right-aligned slot is what a badge/lock pill would otherwise
 *  occupy, rotating 90° when expanded. A faint permanent background wash (rather than
 *  nothing until active/hovered, like a plain NavLink) is the one deliberate difference from
 *  a regular link — enough to read "this opens a list" at a glance without bringing back the
 *  old blocky all-caps section-header look. */
function NavToggle({
  icon,
  label,
  expanded,
  onClick,
  badge,
  badgeHidden = false,
}: {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onClick: () => void;
  /** A short pill shown right of the label — only LimbicPRO's toggle passes this
   *  ("PRO", see the pro zoneTwoSections entry below); every other section omits it and
   *  renders no pill. */
  badge?: string;
  /** True whenever the current route is already inside this section — the pill's whole
   *  point is to catch a reader's eye before they've engaged with LimbicPRO, so it
   *  disappears once they're actually on a /pro (or /hep, /agent) page, where the active
   *  sub-link's own styling already does that job. */
  badgeHidden?: boolean;
}) {
  return (
    <button type="button" className={`nav-toggle${expanded ? " nav-toggle--expanded" : ""}`} aria-expanded={expanded} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {badge && !badgeHidden && <span className="nav-pro-pill">{badge}</span>}
      <ChevronRightIcon size={14} className="nav-toggle-chevron" />
    </button>
  );
}

/** Gold rather than the standard blue accent (see NavLink/sidebarNavStyle above) — a
 *  deliberately different treatment so it reads as its own thing, not another item in
 *  whatever section happens to sit above it. Stands alone with no section label, set off
 *  by its own thin top separator (see .nav-founding-separator in globals.css) rather than
 *  being grouped under one. */
function FoundingFundersNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === "/founding-funders";
  return (
    <>
      <hr className="nav-founding-separator" />
      <Link
        href="/founding-funders"
        className={active ? "nav-founding-link nav-founding-link-active" : "nav-founding-link"}
        onClick={onNavigate}
      >
        <DiamondIcon size={18} />
        Founding Funders
      </Link>
    </>
  );
}

function BottomNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} style={bottomNavStyle(active)}>
      {icon}
      <span style={{ fontSize: 11 }}>{label}</span>
    </Link>
  );
}

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
   *  (/wordle) is open to everyone regardless of this flag. This is a separate concern from
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
  aptaCount: number;
  nexusRequestCount: number;
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
  /** "desktop" (the real .app-sidebar) vs "mobile" (the slide-out .app-mobile-drawer) —
   *  every nav item's own visual treatment differs between the two purely via CSS scoped
   *  under those two ancestor classes (see globals.css's sidebar redesign block), so this
   *  prop exists for exactly one thing the two genuinely can't share: the footer's markup.
   *  The desktop footer gained a real new element (the avatar circle) the mobile drawer's
   *  footer was never asked to have, so that one block renders two different JSX trees
   *  instead of one CSS-scoped tree — everything else in this file stays one shared tree. */
  variant: "desktop" | "mobile";
}

/** The full nav — links, section labels, and the "signed in as" footer — shared by the
 *  desktop sidebar and the mobile drawer so the two never drift out of sync. */
function NavContent({
  profileName,
  specialtyLabel,
  practiceState,
  school,
  hasLicense,
  isPro,
  isStudent,
  isVerifiedStudent,
  isAdmin,
  aptaCount,
  nexusRequestCount,
  zoneTwoOrder,
  clinicMembership,
  onNavigate,
  variant,
}: NavContentProps) {
  const pathname = usePathname();
  // Collapsed by default unless already somewhere under /nexus (so landing on, say,
  // /nexus/messages via a direct link or a widget elsewhere in the app doesn't hide the
  // very section that link belongs to) — collapsing is purely a sidebar decluttering
  // preference from here on, not tied to route changes, so a manual toggle isn't fought by
  // navigating between the four Nexus sub-pages themselves.
  const [nexusExpanded, setNexusExpanded] = useState(pathname.startsWith("/nexus"));
  // Same collapsed-unless-already-there reasoning as Nexus above — this section grew to 12
  // links once the LimbicPRO clinical toolbox shipped (see app/(app)/pro/*), which is too
  // long to sit permanently expanded in a sidebar that still has six more sections below
  // it. /agent and /hep aren't nested under /pro but only ever show up as links from this
  // section, so they count as "already there" too.
  const [proExpanded, setProExpanded] = useState(
    pathname.startsWith("/pro") || pathname.startsWith("/hep") || pathname.startsWith("/agent")
  );
  // Every remaining section below follows the exact same collapsed-unless-already-there
  // pattern as Nexus/LimbicPRO above, so the whole sidebar stays short by default regardless
  // of how many sections/links get added to any one of them over time.
  const [connexionExpanded, setConnexionExpanded] = useState(pathname.startsWith("/connexion"));
  const [studentExpanded, setStudentExpanded] = useState(
    pathname.startsWith("/student") || pathname.startsWith("/boards")
  );
  const [wellnessExpanded, setWellnessExpanded] = useState(
    pathname.startsWith("/wellness") || pathname.startsWith("/games")
  );
  const [savedExpanded, setSavedExpanded] = useState(pathname.startsWith("/saved"));
  const [articlesExpanded, setArticlesExpanded] = useState(
    pathname.startsWith("/news") || pathname.startsWith("/under-review")
  );
  const [adminExpanded, setAdminExpanded] = useState(pathname.startsWith("/admin"));

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
          onClick={() => setConnexionExpanded((v) => !v)}
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
          onClick={() => setStudentExpanded((v) => !v)}
        />
        {studentExpanded && (
          <>
            <NavLink href="/student" icon={<GraduationCapIcon />} label={isStudent ? "Atrium" : "Overview"} bold={false} onNavigate={onNavigate} />
            {isStudent && (
              <>
                <NavLink href="/student/slides" icon={<FileTextIcon />} label="Break Down Slides" bold={false} onNavigate={onNavigate} />
                <NavLink href="/student/soap" icon={<PencilIcon />} label="Practice a SOAP Note" bold={false} onNavigate={onNavigate} />
                <NavLink href="/boards" icon={<CheckCircleIcon />} label="Boards" locked={!isVerifiedStudent} lockLabel="STUDENT+" bold={false} onNavigate={onNavigate} />
                <NavLink
                  href="/student/specialties"
                  icon={<BandageIcon />}
                  label="Specialties"
                  exact={false}
                  bold={false}
                  onNavigate={onNavigate}
                />
                <NavLink href="/pro/lab-values" icon={<GridIcon />} label="Clinical Reference" bold={false} onNavigate={onNavigate} />
              </>
            )}
            <NavLink href="/student/resources" icon={<ListIcon />} label="NPTE Resources" bold={false} onNavigate={onNavigate} />
            {isStudent && (
              <NavLink href="/student/wellness" icon={<HeartIcon />} label="Mental Wellness" bold={false} onNavigate={onNavigate} />
            )}
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
          onClick={() => setProExpanded((v) => !v)}
          badge="PRO"
          badgeHidden={pathname.startsWith("/pro") || pathname.startsWith("/hep") || pathname.startsWith("/agent")}
        />
        {proExpanded && (
          <>
            {isPro && (
              <NavLink href="/pro/dashboard" icon={<LayoutDashboardIcon />} label="Dashboard" bold={false} onNavigate={onNavigate} />
            )}
            {isPro && <NavLink href="/pro/force-lab" icon={<ZapIcon />} label="Force Lab" bold={false} onNavigate={onNavigate} />}
            {isPro && clinicMembership?.isAdmin && (
              <>
                <NavLink href="/pro/dashboard?tab=team" icon={<UsersIcon />} label="Team Dashboard" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/clinic-report" icon={<FileTextIcon />} label="Clinic Report" bold={false} onNavigate={onNavigate} />
              </>
            )}
            <NavLink href="/pro" icon={<CrownIcon />} label="Overview" badge={isPro ? "Pro" : undefined} bold={false} onNavigate={onNavigate} />
            <NavLink href="/agent" icon={<NetworkIcon />} label="Limbic Agent" bold={false} onNavigate={onNavigate} />
            {(isPro || isStudent) && (
              <>
                <NavLink href="/pro/calculators" icon={<ActivityIcon />} label="Outcome Measures" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/decision-rules" icon={<CheckCircleIcon />} label="Screening & Decision Support" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/special-tests" icon={<ListIcon />} label="Special Tests" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/lab-values" icon={<GridIcon />} label="Clinical Reference" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/exercises" icon={<DumbbellIcon />} label="Therapeutic Exercises" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/research-literacy" icon={<SearchIcon />} label="Research & Statistics Literacy" bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/documentation" icon={<FileTextIcon />} label="Documentation" locked={!isPro} bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/ce-tracker" icon={<CalendarIcon />} label="CE Tracker" locked={!isPro} bold={false} onNavigate={onNavigate} />
                <NavLink href="/pro/guidelines" icon={<BookmarkIcon />} label="Guidelines" bold={false} onNavigate={onNavigate} />
                <NavLink href="/hep" icon={<BandageIcon />} label="Home Exercise Programs" locked={!isPro} bold={false} onNavigate={onNavigate} />
              </>
            )}
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
          onClick={() => setWellnessExpanded((v) => !v)}
        />
        {wellnessExpanded && (
          <>
            <NavLink href="/wellness" icon={<WellnessIcon />} label="Overview" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/metrics" icon={<ActivityIcon />} label="Metrics" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/activity" icon={<ZapIcon />} label="Activity Log" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/nutrition" icon={<AppleIcon />} label="Nutrition" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/assess" icon={<CheckCircleIcon />} label="Assess Yourself" bold={false} onNavigate={onNavigate} />
            <NavLink href="/wellness/exercises" icon={<DumbbellIcon />} label="Exercise Library" bold={false} onNavigate={onNavigate} />
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
          onClick={() => setNexusExpanded((v) => !v)}
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
          onClick={() => setSavedExpanded((v) => !v)}
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
          onClick={() => setArticlesExpanded((v) => !v)}
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
      <NavLink href="/calendar" icon={<CalendarIcon />} label="Limbic Calendar" onNavigate={onNavigate} />
      <NavLink href="/clips" icon={<FilmIcon />} label="Clips" onNavigate={onNavigate} />
      <NavLink href="/games" icon={<GridIcon />} label="Limbic Games" onNavigate={onNavigate} />
      <NavLink href="/atlas" icon={<BodyIcon />} label="Limbic Atlas" onNavigate={onNavigate} />

      {/* Desktop-only (see .nav-zone-divider in globals.css) — the mobile drawer never had
       *  a divider here and keeps not having one, only the redesigned desktop sidebar's
       *  three-zone structure needs it. */}
      <hr className="nav-zone-divider" />

      {zoneTwoOrder.map((key) => (
        <Fragment key={key}>{zoneTwoSections[key]}</Fragment>
      ))}

      {/* Same desktop-only divider as above, marking Zone 2 -> Zone 3 (Admin + Founding
       *  Funders). FoundingFundersNavLink's own .nav-founding-separator still renders right
       *  before it, unchanged, for the mobile drawer; it's hidden on desktop (redundant
       *  once this divider already opened Zone 3) rather than removed, so nothing about
       *  the mobile drawer's structure has to change to make room for this. */}
      <hr className="nav-zone-divider" />

      {isAdmin && (
        <>
          <NavToggle
            icon={<LockIcon />}
            label="Admin"
            expanded={adminExpanded}
            onClick={() => setAdminExpanded((v) => !v)}
          />
          {adminExpanded && (
            <>
              <NavLink href="/admin/suggestions" icon={<MessageCircleIcon />} label="Suggestions" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/licenses" icon={<CheckCircleIcon />} label="License Queue" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/connexion-visits" icon={<ShieldIcon />} label="Connexion Visits" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/connexion-safety-score" icon={<ShieldIcon />} label="Connexion Safety Score" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/boards-tagging" icon={<GraduationCapIcon />} label="Boards Question Tagging" bold={false} onNavigate={onNavigate} />
              <NavLink href="/admin/accounts" icon={<UsersIcon />} label="Accounts" bold={false} onNavigate={onNavigate} />
            </>
          )}
        </>
      )}

      {/* /founding-funders is intentionally its own standalone page (no sidebar, no
       *  AppShell — see app/founding-funders/page.tsx) once you land there; this is just
       *  the entry point into it from the normal nav. */}
      <FoundingFundersNavLink onNavigate={onNavigate} />

      {variant === "desktop" ? (
        <div className="nav-footer nav-footer--desktop">
          <Link href="/profile" className="nav-footer-user" onClick={onNavigate}>
            <span className="nav-footer-avatar" aria-hidden>
              {initialsFor(profileName)}
            </span>
            <span className="nav-footer-user-text">
              <span className="nav-footer-name-row">
                <span className="nav-footer-name">{profileName}</span>
                {isVerifiedStudent && <StudentVerifiedBadge compact />}
              </span>
              <span className="nav-footer-role">
                {isStudent ? (school ? `DPT Student · ${school}` : "DPT Student") : `${specialtyLabel} · ${practiceState}`}
              </span>
              {clinicMembership && <span className="nav-footer-clinic-pill">{clinicMembership.clinicName}</span>}
            </span>
          </Link>
          <ThemeToggle className="nav-footer-theme-btn" />
          <form action={signOutAction}>
            <button type="submit" className="nav-footer-signout">
              Sign out
            </button>
          </form>
        </div>
      ) : (
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
      )}
    </>
  );
}

export interface AppShellProps {
  profileName: string;
  specialtyLabel: string;
  practiceState: string;
  school: string | null;
  hasLicense: boolean;
  isPro: boolean;
  isStudent: boolean;
  isVerifiedStudent: boolean;
  isAdmin: boolean;
  aptaCount: number;
  nexusRequestCount: number;
  savedCount: number;
  /** See lib/user-role.ts zoneTwoOrder() — computed in app/(app)/layout.tsx off the
   *  account's userRole. */
  zoneTwoOrder: ZoneTwoKey[];
  /** See NavContentProps' own doc comment on this same field. */
  clinicMembership: { clinicName: string; isAdmin: boolean } | null;
  children: React.ReactNode;
}

export function AppShell({
  profileName,
  specialtyLabel,
  practiceState,
  school,
  hasLicense,
  isPro,
  isStudent,
  isVerifiedStudent,
  isAdmin,
  aptaCount,
  nexusRequestCount,
  savedCount,
  zoneTwoOrder,
  clinicMembership,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const navProps = {
    profileName,
    specialtyLabel,
    practiceState,
    school,
    hasLicense,
    isPro,
    isStudent,
    isVerifiedStudent,
    isAdmin,
    aptaCount,
    nexusRequestCount,
    zoneTwoOrder,
    clinicMembership,
  };
  // Extends the Atrium's warm palette out to the surrounding chrome (sidebar/topbar/
  // drawer/bottomnav) whenever any Atrium route is active — see .app-root--atrium in
  // globals.css for why that chrome can't just read the page's own --atrium-* tokens.
  const pathname = usePathname();
  const isAtrium = pathname.startsWith("/student");

  // A defensive re-assertion, not the primary mechanism (see the blocking THEME_INIT_SCRIPT
  // in app/layout.tsx, which is what actually prevents a flash on first paint) — AppShell is
  // the one client boundary mounted fresh on every full page load across the whole
  // authenticated app, so this is the last checkpoint to correct html[data-theme] back to
  // the reader's real stored preference if anything else touched it first (a hydration
  // quirk, a third-party script, a browser extension) without also touching localStorage —
  // reported as a specific page's theme silently reverting to light on refresh, then
  // correcting itself the moment the tab is closed and reopened (a fresh load re-running the
  // init script from an untouched localStorage value), which is exactly the signature this
  // guards against. Runs once per hard load; App Router's shared layout means AppShell
  // doesn't remount on ordinary in-app navigation, matching how localStorage.getItem
  // ("theme") itself is only ever read fresh on a real page load, not client-side routing.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolveTheme(readStoredThemePreference()));
  }, []);

  // Restores scroll position on reopen by re-centering the active link instead — the drawer
  // is unmounted on close (see the drawerOpen && (...) below), which resets its scrollTop to
  // 0 on every open, so there's no scroll position to actually preserve across that unmount.
  // Runs after the open animation (see .app-mobile-drawer in globals.css) rather than
  // immediately, so the drawer isn't still mid-transition when it jumps.
  useEffect(() => {
    if (!drawerOpen) return;
    const timer = setTimeout(() => {
      const activeLink = drawerRef.current?.querySelector<HTMLElement>('[data-active="true"]');
      activeLink?.scrollIntoView({ behavior: "instant", block: "center" });
    }, 50);
    return () => clearTimeout(timer);
  }, [drawerOpen]);

  return (
    <div className={`app-root${isAtrium ? " app-root--atrium" : ""}`}>
      <nav className="app-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <LogoIcon size={22} />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, color: "var(--color-text)" }}>
            Limbic
          </span>
        </div>
        <NavContent {...navProps} variant="desktop" />
      </nav>

      <main className="app-main">
        <div className="app-mobile-topbar">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <LogoIcon size={19} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>Limbic</span>
          </div>
          <span className="tag tag-neutral">{savedCount} saved</span>
        </div>

        {children}
      </main>

      <nav className="app-bottomnav">
        <BottomNavLink href="/home" icon={<HomeIcon size={20} />} label="Home" />
        <BottomNavLink href="/search" icon={<SearchIcon size={20} />} label="Search" />
        <BottomNavLink href="/profile" icon={<ProfileIcon size={20} />} label="Profile" />
      </nav>

      {drawerOpen && (
        <>
          <div className="app-mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <nav className="app-mobile-drawer" aria-label="Menu" ref={drawerRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LogoIcon size={22} />
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, color: "var(--color-text)" }}>
                  Limbic
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <XIcon size={18} />
              </button>
            </div>
            <NavContent {...navProps} variant="mobile" onNavigate={() => setDrawerOpen(false)} />
          </nav>
        </>
      )}
    </div>
  );
}
