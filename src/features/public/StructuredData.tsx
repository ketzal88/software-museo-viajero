import { rawHtml } from "@/lib/rawHtml";

/**
 * Inyecta JSON-LD (schema.org) en el HTML server-rendered para SEO + GEO.
 * En App Router, inline con un <script type="application/ld+json"> es lo canónico:
 * los crawlers (Google, ChatGPT, Perplexity) lo leen sin ejecutar JS.
 */
export function StructuredData({
    schema,
    id = "ld-json",
}: {
    schema: Record<string, unknown> | Array<Record<string, unknown>>;
    id?: string;
}) {
    const schemas = Array.isArray(schema) ? schema : [schema];
    return (
        <>
            {schemas.map((s, i) => (
                <script
                    key={`${id}-${i}`}
                    type="application/ld+json"
                    {...rawHtml(JSON.stringify(s))}
                />
            ))}
        </>
    );
}
