"use client";

import { useState } from "react";
import { TheaterBooking, TravelBooking, BillingPolicy, AttendanceStatus } from "@/types";
import { updateTheaterBookingAttendance, updateTravelBookingAttendance } from "@/lib/actions";
import { Users, Check, Save, AlertCircle, DollarSign, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceManagerProps {
    bookings: (TheaterBooking | TravelBooking)[];
    type: "theater" | "travel";
    onUpdate?: () => void;
}

export function AttendanceManager({ bookings, type, onUpdate }: AttendanceManagerProps) {
    const [saving, setSaving] = useState<string | null>(null);

    const handleUpdateTheater = async (booking: TheaterBooking, students: number, adults: number, policy: BillingPolicy) => {
        setSaving(booking.id);
        try {
            const result = await updateTheaterBookingAttendance(booking.id, { students, adults }, policy);
            if (result.success) {
                toast.success("Asistencia actualizada");
                onUpdate?.();
            } else {
                toast.error(result.error);
            }
        } finally {
            setSaving(null);
        }
    };

    const handleUpdateTravel = async (booking: TravelBooking, students: number, adults: number) => {
        setSaving(booking.id);
        try {
            const result = await updateTravelBookingAttendance(booking.id, { students, adults });
            if (result.success) {
                toast.success("Asistencia actualizada");
                onUpdate?.();
            } else {
                toast.error(result.error);
            }
        } finally {
            setSaving(null);
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                No hay reservas para este slot.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <BookingAttendanceRow
                    key={booking.id}
                    booking={booking}
                    type={type}
                    isSaving={saving === booking.id}
                    onSaveTheater={handleUpdateTheater}
                    onSaveTravel={handleUpdateTravel}
                />
            ))}
        </div>
    );
}

function BookingAttendanceRow({
    booking,
    type,
    isSaving,
    onSaveTheater,
    onSaveTravel
}: {
    booking: any;
    type: "theater" | "travel";
    isSaving: boolean;
    onSaveTheater: (b: TheaterBooking, s: number, a: number, p: BillingPolicy) => void;
    onSaveTravel: (b: TravelBooking, s: number, a: number) => void;
}) {
    const [students, setStudents] = useState(booking.qtyAttendedStudents ?? booking.qtyReservedStudents);
    const [adults, setAdults] = useState(booking.qtyAttendedAdults ?? booking.qtyReservedAdults);
    const [policy, setPolicy] = useState<BillingPolicy>(booking.billingPolicy || BillingPolicy.RESERVED);

    const isDirty = students !== (booking.qtyAttendedStudents ?? booking.qtyReservedStudents) ||
        adults !== (booking.qtyAttendedAdults ?? booking.qtyReservedAdults) ||
        (type === 'theater' && policy !== booking.billingPolicy);

    const isFinal = booking.attendanceStatus === AttendanceStatus.FINAL;

    return (
        <div className={cn(
            "p-4 border rounded-xl bg-card transition-all",
            isFinal ? "border-green-200 bg-green-50/10" : "border-slate-200"
        )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm uppercase tracking-tight">{(booking as any).school?.name || "Escuela"}</p>
                        {isFinal && (
                            <span className="flex items-center gap-1 text-[10px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded uppercase">
                                <Check className="h-2.5 w-2.5" /> Final
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> Res: {booking.qtyReservedStudents} Al. / {booking.qtyReservedAdults} Ad.
                        </span>
                        {type === 'theater' && (
                            <span className="font-medium text-primary">
                                Esperado: ${booking.totalExpected?.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground px-1">Alumnos</span>
                            <input
                                type="number"
                                value={students}
                                onChange={(e) => setStudents(parseInt(e.target.value) || 0)}
                                className="w-16 bg-transparent border-none text-sm font-bold focus:ring-0 px-1"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200" />
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground px-1">Adultos</span>
                            <input
                                type="number"
                                value={adults}
                                onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                                className="w-16 bg-transparent border-none text-sm font-bold focus:ring-0 px-1"
                            />
                        </div>
                    </div>

                    {type === 'theater' && (
                        <select
                            value={policy}
                            onChange={(e) => setPolicy(e.target.value as BillingPolicy)}
                            className="text-xs font-bold border-slate-200 rounded-lg bg-white"
                        >
                            <option value={BillingPolicy.RESERVED}>Cobrar Reservado</option>
                            <option value={BillingPolicy.ATTENDED}>Cobrar Asistido</option>
                            <option value={BillingPolicy.CUSTOM}>Custom</option>
                        </select>
                    )}

                    <button
                        onClick={() => type === 'theater' ? onSaveTheater(booking, students, adults, policy) : onSaveTravel(booking, students, adults)}
                        disabled={isSaving || !isDirty}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm",
                            isDirty
                                ? "bg-primary text-primary-foreground hover:scale-105"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? "..." : <Save className="h-3.5 w-3.5" />}
                        {isSaving ? "Guardando" : "Guardar"}
                    </button>
                </div>
            </div>

            {type === 'theater' && booking.totalFinal !== undefined && (
                <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>Monto final calculado según política</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-black text-green-700 bg-green-100 px-2 py-1 rounded">
                        <DollarSign className="h-3 w-3" />
                        {booking.totalFinal.toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}

