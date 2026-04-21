import Link from "next/link";
import { Theater, Calendar, Image as ImageIcon, Users, FileText } from "lucide-react";
import { getWorksPublic, getFuncionesActivas, getHeroSlides } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function CmsIndexPage() {
    const [obras, funciones, slides] = await Promise.all([
        getWorksPublic(),
        getFuncionesActivas(),
        getHeroSlides(),
    ]);

    const sections = [
        { href: "/cms/obras", label: "Obras", icon: Theater, count: obras.length, desc: "Catálogo público: fichas, fotos, descripciones." },
        { href: "/cms/cartelera", label: "Cartelera", icon: Calendar, count: funciones.length, desc: "Funciones programadas en teatros públicos." },
        { href: "/cms/hero", label: "Hero Home", icon: ImageIcon, count: slides.length, desc: "Slides del encabezado de la home." },
        { href: "/cms/site", label: "Contenido del sitio", icon: FileText, desc: "Nosotros, contacto, stats, sociales, footer." },
        { href: "/cms/staff-publico", label: "Staff público (próximo)", icon: Users, desc: "Personas visibles en el sitio." },
    ];

    return (
        <div className="flex flex-col gap-12">
            <header>
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Sitio público
                </p>
                <h1 className="mt-2 text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    CMS
                </h1>
                <p className="mt-3 font-sans text-gray-600 text-lg max-w-2xl">
                    Editá el contenido que ven los visitantes en <strong>elmuseoviajero.com.ar</strong>.
                    Los cambios se propagan automáticamente tras guardar.
                </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sections.map(s => {
                    const Icon = s.icon;
                    return (
                        <Link
                            key={s.href}
                            href={s.href}
                            className="group border border-gray-300 p-6 hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className="h-5 w-5 text-gray-500 group-hover:text-accent" />
                                <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">
                                    {s.label}
                                </span>
                            </div>
                            {typeof s.count === "number" && (
                                <p className="text-4xl font-display font-bold tracking-tight text-primary mb-2">
                                    {s.count}
                                </p>
                            )}
                            <p className="text-sm font-sans text-gray-600 leading-snug">
                                {s.desc}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
