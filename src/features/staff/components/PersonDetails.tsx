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
            <div className="relative overflow-hidden border border-gray-300 p-8 md:p-10">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="h-24 w-24 md:h-32 md:w-32 bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-12 w-12 md:h-16 md:w-16" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                                {person.roleTypes.map(role => (
                                    <span key={role} className={cn(
                                        "text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                                        role === RoleType.ACTOR ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                                    )}>
                                        {role === RoleType.ACTOR ? "ACTOR" : "ASISTENTE"}
                                    </span>
                                ))}
                                <span className={cn(
                                    "text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                                    person.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                )}>
                                    {person.isActive ? "ACTIVO" : "INACTIVO"}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">
                                {person.firstName} {person.lastName}
                            </h1>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 font-sans">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                {person.phone || "Sin teléfono"}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {person.email || "Sin email"}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/staff/${person.id}/editar`}
                            className="p-3 border border-gray-300 hover:border-primary/30 transition-all text-gray-500"
                            title="Editar datos"
                        >
                            <Edit2 className="h-5 w-5" />
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="p-3 border border-accent/30 hover:bg-accent/5 transition-all text-accent"
                            title="Eliminar"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setActiveTab("INFO")}
                    className={cn(
                        "px-6 py-2.5 text-sm transition-all flex items-center gap-2",
                        activeTab === "INFO" ? "border-b-2 border-primary text-primary font-display font-bold" : "text-gray-500 hover:text-gray-700 font-display font-medium"
                    )}
                >
                    <FileText className="h-4 w-4" />
                    Información
                </button>
                <button
                    onClick={() => setActiveTab("RATES")}
                    className={cn(
                        "px-6 py-2.5 text-sm transition-all flex items-center gap-2",
                        activeTab === "RATES" ? "border-b-2 border-primary text-primary font-display font-bold" : "text-gray-500 hover:text-gray-700 font-display font-medium"
                    )}
                >
                    <DollarSign className="h-4 w-4" />
                    Tarifas
                </button>
                <button
                    onClick={() => setActiveTab("WORKS")}
                    className={cn(
                        "px-6 py-2.5 text-sm transition-all flex items-center gap-2",
                        activeTab === "WORKS" ? "border-b-2 border-primary text-primary font-display font-bold" : "text-gray-500 hover:text-gray-700 font-display font-medium"
                    )}
                >
                    <Briefcase className="h-4 w-4" />
                    Obras / Elenco
                </button>
            </div>

            {/* Tab Content: INFO */}
            {activeTab === "INFO" && (
                <div className="max-w-3xl">
                    <div className="border border-gray-300 p-8 space-y-6">
                        <h3 className="text-xl font-display font-bold text-primary flex items-center gap-3">
                            <Settings className="h-5 w-5 text-primary" />
                            Detalles Internos
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50">
                                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-1">Notas</p>
                                <p className="text-gray-600 font-sans leading-relaxed italic">
                                    {person.notes || "No hay notas adicionales para esta persona."}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-300">
                                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-1">Fecha de Alta</p>
                                    <p className="font-display font-bold text-primary">{new Date(person.createdAt).toLocaleDateString('es-AR')}</p>
                                </div>
                                <div className="p-4 border border-gray-300">
                                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 mb-1">Última Actualización</p>
                                    <p className="font-display font-bold text-primary">{new Date(person.updatedAt).toLocaleDateString('es-AR')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: RATES */}
            {activeTab === "RATES" && (
                <div className="space-y-10">
                    {person.roleTypes.map(role => (
                        <div key={role} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2",
                                    role === RoleType.ACTOR ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                                )}>
                                    <Star className="h-5 w-5" />
                                </div>
                                <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-primary">
                                    Tarifas base como <span className="text-accent">{role === RoleType.ACTOR ? "Actor" : "Asistente"}</span>
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
                                        <div key={shift.type} className="group border border-gray-300 p-6 hover:border-primary/20 transition-all">
                                            <div className="mb-4">
                                                <h4 className="font-display font-bold text-primary uppercase tracking-tight">{shift.label}</h4>
                                                <p className="text-xs text-gray-400 font-sans">{shift.desc}</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={rate?.amount || 0}
                                                        onBlur={(e) => handleUpdateRate(role, shift.type, parseInt(e.target.value))}
                                                        className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-300 text-lg font-display font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 bg-gray-50 p-2">
                                                    <CheckCircle2 className={cn("h-3 w-3", rate ? "text-green-500" : "text-gray-300")} />
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
                    <div className="border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="h-12 w-12 bg-gray-50 flex items-center justify-center text-gray-400">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-primary">Tarifas Especiales por Obra</h4>
                            <p className="text-sm text-gray-500 font-sans max-w-sm">
                                ¿Esta persona cobra distinto para una obra premium? Agregá un override que tendrá prioridad sobre la tarifa base.
                            </p>
                        </div>
                        <button className="border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30">
                            Agregar Excepción
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Content: WORKS */}
            {activeTab === "WORKS" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-primary flex items-center gap-4">
                            <Briefcase className="h-6 w-6 text-primary" />
                            Obras donde participa
                        </h3>
                        <Link
                            href={`/obras`}
                            className="text-primary font-display font-bold text-sm hover:underline"
                        >
                            + Gestionar en Elencos por Obra
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {castings.length === 0 ? (
                            <div className="col-span-full border border-dashed border-gray-300 p-12 text-center text-gray-400 font-sans">
                                Esta persona aún no ha sido asignada a ningún elenco.
                            </div>
                        ) : (
                            castings.map(casting => (
                                <Link
                                    key={casting.id}
                                    href={`/obras/${casting.workId}`}
                                    className="p-6 border border-gray-300 hover:border-primary/20 transition-all flex items-center gap-6"
                                >
                                    <div className="h-14 w-14 bg-gray-100 flex items-center justify-center text-primary">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-display font-bold text-primary truncate">
                                            {casting.work?.title || "Obra desconocida"}
                                        </h5>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-display font-bold text-primary uppercase bg-primary/10 px-2 py-0.5">
                                                {casting.roleType === RoleType.ACTOR ? "Actor" : "Asistente"}
                                            </span>
                                            {casting.characterName && (
                                                <span className="text-xs text-gray-400 font-sans">
                                                    Personaje: <span className="text-gray-600 font-display font-bold">{casting.characterName}</span>
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
