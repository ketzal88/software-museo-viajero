"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Season, Work } from "@/types";
import { addSeason, updateSeason } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, Type, CheckCircle2, XCircle, Theater, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { seasonSchema } from "@/lib/validations";

interface SeasonFormValues {
    name: string;
    startDate: string;
    endDate: string;
    workIds: string[];
    isActive: boolean;
}

interface SeasonFormProps {
    initialData?: Season;
    availableWorks: Work[];
}

export function SeasonForm({ initialData, availableWorks }: SeasonFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SeasonFormValues>({
        resolver: zodResolver(seasonSchema),
        defaultValues: {
            name: initialData?.name || "",
            startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
            endDate: initialData?.endDate || new Date().toISOString().split('T')[0],
            isActive: initialData?.isActive ?? true,
            workIds: initialData?.worksIds || [],
        },
    });

    const selectedWorkIds = watch("workIds") || [];
    const isActive = watch("isActive");

    const toggleWork = (workId: string) => {
        const nextIds = selectedWorkIds.includes(workId)
            ? selectedWorkIds.filter(id => id !== workId)
            : [...selectedWorkIds, workId];
        setValue("workIds", nextIds, { shouldValidate: true });
    };

    const onSubmit = async (data: SeasonFormValues) => {
        setLoading(true);
        try {
            // Field mapping: schema uses workIds but model uses worksIds (check types/index.ts)
            // Actually types/index.ts says worksIds (with 's'). I'll map it.
            const modelData = {
                ...data,
                worksIds: data.workIds
            };

            const result = initialData?.id
                ? await updateSeason(initialData.id, modelData)
                : await addSeason(modelData);

            if (result.success) {
                toast.success(initialData ? "Temporada actualizada correctamente" : "Temporada creada correctamente");
                router.push("/temporadas");
                router.refresh();
            } else {
                toast.error(result.error || "Error al guardar la temporada");
            }
        } catch (error) {
            console.error("Error saving season:", error);
            toast.error("Error inesperado al guardar la temporada");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl px-1 pb-10">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Nombre de la Temporada</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("name")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.name ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="Ej: Temporada 2024"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Fecha de Inicio</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                {...register("startDate")}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.startDate ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Fecha de Fin</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                {...register("endDate")}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.endDate ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:bg-slate-900/20">
                    <label className="text-sm font-semibold flex-1">¿Está activa actualmente?</label>
                    <button
                        type="button"
                        onClick={() => setValue("isActive", !isActive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {isActive ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" /> Sí, Activa
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4" /> No, Inactiva
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Theater className="h-5 w-5 text-primary" />
                        <h3 className="font-bold tracking-tight">Obras de la Temporada</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Selecciona las obras que estarán disponibles durante esta temporada.</p>
                    {errors.workIds && <p className="text-xs text-red-500 font-medium">{errors.workIds.message}</p>}

                    <div className="grid gap-3 sm:grid-cols-2">
                        {availableWorks.map((work) => {
                            const isSelected = selectedWorkIds.includes(work.id);
                            return (
                                <button
                                    key={work.id}
                                    type="button"
                                    onClick={() => toggleWork(work.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border text-left transition-all hover:shadow-md active:scale-[0.98]",
                                        isSelected
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-slate-200 bg-card hover:border-slate-300"
                                    )}
                                >
                                    <span className="text-sm font-semibold truncate pr-2">{work.title}</span>
                                    <div className={cn(
                                        "h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary border-primary text-white" : "border-slate-300 bg-white"
                                    )}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                </button>
                            );
                        })}
                        {availableWorks.length === 0 && (
                            <p className="text-sm text-muted-foreground italic col-span-full">No hay obras registradas.</p>
                        )}
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
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                >
                    {loading ? "Guardando..." : initialData ? "Actualizar Temporada" : "Crear Temporada"}
                </button>
            </div>
        </form>
    );
}
