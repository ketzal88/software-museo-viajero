"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { siteConfigNosotrosSchema } from "@/lib/validations";
import { updateSiteConfig } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { SiteConfigNosotros } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof siteConfigNosotrosSchema>;

export function SiteNosotrosForm({ data }: { data: SiteConfigNosotros | null }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(siteConfigNosotrosSchema),
        defaultValues: data ?? {
            title: "Sobre nosotros",
            body: "",
        },
    });

    const onSubmit = async (form: FormData) => {
        const result = await updateSiteConfig("nosotros", form);
        if (result.success) {
            toast.success("Nosotros actualizado");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="CMS · Sitio público"
                title="Nosotros"
                description="Texto principal de la página /nosotros. Podés usar HTML (strong, em, ul, h3, br)."
                actions={
                    <button type="submit" disabled={isSubmitting} className="border border-primary bg-primary px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50">
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                }
            >
                <CmsField label="Título" required error={errors.title?.message}>
                    <input {...register("title")} className={cmsInputClass} />
                </CmsField>
                <div className="mt-6">
                    <CmsField label="Cuerpo (HTML)" required hint="Se sanitiza automáticamente.">
                        <textarea {...register("body")} rows={20} className={cmsInputClass} />
                    </CmsField>
                </div>
                <div className="mt-6">
                    <CmsField label="SEO — Meta description">
                        <textarea {...register("seo.description")} rows={3} className={cmsInputClass} />
                    </CmsField>
                </div>
            </CmsFormShell>
        </form>
    );
}
