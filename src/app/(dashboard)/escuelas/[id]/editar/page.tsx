import { getSchoolById } from "@/lib/actions";
import { SchoolForm } from "@/features/schools/components/SchoolForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditarEscuelaPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarEscuelaPage({ params }: EditarEscuelaPageProps) {
    const { id } = await params;
    const school = await getSchoolById(id);

    if (!school) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/escuelas"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Escuelas
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Editar Escuela
                </h1>
                <p className="text-gray-600 font-sans text-xl">Modificando datos de {school.name}.</p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <SchoolForm initialData={school} />
            </div>
        </div>
    );
}
