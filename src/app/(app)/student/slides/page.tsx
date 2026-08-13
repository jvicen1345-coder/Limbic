import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { FileTextIcon } from "@/components/icons";

export default async function SlidesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/home");

  return (
    <StudentPlaceholderPage
      title="Slide Breakdown"
      subtitle="Coming soon, upload your lecture slides and get summaries, key concepts, and practice questions."
    >
      <div className="atrium-upload-placeholder">
        <FileTextIcon size={28} />
        <span>Drag and drop slides here</span>
      </div>
    </StudentPlaceholderPage>
  );
}
