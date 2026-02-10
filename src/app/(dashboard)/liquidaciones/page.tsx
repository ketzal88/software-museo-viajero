import { getPayouts } from "@/lib/actions";
import { PayoutsList } from "@/features/staff/components/PayoutsList";

export const metadata = {
    title: "Liquidaciones | Soft Museo Viajero",
    description: "Cierre de pagos para elenco y staff.",
};

export default async function LiquidacionesPage() {
    const payouts = await getPayouts();

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Liquidaciones
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Control de pagos diarios para actores y asistentes.
                </p>
            </div>

            <PayoutsList payouts={payouts} />
        </div>
    );
}
