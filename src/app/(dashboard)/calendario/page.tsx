import { getEventDays, getVenues } from "@/lib/actions";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export default async function CalendarioPage() {
    const [eventDays, venues] = await Promise.all([
        getEventDays(),
        getVenues()
    ]);

    return (
        <CalendarView eventDays={eventDays} venues={venues} />
    );
}
