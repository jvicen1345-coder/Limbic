import { getCurrentUser } from "@/lib/session";
import { buildCalendarEvents } from "@/lib/calendar-data";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const events = await buildCalendarEvents(user);

  return <CalendarPageClient events={events} />;
}
