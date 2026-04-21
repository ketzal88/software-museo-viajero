import type { Metadata } from "next";
import { AuthForm } from "@/features/public/AuthForm";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Ingresar",
    description: "Ingresá a tu cuenta del Museo Viajero para acceder a materiales educativos y guardar tu progreso.",
    alternates: { canonical: "/ingresar" },
    robots: { index: false, follow: true },
};

export default function IngresarPage() {
    return (
        <div className="mx-auto max-w-md px-6 py-20 md:px-10 md:py-28">
            <header className="mb-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Tu cuenta
                </p>
                <h1 className="mt-3 text-[44px] md:text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Ingresá al Museo Viajero
                </h1>
                <p className="mt-4 text-base font-sans text-gray-600">
                    Accedé a materiales educativos, descargas y contenidos exclusivos.
                </p>
            </header>
            <Suspense fallback={<p className="text-sm text-gray-500">Cargando...</p>}>
                <AuthForm />
            </Suspense>
        </div>
    );
}
