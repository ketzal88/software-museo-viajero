import type { Metadata } from "next";
import { getWorksPublic, getTemasObras } from "@/lib/actions";
import { ObraCard } from "@/features/public/ObraCard";
import { StructuredData } from "@/features/public/StructuredData";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Repertorio de obras",
    description: "Catálogo completo de comedias musicales históricas del Museo Viajero: obras sobre la Revolución de Mayo, Manuel Belgrano, San Martín, Sarmiento, pueblos originarios y más.",
    alternates: { canonical: "/repertorio" },
};

export default async function RepertorioPage() {
    const [obras, temas] = await Promise.all([
        getWorksPublic(),
        getTemasObras(),
    ]);

    // Agrupar por tema (si obra no tiene tema, va a "sin clasificar")
    const temasById = new Map(temas.map(t => [t.slug, t]));
    const obrasPorTema = new Map<string, typeof obras>();
    for (const obra of obras) {
        const key = obra.temaSlug || "sin-clasificar";
        if (!obrasPorTema.has(key)) obrasPorTema.set(key, []);
        obrasPorTema.get(key)!.push(obra);
    }

    // Ordenar grupos por el order del tema (o al final si no)
    const gruposOrdenados = Array.from(obrasPorTema.entries()).sort((a, b) => {
        const orderA = temasById.get(a[0])?.order ?? 999;
        const orderB = temasById.get(b[0])?.order ?? 999;
        return orderA - orderB;
    });

    return (
        <div>
            <StructuredData
                schema={buildBreadcrumbSchema([
                    { name: "Inicio", url: "/" },
                    { name: "Repertorio", url: "/repertorio" },
                ])}
                id="repertorio-schema"
            />
            <header className="mx-auto max-w-7xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Catálogo completo
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    Repertorio
                </h1>
                <p className="mt-6 max-w-3xl text-lg font-sans text-gray-700 leading-relaxed">
                    Más de 30 años de obras del Museo Viajero organizadas por efeméride y temática histórica.
                    Todas pueden contratarse para funciones en escuelas.
                </p>
            </header>

            <div className="mx-auto max-w-7xl px-6 pb-24 md:px-10 flex flex-col gap-20">
                {gruposOrdenados.map(([temaSlug, obrasDelTema]) => {
                    const tema = temasById.get(temaSlug);
                    return (
                        <section key={temaSlug} id={temaSlug}>
                            <h2 className="mb-8 text-2xl md:text-3xl font-display font-bold tracking-tight text-primary border-b border-gray-300 pb-4">
                                {tema?.title ?? "Sin clasificar"}
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {obrasDelTema.map((obra, i) => (
                                    <ObraCard key={obra.id} obra={obra} priority={i < 2} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
