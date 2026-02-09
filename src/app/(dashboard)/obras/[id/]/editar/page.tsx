import { getWorkById } from "@/lib/actions";
import { WorkForm } from "@/features/works/components/WorkForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditarObraPageProps {
    params: {
        id: string;
    };
}

export default async function EditarObraPage({ params }: EditarObraPageProps) {
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
                <h1 className="text-3xl font-bold tracking-tight">Editar Obra</h1>
                <p className="text-muted-foreground">Actualizando información de {work.title}.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <WorkForm initialData={work} />
            </div>
        </div>
    );
}
