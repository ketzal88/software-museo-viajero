import { StaffForm } from "@/features/staff/components/StaffForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewStaffPage() {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/staff"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Nuevo Staff
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Agrega un nuevo integrante al elenco o al personal de asistencia.
                    </p>
                </div>
            </div>

            <StaffForm />
        </div>
    );
}
