"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleNexusLikeAction, addNexusCommentAction } from "@/app/actions/nexus";
import { Avatar } from "@/components/Avatar";
import { HeartIcon, MessageCircleIcon, ExternalLinkIcon } from "@/components/icons";
import { TimeAgo } from "@/components/TimeAgo";
import { youtubeEmbedUrl } from "@/lib/meta";

export interface NexusPostComment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface NexusPostData {
  id: string;
  type: string;
  body: string;
  articleTitle: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  sourceUrl: string | null;
  sourceLabel: string | null;
  createdAt: string;
  author: { id: string; name: string; headline: string | null };
  likeCount: number;
  likedByMe: boolean;
  comments: NexusPostComment[];
}

const ARTICLE_PREVIEW_LENGTH = 260;

export function NexusPostCard({ post, currentUserName }: { post: NexusPostData; currentUserName: string }) {
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liked, setLiked] = useState(post.likedByMe);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentDraft, setCommentDraft] = useState("");
  const [articleExpanded, setArticleExpanded] = useState(false);
  const [, startTransition] = useTransition();

  const embedUrl = post.type === "video" ? youtubeEmbedUrl(post.videoUrl ?? "") : null;
  const isLongArticle = post.type === "article" && post.body.length > ARTICLE_PREVIEW_LENGTH;
  const articleBody = isLongArticle && !articleExpanded ? `${post.body.slice(0, ARTICLE_PREVIEW_LENGTH)}…` : post.body;

  return (
    <div className="card elev-sm">
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={`/nexus/profile/${post.author.id}`}>
          <Avatar name={post.author.name} size={38} />
        </Link>
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/nexus/profile/${post.author.id}`}
            style={{ fontFamily: "var(--font-heading)", fontSize: 14.5, color: "var(--color-text)", textDecoration: "none" }}
          >
            {post.author.name}
          </Link>
          {post.author.headline && (
            <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>{post.author.headline}</div>
          )}
          <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
            <TimeAgo date={post.createdAt} />
          </div>
        </div>
      </div>

      {post.type === "article" && post.articleTitle && (
        <div className="card-title" style={{ marginTop: 2, fontSize: 19 }}>
          {post.articleTitle}
        </div>
      )}

      {post.type === "article" && post.imageUrls[0] && (
        <div className="hero-image-container" style={{ marginTop: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- data-URL image, next/image can't optimize it anyway */}
          <img src={post.imageUrls[0]} alt="" />
        </div>
      )}

      <p className="card-body" style={{ whiteSpace: "pre-wrap" }}>
        {articleBody}
        {isLongArticle && (
          <button
            type="button"
            onClick={() => setArticleExpanded((v) => !v)}
            style={{ background: "none", border: "none", padding: 0, marginLeft: 4, color: "var(--color-accent-700)", cursor: "pointer", font: "inherit" }}
          >
            {articleExpanded ? "less" : "more"}
          </button>
        )}
      </p>

      {post.type === "photo" && post.imageUrls.length > 0 && (
        <div className={`nexus-image-grid nexus-image-grid--${Math.min(post.imageUrls.length, 4)}`}>
          {post.imageUrls.slice(0, 4).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- data-URL image, next/image can't optimize it anyway
            <img key={i} src={url} alt="" />
          ))}
        </div>
      )}

      {post.type === "video" && embedUrl && (
        <div className="nexus-video-embed">
          <iframe src={embedUrl} title={post.body || "Video"} allow="autoplay; encrypted-media; picture-in-picture" style={{ width: "100%", height: "100%", border: "none" }} />
        </div>
      )}

      {post.sourceUrl && (
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-divider)",
            fontSize: 12.5,
            color: "var(--color-neutral-700)",
            textDecoration: "none",
          }}
        >
          <ExternalLinkIcon size={14} />
          {post.sourceLabel ?? "Read the original"}
        </a>
      )}

      <div style={{ display: "flex", gap: 16, paddingTop: 4 }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: 0, gap: 6 }}
          onClick={() => {
            const next = !liked;
            setLiked(next);
            setLikeCount((c) => c + (next ? 1 : -1));
            startTransition(() => toggleNexusLikeAction(post.id));
          }}
        >
          <HeartIcon size={16} filled={liked} style={liked ? { color: "var(--color-accent)" } : undefined} />
          {likeCount > 0 ? likeCount : "Like"}
        </button>
        <button type="button" className="btn btn-ghost" style={{ padding: 0, gap: 6 }} onClick={() => setShowComments((v) => !v)}>
          <MessageCircleIcon size={16} />
          {comments.length > 0 ? comments.length : "Comment"}
        </button>
      </div>

      {showComments && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 6, borderTop: "1px solid var(--color-divider)" }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 8 }}>
              <Avatar name={c.author.name} size={26} />
              <div style={{ background: "var(--color-neutral-100)", borderRadius: "var(--radius-md)", padding: "6px 10px", fontSize: 12.5 }}>
                <span style={{ fontWeight: 600 }}>{c.author.name}</span> {c.body}
              </div>
            </div>
          ))}
          <form
            style={{ display: "flex", gap: 8 }}
            action={() => {
              if (!commentDraft.trim()) return;
              const optimistic: NexusPostComment = {
                id: `optimistic-${Date.now()}`,
                body: commentDraft,
                createdAt: new Date().toISOString(),
                author: { id: "me", name: currentUserName },
              };
              setComments((prev) => [...prev, optimistic]);
              const formData = new FormData();
              formData.set("body", commentDraft);
              setCommentDraft("");
              startTransition(() => addNexusCommentAction(post.id, formData));
            }}
          >
            <input
              className="input"
              placeholder="Write a comment…"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
