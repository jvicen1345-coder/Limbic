import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";

export default async function StudyBuddyPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/home");

  return (
    <StudentPlaceholderPage
      title="Study Buddy"
      subtitle="Coming soon, find an anonymous study partner matched by school, cohort, and study style."
    />
  );
}
