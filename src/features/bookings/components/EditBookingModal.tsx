"use client";

import { useForm } from "react-hook-form";
import { TheaterBooking, School, GRADE_LEVELS, BookingStatus } from "@/types";
import { updateTheaterBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

interface EditBookingFormValues {
    qtyReservedStudents: number;
    qtyReservedAdults: number;
    contactName: string;
    contactPhone: string;
    gradeLevel: string;
    notes: string;
    status: BookingStatus;
}

interface EditBookingModalProps {
    booking: TheaterBooking & { school?: School | null };
    onClose: () => void;
}

export function EditBookingModal({ booking, onClose }: EditBookingModalProps) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<EditBookingFormValues>({
        defaultValues: {
            qtyReservedStudents: booking.qtyReservedStudents,
            qtyReservedAdults: booking.qtyReservedAdults,
            contactName: booking.contactName || booking.school?.contactName || "",
            contactPhone: booking.contactPhone || booking.school?.phone || "",
            gradeLevel: booking.gradeLevel || "",
            notes: booking.notes || "",
            status: booking.status,
        },
    });

    const onSubmit = async (data: EditBookingFormValues) => {
        const grade = GRADE_LEVELS.find(g => g.value === data.gradeLevel);
        const result = await updateTheaterBooking(booking.id, {
            qtyReservedStudents: data.qtyReservedStudents,
            qtyReservedAdults: data.qtyReservedAdults,
            contactName: data.contactName,
            contactPhone: data.contactPhone,
            gradeLevel: data.gradeLevel || undefined,
            gradeCycle: grade?.cycle || undefined,
            notes: data.notes,
            status: data.status,
        });

        if (result.success) {
            toast.success("Reserva actualizada");
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || "Error al actualizar");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-300 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-300">
                    <h3 className="font-display font-bold text-lg text-primary">
                        Editar Reserva
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-primary transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {booking.school && (
                    <div className="px-5 pt-4">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Escuela</p>
                        <p className="text-sm font-display font-bold text-primary mt-1">{booking.school.name}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Alumnos</label>
                            <input
                                type="number"
                                {...register("qtyReservedStudents", { valueAsNumber: true })}
                                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Invitados</label>
                            <input
                                type="number"
                                {...register("qtyReservedAdults", { valueAsNumber: true })}
                                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Contacto</label>
                            <input
                                type="text"
                                {...register("contactName")}
                                placeholder="Nombre de maestra/responsable"
                                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Telefono</label>
                            <input
                                type="text"
                                {...register("contactPhone")}
                                placeholder="Tel/Cel"
                                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Nivel</label>
                            <select
                                {...register("gradeLevel")}
                                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="">— Sin especificar —</option>
                                {GRADE_LEVELS.map(g => (
                                    <option
                                        key={g.value}
                                        value={g.value}
                                        style={{ fontWeight: g.isCycle ? "bold" : "normal", paddingLeft: g.isCycle ? 0 : 12 }}
                                    >
                                        {g.isCycle ? g.label : `  ${g.label}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Estado</label>
                            <select
                                {...register("status")}
                                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value={BookingStatus.HOLD}>Hold</option>
                                <option value={BookingStatus.PENDING}>Pendiente</option>
                                <option value={BookingStatus.CONFIRMED}>Confirmada</option>
                                <option value={BookingStatus.CANCELLED}>Cancelada</option>
                                <option value={BookingStatus.COMPLETED}>Completada</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Notas</label>
                        <textarea
                            {...register("notes")}
                            className="w-full min-h-[60px] border border-gray-300 px-3 py-2 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Notas de la reserva..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 px-4 py-2.5 text-sm font-display font-medium text-gray-600 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary px-4 py-2.5 text-sm font-display font-medium text-white hover:bg-black transition-colors uppercase tracking-wider disabled:opacity-50"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
