"use client";

import { Venue } from "@/types";
import { MapPin, Users, Edit, Map as MapIcon, Plus } from "lucide-react";
import Link from "next/link";

interface VenueListProps {
    venues: Venue[];
}

export function VenueList({ venues }: VenueListProps) {
    if (venues.length === 0) {
        return (
            <div className="border border-dashed border-gray-300 p-12 text-center">
                <div className="h-16 w-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-display font-medium text-primary mb-1">No hay teatros registrados</h3>
                <p className="text-sm font-sans text-gray-500 mb-6">Comienza agregando los espacios donde se realizan las funciones.</p>
                <Link
                    href="/teatros/nuevo"
                    className="inline-flex items-center gap-2 bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                >
                    <Plus className="h-4 w-4" /> Agregar el primer teatro
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {venues.map((venue) => (
                <div key={venue.id} className="border border-gray-300 p-6 hover:border-primary/20 transition-all flex flex-col">
                    <div className="h-40 bg-gray-50 relative mb-4">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <MapPin className="h-16 w-16" />
                        </div>
                        <div className="absolute top-3 right-3">
                            <span className="text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5 bg-green-50 text-green-700">
                                Activo
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-display font-medium text-lg text-primary leading-tight truncate pr-2">{venue.name}</h3>
                            <span className="flex items-center gap-1 text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5 text-gray-500 shrink-0">
                                <Users className="h-3 w-3" />
                                {venue.defaultCapacity}
                            </span>
                        </div>

                        <div className="flex items-start gap-2 text-gray-500 text-sm font-sans mb-4">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                            <span className="truncate">{venue.addressLine || venue.address || 'Sin dirección'}</span>
                        </div>

                        {venue.notes && (
                            <div className="border border-gray-300 p-3 text-xs italic text-gray-500 font-sans flex-1 line-clamp-3">
                                &quot;{venue.notes}&quot;
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-gray-300 flex justify-between items-center">
                            {venue.mapsUrl ? (
                                <a
                                    href={venue.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-primary text-sm font-display font-medium hover:underline"
                                >
                                    <MapIcon className="h-4 w-4" />
                                    Ver mapa
                                </a>
                            ) : (
                                <span className="text-xs text-gray-400 font-sans">Sin mapa</span>
                            )}

                            <Link
                                href={`/teatros/${venue.id}/editar`}
                                className="h-8 w-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:border-primary/30 transition-all"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            <Link
                href="/teatros/nuevo"
                className="border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 group hover:border-primary/30 transition-all cursor-pointer min-h-[300px]"
            >
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-3 group-hover:text-primary transition-colors">
                    <Plus className="h-6 w-6" />
                </div>
                <span className="font-display font-medium text-sm text-primary">Agregar Nuevo Teatro</span>
                <span className="text-xs font-sans text-gray-500 text-center mt-1 px-4">Registra una nueva sala para programar funciones.</span>
            </Link>
        </div>
    );
}
