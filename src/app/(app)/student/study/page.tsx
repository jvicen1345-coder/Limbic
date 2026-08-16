import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";

export default async function StudyBuddyPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage
        title="Study Buddy"
        subtitle="Find an anonymous study partner matched by school, cohort, and study style."
      >
        <StudentGate toolName="Study Buddy" />
      </StudentPlaceholderPage>
    );
  }

  return (
    <StudentPlaceholderPage
      title="Study Buddy"
      subtitle="Coming soon, find an anonymous study partner matched by school, cohort, and study style."
    />
  );
}
