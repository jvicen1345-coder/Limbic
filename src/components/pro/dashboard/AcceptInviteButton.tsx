"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptClinicInvite } from "@/app/actions/clinic-pro";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptClinicInvite(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/pro/dashboard");
    });
  };

  return (
    <>
      {error && <p style={{ fontSize: 12.5, color: "var(--color-danger)", margin: "0 0 10px" }}>{error}</p>}
      <button type="button" className="btn btn-primary btn-block" disabled={pending} onClick={handleAccept}>
        {pending ? "Joining…" : "Accept Invitation"}
      </button>
    </>
  );
}
