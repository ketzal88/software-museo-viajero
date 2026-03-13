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
            <div className="border border-dashed border-gray-300 p-12 text-center">
                <p className="font-sans text-gray-500">No hay obras registradas todavía.</p>
                <Link
                    href="/obras/nueva"
                    className="mt-4 inline-block text-primary hover:underline font-display font-medium text-sm"
                >
                    Agregar la primera obra
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
                <div key={work.id} className="group relative border border-gray-300 p-6 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-display font-medium text-primary tracking-tight">{work.title}</h3>
                        <Link
                            href={`/obras/${work.id}/editar`}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-3 text-sm font-sans">
                        {work.duration && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                                <span>Duración: {work.duration} minutos</span>
                            </div>
                        )}
                        {work.description && (
                            <div className="flex gap-2 text-gray-500">
                                <FileText className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                                <p className="line-clamp-3">{work.description}</p>
                            </div>
                        )}
                        {work.audienceTags && work.audienceTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {work.audienceTags.map((tag) => (
                                    <span key={tag} className="text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5 text-gray-500 border border-gray-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
