import { SeasonForm } from "@/features/seasons/components/SeasonForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getWorks } from "@/lib/actions";

export default async function NuevaTemporadaPage() {
    const availableWorks = await getWorks();

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/temporadas"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Temporadas
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Temporada</h1>
                <p className="text-muted-foreground">Define un nuevo rango de fechas para el calendario.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <SeasonForm availableWorks={availableWorks} />
            </div>
        </div>
    );
}
