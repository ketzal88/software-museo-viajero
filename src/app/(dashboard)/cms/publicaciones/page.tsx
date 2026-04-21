import { getPublicaciones } from "@/lib/actions";
import { SimpleCmsHeader, SimpleCmsRow } from "@/features/cms/SimpleList";

export const dynamic = "force-dynamic";

export default async function CmsPublicacionesPage() {
    const publicaciones = await getPublicaciones();
    return (
        <div className="flex flex-col gap-6">
            <SimpleCmsHeader
                eyebrow="CMS · Sitio público"
                title="Publicaciones"
                subtitle={`${publicaciones.length} libros editados.`}
                newHref="/cms/publicaciones/nueva"
                newLabel="Nuevo libro"
            />
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {publicaciones.map(p => (
                    <li key={p.id}>
                        <SimpleCmsRow
                            href={`/cms/publicaciones/${p.id}/editar`}
                            eyebrow={`${p.editorial}${p.year ? ` · ${p.year}` : ""}`}
                            title={p.title}
                            meta={p.subtitle}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
