import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentPublicUser } from "@/lib/actions";
import { PerfilForm } from "@/features/public/PerfilForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Mi perfil",
    description: "Editá tus datos y accedé a tus contenidos.",
    robots: { index: false, follow: false },
};

const NIVEL_LABELS: Record<number, string> = {
    0: "Acceso libre",
    1: "Nivel Bronce",
    2: "Nivel Plata",
    3: "Nivel Oro",
    9: "Administrador",
};

export default async function PerfilPage() {
    const user = await getCurrentPublicUser();
    if (!user) redirect("/ingresar?next=/perfil");

    return (
        <div className="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
            <header className="mb-12 flex items-start justify-between gap-6 border-b border-gray-200 pb-10">
                <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                        Tu cuenta
                    </p>
                    <h1 className="mt-3 text-[44px] md:text-[54px] font-display font-bold tracking-[-2px] text-primary leading-[1]">
                        {user.displayName || "Mi perfil"}
                    </h1>
                    <p className="mt-3 text-base font-sans text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Nivel</p>
                    <p className="mt-1 text-2xl font-display font-bold text-primary">
                        {NIVEL_LABELS[user.nivelSuscripcion] ?? "Libre"}
                    </p>
                </div>
            </header>
            <PerfilForm user={user} />
        </div>
    );
}
