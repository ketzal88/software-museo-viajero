"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { funcionCarteleraSchema } from "@/lib/validations";
import { addFuncion, updateFuncion, deleteFuncion } from "@/lib/actions";
import { CmsFormShell, CmsField, cmsInputClass } from "./CmsFormShell";
import type { FuncionCartelera, Work, Venue } from "@/types";
import type { z } from "zod";

type FormData = z.input<typeof funcionCarteleraSchema>;

export function FuncionForm({
    funcion,
    obras,
    venues,
}: {
    funcion?: FuncionCartelera;
    obras: Work[];
    venues: Venue[];
}) {
    const router = useRouter();
    const isEdit = Boolean(funcion);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(funcionCarteleraSchema),
        defaultValues: funcion
            ? {
                workSlug: funcion.workSlug,
                venueSlug: funcion.venueSlug,
                fechaInicio: funcion.fechaInicio,
                fechaFin: funcion.fechaFin,
                fechaFuncion: funcion.fechaFuncion,
                siempreVisible: funcion.siempreVisible,
                agotada: funcion.agotada,
                horarios: funcion.horarios,
                precio: funcion.precio,
                promo: funcion.promo,
                isActive: funcion.isActive,
            }
            : {
                siempreVisible: false,
                agotada: false,
                horarios: ["10:00"],
                precio: 0,
                isActive: true,
            },
    });

    const horarios = watch("horarios") ?? [];

    const onSubmit = async (data: FormData) => {
        const action = isEdit
            ? updateFuncion(funcion!.id, data)
            : addFuncion({ ...data, dateModified: new Date().toISOString() } as unknown as Omit<FuncionCartelera, "id" | "dateModified">);
        const result = await action;
        if (result.success) {
            toast.success(isEdit ? "Función actualizada" : "Función creada");
            router.push("/cms/cartelera");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error al guardar");
        }
    };

    const onDelete = async () => {
        if (!funcion) return;
        if (!confirm("¿Eliminar esta función?")) return;
        const result = await deleteFuncion(funcion.id);
        if (result.success) {
            toast.success("Eliminada");
            router.push("/cms/cartelera");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error al eliminar");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CmsFormShell
                eyebrow={isEdit ? "Editar función" : "Nueva función"}
                title={isEdit ? "Función programada" : "Nueva función de cartelera"}
                actions={
                    <>
                        <button type="submit" disabled={isSubmitting} className="border border-primary bg-primary px-6 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50">
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </button>
                        {isEdit && (
                            <button type="button" onClick={onDelete} className="text-[11px] font-display font-bold uppercase tracking-widest text-red-600 hover:text-red-800">
                                Eliminar
                            </button>
                        )}
                        <button type="button" onClick={() => router.push("/cms/cartelera")} className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 hover:text-primary">
                            Cancelar
                        </button>
                    </>
                }
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <CmsField label="Obra" required error={errors.workSlug?.message}>
                        <select {...register("workSlug")} className={cmsInputClass}>
                            <option value="">— Elegir obra —</option>
                            {obras.map(o => <option key={o.slug} value={o.slug!}>{o.title}</option>)}
                        </select>
                    </CmsField>
                    <CmsField label="Sala" required error={errors.venueSlug?.message}>
                        <select {...register("venueSlug")} className={cmsInputClass}>
                            <option value="">— Elegir sala —</option>
                            {venues.map(v => <option key={v.slug} value={v.slug!}>{v.name}</option>)}
                        </select>
                    </CmsField>
                    <CmsField label="Fecha de la función" required error={errors.fechaFuncion?.message}>
                        <input type="date" {...register("fechaFuncion")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Precio (ARS)" required error={errors.precio?.message}>
                        <input type="number" {...register("precio", { valueAsNumber: true })} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Fecha desde (temporada)" required error={errors.fechaInicio?.message}>
                        <input type="date" {...register("fechaInicio")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Fecha hasta (temporada)" required error={errors.fechaFin?.message}>
                        <input type="date" {...register("fechaFin")} className={cmsInputClass} />
                    </CmsField>
                </div>

                <div className="mt-6">
                    <CmsField label="Horarios (HH:mm)" hint="Podés agregar más de uno por fecha.">
                        <div className="flex flex-col gap-2">
                            {horarios.map((h, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={h}
                                        onChange={e => {
                                            const next = [...horarios];
                                            next[i] = e.target.value;
                                            setValue("horarios", next, { shouldValidate: true });
                                        }}
                                        placeholder="HH:mm"
                                        className={cmsInputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setValue("horarios", horarios.filter((_, j) => j !== i), { shouldValidate: true })}
                                        className="border border-gray-300 px-3 text-xs text-gray-600 hover:text-red-600"
                                    >✕</button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setValue("horarios", [...horarios, ""], { shouldValidate: true })}
                                className="self-start text-[11px] font-display font-bold uppercase tracking-widest text-accent"
                            >
                                + agregar horario
                            </button>
                        </div>
                    </CmsField>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <CmsField label="Promo nombre">
                        <input {...register("promo.nombre")} className={cmsInputClass} />
                    </CmsField>
                    <CmsField label="Promo descripción">
                        <input {...register("promo.descripcion")} className={cmsInputClass} />
                    </CmsField>
                </div>

                <div className="mt-6 flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm font-sans">
                        <input type="checkbox" {...register("siempreVisible")} /> Siempre visible
                    </label>
                    <label className="flex items-center gap-2 text-sm font-sans">
                        <input type="checkbox" {...register("agotada")} /> Función agotada
                    </label>
                    <label className="flex items-center gap-2 text-sm font-sans">
                        <input type="checkbox" {...register("isActive")} /> Activa
                    </label>
                </div>
            </CmsFormShell>
        </form>
    );
}
