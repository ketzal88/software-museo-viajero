"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Person, RoleType } from "@/types";
import { addPerson, updatePerson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, User, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const personSchema = z.object({
    firstName: z.string().min(2, "El nombre es muy corto"),
    lastName: z.string().min(2, "El apellido es muy corto"),
    roleTypes: z.array(z.nativeEnum(RoleType)).min(1, "Selecciona al menos un rol"),
    phone: z.string(),
    email: z.string(),
    notes: z.string(),
    isActive: z.boolean(),
});

type PersonFormData = z.infer<typeof personSchema>;

interface StaffFormProps {
    initialData?: Person | null;
}

export function StaffForm({ initialData }: StaffFormProps) {
    const router = useRouter();
    const isEditing = !!initialData;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<PersonFormData>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            roleTypes: initialData?.roleTypes || [RoleType.ACTOR],
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            notes: initialData?.notes || "",
            isActive: initialData?.isActive ?? true,
        },
    });

    const currentRoles = watch("roleTypes") || [];

    const toggleRole = (role: RoleType) => {
        if (currentRoles.includes(role)) {
            if (currentRoles.length > 1) {
                setValue("roleTypes", currentRoles.filter(r => r !== role));
            }
        } else {
            setValue("roleTypes", [...currentRoles, role]);
        }
    };

    const onSubmit = async (data: PersonFormData) => {
        try {
            if (isEditing) {
                const result = await updatePerson(initialData.id, data);
                if (result.success) {
                    toast.success("Personal actualizado correctamente");
                    router.push("/staff");
                    router.refresh();
                } else {
                    toast.error(result.error || "Error al actualizar");
                }
            } else {
                const result = await addPerson(data);
                if (result.success) {
                    toast.success("Personal agregado correctamente");
                    router.push("/staff");
                    router.refresh();
                } else {
                    toast.error(result.error || "Error al agregar");
                }
            }
        } catch {
            toast.error("Ocurrió un error inesperado");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Información Personal
                    </h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nombre</label>
                        <div className="relative">
                            <input
                                {...register("firstName")}
                                placeholder="Ej: Juan"
                                className={cn(
                                    "w-full rounded-xl border bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all",
                                    errors.firstName ? "border-red-500 ring-red-100" : "border-slate-200 dark:border-slate-800"
                                )}
                            />
                        </div>
                        {errors.firstName && <p className="text-xs text-red-500 font-medium ml-1">{errors.firstName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Apellido</label>
                        <div className="relative">
                            <input
                                {...register("lastName")}
                                placeholder="Ej: Pérez"
                                className={cn(
                                    "w-full rounded-xl border bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all",
                                    errors.lastName ? "border-red-500 ring-red-100" : "border-slate-200 dark:border-slate-800"
                                )}
                            />
                        </div>
                        {errors.lastName && <p className="text-xs text-red-500 font-medium ml-1">{errors.lastName.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Roles</label>
                        <div className="flex gap-4">
                            {[RoleType.ACTOR, RoleType.ASSISTANT].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => toggleRole(role)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm font-bold",
                                        currentRoles.includes(role)
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700"
                                    )}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                        currentRoles.includes(role) ? "border-primary bg-primary text-white" : "border-slate-300"
                                    )}>
                                        {currentRoles.includes(role) && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>
                                    {role === RoleType.ACTOR ? "Actor / Actriz" : "Asistente / Staff"}
                                </button>
                            ))}
                        </div>
                        {errors.roleTypes && <p className="text-xs text-red-500 font-medium ml-1">{errors.roleTypes.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" /> Teléfono
                        </label>
                        <input
                            {...register("phone")}
                            placeholder="+54 9 11 ..."
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" /> Correo Electrónico
                        </label>
                        <input
                            {...register("email")}
                            placeholder="email@ejemplo.com"
                            className={cn(
                                "w-full rounded-xl border bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all",
                                errors.email ? "border-red-500 ring-red-100" : "border-slate-200 dark:border-slate-800"
                            )}
                        />
                        {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" /> Notas Internas
                        </label>
                        <textarea
                            {...register("notes")}
                            rows={3}
                            placeholder="Alias, especialidades, disponibilidad..."
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Estado Activo</p>
                            <p className="text-xs text-slate-500">¿Esta persona está disponible para ser asignada a obras?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("isActive")}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-3 bg-primary text-white rounded-xl font-extrabold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Staff" : "Crear Staff"}
                </button>
            </div>
        </form>
    );
}
