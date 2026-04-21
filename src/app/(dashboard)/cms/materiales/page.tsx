import { getMateriales } from "@/lib/actions";
import { SimpleCmsHeader, SimpleCmsRow } from "@/features/cms/SimpleList";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

const NIVEL: Record<number, string> = { 0: "Libre", 1: "Bronce", 2: "Plata", 3: "Oro", 9: "Admin" };

export default async function CmsMaterialesPage() {
    const materiales = await getMateriales(999); // Admin ve todos
    return (
        <div className="flex flex-col gap-6">
            <SimpleCmsHeader
                eyebrow="CMS · Sitio público"
                title="Materiales"
                subtitle={`${materiales.length} materiales educativos (Inicial → Secundario).`}
                newHref="/cms/materiales/nuevo"
            />
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {materiales.map(m => (
                    <li key={m.id}>
                        <SimpleCmsRow
                            href={`/cms/materiales/${m.id}/editar`}
                            eyebrow={`${m.tipo} · Nivel ${NIVEL[m.nivelAcceso] ?? m.nivelAcceso}`}
                            title={m.title}
                            meta={m.description}
                        />
                    </li>
                ))}
                {materiales.length === 0 && (
                    <li className="py-10 text-center text-sm text-gray-500 font-sans flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4" /> Sin materiales aún.
                    </li>
                )}
            </ul>
        </div>
    );
}
