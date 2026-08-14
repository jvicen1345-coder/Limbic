import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSpecialty } from "@/lib/specialty-content";
import { SpecialtyPageTemplate } from "@/components/specialty/SpecialtyPageTemplate";

export default async function PediatricsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasStudentAccess(user)) redirect("/home");

  const specialty = getSpecialty("pediatrics")!;

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
      overview={specialty.overview}
      pearls={specialty.pearls}
      specialTests={specialty.specialTests}
      outcomeMeasures={specialty.outcomeMeasures}
      documentationPearls={specialty.documentationPearls}
      questionTypes={specialty.questionTypes}
    />
  );
}
