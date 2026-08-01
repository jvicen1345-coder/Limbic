"use client";

import { useState } from "react";
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
  FilmIcon,
  UsersIcon,
  GridIcon,
} from "@/components/icons";

function sidebarNavStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: active ? "var(--color-accent-100)" : "none",
    cursor: "pointer",
    font: "600 14px var(--font-body)",
    padding: "10px 12px",
    borderRadius: "var(--radius-lg)",
    textAlign: "left",
    width: "100%",
    color: active ? "var(--color-accent-700)" : "var(--color-text)",
    textDecoration: "none",
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
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  /** Called after the link is clicked — used to close the mobile drawer on navigation. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} style={sidebarNavStyle(active)} onClick={onNavigate}>
      {icon}
      {label}
      {badge != null && badge > 0 && (
        <span className="tag tag-accent" style={{ marginLeft: "auto" }}>
          {badge}
        </span>
      )}
    </Link>
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
  aptaCount: number;
  nexusRequestCount: number;
  /** Called after any nav link is clicked — used to close the mobile drawer on navigation. */
  onNavigate?: () => void;
}

/** The full nav — links, section labels, and the "signed in as" footer — shared by the
 *  desktop sidebar and the mobile drawer so the two never drift out of sync. */
function NavContent({ profileName, specialtyLabel, practiceState, hasLicense, isPro, aptaCount, nexusRequestCount, onNavigate }: NavContentProps) {
  return (
    <>
      <NavLink href="/" icon={<HomeIcon />} label="Home" onNavigate={onNavigate} />
      <NavLink href="/search" icon={<SearchIcon />} label="Search" onNavigate={onNavigate} />
      <NavLink href="/profile" icon={<ProfileIcon />} label="Profile" onNavigate={onNavigate} />
      <NavLink href="/wellness" icon={<WellnessIcon />} label="Health & Wellness" onNavigate={onNavigate} />
      <NavLink href="/nexus" icon={<UsersIcon />} label="Nexus" badge={nexusRequestCount} onNavigate={onNavigate} />
      <NavLink href="/clips" icon={<FilmIcon />} label="Clips" onNavigate={onNavigate} />
      <NavLink href="/wordle" icon={<GridIcon />} label="Daily Term" onNavigate={onNavigate} />
      <Link
        href="/pro"
        onClick={onNavigate}
        style={{ ...sidebarNavStyle(false), color: "var(--color-accent-700)" }}
      >
        <CrownIcon size={18} />
        LimbicPro
        {isPro && (
          <span className="tag tag-accent" style={{ marginLeft: "auto" }}>
            Pro
          </span>
        )}
      </Link>

      <div className="nav-section-label">Saved</div>
      <NavLink href="/saved/articles" icon={<BookmarkIcon />} label="Saved Articles" onNavigate={onNavigate} />
      <NavLink href="/saved/guidelines" icon={<CheckCircleIcon />} label="Saved Guidelines" onNavigate={onNavigate} />

      <div className="nav-section-label">Articles</div>
      <NavLink href="/apta-news" icon={<ZapIcon />} label="APTA News" badge={aptaCount} onNavigate={onNavigate} />
      {hasLicense && <NavLink href="/under-review" icon={<AlertCircleIcon />} label="Under Review" onNavigate={onNavigate} />}

      {hasLicense && (
        <>
          <div className="nav-section-label">Clinician tools</div>
          <NavLink href="/hep" icon={<BandageIcon />} label="Home Exercise Programs" onNavigate={onNavigate} />
        </>
      )}

      <div className="nav-footer">
        <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginBottom: 4 }}>Signed in as</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{profileName}</div>
        <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginBottom: 8 }}>
          {specialtyLabel} · {practiceState}
        </div>
        <form action={signOutAction}>
          <button type="submit" className="btn btn-ghost" style={{ padding: "4px 0", fontSize: 12 }}>
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
  aptaCount,
  nexusRequestCount,
  savedCount,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navProps = { profileName, specialtyLabel, practiceState, hasLicense, isPro, aptaCount, nexusRequestCount };

  return (
    <div className="app-root">
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
        <BottomNavLink href="/" icon={<HomeIcon size={20} />} label="Home" />
        <BottomNavLink href="/search" icon={<SearchIcon size={20} />} label="Search" />
        <BottomNavLink href="/profile" icon={<ProfileIcon size={20} />} label="Profile" />
      </nav>

      {drawerOpen && (
        <>
          <div className="app-mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <nav className="app-mobile-drawer" aria-label="Menu">
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
