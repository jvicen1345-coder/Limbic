import "server-only";
import { prisma } from "@/lib/db";
import { LimbicCalendarWidgetClient } from "@/components/LimbicCalendarWidgetClient";
import {
  dateToLocalIso,
  daysRemainingLabel,
  isEventPost,
  PERSONAL_DEADLINE_FIELDS,
  type CalDot,
  type ProfessionalDateField,
} from "@/lib/limbic-calendar";
import { todayLocalDateStr } from "@/lib/today";

type PersonalDates = Record<ProfessionalDateField, Date | null>;

export interface PlatformEvent {
  id: string;
  date: string;
  title: string;
  source: string;
  readMins: number;
}

export async function LimbicCalendarWidget({
  personalDates,
  platformEvents,
}: {
  personalDates: PersonalDates;
  platformEvents: PlatformEvent[];
}) {
  const today = todayLocalDateStr();

  const dots: CalDot[] = [];

  let hasPersonalDates = false;
  for (const { field, title, verb } of PERSONAL_DEADLINE_FIELDS) {
    const value = personalDates[field];
    if (!value) continue;
    hasPersonalDates = true;
    const iso = dateToLocalIso(value);
    dots.push({ id: `personal-${field}`, date: iso, kind: "personal", title, description: `${verb} ${daysRemainingLabel(iso)}` });
  }

  for (const ev of platformEvents) {
    if (ev.date < today) continue;
    dots.push({
      id: `platform-${ev.id}`,
      date: ev.date,
      kind: "platform",
      title: ev.title,
      description: `${ev.source} · ${ev.readMins} min`,
      href: `/article/${ev.id}`,
    });
  }

  // Nexus posts announcing an event — createdAt is the post's own timestamp (the app has
  // no separate "event date" field on NexusPost), so per the "only future dates" rule this
  // only ever shows a post created moments in the future relative to the query, which in
  // practice is effectively never. Implemented literally as specified; a real event-date
  // field on NexusPost would be needed for this to show anything in normal use.
  const candidatePosts = await prisma.nexusPost.findMany({
    select: { id: true, body: true, articleTitle: true, createdAt: true, sourceUrl: true, authorId: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  for (const post of candidatePosts) {
    const postDate = dateToLocalIso(post.createdAt);
    if (postDate < today) continue;
    if (!isEventPost(post.body, post.articleTitle)) continue;
    dots.push({
      id: `community-${post.id}`,
      date: postDate,
      kind: "community",
      title: post.articleTitle ?? post.body.slice(0, 60),
      href: post.sourceUrl ?? `/nexus`,
    });
  }

  return <LimbicCalendarWidgetClient dots={dots} hasPersonalDates={hasPersonalDates} />;
}
