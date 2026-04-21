import Link from "next/link";
import { getHeroSlides, getFuncionesActivas, getWorksPublic, getVenuesPublic, getSponsors, getSiteConfig } from "@/lib/actions";
import { HeroSlider } from "@/features/public/HeroSlider";
import { ObraCard } from "@/features/public/ObraCard";
import { CarteleraLista } from "@/features/public/CarteleraLista";
import type { SiteConfigStats } from "@/types";

export const revalidate = 3600;

export default async function HomePage() {
    const [slides, funciones, obras, venues, sponsors, stats] = await Promise.all([
        getHeroSlides(),
        getFuncionesActivas(),
        getWorksPublic(),
        getVenuesPublic(),
        getSponsors(),
        getSiteConfig<SiteConfigStats>("stats"),
    ]);

    const upcoming = funciones.slice(0, 3);
    const destacadas = obras.filter(o => o.estreno).slice(0, 3);
    const todasDestacadas = destacadas.length > 0 ? destacadas : obras.slice(0, 3);

    return (
        <div>
            <HeroSlider slides={slides} />

            {/* Answer-first paragraph para SEO/GEO */}
            <section className="mx-auto max-w-4xl px-6 py-16 md:py-24 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Desde 1995
                </p>
                <h2 className="mt-3 text-[42px] md:text-[54px] font-display font-bold tracking-[-2px] text-primary leading-[1.05]">
                    Teatro histórico para escuelas.
                </h2>
                <p className="mt-6 text-lg md:text-xl font-sans text-gray-700 leading-relaxed">
                    <strong>El Museo Viajero</strong> es una compañía argentina de teatro para escuelas fundada en 1995
                    que investiga y representa la historia argentina mediante comedias musicales. Obras sobre Manuel Belgrano,
                    San Martín, Sarmiento, la Revolución de Mayo, pueblos originarios y la vida cotidiana colonial.
                    Llevamos espectáculos a colegios de todo el país y presentamos temporadas en teatros públicos de Buenos Aires.
                </p>
            </section>

            {/* Próximas funciones */}
            {upcoming.length > 0 && (
                <section className="border-t border-gray-200 py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Cartelera</p>
                                <h2 className="mt-2 text-[38px] md:text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                                    Próximas funciones
                                </h2>
                            </div>
                            <Link href="/cartelera" className="text-[11px] font-display font-bold uppercase tracking-widest text-primary hover:text-accent">
                                Ver todas →
                            </Link>
                        </div>
                        <CarteleraLista funciones={upcoming} works={obras} venues={venues} />
                    </div>
                </section>
            )}

            {/* Obras destacadas */}
            {todasDestacadas.length > 0 && (
                <section className="border-t border-gray-200 py-16 md:py-24 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Repertorio</p>
                                <h2 className="mt-2 text-[38px] md:text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                                    Obras {destacadas.length > 0 ? "en estreno" : "destacadas"}
                                </h2>
                            </div>
                            <Link href="/repertorio" className="text-[11px] font-display font-bold uppercase tracking-widest text-primary hover:text-accent">
                                Ver todas →
                            </Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {todasDestacadas.map((obra, i) => (
                                <ObraCard key={obra.id} obra={obra} priority={i === 0} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Stats */}
            {stats?.items && stats.items.length > 0 && (
                <section className="border-t border-gray-200 py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <div className="grid gap-10 md:grid-cols-4">
                            {stats.items.map(s => (
                                <div key={s.label} className="border-l-2 border-accent pl-6">
                                    <p className="text-[54px] md:text-[72px] font-display font-bold tracking-[-2px] text-primary leading-none">
                                        {s.value.toLocaleString("es-AR")}{s.suffix ?? ""}
                                    </p>
                                    <p className="mt-2 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Sponsors */}
            {sponsors.length > 0 && (
                <section className="border-t border-gray-200 py-14 bg-white">
                    <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <p className="text-center text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-10">
                            Apoyan y declaran de interés
                        </p>
                        <ul className="flex flex-wrap items-center justify-center gap-10 grayscale opacity-80">
                            {sponsors.map(s => (
                                <li key={s.id} className="text-sm font-display font-bold text-gray-400">
                                    {s.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
}
