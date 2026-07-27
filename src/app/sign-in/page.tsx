import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { STATES } from "@/lib/meta";
import { LogoIcon } from "@/components/icons";
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LogoIcon size={24} />
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>Limbic</span>
      </div>
      <SignInForm states={STATES} />
    </div>
  );
}
