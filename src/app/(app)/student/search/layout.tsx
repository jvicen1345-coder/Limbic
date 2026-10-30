import type { ReactNode } from "react";
import "@/styles/playbooks.css";

/** The search surface shares the playbooks sheet, where .libsearch-* lives beside the hub
 *  classes it sits among. See docs/css.md for why feature CSS is owned by its route layout. */
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
