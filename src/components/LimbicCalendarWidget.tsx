import "server-only";
import { prisma } from "@/lib/db";
import { LimbicCalendarWidgetClient } from "@/components/LimbicCalendarWidgetClient";
import { dateToLocalIso, daysRemainingLabel, type CalDot } from "@/lib/limbic-calendar";
import { todayLocalDateStr } from "@/lib/today";

/** The orange-dot personal deadlines (see the Profile "Professional Dates" section,
 *  app/actions/profile.ts updateProfessionalDates) — one entry per field, in the order
 *  they should list if more than one lands on the same day. `title` is the noun shown as
 *  the popup's bold heading; `verb` builds the "License expires in 23 days"-style
 *  countdown sentence below it (title alone wouldn't read as a sentence for every field —
 *  "CEU Deadline in 10 days" is off, "CEU deadline is in 10 days" reads right). */
const PERSONAL_DEADLINE_FIELDS: { field: keyof PersonalDates; title: string; verb: string }[] = [
  { field: "npteExamDate", title: "NPTE Exam", verb: "NPTE Exam is" },
  { field: "licenseExpiration", title: "License Expiration", verb: "License expires" },
  { field: "ceuDeadline", title: "CEU Deadline", verb: "CEU deadline is" },
  { field: "certificationExpiry", title: "Specialty Certification Expiry", verb: "Certification expires" },
  { field: "rotationStartDate", title: "Clinical Rotation Start", verb: "Rotation starts" },
  { field: "rotationEndDate", title: "Clinical Rotation End", verb: "Rotation ends" },
  { field: "graduationDate", title: "Graduation", verb: "Graduation is" },
];

interface PersonalDates {
  npteExamDate: Date | null;
  licenseExpiration: Date | null;
  ceuDeadline: Date | null;
  certificationExpiry: Date | null;
  rotationStartDate: Date | null;
  rotationEndDate: Date | null;
  graduationDate: Date | null;
}

export interface PlatformEvent {
  id: string;
  date: string;
  title: string;
  source: string;
  readMins: number;
}

/** NexusPost has no event-tag field (see prisma/schema.prisma) — this keyword heuristic
 *  stands in for one, matching the same "classify by keyword" pattern lib/news-live.ts
 *  already uses for CE articles. A real tag field would be a more accurate follow-up. */
const COMMUNITY_EVENT_KEYWORDS = [
  "webinar",
  "conference",
  "meetup",
  "meet-up",
  "workshop",
  "seminar",
  "symposium",
  "summit",
  "networking event",
  "csm",
];

function isEventPost(body: string, articleTitle: string | null): boolean {
  const text = `${body} ${articleTitle ?? ""}`.toLowerCase();
  return COMMUNITY_EVENT_KEYWORDS.some((kw) => text.includes(kw));
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
