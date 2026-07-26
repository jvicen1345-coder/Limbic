"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ marginBottom: 16, paddingLeft: 4 }}
      onClick={() => router.back()}
    >
      <ArrowLeftIcon size={16} />
      Back
    </button>
  );
}
