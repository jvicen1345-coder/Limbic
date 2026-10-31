"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import {
  HomeIcon,
  SearchIcon,
  WellnessIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ZapIcon,
  CrownIcon,
  FilmIcon,
  UsersIcon,
  GridIcon,
  GraduationCapIcon,
  FileTextIcon,
  DumbbellIcon,
  ShieldIcon,
  LockIcon,
  DiamondIcon,
  MessageCircleIcon,
  BodyIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudentVerifiedBadge } from "@/components/StudentVerifiedBadge";
import { NavLink, NavToggle, FoundingFundersNavLink } from "./nav-items";
import { ADMIN_AREA_LABELS, type AdminArea } from "@/lib/admin-areas";

/** Library, Community, and Admin still expand. Learn and Clinical are single rows;
 *  their pages are the in-page tabs from lib/section-nav.ts. */
type SidebarSection = "library" | "community" | "admin";

interface NavContentProps {
  profileName: string;
  specialtyLabel: string;
  practiceState: string;
  /** Shown in the footer nameplate instead of specialty/practiceState for a
   *  hasStudentAccess account — null until set via Profile, in which case the subtitle
   *  falls back to "DPT Student" alone. */
  school: string | null;
  isStudent: boolean;
  /** True only for a real, paid LimbicStudent subscription. Shows the "Verified Student"
   *  badge in the footer nameplate. */
  isVerifiedStudent: boolean;
  /** Whether Nexus exists for this reader (lib/nexus-visibility.ts). Passed in rather than
   *  computed here: that module reaches lib/session.ts, which is server-only. */
  showNexus: boolean;
  /** The admin areas this account can open. Empty hides the Admin section entirely.
   *  Each link below is gated on its own area. */
  adminAreas: AdminArea[];
  /** True only for an owner on FOUNDING_FUNDERS_ADMIN_EMAILS. Gates /admin/accounts. */
  isOwnerAdmin: boolean;
  /** Populated after mount by /api/navigation-badges; absent while loading or on failure. */
  aptaCount?: number;
  /** Pending Nexus connection requests. Shown on the Nexus row, which is the section
   *  entry now that Feed/Directory/Connections/Messages are in-page tabs. */
  nexusRequestCount?: number;
  /** Clinic PRO team membership. Null hides the footer's clinic-name pill. */
  clinicMembership: { clinicName: string; isAdmin: boolean } | null;
  /** Called after any nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}

const LIBRARY_PREFIXES = ["/evidence", "/atlas", "/clips", "/news", "/under-review", "/saved", "/connexion", "/games"];
const COMMUNITY_PREFIXES = ["/nexus", "/wellness"];
const LEARN_PREFIXES = ["/student", "/boards"];
const CLINICAL_PREFIXES = ["/pro", "/agent", "/hep"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchesAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

function sectionForPath(pathname: string): SidebarSection | null {
  if (matchesAny(pathname, LIBRARY_PREFIXES)) return "library";
  if (matchesAny(pathname, COMMUNITY_PREFIXES)) return "community";
  if (matchesPrefix(pathname, "/admin")) return "admin";
  return null;
}

/** The full nav — links, section labels, and the "signed in as" footer — shared by the
 *  desktop sidebar and the mobile drawer so the two never drift out of sync. */
export function NavContent({
  profileName,
  specialtyLabel,
  practiceState,
  school,
  isStudent,
  isVerifiedStudent,
  showNexus,
  adminAreas,
  isOwnerAdmin,
  aptaCount,
  nexusRequestCount,
  clinicMembership,
  onNavigate,
}: NavContentProps) {
  const pathname = usePathname();
  const has = (area: AdminArea) => adminAreas.includes(area);
  // The route picks the open group. A manual toggle is remembered only until the path
  // changes, so a direct visit to /saved/clips still opens Library after a client
  // navigation without an effect writing state on every pathname change.
  const pathSection = sectionForPath(pathname);
  const [override, setOverride] = useState<{ path: string; section: SidebarSection | null } | null>(null);
  const expandedSection = override?.path === pathname ? override.section : pathSection;
  const toggleSection = (key: SidebarSection) => {
    setOverride({ path: pathname, section: expandedSection === key ? null : key });
  };

  // The welcome tour looks for the Atlas link while the reader is still on Home, where
  // Library starts collapsed and the link is unmounted. Opening the group when that
  // step begins lets the existing anchor measure. Learn and Clinical stay single rows,
  // so their tour anchors do not need this.
  useEffect(() => {
    const openForTour = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      if (target === '[data-tour="atlas"]') setOverride({ path: pathname, section: "library" });
    };
    window.addEventListener("limbic:tour-target", openForTour);
    return () => window.removeEventListener("limbic:tour-target", openForTour);
  }, [pathname]);

  const libraryExpanded = expandedSection === "library";
  const communityExpanded = expandedSection === "community";
  const adminExpanded = expandedSection === "admin";
  const libraryActive = matchesAny(pathname, LIBRARY_PREFIXES);
  const communityActive = matchesAny(pathname, COMMUNITY_PREFIXES);

  return (
    <>
      <NavLink href="/home" icon={<HomeIcon />} label="Home" onNavigate={onNavigate} />
      <NavLink href="/search" icon={<SearchIcon />} label="Search" onNavigate={onNavigate} />
      <NavLink
        href="/student"
        icon={<GraduationCapIcon />}
        label="Learn"
        activePrefixes={LEARN_PREFIXES}
        onNavigate={onNavigate}
        dataTour="limbic-student"
      />
      <NavLink
        href="/pro/dashboard"
        icon={<CrownIcon />}
        label="Clinical"
        activePrefixes={CLINICAL_PREFIXES}
        onNavigate={onNavigate}
        dataTour="limbic-pro"
      />

      <NavToggle
        icon={<FileTextIcon />}
        label="Library"
        expanded={libraryExpanded}
        active={libraryActive}
        onClick={() => toggleSection("library")}
      />
      {libraryExpanded && (
        <>
          <NavLink href="/evidence" icon={<FileTextIcon />} label="Evidence Library" bold={false} activePrefixes={["/evidence"]} onNavigate={onNavigate} />
          <NavLink href="/atlas" icon={<BodyIcon />} label="Limbic Atlas" bold={false} onNavigate={onNavigate} dataTour="atlas" />
          <NavLink href="/clips" icon={<FilmIcon />} label="Clips" bold={false} onNavigate={onNavigate} />
          <NavLink
            href="/news"
            icon={<ZapIcon />}
            label="News"
            badge={aptaCount}
            bold={false}
            activePrefixes={["/news", "/under-review"]}
            onNavigate={onNavigate}
          />
          <NavLink href="/saved/articles" icon={<BookmarkIcon />} label="Saved" bold={false} activePrefixes={["/saved"]} onNavigate={onNavigate} />
          <NavLink href="/connexion" icon={<ShieldIcon />} label="Connexion Method" bold={false} activePrefixes={["/connexion"]} onNavigate={onNavigate} />
          <NavLink href="/games" icon={<GridIcon />} label="Limbic Games" bold={false} activePrefixes={["/games"]} onNavigate={onNavigate} />
        </>
      )}

      <NavToggle
        icon={<UsersIcon />}
        label="Community"
        expanded={communityExpanded}
        active={communityActive}
        onClick={() => toggleSection("community")}
      />
      {communityExpanded && (
        <>
          {showNexus ? (
            <NavLink
              href="/nexus"
              icon={<UsersIcon />}
              label="Nexus"
              badge={nexusRequestCount}
              bold={false}
              activePrefixes={["/nexus"]}
              onNavigate={onNavigate}
            />
          ) : null}
          <NavLink href="/wellness" icon={<WellnessIcon />} label="Wellness" bold={false} activePrefixes={["/wellness"]} onNavigate={onNavigate} />
        </>
      )}

      {adminAreas.length > 0 && (
        <>
          <NavToggle
            icon={<LockIcon />}
            label="Admin"
            expanded={adminExpanded}
            active={matchesPrefix(pathname, "/admin")}
            onClick={() => toggleSection("admin")}
          />
          {adminExpanded && (
            <>
              {/* One `has(...)` per link rather than one check for the whole section: a
                  co-admin holds some areas and not others, and a link they cannot open is
                  worse than no link — it looks like the app losing their session when
                  hasAdminArea() bounces them back to Home. An owner holds every area, so
                  this renders exactly what it always did for them. */}
              {has("appraisals") && (
                <NavLink href="/admin/appraisals" icon={<FileTextIcon />} label="Appraisals" bold={false} onNavigate={onNavigate} />
              )}
              {has("suggestions") && (
                <NavLink href="/admin/suggestions" icon={<MessageCircleIcon />} label="Suggestions" bold={false} onNavigate={onNavigate} />
              )}
              {has("licenses") && (
                <NavLink href="/admin/licenses" icon={<CheckCircleIcon />} label="License Queue" bold={false} onNavigate={onNavigate} />
              )}
              {has("copyright") && (
                <NavLink href="/admin/copyright" icon={<ShieldIcon />} label="Copyright Notices" bold={false} onNavigate={onNavigate} />
              )}
              {has("connexion") && (
                <NavLink href="/admin/connexion-visits" icon={<ShieldIcon />} label="Connexion Visits" bold={false} onNavigate={onNavigate} />
              )}
              {has("connexion") && (
                <NavLink
                  href="/admin/connexion-safety-score"
                  icon={<ShieldIcon />}
                  label="Connexion Safety Score"
                  bold={false}
                  onNavigate={onNavigate}
                />
              )}
              {has("boardsTagging") && (
                <NavLink
                  href="/admin/boards-tagging"
                  icon={<GraduationCapIcon />}
                  label={ADMIN_AREA_LABELS.boardsTagging}
                  bold={false}
                  onNavigate={onNavigate}
                />
              )}
              {isOwnerAdmin && (
                <NavLink href="/admin/accounts" icon={<UsersIcon />} label="Accounts" bold={false} onNavigate={onNavigate} />
              )}
              {has("programs") && (
                <NavLink href="/admin/programs" icon={<GraduationCapIcon />} label="Programs" bold={false} onNavigate={onNavigate} />
              )}
              {has("movementLab") && (
                <NavLink
                  href="/admin/movement-lab-requests"
                  icon={<DumbbellIcon />}
                  label="Movement Lab Requests"
                  bold={false}
                  onNavigate={onNavigate}
                />
              )}
              {/* foundingFunders has no /admin/* page — the payment roster and claim form
                  live on the public /founding-funders page (see FoundingAdminPanel). Without
                  this row, granting only that area opened an empty Admin accordion (#498).
                  The gold standalone entry below stays for everyone; this is the granted
                  co-admin path from the section that already lists their other areas. */}
              {has("foundingFunders") && (
                <NavLink
                  href="/founding-funders"
                  icon={<DiamondIcon />}
                  label="Founding Funders"
                  bold={false}
                  onNavigate={onNavigate}
                />
              )}
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
