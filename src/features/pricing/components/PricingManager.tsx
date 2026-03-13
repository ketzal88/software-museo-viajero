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
                <div className="flex gap-1 border-b border-gray-300 w-fit">
                    {Object.values(PricingType).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setActiveTab(type);
                                setIsAdding(false);
                                setEditingRule(null);
                            }}
                            className={cn(
                                "px-4 py-2 text-sm font-display transition-all",
                                activeTab === type ? "border-b-2 border-primary text-primary font-bold" : "text-gray-500 hover:text-gray-700 font-medium"
                            )}
                        >
                            {TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
                {!isAdding && !editingRule && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4" /> Crear Periodo
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
                        <div className="text-center py-16 border border-gray-300 border-dashed">
                            <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="font-display font-bold text-gray-400">No hay reglas de {TYPE_LABELS[activeTab]}</p>
                            <p className="text-sm font-sans text-gray-500">Define una vigencia para empezar a cobrar.</p>
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
            "group border p-6 transition-all hover:border-primary/20",
            isCurrent ? "border-primary/30 ring-1 ring-primary/10" : "border-gray-300"
        )}>
            <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                            isCurrent ? "bg-primary text-white" : "bg-gray-50 text-gray-500"
                        )}>
                            {isCurrent ? "Vigente Actual" : "Periodo"}
                        </div>
                        <h4 className="font-display font-bold text-primary uppercase text-xs tracking-widest">{rule.notes || "Sin titulo"}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Validez</p>
                            <div className="flex items-center gap-2 text-sm font-display font-medium text-primary">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span>{format(new Date(rule.validFrom + "T12:00:00"), "d MMM yyyy", { locale: es })}</span>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                <span>{format(new Date(rule.validTo + "T12:00:00"), "d MMM yyyy", { locale: es })}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Precios</p>
                            <div className="flex items-center gap-4">
                                {isTheater ? (
                                    <>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-display font-medium text-gray-500">Alumno</span>
                                            <span className="text-sm font-display font-bold text-primary">${rule.values.student?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col border-l pl-4 border-gray-200">
                                            <span className="text-[11px] font-display font-medium text-gray-500">Adulto</span>
                                            <span className="text-sm font-display font-bold text-primary">${rule.values.adult?.toLocaleString()}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-display font-medium text-gray-500">Manana</span>
                                            <span className="text-sm font-display font-bold text-accent">${rule.values[ShiftType.HALF_DAY_MORNING]?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col border-l pl-4 border-gray-200">
                                            <span className="text-[11px] font-display font-medium text-gray-500">Full</span>
                                            <span className="text-sm font-display font-bold text-accent">${rule.values[ShiftType.FULL_DAY]?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-200">
                    <button
                        onClick={onDuplicate}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Duplicar para nuevo periodo"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 transition-all"
                    >
                        <Save className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
