"use client";

import { Season } from "@/types";
import { Edit, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SeasonListProps {
    seasons: Season[];
}

export function SeasonList({ seasons }: SeasonListProps) {
    if (seasons.length === 0) {
        return (
            <div className="border border-dashed border-gray-300 p-12 text-center text-gray-500">
                <p className="font-sans">No hay temporadas registradas todavía.</p>
                <Link
                    href="/temporadas/nueva"
                    className="mt-4 inline-block text-primary hover:underline font-display font-medium"
                >
                    Agregar la primera temporada
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seasons.map((season) => (
                <div key={season.id} className="group relative border border-gray-300 p-6 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-display font-bold tracking-tight text-primary">{season.name}</h3>
                            <div className={cn(
                                "inline-flex items-center gap-1 mt-1 text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                                season.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            )}>
                                {season.isActive ? "Activa" : "Inactiva"}
                            </div>
                        </div>
                        <Link
                            href={`/temporadas/${season.id}/editar`}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-500 font-sans">
                            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                            <span>{season.startDate} — {season.endDate}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
