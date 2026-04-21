import Link from "next/link";

const NAV_LINKS_PUBLIC = [
    { href: "/", label: "Inicio" },
    { href: "/cartelera", label: "Cartelera" },
    { href: "/repertorio", label: "Repertorio" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
];

export function NavBar() {
    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
                <Link href="/" className="flex items-center gap-3" aria-label="Inicio">
                    <span className="text-[22px] font-display font-bold tracking-[-0.5px] text-primary leading-none">
                        El Museo Viajero
                    </span>
                </Link>
                <ul className="hidden md:flex items-center gap-8">
                    {NAV_LINKS_PUBLIC.map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-sm font-display font-semibold text-primary hover:text-accent transition-colors"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link
                    href="/cartelera"
                    className="hidden md:inline-flex items-center border border-primary bg-primary px-5 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent transition-colors"
                >
                    Ver funciones
                </Link>
            </nav>
            {/* Mobile nav */}
            <div className="md:hidden border-t border-gray-200 px-6 py-3 overflow-x-auto">
                <ul className="flex items-center gap-6 whitespace-nowrap">
                    {NAV_LINKS_PUBLIC.map(link => (
                        <li key={link.href}>
                            <Link href={link.href} className="text-xs font-display font-semibold text-primary">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}
