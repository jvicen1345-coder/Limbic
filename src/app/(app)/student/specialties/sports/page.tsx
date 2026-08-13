import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSpecialty, SPORTS } from "@/lib/specialty-content";
import { SpecialtyPageTemplate } from "@/components/specialty/SpecialtyPageTemplate";

export default async function SportsSpecialtyPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/home");

  const specialty = getSpecialty("sports")!;

  return (
    <SpecialtyPageTemplate
      slug={specialty.slug}
      name={specialty.name}
      description={specialty.description}
      breadcrumb={[
        { label: "Student", href: "/student" },
        { label: "Specialties", href: "/student/specialties" },
        { label: specialty.name },
      ]}
      conditions={specialty.conditions}
      npte={specialty.npte}
      sports={SPORTS}
    />
  );
}
