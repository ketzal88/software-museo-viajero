import Link from "next/link";
import type { FuncionCartelera, Work, Venue } from "@/types";

const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function formatFecha(iso: string | undefined): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return `${d} de ${meses[m - 1]} de ${y}`;
}

export function CarteleraLista({
    funciones,
    works,
    venues,
}: {
    funciones: FuncionCartelera[];
    works: Work[];
    venues: Venue[];
}) {
    const worksBySlug = new Map(works.filter(w => w.slug).map(w => [w.slug!, w]));
    const venuesBySlug = new Map(venues.filter(v => v.slug).map(v => [v.slug!, v]));

    if (funciones.length === 0) {
        return (
            <div className="border border-gray-300 p-10 text-center">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">
                    Sin funciones programadas
                </p>
                <p className="mt-3 font-sans text-gray-600">Próximamente anunciaremos nuevas fechas.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {funciones.map(f => {
                const w = worksBySlug.get(f.workSlug);
                const v = venuesBySlug.get(f.venueSlug);
                return (
                    <li key={f.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6">
                        <div>
                            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-accent">
                                {formatFecha(f.fechaFuncion)}
                            </p>
                            {f.horarios?.length > 0 && (
                                <p className="mt-1 text-sm font-sans text-gray-600">
                                    {f.horarios.join(" · ")} hs
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            {w ? (
                                <Link href={`/repertorio/${w.slug}`} className="group">
                                    <h3 className="text-2xl font-display font-bold text-primary group-hover:text-accent transition-colors leading-tight">
                                        {w.title}
                                    </h3>
                                    {w.subTitle && (
                                        <p className="text-sm font-sans text-gray-600 mt-1">{w.subTitle}</p>
                                    )}
                                </Link>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Obra no encontrada ({f.workSlug})</p>
                            )}
                            {v && (
                                <p className="mt-2 text-sm font-sans text-gray-700">
                                    {v.name}{v.addressLine ? ` — ${v.addressLine}` : ""}
                                </p>
                            )}
                        </div>
                        <div className="flex md:flex-col md:items-end gap-2">
                            <span className={`text-[10px] font-display font-bold uppercase tracking-widest ${f.agotada ? "text-red-600" : "text-primary"}`}>
                                {f.agotada ? "Agotada" : `$ ${f.precio.toLocaleString("es-AR")}`}
                            </span>
                            {f.promo && (
                                <span className="text-[10px] font-sans text-gray-500">{f.promo.nombre}</span>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
