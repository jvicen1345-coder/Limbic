import { LogoIcon } from "@/components/icons";
import { LegalBackButton } from "@/components/LegalBackButton";

/** Shared chrome for /terms and /privacy — outside the (app) route group like
 *  /founding-funders, so this renders with no sidebar. Unlike that page, this one matches
 *  the main app's own design system (plain --color-* tokens, standard fonts) rather than
 *  a bespoke palette, and isn't sign-in gated — both pages need to be readable by a
 *  signed-out visitor arriving from the sign-in screen's "Terms of Service" link. */
export function LegalPageLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="legal-page">
      <LegalBackButton />
      <div className="legal-container">
        <div className="legal-header">
          <LogoIcon size={24} />
          <span className="legal-header-name">Limbic</span>
        </div>
        <h1 className="legal-title">{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
        {children}
      </div>
    </div>
  );
}
