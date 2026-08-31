"use client";

import { useRef, useState, useTransition } from "react";
import { createNexusPostAction } from "@/app/actions/nexus";
import { compressImageToDataUrl } from "@/lib/media-upload";
import { Avatar } from "@/components/Avatar";
import { FilmIcon, ImageIcon, FileTextIcon, XIcon } from "@/components/icons";
import { youtubeVideoId } from "@/lib/meta";

type Mode = "text" | "photo" | "video" | "article";

const MAX_IMAGES = 4;

const MODE_META: Record<Exclude<Mode, "text">, { label: string; icon: typeof FilmIcon; color: string }> = {
  video: { label: "Video", icon: FilmIcon, color: "#5b8def" },
  photo: { label: "Photo", icon: ImageIcon, color: "#4caf7d" },
  article: { label: "Write article", icon: FileTextIcon, color: "#e0793e" },
};

export function NexusComposer({ authorName }: { authorName: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [body, setBody] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [pending, startTransition] = useTransition();

  function openComposer(nextMode: Mode) {
    // Switching modes (including while already expanded) clears whatever was mode-specific
    // to the PREVIOUS mode — a photo picked for a photo post shouldn't silently become an
    // article's cover photo — but keeps the caption/body text, since that reads fine across
    // modes and losing it on an accidental double-click would be a worse surprise.
    setMode(nextMode);
    setExpanded(true);
    setArticleTitle("");
    setVideoUrlInput("");
    setImages([]);
  }

  function reset() {
    setExpanded(false);
    setMode("text");
    setBody("");
    setArticleTitle("");
    setVideoUrlInput("");
    setImages([]);
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const room = (mode === "article" ? 1 : MAX_IMAGES) - images.length;
    const files = Array.from(fileList).slice(0, Math.max(room, 0));
    if (files.length === 0) return;
    setCompressing(true);
    try {
      const compressed = await Promise.all(files.map(compressImageToDataUrl));
      setImages((prev) => (mode === "article" ? compressed.slice(0, 1) : [...prev, ...compressed].slice(0, MAX_IMAGES)));
    } finally {
      setCompressing(false);
    }
  }

  const trimmedVideoUrl = videoUrlInput.trim();
  const videoIsValid = trimmedVideoUrl.length === 0 || youtubeVideoId(trimmedVideoUrl) != null;

  const canSubmit =
    !pending &&
    !compressing &&
    (mode === "text"
      ? body.trim().length > 0
      : mode === "photo"
        ? images.length > 0
        : mode === "video"
          ? youtubeVideoId(trimmedVideoUrl) != null
          : articleTitle.trim().length > 0 && body.trim().length > 0);

  return (
    <div className="card elev-sm">
      <div style={{ display: "flex", gap: 10, alignItems: expanded ? "flex-start" : "center" }}>
        <Avatar name={authorName} size={38} />
        {!expanded ? (
          <button
            type="button"
            className="input"
            style={{ flex: 1, textAlign: "left", cursor: "pointer", color: "var(--color-neutral-700)" }}
            onClick={() => openComposer("text")}
          >
            Start a post
          </button>
        ) : (
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {mode === "article" && (
              <input
                className="input"
                placeholder="Article title"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                style={{ fontFamily: "var(--font-heading)", fontSize: 16 }}
                autoFocus
              />
            )}
            <textarea
              className="input"
              rows={mode === "article" ? 8 : 3}
              placeholder={
                mode === "article"
                  ? "Write your article…"
                  : mode === "photo"
                    ? "Add a caption…"
                    : mode === "video"
                      ? "Say something about this video…"
                      : "Share something with your Nexus network…"
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              autoFocus={mode !== "article"}
            />

            {mode === "video" && (
              <input
                className="input"
                placeholder="Paste a YouTube link"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                style={!videoIsValid ? { borderColor: "var(--color-danger, #c0392b)" } : undefined}
              />
            )}
            {mode === "video" && !videoIsValid && (
              <div style={{ fontSize: 12, color: "var(--color-danger, #c0392b)" }}>That doesn&apos;t look like a YouTube link.</div>
            )}

            {(mode === "photo" || mode === "article") && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {images.map((url, i) => (
                  <div key={i} style={{ position: "relative", width: 84, height: 84 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- data-URL preview thumbnail */}
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "var(--color-text)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      aria-label="Remove photo"
                    >
                      <XIcon size={11} />
                    </button>
                  </div>
                ))}
                {images.length < (mode === "article" ? 1 : MAX_IMAGES) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: 84, height: 84, flexDirection: "column", gap: 4, fontSize: "var(--fs-11)" }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressing}
                  >
                    <ImageIcon size={18} />
                    {compressing ? "Processing…" : mode === "article" ? "Cover photo" : "Add photos"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={mode === "photo"}
                  hidden
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canSubmit}
                onClick={() => {
                  const formData = new FormData();
                  formData.set("type", mode);
                  formData.set("body", body.trim());
                  formData.set("articleTitle", articleTitle.trim());
                  formData.set("videoUrl", trimmedVideoUrl);
                  formData.set("imageUrls", JSON.stringify(images));
                  reset();
                  startTransition(() => createNexusPostAction(formData));
                }}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--color-divider)" }}>
        {(Object.entries(MODE_META) as [Mode, (typeof MODE_META)[Exclude<Mode, "text">]][]).map(([m, meta]) => {
          const Icon = meta.icon;
          const active = expanded && mode === m;
          return (
            <button
              key={m}
              type="button"
              className="btn btn-ghost"
              style={{ flex: 1, gap: 6, color: meta.color, background: active ? "var(--color-neutral-100)" : undefined }}
              onClick={() => openComposer(m)}
            >
              <Icon size={17} />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
