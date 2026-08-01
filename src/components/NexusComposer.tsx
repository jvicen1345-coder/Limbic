"use client";

import { useRef, useTransition } from "react";
import { createNexusPostAction } from "@/app/actions/nexus";

export function NexusComposer() {
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className="card elev-sm"
      action={(formData) => {
        formRef.current?.reset();
        startTransition(() => createNexusPostAction(formData));
      }}
    >
      <textarea
        className="input"
        name="body"
        rows={3}
        placeholder="Share something with your Nexus network…"
        required
      />
      <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
        Post
      </button>
    </form>
  );
}
