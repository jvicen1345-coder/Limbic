"use client";

import dynamic from "next/dynamic";
import type { Clip } from "@/lib/types";

const ClipsFeed = dynamic(() => import("@/components/clips/ClipsFeed").then((module) => module.ClipsFeed), {
  loading: () => (
    <div role="status" aria-label="Loading Clips feed" aria-busy="true" style={{ minHeight: "70vh" }} />
  ),
});

export function ClipsFeedLoader({ clips, savedClipIds }: { clips: Clip[]; savedClipIds: string[] }) {
  return <ClipsFeed clips={clips} savedClipIds={savedClipIds} />;
}
