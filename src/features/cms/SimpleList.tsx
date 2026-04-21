import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export function SimpleCmsHeader({
    eyebrow,
    title,
    subtitle,
    newHref,
    newLabel,
    backHref = "/cms",
}: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    newHref?: string;
    newLabel?: string;
    backHref?: string;
}) {
    return (
        <header className="flex items-end justify-between mb-8">
            <div>
                {eyebrow && (
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
                )}
                <h1 className="mt-2 text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">{title}</h1>
                {subtitle && <p className="mt-3 font-sans text-gray-600 text-lg">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
                {newHref && (
                    <Link href={newHref} className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent">
                        <Plus className="h-4 w-4" /> {newLabel ?? "Nuevo"}
                    </Link>
                )}
                <Link href={backHref} className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 hover:text-primary">← CMS</Link>
            </div>
        </header>
    );
}

export function SimpleCmsRow({
    href,
    eyebrow,
    title,
    meta,
}: {
    href: string;
    eyebrow?: string;
    title: string;
    meta?: string;
}) {
    return (
        <Link href={href} className="group grid grid-cols-[1fr_auto] items-center gap-6 py-5">
            <div>
                {eyebrow && <p className="text-[10px] font-display font-bold uppercase tracking-widest text-accent">{eyebrow}</p>}
                <h3 className="mt-1 text-lg font-display font-bold text-primary group-hover:text-accent">{title}</h3>
                {meta && <p className="mt-1 text-sm font-sans text-gray-600">{meta}</p>}
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
        </Link>
    );
}
