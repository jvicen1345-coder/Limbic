"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ClipSaveButton } from "@/components/ClipSaveButton";
import { RefreshClipsButton } from "@/components/RefreshClipsButton";
import { markClipSeenAction } from "@/app/actions/clips";
import { VolumeIcon, VolumeMuteIcon, ExternalLinkIcon } from "@/components/icons";
import { SPECIALTY_META, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/meta";
import { shuffle } from "@/lib/shuffle";
import { loadYouTubeIframeApi, type YouTubePlayer } from "@/lib/youtube-iframe-api";
import type { Clip } from "@/lib/types";

// The curated clip list is small and finite, so a continuous ("for you"-style) feed loops
// it rather than dead-ending — each time the reader scrolls within this many slides of the
// end, another lap is appended. `clips` already arrives ordered never-seen-first for this
// visit (see lib/clip-rotation.ts orderClipsForUser); each additional lap is a fresh
// shuffle rather than repeating the exact same sequence, so looping doesn't feel like the
// same fixed loop every time either.
const APPEND_WHEN_WITHIN = 2;

// How many slides on either side of the active one keep a real, live YouTube iframe/player
// mounted — everything further away renders just a thumbnail image instead (see the
// `mounted` prop below). Without this cap, ClipSlide's old "mount once, never unmount"
// design meant a long scroll session accumulated one live YouTube player per clip ever
// scrolled past, forever — on an intentionally infinite-looping feed, that's unbounded
// growth, and a real report of it crashing the tab entirely ("a problem repeatedly
// occurred") on mobile Safari after enough scrolling. A window of 2 keeps at most 5
// simultaneously-live players (active plus 2 each direction) regardless of how many laps
// have been scrolled through, while still preloading enough neighbors that scrolling one
// slide in either direction never has to wait for a fresh iframe/player to spin up.
const MOUNT_WINDOW = 2;

interface ClipSlot {
  clip: Clip;
  /** Unique per physical slide (clip id + lap number) — the clip can repeat across laps,
   *  but each rendered slide still needs an identity of its own for the intersection
   *  observer and autoplay targeting. */
  slotId: string;
}

function ClipSlide({
  clip,
  slotId,
  active,
  mounted,
  muted,
  onToggleMute,
  onEnded,
  saved,
}: {
  clip: Clip;
  slotId: string;
  active: boolean;
  /** False once this slide scrolls more than MOUNT_WINDOW away from the active one — tears
   *  down the live iframe/player and falls back to a static thumbnail (see the mount effect
   *  and render branch below) so a long scroll session doesn't accumulate one live YouTube
   *  player per clip ever visited. */
  mounted: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onEnded: () => void;
  saved: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  // Set when loadYouTubeIframeApi() rejects (blocked script, network failure, timeout —
  // see lib/youtube-iframe-api.ts) — without the API, playback can never be driven
  // programmatically, so the iframe falls back to native YouTube controls (see the
  // pointerEvents toggle below) instead of sitting there frozen and unclickable forever.
  const [apiFailed, setApiFailed] = useState(false);
  // Set on the player's own onError event — distinct from apiFailed: the IFrame API loaded
  // and this player initialized fine, but this specific video can't actually be played
  // embedded (owner disabled embedding, video is private/removed, etc — YouTube error codes
  // 101/150/100/... see the onError handler below). That plays fine at youtube.com directly
  // (nothing wrong with the video itself or the reader's browser) but renders as a blank/
  // black box forever inside our iframe with no visible error, since native controls are
  // hidden here (pointer-events: none) — falls back to the thumbnail image instead once set.
  const [playbackError, setPlaybackError] = useState(false);

  // Read inside the API callbacks below instead of closed over — those callbacks are
  // registered once per mount (see the effect below, keyed on `mounted`) and would
  // otherwise only ever see the `active` value from that registration. Synced via an effect
  // (not during render) since mutating a ref while rendering is itself unsafe.
  const activeRef = useRef(active);
  const onEndedRef = useRef(onEnded);
  const clipUrlRef = useRef(clip.url);
  useEffect(() => {
    activeRef.current = active;
    onEndedRef.current = onEnded;
    clipUrlRef.current = clip.url;
  });

  const thumbUrl = youtubeThumbnailUrl(clip.url);
  // Muted, no autoplay param — playback itself is driven entirely by the YT.Player API
  // (see the effects below), not by src query params, so this URL never needs to change
  // (and therefore never reloads the iframe) as the slide activates/deactivates.
  const embedUrl = useMemo(() => youtubeEmbedUrl(clip.url, { muted: true }), [clip.url]);

  // Mounts a fresh iframe/player whenever this slide enters the MOUNT_WINDOW (including on
  // first render, if it's already within it) and tears it back down the moment it leaves —
  // switching the *active* clip within that window still just pauses/plays via the API
  // (see the effect below) rather than remounting, which is what was leaving previously-
  // active-but-still-nearby clips frozen. Only slides actually leaving the window pay the
  // teardown/rebuild cost, not every scroll.
  useEffect(() => {
    if (!mounted) {
      // No setState here — this branch runs synchronously within the effect, and stale
      // playerReady/apiFailed values are harmless while torn down (playerRef is null, so
      // the active/muted sync effects below no-op via optional chaining regardless). Both
      // get corrected for real the moment this slide re-enters the window and the API
      // promise below settles again.
      playerRef.current?.destroy();
      playerRef.current = null;
      return;
    }
    if (!iframeRef.current) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !iframeRef.current) return;
        player = new YT.Player(iframeRef.current, {
          events: {
            onReady: () => {
              if (cancelled) return;
              setPlayerReady(true);
              setApiFailed(false);
              setPlaybackError(false);
              if (activeRef.current) player?.playVideo();
            },
            onStateChange: (event) => {
              if (!cancelled && event.data === YT.PlayerState.ENDED && activeRef.current) {
                onEndedRef.current();
              }
            },
            // Fires for e.g. error 101/150 (embedding disabled by the video's owner), 100
            // (video removed/private), 2 (bad video id) — all cases where the video plays
            // fine at youtube.com directly but can never play inside this iframe, so no
            // amount of retrying helps. Falls back to the thumbnail (see the render branch
            // below) instead of leaving a dead black box with no visible explanation.
            onError: (event) => {
              if (cancelled) return;
              console.error("[clips] YouTube playback error for", clipUrlRef.current, "code:", event.data);
              setPlaybackError(true);
            },
          },
        });
        playerRef.current = player;
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[clips] YouTube IFrame API failed to load, falling back to native controls:", err);
        setApiFailed(true);
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mounted]);

  // Plays/pauses the already-mounted player as the active slide changes, rather than
  // mounting/unmounting the iframe itself.
  useEffect(() => {
    if (!playerReady) return;
    if (active) playerRef.current?.playVideo();
    else playerRef.current?.pauseVideo();
  }, [active, playerReady]);

  useEffect(() => {
    if (!playerReady) return;
    if (muted) playerRef.current?.mute();
    else playerRef.current?.unMute();
  }, [muted, playerReady]);

  const handleMuteClick = (e: React.MouseEvent) => {
    // .clip-media and .clip-overlay are siblings, so this click can't actually bubble into
    // .clip-media's own onClick — stopped anyway per the DOM-isolation requirement, and so
    // this handler stays a pure "toggle mute, nothing else" action even if the markup
    // around it changes later.
    e.stopPropagation();
    e.preventDefault();
    onToggleMute();
  };

  return (
    <section className="clip-slide" data-slot-id={slotId}>
      <div className="clip-media" onClick={onToggleMute}>
        {mounted && embedUrl && !playbackError ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={clip.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            // pointer-events: none keeps every tap on the video going to this div's own
            // onClick (our mute toggle) instead of landing inside the iframe's own
            // browsing context, which would otherwise silently swallow the click (never
            // reaching our handler at all) and show YouTube's own big play/pause icon.
            // Re-enabled when the IFrame API failed to load (see the mount effect above):
            // with no API, nothing ever calls playVideo() for this clip, so native taps
            // reaching YouTube's own play button are the only way it plays at all.
            style={{ width: "100%", height: "100%", border: "none", pointerEvents: apiFailed ? "auto" : "none" }}
          />
        ) : thumbUrl ? (
          <Image src={thumbUrl} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#000" }} />
        )}
      </div>

      <div className="clip-overlay">
        <div className="clip-info">
          <span className="tag tag-accent-2" style={{ marginBottom: 8 }}>
            {SPECIALTY_META[clip.specialty]}
          </span>
          <div className="clip-title">{clip.title}</div>
          <div className="clip-source">{clip.source}</div>
        </div>

        <div className="clip-actions">
          <button type="button" className="clip-action-btn" onClick={handleMuteClick} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeMuteIcon size={20} /> : <VolumeIcon size={20} />}
          </button>
          <ClipSaveButton clip={clip} saved={saved} />
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="clip-action-btn"
            aria-label="Open in YouTube"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function ClipsFeed({ clips, savedClipIds }: { clips: Clip[]; savedClipIds: string[] }) {
  // lap 0 is exactly the server-provided order (never-seen-first for this visit — see
  // lib/clip-rotation.ts); each additional lap (appended directly by the intersection
  // observer below, as the reader nears the end) gets its own fresh shuffle, generated
  // once and cached here rather than recomputed on every render, so laps already scrolled
  // past never silently reorder underneath the reader.
  // clips arrives fresh from the server on every navigation to /clips — a distinct route,
  // so this component fully unmounts and remounts rather than receiving an updated prop —
  // meaning lazy-initializing state from it here is enough, with no separate reset needed
  // for a prop change that doesn't happen in practice.
  const [lapOrders, setLapOrders] = useState<Clip[][]>(() => (clips.length ? [clips] : []));
  const [activeSlotId, setActiveSlotId] = useState<string | null>(clips[0] ? `${clips[0].id}__0` : null);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const slots = useMemo(() => {
    const out: ClipSlot[] = [];
    lapOrders.forEach((order, lap) => {
      for (const clip of order) out.push({ clip, slotId: `${clip.id}__${lap}` });
    });
    return out;
  }, [lapOrders]);

  const activeIndex = useMemo(() => slots.findIndex((s) => s.slotId === activeSlotId), [slots, activeSlotId]);

  // Read inside the observer callback below instead of closed over, so the observer itself
  // (created once — see the next effect) always sees the latest lap without needing to be
  // recreated every time one is appended.
  const slotsRef = useRef(slots);
  const clipsRef = useRef(clips);
  useEffect(() => {
    slotsRef.current = slots;
    clipsRef.current = clips;
  });

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Creates the IntersectionObserver exactly once for the page's lifetime, not once per lap
  // appended. Recreating it on every `slots` change (the previous approach) re-observed
  // every slide from scratch each time — IntersectionObserver fires an immediate callback
  // for any element that already satisfies the threshold the moment observe() is called on
  // it, so the still-active slide re-fired on every single recreation. Wasteful at best;
  // avoiding it also rules out any risk of the still-active slide's repeated re-fire
  // nudging the append check (below) into triggering more laps than the reader actually
  // scrolled to.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) return;
        const slotId = mostVisible.target.getAttribute("data-slot-id");
        if (!slotId) return;
        setActiveSlotId(slotId);

        const currentSlots = slotsRef.current;
        const currentClips = clipsRef.current;
        const index = currentSlots.findIndex((s) => s.slotId === slotId);
        if (index !== -1 && index >= currentSlots.length - APPEND_WHEN_WITHIN && currentClips.length > 0) {
          setLapOrders((prev) => [...prev, shuffle(currentClips)]);
        }
      },
      { root: container, threshold: [0.6] }
    );
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Observes only newly-appended slides as new laps arrive, instead of re-observing
  // everything (which is what caused the cascade described above) — `slots` only ever
  // grows and never reorders, so a simple "how many have been observed so far" count is
  // enough to find just the delta each time.
  const observedCountRef = useRef(0);
  useEffect(() => {
    const container = containerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;
    const slides = container.querySelectorAll("[data-slot-id]");
    for (let i = observedCountRef.current; i < slides.length; i++) {
      observer.observe(slides[i]);
    }
    observedCountRef.current = slides.length;
  }, [slots]);

  // Marks the active clip "seen" (fire-and-forget) so the ordering on the next visit puts
  // it after whatever's still unseen — only fires on an actual change of active clip, not
  // on every intersection-observer callback for the same one.
  useEffect(() => {
    const active = slots.find((s) => s.slotId === activeSlotId);
    if (active) markClipSeenAction(active.clip.id);
  }, [activeSlotId, slots]);

  // Same scroll target/behavior a manual swipe already lands on (scroll-snap handles the
  // rest) — just triggered by the video ending instead of a touch gesture.
  const advanceToNext = (slotId: string) => {
    const container = containerRef.current;
    if (!container) return;
    const index = slots.findIndex((s) => s.slotId === slotId);
    if (index === -1) return;
    const nextSlot = slots[index + 1];
    if (!nextSlot) return;
    container.querySelector(`[data-slot-id="${CSS.escape(nextSlot.slotId)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="clips-feed-wrap">
      <div className="clips-feed" ref={containerRef}>
        {slots.map((slot, i) => (
          <ClipSlide
            key={slot.slotId}
            clip={slot.clip}
            slotId={slot.slotId}
            active={slot.slotId === activeSlotId}
            mounted={activeIndex === -1 || Math.abs(i - activeIndex) <= MOUNT_WINDOW}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onEnded={() => advanceToNext(slot.slotId)}
            saved={savedClipIds.includes(slot.clip.id)}
          />
        ))}
      </div>
      <div className="clips-refresh-wrap">
        <RefreshClipsButton />
      </div>
    </div>
  );
}
