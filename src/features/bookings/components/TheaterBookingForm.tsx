"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, EventSlot, Work, TheaterBooking, BillingPolicy, AttendanceStatus } from "@/types";
import { addTheaterBooking, getEventDayById, resolvePricing } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Users, Info, Ticket, Check, ShieldCheck, Clock, DollarSign, AlertCircle } from "lucide-react";
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
    pricingRuleId: string;
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
            pricingRuleId: "",
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

    useEffect(() => {
        const total = (qtyReservedStudents * unitPriceStudent) + (qtyReservedAdults * unitPriceAdult);
        setValue("totalExpected", total);
    }, [qtyReservedStudents, qtyReservedAdults, unitPriceStudent, unitPriceAdult, setValue]);

    // Mission P3: Snapshot Prices
    useEffect(() => {
        const loadPricing = async () => {
            const day = await getEventDayById(slot.eventDayId);
            if (day) {
                const result = await resolvePricing(day.date, "THEATER_TICKET" as any, day.seasonId);
                if (result.success && result.rule) {
                    setValue("pricingRuleId", result.rule.id);
                    // Solo setear si el form está vacío o no se tocó manualmente (opcional)
                    setValue("unitPriceStudent", result.rule.values.student || 0);
                    setValue("unitPriceAdult", result.rule.values.adult || 0);
                } else {
                    toast.error(result.error || "No hay precios definidos para esta fecha");
                }
            }
        };
        loadPricing();
    }, [slot.eventDayId, setValue]);

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
                pricingRuleId: data.pricingRuleId,
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
            <div className="border border-gray-300 p-4 mb-6">
                <div className="flex items-center gap-2 text-primary mb-1">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Información del Slot</span>
                </div>
                <p className="text-sm font-display font-bold text-primary">{work.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" /> {slot.startTime} - {slot.endTime}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3 text-gray-400" /> Capacidad: {slot.totalCapacity}</span>
                    <span className={cn(
                        "font-bold",
                        availableSlots < 20 ? "text-accent" : "text-green-600"
                    )}>
                        Disponibles: {availableSlots}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Búsqueda de Escuela</label>
                    <SchoolAutocomplete
                        onSelect={(school) => {
                            setSelectedSchool(school);
                            setValue("schoolId", school.id, { shouldValidate: true });
                        }}
                        placeholder="Escribe el nombre de la escuela..."
                    />
                    {errors.schoolId && <p className="text-xs text-accent font-sans mt-1">{errors.schoolId.message}</p>}

                    {selectedSchool && (
                        <div className="flex items-center gap-3 p-3 border border-gray-300">
                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-primary">
                                <Check className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-display font-bold text-primary">{selectedSchool.name}</p>
                                <p className="text-[10px] text-gray-500">{selectedSchool.district}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Alumnos Reservados</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                {...register("qtyReservedStudents", { valueAsNumber: true })}
                                className={cn(
                                    "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                    errors.qtyReservedStudents ? "border-accent" : "border-gray-300"
                                )}
                            />
                        </div>
                        {errors.qtyReservedStudents && <p className="text-xs text-accent font-sans mt-1">{errors.qtyReservedStudents.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Adultos Reservados</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                {...register("qtyReservedAdults", { valueAsNumber: true })}
                                className={cn(
                                    "w-full border px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                    errors.qtyReservedAdults ? "border-accent" : "border-gray-300"
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-300 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Precio x Alumno</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                {...register("unitPriceStudent", { valueAsNumber: true })}
                                className="w-full border border-gray-300 px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-display font-medium text-primary">Precio x Adulto</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                {...register("unitPriceAdult", { valueAsNumber: true })}
                                className="w-full border border-gray-300 px-9 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary italic opacity-70">Política de Facturación</label>
                    <select
                        {...register("billingPolicy")}
                        className="w-full border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    >
                        <option value={BillingPolicy.RESERVED}>Cobrar por Reservado (Default)</option>
                        <option value={BillingPolicy.ATTENDED}>Cobrar por Asistido</option>
                        <option value={BillingPolicy.CUSTOM}>Acuerdo Especial / Custom</option>
                    </select>
                </div>

                <div className="bg-primary text-white p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400">Total Esperado</p>
                        <p className="text-2xl font-display font-black text-white">${(watch("totalExpected") || 0).toLocaleString()}</p>
                    </div>
                    <Ticket className="h-8 w-8 text-white/30" />
                </div>

                <div className="p-4 border border-gray-300">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-display font-bold text-primary flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Modo HOLD
                            </label>
                            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Bloquea el cupo sin confirmar pago.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue("isHold", !isHold)}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                isHold ? "bg-primary" : "bg-gray-300"
                            )}
                        >
                            <span
                                className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out",
                                    isHold ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Notas de la Reserva</label>
                    <textarea
                        {...register("notes")}
                        className="w-full min-h-[80px] border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        placeholder="Ej: Pendiente de seña..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-300">
                <button
                    type="submit"
                    disabled={loading || (qtyReservedStudents > availableSlots)}
                    className="w-full bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider disabled:opacity-50"
                >
                    {loading ? "Procesando..." : qtyReservedStudents > availableSlots ? "Capacidad Insuficiente" : isHold ? "Crear Reserva HOLD" : "Crear Reserva Pendiente"}
                </button>
            </div>
        </form>
    );
}
