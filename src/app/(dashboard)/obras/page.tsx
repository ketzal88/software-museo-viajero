import { getWorks } from "@/lib/actions";
import { WorkList } from "@/features/works/components/WorkList";
import Link from "next/link";
import { Plus, Theater } from "lucide-react";

export default async function ObrasPage() {
    const works = await getWorks();

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Theater className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Obras</h1>
                        <p className="text-muted-foreground text-lg">Catálogo de repertorio del Museo Viajero.</p>
                    </div>
                </div>
                <Link
                    href="/obras/nueva"
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" /> Nueva Obra
                </Link>
            </header>

            <WorkList works={works} />
        </div>
    );
}
