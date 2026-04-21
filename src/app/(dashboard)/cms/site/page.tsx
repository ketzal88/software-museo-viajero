import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const SECTIONS = [
    { href: "/cms/site/nosotros", label: "Nosotros", desc: "Texto principal de la página /nosotros." },
    { href: "/cms/site/contact", label: "Contacto", desc: "Email, teléfono y WhatsApp mostrados en el sitio y footer." },
    { href: "/cms/site/stats", label: "Estadísticas", desc: "Números grandes del home (años, funciones, etc.)." },
    { href: "/cms/site/social", label: "Redes sociales", desc: "Links a Instagram, YouTube, Facebook del footer." },
];

export default function CmsSitePage() {
    return (
        <div className="flex flex-col gap-10">
            <header className="flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">CMS · Sitio público</p>
                    <h1 className="mt-2 text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">Contenido del sitio</h1>
                    <p className="mt-3 font-sans text-gray-600 text-lg">Textos transversales, datos de contacto y footer.</p>
                </div>
                <Link href="/cms" className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 hover:text-primary">← CMS</Link>
            </header>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {SECTIONS.map(s => (
                    <li key={s.href}>
                        <Link href={s.href} className="group grid grid-cols-[1fr_auto] items-center gap-6 py-5">
                            <div>
                                <h3 className="text-lg font-display font-bold text-primary group-hover:text-accent">{s.label}</h3>
                                <p className="text-sm font-sans text-gray-600">{s.desc}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
