"use client";

import { useEffect } from "react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-center space-y-3">
                <h2 className="text-2xl font-display font-bold text-primary">
                    Algo salió mal
                </h2>
                <p className="text-gray-600 font-sans max-w-md">
                    Ocurrió un error inesperado. Por favor, intenta de nuevo.
                </p>
                {process.env.NODE_ENV === "development" && (
                    <p className="text-sm text-accent font-mono mt-2">
                        {error.message}
                    </p>
                )}
            </div>
            <button
                onClick={reset}
                className="px-8 py-3.5 bg-primary text-white text-sm font-display font-medium transition-all hover:bg-black uppercase tracking-wider"
            >
                Reintentar
            </button>
        </div>
    );
}
