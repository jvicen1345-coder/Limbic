"use client";

import { useState, useTransition } from "react";
import { toggleTopicAction } from "@/app/actions/profile";

export function TopicChip({ topic, followed }: { topic: string; followed: boolean }) {
  const [optimistic, setOptimistic] = useState(followed);
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={optimistic ? "tag tag-accent-2 filter-chip" : "tag tag-outline filter-chip"}
      onClick={() => {
        setOptimistic((v) => !v);
        startTransition(() => {
          toggleTopicAction(topic);
        });
      }}
    >
      {topic}
    </button>
  );
}
