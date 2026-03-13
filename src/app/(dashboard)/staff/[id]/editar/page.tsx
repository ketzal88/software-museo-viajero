import { getPersonById } from "@/lib/actions";
import { StaffForm } from "@/features/staff/components/StaffForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditarStaffPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarStaffPage({ params }: EditarStaffPageProps) {
    const { id } = await params;
    const person = await getPersonById(id);

    if (!person) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href={`/staff/${id}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a {person.displayName}
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Editar Integrante
                </h1>
                <p className="text-gray-600 font-sans text-xl">Modificando datos de {person.displayName}.</p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <StaffForm initialData={person} />
            </div>
        </div>
    );
}
