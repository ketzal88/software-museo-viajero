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
            <div className="text-center py-8 text-gray-500 font-sans border-2 border-dashed border-gray-300">
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
            "p-4 border transition-all",
            isFinal ? "border-green-300 bg-green-50/10" : "border-gray-300"
        )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-bold text-sm text-primary uppercase tracking-wider">{(booking as any).school?.name || "Escuela"}</p>
                        {isFinal && (
                            <span className="flex items-center gap-1 text-[11px] font-display font-bold uppercase tracking-widest bg-green-600 text-white px-2 py-0.5">
                                <Check className="h-2.5 w-2.5" /> Final
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-sans">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" /> Res: {booking.qtyReservedStudents} Al. / {booking.qtyReservedAdults} Ad.
                        </span>
                        {type === 'theater' && (
                            <span className="font-display font-medium text-primary">
                                Esperado: ${booking.totalExpected?.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 border border-gray-300">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 px-1">Alumnos</span>
                            <input
                                type="number"
                                value={students}
                                onChange={(e) => setStudents(parseInt(e.target.value) || 0)}
                                className="w-16 bg-transparent border-none text-sm font-sans font-bold focus:ring-0 px-1"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-gray-300" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500 px-1">Adultos</span>
                            <input
                                type="number"
                                value={adults}
                                onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                                className="w-16 bg-transparent border-none text-sm font-sans font-bold focus:ring-0 px-1"
                            />
                        </div>
                    </div>

                    {type === 'theater' && (
                        <select
                            value={policy}
                            onChange={(e) => setPolicy(e.target.value as BillingPolicy)}
                            className="text-xs font-display font-bold border border-gray-300 bg-white px-2 py-2"
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
                            "flex items-center gap-2 px-4 py-2 text-xs font-display font-bold transition-all",
                            isDirty
                                ? "bg-primary text-white hover:bg-black"
                                : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-300"
                        )}
                    >
                        {isSaving ? "..." : <Save className="h-3.5 w-3.5" />}
                        {isSaving ? "Guardando" : "Guardar"}
                    </button>
                </div>
            </div>

            {type === 'theater' && booking.totalFinal !== undefined && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-300 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-gray-500 font-sans">
                        <AlertCircle className="h-3 w-3 text-gray-400" />
                        <span>Monto final calculado segun politica</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-display font-bold text-green-700 bg-green-50 px-2 py-1 border border-green-200">
                        <DollarSign className="h-3 w-3" />
                        {booking.totalFinal.toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}
