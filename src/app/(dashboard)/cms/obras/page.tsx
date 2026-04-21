import Link from "next/link";
import { getWorksPublic } from "@/lib/actions";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CmsObrasPage() {
    const obras = await getWorksPublic();

    return (
        <div className="flex flex-col gap-10">
            <header className="flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                        CMS · Sitio público
                    </p>
                    <h1 className="mt-2 text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                        Obras
                    </h1>
                    <p className="mt-3 font-sans text-gray-600 text-lg">
                        {obras.length} obras en el repertorio público.
                    </p>
                </div>
                <Link
                    href="/cms"
                    className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 hover:text-primary"
                >
                    ← Volver al CMS
                </Link>
            </header>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {obras.map(obra => (
                    <li key={obra.id}>
                        <Link
                            href={`/cms/obras/${obra.id}/editar`}
                            className="group grid grid-cols-[1fr_auto] items-center gap-6 py-5"
                        >
                            <div>
                                <p className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-500">
                                    {obra.tipoDeObra ?? "Obra"}{obra.estreno ? " · En estreno" : ""}
                                </p>
                                <h3 className="mt-1 text-xl font-display font-bold text-primary group-hover:text-accent">
                                    {obra.title}
                                </h3>
                                {obra.subTitle && (
                                    <p className="mt-1 text-sm font-sans text-gray-600">{obra.subTitle}</p>
                                )}
                                <p className="mt-2 text-xs font-sans text-gray-400">/repertorio/{obra.slug}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
