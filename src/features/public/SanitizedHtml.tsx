import { sanitizeHtml } from "@/lib/sanitize";
import { rawHtml } from "@/lib/rawHtml";

/**
 * Renderiza HTML del CMS pasado por DOMPurify en server.
 * El HTML ya limpio se inyecta mediante el helper `rawHtml`.
 */
export function SanitizedHtml({
    html,
    className,
    as: Tag = "div",
}: {
    html: string | undefined | null;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
}) {
    const clean = sanitizeHtml(html);
    if (!clean) return null;
    const TagEl = Tag as keyof JSX.IntrinsicElements;
    return <TagEl className={className} {...rawHtml(clean)} />;
}
