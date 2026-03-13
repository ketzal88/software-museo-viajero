import { getWorkById, getCastByWork, getPeople } from "@/lib/actions";
import { WorkCastManager } from "@/features/works/components/WorkCastManager";
import { ChevronLeft, Edit, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ObraDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ObraDetailPage({ params }: ObraDetailPageProps) {
    const { id } = await params;
    const [work, cast, allPeople] = await Promise.all([
        getWorkById(id),
        getCastByWork(id),
        getPeople(),
    ]);

    if (!work) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-2">
                <Link
                    href="/obras"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Obras
                </Link>
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                            {work.title}
                        </h1>
                        {work.duration && (
                            <p className="text-gray-600 font-sans text-xl mt-2 flex items-center gap-2">
                                <Clock className="h-5 w-5" /> {work.duration} minutos
                            </p>
                        )}
                        {work.description && (
                            <p className="text-gray-500 font-sans mt-2">{work.description}</p>
                        )}
                    </div>
                    <Link
                        href={`/obras/${id}/editar`}
                        className="flex items-center gap-2 border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30"
                    >
                        <Edit className="h-4 w-4" /> Editar
                    </Link>
                </div>
            </header>

            <section>
                <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-4">
                    Elenco Asignado
                </h2>
                <div className="border border-gray-300 p-6 md:p-10">
                    <WorkCastManager workId={id} cast={cast} allPeople={allPeople} />
                </div>
            </section>
        </div>
    );
}
