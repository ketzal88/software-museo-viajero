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
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl text-muted-foreground bg-slate-50 dark:bg-slate-800/50">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-1">No hay teatros registrados</h3>
                <p className="text-sm text-muted-foreground mb-6">Comienza agregando los espacios donde se realizan las funciones. </p>
                <Link
                    href="/teatros/nuevo"
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" /> Agregar el primer teatro
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {venues.map((venue) => (
                <div key={venue.id} className="bg-card dark:bg-[#1a2632] border border-border dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="h-40 bg-muted dark:bg-gray-700 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                            <MapPin className="h-16 w-16" />
                        </div>
                        <div className="absolute top-3 right-3">
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                Activo
                            </span>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg leading-tight truncate pr-2">{venue.name}</h3>
                            <span className="flex items-center gap-1 text-primary text-xs font-semibold bg-primary/10 px-2 py-0.5 rounded shrink-0">
                                <Users className="h-3 w-3" />
                                {venue.defaultCapacity}
                            </span>
                        </div>

                        <div className="flex items-start gap-2 text-muted-foreground text-sm mb-4">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="truncate">{venue.address}</span>
                        </div>

                        {venue.notes && (
                            <div className="bg-muted dark:bg-gray-800/50 p-3 rounded-lg text-xs italic text-muted-foreground flex-1 line-clamp-3">
                                "{venue.notes}"
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-border dark:border-gray-700 flex justify-between items-center">
                            {venue.mapsUrl ? (
                                <a
                                    href={venue.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline"
                                >
                                    <MapIcon className="h-4 w-4" />
                                    Ver mapa
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">Sin mapa</span>
                            )}

                            <Link
                                href={`/teatros/${venue.id}/editar`}
                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border dark:border-gray-700 text-muted-foreground hover:bg-muted dark:hover:bg-gray-800 transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            <Link
                href="/teatros/nuevo"
                className="border-2 border-dashed border-border dark:border-gray-800 rounded-xl flex flex-col items-center justify-center p-8 bg-muted/30 dark:bg-gray-800/20 group hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[300px]"
            >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm text-foreground">Agregar Nuevo Teatro</span>
                <span className="text-xs text-muted-foreground text-center mt-1 px-4">Registra una nueva sala para programar funciones.</span>
            </Link>
        </div>
    );
}
