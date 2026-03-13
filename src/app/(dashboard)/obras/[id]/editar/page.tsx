import { getWorkById } from "@/lib/actions";
import { WorkForm } from "@/features/works/components/WorkForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditarObraPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarObraPage({ params }: EditarObraPageProps) {
    const { id } = await params;
    const work = await getWorkById(id);

    if (!work) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href={`/obras/${id}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a {work.title}
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Editar Obra
                </h1>
                <p className="text-gray-600 font-sans text-xl">Modificando datos de {work.title}.</p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <WorkForm initialData={work} />
            </div>
        </div>
    );
}
