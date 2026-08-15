"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
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
  RefreshIcon,
  ChevronRightIcon,
  ShieldIcon,
  HeartIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

function sidebarNavStyle(active: boolean, bold: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    // Always a 3px left border (transparent when inactive) rather than only adding one
    // when active — that way toggling active/inactive never shifts the icon/label by the
    // border's width, just its color.
    borderLeft: active ? "3px solid var(--color-accent)" : "3px solid transparent",
    background: active ? "var(--color-accent-100)" : "none",
    cursor: "pointer",
    font: `${bold ? 600 : 400} 14px var(--font-body)`,
    padding: "13px 12px",
    borderRadius: "var(--radius-lg)",
    textAlign: "left",
    width: "100%",
    color: active ? "var(--color-accent-700)" : "var(--color-text)",
    textDecoration: "none",
    transition: "background 150ms ease, border-color 150ms ease",
  };
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
  exact = true,
  bold = true,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  /** A number renders as a count badge (hidden at 0); a string renders as-is (e.g. "Pro"). */
  badge?: number | string;
  /** Same lock-badge treatment as LimbicAgentCard's "Ask Limbic Agent" button (icon + "PRO"
   *  pill) — for a nav item that's shown to everyone but only fully usable by
   *  PRO/studentTier accounts. Takes precedence over `badge` when both are set. */
  locked?: boolean;
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
  return (
    <Link href={href} style={sidebarNavStyle(active, bold)} onClick={onNavigate} data-active={active}>
      {icon}
      {label}
      {locked ? (
        <span
          className="tag tag-accent"
          style={{ marginLeft: "auto", background: "var(--color-bg)", display: "inline-flex", alignItems: "center", gap: 3 }}
        >
          <LockIcon size={10} />
          PRO
        </span>
      ) : (
        showBadge && (
          <span className="tag tag-accent" style={{ marginLeft: "auto" }}>
            {badge}
          </span>
        )
      )}
    </Link>
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
  hasLicense: boolean;
  isPro: boolean;
  /** True for a .edu sign-in email or a site admin account (see lib/session.ts
   *  hasStudentAccess) — gates the whole Limbic Student section below: hidden entirely (no
   *  locked state) for anyone who doesn't qualify. Limbic Games (/wordle) is open to
   *  everyone regardless of this flag. */
  isStudent: boolean;
  /** True for a site admin account (see lib/admin.ts isSiteAdmin) — gates the Admin section
   *  below, hidden entirely for everyone else. */
  isAdmin: boolean;
  aptaCount: number;
  nexusRequestCount: number;
  /** Called after any nav link is clicked — used to close the mobile drawer on navigation. */
  onNavigate?: () => void;
}

/** The full nav — links, section labels, and the "signed in as" footer — shared by the
 *  desktop sidebar and the mobile drawer so the two never drift out of sync. */
function NavContent({ profileName, specialtyLabel, practiceState, hasLicense, isPro, isStudent, isAdmin, aptaCount, nexusRequestCount, onNavigate }: NavContentProps) {
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

  return (
    <>
      <NavLink href="/home" icon={<HomeIcon />} label="Home" onNavigate={onNavigate} />
      <NavLink href="/search" icon={<SearchIcon />} label="Search" onNavigate={onNavigate} />
      <NavLink href="/calendar" icon={<CalendarIcon />} label="Limbic Calendar" onNavigate={onNavigate} />

      <div className="nav-section-label nav-section-label--connexion">The Connexion Method</div>
      <NavLink href="/connexion" icon={<ShieldIcon />} label="Overview" bold={false} onNavigate={onNavigate} />
      <NavLink href="/connexion/afit" icon={<DumbbellIcon />} label="AFIT Assessment" bold={false} onNavigate={onNavigate} />
      <NavLink href="/connexion/protocol" icon={<FileTextIcon />} label="What to Expect" locked={!isPro} bold={false} onNavigate={onNavigate} />
      <NavLink href="/connexion/safety-score" icon={<ActivityIcon />} label="Safety Score" locked={!isPro} bold={false} onNavigate={onNavigate} />
      <NavLink href="/connexion/caregiver" icon={<HeartIcon />} label="Caregiver Education" bold={false} onNavigate={onNavigate} />
      <NavLink href="/connexion/delia" icon={<ProfileIcon />} label="About Delia Vicencio, PT, DPT" bold={false} onNavigate={onNavigate} />

      {isStudent && (
        <>
          <div className="nav-section-label">Limbic Student</div>
          <NavLink href="/student" icon={<GraduationCapIcon />} label="Atrium" bold={false} onNavigate={onNavigate} />
          <NavLink href="/boards" icon={<CheckCircleIcon />} label="Boards" bold={false} onNavigate={onNavigate} />
          <NavLink
            href="/student/specialties"
            icon={<BandageIcon />}
            label="Specialties"
            exact={false}
            bold={false}
            onNavigate={onNavigate}
          />
        </>
      )}

      <button
        type="button"
        className="nav-section-label nav-section-label--brand nav-section-label--toggle"
        aria-expanded={proExpanded}
        onClick={() => setProExpanded((v) => !v)}
      >
        LimbicPRO
        <ChevronRightIcon size={13} className={proExpanded ? "nav-section-label--toggle-chevron expanded" : "nav-section-label--toggle-chevron"} />
      </button>
      {proExpanded && (
        <>
          <NavLink href="/pro" icon={<CrownIcon />} label="Overview" badge={isPro ? "Pro" : undefined} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/calculators" icon={<ActivityIcon />} label="Clinical Calculators" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/decision-rules" icon={<CheckCircleIcon />} label="Decision Rules" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/red-flags" icon={<AlertCircleIcon />} label="Red Flag Screening" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/special-tests" icon={<ListIcon />} label="Special Tests" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/lab-values" icon={<GridIcon />} label="Lab Values" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/medications" icon={<HeartIcon />} label="Medications" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/documentation" icon={<FileTextIcon />} label="Documentation" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/ce-tracker" icon={<CalendarIcon />} label="CE Tracker" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/pro/guidelines" icon={<BookmarkIcon />} label="Guidelines" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/hep" icon={<BandageIcon />} label="Home Exercise Programs" locked={!isPro} bold={false} onNavigate={onNavigate} />
          <NavLink href="/agent" icon={<NetworkIcon />} label="Limbic Agent" bold={false} onNavigate={onNavigate} />
        </>
      )}

      <div className="nav-section-label">Health & Wellness</div>
      <NavLink href="/wellness" icon={<WellnessIcon />} label="Overview" bold={false} onNavigate={onNavigate} />
      <NavLink href="/wellness/metrics" icon={<ActivityIcon />} label="Metrics" bold={false} onNavigate={onNavigate} />
      <NavLink href="/wellness/activity" icon={<ZapIcon />} label="Activity Log" bold={false} onNavigate={onNavigate} />
      <NavLink href="/wellness/nutrition" icon={<AppleIcon />} label="Nutrition" bold={false} onNavigate={onNavigate} />
      <NavLink href="/wellness/assess" icon={<CheckCircleIcon />} label="Assess Yourself" bold={false} onNavigate={onNavigate} />
      <NavLink href="/wellness/exercises" icon={<DumbbellIcon />} label="Top 10 Exercises" bold={false} onNavigate={onNavigate} />
      <NavLink href="/wellness/continuum" icon={<RefreshIcon />} label="Rep Continuum" bold={false} onNavigate={onNavigate} />

      <NavLink href="/clips" icon={<FilmIcon />} label="Clips" onNavigate={onNavigate} />
      <NavLink href="/games" icon={<GridIcon />} label="Limbic Games" onNavigate={onNavigate} />

      <button
        type="button"
        className="nav-section-label nav-section-label--toggle"
        aria-expanded={nexusExpanded}
        onClick={() => setNexusExpanded((v) => !v)}
      >
        Nexus
        <ChevronRightIcon size={13} className={nexusExpanded ? "nav-section-label--toggle-chevron expanded" : "nav-section-label--toggle-chevron"} />
      </button>
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

      <div className="nav-section-label">Saved</div>
      <NavLink href="/saved/articles" icon={<BookmarkIcon />} label="Saved Articles" bold={false} onNavigate={onNavigate} />
      <NavLink href="/saved/guidelines" icon={<CheckCircleIcon />} label="Saved Guidelines" bold={false} onNavigate={onNavigate} />
      <NavLink href="/saved/wellness" icon={<WellnessIcon />} label="Saved Wellness" bold={false} onNavigate={onNavigate} />
      <NavLink href="/saved/clips" icon={<FilmIcon />} label="Saved Clips" bold={false} onNavigate={onNavigate} />

      <div className="nav-section-label">Articles</div>
      <NavLink href="/news" icon={<ZapIcon />} label="News" badge={aptaCount} bold={false} onNavigate={onNavigate} />
      {hasLicense && <NavLink href="/under-review" icon={<AlertCircleIcon />} label="Retracted Articles" bold={false} onNavigate={onNavigate} />}

      {isAdmin && (
        <>
          <div className="nav-section-label">Admin</div>
          <NavLink href="/admin/suggestions" icon={<MessageCircleIcon />} label="Suggestions" bold={false} onNavigate={onNavigate} />
          <NavLink href="/admin/licenses" icon={<CheckCircleIcon />} label="License Queue" bold={false} onNavigate={onNavigate} />
          <NavLink href="/admin/connexion-visits" icon={<ShieldIcon />} label="Connexion Visits" bold={false} onNavigate={onNavigate} />
        </>
      )}

      {/* /founding-funders is intentionally its own standalone page (no sidebar, no
       *  AppShell — see app/founding-funders/page.tsx) once you land there; this is just
       *  the entry point into it from the normal nav. */}
      <FoundingFundersNavLink onNavigate={onNavigate} />

      <div className="nav-footer">
        <Link href="/profile" className="nav-footer-nameplate" onClick={onNavigate}>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{profileName}</div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
            {specialtyLabel} · {practiceState}
          </div>
        </Link>
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            type="submit"
            className="btn btn-ghost"
            style={{ padding: "4px 0", fontSize: 12, color: "var(--color-danger)" }}
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export interface AppShellProps {
  profileName: string;
  specialtyLabel: string;
  practiceState: string;
  hasLicense: boolean;
  isPro: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  aptaCount: number;
  nexusRequestCount: number;
  savedCount: number;
  children: React.ReactNode;
}

export function AppShell({
  profileName,
  specialtyLabel,
  practiceState,
  hasLicense,
  isPro,
  isStudent,
  isAdmin,
  aptaCount,
  nexusRequestCount,
  savedCount,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const navProps = { profileName, specialtyLabel, practiceState, hasLicense, isPro, isStudent, isAdmin, aptaCount, nexusRequestCount };
  // Extends the Atrium's warm palette out to the surrounding chrome (sidebar/topbar/
  // drawer/bottomnav) whenever any Atrium route is active — see .app-root--atrium in
  // globals.css for why that chrome can't just read the page's own --atrium-* tokens.
  const pathname = usePathname();
  const isAtrium = pathname.startsWith("/student");

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
        <NavContent {...navProps} />
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
            <NavContent {...navProps} onNavigate={() => setDrawerOpen(false)} />
          </nav>
        </>
      )}
    </div>
  );
}
