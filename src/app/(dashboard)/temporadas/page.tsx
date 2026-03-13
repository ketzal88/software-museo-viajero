import { getSeasons } from "@/lib/actions";
import { SeasonList } from "@/features/seasons/components/SeasonList";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";

export default async function TemporadasPage() {
    const seasons = await getSeasons();

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                        Temporadas
                    </h1>
                    <p className="text-gray-600 font-sans text-xl mt-2">Configura los ciclos anuales de programación.</p>
                </div>
                <Link
                    href="/temporadas/nueva"
                    className="flex items-center gap-2 bg-primary px-8 py-3.5 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                >
                    <Plus className="h-5 w-5" /> Nueva Temporada
                </Link>
            </header>

            <SeasonList seasons={seasons} />
        </div>
    );
}
