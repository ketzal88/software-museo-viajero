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
        <form onSubmit={handleSubmit(onSave)} className="border border-gray-300 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <h3 className="font-display font-bold text-lg text-primary">{isEditing ? "Editar Vigencia" : "Nueva Vigencia de Precios"}</h3>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-primary transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Periodo de Validez</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[11px] font-display font-bold text-gray-500">Desde</span>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="date"
                                        {...register("validFrom")}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-display font-bold text-gray-500">Hasta</span>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="date"
                                        {...register("validTo")}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Notas / Referencia</label>
                        <textarea
                            {...register("notes")}
                            placeholder="Ej: Temporada Alta 2026..."
                            className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Valores (ARS)</label>
                    <div className="bg-gray-50 p-4 border border-gray-300 space-y-4">
                        {type === PricingType.THEATER_TICKET ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-display font-medium text-primary">Ticket Alumno</span>
                                    <div className="relative w-32">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            {...register("values.student", { valueAsNumber: true })}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 text-sm font-sans font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-display font-medium text-primary">Acompanante</span>
                                    <div className="relative w-32">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            {...register("values.adult", { valueAsNumber: true })}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 text-sm font-sans font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {Object.values(ShiftType).map(shift => (
                                    <div key={shift} className="flex items-center justify-between">
                                        <span className="text-xs font-display font-medium text-primary capitalize">{shift.replace(/_/g, ' ')}</span>
                                        <div className="relative w-32">
                                            <DollarSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                {...register(`values.${shift}`, { valueAsNumber: true })}
                                                className="w-full pl-8 pr-3 py-3 border border-gray-300 text-sm font-sans font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 border border-gray-300">
                        <Info className="h-4 w-4 text-gray-400 shrink-0" />
                        <p className="font-sans">Los cambios en esta regla solo afectaran a reservas nuevas o confirmadas
                            dentro de este rango de fechas. Las cerradas no se veran alteradas.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                <button
                    type="button"
                    onClick={onCancel}
                    className="border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                >
                    <Save className="h-4 w-4" /> Finalizar y Guardar
                </button>
            </div>
        </form>
    );
}
