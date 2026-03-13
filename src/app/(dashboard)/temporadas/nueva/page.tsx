import { getWorks } from "@/lib/actions";
import { SeasonForm } from "@/features/seasons/components/SeasonForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NuevaTemporadaPage() {
    const availableWorks = await getWorks();

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/temporadas"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Temporadas
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Nueva Temporada
                </h1>
                <p className="text-gray-600 font-sans text-xl">Configura un nuevo ciclo de programación.</p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <SeasonForm availableWorks={availableWorks} />
            </div>
        </div>
    );
}
