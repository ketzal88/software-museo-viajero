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
                if (confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
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
            toast.error("Error inesperado al procesar la acción");
        } finally {
            setLoadingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("¡Copiado al portapapeles!");
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl text-muted-foreground bg-card">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium text-lg">Tu bandeja de entrada está limpia</p>
                <p className="text-sm">No hay reservas pendientes que requieran tu atención.</p>
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
                            "flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow",
                            isUrgent ? "border-red-200 dark:border-red-900/30" : "border-gray-100 dark:border-gray-700"
                        )}
                    >
                        {/* Card Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "flex items-center justify-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                    item.type === 'theater'
                                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                )}>
                                    {item.type === 'theater' ? <Theater className="h-3 w-3 mr-1" /> : <Truck className="h-3 w-3 mr-1" />}
                                    {item.type === 'theater' ? "Teatro" : "Viaje"}
                                </span>
                                {isExpired && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">VENCIDA</span>
                                )}
                                {isExpiringSoon && !isExpired && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">VENCE HOY</span>
                                )}
                            </div>

                            {isHold && hoursToExpire !== null && !isExpired && (
                                <div className={cn(
                                    "flex items-center font-bold text-sm",
                                    isUrgent ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                                )}>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {/* Simple format for hours: assuming < 24h shows hours, otherwise days could be better but sticking to simple for now based on design */}
                                    {hoursToExpire < 24 ? `${hoursToExpire}h` : `${Math.floor(hoursToExpire / 24)} días`}
                                </div>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex gap-4">
                            {/* Placeholder Image - Design has images, we'll use a generic colored box or placeholder pattern if no image */}
                            <div
                                className="hidden sm:block w-32 h-24 bg-center bg-cover rounded-lg shrink-0 bg-muted"
                                style={{ backgroundImage: `url('https://placehold.co/400x300/e2e8f0/94a3b8?text=${item.type === 'theater' ? 'Teatro' : 'Viaje'}')` }}
                            ></div>

                            <div className="flex flex-col grow min-w-0">
                                <h3 className="text-lg font-bold truncate" title={item.slotDetails?.work?.title}>
                                    {item.slotDetails?.work?.title || "Obra sin título"}
                                </h3>
                                <p className="text-muted-foreground text-sm font-medium mb-2 truncate">
                                    {item.school?.name || "Sin Escuela"}
                                </p>

                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Calendar className="h-3 w-3" />
                                        {item.slotDetails?.eventDay?.date ? format(parseISO(item.slotDetails.eventDay.date), "dd MMM", { locale: es }) : "N/D"}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Clock className="h-3 w-3" />
                                        {item.slotDetails?.slot?.startTime || "N/D"}hs
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Users className="h-3 w-3" />
                                        {item.countStudents}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Actions */}
                        <div className="p-4 bg-muted/30 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                            <div className="flex gap-2">
                                <div className="relative group/mail">
                                    <button
                                        className="flex items-center justify-center h-9 w-9 rounded-lg bg-background border hover:text-primary transition-colors"
                                        title="Opciones de comunicación"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </button>
                                    {/* Hidden Tooltip/Menu for copy - Simplified for now, just copy WhatsApp on click or modify this later */}
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/mail:flex flex-col gap-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border z-10 w-40">
                                        <button
                                            onClick={() => {
                                                if (!item.school || !item.slotDetails || !item.slotDetails.work || !item.slotDetails.eventDay || !item.slotDetails.slot) {
                                                    toast.error("Datos incompletos para generar el mensaje. Verifique que la obra, el día y el slot existan.");
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
                                            className="flex items-center gap-2 text-xs p-2 hover:bg-muted rounded text-left"
                                        >
                                            <Share2 className="h-3 w-3" /> WhatsApp
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!item.school || !item.slotDetails || !item.slotDetails.work || !item.slotDetails.eventDay || !item.slotDetails.slot) {
                                                    toast.error("Datos incompletos para generar el borrador. Verifique que la obra, el día y el slot existan.");
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
                                            className="flex items-center gap-2 text-xs p-2 hover:bg-muted rounded text-left"
                                        >
                                            <Copy className="h-3 w-3" /> Email
                                        </button>
                                    </div>
                                </div>

                                <button
                                    disabled={loadingId === item.id}
                                    onClick={() => handleAction(item.id, item.type, 'cancel')}
                                    className="flex items-center justify-center h-9 px-4 rounded-lg bg-background border text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <button
                                disabled={loadingId === item.id}
                                onClick={() => handleAction(item.id, item.type, 'confirm')}
                                className="flex items-center justify-center h-9 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:opacity-90 transition-all"
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
