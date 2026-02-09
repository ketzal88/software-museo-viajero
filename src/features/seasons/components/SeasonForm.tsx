"use client";

import { useState } from "react";
import { Season, Work } from "@/types";
import { addSeason, updateSeason } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, Type, CheckCircle2, XCircle, Theater, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonFormProps {
    initialData?: Season;
    availableWorks: Work[];
}

export function SeasonForm({ initialData, availableWorks }: SeasonFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Season, "id">>({
        name: initialData?.name || "",
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate || new Date().toISOString().split('T')[0],
        isActive: initialData?.isActive ?? true,
        worksIds: initialData?.worksIds || [],
    });

    const toggleWork = (workId: string) => {
        const currentIds = formData.worksIds || [];
        const nextIds = currentIds.includes(workId)
            ? currentIds.filter(id => id !== workId)
            : [...currentIds, workId];
        setFormData({ ...formData, worksIds: nextIds });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateSeason(initialData.id, formData);
            } else {
                await addSeason(formData);
            }
            router.push("/temporadas");
            router.refresh();
        } catch (error) {
            console.error("Error saving season:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre de la Temporada</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Ej: Temporada 2024"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha de Inicio</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha de Fin</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                    <label className="text-sm font-medium flex-1">¿Está activa actualmente?</label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.isActive
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                    >
                        {formData.isActive ? (
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

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Theater className="h-5 w-5 text-primary" />
                        <h3 className="font-bold tracking-tight">Obras de la Temporada</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Selecciona las obras que estarán disponibles durante esta temporada.</p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {availableWorks.map((work) => {
                            const isSelected = formData.worksIds?.includes(work.id);
                            return (
                                <button
                                    key={work.id}
                                    type="button"
                                    onClick={() => toggleWork(work.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border text-left transition-all hover:shadow-sm",
                                        isSelected
                                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                            : "border-border bg-card hover:border-primary/50"
                                    )}
                                >
                                    <span className="text-sm font-semibold truncate pr-2">{work.title}</span>
                                    <div className={cn(
                                        "h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground"
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
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                    {loading ? "Guardando..." : initialData ? "Actualizar Temporada" : "Crear Temporada"}
                </button>
            </div>
        </form>
    );
}
