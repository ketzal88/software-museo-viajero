import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
    "b", "strong", "em", "i", "u", "br", "p", "span",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote", "a",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeHtml(input: string | undefined | null): string {
    if (!input) return "";
    const clean = DOMPurify.sanitize(input, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
    });
    // Forzar rel seguro en links externos
    return clean.replace(
        /<a\s+([^>]*?)>/gi,
        (match, attrs) => {
            if (!/rel\s*=/.test(attrs)) {
                return `<a ${attrs} rel="noopener noreferrer" target="_blank">`;
            }
            return match;
        }
    );
}

export function htmlToPlainText(html: string | undefined | null, maxLength = 160): string {
    if (!html) return "";
    const plain = html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/(p|h[1-6]|li|div)>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    if (plain.length <= maxLength) return plain;
    return plain.slice(0, maxLength - 1).trim() + "…";
}
