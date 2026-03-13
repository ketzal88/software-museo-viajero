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
            workIds: initialData?.workIds || [],
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
            const result = initialData?.id
                ? await updateSeason(initialData.id, data)
                : await addSeason(data);

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
                    <label className="text-sm font-display font-medium text-primary">Nombre de la Temporada</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("name")}
                            className={cn(
                                "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                errors.name ? "border-accent" : "border-gray-300"
                            )}
                            placeholder="Ej: Temporada 2024"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-accent font-sans mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Fecha de Inicio</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                {...register("startDate")}
                                className={cn(
                                    "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                    errors.startDate ? "border-accent" : "border-gray-300"
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Fecha de Fin</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                {...register("endDate")}
                                className={cn(
                                    "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                    errors.endDate ? "border-accent" : "border-gray-300"
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 border border-gray-300">
                    <label className="text-sm font-display font-medium text-primary flex-1">¿Está activa actualmente?</label>
                    <button
                        type="button"
                        onClick={() => setValue("isActive", !isActive)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-display font-bold transition-all",
                            isActive
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        )}
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

                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <Theater className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-bold tracking-tight text-primary">Obras de la Temporada</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-sans">Selecciona las obras que estarán disponibles durante esta temporada.</p>
                    {errors.workIds && <p className="text-xs text-accent font-sans mt-1">{errors.workIds.message}</p>}

                    <div className="grid gap-3 sm:grid-cols-2">
                        {availableWorks.map((work) => {
                            const isSelected = selectedWorkIds.includes(work.id);
                            return (
                                <button
                                    key={work.id}
                                    type="button"
                                    onClick={() => toggleWork(work.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 border text-left transition-all",
                                        isSelected
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-gray-300 hover:border-primary/20"
                                    )}
                                >
                                    <span className="text-sm font-display font-medium truncate pr-2">{work.title}</span>
                                    <div className={cn(
                                        "h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"
                                    )}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                </button>
                            );
                        })}
                        {availableWorks.length === 0 && (
                            <p className="text-sm text-gray-500 font-sans italic col-span-full">No hay obras registradas.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Temporada" : "Crear Temporada"}
                </button>
            </div>
        </form>
    );
}
