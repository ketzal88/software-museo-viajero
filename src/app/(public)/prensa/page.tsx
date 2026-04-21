import type { Metadata } from "next";
import { getNotasPrensa } from "@/lib/actions";
import { StructuredData } from "@/features/public/StructuredData";
import { buildBreadcrumbSchema, SITE_CONFIG } from "@/lib/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Prensa",
    description: "Notas y menciones en prensa sobre El Museo Viajero — reseñas, entrevistas y artículos sobre nuestras comedias históricas musicales.",
    alternates: { canonical: "/prensa" },
};

export default async function PrensaPage() {
    const notas = await getNotasPrensa();

    return (
        <div>
            <StructuredData
                schema={[
                    buildBreadcrumbSchema([
                        { name: "Inicio", url: "/" },
                        { name: "Prensa", url: "/prensa" },
                    ]),
                    {
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Prensa — El Museo Viajero",
                        "description": "Archivo de notas y menciones en prensa.",
                        "url": `${SITE_CONFIG.url}/prensa`,
                        "hasPart": notas.slice(0, 20).map(n => ({
                            "@type": "NewsArticle",
                            "headline": n.title,
                            "author": n.autor ? { "@type": "Person", "name": n.autor } : undefined,
                            "publisher": { "@type": "Organization", "name": n.medio },
                            "datePublished": n.fecha,
                            "url": n.url,
                        })),
                    },
                ]}
                id="prensa-schema"
            />

            <header className="mx-auto max-w-7xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Archivo de prensa
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    Prensa
                </h1>
                <p className="mt-6 max-w-3xl text-lg font-sans text-gray-700 leading-relaxed">
                    Notas, reseñas y entrevistas en medios sobre El Museo Viajero.
                </p>
            </header>

            <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
                {notas.length === 0 ? (
                    <p className="py-20 text-center text-gray-500 font-sans">Sin notas disponibles.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 border-y border-gray-200">
                        {notas.map(n => (
                            <li key={n.id} className="py-6">
                                <a
                                    href={n.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                >
                                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-accent">
                                        {n.medio} {n.fecha && `· ${n.fecha}`}
                                    </p>
                                    <h3 className="mt-2 text-xl md:text-2xl font-display font-bold text-primary group-hover:text-accent leading-tight">
                                        {n.title}
                                    </h3>
                                    {n.autor && (
                                        <p className="mt-1 text-sm font-sans text-gray-500">
                                            Por {n.autor}
                                        </p>
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
