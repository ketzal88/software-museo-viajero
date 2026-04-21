import Link from "next/link";
import Image from "next/image";
import type { Work } from "@/types";
import { sanitizeHtml } from "@/lib/sanitize";
import { rawHtml } from "@/lib/rawHtml";

export function ObraCard({ obra, priority = false }: { obra: Work; priority?: boolean }) {
    const href = `/repertorio/${obra.slug}`;
    const estrenoCleaned = obra.estrenoText
        ? sanitizeHtml(obra.estrenoText).replace(/<br\s*\/?>/gi, " · ")
        : "";
    return (
        <Link
            href={href}
            className="group block border border-gray-200 bg-white overflow-hidden hover:border-primary transition-colors"
        >
            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                {obra.imgPortada ? (
                    <Image
                        src={obra.imgPortada}
                        alt={`${obra.title}${obra.subTitle ? ` — ${obra.subTitle}` : " — El Museo Viajero"}`}
                        fill
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">
                        Sin imagen
                    </div>
                )}
                {obra.estreno && estrenoCleaned && (
                    <span
                        className="absolute left-4 top-4 bg-accent px-3 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-white"
                        {...rawHtml(estrenoCleaned)}
                    />
                )}
            </div>
            <div className="p-5">
                {obra.tipoDeObra && (
                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-500">
                        {obra.tipoDeObra}
                    </p>
                )}
                <h3 className="mt-2 text-xl font-display font-bold leading-tight text-primary group-hover:text-accent transition-colors">
                    {obra.title}
                </h3>
                {obra.subTitle && (
                    <p className="mt-1 text-sm font-sans text-gray-600 line-clamp-2">
                        {obra.subTitle}
                    </p>
                )}
            </div>
        </Link>
    );
}
