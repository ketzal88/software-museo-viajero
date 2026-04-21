"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { workPublicSchema } from "@/lib/validations";
import { updateWorkPublic } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { Work, TemaObra } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof workPublicSchema>;

export function ObraForm({ obra, temas }: { obra: Work; temas: TemaObra[] }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(workPublicSchema),
        defaultValues: {
            title: obra.title,
            slug: obra.slug ?? "",
            subTitle: obra.subTitle,
            description: obra.description,
            body: obra.body,
            tipoDeObra: obra.tipoDeObra,
            pie: obra.pie,
            temaSlug: obra.temaSlug,
            imgPortada: obra.imgPortada,
            keywords: obra.keywords,
            estreno: obra.estreno ?? false,
            estrenoText: obra.estrenoText,
            anioEstreno: obra.anioEstreno ?? null,
            isActive: obra.isActive ?? true,
            isPublicVisible: obra.isPublicVisible ?? true,
            seo: obra.seo,
        },
    });

    const onSubmit = async (data: FormData) => {
        const result = await updateWorkPublic(obra.id, data as Partial<Work>);
        if (result.success) {
            toast.success("Obra actualizada");
            router.push("/cms/obras");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error al guardar");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="Editar obra del sitio público"
                title={obra.title}
                description={`URL pública: /repertorio/${obra.slug}`}
                actions={
                    <>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="border border-primary bg-primary px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/cms/obras")}
                            className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 hover:text-primary"
                        >
                            Cancelar
                        </button>
                    </>
                }
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <CmsField label="Título" required error={errors.title?.message}>
                        <input {...register("title")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Slug (URL)" required hint="Minúsculas, guiones. Sale en /repertorio/[slug]." error={errors.slug?.message}>
                        <input {...register("slug")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Subtítulo" error={errors.subTitle?.message}>
                        <input {...register("subTitle")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Tipo de obra" hint="Ej: Comedia musical, Comedia histórica.">
                        <input {...register("tipoDeObra")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Tema" hint="Agrupa en /repertorio.">
                        <select {...register("temaSlug")} className={cmsInputClass}>
                            <option value="">— Sin clasificar —</option>
                            {temas.map(t => (
                                <option key={t.slug} value={t.slug}>{t.title}</option>
                            ))}
                        </select>
                    </CmsField>
                    <CmsField label="Año de estreno">
                        <input type="number" {...register("anioEstreno", { valueAsNumber: true, setValueAs: v => v === "" ? null : Number(v) })} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <CmsField label="Descripción (HTML)" hint="Se sanitiza automáticamente con DOMPurify. Permite <br/>, <strong>, <em>, listas.">
                        <textarea {...register("body")} rows={12} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <CmsField label="Imagen de portada (URL)" hint="Ruta local /images/obras/... o URL de Storage.">
                        <input {...register("imgPortada")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Nota al pie editorial">
                        <input {...register("pie")} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <CmsField label="SEO — Meta title" hint="Max 70 caracteres. Si vacío, se usa el título.">
                        <input {...register("seo.title")} className={cmsInputClass} />
                    </CmsField>
                    <div className="mt-4">
                        <CmsField label="SEO — Meta description" hint="Max 160 caracteres. Answer-first.">
                            <textarea {...register("seo.description")} rows={3} className={cmsInputClass} />
                        </CmsField>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm font-sans">
                        <input type="checkbox" {...register("isPublicVisible")} />
                        Visible en el sitio público
                    </label>
                    <label className="flex items-center gap-2 text-sm font-sans">
                        <input type="checkbox" {...register("estreno")} />
                        En estreno
                    </label>
                </div>
                <div className="mt-4">
                    <CmsField label="Texto de estreno" hint="Ej: '23 de octubre · Estreno'.">
                        <input {...register("estrenoText")} className={cmsInputClass} />
                    </CmsField>
                </div>
            </CmsFormShell>
        </form>
    );
}
