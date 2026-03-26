import { getEventDays, getVenues, getCalendarDaySummaries } from "@/lib/actions";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
    const [eventDays, venues] = await Promise.all([
        getEventDays(),
        getVenues()
    ]);

    const slotSummaries = await getCalendarDaySummaries(eventDays.map(d => d.id));

    return (
        <CalendarView eventDays={eventDays} venues={venues} slotSummaries={slotSummaries} />
    );
}
