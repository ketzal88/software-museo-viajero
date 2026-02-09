import { TheaterBooking, TravelBooking, School, Work, EventDay, EventSlot, EventType } from "@/types";
import { TRAVEL_PRICES } from "./utils";

export function generateWhatsAppMessage(
    booking: TheaterBooking | TravelBooking,
    type: 'theater' | 'travel',
    school: School,
    work: Work,
    eventDay: EventDay,
    slot: EventSlot
) {
    const isTheater = type === 'theater';
    const dateStr = eventDay.date;
    const timeStr = slot.startTime;

    let message = `¡Hola! 👋 Te escribo desde el *Museo Viajero*.\n\n`;
    message += `Estamos procesando la reserva para la escuela *${school.name}*.\n\n`;
    message += `📅 *Fecha:* ${dateStr}\n`;
    message += `⏰ *Horario:* ${timeStr}hs\n`;
    message += `🎭 *Obra:* ${work.title}\n`;

    if (isTheater) {
        message += `📍 *Ubicación:* Teatro (Función en sede)\n`;
        message += `👥 *Alumnos:* ${booking.countStudents}\n`;
    } else {
        const b = booking as TravelBooking;
        const modality = TRAVEL_PRICES[b.modality]?.label || b.modality;
        message += `📍 *Ubicación:* En la Escuela (Función Viajera)\n`;
        message += `📦 *Modalidad:* ${modality}\n`;
        message += `👥 *Alumnos:* ${booking.countStudents}\n`;
    }

    message += `\n💰 *Total:* $${booking.totalPrice.toLocaleString('es-AR')}\n\n`;

    if (booking.status === 'hold') {
        message += `⚠️ Recordá que esta reserva está en *HOLD* (temporal). Para confirmarla definitivamente, necesitamos el comprobante de pago/seña.\n\n`;
    }

    message += `¿Deseas que avancemos con la confirmación?`;

    return message;
}

export function generateEmailDraft(
    booking: TheaterBooking | TravelBooking,
    type: 'theater' | 'travel',
    school: School,
    work: Work,
    eventDay: EventDay,
    slot: EventSlot
) {
    const isTheater = type === 'theater';
    const dateStr = eventDay.date;

    const subject = `Reserva Museo Viajero - ${school.name} - ${dateStr}`;

    let body = `Estimado/a ${school.contactName || 'responsable'},\n\n`;
    body += `Le escribimos del Museo Viajero para enviarle el detalle de su reserva:\n\n`;
    body += `Institución: ${school.name}\n`;
    body += `Fecha: ${dateStr}\n`;
    body += `Horario: ${slot.startTime}hs\n`;
    body += `Obra: ${work.title}\n`;

    if (isTheater) {
        body += `Lugar: Función en Sede (Teatro)\n`;
    } else {
        body += `Lugar: Función en la Escuela (Museo Viajero)\n`;
    }

    body += `Cantidad de alumnos: ${booking.countStudents}\n`;
    body += `Costo total: $${booking.totalPrice.toLocaleString('es-AR')}\n\n`;

    if (booking.status === 'hold') {
        body += `IMPORTANTE: Su reserva se encuentra actualmente en estado TEMPORAL (HOLD). La misma tiene una duración de 72hs hábiles. Para confirmar la misma, por favor envíenos el comprobante de la seña correspondiente.\n\n`;
    }

    body += `Quedamos a su disposición para cualquier consulta.\n\n`;
    body += `Saludos cordiales,\nEquipo del Museo Viajero`;

    return { subject, body };
}
