import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicaciones, getWorksPublic } from "@/lib/actions";
import { StructuredData } from "@/features/public/StructuredData";
import { buildBreadcrumbSchema, SITE_CONFIG } from "@/lib/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Publicaciones",
    description: "Libros publicados del Museo Viajero — 'Comedias del Museo Viajero' en dos tomos por EUDEBA y ediciones especiales de 'La pequeña aldea'.",
    alternates: { canonical: "/publicaciones" },
};

export default async function PublicacionesPage() {
    const [publicaciones, obras] = await Promise.all([getPublicaciones(), getWorksPublic()]);
    const obrasBySlug = new Map(obras.filter(o => o.slug).map(o => [o.slug!, o]));

    return (
        <div>
            <StructuredData
                schema={[
                    buildBreadcrumbSchema([
                        { name: "Inicio", url: "/" },
                        { name: "Publicaciones", url: "/publicaciones" },
                    ]),
                    ...publicaciones.map(p => ({
                        "@context": "https://schema.org",
                        "@type": "Book",
                        "name": p.title,
                        "alternateName": p.subtitle,
                        "description": p.description,
                        "publisher": { "@type": "Organization", "name": p.editorial },
                        "datePublished": p.year ? String(p.year) : undefined,
                        "image": p.coverUrl.startsWith("http") ? p.coverUrl : `${SITE_CONFIG.url}${p.coverUrl}`,
                        "url": p.buyUrl,
                    })),
                ]}
                id="publicaciones-schema"
            />

            <header className="mx-auto max-w-7xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Libros editados
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    Publicaciones
                </h1>
                <p className="mt-6 max-w-3xl text-lg font-sans text-gray-700 leading-relaxed">
                    Nuestras obras editadas en papel. <strong>EUDEBA</strong> publicó los dos tomos de
                    <em> Comedias del Museo Viajero</em> en 2023, reuniendo ocho de nuestras comedias históricas.
                </p>
            </header>

            <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
                {publicaciones.length === 0 ? (
                    <p className="py-20 text-center text-gray-500 font-sans">
                        Cargaremos las publicaciones próximamente.
                    </p>
                ) : (
                    <div className="grid gap-10 md:grid-cols-2">
                        {publicaciones.map(p => (
                            <article key={p.id} className="border border-gray-200 bg-white overflow-hidden">
                                <div className="relative aspect-[3/4] bg-gray-100">
                                    {p.coverUrl && (
                                        <Image
                                            src={p.coverUrl}
                                            alt={`Portada de ${p.title}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-8">
                                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-500">
                                        {p.editorial}{p.year ? ` · ${p.year}` : ""}
                                    </p>
                                    <h3 className="mt-2 text-3xl font-display font-bold leading-tight text-primary">
                                        {p.title}
                                    </h3>
                                    {p.subtitle && (
                                        <p className="mt-1 text-lg font-sans text-gray-600">{p.subtitle}</p>
                                    )}
                                    {p.description && (
                                        <p className="mt-4 text-base font-sans text-gray-700 leading-relaxed">{p.description}</p>
                                    )}
                                    {p.obrasIncluidas.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-3">
                                                Obras incluidas
                                            </p>
                                            <ul className="flex flex-wrap gap-2">
                                                {p.obrasIncluidas.map(slug => {
                                                    const obra = obrasBySlug.get(slug);
                                                    return (
                                                        <li key={slug}>
                                                            {obra ? (
                                                                <Link href={`/repertorio/${slug}`} className="inline-block border border-gray-300 px-3 py-1 text-xs font-sans hover:border-primary">
                                                                    {obra.title}
                                                                </Link>
                                                            ) : (
                                                                <span className="inline-block border border-gray-200 px-3 py-1 text-xs font-sans text-gray-400">{slug}</span>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {p.buyUrl && (
                                        <a
                                            href={p.buyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-6 inline-flex items-center border border-primary bg-primary px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent"
                                        >
                                            Ver en EUDEBA →
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
