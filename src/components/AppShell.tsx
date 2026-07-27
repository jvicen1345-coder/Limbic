"use client";

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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} style={sidebarNavStyle(active)}>
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

export interface AppShellProps {
  profileName: string;
  specialtyLabel: string;
  practiceState: string;
  hasLicense: boolean;
  aptaCount: number;
  savedCount: number;
  children: React.ReactNode;
}

export function AppShell({
  profileName,
  specialtyLabel,
  practiceState,
  hasLicense,
  aptaCount,
  savedCount,
  children,
}: AppShellProps) {
  return (
    <div className="app-root">
      <nav className="app-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <LogoIcon size={22} />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, color: "var(--color-text)" }}>
            Limbic
          </span>
        </div>
        <NavLink href="/" icon={<HomeIcon />} label="Home" />
        <NavLink href="/search" icon={<SearchIcon />} label="Search" />
        <NavLink href="/profile" icon={<ProfileIcon />} label="Profile" />
        <NavLink href="/wellness" icon={<WellnessIcon />} label="Health & Wellness" />

        <div className="nav-section-label">Saved</div>
        <NavLink href="/saved/articles" icon={<BookmarkIcon />} label="Saved Articles" />
        <NavLink href="/saved/guidelines" icon={<CheckCircleIcon />} label="Saved Guidelines" />

        {hasLicense && (
          <>
            <div className="nav-section-label">Articles</div>
            <NavLink href="/apta-news" icon={<ZapIcon />} label="APTA News" badge={aptaCount} />
            <NavLink href="/under-review" icon={<AlertCircleIcon />} label="Under Review" />

            <div className="nav-section-label">Clinician tools</div>
            <NavLink href="/hep" icon={<BandageIcon />} label="Home Exercise Programs" />
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
      </nav>

      <main className="app-main">
        <div className="app-mobile-topbar">
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
    </div>
  );
}
