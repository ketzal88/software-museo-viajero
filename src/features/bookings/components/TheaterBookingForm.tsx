"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, EventSlot, Work, TheaterBooking, BillingPolicy, AttendanceStatus } from "@/types";
import { addTheaterBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Users, Info, Ticket, Check, ShieldCheck, Clock, DollarSign } from "lucide-react";
import { SchoolAutocomplete } from "@/features/schools/components/SchoolAutocomplete";
import { cn } from "@/lib/utils";
import { theaterBookingSchema } from "@/lib/validations";
import { toast } from "sonner";

interface TheaterBookingFormValues {
    schoolId: string;
    qtyReservedStudents: number;
    qtyReservedAdults: number;
    billingPolicy: BillingPolicy;
    unitPriceStudent: number;
    unitPriceAdult: number;
    totalExpected: number;
    notes?: string;
    isHold: boolean;
}

interface TheaterBookingFormProps {
    slot: EventSlot;
    work: Work;
}

export function TheaterBookingForm({ slot, work }: TheaterBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TheaterBookingFormValues>({
        resolver: zodResolver(theaterBookingSchema),
        defaultValues: {
            schoolId: "",
            qtyReservedStudents: 0,
            qtyReservedAdults: 0,
            billingPolicy: BillingPolicy.RESERVED,
            unitPriceStudent: 0,
            unitPriceAdult: 0,
            totalExpected: 0,
            notes: "",
            isHold: true,
        },
    });

    const isHold = watch("isHold");
    const qtyReservedStudents = watch("qtyReservedStudents") || 0;
    const qtyReservedAdults = watch("qtyReservedAdults") || 0;
    const unitPriceStudent = watch("unitPriceStudent") || 0;
    const unitPriceAdult = watch("unitPriceAdult") || 0;
    const availableSlots = slot.availableCapacity;

    // Auto-calculate totalExpected
    useEffect(() => {
        const total = (qtyReservedStudents * unitPriceStudent) + (qtyReservedAdults * unitPriceAdult);
        setValue("totalExpected", total);
    }, [qtyReservedStudents, qtyReservedAdults, unitPriceStudent, unitPriceAdult, setValue]);

    const onSubmit = async (data: TheaterBookingFormValues) => {
        setLoading(true);
        try {
            const result = await addTheaterBooking({
                eventSlotId: slot.id,
                schoolId: data.schoolId,
                qtyReservedStudents: data.qtyReservedStudents,
                qtyReservedAdults: data.qtyReservedAdults,
                billingPolicy: data.billingPolicy,
                unitPriceStudent: data.unitPriceStudent,
                unitPriceAdult: data.unitPriceAdult,
                totalExpected: data.totalExpected,
                attendanceStatus: AttendanceStatus.PENDING,
                notes: data.notes || "",
            }, data.isHold);

            if (result.success) {
                toast.success("Reserva creada correctamente");
                router.push(`/calendario/${slot.eventDayId}`); // Redirect to day detail
                router.refresh();
            } else {
                toast.error(result.error || "Error al crear la reserva");
            }
        } catch (error) {
            console.error("Error saving booking:", error);
            toast.error("Error inesperado al crear la reserva");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6">
                <div className="flex items-center gap-2 text-primary mb-1">
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">Información del Slot</span>
                </div>
                <p className="text-sm font-bold">{work.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {slot.startTime} - {slot.endTime}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Capacidad: {slot.totalCapacity}</span>
                    <span className={cn(
                        "font-bold",
                        availableSlots < 20 ? "text-red-600" : "text-green-600"
                    )}>
                        Disponibles: {availableSlots}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Búsqueda de Escuela</label>
                    <SchoolAutocomplete
                        onSelect={(school) => {
                            setSelectedSchool(school);
                            setValue("schoolId", school.id, { shouldValidate: true });
                        }}
                        placeholder="Escribe el nombre de la escuela..."
                    />
                    {errors.schoolId && <p className="text-xs text-red-500 font-medium">{errors.schoolId.message}</p>}

                    {selectedSchool && (
                        <div className="flex items-center gap-3 p-3 bg-card border border-slate-200 rounded-xl animate-in fade-in slide-in-from-left-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Check className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{selectedSchool.name}</p>
                                <p className="text-[10px] text-muted-foreground">{selectedSchool.district}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Alumnos Reservados</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                {...register("qtyReservedStudents", { valueAsNumber: true })}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.qtyReservedStudents ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            />
                        </div>
                        {errors.qtyReservedStudents && <p className="text-xs text-red-500 font-medium">{errors.qtyReservedStudents.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Adultos Reservados</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                {...register("qtyReservedAdults", { valueAsNumber: true })}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.qtyReservedAdults ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Precio x Alumno</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                {...register("unitPriceStudent", { valueAsNumber: true })}
                                className="w-full rounded-lg border border-slate-200 bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Precio x Adulto</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                {...register("unitPriceAdult", { valueAsNumber: true })}
                                className="w-full rounded-lg border border-slate-200 bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold italic opacity-70">Política de Facturación</label>
                    <select
                        {...register("billingPolicy")}
                        className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value={BillingPolicy.RESERVED}>Cobrar por Reservado (Default)</option>
                        <option value={BillingPolicy.ATTENDED}>Cobrar por Asistido</option>
                        <option value={BillingPolicy.CUSTOM}>Acuerdo Especial / Custom</option>
                    </select>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-inner">
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Esperado</p>
                        <p className="text-2xl font-black text-primary">${(watch("totalExpected") || 0).toLocaleString()}</p>
                    </div>
                    <Ticket className="h-8 w-8 text-slate-700" />
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Modo HOLD
                            </label>
                            <p className="text-[11px] text-muted-foreground">Bloquea el cupo sin confirmar pago.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue("isHold", !isHold)}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                isHold ? "bg-primary" : "bg-slate-200"
                            )}
                        >
                            <span
                                className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    isHold ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Notas de la Reserva</label>
                    <textarea
                        {...register("notes")}
                        className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Ej: Pendiente de seña..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="submit"
                    disabled={loading || (qtyReservedStudents > availableSlots)}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {loading ? "Procesando..." : qtyReservedStudents > availableSlots ? "Capacidad Insuficiente" : isHold ? "Crear Reserva HOLD" : "Crear Reserva Pendiente"}
                </button>
            </div>
        </form>
    );
}
