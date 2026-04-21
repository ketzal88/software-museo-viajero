import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/schema";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Crawlers generales
            { userAgent: "*", allow: "/", disallow: ["/panel/", "/calendario/", "/reservas/", "/inbox/", "/liquidaciones/", "/staff/", "/escuelas/", "/teatros/", "/obras/", "/temporadas/", "/reportes/", "/ajustes/", "/login", "/api/"] },
            // Crawlers de IA — permitir explícitamente
            { userAgent: "GPTBot", allow: "/" },
            { userAgent: "OAI-SearchBot", allow: "/" },
            { userAgent: "ChatGPT-User", allow: "/" },
            { userAgent: "PerplexityBot", allow: "/" },
            { userAgent: "ClaudeBot", allow: "/" },
            { userAgent: "Claude-Web", allow: "/" },
            { userAgent: "anthropic-ai", allow: "/" },
            { userAgent: "Google-Extended", allow: "/" },
            { userAgent: "Bingbot", allow: "/" },
            { userAgent: "Applebot-Extended", allow: "/" },
            { userAgent: "CCBot", allow: "/" },
        ],
        sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
        host: SITE_CONFIG.url,
    };
}
