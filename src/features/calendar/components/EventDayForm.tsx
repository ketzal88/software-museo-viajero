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
    type: string;
    seasonId: string;
    locationId?: string;
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
                type: data.type as EventType,
                seasonId: data.seasonId,
                locationId: data.type === EventType.THEATER ? (data.locationId ?? "") : "",
                status: "OPEN",
                updatedAt: new Date().toISOString(),
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
        return <div className="p-8 text-center text-gray-500">Cargando opciones...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl px-1 pb-10">
            <div className="grid gap-6 md:grid-cols-2">
                {/* FECHA */}
                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Fecha de la Jornada</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            {...register("date")}
                            className={cn(
                                "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                errors.date ? "border-accent" : "border-gray-300"
                            )}
                        />
                    </div>
                    {errors.date && <p className="text-xs text-accent font-sans mt-1">{errors.date.message}</p>}
                </div>

                {/* TEMPORADA */}
                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Temporada</label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                            {...register("seasonId")}
                            className={cn(
                                "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none",
                                errors.seasonId ? "border-accent" : "border-gray-300"
                            )}
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
                    <label className="text-sm font-display font-medium text-primary">Tipo de Función</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setValue("type", EventType.THEATER)}
                            className={cn(
                                "flex items-center justify-center gap-3 p-5 border transition-all relative overflow-hidden",
                                type === EventType.THEATER
                                    ? "border-primary text-primary bg-gray-50"
                                    : "border-gray-300 hover:border-primary/20 text-gray-600"
                            )}
                        >
                            <Theater className="h-5 w-5" />
                            <span className="font-display font-bold">Teatro (Sede)</span>
                            {type === EventType.THEATER && (
                                <Check className="absolute top-2 right-2 h-4 w-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue("type", EventType.TRAVEL)}
                            className={cn(
                                "flex items-center justify-center gap-3 p-5 border transition-all relative overflow-hidden",
                                type === EventType.TRAVEL
                                    ? "border-primary text-primary bg-gray-50"
                                    : "border-gray-300 hover:border-primary/20 text-gray-600"
                            )}
                        >
                            <MapPin className="h-5 w-5" />
                            <span className="font-display font-bold">Viajera (Escuela)</span>
                            {type === EventType.TRAVEL && (
                                <Check className="absolute top-2 right-2 h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* LUGAR (Solo para Teatro) */}
                {type === EventType.THEATER && (
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Teatro / Centro Cultural</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <select
                                {...register("locationId")}
                                className={cn(
                                    "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none",
                                    errors.locationId ? "border-accent" : "border-gray-300"
                                )}
                            >
                                <option value="" disabled>Selecciona un teatro...</option>
                                {venues.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.address})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 text-[11px] text-gray-500 mt-2 border border-gray-300">
                            <Info className="h-4 w-4 text-gray-500" />
                            <span className="font-sans">Se generarán automáticamente los slots configurados en el teatro para este día.</span>
                        </div>
                    </div>
                )}

                {/* OBRA */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Obra a Presentar</label>
                    <div className="relative">
                        <Theater className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                            {...register("workId")}
                            className={cn(
                                "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none",
                                errors.workId ? "border-accent" : "border-gray-300"
                            )}
                        >
                            <option value="" disabled>Selecciona la obra...</option>
                            {works.map(w => (
                                <option key={w.id} value={w.id}>{w.title} ({w.duration} min)</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider disabled:opacity-50"
                >
                    {loading ? "Generando..." : "Crear Jornada y Slots"}
                </button>
            </div>
        </form>
    );
}
