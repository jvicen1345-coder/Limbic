"use client";

import { useEffect, useRef } from "react";
import { updateReadingProgressAction } from "@/app/actions/reading";

const SEND_DEBOUNCE_MS = 600;
const MIN_PROGRESS_DELTA = 0.02;

/** Invisible — mounted on the article page (see app/(app)/article/[id]/page.tsx) purely to
 *  report how far the reader has scrolled, for the Home page "Continue Reading" card (see
 *  components/ContinueReadingCard.tsx). .app-main, not window, is this app's real scroll
 *  container (see globals.css) — everything here reads/listens on that element instead. */
export function ReadingProgressTracker({ articleId }: { articleId: string }) {
  const lastSentRef = useRef(0);

  useEffect(() => {
    const scrollEl = document.querySelector(".app-main");
    if (!scrollEl) return;

    lastSentRef.current = 0;
    let debounceHandle: ReturnType<typeof setTimeout> | null = null;

    function computeProgress() {
      const scrollable = scrollEl!.scrollHeight - scrollEl!.clientHeight;
      // No scroll room at all (a short article on a tall screen) counts as fully read —
      // there's nothing further for the reader to reach.
      return scrollable <= 0 ? 1 : Math.max(0, Math.min(1, scrollEl!.scrollTop / scrollable));
    }

    function send(progress: number) {
      lastSentRef.current = progress;
      updateReadingProgressAction(articleId, progress);
    }

    function handleScroll() {
      if (debounceHandle) clearTimeout(debounceHandle);
      debounceHandle = setTimeout(() => {
        const progress = computeProgress();
        if (progress - lastSentRef.current >= MIN_PROGRESS_DELTA) send(progress);
      }, SEND_DEBOUNCE_MS);
    }

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      if (debounceHandle) clearTimeout(debounceHandle);
      // Flush unconditionally (no MIN_PROGRESS_DELTA gate) on navigating away, so a small
      // final move right before leaving isn't lost just because it didn't clear the
      // in-session throttling threshold.
      const progress = computeProgress();
      if (progress > lastSentRef.current) send(progress);
    };
  }, [articleId]);

  return null;
}
