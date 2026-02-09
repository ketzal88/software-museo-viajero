import { getEventDaysByDate, getSlotsByEventDay, getVenueById, getWorkById, getTheaterBookingsBySlot, getTravelBookingsBySlot } from "@/lib/actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EventType, BookingStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Theater, MapPin, Printer } from "lucide-react";

interface PrintPageProps {
    params: {
        date: string;
    };
}

export default async function PrintPage({ params }: PrintPageProps) {
    const eventDays = await getEventDaysByDate(params.date);

    // Sort events to put travels first (ordered by time naturally if slot times differ) or theater first? 
    // Usually logistics happen first. Let's keep them mixed by time if possible, or grouped by type.
    // The user mentioned "tomorrow we have one travel, another travel, and one theater".

    const eventsWithDetails = await Promise.all(eventDays.map(async (event) => {
        const [slots, venue] = await Promise.all([
            getSlotsByEventDay(event.id),
            event.type === EventType.THEATER ? getVenueById(event.locationId) : null
        ]);

        const slotsWithBookings = await Promise.all(slots.map(async (slot) => {
            const work = await getWorkById(slot.workId);
            let bookings: any[] = [];

            if (event.type === EventType.THEATER) {
                bookings = await getTheaterBookingsBySlot(slot.id);
            } else {
                bookings = await getTravelBookingsBySlot(slot.id);
            }

            return { ...slot, work, bookings };
        }));

        // Filter out empty slots for the report? Maybe Keep them to show availability.
        // For report, better show only what has activity.
        const activeSlots = slotsWithBookings.filter(s => s.bookings.length > 0);

        return { ...event, slots: activeSlots, venue };
    }));

    // Filter events with no bookings
    const activeEvents = eventsWithDetails.filter(e => e.slots.length > 0);
    const dateFormatted = format(new Date(params.date + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es });

    return (
        <div className="bg-white text-black p-8 max-w-4xl mx-auto print:p-0 print:max-w-none min-h-screen">
            <style type="text/css" media="print">
                {`
                @page { size: A4; margin: 20mm; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none !important; }
                `}
            </style>

            <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">Orden del Día - Museo Viajero</h1>
                    <p className="text-xl capitalize mt-1">{dateFormatted}</p>
                </div>
                <button
                    className="no-print flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800"
                // onClick="window.print()" - Can't use onClick in server component, add client wrapper or script
                >
                    <Printer className="h-4 w-4" />
                    <span className="text-sm">Imprimir (Ctrl+P)</span>
                </button>
            </div>

            {activeEvents.length === 0 ? (
                <p className="text-center text-gray-500 italic py-12">No hay actividades confirmadas para este día.</p>
            ) : (
                <div className="space-y-12">
                    {/* TRAVELING SHOWS FIRST */}
                    {activeEvents.filter(e => e.type === EventType.TRAVEL).map((event) => (
                        <div key={event.id} className="break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-300 pb-2">
                                <MapPin className="h-5 w-5" />
                                <h2 className="text-lg font-bold uppercase">Funciones Viajeras (En Escuelas)</h2>
                            </div>

                            <div className="space-y-6">
                                {event.slots.map((slot) => (
                                    <div key={slot.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 print:border-gray-300 print:bg-transparent">
                                        <div className="flex justify-between font-bold mb-2 text-sm text-gray-600 uppercase">
                                            <span>{slot.startTime}hs - {slot.work?.title}</span>
                                        </div>

                                        {slot.bookings.map((booking: any) => (
                                            <div key={booking.id} className="grid grid-cols-[1fr_200px] gap-4">
                                                <div>
                                                    <p className="font-bold text-xl">{booking.school?.name}</p>
                                                    <p className="text-sm">{booking.school?.address}, {booking.school?.district}</p>

                                                    <div className="mt-3 text-sm space-y-1">
                                                        <p><span className="font-bold">Contacto:</span> {booking.school?.contactName} ({booking.school?.phone})</p>
                                                        {booking.notes && (
                                                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-xs italic print:bg-transparent print:border-black print:border-dashed">
                                                                <span className="font-bold not-italic block mb-1">Notas / Instrucciones:</span>
                                                                {booking.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1 text-sm border-l pl-4">
                                                    <p><span className="font-bold">Alumnos:</span> {booking.countStudents}</p>
                                                    <p><span className="font-bold">Docentes:</span> {booking.countTeachers}</p>
                                                    <p className="pt-2 font-bold text-base">Total Pax: {booking.countStudents + booking.countTeachers}</p>
                                                    <div className={cn(
                                                        "mt-2 inline-block px-2 py-0.5 text-[10px] font-bold border rounded uppercase",
                                                        booking.status === BookingStatus.CONFIRMED ? "border-black text-black" : "border-gray-400 text-gray-500"
                                                    )}>
                                                        {booking.status === BookingStatus.HOLD ? "EN ESPERA (HOLD)" : booking.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* THEATER SHOWS */}
                    {activeEvents.filter(e => e.type === EventType.THEATER).map((event) => (
                        <div key={event.id} className="break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-300 pb-2">
                                <Theater className="h-5 w-5" />
                                <h2 className="text-lg font-bold uppercase">Función en Sede: {event.venue?.name}</h2>
                                <span className="text-sm text-gray-500 ml-auto">{event.venue?.address}</span>
                            </div>

                            <div className="space-y-8">
                                {event.slots.map((slot) => (
                                    <div key={slot.id}>
                                        <div className="flex items-center gap-4 mb-3 bg-gray-100 p-2 rounded print:bg-gray-200">
                                            <span className="font-bold text-lg">{slot.startTime}hs</span>
                                            <span className="text-lg">{slot.work?.title}</span>
                                            <span className="ml-auto text-sm font-bold">Total Reservado: {slot.bookings.reduce((acc: number, b: any) => acc + b.countStudents + b.countTeachers, 0)} Pax</span>
                                        </div>

                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-black text-left">
                                                    <th className="py-2 w-[40%]">Institución</th>
                                                    <th className="py-2">Contacto</th>
                                                    <th className="py-2 text-right">Alumnos</th>
                                                    <th className="py-2 text-right">Docentes</th>
                                                    <th className="py-2 text-right">Total</th>
                                                    <th className="py-2 pl-4">Estado / Notas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {slot.bookings.map((booking: any) => (
                                                    <tr key={booking.id}>
                                                        <td className="py-3 pr-2">
                                                            <p className="font-bold">{booking.school?.name}</p>
                                                            <p className="text-xs text-gray-500">{booking.school?.district}</p>
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <p>{booking.school?.contactName}</p>
                                                            <p className="text-xs">{booking.school?.phone}</p>
                                                        </td>
                                                        <td className="py-3 text-right">{booking.countStudents}</td>
                                                        <td className="py-3 text-right">{booking.countTeachers}</td>
                                                        <td className="py-3 text-right font-bold">{booking.countStudents + booking.countTeachers}</td>
                                                        <td className="py-3 pl-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className={cn(
                                                                    "text-[10px] font-bold uppercase w-fit px-1.5 py-0.5 rounded border",
                                                                    booking.status === BookingStatus.CONFIRMED ? "border-black bg-white" : "border-gray-400 bg-gray-50 text-gray-500"
                                                                )}>
                                                                    {booking.status === BookingStatus.HOLD ? "HOLD" : "OK"}
                                                                </span>
                                                                {booking.notes && <p className="text-xs italic text-gray-600 max-w-[200px]">{booking.notes}</p>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* TOTALS FOOTER */}
                                                <tr className="bg-gray-50 font-bold border-t-2 border-black print:bg-transparent">
                                                    <td className="py-2 text-right pr-4" colSpan={2}>TOTALES</td>
                                                    <td className="py-2 text-right">{slot.bookings.reduce((acc: number, b: any) => acc + b.countStudents, 0)}</td>
                                                    <td className="py-2 text-right">{slot.bookings.reduce((acc: number, b: any) => acc + b.countTeachers, 0)}</td>
                                                    <td className="py-2 text-right">{slot.bookings.reduce((acc: number, b: any) => acc + b.countStudents + b.countTeachers, 0)}</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-center text-gray-400">
                Generado automáticamente por Soft Museo Viajero el {format(new Date(), "dd/MM/yyyy HH:mm")}
            </div>
        </div>
    );
}

