import Link from "next/link";
import type { SiteConfigContact, SiteConfigSocial } from "@/types";

export function Footer({
    contact,
    social,
}: {
    contact?: SiteConfigContact | null;
    social?: SiteConfigSocial | null;
}) {
    return (
        <footer className="border-t border-gray-200 bg-primary text-white mt-20">
            <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 grid gap-10 md:grid-cols-4">
                <div className="md:col-span-2">
                    <p className="text-[22px] font-display font-bold tracking-[-0.5px]">
                        El Museo Viajero
                    </p>
                    <p className="mt-3 text-sm font-sans text-gray-300 max-w-md">
                        Compañía de teatro histórico para escuelas desde 1995. Comedias musicales sobre la historia argentina.
                    </p>
                </div>
                <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400">Explorar</p>
                    <ul className="mt-4 space-y-2 text-sm font-sans">
                        <li><Link href="/cartelera" className="hover:text-accent transition-colors">Cartelera</Link></li>
                        <li><Link href="/repertorio" className="hover:text-accent transition-colors">Repertorio</Link></li>
                        <li><Link href="/materiales" className="hover:text-accent transition-colors">Materiales</Link></li>
                        <li><Link href="/publicaciones" className="hover:text-accent transition-colors">Libros</Link></li>
                        <li><Link href="/prensa" className="hover:text-accent transition-colors">Prensa</Link></li>
                        <li><Link href="/nosotros" className="hover:text-accent transition-colors">Nosotros</Link></li>
                        <li><Link href="/contacto" className="hover:text-accent transition-colors">Contacto</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400">Contacto</p>
                    <ul className="mt-4 space-y-2 text-sm font-sans">
                        {contact?.email && (
                            <li><a href={`mailto:${contact.email}`} className="hover:text-accent">{contact.email}</a></li>
                        )}
                        {contact?.phone && (
                            <li><a href={`tel:${contact.phone}`} className="hover:text-accent">{contact.phone}</a></li>
                        )}
                        {contact?.whatsApp && (
                            <li><a href={`https://wa.me/${contact.whatsApp}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">WhatsApp</a></li>
                        )}
                    </ul>
                    {social?.links && social.links.length > 0 && (
                        <ul className="mt-5 flex gap-4">
                            {social.links.map(l => (
                                <li key={l.url}>
                                    <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label} className="text-sm text-gray-300 hover:text-accent">
                                        {l.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-800">
                <div className="mx-auto max-w-7xl px-6 py-5 md:px-10 text-[11px] font-sans uppercase tracking-widest text-gray-500 text-center md:text-left">
                    © {new Date().getFullYear()} El Museo Viajero — Compañía de teatro histórico
                </div>
            </div>
        </footer>
    );
}
