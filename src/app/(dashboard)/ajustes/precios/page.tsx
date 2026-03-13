import { getPricingRules } from "@/lib/actions";
import { PricingManager } from "@/features/pricing/components/PricingManager";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function PreciosPage() {
    const rules = await getPricingRules();

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-2">
                <Link
                    href="/ajustes"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Configuración
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Reglas de Precios
                </h1>
                <p className="text-gray-600 font-sans text-xl">Tickets de teatro y formatos de viaje por vigencia.</p>
            </header>

            <PricingManager initialRules={rules} />
        </div>
    );
}
