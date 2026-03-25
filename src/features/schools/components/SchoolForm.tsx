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

interface SchoolFormData {
    name: string;
    district?: string;
    address?: string;
    email: string;
    phone: string;
    isPrivate?: boolean;
    contactName: string;
    notes?: string;
}

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
            const payload = {
                ...data,
                isPrivate: data.isPrivate ?? false,
            };

            const result = initialData?.id
                ? await updateSchool(initialData.id, payload as any)
                : await addSchool(payload as any);

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
                    <label className="text-sm font-display font-medium text-primary">Nombre de la Escuela</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            {...register("name")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.name ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="Ej: Escuela N° 1"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-accent font-sans mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Tipo de Gestion</label>
                    <select
                        {...register("isPrivate", {
                            setValueAs: (v) => v === "private"
                        })}
                        className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    >
                        <option value="public">Publica / Estatal</option>
                        <option value="private">Privada</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Barrio / Comuna / Distrito</label>
                    <input
                        {...register("district")}
                        className={`w-full border px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.district ? 'border-accent' : 'border-gray-300'}`}
                        placeholder="Ej: Caballito"
                    />
                    {errors.district && <p className="text-xs text-accent font-sans mt-1">{errors.district.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-display font-medium text-primary">Direccion</label>
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

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Responsable / Contacto</label>
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
                    <label className="text-sm font-display font-medium text-primary">Telefono</label>
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
                    <label className="text-sm font-display font-medium text-primary">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            {...register("email")}
                            className={`w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${errors.email ? 'border-accent' : 'border-gray-300'}`}
                            placeholder="ejemplo@escuela.com"
                        />
                    </div>
                    {errors.email && <p className="text-xs text-accent font-sans mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-display font-medium text-primary">Notas</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                            {...register("notes")}
                            className="w-full min-h-[100px] resize-none border border-gray-300 px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="Informacion adicional relevante..."
                        />
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
                    {loading ? "Guardando..." : initialData ? "Actualizar Escuela" : "Crear Escuela"}
                </button>
            </div>
        </form>
    );
}
