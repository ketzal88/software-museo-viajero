import { getWorkById, getCastByWork, getPeople } from "@/lib/actions";
import { WorkCastManager } from "@/features/works/components/WorkCastManager";
import { ChevronLeft, Edit2, Layers, Clock, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function WorkDetailsPage({ params }: { params: { id: string } }) {
    const work = await getWorkById(params.id);
    if (!work) notFound();

    const [cast, allPeople] = await Promise.all([
        getCastByWork(params.id),
        getPeople()
    ]);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/obras"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                            {work.title}
                        </h1>
                        <div className="flex items-center gap-4 mt-1 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                <Clock className="h-3 w-3" /> {work.duration || "--"} min
                            </span>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/obras/${work.id}/editar`}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 transition-all font-bold text-sm"
                >
                    <Edit2 className="h-4 w-4" />
                    Editar Obra
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info & Cast */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Elenco Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <WorkCastManager
                            workId={work.id}
                            cast={cast}
                            allPeople={allPeople}
                        />
                    </div>
                </div>

                {/* Right: Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl">
                        <h4 className="font-black uppercase tracking-tight flex items-center gap-3 text-primary">
                            <Layers className="h-5 w-5" />
                            Descripción
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                            {work.description || "Sin descripción disponible."}
                        </p>

                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">Integrantes elenco</span>
                                <span className="font-black text-xl">{cast.filter(c => c.roleType === 'actor').length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold uppercase tracking-wider">Integrantes staff</span>
                                <span className="font-black text-xl">{cast.filter(c => c.roleType === 'assistant').length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <h5 className="font-bold">Generación de Liquidaciones</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Al confirmar una función de esta obra, el sistema usará este elenco para generar los pagos automáticamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
