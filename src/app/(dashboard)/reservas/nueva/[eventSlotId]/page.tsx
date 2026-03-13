import { getSlotDetails } from "@/lib/actions";
import { TheaterBookingForm } from "@/features/bookings/components/TheaterBookingForm";
import { TravelBookingForm } from "@/features/bookings/components/TravelBookingForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventType } from "@/types";

export const dynamic = "force-dynamic";

interface NuevaReservaPageProps {
    params: Promise<{ eventSlotId: string }>;
}

export default async function NuevaReservaPage({ params }: NuevaReservaPageProps) {
    const { eventSlotId } = await params;
    const details = await getSlotDetails(eventSlotId);

    if (!details || !details.work || !details.eventDay) {
        notFound();
    }

    const { slot, work, eventDay } = details;
    const isTheater = eventDay.type === EventType.THEATER;

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href={`/calendario/${eventDay.date}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver al día {eventDay.date}
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Nueva Reserva
                </h1>
                <p className="text-gray-600 font-sans text-xl">
                    {work.title} · {slot.startTime}–{slot.endTime} · {eventDay.date}
                </p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                {isTheater ? (
                    <TheaterBookingForm slot={slot} work={work} />
                ) : (
                    <TravelBookingForm slot={slot} work={work} />
                )}
            </div>
        </div>
    );
}
