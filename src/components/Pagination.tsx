"use client";

import Link from "next/link";

/* Only the state-dependent half stays inline. Size, spacing and shape moved to
   `.pagination-link` in globals.css so the touch-target rules there can reach them — as inline
   styles they were stuck at 32×32 with a 4px gap on every device, which is a lot of
   mis-taps for a control whose whole job is picking one number out of a row of them. */
const linkStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
  fontWeight: active ? 700 : 500,
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
        <Link
          key={key}
          href={`${basePath}?page=${p}`}
          className="pagination-link"
          aria-current={active ? "page" : undefined}
          style={linkStyle(active, disabled)}
        >
          {label}
        </Link>
      );
    }
    return (
      <button
        key={key}
        type="button"
        className="pagination-link"
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
    <nav aria-label="Pagination" className="pagination-nav">
      {item(Math.max(1, page - 1), "‹ Prev", "prev", page === 1)}
      {pages.map((p) => item(p, p, `page-${p}`))}
      {item(Math.min(totalPages, page + 1), "Next ›", "next", page === totalPages)}
    </nav>
  );
}
