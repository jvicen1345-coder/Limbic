"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ZoneTwoKey } from "@/lib/user-role";
import {
  LogoIcon,
  HomeIcon,
  SearchIcon,
  ProfileIcon,
  MenuIcon,
  XIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
} from "@/components/icons";
import { readStoredThemePreference, resolveTheme } from "@/lib/theme-client";
import { NavContent } from "./NavContent";
import { BottomNavLink } from "./nav-items";

interface NavigationBadges {
  aptaCount: number;
  nexusRequestCount: number;
  savedCount: number;
  clinicMembership: { clinicName: string; isAdmin: boolean } | null;
}

function isClinicMembership(value: unknown): value is { clinicName: string; isAdmin: boolean } {
  if (!value || typeof value !== "object") return false;
  const membership = value as Record<string, unknown>;
  return typeof membership.clinicName === "string" && typeof membership.isAdmin === "boolean";
}

function isNavigationBadges(value: unknown): value is NavigationBadges {
  if (!value || typeof value !== "object") return false;
  const badges = value as Record<string, unknown>;
  const countsOk = [badges.aptaCount, badges.nexusRequestCount, badges.savedCount].every(
    (count) => typeof count === "number" && Number.isInteger(count) && count >= 0,
  );
  if (!countsOk) return false;
  return badges.clinicMembership === null || isClinicMembership(badges.clinicMembership);
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
  /** Whether Nexus exists for this reader at all — lib/nexus-visibility.ts, evaluated in
   *  app/(app)/layout.tsx because that module is server-only. */
  showNexus: boolean;
  /** See lib/user-role.ts zoneTwoOrder() — computed in app/(app)/layout.tsx off the
   *  account's userRole. */
  zoneTwoOrder: ZoneTwoKey[];
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
  showNexus,
  zoneTwoOrder,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navigationBadges, setNavigationBadges] = useState<NavigationBadges | null>(null);
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
    showNexus,
    aptaCount: navigationBadges?.aptaCount,
    nexusRequestCount: navigationBadges?.nexusRequestCount,
    zoneTwoOrder,
    clinicMembership: navigationBadges?.clinicMembership ?? null,
  };
  // Extends the Atrium's warm palette out to the surrounding chrome (sidebar/topbar/
  // drawer/bottomnav) whenever any Atrium route is active — see .app-root--atrium in
  // src/styles for why that chrome can't just read the page's own --atrium-* tokens.
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

  // AppShell persists across ordinary App Router navigations, so one background read per
  // hard load is enough. These counts (and the clinic footer pill) used to be awaited by
  // the server layout, delaying the entire authenticated shell. A failed or malformed
  // response deliberately leaves every count absent rather than showing a false zero.
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/navigation-badges", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const badges: unknown = await response.json();
        if (!controller.signal.aborted && isNavigationBadges(badges)) setNavigationBadges(badges);
      })
      .catch(() => {
        // Badge data is nonessential chrome. Auth redirects and page content are handled by
        // the server layout, so a network failure here must not disturb either one.
      });
    return () => controller.abort();
  }, []);

  // Restores scroll position on reopen by re-centering the active link instead — the drawer
  // is unmounted on close (see the drawerOpen && (...) below), which resets its scrollTop to
  // 0 on every open, so there's no scroll position to actually preserve across that unmount.
  // Runs after the open animation (see .app-mobile-drawer in src/styles) rather than
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
      <nav className="app-sidebar" data-tour="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <LogoIcon size={22} />
          <span className="app-wordmark" style={{ fontSize: 19 }}>
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
            <span className="app-wordmark" style={{ fontSize: 17 }}>Limbic</span>
          </div>
          {navigationBadges && <span className="tag tag-neutral">{navigationBadges.savedCount} saved</span>}
        </div>

        {children}
      </main>

      {/* Search/Home/Profile are the only entries every account gets — Atrium and Dashboard
          are conditional on the same isStudent/isPro flags the sidebar already gates its own
          "/student" and "/pro/dashboard" links on (see NavContent above), so the bar only
          grows for an account that actually has that destination; bottomNavStyle's flex: 1
          on every item re-spaces the row automatically at 3, 4, or 5 entries. Order is
          Search, Atrium, Home, Dashboard, Profile — Home sits in the middle of the full
          5-entry bar. */}
      <nav className="app-bottomnav">
        <BottomNavLink href="/search" icon={<SearchIcon size={20} />} label="Search" />
        {isStudent && <BottomNavLink href="/student" icon={<GraduationCapIcon size={20} />} label="Atrium" />}
        <BottomNavLink href="/home" icon={<HomeIcon size={20} />} label="Home" />
        {isPro && <BottomNavLink href="/pro/dashboard" icon={<LayoutDashboardIcon size={20} />} label="Dashboard" />}
        <BottomNavLink href="/profile" icon={<ProfileIcon size={20} />} label="Profile" />
      </nav>

      {drawerOpen && (
        <>
          <div className="app-mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <nav className="app-mobile-drawer" aria-label="Menu" ref={drawerRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LogoIcon size={22} />
                <span className="app-wordmark" style={{ fontSize: 19 }}>
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
