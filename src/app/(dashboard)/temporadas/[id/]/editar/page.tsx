import { getSeasonById, getWorks } from "@/lib/actions";

export const dynamic = "force-dynamic";
import { SeasonForm } from "@/features/seasons/components/SeasonForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditarTemporadaPageProps {
    params: {
        id: string;
    };
}

export default async function EditarTemporadaPage({ params }: EditarTemporadaPageProps) {
    const [season, availableWorks] = await Promise.all([
        getSeasonById(params.id),
        getWorks()
    ]);

    if (!season) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/temporadas"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Temporadas
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Temporada</h1>
                <p className="text-muted-foreground">Ajustando detalles de {season.name}.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <SeasonForm initialData={season} availableWorks={availableWorks} />
            </div>
        </div>
    );
}
