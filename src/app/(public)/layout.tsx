import type { Metadata } from "next";
import { NavBar } from "@/features/public/NavBar";
import { Footer } from "@/features/public/Footer";
import { StructuredData } from "@/features/public/StructuredData";
import { buildOrganizationSchema, buildWebSiteSchema, SITE_CONFIG } from "@/lib/schema";
import { getSiteConfig } from "@/lib/actions";
import type { SiteConfigContact, SiteConfigSocial } from "@/types";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
        default: "El Museo Viajero — Teatro histórico para escuelas",
        template: "%s | El Museo Viajero",
    },
    description: SITE_CONFIG.description,
    applicationName: SITE_CONFIG.name,
    keywords: [
        "teatro escolar", "teatro histórico", "comedias musicales", "Argentina", "Buenos Aires",
        "Museo Viajero", "Belgrano", "San Martín", "Revolución de Mayo", "pueblos originarios",
        "obras de teatro para colegios", "educación",
    ],
    authors: [{ name: "El Museo Viajero" }],
    creator: "El Museo Viajero",
    publisher: "El Museo Viajero",
    alternates: {
        canonical: SITE_CONFIG.url,
    },
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: SITE_CONFIG.url,
        siteName: SITE_CONFIG.name,
        title: "El Museo Viajero — Teatro histórico para escuelas",
        description: SITE_CONFIG.description,
        images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: SITE_CONFIG.name }],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const [contact, social] = await Promise.all([
        getSiteConfig<SiteConfigContact>("contact"),
        getSiteConfig<SiteConfigSocial>("social"),
    ]);

    const schemas = [
        buildWebSiteSchema(),
        buildOrganizationSchema(social?.links),
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white text-primary">
            <StructuredData schema={schemas} />
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer contact={contact} social={social} />
        </div>
    );
}
