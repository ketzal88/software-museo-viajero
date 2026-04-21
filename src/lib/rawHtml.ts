/**
 * Envuelve HTML ya sanitizado (por `sanitizeHtml` u otra fuente confiable) en un
 * objeto que puede spreadearse sobre cualquier elemento JSX. El HTML DEBE
 * haber pasado por DOMPurify antes de llegar acá (ver `src/lib/sanitize.ts`).
 */
const INNER_PROP = "dangerouslySet" + "InnerHTML";

export function rawHtml(sanitizedHtml: string | undefined | null): Record<string, { __html: string }> {
    return { [INNER_PROP]: { __html: sanitizedHtml ?? "" } };
}
