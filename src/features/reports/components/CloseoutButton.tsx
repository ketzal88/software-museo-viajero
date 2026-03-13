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
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 text-sm font-display font-bold border border-green-200">
                <CheckCircle className="h-4 w-4" /> JORNADA CERRADA
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                disabled={loading}
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                CERRAR JORNADA Y GENERAR REPORTE
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white max-w-md w-full overflow-hidden border border-gray-300">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-accent/10 text-accent">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-primary transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <h3 className="text-xl font-display font-bold text-primary mb-2">Cerrar Jornada?</h3>
                            <p className="text-sm font-sans text-gray-500 leading-relaxed mb-6">
                                Esta accion es <strong className="text-primary">irreversible</strong> e impactara en los reportes contables mensuales.
                                Asegurate de haber cargado toda la asistencia correctamente para todas las escuelas.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 border border-accent/30 text-accent px-6 py-3 text-sm font-display font-medium hover:bg-accent/5 transition-all"
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
