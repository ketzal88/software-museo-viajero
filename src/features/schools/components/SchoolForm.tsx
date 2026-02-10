"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School } from "@/types";
import { addSchool, updateSchool } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { MapPin, Phone, User, Mail, FileText, Building2 } from "lucide-react";
import { toast } from "sonner";
import { schoolSchema } from "@/lib/validations";
import * as z from "zod";

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolFormProps {
    initialData?: School;
}

export function SchoolForm({ initialData }: SchoolFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SchoolFormData>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            name: initialData?.name || "",
            address: initialData?.address || "",
            district: initialData?.district || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            isPrivate: initialData?.isPrivate || false,
            contactName: initialData?.contactName || "",
            notes: initialData?.notes || "",
        },
    });

    const onSubmit = async (data: SchoolFormData) => {
        setLoading(true);
        try {
            const result = initialData?.id
                ? await updateSchool(initialData.id, data)
                : await addSchool(data);

            if (result.success) {
                toast.success(initialData ? "Escuela actualizada correctamente" : "Escuela creada correctamente");
                router.push("/escuelas");
                router.refresh();
            } else {
                toast.error(result.error || "Error al guardar la escuela");
            }
        } catch (error) {
            console.error("Error saving school:", error);
            toast.error("Error inesperado al guardar la escuela");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl px-1 pb-10">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Nombre de la Escuela</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            {...register("name")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.name ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="Ej: Escuela N° 1"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Tipo de Gestión</label>
                    <select
                        {...register("isPrivate", {
                            setValueAs: (v) => v === "private"
                        })}
                        className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="public">Pública / Estatal</option>
                        <option value="private">Privada</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Barrio / Comuna / Distrito</label>
                    <input
                        {...register("district")}
                        className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.district ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        placeholder="Ej: Caballito"
                    />
                    {errors.district && <p className="text-xs text-red-500 font-medium">{errors.district.message}</p>}
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

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Responsable / Contacto</label>
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
                    <label className="text-sm font-semibold">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="email"
                            {...register("email")}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.email ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            placeholder="ejemplo@escuela.com"
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Notas</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                            {...register("notes")}
                            className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Información adicional relevante..."
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Escuela" : "Crear Escuela"}
                </button>
            </div>
        </form>
    );
}
