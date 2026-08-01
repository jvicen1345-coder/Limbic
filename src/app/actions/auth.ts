"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signInWithLicense, signInWithEmail, signOutSession } from "@/lib/session";

export async function signInAction(formData: FormData) {
  const number = String(formData.get("number") ?? "");
  const state = String(formData.get("state") ?? "California");
  const email = String(formData.get("email") ?? "");
  await signInWithLicense({ number, state, email });
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInGeneralAction(formData: FormData) {
  const email = String(formData.get("generalEmail") ?? "");
  await signInWithEmail({ email });
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  await signOutSession();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
