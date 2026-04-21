import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getWorkBySlug, getFuncionesByWorkSlug, getVenuesPublic, getWorksPublic } from "@/lib/actions";
import { SanitizedHtml } from "@/features/public/SanitizedHtml";
import { CarteleraLista } from "@/features/public/CarteleraLista";
import { StructuredData } from "@/features/public/StructuredData";
import { buildCreativeWorkSchema, buildBreadcrumbSchema, SITE_CONFIG } from "@/lib/schema";
import { htmlToPlainText } from "@/lib/sanitize";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const obra = await getWorkBySlug(params.slug);
    if (!obra) return { title: "Obra no encontrada" };
    const seoDesc = obra.seo?.description
        || htmlToPlainText(obra.body, 155)
        || obra.subTitle
        || `${obra.title} — El Museo Viajero`;
    return {
        title: obra.seo?.title ?? `${obra.title}${obra.subTitle ? ` — ${obra.subTitle}` : ""}`,
        description: seoDesc,
        alternates: { canonical: `/repertorio/${obra.slug}` },
        keywords: obra.keywords,
        openGraph: {
            title: obra.title,
            description: seoDesc,
            type: "article",
            images: obra.imgPortada ? [{ url: obra.imgPortada }] : undefined,
        },
    };
}

export default async function ObraPage({ params }: { params: { slug: string } }) {
    const [obra, allWorks] = await Promise.all([
        getWorkBySlug(params.slug),
        getWorksPublic(),
    ]);
    if (!obra) notFound();

    const [funciones, venues] = await Promise.all([
        getFuncionesByWorkSlug(obra.slug!),
        getVenuesPublic(),
    ]);

    const relacionadas = allWorks
        .filter(w => w.temaSlug === obra.temaSlug && w.slug !== obra.slug)
        .slice(0, 3);

    const schemas = [
        buildBreadcrumbSchema([
            { name: "Inicio", url: "/" },
            { name: "Repertorio", url: "/repertorio" },
            { name: obra.title, url: `/repertorio/${obra.slug}` },
        ]),
        buildCreativeWorkSchema(obra),
    ];

    return (
        <article>
            <StructuredData schema={schemas} id={`obra-${obra.slug}-schema`} />

            {/* Hero */}
            <header className="relative min-h-[60vh] flex items-end bg-primary text-white overflow-hidden">
                {obra.imgPortada && (
                    <>
                        <Image
                            src={obra.imgPortada}
                            alt={obra.title}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </>
                )}
                <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24 md:px-10 w-full">
                    {obra.tipoDeObra && (
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                            {obra.tipoDeObra}
                        </p>
                    )}
                    <h1 className="mt-3 text-[44px] md:text-[84px] font-display font-bold tracking-[-3px] leading-[1] max-w-5xl">
                        {obra.title}
                    </h1>
                    {obra.subTitle && (
                        <p className="mt-4 text-xl md:text-2xl font-sans text-gray-200 max-w-3xl">
                            {obra.subTitle}
                        </p>
                    )}
                </div>
            </header>

            {/* Body + metadata */}
            <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 md:px-10 grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <SanitizedHtml
                        html={obra.body}
                        className="prose prose-lg max-w-none font-sans text-gray-800 leading-relaxed [&>*]:mb-4 [&_strong]:text-primary [&_strong]:font-display"
                    />
                    {obra.pie && (
                        <p className="mt-8 border-l-2 border-accent pl-6 text-sm font-sans italic text-gray-600">
                            {obra.pie}
                        </p>
                    )}
                </div>

                <aside className="space-y-8">
                    {obra.anioEstreno && (
                        <div>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Estrenada</p>
                            <p className="mt-1 text-2xl font-display font-bold text-primary">{obra.anioEstreno}</p>
                        </div>
                    )}
                    {obra.premios && obra.premios.length > 0 && (
                        <div>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-3">Premios y menciones</p>
                            <ul className="space-y-3 text-sm font-sans text-gray-700">
                                {obra.premios.map((p, i) => (
                                    <li key={i} className="border-l-2 border-accent pl-4">{p.texto}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {obra.ciclos && (
                        <div>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-3">Indicada para</p>
                            <ul className="flex flex-wrap gap-2 text-xs font-sans">
                                {obra.ciclos.inicial && <li className="border border-gray-300 px-2 py-1">Inicial</li>}
                                {obra.ciclos.primerCiclo && <li className="border border-gray-300 px-2 py-1">1er Ciclo</li>}
                                {obra.ciclos.segundoCiclo && <li className="border border-gray-300 px-2 py-1">2do Ciclo</li>}
                                {obra.ciclos.tercerCiclo && <li className="border border-gray-300 px-2 py-1">3er Ciclo</li>}
                                {obra.ciclos.secundario && <li className="border border-gray-300 px-2 py-1">Secundario</li>}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>

            {/* Videos */}
            {obra.videos && obra.videos.length > 0 && (
                <section className="border-t border-gray-200 py-16 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Video</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight text-primary mb-8">
                            Mirá la obra
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {obra.videos.slice(0, 2).map(v => (
                                <div key={v.youtubeId} className="aspect-video bg-black">
                                    <iframe
                                        className="h-full w-full"
                                        src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                                        title={`${obra.title} — video`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Funciones próximas de esta obra */}
            {funciones.length > 0 && (
                <section className="border-t border-gray-200 py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Cartelera</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight text-primary mb-8">
                            Próximas funciones
                        </h2>
                        <CarteleraLista funciones={funciones} works={[obra]} venues={venues} />
                    </div>
                </section>
            )}

            {/* Relacionadas */}
            {relacionadas.length > 0 && (
                <section className="border-t border-gray-200 py-16 md:py-24 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Del mismo tema</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight text-primary mb-8">
                            Obras relacionadas
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relacionadas.map(r => (
                                <Link
                                    key={r.id}
                                    href={`/repertorio/${r.slug}`}
                                    className="block border border-gray-200 bg-white p-6 hover:border-primary transition-colors"
                                >
                                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-500">
                                        {r.tipoDeObra ?? "Obra"}
                                    </p>
                                    <h3 className="mt-2 text-xl font-display font-bold leading-tight text-primary">
                                        {r.title}
                                    </h3>
                                    {r.subTitle && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{r.subTitle}</p>}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Canonical fallback mention for LLM citation */}
            <div className="sr-only">
                Fuente: {SITE_CONFIG.url}/repertorio/{obra.slug}
            </div>
        </article>
    );
}
