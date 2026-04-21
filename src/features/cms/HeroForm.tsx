"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { heroSlideSchema } from "@/lib/validations";
import { addHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { HeroSlide } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof heroSlideSchema>;

export function HeroForm({ slide }: { slide?: HeroSlide }) {
    const router = useRouter();
    const isEdit = Boolean(slide);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(heroSlideSchema),
        defaultValues: slide ?? {
            order: 1,
            visible: true,
            imgPosition: "center",
            estreno: false,
            isActive: true,
            titulo: "",
            img: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        const result = isEdit
            ? await updateHeroSlide(slide!.id, data)
            : await addHeroSlide({ ...data, dateModified: new Date().toISOString() } as Omit<HeroSlide, "id" | "dateModified">);
        if (result.success) {
            toast.success(isEdit ? "Slide actualizado" : "Slide creado");
            router.push("/cms/hero");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    const onDelete = async () => {
        if (!slide || !confirm("¿Eliminar este slide?")) return;
        const result = await deleteHeroSlide(slide.id);
        if (result.success) {
            toast.success("Eliminado");
            router.push("/cms/hero");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="CMS · Hero Home"
                title={isEdit ? "Editar slide" : "Nuevo slide"}
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
                    <CmsField label="Orden" required>
                        <input type="number" {...register("order", { valueAsNumber: true })} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Eyebrow (small)"><input {...register("small")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Título" required error={errors.titulo?.message}>
                        <input {...register("titulo")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Subtítulo (HTML)"><input {...register("subTitulo")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Imagen desktop URL" required error={errors.img?.message}>
                        <input {...register("img")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Imagen mobile URL"><input {...register("imgMobile")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Posición de imagen">
                        <select {...register("imgPosition")} className={cmsInputClass}>
                            <option value="center">Centro</option>
                            <option value="top">Arriba</option>
                            <option value="bottom">Abajo</option>
                        </select>
                    </CmsField>
                    <CmsField label="CTA texto"><input {...register("cta")} className={cmsInputClass} /></CmsField>
                    <CmsField label="CTA Display"><input {...register("ctaDisplay")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Slug destino (ej: obligada)"><input {...register("ctaPage")} className={cmsInputClass} /></CmsField>
                    <CmsField label="URL externa (opcional)"><input {...register("urlOutside")} className={cmsInputClass} /></CmsField>
                    <CmsField label="Texto de estreno"><input {...register("estrenoText")} className={cmsInputClass} /></CmsField>
                </div>
                <div className="mt-6 flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("visible")} /> Visible</label>
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("estreno")} /> Es estreno</label>
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("isActive")} /> Activo</label>
                </div>
            </CmsFormShell>
        </form>
    );
}
