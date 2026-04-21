"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContactLead } from "@/lib/actions";
import { toast } from "sonner";

const schema = z.object({
    name: z.string().min(2, "Tu nombre es obligatorio"),
    email: z.string().email("Correo no válido"),
    phone: z.string().optional(),
    organization: z.string().optional(),
    subject: z.string().min(3, "Asunto obligatorio"),
    message: z.string().min(10, "Contanos un poco más (mínimo 10 caracteres)"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        const result = await submitContactLead(data);
        if (result.success) {
            toast.success("¡Gracias! Recibimos tu mensaje — te respondemos a la brevedad.");
            setSubmitted(true);
            reset();
        } else {
            toast.error(result.error ?? "No pudimos enviar el mensaje — intentá por WhatsApp.");
        }
    };

    if (submitted) {
        return (
            <div className="border border-primary bg-primary/5 p-10 text-center">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Mensaje recibido
                </p>
                <h3 className="mt-3 text-3xl font-display font-bold text-primary">
                    ¡Gracias por escribirnos!
                </h3>
                <p className="mt-3 font-sans text-gray-600">
                    Te respondemos por mail o teléfono en las próximas 48 horas.
                </p>
                <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-[11px] font-display font-bold uppercase tracking-widest text-primary hover:text-accent"
                >
                    Enviar otro mensaje →
                </button>
            </div>
        );
    }

    const inputClass = "w-full border border-gray-300 bg-white px-4 py-3 font-sans text-base text-primary placeholder:text-gray-400 focus:outline-none focus:border-accent";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Nombre *
                    </label>
                    <input {...register("name")} className={inputClass} placeholder="Tu nombre" />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Email *
                    </label>
                    <input {...register("email")} type="email" className={inputClass} placeholder="tuemail@ejemplo.com" />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Teléfono
                    </label>
                    <input {...register("phone")} className={inputClass} placeholder="+54 9 11 ..." />
                </div>
                <div>
                    <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Escuela / organización
                    </label>
                    <input {...register("organization")} className={inputClass} placeholder="Colegio, institución..." />
                </div>
            </div>
            <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Asunto *
                </label>
                <input {...register("subject")} className={inputClass} placeholder="Reserva de función, consulta..." />
                {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
            </div>
            <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Mensaje *
                </label>
                <textarea {...register("message")} rows={6} className={inputClass} placeholder="Contanos tu consulta..." />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center border border-primary bg-primary px-8 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent transition-colors disabled:opacity-50"
            >
                {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </button>
        </form>
    );
}
