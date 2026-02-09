"use client";

import { useState, useEffect } from "react";
import { School, EventSlot, Work, TravelMode } from "@/types";
import { addTravelBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Users, Ticket, Check, MapPin, Truck, Sparkles } from "lucide-react";
import { SchoolAutocomplete } from "@/features/schools/components/SchoolAutocomplete";
import { cn, TRAVEL_PRICES, recommendTravelModality } from "@/lib/utils";

interface TravelBookingFormProps {
    slot: EventSlot;
    work: Work;
}

export function TravelBookingForm({ slot, work }: TravelBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [countStudents, setCountStudents] = useState<number>(0);
    const [countTeachers, setCountTeachers] = useState<number>(0);
    const [modality, setModality] = useState<TravelMode>(TravelMode.CLASSROOM);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [notes, setNotes] = useState("");

    // Auto-recommendation and auto-pricing
    useEffect(() => {
        if (countStudents > 0) {
            const recommended = recommendTravelModality(countStudents);
            setModality(recommended);
            setTotalPrice(TRAVEL_PRICES[recommended].price);
        }
    }, [countStudents]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchool) {
            alert("Por favor selecciona una escuela.");
            return;
        }

        setLoading(true);
        try {
            const result = await addTravelBooking({
                eventSlotId: slot.id,
                schoolId: selectedSchool.id,
                modality,
                countStudents,
                countTeachers,
                totalPrice,
                notes,
            });

            if (result.success) {
                router.push("/reservas");
                router.refresh();
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error saving booking:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                    <Truck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">Función Viajera (En Escuela)</span>
                </div>
                <p className="text-sm font-bold text-amber-900">{work.title}</p>
                <p className="text-xs text-amber-700 mt-1">El museo se traslada a la institución seleccionada.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Escuela Destino</label>
                    <SchoolAutocomplete
                        onSelect={(school) => setSelectedSchool(school)}
                        placeholder="Buscar escuela..."
                    />
                    {selectedSchool && (
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm border-amber-200 animate-in fade-in slide-in-from-left-2">
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
                        <label className="text-sm font-medium">Cant. Alumnos</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                required
                                min="1"
                                value={countStudents}
                                onChange={(e) => setCountStudents(parseInt(e.target.value) || 0)}
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cant. Docentes</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                required
                                min="0"
                                value={countTeachers}
                                onChange={(e) => setCountTeachers(parseInt(e.target.value) || 0)}
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                        Modalidad Recomendada
                        {countStudents > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
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
                                        setModality(key as TravelMode);
                                        setTotalPrice(config.price);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                                        isSelected
                                            ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                                            : "border-border bg-card hover:border-amber-200"
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
                    <label className="text-sm font-medium">Precio Final Acordado</label>
                    <div className="relative">
                        <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            required
                            min="0"
                            value={totalPrice}
                            onChange={(e) => setTotalPrice(parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Notas</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="Ubicación en la escuela, requerimientos técnicos..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
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
