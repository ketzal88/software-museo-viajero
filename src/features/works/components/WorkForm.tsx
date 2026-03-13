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
                    <label className="text-sm font-display font-medium text-primary">Título de la Obra</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("title")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.title ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="Ej: El Quijote"
                        />
                    </div>
                    {errors.title && <p className="text-xs text-accent font-sans mt-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Duración (minutos)</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="number"
                            {...register("duration", { valueAsNumber: true })}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.duration ? 'border-accent' : 'border-gray-300'}`}
                        />
                    </div>
                    {errors.duration && <p className="text-xs text-accent font-sans mt-1">{errors.duration.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Descripción</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                            {...register("description")}
                            className="w-full min-h-[120px] border border-gray-300 px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="Breve resumen de la obra..."
                        />
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Obra" : "Crear Obra"}
                </button>
            </div>
        </form>
    );
}
