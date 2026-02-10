"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, EventSlot, Work, TravelMode } from "@/types";
import { addTravelBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Users, Ticket, Check, MapPin, Truck, Sparkles } from "lucide-react";
import { SchoolAutocomplete } from "@/features/schools/components/SchoolAutocomplete";
import { cn, TRAVEL_PRICES, recommendTravelModality } from "@/lib/utils";
import { travelBookingSchema } from "@/lib/validations";
import * as z from "zod";
import { toast } from "sonner";

interface TravelBookingFormValues {
    schoolId: string;
    modality: string;
    countStudents: number;
    countTeachers: number;
    totalPrice: number;
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
            countStudents: 0,
            countTeachers: 0,
            totalPrice: 0,
            notes: "",
        },
    });

    const countStudents = watch("countStudents");
    const modality = watch("modality");
    const totalPrice = watch("totalPrice");

    // Auto-recommendation and auto-pricing
    useEffect(() => {
        if (countStudents > 0) {
            const recommended = recommendTravelModality(countStudents);
            setValue("modality", recommended, { shouldValidate: true });
            setValue("totalPrice", TRAVEL_PRICES[recommended].price, { shouldValidate: true });
        }
    }, [countStudents, setValue]);

    const onSubmit = async (data: TravelBookingFormValues) => {
        setLoading(true);
        try {
            const result = await addTravelBooking({
                eventSlotId: slot.id,
                schoolId: data.schoolId,
                modality: data.modality as TravelMode,
                countStudents: data.countStudents,
                countTeachers: data.countTeachers,
                totalPrice: data.totalPrice,
                notes: data.notes || "",
            });

            if (result.success) {
                toast.success("Reserva viajera creada correctamente");
                router.push("/reservas");
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
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6 font-medium">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                    <Truck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">Función Viajera (En Escuela)</span>
                </div>
                <p className="text-sm font-bold text-amber-900">{work.title}</p>
                <p className="text-xs text-amber-700 mt-1">El museo se traslada a la institución seleccionada.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Escuela Destino</label>
                    <SchoolAutocomplete
                        onSelect={(school) => {
                            setSelectedSchool(school);
                            setValue("schoolId", school.id, { shouldValidate: true });
                        }}
                        placeholder="Buscar escuela..."
                    />
                    {errors.schoolId && <p className="text-xs text-red-500 font-medium">{errors.schoolId.message}</p>}

                    {selectedSchool && (
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm border-amber-200 animate-in fade-in slide-in-from-left-2 transition-all">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <Check className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{selectedSchool.name}</p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-2 w-2" /> {selectedSchool.address}, {selectedSchool.district}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Cant. Alumnos</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                {...register("countStudents", { valueAsNumber: true })}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all ${errors.countStudents ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            />
                        </div>
                        {errors.countStudents && <p className="text-xs text-red-500 font-medium">{errors.countStudents.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Cant. Docentes</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                {...register("countTeachers", { valueAsNumber: true })}
                                className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all ${errors.countTeachers ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                        Modalidad Recomendada
                        {countStudents > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase transition-all">
                                <Sparkles className="h-2 w-2" /> Sugerido
                            </span>
                        )}
                    </label>
                    <div className="grid gap-3">
                        {Object.entries(TRAVEL_PRICES).map(([key, config]) => {
                            const isSelected = modality === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setValue("modality", key, { shouldValidate: true });
                                        setValue("totalPrice", config.price, { shouldValidate: true });
                                    }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border text-left transition-all hover:shadow-md active:scale-[0.98]",
                                        isSelected
                                            ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500 shadow-sm"
                                            : "border-slate-200 bg-card hover:border-amber-200"
                                    )}
                                >
                                    <div>
                                        <p className={cn("text-sm font-bold", isSelected ? "text-amber-900" : "text-foreground")}>
                                            {config.label}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Rango: {config.min}-{config.max} alumnos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-bold", isSelected ? "text-amber-700" : "text-muted-foreground")}>
                                            ${config.price.toLocaleString('es-AR')}
                                        </p>
                                        {isSelected && <Check className="h-4 w-4 text-amber-600 ml-auto mt-1" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Precio Final Acordado</label>
                    <div className="relative">
                        <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            {...register("totalPrice", { valueAsNumber: true })}
                            className={`w-full rounded-lg border bg-background px-9 py-2.5 text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none transition-all ${errors.totalPrice ? 'border-red-500 ring-red-100' : 'border-slate-200'}`}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Notas</label>
                    <textarea
                        {...register("notes")}
                        className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Ubicación en la escuela, requerimientos técnicos..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="submit"
                    disabled={loading || !selectedSchool}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 text-sm font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2"
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
