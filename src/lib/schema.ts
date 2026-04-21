/**
 * Helpers de JSON-LD (structured data) para el sitio público.
 * Usados por el componente <StructuredData /> y los layouts/pages.
 * Objetivo: mejorar SEO + citación por LLMs (ChatGPT, Perplexity, Google AI Overviews).
 */

import type { Work, FuncionCartelera, Venue, CronologiaItem } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elmuseoviajero.com.ar";
const ORG_NAME = "El Museo Viajero";
const ORG_DESCRIPTION = "Compañía de teatro histórico para escuelas. Comedias musicales sobre historia argentina — revolución de mayo, Belgrano, San Martín, pueblos originarios y más.";

// Cualquier shape de schema — se serializa a JSON-LD.
type JsonLd = Record<string, unknown>;

export function buildOrganizationSchema(social?: { icon: string; url: string; label: string }[]): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": ["Organization", "PerformingGroup", "LocalBusiness"],
        "name": ORG_NAME,
        "alternateName": "Museo Viajero",
        "description": ORG_DESCRIPTION,
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.svg`,
        "foundingDate": "1995",
        "founder": [
            { "@type": "Person", "name": "Héctor López Girondo" },
            { "@type": "Person", "name": "Raquel Prestigiacomo" },
            { "@type": "Person", "name": "Fabián Uccello" },
        ],
        "areaServed": { "@type": "Country", "name": "Argentina" },
        "sameAs": social?.map(s => s.url) ?? [],
    };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((it, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": it.name,
            "item": it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
        })),
    };
}

export function buildTheaterEventSchema(funcion: FuncionCartelera, work: Work, venue: Venue | null): JsonLd {
    const horarios = funcion.horarios ?? [];
    const startTime = horarios[0] ?? "09:00";
    return {
        "@context": "https://schema.org",
        "@type": "TheaterEvent",
        "name": work.title,
        "description": work.subTitle || work.description,
        "startDate": funcion.fechaFuncion ? `${funcion.fechaFuncion}T${startTime}:00-03:00` : undefined,
        "endDate": funcion.fechaFuncion ? `${funcion.fechaFuncion}T23:59:00-03:00` : undefined,
        "eventStatus": funcion.agotada ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": venue ? {
            "@type": "Place",
            "name": venue.name,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": venue.addressLine || venue.address,
                "addressLocality": "Buenos Aires",
                "addressCountry": "AR",
            },
        } : undefined,
        "performer": {
            "@type": "PerformingGroup",
            "name": ORG_NAME,
        },
        "offers": {
            "@type": "Offer",
            "price": String(funcion.precio),
            "priceCurrency": "ARS",
            "availability": funcion.agotada ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            "url": `${SITE_URL}/cartelera`,
        },
        "image": work.imgPortada ? `${SITE_URL}${work.imgPortada}` : undefined,
    };
}

export function buildCreativeWorkSchema(work: Work): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "TheaterPlay",
        "name": work.title,
        "alternateName": work.subTitle,
        "description": work.description || work.subTitle,
        "genre": work.tipoDeObra,
        "keywords": work.keywords?.join(", "),
        "image": work.imgPortada ? `${SITE_URL}${work.imgPortada}` : undefined,
        "creator": {
            "@type": "PerformingGroup",
            "name": ORG_NAME,
        },
        "datePublished": work.anioEstreno ? String(work.anioEstreno) : undefined,
        "award": work.premios?.map(p => p.texto),
        "dateModified": work.dateModified,
        "url": work.slug ? `${SITE_URL}/repertorio/${work.slug}` : SITE_URL,
    };
}

export function buildFAQSchema(questions: { question: string; answer: string }[]): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map(q => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": q.answer,
            },
        })),
    };
}

export function buildAboutPageSchema(title: string, body: string, cronologia?: CronologiaItem[]): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": title,
        "description": body.replace(/<[^>]+>/g, "").slice(0, 300),
        "url": `${SITE_URL}/nosotros`,
        "mainEntity": {
            "@type": "Organization",
            "name": ORG_NAME,
            "foundingDate": "1995",
            "description": ORG_DESCRIPTION,
        },
        "hasPart": cronologia?.slice(0, 10).map(c => ({
            "@type": "Event",
            "name": `Museo Viajero ${c.year}`,
            "startDate": String(c.year),
            "description": c.events.join(" | "),
        })),
    };
}

export function buildContactPageSchema(contact: { email: string; phone: string; whatsApp: string }): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "url": `${SITE_URL}/contacto`,
        "name": `Contacto — ${ORG_NAME}`,
        "mainEntity": {
            "@type": "Organization",
            "name": ORG_NAME,
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "email": contact.email,
                    "telephone": contact.phone,
                },
                {
                    "@type": "ContactPoint",
                    "contactType": "reservations",
                    "telephone": `+${contact.whatsApp}`,
                    "availableLanguage": "Spanish",
                },
            ],
        },
    };
}

export function buildWebSiteSchema(): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": ORG_NAME,
        "url": SITE_URL,
        "inLanguage": "es-AR",
        "publisher": {
            "@type": "Organization",
            "name": ORG_NAME,
            "logo": `${SITE_URL}/logo.svg`,
        },
    };
}

export const SITE_CONFIG = {
    url: SITE_URL,
    name: ORG_NAME,
    description: ORG_DESCRIPTION,
    locale: "es_AR",
};
