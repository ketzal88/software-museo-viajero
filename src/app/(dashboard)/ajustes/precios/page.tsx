import { getPricingRules } from "@/lib/actions";
import { PricingManager } from "@/features/pricing/components/PricingManager";
import { ChevronLeft, Calculator } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
    const rules = await getPricingRules();

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col gap-4">
                <Link href="/ajustes" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors w-fit">
                    <ChevronLeft className="h-4 w-4" /> Volver a Ajustes
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Reglas de Precios</h1>
                        <p className="text-muted-foreground mt-1">Configura cuánto se cobra según la vigencia del evento.</p>
                    </div>
                </div>
            </header>

            <PricingManager initialRules={rules} />
        </div>
    );
}
