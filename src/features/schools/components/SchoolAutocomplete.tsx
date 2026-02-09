"use client";

import { useState, useEffect, useRef } from "react";
import { School } from "@/types";
import { searchSchools } from "@/lib/actions";
import { Search, MapPin, Building2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SchoolAutocompleteProps {
    onSelect: (school: School) => void;
    className?: string;
    placeholder?: string;
}

export function SchoolAutocomplete({ onSelect, className, placeholder }: SchoolAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<School[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                const data = await searchSchools(query);
                setResults(data);
                setLoading(false);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder || "Buscar escuela por nombre o barrio..."}
                    className="w-full rounded-lg border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-popover shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto">
                        {results.length > 0 ? (
                            results.map((school) => (
                                <button
                                    key={school.id}
                                    onClick={() => {
                                        onSelect(school);
                                        setQuery("");
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-start gap-3 p-4 text-left hover:bg-accent transition-colors border-b last:border-0"
                                >
                                    <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                        school.isPrivate ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                    )}>
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{school.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{school.address} - {school.district}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm text-muted-foreground">No se encontraron escuelas con &quot;{query}&quot;</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-muted/50 p-2 border-t">
                        <Link
                            href="/escuelas/nueva"
                            className="flex items-center justify-center gap-2 rounded-lg bg-background border px-4 py-2 text-xs font-medium hover:bg-accent transition-colors"
                        >
                            <Plus className="h-3 w-3" /> Crear Nueva Escuela
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
