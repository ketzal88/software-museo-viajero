import { getPersonById } from "@/lib/actions";
import { StaffForm } from "@/features/staff/components/StaffForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
    const person = await getPersonById(params.id);
    if (!person) notFound();

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href={`/staff/${params.id}`}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Editar Staff
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Modifica la información de {person.displayName}.
                    </p>
                </div>
            </div>

            <StaffForm initialData={person} />
        </div>
    );
}
