"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { materialEducativoSchema } from "@/lib/validations";
import { addMaterial, updateMaterial, deleteMaterial } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { MaterialEducativo, Work } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof materialEducativoSchema>;

export function MaterialForm({ material, obras }: { material?: MaterialEducativo; obras: Work[] }) {
    const router = useRouter();
    const isEdit = Boolean(material);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(materialEducativoSchema),
        defaultValues: material ?? {
            tipo: "Actividad",
            nivelAcceso: 1,
            isActive: true,
            descargas: 0,
            ciclos: { inicial: false, primerCiclo: false, segundoCiclo: false, tercerCiclo: false, secundario: false },
        },
    });

    const onSubmit = async (data: FormData) => {
        const result = isEdit
            ? await updateMaterial(material!.id, data as Partial<MaterialEducativo>)
            : await addMaterial({ ...data, dateModified: new Date().toISOString() } as Omit<MaterialEducativo, "id">);
        if (result.success) {
            toast.success(isEdit ? "Material actualizado" : "Material creado");
            router.push("/cms/materiales");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    const onDelete = async () => {
        if (!material || !confirm("¿Eliminar este material?")) return;
        const result = await deleteMaterial(material.id);
        if (result.success) {
            toast.success("Eliminado");
            router.push("/cms/materiales");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="CMS · Materiales"
                title={isEdit ? "Editar material" : "Nuevo material"}
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
                    <CmsField label="Obra asociada">
                        <select {...register("workSlug")} className={cmsInputClass}>
                            <option value="">— Sin obra —</option>
                            {obras.map(o => <option key={o.slug} value={o.slug!}>{o.title}</option>)}
                        </select>
                    </CmsField>
                    <CmsField label="Tipo" required>
                        <select {...register("tipo")} className={cmsInputClass}>
                            <option value="Actividad">Actividad</option>
                            <option value="Investigación">Investigación</option>
                            <option value="Crucigrama">Crucigrama</option>
                            <option value="Guía">Guía didáctica</option>
                            <option value="Video">Video</option>
                            <option value="PDF">PDF</option>
                        </select>
                    </CmsField>
                    <CmsField label="Nivel de acceso (0=libre, 1=bronce, 2=plata, 3=oro)" required error={errors.nivelAcceso?.message}>
                        <input type="number" min={0} max={9} {...register("nivelAcceso", { valueAsNumber: true })} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="URL de descarga">
                        <input {...register("url")} className={cmsInputClass} placeholder="https://..." />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <CmsField label="Descripción">
                        <textarea {...register("description")} rows={4} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <p className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-3">Ciclos aplicables</p>
                    <div className="flex flex-wrap gap-4 text-sm font-sans">
                        <label className="flex items-center gap-2"><input type="checkbox" {...register("ciclos.inicial")} /> Inicial</label>
                        <label className="flex items-center gap-2"><input type="checkbox" {...register("ciclos.primerCiclo")} /> 1er Ciclo</label>
                        <label className="flex items-center gap-2"><input type="checkbox" {...register("ciclos.segundoCiclo")} /> 2do Ciclo</label>
                        <label className="flex items-center gap-2"><input type="checkbox" {...register("ciclos.tercerCiclo")} /> 3er Ciclo</label>
                        <label className="flex items-center gap-2"><input type="checkbox" {...register("ciclos.secundario")} /> Secundario</label>
                    </div>
                </div>
                <div className="mt-6">
                    <label className="flex items-center gap-2 text-sm font-sans"><input type="checkbox" {...register("isActive")} /> Activo</label>
                </div>
            </CmsFormShell>
        </form>
    );
}
