"use client";

import { useState } from "react";
import { signInAction, signInGeneralAction, signInGuestAction } from "@/app/actions/auth";

const TABS = [
  { id: "pt" as const, label: "Physical Therapist" },
  { id: "general" as const, label: "General" },
];

export function SignInForm({ states }: { states: string[] }) {
  const [mode, setMode] = useState<"pt" | "general">("pt");

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 380,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        padding: 32,
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        role="tablist"
        aria-label="Sign-in type"
        style={{ display: "flex", gap: 4, background: "var(--color-neutral-100)", borderRadius: "var(--radius-md)", padding: 3 }}
      >
        {TABS.map((t) => {
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(t.id)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "8px 10px",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                background: active ? "var(--color-surface)" : "transparent",
                color: active ? "var(--color-text)" : "var(--color-neutral-700)",
                boxShadow: active ? "var(--shadow-sm)" : "none",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {mode === "pt" ? (
        <form action={signInAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
            Sign in with your license to track renewals and CE requirements alongside your feed.
          </p>

          <div className="field">
            <label htmlFor="li-number">License number</label>
            <input className="input" id="li-number" name="number" placeholder="PT-48213" />
          </div>
          <div className="field">
            <label htmlFor="li-state">Issuing state</label>
            <select className="input" id="li-state" name="state" defaultValue="California">
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input className="input" id="li-email" name="email" type="email" placeholder="you@clinic.com" />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
          <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
            Demo sign-in — any license number works.
          </p>
        </form>
      ) : (
        <form action={signInGeneralAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
            Not a licensed PT? Sign in with just your email to read, search, and save articles and
            personalize your profile.
          </p>

          <div className="field">
            <label htmlFor="general-email">Email</label>
            <input className="input" id="general-email" name="generalEmail" type="email" placeholder="you@example.com" required />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
          <button type="submit" formAction={signInGuestAction} className="btn btn-ghost btn-block">
            Continue as guest
          </button>
          <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
            Demo sign-in — any email works. Signing in again with the same email returns to your
            saved articles and profile.
          </p>
        </form>
      )}
    </div>
  );
}
