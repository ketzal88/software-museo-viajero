import { getSlotDetails } from "@/lib/actions";

export const dynamic = "force-dynamic";
import { TheaterBookingForm } from "@/features/bookings/components/TheaterBookingForm";
import { TravelBookingForm } from "@/features/bookings/components/TravelBookingForm";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { EventType } from "@/types";

interface NuevaReservaPageProps {
    params: {
        eventSlotId: string;
    };
}

export default async function NuevaReservaPage({ params }: NuevaReservaPageProps) {
    const details = await getSlotDetails(params.eventSlotId);

    if (!details || !details.slot || !details.work || !details.eventDay) {
        notFound();
    }

    const { slot, work, eventDay } = details;
    const isTheater = eventDay.type === EventType.THEATER;

    return (
        <div className="flex flex-col gap-6 p-8 max-w-4xl mx-auto">
            <header className="flex flex-col gap-2">
                <Link
                    href="/calendario"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver al Calendario
                </Link>
                <div className="flex items-center gap-3 mt-2">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nueva Reserva</h1>
                        <p className="text-sm text-muted-foreground">
                            {eventDay.date} — {slot.startTime}hs
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid gap-8 md:grid-cols-[1fr_350px]">
                <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                    {isTheater ? (
                        <TheaterBookingForm slot={slot} work={work} />
                    ) : (
                        <TravelBookingForm slot={slot} work={work} />
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-muted/30 border rounded-2xl p-6">
                        <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Resumen de Obra</h3>
                        <div className="space-y-2">
                            <p className="font-bold">{work.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-4">{work.description}</p>
                            <div className="pt-2">
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full uppercase">
                                    {work.duration} minutos
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                        <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-primary">Ayuda</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {isTheater
                                ? "Las reservas de teatro bloquean el aforo general del slot. Un 'HOLD' mantiene el cupo reservado pero no lo marca como venta cerrada."
                                : "Las reservas viajeras requieren que el museo se traslade. Asegúrate de verificar que la escuela tenga el espacio necesario para la modalidad elegida."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
