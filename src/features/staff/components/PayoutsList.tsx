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
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre u obra..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
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
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                statusFilter === f.value
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                            )}
                        >
                            {f.icon && <f.icon className="h-4 w-4" />}
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Fecha / Jornada</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Personal</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Obra / Bloque</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Monto</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredPayouts.map((payout) => (
                                <tr key={payout.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(payout.date).toLocaleString('es-AR', { month: 'short' })}</span>
                                                <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{new Date(payout.date).getDate()}</span>
                                            </div>
                                            <div className="text-xs font-medium text-slate-400">
                                                {new Date(payout.date).toLocaleDateString('es-AR', { weekday: 'long' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{payout.person?.displayName}</span>
                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                                {payout.roleType === RoleType.ACTOR ? "Actor" : "Asistente"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                {payout.work?.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-primary uppercase">
                                                {payout.shiftType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-white">
                                        ${payout.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none",
                                                payout.status === PayoutStatus.PAID
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
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
                                                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
                                            >
                                                Marcar Pagado
                                            </button>
                                        ) : (
                                            <div className="h-8 w-8 ml-auto flex items-center justify-center text-slate-300">
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
                    <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                        <DollarSign className="h-12 w-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Sin liquidaciones</h4>
                        <p className="text-slate-500">No se encontraron pagos con los filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
