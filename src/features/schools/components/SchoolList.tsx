"use client";

import { useState } from "react";
import { School } from "@/types";
import { MapPin, User, Phone, Edit, MessageCircle, PhoneCall, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SchoolListProps {
    schools: School[];
}

export function SchoolList({ schools }: SchoolListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSchools = schools.filter(school => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            school.name.toLowerCase().includes(term) ||
            school.district.toLowerCase().includes(term) ||
            (school.contactName && school.contactName.toLowerCase().includes(term))
        );
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
                <label className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-base placeholder:text-muted-foreground transition-all outline-none"
                        placeholder="Buscar por nombre, barrio o contacto..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </label>
            </div>

            {/* Empty State */}
            {filteredSchools.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <SearchX className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">No se encontraron escuelas</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Intenta ajustar los términos de búsqueda o agrega una nueva escuela.
                    </p>
                    <Link
                        href="/escuelas/nueva"
                        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-all"
                    >
                        Crear Escuela
                    </Link>
                </div>
            )}

            {/* List */}
            <div className="flex flex-col gap-4">
                {filteredSchools.map((school) => (
                    <div
                        key={school.id}
                        className="bg-card dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-card-foreground mb-2 flex items-center gap-2">
                                    {school.name}
                                    {school.isPrivate && (
                                        <span className="text-[10px] uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold tracking-wider">
                                            Privada
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">{school.address}, {school.district}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4 shrink-0" />
                                    <span className="text-sm font-medium">
                                        Resp: {school.contactName || "No especificado"}
                                        {school.phone && <span className="text-xs text-muted-foreground/70 ml-1">({school.phone})</span>}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-none mt-4 md:mt-0 justify-end">
                                <a
                                    href={`https://wa.me/?text=Hola ${school.contactName}, le escribo desde Museo Viajero.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-all"
                                    title="WhatsApp"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </a>
                                {school.phone && (
                                    <a
                                        href={`tel:${school.phone}`}
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-110 transition-all"
                                        title="Llamar"
                                    >
                                        <PhoneCall className="h-5 w-5" />
                                    </a>
                                )}
                                <Link
                                    href={`/escuelas/${school.id}/editar`}
                                    className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all"
                                    title="Editar"
                                >
                                    <Edit className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
