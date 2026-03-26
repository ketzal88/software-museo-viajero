import { getEventDaysByDate, getSlotsByEventDay, getTheaterBookingsBySlot, getTravelBookingsBySlot, getWorkById, getVenueById } from "@/lib/actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { EventType } from "@/types";
import { SlotBookingsTable } from "@/features/bookings/components/SlotBookingsTable";
import { PrintButton } from "@/components/ui/PrintButton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

interface CalendarioDiaPageProps {
    params: Promise<{ date: string }>;
}

export default async function CalendarioDiaPage({ params }: CalendarioDiaPageProps) {
    const { date } = await params;
    const eventDays = await getEventDaysByDate(date);

    const eventsWithDetails = await Promise.all(
        eventDays.map(async (day) => {
            const slots = await getSlotsByEventDay(day.id);
            const work = slots.length > 0 ? await getWorkById(slots[0].workId) : null;
            const venue = day.type === EventType.THEATER && day.locationId ? await getVenueById(day.locationId) : null;

            const slotsWithBookings = (await Promise.all(
                slots.map(async (slot) => {
                    const [theaterBookings, travelBookings] = await Promise.all([
                        getTheaterBookingsBySlot(slot.id),
                        getTravelBookingsBySlot(slot.id),
                    ]);
                    return { ...slot, theaterBookings, travelBookings };
                })
            )).sort((a, b) => a.startTime.localeCompare(b.startTime));

            return { ...day, slots: slotsWithBookings, work, venue };
        })
    );

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/calendario?month=${date.substring(0, 7)}`}
                        className="print:hidden flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                    >
                        <ChevronLeft className="h-4 w-4" /> Volver al Calendario
                    </Link>
                    <PrintButton />
                </div>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight capitalize">
                    {format(parseISO(date), "d 'de' MMMM", { locale: es })}
                </h1>
                <p className="text-gray-600 font-sans text-xl">
                    {eventDays.length === 0
                        ? "No hay eventos programados para esta fecha."
                        : `${eventDays.length} evento${eventDays.length !== 1 ? "s" : ""} programado${eventDays.length !== 1 ? "s" : ""}.`}
                </p>
            </header>

            {eventsWithDetails.length === 0 ? (
                <div className="border border-gray-300 p-12 text-center">
                    <p className="text-gray-500 font-sans">No hay funciones para este día.</p>
                    <Link
                        href="/calendario/nuevo"
                        className="inline-block mt-4 bg-primary px-8 py-3.5 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                    >
                        Programar Evento
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {eventsWithDetails.map((event) => (
                        <div key={event.id} className="border border-gray-300 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-[11px] font-display font-bold uppercase tracking-widest px-3 py-1 ${
                                    event.type === EventType.THEATER
                                        ? "bg-accent/10 text-accent"
                                        : "bg-blue-50 text-blue-600"
                                }`}>
                                    {event.type === EventType.THEATER ? "Teatro" : "Viaje"}
                                </span>
                                <span className={`text-[11px] font-display font-bold uppercase tracking-widest px-3 py-1 ${
                                    event.status === "OPEN"
                                        ? "bg-green-50 text-green-600"
                                        : "bg-gray-200 text-gray-600"
                                }`}>
                                    {event.status}
                                </span>
                            </div>

                            {event.work && (
                                <h2 className="text-2xl font-display font-bold tracking-tight text-primary mb-1">
                                    {event.work.title}
                                </h2>
                            )}
                            {event.venue && (
                                <p className="text-gray-600 font-sans">{event.venue.name}</p>
                            )}

                            {event.slots.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">
                                        Funciones
                                    </h3>
                                    {event.slots.map((slot) => (
                                        <div key={slot.id} className="border border-gray-200 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-display font-bold text-primary">
                                                    {slot.startTime} — {slot.endTime}
                                                </span>
                                                <span className="text-sm text-gray-500 font-sans">
                                                    {slot.availableCapacity}/{slot.totalCapacity} disponibles
                                                </span>
                                            </div>

                                            <SlotBookingsTable
                                                theaterBookings={slot.theaterBookings}
                                                travelBookings={slot.travelBookings}
                                            />

                                            {event.status === "OPEN" && (
                                                <Link
                                                    href={`/reservas/nueva/${slot.id}`}
                                                    className="print:hidden inline-block mt-3 text-sm text-accent font-display font-medium hover:underline"
                                                >
                                                    + Agregar Reserva
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
