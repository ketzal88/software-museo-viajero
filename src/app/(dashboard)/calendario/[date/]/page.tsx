import { getEventDaysByDate, getSlotsByEventDay, getVenueById, getWorkById, getTheaterBookingsBySlot, getTravelBookingsBySlot } from "@/lib/actions";
import { ChevronLeft, Theater, MapPin, Clock, Plus, Printer, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EventType } from "@/types";
import { cn } from "@/lib/utils";
import { AttendanceManager } from "@/features/reports/components/AttendanceManager";
import { CloseoutButton } from "@/features/reports/components/CloseoutButton";

export const dynamic = "force-dynamic";

interface DayDetailPageProps {
    params: {
        date: string;
    };
}

export default async function DayDetailPage({ params }: DayDetailPageProps) {
    const eventDays = await getEventDaysByDate(params.date);
    const dateFormatted = format(new Date(params.date + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es });

    const eventsWithSlots = await Promise.all(eventDays.map(async (event) => {
        const [slots, venue] = await Promise.all([
            getSlotsByEventDay(event.id),
            event.type === EventType.THEATER ? getVenueById(event.locationId) : null
        ]);

        const slotsWithData = await Promise.all(slots.map(async (slot) => {
            const [work, theaterBookings, travelBookings] = await Promise.all([
                getWorkById(slot.workId),
                getTheaterBookingsBySlot(slot.id),
                getTravelBookingsBySlot(slot.id)
            ]);
            return { ...slot, work, bookings: event.type === EventType.THEATER ? theaterBookings : travelBookings };
        }));

        return { ...event, slots: slotsWithData, venue };
    }));

    return (
        <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
            <header className="flex flex-col gap-4">
                <Link
                    href="/calendario"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver al Calendario
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight capitalize">{dateFormatted}</h1>
                        <p className="text-muted-foreground text-sm">Registro de asistencia y cierre de jornada.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {eventsWithSlots.length > 0 && (
                            <>
                                <Link
                                    href={`/calendario/${params.date}/imprimir`}
                                    className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                    target="_blank"
                                >
                                    <Printer className="h-4 w-4" /> Imprimir
                                </Link>
                                {eventsWithSlots.map(event => (
                                    <CloseoutButton key={event.id} eventDayId={event.id} isClosed={event.status === "CLOSED"} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {eventsWithSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl text-muted-foreground bg-card">
                    <p>No hay eventos programados para este día.</p>
                    <Link
                        href="/calendario/nuevo"
                        className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Programar Jornada
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {eventsWithSlots.map((event) => (
                        <div key={event.id} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                            <div className={cn(
                                "px-6 py-4 flex items-center justify-between border-b",
                                event.type === EventType.THEATER ? "bg-blue-50/50" : "bg-amber-50/50"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        event.type === EventType.THEATER ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        {event.type === EventType.THEATER ? <Theater className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">
                                            {event.type === EventType.THEATER ? event.venue?.name || "Teatro" : "Función Viajera"}
                                        </h2>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {event.type === EventType.THEATER ? event.venue?.address : "Institución a definir en reserva"}
                                        </p>
                                    </div>
                                </div>
                                {event.status === "CLOSED" && (
                                    <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-green-700 border border-green-200">
                                        REPORTE GENERADO
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="space-y-12">
                                    {event.slots.map((slot) => (
                                        <section key={slot.id} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg font-black text-xs text-slate-600 flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {slot.startTime} - {slot.endTime}
                                                    </div>
                                                    <h3 className="font-bold text-slate-800">{slot.work?.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase border",
                                                        slot.availableCapacity > 10 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                                    )}>
                                                        {slot.availableCapacity} LIBRES
                                                    </div>
                                                    {event.status !== "CLOSED" && (
                                                        <Link
                                                            href={`/reservas/nueva/${slot.id}`}
                                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-primary transition-colors"
                                                            title="Nueva Reserva"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                                                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    <Users className="h-3.5 w-3.5" /> Asistencia y Facturación
                                                </div>
                                                <AttendanceManager
                                                    bookings={slot.bookings}
                                                    type={event.type === EventType.THEATER ? "theater" : "travel"}
                                                />
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
