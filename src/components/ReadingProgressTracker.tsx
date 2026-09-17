"use client";

import { useEffect, useRef } from "react";
import { updateReadingProgressAction } from "@/app/actions/reading";
import {
  MIN_PROGRESS_DELTA,
  reportedScrollProgress,
  SEND_DEBOUNCE_MS,
  SHORT_ARTICLE_DWELL_MS,
} from "@/lib/reading-progress";

/** Invisible — mounted on the article page (see app/(app)/article/[id]/page.tsx) purely to
 *  report how far the reader has scrolled, for the Home page "Continue Reading" card (see
 *  components/ContinueReadingCard.tsx). .app-main, not window, is this app's real scroll
 *  container (see src/styles) — everything here reads/listens on that element instead. */
export function ReadingProgressTracker({ articleId }: { articleId: string }) {
  const lastSentRef = useRef(0);

  useEffect(() => {
    const scrollEl = document.querySelector(".app-main");
    if (!scrollEl) return;

    lastSentRef.current = 0;
    let debounceHandle: ReturnType<typeof setTimeout> | null = null;
    let dwellHandle: ReturnType<typeof setTimeout> | null = null;
    let engaged = false;

    function computeProgress() {
      return reportedScrollProgress({
        scrollHeight: scrollEl!.scrollHeight,
        clientHeight: scrollEl!.clientHeight,
        scrollTop: scrollEl!.scrollTop,
        engaged,
      });
    }

    function send(progress: number) {
      lastSentRef.current = progress;
      updateReadingProgressAction(articleId, progress);
    }

    function markEngaged() {
      if (engaged) return;
      engaged = true;
      const progress = computeProgress();
      if (progress > lastSentRef.current) send(progress);
    }

    function handleScroll() {
      markEngaged();
      if (debounceHandle) clearTimeout(debounceHandle);
      debounceHandle = setTimeout(() => {
        const progress = computeProgress();
        if (progress - lastSentRef.current >= MIN_PROGRESS_DELTA) send(progress);
      }, SEND_DEBOUNCE_MS);
    }

    dwellHandle = setTimeout(markEngaged, SHORT_ARTICLE_DWELL_MS);
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      if (debounceHandle) clearTimeout(debounceHandle);
      if (dwellHandle) clearTimeout(dwellHandle);
      // Flush unconditionally (no MIN_PROGRESS_DELTA gate) on navigating away, so a small
      // final move right before leaving isn't lost just because it didn't clear the
      // in-session throttling threshold. No-scroll-room articles still need engagement
      // (computeProgress stays 0 until then), so an open-and-leave does not write 1.0.
      const progress = computeProgress();
      if (progress > lastSentRef.current) send(progress);
    };
  }, [articleId]);

  return null;
}
