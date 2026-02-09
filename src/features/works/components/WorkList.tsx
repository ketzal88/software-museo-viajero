"use client";

import { Work } from "@/types";
import { Edit, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface WorkListProps {
    works: Work[];
}

export function WorkList({ works }: WorkListProps) {
    if (works.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl text-muted-foreground">
                <p>No hay obras registradas todavía.</p>
                <Link
                    href="/obras/nueva"
                    className="mt-4 text-primary hover:underline font-medium"
                >
                    Agregar la primera obra
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
                <div key={work.id} className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold tracking-tight">{work.title}</h3>
                        <Link
                            href={`/obras/${work.id}/editar`}
                            className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>Duración: {work.duration} minutos</span>
                        </div>
                        <div className="flex gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="line-clamp-3">{work.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
