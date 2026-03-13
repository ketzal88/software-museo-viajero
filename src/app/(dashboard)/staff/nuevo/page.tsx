import { StaffForm } from "@/features/staff/components/StaffForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NuevoStaffPage() {
    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/staff"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Elenco
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Nuevo Integrante
                </h1>
                <p className="text-gray-600 font-sans text-xl">Registra un nuevo miembro del elenco.</p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <StaffForm />
            </div>
        </div>
    );
}
