import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/actions";
import { ContactForm } from "@/features/public/ContactForm";
import { StructuredData } from "@/features/public/StructuredData";
import { buildContactPageSchema, buildBreadcrumbSchema } from "@/lib/schema";
import type { SiteConfigContact } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Contacto",
    description: "Contactá al Museo Viajero para reservar una función en tu colegio o consultar por cualquier obra del repertorio. Respondemos por email o WhatsApp.",
    alternates: { canonical: "/contacto" },
};

export default async function ContactoPage() {
    const contact = await getSiteConfig<SiteConfigContact>("contact");

    const schemas = [
        buildBreadcrumbSchema([
            { name: "Inicio", url: "/" },
            { name: "Contacto", url: "/contacto" },
        ]),
    ];
    if (contact) schemas.push(buildContactPageSchema(contact));

    return (
        <div>
            <StructuredData schema={schemas} id="contacto-schema" />

            <header className="mx-auto max-w-4xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Reservas y consultas
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    Contacto
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-sans text-gray-700 leading-relaxed">
                    Escribinos para reservar funciones, consultar por una obra específica o cualquier otra cosa.
                    Respondemos en 48 horas hábiles.
                </p>
            </header>

            <div className="mx-auto max-w-5xl px-6 pb-24 md:px-10 grid lg:grid-cols-3 gap-12">
                <aside className="space-y-8">
                    {contact?.email && (
                        <div>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Email</p>
                            <a href={`mailto:${contact.email}`} className="mt-1 block text-lg font-sans text-primary hover:text-accent">
                                {contact.email}
                            </a>
                        </div>
                    )}
                    {contact?.phone && (
                        <div>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Teléfono</p>
                            <a href={`tel:${contact.phone}`} className="mt-1 block text-lg font-sans text-primary hover:text-accent">
                                {contact.phone}
                            </a>
                        </div>
                    )}
                    {contact?.whatsApp && (
                        <div>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">WhatsApp</p>
                            <a
                                href={`https://wa.me/${contact.whatsApp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center border border-accent bg-accent px-5 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-primary hover:border-primary"
                            >
                                Escribir por WhatsApp
                            </a>
                        </div>
                    )}
                </aside>

                <div className="lg:col-span-2">
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
