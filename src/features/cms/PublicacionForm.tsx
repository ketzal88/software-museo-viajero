"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publicacionSchema } from "@/lib/validations";
import { addPublicacion, updatePublicacion, deletePublicacion } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { Publicacion, Work } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof publicacionSchema>;

export function PublicacionForm({ publicacion, obras }: { publicacion?: Publicacion; obras: Work[] }) {
    const router = useRouter();
    const isEdit = Boolean(publicacion);
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(publicacionSchema),
        defaultValues: publicacion ?? {
            editorial: "EUDEBA",
            obrasIncluidas: [],
            isActive: true,
            order: 1,
        },
    });

    const obrasIncluidas = watch("obrasIncluidas") ?? [];

    const toggleObra = (slug: string) => {
        setValue("obrasIncluidas", obrasIncluidas.includes(slug)
            ? obrasIncluidas.filter(s => s !== slug)
            : [...obrasIncluidas, slug], { shouldValidate: true });
    };

    const onSubmit = async (data: FormData) => {
        const result = isEdit
            ? await updatePublicacion(publicacion!.id, data)
            : await addPublicacion({ ...data, dateModified: new Date().toISOString() } as Omit<Publicacion, "id">);
        if (result.success) {
            toast.success(isEdit ? "Publicación actualizada" : "Publicación creada");
            router.push("/cms/publicaciones");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    const onDelete = async () => {
        if (!publicacion || !confirm("¿Eliminar esta publicación?")) return;
        const result = await deletePublicacion(publicacion.id);
        if (result.success) {
            toast.success("Eliminada");
            router.push("/cms/publicaciones");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="CMS · Publicaciones"
                title={isEdit ? "Editar publicación" : "Nueva publicación"}
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
                    <CmsField label="Slug" required error={errors.slug?.message}>
                        <input {...register("slug")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Subtítulo"><input {...register("subtitle")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Año">
                        <input type="number" {...register("year", { valueAsNumber: true })} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Editorial" required><input {...register("editorial")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Portada URL" required error={errors.coverUrl?.message}>
                        <input {...register("coverUrl")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="URL de compra">
                        <input {...register("buyUrl")} className={cmsInputClass} placeholder="https://..." />
                    </CmsField>
                    <CmsField label="Orden">
                        <input type="number" {...register("order", { valueAsNumber: true })} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <CmsField label="Descripción">
                        <textarea {...register("description")} rows={6} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <p className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-3">Obras incluidas</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {obras.map(o => (
                            <label key={o.slug} className="flex items-center gap-2 text-sm font-sans">
                                <input
                                    type="checkbox"
                                    checked={obrasIncluidas.includes(o.slug!)}
                                    onChange={() => toggleObra(o.slug!)}
                                />
                                {o.title}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mt-6">
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("isActive")} /> Activa</label>
                </div>
            </CmsFormShell>
        </form>
    );
}
