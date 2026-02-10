"use client";

import { useState } from "react";
import { closeEventDay } from "@/lib/actions";
import { Lock, Loader2, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CloseoutButtonProps {
    eventDayId: string;
    isClosed: boolean;
}

export function CloseoutButton({ eventDayId, isClosed }: CloseoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleClose = async () => {
        setLoading(true);
        setShowConfirm(false);
        try {
            const result = await closeEventDay(eventDayId);
            if (result.success) {
                toast.success("Jornada cerrada y resumen generado");
                router.refresh();
            } else {
                toast.error(result.error || "Error al cerrar la jornada");
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    if (isClosed) {
        return (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-black border border-green-200 shadow-sm animate-in fade-in zoom-in-95">
                <CheckCircle className="h-4 w-4" /> JORNADA CERRADA
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                disabled={loading}
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                CERRAR JORNADA Y GENERAR REPORTE
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <button onClick={() => setShowConfirm(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Cerrar Jornada?</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Esta acción es <strong>irreversible</strong> e impactará en los reportes contables mensuales.
                                Asegúrate de haber cargado toda la asistencia correctamente para todas las escuelas.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                >
                                    Confirmar Cierre
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
