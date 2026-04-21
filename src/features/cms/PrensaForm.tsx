"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { notaPrensaSchema } from "@/lib/validations";
import { addNotaPrensa, updateNotaPrensa, deleteNotaPrensa } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { NotaPrensa } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof notaPrensaSchema>;

export function PrensaForm({ nota }: { nota?: NotaPrensa }) {
    const router = useRouter();
    const isEdit = Boolean(nota);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(notaPrensaSchema),
        defaultValues: nota ?? { destacadoSlider: false, isActive: true },
    });

    const onSubmit = async (data: FormData) => {
        const result = isEdit
            ? await updateNotaPrensa(nota!.id, data)
            : await addNotaPrensa({ ...data, dateModified: new Date().toISOString() } as Omit<NotaPrensa, "id">);
        if (result.success) {
            toast.success(isEdit ? "Nota actualizada" : "Nota creada");
            router.push("/cms/prensa");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    const onDelete = async () => {
        if (!nota || !confirm("¿Eliminar esta nota?")) return;
        const result = await deleteNotaPrensa(nota.id);
        if (result.success) {
            toast.success("Eliminada");
            router.push("/cms/prensa");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="CMS · Prensa"
                title={isEdit ? "Editar nota" : "Nueva nota"}
                actions={
                    <>
                        <button type="submit" disabled={isSubmitting} className="border border-primary bg-primary px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50">
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </button>
                        {isEdit && <button type="button" onClick={onDelete} className="text-[11px] font-display font-bold uppercase tracking-widest text-red-600 hover:text-red-800">Eliminar</button>}
                    </>
                }
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <CmsField label="Título" required error={errors.title?.message}>
                        <input {...register("title")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Slug" required hint="Auto desde título si vacío." error={errors.slug?.message}>
                        <input {...register("slug")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Medio" required error={errors.medio?.message}>
                        <input {...register("medio")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Autor">
                        <input {...register("autor")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Fecha (YYYY-MM-DD)" required error={errors.fecha?.message}>
                        <input type="date" {...register("fecha")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="URL" required error={errors.url?.message}>
                        <input {...register("url")} className={cmsInputClass} placeholder="https://..." />
                    </CmsField>
                </div>
                <div className="mt-6 flex gap-6">
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("destacadoSlider")} /> Destacado en slider</label>
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("isActive")} /> Activa</label>
                </div>
            </CmsFormShell>
        </form>
    );
}
