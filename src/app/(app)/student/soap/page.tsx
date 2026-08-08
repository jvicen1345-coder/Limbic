import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";

export default async function SoapNotePracticePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!isStudentEmail(user.email)) redirect("/");

  return (
    <StudentPlaceholderPage
      title="SOAP Note Practice"
      subtitle="Coming soon — build and get AI feedback on your SOAP notes."
    />
  );
}
