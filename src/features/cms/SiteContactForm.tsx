"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { siteConfigContactSchema } from "@/lib/validations";
import { updateSiteConfig } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { SiteConfigContact } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof siteConfigContactSchema>;

export function SiteContactForm({ data }: { data: SiteConfigContact | null }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(siteConfigContactSchema),
        defaultValues: data ?? { email: "", phone: "", whatsApp: "" },
    });

    const onSubmit = async (form: FormData) => {
        const result = await updateSiteConfig("contact", form);
        if (result.success) {
            toast.success("Contacto actualizado");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow="CMS · Sitio público"
                title="Datos de contacto"
                description="Se muestran en la página /contacto y en el footer."
                actions={
                    <button type="submit" disabled={isSubmitting} className="border border-primary bg-primary px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50">
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                }
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <CmsField label="Email" required error={errors.email?.message}>
                        <input type="email" {...register("email")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Teléfono" required error={errors.phone?.message}>
                        <input {...register("phone")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Celular">
                        <input {...register("celPhone")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="WhatsApp" required hint="Número completo con código país, sin +, sin espacios. Ej: 5491132556399" error={errors.whatsApp?.message}>
                        <input {...register("whatsApp")} className={cmsInputClass} />
                    </CmsField>
                </div>
            </CmsFormShell>
        </form>
    );
}
