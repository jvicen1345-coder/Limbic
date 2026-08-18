import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSpecialty } from "@/lib/specialty-content";
import { SpecialtyPageTemplate } from "@/components/specialty/SpecialtyPageTemplate";

export default async function MusculoskeletalPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/home");

  const specialty = getSpecialty("musculoskeletal")!;

  return (
    <SpecialtyPageTemplate
      {...specialty}
      breadcrumb={[
        { label: "Student", href: "/student" },
        { label: "Specialties", href: "/student/specialties" },
        { label: specialty.name },
      ]}
    />
  );
}
