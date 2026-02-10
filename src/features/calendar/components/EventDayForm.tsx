"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventType, Season, Venue, Work } from "@/types";
import { addEventDay, getSeasons, getVenues, getWorks } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Theater, Layers, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventDaySchema } from "@/lib/validations";
import { toast } from "sonner";

interface EventDayFormValues {
    date: string;
    type: EventType;
    seasonId: string;
    locationId: string;
    workId: string;
}

export function EventDayForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    // Data for selectors
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [works, setWorks] = useState<Work[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EventDayFormValues>({
        resolver: zodResolver(eventDaySchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            type: EventType.THEATER,
            seasonId: "",
            locationId: "",
            workId: "",
        },
    });

    const type = watch("type");

    useEffect(() => {
        const fetchData = async () => {
            try {
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
                    setValue("seasonId", active.id);
                }
                if (v.length > 0) setValue("locationId", v[0].id);
                if (w.length > 0) setValue("workId", w[0].id);
            } catch (error) {
                console.error("Error fetching form data:", error);
                toast.error("Error al cargar los datos necesarios");
            } finally {
                setFetchingData(false);
            }
        };
        fetchData();
    }, [setValue]);

    const onSubmit = async (data: EventDayFormValues) => {
        setLoading(true);
        try {
            const result = await addEventDay({
                date: data.date,
                type: data.type,
                seasonId: data.seasonId,
                locationId: data.type === EventType.THEATER ? data.locationId : "",
            }, data.workId);

            if (result.success) {
                toast.success("Jornada y slots creados correctamente");
                router.push("/calendario");
                router.refresh();
            } else {
                toast.error(result.error || "Error al crear la jornada");
            }
        } catch (error) {
            console.error("Error saving event day:", error);
            toast.error("Error inesperado al crear la jornada");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando opciones...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl px-1 pb-10">
            <div className="grid gap-6 md:grid-cols-2">
                {/* FECHA */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Fecha de la Jornada</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="date"
                            {...register("date")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.date ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        />
                    </div>
                    {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date.message}</p>}
                </div>

                {/* TEMPORADA */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Temporada</label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                            {...register("seasonId")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all appearance-none ${errors.seasonId ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        >
                            <option value="" disabled>Selecciona temporada...</option>
                            {seasons.map(s => (
                                <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Activa)' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* TIPO DE EVENTO */}
                <div className="md:col-span-2 space-y-4">
                    <label className="text-sm font-semibold">Tipo de Función</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setValue("type", EventType.THEATER)}
                            className={cn(
                                "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all relative overflow-hidden",
                                type === EventType.THEATER
                                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                                    : "bg-card hover:bg-slate-50 border-slate-200 text-slate-600"
                            )}
                        >
                            <Theater className="h-5 w-5" />
                            <span className="font-bold">Teatro (Sede)</span>
                            {type === EventType.THEATER && (
                                <Check className="absolute top-2 right-2 h-4 w-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue("type", EventType.TRAVEL)}
                            className={cn(
                                "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all relative overflow-hidden",
                                type === EventType.TRAVEL
                                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                                    : "bg-card hover:bg-slate-50 border-slate-200 text-slate-600"
                            )}
                        >
                            <MapPin className="h-5 w-5" />
                            <span className="font-bold">Viajera (Escuela)</span>
                            {type === EventType.TRAVEL && (
                                <Check className="absolute top-2 right-2 h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* LUGAR (Solo para Teatro) */}
                {type === EventType.THEATER && (
                    <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-semibold">Teatro / Centro Cultural</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select
                                {...register("locationId")}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all appearance-none ${errors.locationId ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            >
                                <option value="" disabled>Selecciona un teatro...</option>
                                {venues.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.address})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 text-[11px] text-muted-foreground mt-2 border border-slate-100">
                            <Info className="h-4 w-4 text-primary" />
                            <span>Se generarán automáticamente los slots configurados en el teatro para este día.</span>
                        </div>
                    </div>
                )}

                {/* OBRA */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold">Obra a Presentar</label>
                    <div className="relative">
                        <Theater className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                            {...register("workId")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all appearance-none ${errors.workId ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        >
                            <option value="" disabled>Selecciona la obra...</option>
                            {works.map(w => (
                                <option key={w.id} value={w.id}>{w.title} ({w.duration} min)</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {loading ? "Generando..." : "Crear Jornada y Slots"}
                </button>
            </div>
        </form>
    );
}
