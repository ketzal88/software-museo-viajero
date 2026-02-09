import { SchoolForm } from "@/features/schools/components/SchoolForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NuevaEscuelaPage() {
    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/escuelas"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Escuelas
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Registro de Escuela</h1>
                <p className="text-muted-foreground">Ingresa los datos de la nueva institución.</p>
            </header>

            <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                <SchoolForm />
            </div>
        </div>
    );
}
