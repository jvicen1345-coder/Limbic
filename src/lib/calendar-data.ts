import "server-only";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import type { User } from "@/generated/prisma/client";
import { dateToLocalIso, isEventPost, PERSONAL_DEADLINE_FIELDS } from "@/lib/limbic-calendar";
import { todayLocalDateStr } from "@/lib/today";
import type { CalendarEvent } from "@/lib/calendar-events";
import { isAdminEmail } from "@/lib/session";

/** Builds every event the full /calendar page can show for `user` — personal deadlines,
 *  future PT platform (CE) articles, future Limbic community (Nexus) events, and the
 *  reader's own UserCalendarEvent rows. Unbounded by date range (unlike the sidebar
 *  widget, which only needs "today onward") since Month/Week/List navigation is all
 *  client-side against one server fetch — see components/calendar/CalendarPageClient.tsx. */
export async function buildCalendarEvents(user: User): Promise<CalendarEvent[]> {
  const today = todayLocalDateStr();
  const events: CalendarEvent[] = [];

  for (const { field, title, verb } of PERSONAL_DEADLINE_FIELDS) {
    const value = user[field];
    if (!value) continue;
    events.push({
      id: `personal-${field}`,
      kind: "personal",
      date: dateToLocalIso(value),
      title,
      field,
      countdownVerb: verb,
    });
  }

  // Nexus is gated to admins only for now (see app/(app)/nexus/layout.tsx) — real post
  // content (author names, body text) must not surface here for anyone else, even as a
  // brief calendar preview.
  const isAdmin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);

  const [articles, communityPosts, userEvents] = await Promise.all([
    getArticles(),
    isAdmin
      ? prisma.nexusPost.findMany({
          select: {
            id: true,
            body: true,
            articleTitle: true,
            createdAt: true,
            sourceUrl: true,
            author: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 300,
        })
      : Promise.resolve([]),
    prisma.userCalendarEvent.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
  ]);

  for (const a of articles) {
    if (a.type !== "ce") continue;
    if (a.date < today) continue;
    events.push({
      id: `platform-${a.id}`,
      kind: "platform",
      date: a.date,
      title: a.title,
      articleId: a.id,
      source: a.source,
      readMins: a.readMins,
    });
  }

  // Same "createdAt as the event date, future only" rule as the sidebar widget — see the
  // matching comment in components/LimbicCalendarWidget.tsx for why this rarely surfaces
  // anything in practice (createdAt is the post's own timestamp, not a real event date).
  for (const post of communityPosts) {
    const postDate = dateToLocalIso(post.createdAt);
    if (postDate < today) continue;
    if (!isEventPost(post.body, post.articleTitle)) continue;
    events.push({
      id: `community-${post.id}`,
      kind: "community",
      date: postDate,
      title: post.articleTitle ?? post.body.slice(0, 60),
      bodyPreview: post.body.slice(0, 100),
      authorName: post.author.name,
      postHref: post.sourceUrl ?? "/nexus",
    });
  }

  for (const e of userEvents) {
    events.push({
      id: `user-${e.id}`,
      kind: "user",
      rawId: e.id,
      date: dateToLocalIso(e.date),
      title: e.title,
      type: e.type,
      notes: e.notes,
      reminder: e.reminder,
    });
  }

  return events;
}
