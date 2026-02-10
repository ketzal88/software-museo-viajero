"use client";

import { useState } from "react";
import { Person, PersonRate, RoleType, ShiftType, Work, WorkCast } from "@/types";
import {
    User, Phone, Mail, FileText, DollarSign,
    Settings, Plus, Trash2, Edit2,
    CheckCircle2, Briefcase, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertPersonRate, deletePerson } from "@/lib/actions";

interface PersonDetailsProps {
    person: Person;
    rates: PersonRate[];
    castings: (WorkCast & { work: Work | null })[];
    allWorks: Work[];
}

export function PersonDetails({ person, rates, castings, allWorks }: PersonDetailsProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"INFO" | "RATES" | "WORKS">("INFO");

    // Agrupar tarifas por bloque
    const getRateForShift = (role: RoleType, shift: ShiftType) => {
        return rates.find(r => r.roleType === role && r.shiftType === shift && !r.workId);
    };

    const handleUpdateRate = async (role: RoleType, shift: ShiftType, amount: number) => {
        try {
            const result = await upsertPersonRate({
                personId: person.id,
                roleType: role,
                shiftType: shift,
                amount,
                currency: "ARS",
                priority: 100,
                isActive: true
            });
            if (result.success) {
                toast.success("Tarifa actualizada");
                router.refresh();
            } else {
                toast.error("Error al actualizar tarifa");
            }
        } catch {
            toast.error("Error inesperado");
        }
    };

    const handleDelete = async () => {
        if (confirm("¿Estás seguro de eliminar a esta persona? Se perderán sus datos y tarifas.")) {
            const result = await deletePerson(person.id);
            if (result.success) {
                toast.success("Personal eliminado");
                router.push("/staff");
            }
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Profile Card */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <User className="h-12 w-12 md:h-16 md:w-16" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                                {person.roleTypes.map(role => (
                                    <span key={role} className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                                        role === RoleType.ACTOR ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                    )}>
                                        {role === RoleType.ACTOR ? "ACTOR" : "ASISTENTE"}
                                    </span>
                                ))}
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                                    person.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                )}>
                                    {person.isActive ? "ACTIVO" : "INACTIVO"}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                {person.firstName} {person.lastName}
                            </h1>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {person.phone || "Sin teléfono"}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {person.email || "Sin email"}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/staff/${person.id}/editar`}
                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
                            title="Editar datos"
                        >
                            <Edit2 className="h-5 w-5" />
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="p-3 rounded-2xl border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-red-500"
                            title="Eliminar"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Abstract decorative element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl self-start w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setActiveTab("INFO")}
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                        activeTab === "INFO" ? "bg-white dark:bg-slate-800 shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <FileText className="h-4 w-4" />
                    Información
                </button>
                <button
                    onClick={() => setActiveTab("RATES")}
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                        activeTab === "RATES" ? "bg-white dark:bg-slate-800 shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <DollarSign className="h-4 w-4" />
                    Tarifas
                </button>
                <button
                    onClick={() => setActiveTab("WORKS")}
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                        activeTab === "WORKS" ? "bg-white dark:bg-slate-800 shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Briefcase className="h-4 w-4" />
                    Obras / Elenco
                </button>
            </div>

            {/* Tab Content: INFO */}
            {activeTab === "INFO" && (
                <div className="max-w-3xl animate-in fade-in slide-in-from-left-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Settings className="h-5 w-5 text-primary" />
                            Detalles Internos
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    {person.notes || "No hay notas adicionales para esta persona."}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha de Alta</p>
                                    <p className="font-bold">{new Date(person.createdAt).toLocaleDateString('es-AR')}</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Última Actualización</p>
                                    <p className="font-bold">{new Date(person.updatedAt).toLocaleDateString('es-AR')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: RATES */}
            {activeTab === "RATES" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                    {person.roleTypes.map(role => (
                        <div key={role} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    role === RoleType.ACTOR ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                                )}>
                                    <Star className="h-5 w-5" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">
                                    Tarifas base como <span className="text-primary">{role === RoleType.ACTOR ? "Actor" : "Asistente"}</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { type: ShiftType.HALF_DAY_MORNING, label: "Mañana", desc: "2 funciones" },
                                    { type: ShiftType.HALF_DAY_AFTERNOON, label: "Tarde", desc: "2 funciones" },
                                    { type: ShiftType.HALF_DAY_MIXED, label: "Mixto", desc: "1 mañ. + 1 tar." },
                                    { type: ShiftType.FULL_DAY, label: "Todo el Día", desc: "Hasta 4 funciones" }
                                ].map((shift) => {
                                    const rate = getRateForShift(role, shift.type);
                                    return (
                                        <div key={shift.type} className="group bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all">
                                            <div className="mb-4">
                                                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{shift.label}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{shift.desc}</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={rate?.amount || 0}
                                                        onBlur={(e) => handleUpdateRate(role, shift.type, parseInt(e.target.value))}
                                                        className="w-full pl-7 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-lg font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                                    <CheckCircle2 className={cn("h-3 w-3", rate ? "text-green-500" : "text-slate-300")} />
                                                    {rate ? "CONFIGURADO" : "SIN DEFINIR"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Proactive recommendation - Special Overrides */}
                    <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Tarifas Especiales por Obra</h4>
                            <p className="text-sm text-slate-500 max-w-sm">
                                ¿Esta persona cobra distinto para una obra premium? Agregá un override que tendrá prioridad sobre la tarifa base.
                            </p>
                        </div>
                        <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Agregar Excepción
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Content: WORKS */}
            {activeTab === "WORKS" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                            <Briefcase className="h-6 w-6 text-primary" />
                            Obras donde participa
                        </h3>
                        <Link
                            href={`/obras`} // Redirect to works for now, or we could add a modal to assign
                            className="text-primary font-bold text-sm hover:underline"
                        >
                            + Gestionar en Elencos por Obra
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {castings.length === 0 ? (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                                Esta persona aún no ha sido asignada a ningún elenco.
                            </div>
                        ) : (
                            castings.map(casting => (
                                <Link
                                    key={casting.id}
                                    href={`/obras/${casting.workId}`}
                                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all flex items-center gap-6"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-black text-slate-900 dark:text-white truncate">
                                            {casting.work?.title || "Obra desconocida"}
                                        </h5>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                                                {casting.roleType === RoleType.ACTOR ? "Actor" : "Asistente"}
                                            </span>
                                            {casting.characterName && (
                                                <span className="text-xs text-slate-400 font-medium">
                                                    Personaje: <span className="text-slate-600 dark:text-slate-300 font-bold">{casting.characterName}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {casting.isPrimary && (
                                        <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-white" title="Titular">
                                            <Star className="h-4 w-4 fill-current" />
                                        </div>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
