"use client";

import { useState } from "react";
import { PricingRule, PricingType, ShiftType } from "@/types";
import { addPricingRule, updatePricingRule, deletePricingRule } from "@/lib/actions";
import { Plus, Trash2, Calendar, DollarSign, Tag, Info, Clock, Save, Copy, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PricingRuleForm } from "./PricingRuleForm";

const TYPE_LABELS = {
    [PricingType.THEATER_TICKET]: "Tickets de Teatro",
    [PricingType.TRAVEL_FORMAT]: "Formatos Viajeros",
};

interface PricingManagerProps {
    initialRules: PricingRule[];
}

export function PricingManager({ initialRules }: PricingManagerProps) {
    const [rules, setRules] = useState(initialRules);
    const [activeTab, setActiveTab] = useState<PricingType>(PricingType.THEATER_TICKET);
    const [isAdding, setIsAdding] = useState(false);
    const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

    const filteredRules = rules.filter(r => r.type === activeTab);

    const handleSave = async (data: any) => {
        if (editingRule && editingRule.id) {
            const result = await updatePricingRule(editingRule.id, data);
            if (result.success) {
                toast.success("Regla actualizada");
                setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...data } : r));
                setEditingRule(null);
            } else {
                toast.error(result.error);
            }
        } else {
            const result = await addPricingRule(data);
            if (result.success && result.id) {
                toast.success("Nueva regla creada");
                const newRule = { ...data, id: result.id, createdAt: new Date().toISOString() };
                setRules(prev => [newRule, ...prev]);
                setIsAdding(false);
                setEditingRule(null);
            } else {
                toast.error(result.error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar esta regla?")) return;
        const result = await deletePricingRule(id);
        if (result.success) {
            toast.success("Regla eliminada");
            setRules(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleDuplicate = (rule: PricingRule) => {
        const { id, createdAt, updatedAt, ...rest } = rule;
        setEditingRule({ ...rest, id: "" } as any);
        setIsAdding(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {Object.values(PricingType).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setActiveTab(type);
                                setIsAdding(false);
                                setEditingRule(null);
                            }}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                                activeTab === type ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
                {!isAdding && !editingRule && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Crear Período
                    </button>
                )}
            </div>

            {(isAdding || editingRule) ? (
                <PricingRuleForm
                    type={activeTab}
                    initialData={editingRule}
                    onSave={handleSave}
                    onCancel={() => { setIsAdding(false); setEditingRule(null); }}
                />
            ) : (
                <div className="grid gap-4">
                    {filteredRules.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-slate-100 border-dashed rounded-3xl text-muted-foreground">
                            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-400">No hay reglas de {TYPE_LABELS[activeTab]}</p>
                            <p className="text-sm">Define una vigencia para empezar a cobrar.</p>
                        </div>
                    ) : (
                        filteredRules.map(rule => (
                            <PricingRuleCard
                                key={rule.id}
                                rule={rule}
                                onEdit={() => setEditingRule(rule)}
                                onDelete={() => handleDelete(rule.id)}
                                onDuplicate={() => handleDuplicate(rule)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function PricingRuleCard({ rule, onEdit, onDelete, onDuplicate }: { rule: PricingRule, onEdit: () => void, onDelete: () => void, onDuplicate: () => void }) {
    const isTheater = rule.type === PricingType.THEATER_TICKET;
    const now = new Date().toISOString().split('T')[0];
    const isCurrent = now >= rule.validFrom && now <= rule.validTo;

    return (
        <div className={cn(
            "group bg-card border rounded-2xl p-6 transition-all hover:shadow-md",
            isCurrent ? "border-primary/30 ring-1 ring-primary/10 shadow-sm" : "border-slate-100"
        )}>
            <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight",
                            isCurrent ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                        )}>
                            {isCurrent ? "Vigente Actual" : "Período"}
                        </div>
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">{rule.notes || "Sin título"}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Validez</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <span>{format(new Date(rule.validFrom + "T12:00:00"), "d MMM yyyy", { locale: es })}</span>
                                <ChevronRight className="h-3 w-3 text-slate-300" />
                                <span>{format(new Date(rule.validTo + "T12:00:00"), "d MMM yyyy", { locale: es })}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Precios</p>
                            <div className="flex items-center gap-4">
                                {isTheater ? (
                                    <>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-medium text-slate-500">Alumno</span>
                                            <span className="text-sm font-black text-primary">${rule.values.student?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col border-l pl-4 border-slate-100">
                                            <span className="text-[10px] font-medium text-slate-500">Adulto</span>
                                            <span className="text-sm font-black text-slate-700">${rule.values.adult?.toLocaleString()}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-medium text-slate-500">Mañana</span>
                                            <span className="text-sm font-black text-amber-600">${rule.values[ShiftType.HALF_DAY_MORNING]?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col border-l pl-4 border-slate-100">
                                            <span className="text-[10px] font-medium text-slate-500">Full</span>
                                            <span className="text-sm font-black text-amber-600">${rule.values[ShiftType.FULL_DAY]?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-slate-50">
                    <button
                        onClick={onDuplicate}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        title="Duplicar para nuevo período"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                    >
                        <Save className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
