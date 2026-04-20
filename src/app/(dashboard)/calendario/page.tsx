import { getEventDays, getVenues, getCalendarDaySummaries } from "@/lib/actions";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const dynamic = "force-dynamic";

interface CalendarioPageProps {
    searchParams: { month?: string };
}

function resolveWindow(monthParam?: string) {
    const base = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
        ? new Date(Number(monthParam.slice(0, 4)), Number(monthParam.slice(5, 7)) - 1, 1)
        : new Date();
    return {
        fromDate: format(startOfMonth(subMonths(base, 1)), "yyyy-MM-dd"),
        toDate: format(endOfMonth(addMonths(base, 1)), "yyyy-MM-dd"),
    };
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
    const window = resolveWindow(searchParams?.month);

    const [eventDays, venues] = await Promise.all([
        getEventDays(window),
        getVenues()
    ]);

    const slotSummaries = await getCalendarDaySummaries(eventDays.map(d => d.id));

    return (
        <CalendarView eventDays={eventDays} venues={venues} slotSummaries={slotSummaries} />
    );
}
