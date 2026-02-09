"use client";

import { Season } from "@/types";
import { Edit, Calendar, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SeasonListProps {
    seasons: Season[];
}

export function SeasonList({ seasons }: SeasonListProps) {
    if (seasons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl text-muted-foreground">
                <p>No hay temporadas registradas todavía.</p>
                <Link
                    href="/temporadas/nueva"
                    className="mt-4 text-primary hover:underline font-medium"
                >
                    Agregar la primera temporada
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seasons.map((season) => (
                <div key={season.id} className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">{season.name}</h3>
                            <div className={cn(
                                "inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                season.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                            )}>
                                {season.isActive ? "Activa" : "Inactiva"}
                            </div>
                        </div>
                        <Link
                            href={`/temporadas/${season.id}/editar`}
                            className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{season.startDate} — {season.endDate}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
