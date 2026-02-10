"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PricingRule, PricingType, ShiftType } from "@/types";
import { pricingRuleSchema } from "@/lib/validations";
import { Save, X, Calendar, DollarSign, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingRuleFormProps {
    type: PricingType;
    initialData?: PricingRule | null;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export function PricingRuleForm({ type, initialData, onSave, onCancel }: PricingRuleFormProps) {
    const isEditing = !!initialData?.id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(pricingRuleSchema),
        defaultValues: (initialData as any) || {
            type,
            scope: "GLOBAL",
            validFrom: new Date().toISOString().split('T')[0],
            validTo: "2026-12-31",
            currency: "ARS",
            values: type === PricingType.THEATER_TICKET
                ? { student: 0, adult: 0 }
                : {
                    [ShiftType.HALF_DAY_MORNING]: 0,
                    [ShiftType.HALF_DAY_AFTERNOON]: 0,
                    [ShiftType.HALF_DAY_MIXED]: 0,
                    [ShiftType.FULL_DAY]: 0
                },
            isActive: true,
            notes: "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSave)} className="bg-card border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-lg">{isEditing ? "Editar Vigencia" : "Nueva Vigencia de Precios"}</h3>
                <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Período de Validez</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400">Desde</span>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="date"
                                        {...register("validFrom")}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400">Hasta</span>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="date"
                                        {...register("validTo")}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Notas / Referencia</label>
                        <textarea
                            {...register("notes")}
                            placeholder="Ej: Temporada Alta 2026..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Valores (ARS)</label>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
                        {type === PricingType.THEATER_TICKET ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Ticket Alumno</span>
                                    <div className="relative w-32">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="number"
                                            {...register("values.student", { valueAsNumber: true })}
                                            className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Acompañante</span>
                                    <div className="relative w-32">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="number"
                                            {...register("values.adult", { valueAsNumber: true })}
                                            className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {Object.values(ShiftType).map(shift => (
                                    <div key={shift} className="flex items-center justify-between">
                                        <span className="text-xs font-medium capitalize">{shift.replace(/_/g, ' ')}</span>
                                        <div className="relative w-32">
                                            <DollarSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                            <input
                                                type="number"
                                                {...register(`values.${shift}`, { valueAsNumber: true })}
                                                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <Info className="h-4 w-4 text-blue-500 shrink-0" />
                        <p>Los cambios en esta regla solo afectarán a reservas nuevas o confirmadas
                            dentro de este rango de fechas. Las cerradas no se verán alteradas.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90"
                >
                    <Save className="h-4 w-4" /> Finalizar y Guardar
                </button>
            </div>
        </form>
    );
}
