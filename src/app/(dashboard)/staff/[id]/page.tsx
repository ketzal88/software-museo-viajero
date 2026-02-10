import { getPersonById, getPersonRates, getCastByPerson, getWorks } from "@/lib/actions";
import { PersonDetails } from "@/features/staff/components/PersonDetails";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PersonViewPage({ params }: { params: { id: string } }) {
    const person = await getPersonById(params.id);
    if (!person) notFound();

    const [rates, castings, allWorks] = await Promise.all([
        getPersonRates(params.id),
        getCastByPerson(params.id),
        getWorks()
    ]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/staff"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Detalle del Staff
                    </h1>
                </div>
            </div>

            <PersonDetails
                person={person}
                rates={rates}
                castings={castings}
                allWorks={allWorks}
            />
        </div>
    );
}
