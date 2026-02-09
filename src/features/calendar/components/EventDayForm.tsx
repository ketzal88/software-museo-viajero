"use client";

import { useState, useEffect } from "react";
import { EventDay, EventType, Season, Venue, Work } from "@/types";
import { addEventDay, getSeasons, getVenues, getWorks } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Theater, Layers, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventDayForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Data for selectors
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [works, setWorks] = useState<Work[]>([]);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<EventType>(EventType.THEATER);
    const [seasonId, setSeasonId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [workId, setWorkId] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const [s, v, w] = await Promise.all([
                getSeasons(),
                getVenues(),
                getWorks()
            ]);
            setSeasons(s);
            setVenues(v);
            setWorks(w);

            // Set defaults if data exists
            if (s.length > 0) {
                const active = s.find(cat => cat.isActive) || s[0];
                setSeasonId(active.id);
            }
            if (v.length > 0) setLocationId(v[0].id);
            if (w.length > 0) setWorkId(w[0].id);
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seasonId || !workId || (type === EventType.THEATER && !locationId)) {
            alert("Por favor completa todos los campos requeridos.");
            return;
        }

        setLoading(true);
        try {
            const result = await addEventDay({
                date,
                type,
                seasonId,
                locationId: type === EventType.THEATER ? locationId : "",
            }, workId);

            if (result.success) {
                router.push("/calendario");
                router.refresh();
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error saving event day:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="grid gap-6 md:grid-cols-2">
                {/* FECHA */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha de la Jornada</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                {/* TEMPORADA */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Temporada</label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                            required
                            value={seasonId}
                            onChange={(e) => setSeasonId(e.target.value)}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            {seasons.map(s => (
                                <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Activa)' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* TIPO DE EVENTO */}
                <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-medium">Tipo de Función</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType(EventType.THEATER)}
                            className={cn(
                                "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                                type === EventType.THEATER
                                    ? "bg-primary/5 border-primary text-primary ring-1 ring-primary"
                                    : "bg-card hover:bg-muted"
                            )}
                        >
                            <Theater className="h-5 w-5" />
                            <span className="font-bold">Teatro (Sede)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType(EventType.TRAVEL)}
                            className={cn(
                                "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                                type === EventType.TRAVEL
                                    ? "bg-primary/5 border-primary text-primary ring-1 ring-primary"
                                    : "bg-card hover:bg-muted"
                            )}
                        >
                            <MapPin className="h-5 w-5" />
                            <span className="font-bold">Viajera (Escuela)</span>
                        </button>
                    </div>
                </div>

                {/* LUGAR (Solo para Teatro) */}
                {type === EventType.THEATER && (
                    <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-medium">Teatro / Centro Cultural</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select
                                required
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="" disabled>Selecciona un teatro...</option>
                                {venues.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.address})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <Info className="h-3 w-3" />
                            <span>Se generarán automáticamente los slots configurados en el teatro.</span>
                        </div>
                    </div>
                )}

                {/* OBRA */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Obra a Presentar</label>
                    <div className="relative">
                        <Theater className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                            required
                            value={workId}
                            onChange={(e) => setWorkId(e.target.value)}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="" disabled>Selecciona la obra...</option>
                            {works.map(w => (
                                <option key={w.id} value={w.id}>{w.title} ({w.duration} min)</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20"
                >
                    {loading ? "Generando..." : "Crear Jornada y Slots"}
                </button>
            </div>
        </form>
    );
}
