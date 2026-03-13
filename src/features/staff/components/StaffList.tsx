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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 border border-gray-300 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 border-b border-gray-200 self-start">
                    <button
                        onClick={() => setActiveTab("ALL")}
                        className={cn(
                            "px-4 py-2 text-sm transition-all",
                            activeTab === "ALL" ? "border-b-2 border-primary text-primary font-display font-bold" : "text-gray-500 hover:text-gray-700 font-display font-medium"
                        )}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab(RoleType.ACTOR)}
                        className={cn(
                            "px-4 py-2 text-sm transition-all",
                            activeTab === RoleType.ACTOR ? "border-b-2 border-primary text-primary font-display font-bold" : "text-gray-500 hover:text-gray-700 font-display font-medium"
                        )}
                    >
                        Actores
                    </button>
                    <button
                        onClick={() => setActiveTab(RoleType.ASSISTANT)}
                        className={cn(
                            "px-4 py-2 text-sm transition-all",
                            activeTab === RoleType.ASSISTANT ? "border-b-2 border-primary text-primary font-display font-bold" : "text-gray-500 hover:text-gray-700 font-display font-medium"
                        )}
                    >
                        Asistentes
                    </button>
                </div>
                <Link
                    href="/staff/nuevo"
                    className="flex items-center justify-center gap-2 bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
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
                        className="group border border-gray-300 p-5 hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="flex gap-1">
                                {person.roleTypes.map((role) => (
                                    <span
                                        key={role}
                                        className={cn(
                                            "text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                                            role === RoleType.ACTOR ? "bg-blue-50 text-blue-700" :
                                                role === RoleType.ASSISTANT ? "bg-amber-50 text-amber-700" :
                                                    "bg-gray-100 text-gray-500"
                                        )}
                                    >
                                        {role === RoleType.ACTOR ? "Actor" : "Asistente"}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 mb-4">
                            <h4 className="font-display font-bold text-primary group-hover:text-black transition-colors truncate">
                                {person.displayName}
                            </h4>
                            <p className="text-sm text-gray-500 font-sans flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                {person.phone || "Sin teléfono"}
                            </p>
                            <p className="text-sm text-gray-500 font-sans flex items-center gap-2 truncate">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {person.email || "Sin email"}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                            <span className={cn(
                                "text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                                person.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            )}>
                                {person.isActive ? "ACTIVO" : "INACTIVO"}
                            </span>
                            <div className="text-xs text-gray-400 font-sans">
                                Ver detalles →
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredPeople.length === 0 && (
                    <div className="col-span-full border border-dashed border-gray-300 p-12 text-center text-gray-500 font-sans">
                        No se encontró personal que coincida con la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
