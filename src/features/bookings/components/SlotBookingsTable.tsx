"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { TheaterBooking, TravelBooking, School, GRADE_LEVELS, BookingStatus } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import { EditBookingModal } from "./EditBookingModal";
import { updateBookingStatus, deleteBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPortal } from "react-dom";

type EnrichedTheaterBooking = TheaterBooking & { school?: School | null };
type EnrichedTravelBooking = TravelBooking & { school?: School | null };

interface SlotBookingsTableProps {
    theaterBookings: EnrichedTheaterBooking[];
    travelBookings: EnrichedTravelBooking[];
}

function getGradeLabel(value?: string) {
    if (!value) return "—";
    return GRADE_LEVELS.find(g => g.value === value)?.label || value;
}

const STATUS_STYLES: Record<string, string> = {
    hold: "bg-yellow-50 text-yellow-700 border border-yellow-300",
    pending: "bg-orange-50 text-orange-700 border border-orange-300",
    confirmed: "bg-green-50 text-green-700 border border-green-300",
    completed: "bg-blue-50 text-blue-700 border border-blue-300",
    cancelled: "bg-gray-100 text-gray-400 border border-gray-200",
};

const STATUS_OPTIONS = [
    { value: BookingStatus.HOLD, label: "Hold", color: "bg-yellow-400" },
    { value: BookingStatus.PENDING, label: "Pendiente", color: "bg-orange-400" },
    { value: BookingStatus.CONFIRMED, label: "Confirmada", color: "bg-green-500" },
    { value: BookingStatus.COMPLETED, label: "Completada", color: "bg-blue-500" },
    { value: BookingStatus.CANCELLED, label: "Cancelada", color: "bg-gray-400" },
];

function InlineStatusSelect({
    bookingId,
    type,
    currentStatus,
}: {
    bookingId: string;
    type: "theater" | "travel";
    currentStatus: BookingStatus;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 140 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const openDropdown = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width, 140),
            });
        }
        setOpen(true);
    };

    const handleChange = (newStatus: BookingStatus) => {
        if (newStatus === currentStatus) { setOpen(false); return; }
        setOpen(false);
        startTransition(async () => {
            const result = await updateBookingStatus(bookingId, type, newStatus);
            if (result.success) {
                toast.success("Estado actualizado");
                router.refresh();
            } else {
                toast.error("Error al actualizar estado");
            }
        });
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                disabled={isPending}
                onClick={openDropdown}
                className={`text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 whitespace-nowrap ${STATUS_STYLES[currentStatus] || "bg-gray-100 text-gray-600"}`}
                title="Click para cambiar estado"
            >
                {isPending ? "..." : currentStatus}
            </button>

            {open && typeof window !== "undefined" && createPortal(
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="absolute z-50 bg-white border border-gray-300 shadow-lg"
                        style={{ top: dropdownPos.top, left: dropdownPos.left, minWidth: dropdownPos.width }}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleChange(opt.value)}
                                className={`w-full text-left px-3 py-2 text-[11px] font-display font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors flex items-center gap-2 ${opt.value === currentStatus ? "opacity-40" : ""}`}
                            >
                                <span className={`inline-block w-2 h-2 shrink-0 ${opt.color}`} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </>
    );
}

function DeleteBookingButton({ bookingId, type }: { bookingId: string; type: "theater" | "travel" }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [confirm, setConfirm] = useState(false);

    const handleDelete = () => {
        if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return; }
        startTransition(async () => {
            const result = await deleteBooking(bookingId, type);
            if (result.success) {
                toast.success("Reserva eliminada");
                router.refresh();
            } else {
                toast.error(result.error || "Error al eliminar");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`p-1 transition-colors disabled:opacity-50 ${confirm ? "text-accent" : "text-gray-300 hover:text-gray-500"}`}
            title={confirm ? "Hacer click de nuevo para confirmar" : "Eliminar reserva"}
        >
            <Trash2 className="h-3.5 w-3.5" />
        </button>
    );
}

export function SlotBookingsTable({ theaterBookings, travelBookings }: SlotBookingsTableProps) {
    const [editingBooking, setEditingBooking] = useState<EnrichedTheaterBooking | null>(null);

    const hasBookings = theaterBookings.length > 0 || travelBookings.length > 0;
    if (!hasBookings) return null;

    return (
        <>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="text-left text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">Escuela</th>
                            <th className="text-left text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">Contacto</th>
                            <th className="text-left text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">Tel/Cel</th>
                            <th className="text-right text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">Cant</th>
                            <th className="text-right text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">Inv</th>
                            <th className="text-left text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">Nivel</th>
                            <th className="text-right text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-3">$</th>
                            <th className="text-center text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 py-2 pr-2">Estado</th>
                            <th className="print:hidden w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {theaterBookings.map((b) => (
                            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-2 pr-3 font-sans text-gray-800 max-w-[180px] truncate" title={b.schoolName || b.school?.name}>
                                    {b.schoolName || b.school?.name || "—"}
                                </td>
                                <td className="py-2 pr-3 font-sans text-gray-600 max-w-[120px] truncate" title={b.contactName || b.school?.contactName}>
                                    {b.contactName || b.school?.contactName || "—"}
                                </td>
                                <td className="py-2 pr-3 font-sans text-gray-600 whitespace-nowrap">
                                    {b.contactPhone || b.school?.phone || "—"}
                                </td>
                                <td className="py-2 pr-3 text-right font-display font-bold text-primary tabular-nums">
                                    {b.qtyReservedStudents}
                                </td>
                                <td className="py-2 pr-3 text-right font-sans text-gray-600 tabular-nums">
                                    {b.qtyReservedAdults || 0}
                                </td>
                                <td className="py-2 pr-3 font-sans text-gray-600 whitespace-nowrap">
                                    {getGradeLabel(b.gradeLevel)}
                                </td>
                                <td className="py-2 pr-3 text-right font-display font-bold text-primary whitespace-nowrap tabular-nums">
                                    ${b.totalExpected.toLocaleString()}
                                </td>
                                <td className="py-2 pr-2 text-center">
                                    <span className="hidden print:inline text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 border border-gray-300 text-gray-600">{b.status}</span>
                                    <span className="print:hidden"><InlineStatusSelect bookingId={b.id} type="theater" currentStatus={b.status} /></span>
                                </td>
                                <td className="print:hidden py-2 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                        <button
                                            onClick={() => setEditingBooking(b)}
                                            className="p-1 text-gray-300 hover:text-primary transition-colors"
                                            title="Editar reserva"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <DeleteBookingButton bookingId={b.id} type="theater" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {travelBookings.map((b) => (
                            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-2 pr-3 font-sans text-gray-800 max-w-[180px] truncate" title={b.schoolName || b.school?.name}>
                                    {b.schoolName || b.school?.name || "—"}
                                </td>
                                <td className="py-2 pr-3 font-sans text-gray-600 max-w-[120px] truncate">
                                    {b.contactName || b.school?.contactName || "—"}
                                </td>
                                <td className="py-2 pr-3 font-sans text-gray-600 whitespace-nowrap">
                                    {b.contactPhone || b.school?.phone || "—"}
                                </td>
                                <td className="py-2 pr-3 text-right font-display font-bold text-primary tabular-nums">
                                    {b.qtyReservedStudents}
                                </td>
                                <td className="py-2 pr-3 text-right font-sans text-gray-600 tabular-nums">
                                    {b.qtyReservedAdults || 0}
                                </td>
                                <td className="py-2 pr-3 font-sans text-gray-600 whitespace-nowrap">
                                    {getGradeLabel(b.gradeLevel)}
                                </td>
                                <td className="py-2 pr-3 text-right font-display font-bold text-primary whitespace-nowrap tabular-nums">
                                    ${b.totalPrice.toLocaleString()}
                                </td>
                                <td className="py-2 pr-2 text-center">
                                    <span className="hidden print:inline text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 border border-gray-300 text-gray-600">{b.status}</span>
                                    <span className="print:hidden"><InlineStatusSelect bookingId={b.id} type="travel" currentStatus={b.status} /></span>
                                </td>
                                <td className="print:hidden py-2 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                        <span className="text-[10px] text-gray-400 mr-1">viaje</span>
                                        <DeleteBookingButton bookingId={b.id} type="travel" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                />
            )}
        </>
    );
}
