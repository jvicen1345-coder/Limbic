import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";

/** Shared shell for the four not-yet-built Limbic Student Atrium paths (see
 *  app/(app)/student/slides|study|soap|wellness/page.tsx) — same warm .atrium-page palette
 *  as the Atrium itself, so navigating into one of these still feels like the same place. */
export function StudentPlaceholderPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="screen-pad atrium-page">
      <Link href="/student" className="atrium-back-link">
        <ArrowLeftIcon size={16} />
        Back to Atrium
      </Link>
      <h1 style={{ fontSize: 26, margin: "16px 0 6px" }}>{title}</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 480, lineHeight: 1.5 }}>{subtitle}</p>
      {children}
    </div>
  );
}
