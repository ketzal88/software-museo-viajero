import { EventDayForm } from "@/features/calendar/components/EventDayForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NuevaJornadaPage() {
    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/calendario"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver al Calendario
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Programar Nueva Jornada</h1>
                <p className="text-muted-foreground">Define la fecha, lugar y obra de la presentación.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <EventDayForm />
            </div>
        </div>
    );
}
