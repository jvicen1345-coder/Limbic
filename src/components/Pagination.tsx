"use client";

import Link from "next/link";

const linkStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 32,
  height: 32,
  padding: "0 8px",
  borderRadius: "var(--radius-md)",
  border: "none",
  font: "inherit",
  fontSize: 13,
  fontWeight: active ? 700 : 500,
  textDecoration: "none",
  background: active ? "var(--color-accent-100)" : "transparent",
  color: disabled ? "var(--color-neutral-500)" : active ? "var(--color-accent-700)" : "var(--color-text)",
  pointerEvents: disabled ? "none" : undefined,
  cursor: disabled ? "default" : "pointer",
});

interface PaginationProps {
  page: number;
  totalPages: number;
  /** For server-rendered pages: navigates to `${basePath}?page=N`. A plain string (rather
   *  than a callback) because Server Component pages can't pass functions to this Client
   *  Component — only serializable props cross that boundary. */
  basePath?: string;
  /** For client-rendered pages (e.g. Search): updates local state instead of the URL. */
  onPageChange?: (page: number) => void;
}

/** Page-number links/buttons shared by every paginated list view — Under Review,
 *  APTA News, Saved Articles/Guidelines (URL-based via `basePath`), and Search
 *  (in-memory via `onPageChange`). */
export function Pagination({ page, totalPages, basePath, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const item = (p: number, label: React.ReactNode, key: string, disabled = false) => {
    const active = p === page;
    if (basePath) {
      return (
        <Link key={key} href={`${basePath}?page=${p}`} aria-current={active ? "page" : undefined} style={linkStyle(active, disabled)}>
          {label}
        </Link>
      );
    }
    return (
      <button
        key={key}
        type="button"
        disabled={disabled}
        aria-current={active ? "page" : undefined}
        onClick={() => onPageChange?.(p)}
        style={linkStyle(active, disabled)}
      >
        {label}
      </button>
    );
  };

  return (
    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 22, flexWrap: "wrap" }}>
      {item(Math.max(1, page - 1), "‹ Prev", "prev", page === 1)}
      {pages.map((p) => item(p, p, `page-${p}`))}
      {item(Math.min(totalPages, page + 1), "Next ›", "next", page === totalPages)}
    </nav>
  );
}
