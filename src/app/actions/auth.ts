"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signInWithEmail, signOutSession } from "@/lib/session";

// The "Physical Therapist" tab's own action, kept distinct from signInGeneralAction below
// since its form field is still named "email" (not "generalEmail") and its copy/intent
// differ — but both now just sign in by email; there's no license collected at sign-in
// anymore (see components/AddLicenseModal.tsx for where that moved).
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  await signInWithEmail({ email });
  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signInGeneralAction(formData: FormData) {
  const email = String(formData.get("generalEmail") ?? "");
  await signInWithEmail({ email });
  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signOutAction() {
  await signOutSession();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
