import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Separator-delimited trail for the specialty track pages (student → specialties → …) —
 *  distinct from .atrium-back-link's single "go back" link used elsewhere in Limbic
 *  Student, since these pages sit two or three levels deep and need the full path shown. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="specialty-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="specialty-breadcrumb-item">
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="specialty-breadcrumb-current" aria-current="page">
              {item.label}
            </span>
          )}
          {i < items.length - 1 && <span className="specialty-breadcrumb-sep">/</span>}
        </span>
      ))}
    </nav>
  );
}
