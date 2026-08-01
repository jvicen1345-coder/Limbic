"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleNexusLikeAction, addNexusCommentAction } from "@/app/actions/nexus";
import { Avatar } from "@/components/Avatar";
import { HeartIcon, MessageCircleIcon, ExternalLinkIcon } from "@/components/icons";
import { TimeAgo } from "@/components/TimeAgo";

export interface NexusPostComment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface NexusPostData {
  id: string;
  body: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
  createdAt: string;
  author: { id: string; name: string; headline: string | null };
  likeCount: number;
  likedByMe: boolean;
  comments: NexusPostComment[];
}

export function NexusPostCard({ post, currentUserName }: { post: NexusPostData; currentUserName: string }) {
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liked, setLiked] = useState(post.likedByMe);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentDraft, setCommentDraft] = useState("");
  const [, startTransition] = useTransition();

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

      <p className="card-body" style={{ whiteSpace: "pre-wrap" }}>
        {post.body}
      </p>

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
