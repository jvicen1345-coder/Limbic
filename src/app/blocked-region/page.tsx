/** Rewritten to by src/proxy.ts for any request geolocated to a blocked country — a plain,
 *  fully public page with no auth/session/DB access of its own, since a visitor landing
 *  here may not have (or be allowed to have) a valid session at all. Same centered branded
 *  layout as app/sign-in/page.tsx, just without a form. */
export default function BlockedRegionPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--color-bg)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand lockup, not a responsive content image */}
      <img src="/logo-lockup.svg" alt="Limbic — Curated Research" width={194} height={70} />
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          padding: "28px 32px",
          maxWidth: 380,
          width: "100%",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 18, margin: "0 0 8px" }}>Not available in your region</h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-neutral-700)", margin: 0 }}>
          Limbic isn&rsquo;t currently available in your region.
        </p>
      </div>
    </div>
  );
}
