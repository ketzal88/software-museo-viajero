"use client";

import { useState } from "react";
import { School } from "@/types";
import { MapPin, User, Edit, MessageCircle, PhoneCall, Search, SearchX } from "lucide-react";
import Link from "next/link";

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
            <div className="sticky top-0 z-10 bg-white pt-2 pb-4">
                <label className="relative flex items-center group">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 text-base font-sans placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                        placeholder="Buscar por nombre, barrio o contacto..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </label>
            </div>

            {/* Empty State */}
            {filteredSchools.length === 0 && (
                <div className="border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mb-4 mx-auto text-gray-400">
                        <SearchX className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-primary mb-1">No se encontraron escuelas</h3>
                    <p className="text-gray-500 font-sans max-w-xs mx-auto">
                        Intenta ajustar los terminos de busqueda o agrega una nueva escuela.
                    </p>
                    <Link
                        href="/escuelas/nueva"
                        className="mt-6 inline-flex items-center justify-center bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
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
                        className="border border-gray-300 p-6 hover:border-primary/20 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-display font-bold text-primary mb-2 flex items-center gap-2">
                                    {school.name}
                                    {school.isPrivate && (
                                        <span className="text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-100 text-amber-700">
                                            Privada
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span className="text-sm font-sans">{school.address}, {school.district}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <User className="h-4 w-4 shrink-0" />
                                    <span className="text-sm font-sans font-medium">
                                        Resp: {school.contactName || "No especificado"}
                                        {school.phone && <span className="text-xs text-gray-400 ml-1">({school.phone})</span>}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 md:pt-0 border-t border-gray-200 md:border-none mt-4 md:mt-0 justify-end">
                                <a
                                    href={`https://wa.me/?text=Hola ${school.contactName}, le escribo desde Museo Viajero.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-all"
                                    title="WhatsApp"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </a>
                                {school.phone && (
                                    <a
                                        href={`tel:${school.phone}`}
                                        className="w-10 h-10 bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-all"
                                        title="Llamar"
                                    >
                                        <PhoneCall className="h-5 w-5" />
                                    </a>
                                )}
                                <Link
                                    href={`/escuelas/${school.id}/editar`}
                                    className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all"
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
