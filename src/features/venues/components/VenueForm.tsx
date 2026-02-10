"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Venue, SlotTemplate } from "@/types";
import { addVenue, updateVenue } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { MapPin, Users, Phone, User, FileText, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { venueSchema } from "@/lib/validations";
import * as z from "zod";

type VenueFormData = z.infer<typeof venueSchema>;

interface VenueFormProps {
    initialData?: Venue;
}

export function VenueForm({ initialData }: VenueFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
    } = useForm<VenueFormData>({
        resolver: zodResolver(venueSchema),
        defaultValues: {
            name: initialData?.name || "",
            address: initialData?.address || initialData?.addressLine || "",
            addressLine: initialData?.addressLine || initialData?.address || "",
            mapsUrl: initialData?.mapsUrl || "",
            defaultCapacity: initialData?.defaultCapacity || 0,
            contactName: initialData?.contactName || "",
            phone: initialData?.phone || "",
            notes: initialData?.notes || "",
            defaultSlotTemplate: initialData?.defaultSlotTemplate || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "defaultSlotTemplate",
    });

    const onSubmit = async (data: VenueFormData) => {
        setLoading(true);
        try {
            // Sync address and addressLine
            const finalData = {
                ...data,
                addressLine: data.address
            };

            const result = initialData?.id
                ? await updateVenue(initialData.id, finalData)
                : await addVenue(finalData);

            if (result.success) {
                toast.success(initialData ? "Teatro actualizado correctamente" : "Teatro creado correctamente");
                router.push("/teatros");
                router.refresh();
            } else {
                toast.error(result.error || "Error al guardar el teatro");
            }
        } catch (error) {
            console.error("Error saving venue:", error);
            toast.error("Error inesperado al guardar el teatro");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl px-1 pb-10">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Nombre del Teatro</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("name")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.name ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="Ej: Teatro Broadway"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Capacidad Default</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            {...register("defaultCapacity", { valueAsNumber: true })}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.defaultCapacity ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="0"
                        />
                    </div>
                    {errors.defaultCapacity && <p className="text-xs text-red-500 font-medium">{errors.defaultCapacity.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Dirección</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("address")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.address ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="Calle 123, Ciudad"
                        />
                    </div>
                    {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Google Maps URL</label>
                    <input
                        type="text"
                        {...register("mapsUrl")}
                        className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.mapsUrl ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        placeholder="https://maps.google.com/..."
                    />
                    {errors.mapsUrl && <p className="text-xs text-red-500 font-medium">{errors.mapsUrl.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Persona de Contacto</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("contactName")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.contactName ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="Nombre del responsable"
                        />
                    </div>
                    {errors.contactName && <p className="text-xs text-red-500 font-medium">{errors.contactName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("phone")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.phone ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="11 1234 5678"
                        />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Notas</label>
                    <textarea
                        {...register("notes")}
                        className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Información adicional relevante..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Template de Horarios (Slots)
                    </h3>
                    <button
                        type="button"
                        onClick={() => append({ startTime: "09:00", endTime: "11:00", label: "" })}
                        className="flex items-center gap-1 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
                    >
                        <Plus className="h-4 w-4" /> Agregar Slot
                    </button>
                </div>

                {fields.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-xl text-center text-muted-foreground">
                        No hay horarios definidos para este teatro. Use los slots para auto-generar funciones.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end bg-muted/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Inicio</label>
                                        <input
                                            type="time"
                                            {...register(`defaultSlotTemplate.${index}.startTime`)}
                                            className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Fin</label>
                                        <input
                                            type="time"
                                            {...register(`defaultSlotTemplate.${index}.endTime`)}
                                            className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Etiqueta (Opcional)</label>
                                        <input
                                            {...register(`defaultSlotTemplate.${index}.label`)}
                                            placeholder="Ej: Turno Mañana"
                                            className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {loading ? "Guardando..." : initialData ? "Actualizar Teatro" : "Crear Teatro"}
                </button>
            </div>
        </form>
    );
}
