import type { ReactNode } from "react";
import "@/styles/article.css";
import { NewsSectionTabs } from "@/components/shell/SectionTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <NewsSectionTabs />
      {children}
    </>
  );
}
