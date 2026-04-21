import { getNotasPrensa } from "@/lib/actions";
import { SimpleCmsHeader, SimpleCmsRow } from "@/features/cms/SimpleList";

export const dynamic = "force-dynamic";

export default async function CmsPrensaPage() {
    const notas = await getNotasPrensa();
    return (
        <div className="flex flex-col gap-6">
            <SimpleCmsHeader
                eyebrow="CMS · Sitio público"
                title="Prensa"
                subtitle={`${notas.length} notas publicadas.`}
                newHref="/cms/prensa/nueva"
                newLabel="Nueva nota"
            />
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {notas.map(n => (
                    <li key={n.id}>
                        <SimpleCmsRow
                            href={`/cms/prensa/${n.id}/editar`}
                            eyebrow={`${n.medio} · ${n.fecha}`}
                            title={n.title}
                            meta={n.autor ? `Por ${n.autor}` : undefined}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
