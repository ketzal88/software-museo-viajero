import { getSchools } from "@/lib/actions";
import { SchoolList } from "@/features/schools/components/SchoolList";
import Link from "next/link";
import { Plus, GraduationCap } from "lucide-react";

export default async function EscuelasPage() {
    const schools = await getSchools();

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Escuelas</h1>
                        <p className="text-muted-foreground text-lg">Directorio de instituciones y responsables.</p>
                    </div>
                </div>
                <Link
                    href="/escuelas/nueva"
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" /> Nueva Escuela
                </Link>
            </header>

            <SchoolList schools={schools} />
        </div>
    );
}
