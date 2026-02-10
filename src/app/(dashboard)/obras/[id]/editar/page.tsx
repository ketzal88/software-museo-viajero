import { WorkForm } from "@/features/works/components/WorkForm";
import { getWorkById } from "@/lib/actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditWorkPage({ params }: { params: { id: string } }) {
    const work = await getWorkById(params.id);

    if (!work) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/obras"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Obras
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Editar Obra</h1>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {work.title}
                    </span>
                </div>
                <p className="text-muted-foreground">Modifica los detalles de la obra.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <WorkForm initialData={work} />
            </div>
        </div>
    );
}
