"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Work } from "@/types";
import { addWork, updateWork } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Clock, Type, FileText } from "lucide-react";
import { toast } from "sonner";
import { workSchema } from "@/lib/validations";
import * as z from "zod";

type WorkFormData = z.infer<typeof workSchema>;

interface WorkFormProps {
    initialData?: Work;
}

export function WorkForm({ initialData }: WorkFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<WorkFormData>({
        resolver: zodResolver(workSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            duration: initialData?.duration || 60,
        },
    });

    const onSubmit = async (data: WorkFormData) => {
        setLoading(true);
        try {
            const result = initialData?.id
                ? await updateWork(initialData.id, data)
                : await addWork(data);

            if (result.success) {
                toast.success(initialData ? "Obra actualizada correctamente" : "Obra creada correctamente");
                router.push("/obras");
                router.refresh();
            } else {
                toast.error(result.error || "Error al guardar la obra");
            }
        } catch (error) {
            console.error("Error saving work:", error);
            toast.error("Error inesperado al guardar la obra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl px-1 pb-10">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Título de la Obra</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("title")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.title ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="Ej: El Quijote"
                        />
                    </div>
                    {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Duración (minutos)</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            {...register("duration", { valueAsNumber: true })}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.duration ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        />
                    </div>
                    {errors.duration && <p className="text-xs text-red-500 font-medium">{errors.duration.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Descripción</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                            {...register("description")}
                            className="w-full min-h-[120px] rounded-lg border border-slate-200 bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Breve resumen de la obra..."
                        />
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Obra" : "Crear Obra"}
                </button>
            </div>
        </form>
    );
}
