import { getPeople } from "@/lib/actions";
import { StaffList } from "@/features/staff/components/StaffList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function StaffPage() {
    const people = await getPeople();

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                        Elenco
                    </h1>
                    <p className="text-gray-600 font-sans text-xl mt-2">Administra actores, asistentes y sus liquidaciones.</p>
                </div>
                <Link
                    href="/staff/nuevo"
                    className="flex items-center gap-2 bg-primary px-8 py-3.5 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                >
                    <Plus className="h-5 w-5" /> Nuevo Integrante
                </Link>
            </header>

            <StaffList people={people} />
        </div>
    );
}
