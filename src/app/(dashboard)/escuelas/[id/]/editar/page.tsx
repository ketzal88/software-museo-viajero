import { getSchoolById } from "@/lib/actions";
import { SchoolForm } from "@/features/schools/components/SchoolForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditarEscuelaPageProps {
    params: {
        id: string;
    };
}

export default async function EditarEscuelaPage({ params }: EditarEscuelaPageProps) {
    const school = await getSchoolById(params.id);

    if (!school) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/escuelas"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Escuelas
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Escuela</h1>
                <p className="text-muted-foreground">Actualizando datos de {school.name}.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <SchoolForm initialData={school} />
            </div>
        </div>
    );
}
