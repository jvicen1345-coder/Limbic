import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";

export default async function StudentWellnessPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/");

  return (
    <StudentPlaceholderPage
      title="Mental Wellness"
      subtitle="PT school is demanding. You don't have to navigate it alone."
    >
      <div className="atrium-dashboard-card" style={{ maxWidth: 480, marginTop: 20 }}>
        <div className="atrium-dashboard-title">Crisis Support</div>
        <p className="atrium-dashboard-body">
          988 Suicide &amp; Crisis Lifeline — call or text <strong>988</strong>, available 24/7.
        </p>
      </div>
      <div className="atrium-dashboard-card" style={{ maxWidth: 480, marginTop: 14 }}>
        <div className="atrium-dashboard-title">Managing Study Stress</div>
        <p className="atrium-dashboard-body">
          Short, regular breaks beat marathon study sessions. A consistent sleep schedule protects
          memory consolidation more than an extra late night of cramming. It&rsquo;s normal for PT
          school to feel overwhelming at times — reaching out to classmates or faculty early tends
          to help more than waiting until things pile up.
        </p>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)", marginTop: 16, maxWidth: 480 }}>
        Anonymous and private — your activity here is never shared.
      </p>
    </StudentPlaceholderPage>
  );
}
