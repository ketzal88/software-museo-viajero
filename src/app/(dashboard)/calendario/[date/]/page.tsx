import { getEventDaysByDate, getSlotsByEventDay, getVenueById, getWorkById } from "@/lib/actions";
import { ChevronLeft, Theater, MapPin, Clock, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EventType } from "@/types";
import { cn } from "@/lib/utils";

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

        const slotsWithWorks = await Promise.all(slots.map(async (slot) => {
            const work = await getWorkById(slot.workId);
            return { ...slot, work };
        }));

        return { ...event, slots: slotsWithWorks, venue };
    }));

    return (
        <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
            <header className="flex flex-col gap-2">
                <Link
                    href="/calendario"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver al Calendario
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight capitalize">{dateFormatted}</h1>
                        <p className="text-muted-foreground">Detalle de jornadas programadas para este día.</p>
                    </div>
                    {eventsWithSlots.length > 0 && (
                        <Link
                            href={`/calendario/${params.date}/imprimir`}
                            className="flex items-center gap-2 text-xs font-bold bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            target="_blank"
                        >
                            <Printer className="h-4 w-4" /> Imprimir Hoja de Ruta
                        </Link>
                    )}
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
                                        <p className="text-xs text-muted-foreground">
                                            {event.type === EventType.THEATER ? event.venue?.address : "Institución a definir en reserva"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Slots de Función</h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {event.slots.map((slot) => (
                                        <Link
                                            key={slot.id}
                                            href={`/reservas/nueva/${slot.id}`}
                                            className="group flex flex-col p-4 border rounded-xl hover:border-primary hover:shadow-md transition-all bg-card"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                    slot.availableCapacity > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {slot.availableCapacity} Libres
                                                </div>
                                            </div>
                                            <p className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{slot.work?.title}</p>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{slot.work?.description}</p>

                                            <div className="mt-auto pt-3 border-t border-dashed flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase text-primary">Reservar ahora</span>
                                                <Plus className="h-3 w-3 text-primary" />
                                            </div>
                                        </Link>
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
