"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HeroSlide } from "@/types";
import { rawHtml } from "@/lib/rawHtml";

// Nota: el HTML de titulo/subTitulo viene ya sanitizado desde el CMS (pre-sanitize
// en el server action que escribe a Firestore). En MVP confiamos en esa invariante;
// si se abre UI pública al escribir, re-sanitizar en render.

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
    const [index, setIndex] = useState(0);
    const visible = slides.filter(s => s.visible);

    useEffect(() => {
        if (visible.length < 2) return;
        const interval = setInterval(() => {
            setIndex(i => (i + 1) % visible.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [visible.length]);

    if (visible.length === 0) {
        return (
            <section className="relative h-[70vh] min-h-[500px] bg-primary flex items-center justify-center">
                <h1 className="text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-white text-center px-6">
                    El Museo Viajero
                </h1>
            </section>
        );
    }

    const slide = visible[index];
    const href = slide.urlOutside || (slide.ctaPage ? `/repertorio/${slide.ctaPage}` : "/cartelera");

    return (
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
            {visible.map((s, i) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden={i !== index}
                >
                    {s.img && (
                        <Image
                            src={s.img}
                            alt={s.titulo.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                            fill
                            priority={i === 0}
                            sizes="100vw"
                            className={`object-cover object-${s.imgPosition}`}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
            ))}
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24 text-white">
                {slide.small && (
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent mb-3">
                        {slide.small}
                    </p>
                )}
                <h1
                    className="text-[44px] md:text-[84px] font-display font-bold tracking-[-3px] leading-[0.95] max-w-4xl"
                    {...rawHtml(slide.titulo)}
                />
                {slide.subTitulo && (
                    <div
                        className="mt-4 text-base md:text-xl font-sans text-gray-200 max-w-2xl"
                        {...rawHtml(slide.subTitulo)}
                    />
                )}
                {slide.cta && (
                    <Link
                        href={href}
                        className="mt-8 inline-flex w-fit items-center border border-white bg-white px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-primary hover:bg-accent hover:border-accent hover:text-white transition-colors"
                    >
                        {slide.ctaDisplay || slide.cta}
                    </Link>
                )}
            </div>
            {visible.length > 1 && (
                <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {visible.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-1 w-8 transition-all ${i === index ? "bg-white w-12" : "bg-white/40"}`}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
