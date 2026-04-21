import type { Metadata } from "next";
import { getFuncionesActivas, getWorksPublic, getVenuesPublic } from "@/lib/actions";
import { CarteleraLista } from "@/features/public/CarteleraLista";
import { StructuredData } from "@/features/public/StructuredData";
import { buildTheaterEventSchema, buildBreadcrumbSchema } from "@/lib/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Cartelera",
    description: "Agenda de funciones públicas del Museo Viajero en teatros de Buenos Aires. Fechas, horarios y lugares de las próximas comedias históricas musicales.",
    alternates: { canonical: "/cartelera" },
};

export default async function CarteleraPage() {
    const [funciones, obras, venues] = await Promise.all([
        getFuncionesActivas(),
        getWorksPublic(),
        getVenuesPublic(),
    ]);

    const worksBySlug = new Map(obras.filter(o => o.slug).map(o => [o.slug!, o]));
    const venuesBySlug = new Map(venues.filter(v => v.slug).map(v => [v.slug!, v]));

    const schemas = [
        buildBreadcrumbSchema([
            { name: "Inicio", url: "/" },
            { name: "Cartelera", url: "/cartelera" },
        ]),
        ...funciones.slice(0, 20).map(f => {
            const w = worksBySlug.get(f.workSlug);
            const v = venuesBySlug.get(f.venueSlug) ?? null;
            if (!w) return null;
            return buildTheaterEventSchema(f, w, v);
        }).filter((s): s is Record<string, unknown> => s !== null),
    ];

    return (
        <div>
            <StructuredData schema={schemas} id="cartelera-schema" />
            <header className="mx-auto max-w-7xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Agenda
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    Cartelera
                </h1>
                <p className="mt-6 max-w-3xl text-lg font-sans text-gray-700 leading-relaxed">
                    Estas son las próximas funciones públicas del Museo Viajero en Buenos Aires.
                    Las obras también pueden contratarse para presentaciones en escuelas —{" "}
                    consultanos por disponibilidad y fechas.
                </p>
            </header>

            <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
                <CarteleraLista funciones={funciones} works={obras} venues={venues} />
            </section>
        </div>
    );
}
