"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DiamondIcon,
  LockIcon,
  ChevronRightIcon,
} from "@/components/icons";

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

export function NavLink({
  href,
  icon,
  label,
  badge,
  locked = false,
  lockLabel = "PRO",
  exact = true,
  bold = true,
  onNavigate,
  dataTour,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  /** A number renders as a count badge (hidden at 0); a string renders as-is (e.g. "Pro"). */
  badge?: number | string;
  /** Marks this item as a target for the guided tour (see components/LimbicTour.tsx),
   *  which finds it via document.querySelector(`[data-tour="${dataTour}"]`). Only the
   *  handful of items the tour actually references pass this. */
  dataTour?: string;
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
  return (
    <Link href={href} style={sidebarNavStyle(active, bold)} onClick={onNavigate} data-active={active} data-tour={dataTour}>
      {icon}
      {label}
      {locked ? (
        <span
          className="tag tag-accent"
          /* .tag sets overflow-wrap:anywhere for the long labels it carries elsewhere; this
             one is a two-word lock badge on a nav row, and wrapping it just makes the row
             two lines tall. */
          style={{
            marginLeft: "auto",
            background: "var(--color-bg)",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            flexShrink: 0,
            whiteSpace: "nowrap",
            overflowWrap: "normal",
          }}
        >
          <LockIcon size={10} />
          {lockLabel}
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

export function NavToggle({
  icon,
  label,
  expanded,
  onClick,
  dataTour,
}: {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onClick: () => void;
  /** Marks this item as a target for the guided tour — see NavLink's own dataTour above. */
  dataTour?: string;
}) {
  return (
    <button
      type="button"
      style={{ ...sidebarNavStyle(false, true), background: "color-mix(in srgb, var(--color-text) 6%, transparent)" }}
      aria-expanded={expanded}
      onClick={onClick}
      data-tour={dataTour}
    >
      {icon}
      {label}
      <ChevronRightIcon
        size={14}
        style={{
          marginLeft: "auto",
          flexShrink: 0,
          transition: "transform 150ms ease",
          transform: expanded ? "rotate(90deg)" : "none",
        }}
      />
    </button>
  );
}

/** Gold rather than the standard blue accent (see NavLink/sidebarNavStyle above) — a
 *  deliberately different treatment so it reads as its own thing, not another item in
 *  whatever section happens to sit above it. Stands alone with no section label, set off
 *  by its own thin top separator (see .nav-founding-separator in src/styles) rather than
 *  being grouped under one. */
export function FoundingFundersNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === "/founding-funders";
  return (
    <>
      <hr className="nav-founding-separator" />
      <Link
        href="/founding-funders"
        className={active ? "nav-founding-link nav-founding-link-active" : "nav-founding-link"}
        onClick={onNavigate}
        data-tour="founding-funders"
      >
        <DiamondIcon size={18} />
        Founding Funders
      </Link>
    </>
  );
}

export function BottomNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  // Match nested routes too, the way the sidebar's NavLink already can (see its `exact` prop).
  // With an exact match, /profile/credentials and /profile/membership left every tab unlit —
  // and since the bar only carries Home/Search/Profile, that was most of the app showing no
  // "you are here" at all. "/" stays exact so Home doesn't light up on every route.
  const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} style={bottomNavStyle(active)}>
      {icon}
      <span style={{ fontSize: "var(--fs-11)" }}>{label}</span>
    </Link>
  );
}
