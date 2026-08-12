/** Minimal hand-rolled surface for the YouTube IFrame Player API — just the pieces
 *  components/ClipsFeed.tsx needs (play/pause/mute state and end-of-video detection).
 *  No @types/youtube package is installed, so this is typed by hand rather than pulling
 *  in a new dependency for a handful of methods. */
export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

interface YouTubePlayerEvent {
  data: number;
  target: YouTubePlayer;
}

interface YouTubeNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeNamespace> | null = null;

/** Loads the YouTube IFrame API script exactly once (across every caller/component
 *  instance) and resolves once `window.YT.Player` is actually usable — the API signals
 *  readiness via its own `onYouTubeIframeAPIReady` global callback, not the script tag's
 *  `onload` (which only means the loader script itself downloaded, not that YT is ready). */
export function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT!);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });

  return apiPromise;
}
