export function slugify(input: string): string {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function ensureUniqueSlug(
    baseSlug: string,
    exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
    const normalized = slugify(baseSlug);
    if (!(await exists(normalized))) return normalized;

    let counter = 2;
    while (await exists(`${normalized}-${counter}`)) {
        counter += 1;
        if (counter > 999) {
            throw new Error(`Unable to generate unique slug for "${baseSlug}"`);
        }
    }
    return `${normalized}-${counter}`;
}
