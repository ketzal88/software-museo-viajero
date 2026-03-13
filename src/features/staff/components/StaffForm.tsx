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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="border border-gray-300 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-xl font-display font-bold text-primary flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Información Personal
                    </h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary ml-1">Nombre</label>
                        <div className="relative">
                            <input
                                {...register("firstName")}
                                placeholder="Ej: Juan"
                                className={cn(
                                    "w-full border px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                    errors.firstName ? "border-accent" : "border-gray-300"
                                )}
                            />
                        </div>
                        {errors.firstName && <p className="text-xs text-accent font-sans mt-1 ml-1">{errors.firstName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary ml-1">Apellido</label>
                        <div className="relative">
                            <input
                                {...register("lastName")}
                                placeholder="Ej: Pérez"
                                className={cn(
                                    "w-full border px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                    errors.lastName ? "border-accent" : "border-gray-300"
                                )}
                            />
                        </div>
                        {errors.lastName && <p className="text-xs text-accent font-sans mt-1 ml-1">{errors.lastName.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-display font-medium text-primary ml-1">Roles</label>
                        <div className="flex gap-4">
                            {[RoleType.ACTOR, RoleType.ASSISTANT].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => toggleRole(role)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-4 border transition-all text-sm font-display font-bold",
                                        currentRoles.includes(role)
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-gray-300 text-gray-500 hover:border-primary/20"
                                    )}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                        currentRoles.includes(role) ? "border-primary bg-primary text-white" : "border-gray-300"
                                    )}>
                                        {currentRoles.includes(role) && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>
                                    {role === RoleType.ACTOR ? "Actor / Actriz" : "Asistente / Staff"}
                                </button>
                            ))}
                        </div>
                        {errors.roleTypes && <p className="text-xs text-accent font-sans mt-1 ml-1">{errors.roleTypes.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary ml-1 flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400" /> Teléfono
                        </label>
                        <input
                            {...register("phone")}
                            placeholder="+54 9 11 ..."
                            className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary ml-1 flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400" /> Correo Electrónico
                        </label>
                        <input
                            {...register("email")}
                            placeholder="email@ejemplo.com"
                            className={cn(
                                "w-full border px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                errors.email ? "border-accent" : "border-gray-300"
                            )}
                        />
                        {errors.email && <p className="text-xs text-accent font-sans mt-1 ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-display font-medium text-primary ml-1 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-gray-400" /> Notas Internas
                        </label>
                        <textarea
                            {...register("notes")}
                            rows={3}
                            placeholder="Alias, especialidades, disponibilidad..."
                            className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-300 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-display font-bold text-primary">Estado Activo</p>
                            <p className="text-xs text-gray-500 font-sans">¿Esta persona está disponible para ser asignada a obras?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("isActive")}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30 flex items-center justify-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Staff" : "Crear Staff"}
                </button>
            </div>
        </form>
    );
}
