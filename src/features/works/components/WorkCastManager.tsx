"use client";

import { useState } from "react";
import { Person, RoleType, WorkCast } from "@/types";
import { UserPlus, Trash2, Star, User } from "lucide-react";
import { assignPersonToWork, removePersonFromWork } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WorkCastManagerProps {
    workId: string;
    cast: (WorkCast & { person: Person | null })[];
    allPeople: Person[];
}

export function WorkCastManager({ workId, cast, allPeople }: WorkCastManagerProps) {
    const router = useRouter();
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState("");
    const [selectedRole, setSelectedRole] = useState<RoleType>(RoleType.ACTOR);
    const [characterName, setCharacterName] = useState("");
    const [isPrimary, setIsPrimary] = useState(true);

    const handleAssign = async () => {
        if (!selectedPersonId) return;

        const result = await assignPersonToWork({
            workId,
            personId: selectedPersonId,
            roleType: selectedRole,
            characterName: characterName || undefined,
            isPrimary,
        });

        if (result.success) {
            toast.success("Integrante asignado al elenco");
            setIsAssigning(false);
            setSelectedPersonId("");
            setCharacterName("");
            router.refresh();
        } else {
            toast.error(result.error || "Error al asignar");
        }
    };

    const handleRemove = async (personId: string) => {
        if (confirm("¿Quitar a esta persona del elenco de esta obra?")) {
            const result = await removePersonFromWork(workId, personId);
            if (result.success) {
                toast.success("Integrante quitado");
                router.refresh();
            }
        }
    };

    // Filtrar personas que no están en el elenco
    const personIdsInCast = new Set(cast.map(c => c.personId));
    const availablePeople = allPeople.filter(p => !personIdsInCast.has(p.id) && p.isActive);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Elenco de la Obra
                </h3>
                <button
                    onClick={() => setIsAssigning(!isAssigning)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-all"
                >
                    <UserPlus className="h-4 w-4" />
                    {isAssigning ? "Cancelar" : "Asignar Staff"}
                </button>
            </div>

            {isAssigning && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-primary/20 space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Seleccionar Persona</label>
                            <select
                                value={selectedPersonId}
                                onChange={(e) => setSelectedPersonId(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Elegir de la lista...</option>
                                {availablePeople.map(p => (
                                    <option key={p.id} value={p.id}>{p.displayName} ({p.roleTypes.join(", ")})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rol en esta obra</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value={RoleType.ACTOR}>Actor / Actriz</option>
                                <option value={RoleType.ASSISTANT}>Asistente / Staff</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Personaje (opcional)</label>
                            <input
                                type="text"
                                value={characterName}
                                onChange={(e) => setCharacterName(e.target.value)}
                                placeholder="Ej: San Martín"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-end pb-1 px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isPrimary}
                                        onChange={(e) => setIsPrimary(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">Titular / Elenco Principal</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleAssign}
                            disabled={!selectedPersonId}
                            className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 hover:bg-primary/90 transition-all"
                        >
                            Confirmar Asignación
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cast.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                        No hay elenco asignado aún.
                    </div>
                ) : (
                    cast.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-primary/50 transition-all"
                        >
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-slate-900 dark:text-white truncate">
                                        {item.person?.displayName}
                                    </h5>
                                    {item.isPrimary && (
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className={cn(
                                        "font-black uppercase tracking-widest text-[9px]",
                                        item.roleType === RoleType.ACTOR ? "text-blue-500" : "text-amber-500"
                                    )}>
                                        {item.roleType === RoleType.ACTOR ? "Actor" : "Asistente"}
                                    </span>
                                    {item.characterName && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <span className="italic truncate">{item.characterName}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(item.personId)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
