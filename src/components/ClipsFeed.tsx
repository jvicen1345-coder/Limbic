"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  muted,
  onToggleMute,
  onEnded,
  saved,
}: {
  clip: Clip;
  slotId: string;
  active: boolean;
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

  // Read inside the API callbacks below instead of closed over — those callbacks are
  // registered once (see the mount effect) and would otherwise only ever see the `active`
  // value from that first render. Synced via an effect (not during render) since mutating
  // a ref while rendering is itself unsafe.
  const activeRef = useRef(active);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    activeRef.current = active;
    onEndedRef.current = onEnded;
  });

  const thumbUrl = youtubeThumbnailUrl(clip.url);
  // Muted, no autoplay param — playback itself is driven entirely by the YT.Player API
  // (see the effects below), not by src query params, so this URL never needs to change
  // (and therefore never reloads the iframe) as the slide activates/deactivates.
  const embedUrl = useMemo(() => youtubeEmbedUrl(clip.url, { muted: true }), [clip.url]);

  // Every clip's iframe mounts once and stays mounted for the component's whole lifetime —
  // switching the active clip pauses/plays via the API (see below) instead of unmounting,
  // which is what was leaving previously-active clips frozen (a fresh iframe with no
  // player state starts from scratch every time it remounts).
  useEffect(() => {
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
              if (activeRef.current) player?.playVideo();
            },
            onStateChange: (event) => {
              if (!cancelled && event.data === YT.PlayerState.ENDED && activeRef.current) {
                onEndedRef.current();
              }
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
  }, []);

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
        {embedUrl ? (
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
          // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domain
          <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || slots.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) return;
        const slotId = mostVisible.target.getAttribute("data-slot-id");
        if (!slotId) return;
        setActiveSlotId(slotId);

        const index = slots.findIndex((s) => s.slotId === slotId);
        if (index !== -1 && index >= slots.length - APPEND_WHEN_WITHIN && clips.length > 0) {
          setLapOrders((prev) => [...prev, shuffle(clips)]);
        }
      },
      { root: container, threshold: [0.6] }
    );

    const slides = container.querySelectorAll("[data-slot-id]");
    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [slots, clips]);

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
        {slots.map((slot) => (
          <ClipSlide
            key={slot.slotId}
            clip={slot.clip}
            slotId={slot.slotId}
            active={slot.slotId === activeSlotId}
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
