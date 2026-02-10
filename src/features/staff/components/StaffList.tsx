"use client";

import { useState } from "react";
import { Person, RoleType } from "@/types";
import { Search, Plus, User, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StaffListProps {
    people: Person[];
}

export function StaffList({ people }: StaffListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<RoleType | "ALL">("ALL");

    const filteredPeople = people.filter((person) => {
        const matchesSearch = person.displayName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === "ALL" || person.roleTypes.includes(activeTab);
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
                    <button
                        onClick={() => setActiveTab("ALL")}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === "ALL" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab(RoleType.ACTOR)}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === RoleType.ACTOR ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        Actores
                    </button>
                    <button
                        onClick={() => setActiveTab(RoleType.ASSISTANT)}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === RoleType.ASSISTANT ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        Asistentes
                    </button>
                </div>
                <Link
                    href="/staff/nuevo"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-bold shadow-sm shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Staff
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map((person) => (
                    <Link
                        key={person.id}
                        href={`/staff/${person.id}`}
                        className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all animate-in fade-in slide-in-from-bottom-2"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="flex gap-1">
                                {person.roleTypes.map((role) => (
                                    <span
                                        key={role}
                                        className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                            role === RoleType.ACTOR ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                role === RoleType.ASSISTANT ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                        )}
                                    >
                                        {role === RoleType.ACTOR ? "Actor" : "Asistente"}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 mb-4">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                {person.displayName}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {person.phone || "Sin teléfono"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate">
                                <Mail className="h-3 w-3" />
                                {person.email || "Sin email"}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                person.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                                {person.isActive ? "ACTIVO" : "INACTIVO"}
                            </span>
                            <div className="text-xs text-slate-400">
                                Ver detalles →
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredPeople.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No se encontró personal que coincida con la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
