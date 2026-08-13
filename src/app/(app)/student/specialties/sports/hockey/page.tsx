import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSpecialty, getSport } from "@/lib/specialty-content";
import { SpecialtyPageTemplate } from "@/components/specialty/SpecialtyPageTemplate";

export default async function HockeyPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/home");

  const sport = getSport("hockey")!;

  return (
    <SpecialtyPageTemplate
      slug="sports"
      name={sport.name}
      description={sport.focus}
      breadcrumb={[
        { label: "Student", href: "/student" },
        { label: "Specialties", href: "/student/specialties" },
        { label: "Sports", href: "/student/specialties/sports" },
        { label: sport.name },
      ]}
      conditions={sport.conditions}
      npte={getSpecialty("sports")!.npte}
    />
  );
}
