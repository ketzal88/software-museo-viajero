import { getPersonById, getPersonRates, getCastByPerson, getWorks } from "@/lib/actions";
import { PersonDetails } from "@/features/staff/components/PersonDetails";
import { ChevronLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface StaffDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
    const { id } = await params;
    const [person, rates, castings, allWorks] = await Promise.all([
        getPersonById(id),
        getPersonRates(id),
        getCastByPerson(id),
        getWorks(),
    ]);

    if (!person) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-2">
                <Link
                    href="/staff"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Elenco
                </Link>
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                            {person.displayName}
                        </h1>
                        <p className="text-gray-600 font-sans text-xl mt-2">
                            {person.roleTypes.map((r) => r === "actor" ? "Actor" : r === "assistant" ? "Asistente" : "Staff").join(" / ")}
                            {!person.isActive && " — Inactivo"}
                        </p>
                    </div>
                    <Link
                        href={`/staff/${id}/editar`}
                        className="flex items-center gap-2 border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30"
                    >
                        <Edit className="h-4 w-4" /> Editar
                    </Link>
                </div>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <PersonDetails person={person} rates={rates} castings={castings} allWorks={allWorks} />
            </div>
        </div>
    );
}
