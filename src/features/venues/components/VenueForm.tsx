"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Venue } from "@/types";
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
                    <label className="text-sm font-display font-medium text-primary">Nombre del Teatro</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("name")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.name ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="Ej: Teatro Broadway"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-accent font-sans mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Capacidad Default</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="number"
                            {...register("defaultCapacity", { valueAsNumber: true })}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.defaultCapacity ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="0"
                        />
                    </div>
                    {errors.defaultCapacity && <p className="text-xs text-accent font-sans mt-1">{errors.defaultCapacity.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-display font-medium text-primary">Dirección</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("address")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.address ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="Calle 123, Ciudad"
                        />
                    </div>
                    {errors.address && <p className="text-xs text-accent font-sans mt-1">{errors.address.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-display font-medium text-primary">Google Maps URL</label>
                    <input
                        type="text"
                        {...register("mapsUrl")}
                        className={`w-full border px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.mapsUrl ? 'border-accent' : 'border-gray-300'}`}
                        placeholder="https://maps.google.com/..."
                    />
                    {errors.mapsUrl && <p className="text-xs text-accent font-sans mt-1">{errors.mapsUrl.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Persona de Contacto</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("contactName")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.contactName ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="Nombre del responsable"
                        />
                    </div>
                    {errors.contactName && <p className="text-xs text-accent font-sans mt-1">{errors.contactName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("phone")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.phone ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="11 1234 5678"
                        />
                    </div>
                    {errors.phone && <p className="text-xs text-accent font-sans mt-1">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-display font-medium text-primary">Notas</label>
                    <textarea
                        {...register("notes")}
                        className="w-full min-h-[100px] border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        placeholder="Información adicional relevante..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-medium text-primary flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        Template de Horarios (Slots)
                    </h3>
                    <button
                        type="button"
                        onClick={() => append({ startTime: "09:00", endTime: "11:00", label: "" })}
                        className="flex items-center gap-1 text-sm font-display font-medium text-primary hover:opacity-80 transition-opacity"
                    >
                        <Plus className="h-4 w-4" /> Agregar Slot
                    </button>
                </div>

                {fields.length === 0 ? (
                    <div className="border border-dashed border-gray-300 p-12 text-center text-gray-500 font-sans text-sm">
                        No hay horarios definidos para este teatro. Use los slots para auto-generar funciones.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end border border-gray-300 p-4 transition-all">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Inicio</label>
                                        <input
                                            type="time"
                                            {...register(`defaultSlotTemplate.${index}.startTime`)}
                                            className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Fin</label>
                                        <input
                                            type="time"
                                            {...register(`defaultSlotTemplate.${index}.endTime`)}
                                            className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1 col-span-2 sm:col-span-1">
                                        <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Etiqueta (Opcional)</label>
                                        <input
                                            {...register(`defaultSlotTemplate.${index}.label`)}
                                            placeholder="Ej: Turno Mañana"
                                            className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="h-9 w-9 flex items-center justify-center text-accent hover:opacity-70 transition-colors shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Teatro" : "Crear Teatro"}
                </button>
            </div>
        </form>
    );
}
