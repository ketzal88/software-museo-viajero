"use client";

import { useState } from "react";
import { Work } from "@/types";
import { addWork, updateWork } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Clock, Type, FileText } from "lucide-react";

interface WorkFormProps {
    initialData?: Work;
}

export function WorkForm({ initialData }: WorkFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Work, "id">>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        duration: initialData?.duration || 60,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateWork(initialData.id, formData);
            } else {
                await addWork(formData);
            }
            router.push("/obras");
            router.refresh();
        } catch (error) {
            console.error("Error saving work:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Título de la Obra</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Ej: El Quijote"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Duración (minutos)</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full min-h-[120px] rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Breve resumen de la obra..."
                        />
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Obra" : "Crear Obra"}
                </button>
            </div>
        </form>
    );
}
