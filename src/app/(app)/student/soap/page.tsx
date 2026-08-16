import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";

export default async function SoapNotePracticePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage
        title="SOAP Note Practice"
        subtitle="Build and get AI feedback on your SOAP notes."
      >
        <StudentGate toolName="SOAP Note Practice" />
      </StudentPlaceholderPage>
    );
  }

  return (
    <StudentPlaceholderPage
      title="SOAP Note Practice"
      subtitle="Coming soon, build and get AI feedback on your SOAP notes."
    />
  );
}
