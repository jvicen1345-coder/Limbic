import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { STATES } from "@/lib/meta";
import { SignInForm } from "@/components/SignInForm";

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

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
      <img src="/logo-lockup.svg" alt="Limbic — Curated Research" width={260} height={70} />
      <p
        style={{
          fontSize: 13,
          color: "var(--color-neutral-700)",
          textAlign: "center",
          maxWidth: 280,
          margin: "-8px 0 4px",
        }}
      >
        Empowering clinicians with personalized knowledge to advance healthcare.
      </p>
      <SignInForm states={STATES} />
    </div>
  );
}
