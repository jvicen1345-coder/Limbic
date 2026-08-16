"use client";

import { useState, useTransition } from "react";
import { applyThemePreferenceLocally, type ThemePreference } from "@/lib/theme-client";
import { setThemePreferenceAction } from "@/app/actions/profile";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** A static mockup — plain HTML/CSS, not a live iframe (see .theme-preview* in globals.css)
 *  — scaled down into a clipped frame so it reads as a thumbnail of Home's actual layout:
 *  a sidebar strip, a couple of article-card placeholders, a right panel strip. Wrapped in
 *  .theme-preview--light/--dark, which redeclare the handful of --color-* tokens this
 *  markup uses with each theme's literal values (see the CSS comment) — the live
 *  html[data-theme="dark"] cascade can't be re-triggered on a nested div, only on <html>
 *  itself, so this is the only way the preview can show a theme other than whichever one
 *  the page itself currently happens to be in. */
function ThemePreview({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className="theme-preview-frame">
      <div className={`theme-preview theme-preview--${theme}`}>
        <div className="theme-preview-sidebar">
          <div className="theme-preview-sidebar-item theme-preview-sidebar-item--active" />
          <div className="theme-preview-sidebar-item" />
          <div className="theme-preview-sidebar-item" />
          <div className="theme-preview-sidebar-item" />
        </div>
        <div className="theme-preview-main">
          <div className="theme-preview-card">
            <div className="theme-preview-card-line" />
            <div className="theme-preview-card-line theme-preview-card-line--short" />
          </div>
          <div className="theme-preview-card">
            <div className="theme-preview-card-line" />
            <div className="theme-preview-card-line theme-preview-card-line--short" />
          </div>
          <div className="theme-preview-card">
            <div className="theme-preview-card-line" />
            <div className="theme-preview-card-line theme-preview-card-line--short" />
          </div>
        </div>
        <div className="theme-preview-right">
          <div className="theme-preview-right-item" />
          <div className="theme-preview-right-item" />
        </div>
      </div>
    </div>
  );
}

/** Profile's Appearance section — three Light/Dark/System cards plus a live preview that
 *  updates instantly on click (no save needed to see it — see ThemePreview above), and a
 *  Save button that commits the selection to both the database and this device's
 *  localStorage together (see lib/theme-client.ts applyThemePreferenceLocally). */
export function ThemeSection({ initialTheme }: { initialTheme: ThemePreference }) {
  const [selected, setSelected] = useState<ThemePreference>(initialTheme);
  const [saved, setSaved] = useState<ThemePreference>(initialTheme);
  const [pending, startTransition] = useTransition();

  // "System" always previews as dark, per its own caption below — there's no meaningful
  // "light vs dark" distinction to show for a setting that's defined as "whatever the
  // device says," so this just needs to prove the preview panel works for that option too.
  const previewTheme: "light" | "dark" = selected === "dark" || selected === "system" ? "dark" : "light";

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Appearance</div>

      <div className="theme-cards">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={selected === opt.value ? "theme-card theme-card--selected" : "theme-card"}
            aria-pressed={selected === opt.value}
            onClick={() => setSelected(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ThemePreview theme={previewTheme} />
      {selected === "system" && (
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "6px 0 0" }}>
          Matches your device setting
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 16 }}
        disabled={pending || selected === saved}
        onClick={() => {
          startTransition(async () => {
            applyThemePreferenceLocally(selected);
            await setThemePreferenceAction(selected);
            setSaved(selected);
          });
        }}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
