import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Download } from "lucide-react";
import { getMateriales, getCurrentPublicUser, getWorksPublic } from "@/lib/actions";
import { StructuredData } from "@/features/public/StructuredData";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Materiales educativos",
    description: "Actividades, guías didácticas, crucigramas e investigaciones complementarias sobre las obras del Museo Viajero. Recursos descargables por ciclo educativo.",
    alternates: { canonical: "/materiales" },
};

const NIVEL_LABEL: Record<number, string> = {
    0: "Libre",
    1: "Bronce",
    2: "Plata",
    3: "Oro",
    9: "Admin",
};

export default async function MaterialesPage() {
    const user = await getCurrentPublicUser();
    const nivel = user?.nivelSuscripcion ?? 0;
    const [materiales, obras] = await Promise.all([
        getMateriales(999), // Traemos TODOS y markeamos locked en UI (para UX mejor que filter total)
        getWorksPublic(),
    ]);
    const obrasBySlug = new Map(obras.filter(o => o.slug).map(o => [o.slug!, o]));

    return (
        <div>
            <StructuredData
                schema={buildBreadcrumbSchema([
                    { name: "Inicio", url: "/" },
                    { name: "Materiales", url: "/materiales" },
                ])}
                id="materiales-schema"
            />

            <header className="mx-auto max-w-7xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Recursos para docentes
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    Materiales educativos
                </h1>
                <p className="mt-6 max-w-3xl text-lg font-sans text-gray-700 leading-relaxed">
                    Actividades, guías didácticas, crucigramas e investigaciones complementarias a nuestras obras,
                    clasificadas por ciclo educativo.
                </p>
                {!user && (
                    <div className="mt-8 border border-primary bg-primary/5 p-6 max-w-2xl">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-primary">
                            Acceso a descargas
                        </p>
                        <p className="mt-2 text-sm font-sans text-gray-700">
                            Para descargar los materiales completos tenés que tener cuenta. El registro es gratis.
                        </p>
                        <Link
                            href="/ingresar?next=/materiales"
                            className="mt-4 inline-flex items-center border border-primary bg-primary px-5 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent"
                        >
                            Ingresar / Crear cuenta
                        </Link>
                    </div>
                )}
            </header>

            <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
                {materiales.length === 0 ? (
                    <p className="py-20 text-center text-gray-500 font-sans">Aún no hay materiales cargados.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 border-y border-gray-200">
                        {materiales.map(m => {
                            const locked = (m.nivelAcceso ?? 0) > nivel && nivel < 9;
                            const obra = m.workSlug ? obrasBySlug.get(m.workSlug) : null;
                            return (
                                <li key={m.id} className="py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                                        <div>
                                            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-accent">
                                                {m.tipo}
                                                {obra && <> · <Link href={`/repertorio/${obra.slug}`} className="hover:text-primary">{obra.title}</Link></>}
                                            </p>
                                            <h3 className="mt-2 text-xl font-display font-bold text-primary leading-tight">
                                                {m.title}
                                            </h3>
                                            {m.description && (
                                                <p className="mt-1 text-sm font-sans text-gray-600 max-w-2xl">{m.description}</p>
                                            )}
                                            {m.ciclos && (
                                                <ul className="mt-3 flex flex-wrap gap-2">
                                                    {m.ciclos.inicial && <li className="text-[10px] border border-gray-300 px-2 py-0.5">Inicial</li>}
                                                    {m.ciclos.primerCiclo && <li className="text-[10px] border border-gray-300 px-2 py-0.5">1er Ciclo</li>}
                                                    {m.ciclos.segundoCiclo && <li className="text-[10px] border border-gray-300 px-2 py-0.5">2do Ciclo</li>}
                                                    {m.ciclos.tercerCiclo && <li className="text-[10px] border border-gray-300 px-2 py-0.5">3er Ciclo</li>}
                                                    {m.ciclos.secundario && <li className="text-[10px] border border-gray-300 px-2 py-0.5">Secundario</li>}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 md:flex-col md:items-end">
                                            {locked ? (
                                                <Link
                                                    href="/ingresar?next=/materiales"
                                                    className="inline-flex items-center gap-2 border border-gray-400 bg-gray-100 px-4 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-gray-600"
                                                    title={`Requiere Nivel ${NIVEL_LABEL[m.nivelAcceso] ?? m.nivelAcceso}`}
                                                >
                                                    <Lock className="h-3 w-3" /> Nivel {NIVEL_LABEL[m.nivelAcceso] ?? m.nivelAcceso}
                                                </Link>
                                            ) : m.url ? (
                                                <a
                                                    href={m.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent"
                                                >
                                                    <Download className="h-3 w-3" /> Descargar
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
