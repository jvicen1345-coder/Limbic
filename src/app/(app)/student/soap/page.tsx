import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";

export default async function SoapNotePracticePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/");

  return (
    <StudentPlaceholderPage
      title="SOAP Note Practice"
      subtitle="Coming soon — build and get AI feedback on your SOAP notes."
    />
  );
}
