"use client";

import { useState } from "react";
import { Payout, PayoutStatus, Person, Work, RoleType } from "@/types";
import {
    DollarSign,
    CheckCircle2, Clock,
    Search, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePayoutStatus } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PayoutsListProps {
    payouts: (Payout & { person: Person | null, work: Work | null })[];
}

export function PayoutsList({ payouts }: PayoutsListProps) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<PayoutStatus | "ALL">("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPayouts = payouts.filter(p => {
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        const matchesSearch = p.person?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.work?.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleMarkPaid = async (payoutId: string) => {
        const result = await updatePayoutStatus(payoutId, PayoutStatus.PAID);
        if (result.success) {
            toast.success("Pago registrado");
            router.refresh();
        } else {
            toast.error("Error al registrar pago");
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-300 p-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre u obra..."
                        className="w-full pl-10 pr-4 border border-gray-300 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    {[
                        { value: "ALL", label: "Todos" },
                        { value: PayoutStatus.PENDING, label: "Pendientes", icon: Clock, color: "text-amber-500" },
                        { value: PayoutStatus.PAID, label: "Pagados", icon: CheckCircle2, color: "text-green-500" }
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value as PayoutStatus | "ALL")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-display font-bold transition-all whitespace-nowrap",
                                statusFilter === f.value
                                    ? "bg-primary text-white"
                                    : "border border-gray-300 text-gray-500 hover:border-primary/30"
                            )}
                        >
                            {f.icon && <f.icon className="h-4 w-4" />}
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="overflow-hidden border border-gray-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Fecha / Jornada</th>
                                <th className="px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Personal</th>
                                <th className="px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Obra / Bloque</th>
                                <th className="px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 text-right">Monto</th>
                                <th className="px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 text-center">Estado</th>
                                <th className="px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayouts.map((payout) => (
                                <tr key={payout.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-display font-bold text-gray-400 uppercase">{new Date(payout.date).toLocaleString('es-AR', { month: 'short' })}</span>
                                                <span className="text-sm font-display font-bold text-primary leading-none">{new Date(payout.date).getDate()}</span>
                                            </div>
                                            <div className="text-xs font-sans text-gray-400">
                                                {new Date(payout.date).toLocaleDateString('es-AR', { weekday: 'long' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-display font-bold text-primary">{payout.person?.displayName}</span>
                                            <span className="text-[11px] font-display font-bold uppercase text-gray-500 tracking-widest">
                                                {payout.roleType === RoleType.ACTOR ? "Actor" : "Asistente"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-display font-medium text-gray-600 truncate max-w-[200px]">
                                                {payout.work?.title}
                                            </span>
                                            <span className="text-[11px] font-display font-bold text-primary uppercase tracking-widest">
                                                {payout.shiftType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-display font-bold text-primary">
                                        ${payout.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-display font-bold uppercase tracking-widest leading-none",
                                                payout.status === PayoutStatus.PAID
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-amber-50 text-amber-700"
                                            )}>
                                                {payout.status === PayoutStatus.PAID ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                {payout.status === PayoutStatus.PAID ? "Pagado" : "Pendiente"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {payout.status === PayoutStatus.PENDING ? (
                                            <button
                                                onClick={() => handleMarkPaid(payout.id)}
                                                className="bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                                            >
                                                Marcar Pagado
                                            </button>
                                        ) : (
                                            <div className="h-8 w-8 ml-auto flex items-center justify-center text-gray-300">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayouts.length === 0 && (
                    <div className="border border-dashed border-gray-300 p-12 text-center">
                        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-display font-bold text-primary">Sin liquidaciones</h4>
                        <p className="text-gray-500 font-sans">No se encontraron pagos con los filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
