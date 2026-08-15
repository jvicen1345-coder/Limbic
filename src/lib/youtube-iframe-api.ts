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

// How long to wait for the script tag to load and call back onYouTubeIframeAPIReady before
// giving up — a blocked request (ad blocker, flaky network, youtube.com unreachable) never
// fires either the script's onerror or that callback, so without a timeout the promise
// below would hang forever. See ClipSlide's catch handler in ClipsFeed.tsx for what happens
// on this timeout: it falls back to a plain clickable iframe instead of leaving the clip
// permanently unplayable.
const LOAD_TIMEOUT_MS = 8000;

/** Loads the YouTube IFrame API script exactly once (across every caller/component
 *  instance) and resolves once `window.YT.Player` is actually usable — the API signals
 *  readiness via its own `onYouTubeIframeAPIReady` global callback, not the script tag's
 *  `onload` (which only means the loader script itself downloaded, not that YT is ready).
 *  Rejects (rather than hanging forever) if the script fails to load or never calls back
 *  within LOAD_TIMEOUT_MS — a failed attempt is not cached, so the next mounted clip gets a
 *  fresh try instead of being stuck on the first failure for the rest of the page's life. */
export function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (apiPromise) return apiPromise;

  const promise = new Promise<YouTubeNamespace>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("loadYouTubeIframeApi called outside the browser"));
      return;
    }
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const timer = window.setTimeout(() => {
      reject(new Error("Timed out loading the YouTube IFrame API"));
    }, LOAD_TIMEOUT_MS);

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      window.clearTimeout(timer);
      resolve(window.YT!);
    };

    const existingTag = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (existingTag) {
      existingTag.addEventListener("error", () => {
        window.clearTimeout(timer);
        reject(new Error("Failed to load the YouTube IFrame API script"));
      });
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("Failed to load the YouTube IFrame API script"));
      };
      document.head.appendChild(tag);
    }
  });

  apiPromise = promise.catch((err) => {
    // Don't cache a failed attempt — the script tag it added (or found already present)
    // stays in the DOM, so a later successful load (network recovers, ad blocker toggled
    // off) still calls onYouTubeIframeAPIReady and resolves whatever fresh promise the next
    // ClipSlide mount creates, instead of every future clip being stuck replaying this one
    // failure forever.
    apiPromise = null;
    throw err;
  });

  return apiPromise;
}
