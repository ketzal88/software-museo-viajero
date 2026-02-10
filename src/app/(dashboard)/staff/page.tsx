import { getPeople } from "@/lib/actions";
import { StaffList } from "@/features/staff/components/StaffList";

export const metadata = {
    title: "Staff | Soft Museo Viajero",
    description: "Gestión de actores y asistentes.",
};

export default async function StaffPage() {
    const people = await getPeople();

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Personal de Elenco
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Administra los actores, asistentes y sus correspondientes liquidaciones.
                </p>
            </div>

            <StaffList people={people} />
        </div>
    );
}
