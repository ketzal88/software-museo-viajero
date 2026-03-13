"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, EventSlot, Work, TravelMode, AttendanceStatus } from "@/types";
import { getEventDayById, addTravelBooking, resolvePricing } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Users, Ticket, Check, MapPin, Truck, Sparkles, DollarSign } from "lucide-react";
import { SchoolAutocomplete } from "@/features/schools/components/SchoolAutocomplete";
import { cn, recommendTravelModality } from "@/lib/utils";
import { travelBookingSchema } from "@/lib/validations";
import { toast } from "sonner";
import { ShiftType } from "@/types";

interface TravelBookingFormValues {
    schoolId: string;
    modality: string;
    qtyReservedStudents: number;
    qtyReservedAdults: number;
    totalPrice: number;
    pricingRuleId: string;
    notes?: string;
}

interface TravelBookingFormProps {
    slot: EventSlot;
    work: Work;
}

export function TravelBookingForm({ slot, work }: TravelBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TravelBookingFormValues>({
        resolver: zodResolver(travelBookingSchema),
        defaultValues: {
            schoolId: "",
            modality: TravelMode.CLASSROOM,
            qtyReservedStudents: 0,
            qtyReservedAdults: 0,
            totalPrice: 0,
            pricingRuleId: "",
            notes: "",
        },
    });

    const qtyReservedStudents = watch("qtyReservedStudents");
    const modality = watch("modality");

    const pricingRuleId = watch("pricingRuleId");

    // Mission P3: Snapshot Prices
    const [prices, setPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        const loadPricing = async () => {
            const day = await getEventDayById(slot.eventDayId);
            if (day) {
                const result = await resolvePricing(day.date, "TRAVEL_FORMAT" as any, day.seasonId);
                if (result.success && result.rule) {
                    setValue("pricingRuleId", result.rule.id);
                    setPrices(result.rule.values as Record<string, number>);
                } else {
                    toast.error(result.error || "No hay precios viajeros definidos para esta fecha");
                }
            }
        };
        loadPricing();
    }, [slot.eventDayId, setValue]);

    // Auto-recommendation and pricing update
    useEffect(() => {
        if (qtyReservedStudents > 0) {
            // Note: recommendTravelModality returns key like "CLASSROOM" but prices are keyed by ShiftType
            // We need a mapping or update recommendTravelModality.
            // For now, let's assume the user picks the modality from the UI which maps to ShiftType
        }
    }, [qtyReservedStudents, setValue]);

    const onSubmit = async (data: TravelBookingFormValues) => {
        setLoading(true);
        try {
            const result = await addTravelBooking({
                eventSlotId: slot.id,
                schoolId: data.schoolId,
                modality: data.modality as TravelMode,
                qtyReservedStudents: data.qtyReservedStudents,
                qtyReservedAdults: data.qtyReservedAdults,
                totalPrice: data.totalPrice,
                pricingRuleId: data.pricingRuleId,
                notes: data.notes || "",
                attendanceStatus: AttendanceStatus.PENDING,
            });

            if (result.success) {
                toast.success("Reserva viajera creada correctamente");
                router.push(`/calendario/${slot.eventDayId}`);
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
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Función Viajera (En Escuela)</span>
                </div>
                <p className="text-sm font-display font-bold text-primary">{work.title}</p>
                <p className="text-xs text-gray-500 mt-1">El museo se traslada a la institución seleccionada.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Escuela Destino</label>
                    <SchoolAutocomplete
                        onSelect={(school) => {
                            setSelectedSchool(school);
                            setValue("schoolId", school.id, { shouldValidate: true });
                        }}
                        placeholder="Buscar escuela..."
                    />
                    {errors.schoolId && <p className="text-xs text-accent font-sans mt-1">{errors.schoolId.message}</p>}

                    {selectedSchool && (
                        <div className="flex items-center gap-3 p-3 border border-gray-300">
                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-primary">
                                <Check className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-display font-bold text-primary">{selectedSchool.name}</p>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-2 w-2 text-gray-400" /> {selectedSchool.address}, {selectedSchool.district}
                                </p>
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

                <div className="space-y-3">
                    <label className="text-sm font-display font-medium text-primary flex items-center gap-2">
                        Modalidad y Precio (Según Vigencia)
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                        {Object.values(ShiftType).map((shift) => {
                            const isSelected = modality === shift;
                            const price = prices[shift] || 0;
                            return (
                                <button
                                    key={shift}
                                    type="button"
                                    onClick={() => {
                                        setValue("modality", shift, { shouldValidate: true });
                                        setValue("totalPrice", price, { shouldValidate: true });
                                    }}
                                    className={cn(
                                        "flex items-center justify-between p-4 border text-left transition-all",
                                        isSelected
                                            ? "border-primary bg-gray-50"
                                            : "border-gray-300 hover:border-primary/20"
                                    )}
                                >
                                    <div>
                                        <p className={cn("text-sm font-display font-bold capitalize", isSelected ? "text-primary" : "text-gray-600")}>
                                            {shift.replace(/_/g, " ").toLowerCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-display font-bold", isSelected ? "text-primary" : "text-gray-500")}>
                                            ${price.toLocaleString('es-AR')}
                                        </p>
                                        {isSelected && <Check className="h-4 w-4 text-primary ml-auto mt-1" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Precio Final Acordado</label>
                    <div className="relative">
                        <Ticket className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="number"
                            {...register("totalPrice", { valueAsNumber: true })}
                            className={cn(
                                "w-full border px-9 py-3 text-sm font-sans font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
                                errors.totalPrice ? "border-accent" : "border-gray-300"
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-display font-medium text-primary">Notas</label>
                    <textarea
                        {...register("notes")}
                        className="w-full min-h-[80px] border border-gray-300 px-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        placeholder="Ubicación en la escuela, requerimientos técnicos..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-300">
                <button
                    type="submit"
                    disabled={loading || !selectedSchool}
                    className="w-full bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? "Reservando..." : (
                        <>
                            <Truck className="h-4 w-4" /> Confirmar Reserva Viajera
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
