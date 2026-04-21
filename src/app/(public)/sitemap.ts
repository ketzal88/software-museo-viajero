import type { MetadataRoute } from "next";
import { getWorksPublic } from "@/lib/actions";
import { SITE_CONFIG } from "@/lib/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const obras = await getWorksPublic();
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_CONFIG.url, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_CONFIG.url}/cartelera`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_CONFIG.url}/repertorio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${SITE_CONFIG.url}/materiales`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_CONFIG.url}/publicaciones`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${SITE_CONFIG.url}/prensa`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
        { url: `${SITE_CONFIG.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${SITE_CONFIG.url}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ];

    const obraRoutes: MetadataRoute.Sitemap = obras
        .filter(o => o.slug)
        .map(o => ({
            url: `${SITE_CONFIG.url}/repertorio/${o.slug}`,
            lastModified: o.dateModified ? new Date(o.dateModified) : now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

    return [...staticRoutes, ...obraRoutes];
}
