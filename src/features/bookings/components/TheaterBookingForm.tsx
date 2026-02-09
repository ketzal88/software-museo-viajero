"use client";

import { useState } from "react";
import { School, EventSlot, Work, BookingStatus } from "@/types";
import { addTheaterBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Users, Info, Ticket, Check, ShieldCheck, Clock } from "lucide-react";
import { SchoolAutocomplete } from "@/features/schools/components/SchoolAutocomplete";
import { cn } from "@/lib/utils";

interface TheaterBookingFormProps {
    slot: EventSlot;
    work: Work;
}

export function TheaterBookingForm({ slot, work }: TheaterBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [countStudents, setCountStudents] = useState<number>(0);
    const [countTeachers, setCountTeachers] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [isHold, setIsHold] = useState(true);
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchool) {
            alert("Por favor selecciona una escuela.");
            return;
        }
        if (countStudents <= 0) {
            alert("La cantidad de alumnos debe ser mayor a 0.");
            return;
        }

        setLoading(true);
        try {
            const result = await addTheaterBooking({
                eventSlotId: slot.id,
                schoolId: selectedSchool.id,
                countStudents,
                countTeachers,
                totalPrice,
                notes,
            }, isHold);

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

    const availableSlots = slot.availableCapacity;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="text-sm font-medium">Búsqueda de Escuela</label>
                    <SchoolAutocomplete
                        onSelect={(school) => setSelectedSchool(school)}
                        placeholder="Escribe el nombre de la escuela..."
                    />
                    {selectedSchool && (
                        <div className="flex items-center gap-3 p-3 bg-card border rounded-lg animate-in fade-in slide-in-from-left-2">
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
                        <label className="text-sm font-medium">Cant. Alumnos</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                required
                                min="1"
                                value={countStudents}
                                onChange={(e) => setCountStudents(parseInt(e.target.value) || 0)}
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
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
                                className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Precio Total (Acordado)</label>
                    <div className="relative">
                        <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            required
                            min="0"
                            value={totalPrice}
                            onChange={(e) => setTotalPrice(parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Modo HOLD
                            </label>
                            <p className="text-[11px] text-muted-foreground">Bloquea el cupo sin confirmar pago.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsHold(!isHold)}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                isHold ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <span
                                className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                                    isHold ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Notas de la Reserva</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ej: Pendiente de seña..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="submit"
                    disabled={loading || (countStudents > availableSlots)}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {loading ? "Procesando..." : countStudents > availableSlots ? "Capacidad Insuficiente" : isHold ? "Crear Reserva HOLD" : "Crear Reserva Pendiente"}
                </button>
            </div>
        </form>
    );
}
