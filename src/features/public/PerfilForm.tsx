"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePublicProfile, destroyPublicSession } from "@/lib/actions";
import { publicProfileUpdateSchema } from "@/lib/validations";
import type { PublicUser } from "@/types";
import type { z } from "zod";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type FormData = z.input<typeof publicProfileUpdateSchema>;

const inputClass = "w-full border border-gray-300 bg-white px-4 py-3 font-sans text-base text-primary placeholder:text-gray-400 focus:outline-none focus:border-accent";

export function PerfilForm({ user }: { user: PublicUser }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(publicProfileUpdateSchema),
        defaultValues: {
            displayName: user.displayName ?? "",
            organization: user.organization ?? "",
            photoURL: user.photoURL ?? "",
        },
    });

    const onSubmit = async (data: FormData) => {
        const result = await updatePublicProfile(user.uid, data);
        if (result.success) {
            toast.success("Perfil actualizado");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    const onLogout = async () => {
        await signOut(auth).catch(() => null);
        await destroyPublicSession();
        toast.success("Sesión cerrada");
        router.push("/");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">Nombre</label>
                <input {...register("displayName")} className={inputClass} />
                {errors.displayName && <p className="mt-1 text-xs text-red-600">{errors.displayName.message}</p>}
            </div>
            <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">Escuela / organización</label>
                <input {...register("organization")} className={inputClass} />
            </div>
            <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">Avatar URL</label>
                <input {...register("photoURL")} className={inputClass} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button type="submit" disabled={isSubmitting} className="border border-primary bg-primary px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50">
                    {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" onClick={onLogout} className="text-[11px] font-display font-bold uppercase tracking-widest text-red-600 hover:text-red-800">
                    Cerrar sesión
                </button>
            </div>
        </form>
    );
}
