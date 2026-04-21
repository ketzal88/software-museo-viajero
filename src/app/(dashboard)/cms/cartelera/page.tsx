import Link from "next/link";
import { getFuncionesActivas, getWorksPublic, getVenuesPublic } from "@/lib/actions";
import { ArrowRight, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fmt(iso: string | undefined) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} de ${meses[m - 1]} ${y}`;
}

export default async function CmsCarteleraPage() {
    const [funciones, obras, venues] = await Promise.all([
        getFuncionesActivas(),
        getWorksPublic(),
        getVenuesPublic(),
    ]);
    const worksBySlug = new Map(obras.filter(o => o.slug).map(o => [o.slug!, o.title]));
    const venuesBySlug = new Map(venues.filter(v => v.slug).map(v => [v.slug!, v.name]));

    return (
        <div className="flex flex-col gap-10">
            <header className="flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">CMS · Sitio público</p>
                    <h1 className="mt-2 text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">Cartelera</h1>
                    <p className="mt-3 font-sans text-gray-600 text-lg">{funciones.length} funciones programadas (activas o siempre visibles).</p>
                </div>
                <Link
                    href="/cms/cartelera/nueva"
                    className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent"
                >
                    <Plus className="h-4 w-4" /> Nueva función
                </Link>
            </header>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {funciones.map(f => (
                    <li key={f.id}>
                        <Link href={`/cms/cartelera/${f.id}/editar`} className="group grid grid-cols-[120px_1fr_auto] items-center gap-6 py-5">
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-accent">{fmt(f.fechaFuncion)}</span>
                            <div>
                                <h3 className="text-lg font-display font-bold text-primary group-hover:text-accent">
                                    {worksBySlug.get(f.workSlug) ?? f.workSlug}
                                </h3>
                                <p className="text-sm font-sans text-gray-600">
                                    {venuesBySlug.get(f.venueSlug) ?? f.venueSlug} · {f.horarios.join(" · ")} hs · $ {f.precio.toLocaleString("es-AR")}
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                        </Link>
                    </li>
                ))}
                {funciones.length === 0 && (
                    <li className="py-10 text-center text-sm text-gray-500 font-sans">Sin funciones. Creá la primera.</li>
                )}
            </ul>
        </div>
    );
}
