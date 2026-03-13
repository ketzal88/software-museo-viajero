"use client";

import { useState } from "react";
import { BookingStatus, TheaterBooking, TravelBooking, School, EventSlot, Work, EventDay } from "@/types";
import { updateBookingStatus, deleteBooking } from "@/lib/actions";
import {
    Clock,
    CheckCircle2,
    Theater,
    Truck,
    MessageSquare,
    Users,
    Calendar
} from "lucide-react";
import { format, differenceInHours, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { generateWhatsAppMessage, generateEmailDraft } from "@/lib/communication";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SlotDetails {
    slot: EventSlot | null;
    work: Work | null;
    eventDay: EventDay | null;
}

interface InboxItem extends Partial<TheaterBooking & TravelBooking> {
    id: string;
    type: 'theater' | 'travel';
    school: School | null;
    slotDetails: SlotDetails | null;
}

interface InboxListProps {
    items: InboxItem[];
}

export function InboxList({ items }: InboxListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAction = async (id: string, type: 'theater' | 'travel', action: 'confirm' | 'cancel') => {
        setLoadingId(id);
        try {
            if (action === 'confirm') {
                const result = await updateBookingStatus(id, type, BookingStatus.CONFIRMED);
                if (result.success) {
                    toast.success("Reserva confirmada correctamente");
                    window.location.reload();
                } else {
                    toast.error(result.error || "Error al confirmar la reserva");
                }
            } else {
                if (confirm("Estas seguro de que deseas cancelar esta reserva?")) {
                    const result = await deleteBooking(id, type);
                    if (result.success) {
                        toast.success("Reserva cancelada correctamente");
                        window.location.reload();
                    } else {
                        toast.error(result.error || "Error al cancelar la reserva");
                    }
                } else {
                    setLoadingId(null);
                    return;
                }
            }
        } catch (error) {
            console.error("Action error:", error);
            toast.error("Error inesperado al procesar la accion");
        } finally {
            setLoadingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copiado al portapapeles!");
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-display font-medium text-lg text-primary">Tu bandeja de entrada esta limpia</p>
                <p className="text-sm font-sans text-gray-500">No hay reservas pendientes que requieran tu atencion.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((item) => {
                const isHold = item.status === BookingStatus.HOLD;
                const hoursToExpire = item.expiresAt ? differenceInHours(parseISO(item.expiresAt), new Date()) : null;
                const isExpiringSoon = hoursToExpire !== null && hoursToExpire < 24;
                const isExpired = hoursToExpire !== null && hoursToExpire <= 0;

                // Determine visuals based on state
                const isUrgent = isHold && (isExpiringSoon || isExpired);

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "flex flex-col border overflow-hidden hover:border-primary/20 transition-all",
                            isUrgent ? "border-accent/30" : "border-gray-300"
                        )}
                    >
                        {/* Card Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "flex items-center justify-center text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5",
                                    item.type === 'theater'
                                        ? "bg-orange-50 text-orange-600"
                                        : "bg-blue-50 text-blue-600"
                                )}>
                                    {item.type === 'theater' ? <Theater className="h-3 w-3 mr-1" /> : <Truck className="h-3 w-3 mr-1" />}
                                    {item.type === 'theater' ? "Teatro" : "Viaje"}
                                </span>
                                {isExpired && (
                                    <span className="text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5 bg-accent text-white">VENCIDA</span>
                                )}
                                {isExpiringSoon && !isExpired && (
                                    <span className="text-[11px] font-display font-bold uppercase tracking-widest px-2 py-0.5 bg-accent text-white">VENCE HOY</span>
                                )}
                            </div>

                            {isHold && hoursToExpire !== null && !isExpired && (
                                <div className={cn(
                                    "flex items-center font-display font-bold text-sm",
                                    isUrgent ? "text-accent" : "text-gray-500"
                                )}>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {hoursToExpire < 24 ? `${hoursToExpire}h` : `${Math.floor(hoursToExpire / 24)} dias`}
                                </div>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex gap-4">
                            <div
                                className="hidden sm:block w-32 h-24 bg-center bg-cover shrink-0 bg-gray-50"
                                style={{ backgroundImage: `url('https://placehold.co/400x300/e2e8f0/94a3b8?text=${item.type === 'theater' ? 'Teatro' : 'Viaje'}')` }}
                            ></div>

                            <div className="flex flex-col grow min-w-0">
                                <h3 className="text-lg font-display font-bold text-primary truncate" title={item.slotDetails?.work?.title}>
                                    {item.slotDetails?.work?.title || "Obra sin titulo"}
                                </h3>
                                <p className="text-gray-500 text-sm font-sans font-medium mb-2 truncate">
                                    {item.school?.name || "Sin Escuela"}
                                </p>

                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-sans">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        {item.slotDetails?.eventDay?.date ? format(parseISO(item.slotDetails.eventDay.date), "dd MMM", { locale: es }) : "N/D"}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-sans">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        {item.slotDetails?.slot?.startTime || "N/D"}hs
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-sans">
                                        <Users className="h-3 w-3 text-gray-400" />
                                        {item.qtyReservedStudents}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Actions */}
                        <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                            <div className="flex gap-2">
                                <div className="relative group/mail">
                                    <button
                                        className="flex items-center justify-center h-9 w-9 border border-gray-300 text-gray-500 hover:text-primary transition-colors"
                                        title="Opciones de comunicacion"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </button>
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/mail:flex flex-col gap-1 bg-white p-2 border border-gray-300 z-10 w-40">
                                        <button
                                            onClick={() => {
                                                if (!item.school || !item.slotDetails || !item.slotDetails.work || !item.slotDetails.eventDay || !item.slotDetails.slot) {
                                                    toast.error("Datos incompletos para generar el mensaje. Verifique que la obra, el dia y el slot existan.");
                                                    return;
                                                }
                                                const msg = generateWhatsAppMessage(
                                                    item as unknown as (TheaterBooking & TravelBooking),
                                                    item.type,
                                                    item.school,
                                                    item.slotDetails.work,
                                                    item.slotDetails.eventDay,
                                                    item.slotDetails.slot
                                                );
                                                copyToClipboard(msg);
                                            }}
                                            className="flex items-center gap-2 text-xs font-sans p-2 hover:bg-gray-50 text-left text-gray-600"
                                        >
                                            <Share2 className="h-3 w-3 text-gray-400" /> WhatsApp
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!item.school || !item.slotDetails || !item.slotDetails.work || !item.slotDetails.eventDay || !item.slotDetails.slot) {
                                                    toast.error("Datos incompletos para generar el borrador. Verifique que la obra, el dia y el slot existan.");
                                                    return;
                                                }
                                                const draft = generateEmailDraft(
                                                    item as unknown as (TheaterBooking & TravelBooking),
                                                    item.type,
                                                    item.school,
                                                    item.slotDetails.work,
                                                    item.slotDetails.eventDay,
                                                    item.slotDetails.slot
                                                );
                                                copyToClipboard(`Asunto: ${draft.subject}\n\n${draft.body}`);
                                            }}
                                            className="flex items-center gap-2 text-xs font-sans p-2 hover:bg-gray-50 text-left text-gray-600"
                                        >
                                            <Copy className="h-3 w-3 text-gray-400" /> Email
                                        </button>
                                    </div>
                                </div>

                                <button
                                    disabled={loadingId === item.id}
                                    onClick={() => handleAction(item.id, item.type, 'cancel')}
                                    className="flex items-center justify-center h-9 px-4 border border-accent/30 text-accent text-sm font-display font-medium hover:bg-accent/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <button
                                disabled={loadingId === item.id}
                                onClick={() => handleAction(item.id, item.type, 'confirm')}
                                className="flex items-center justify-center h-9 px-6 bg-primary text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
