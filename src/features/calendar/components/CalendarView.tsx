"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isToday,
    eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Theater, MapPin, Search, Plus, Download, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventDay, EventType, Venue } from "@/types";
import Link from "next/link";

interface CalendarViewProps {
    eventDays: EventDay[];
    venues: Venue[]; // Added venues prop
}

export function CalendarView({ eventDays, venues }: CalendarViewProps) {
    const getVenueName = (locationId: string) => {
        const venue = venues.find(v => v.id === locationId);
        return venue ? venue.name : "Teatro";
    };
    const [currentDate, setCurrentDate] = useState(new Date());

    // Navigation
    const nextPeriod = () => setCurrentDate(addMonths(currentDate, 1));
    const prevPeriod = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Stats calculation (simple mock based on current month's data)
    const monthEvents = eventDays.filter(e => isSameMonth(new Date(e.date), currentDate));
    const theaterCount = monthEvents.filter(e => e.type === EventType.THEATER).length;
    const travelCount = monthEvents.filter(e => e.type === EventType.TRAVEL).length;

    const renderHeader = () => {
        return (
            <header className="bg-white border-b border-gray-300 p-4 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-display font-bold tracking-tight capitalize text-primary">
                            {format(currentDate, "MMMM yyyy", { locale: es })}
                        </h2>
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 p-1">
                            <button onClick={prevPeriod} className="p-1 hover:bg-white transition-all">
                                <ChevronLeft className="h-4 w-4 text-gray-500" />
                            </button>
                            <button onClick={goToToday} className="px-3 py-1 text-xs font-display font-medium text-primary hover:bg-white transition-all">
                                Hoy
                            </button>
                            <button onClick={nextPeriod} className="p-1 hover:bg-white transition-all">
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <input
                                className="w-full border border-gray-300 pl-10 pr-4 py-3 text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors w-64 placeholder:text-gray-400"
                                placeholder="Buscar eventos..."
                                type="text"
                            />
                            <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-50 transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <Link
                            href="/calendario/nuevo"
                            className="flex items-center gap-2 bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                        >
                            <Plus className="h-4 w-4" /> Crear
                        </Link>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Filtros:</span>
                        <div className="relative inline-block text-left">
                            <button className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 text-sm font-display font-medium text-primary hover:border-primary/30 transition-colors">
                                Temporada: 2024
                            </button>
                        </div>
                        <div className="relative inline-block text-left">
                            <button className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 text-sm font-display font-medium text-primary hover:border-primary/30 transition-colors">
                                Tipo: Todos
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        );
    };

    const renderDaysHeader = () => {
        const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        return (
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {days.map(day => (
                    <div key={day} className="py-3 text-center text-[11px] font-display font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 last:border-0">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderMonthGrid = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 auto-rows-fr">
                {days.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const dayEvents = eventDays.filter(e => e.date === dateStr);
                    const isOtherMonth = !isSameMonth(day, monthStart);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b border-gray-200 relative group transition-colors",
                                isOtherMonth ? "bg-gray-50/30 text-gray-400" : "bg-white hover:bg-gray-50"
                            )}
                        >
                            <span className={cn(
                                "text-sm font-sans font-semibold mb-2 block w-max",
                                isCurrentDay ? "text-white bg-primary px-2 rounded-full" : "text-gray-400"
                            )}>
                                {format(day, "d")}
                            </span>

                            <div className="flex flex-col gap-1.5">
                                {dayEvents.map(event => (
                                    <Link
                                        key={event.id}
                                        href={`/calendario/${dateStr}`} // Link to day detail
                                        className={cn(
                                            "block px-2 py-1 text-[11px] font-display font-bold border-l-2 truncate transition-all",
                                            event.type === EventType.THEATER
                                                ? "bg-blue-50 text-blue-700 border-blue-500"
                                                : "bg-indigo-50 text-indigo-700 border-indigo-500"
                                        )}
                                        title={`${event.type === 'theater' ? 'Teatro' : 'Viaje'}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {event.type === EventType.THEATER ? (
                                                <Theater className="h-3 w-3 shrink-0" />
                                            ) : (
                                                <MapPin className="h-3 w-3 shrink-0" />
                                            )}
                                            <span className="truncate">{event.type === EventType.THEATER ? getVenueName(event.locationId) : "Viajera"}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Hover Add Button (Simplified) */}
                            <Link
                                href={`/calendario/nuevo?date=${dateStr}`}
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-50 hover:bg-primary hover:text-white rounded-full text-gray-500"
                            >
                                <Plus className="h-4 w-4" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {renderHeader()}

                <div className="flex-1 overflow-auto bg-gray-50 p-4">
                    <div className="bg-white border border-gray-300 overflow-hidden min-w-[800px]">
                        {renderDaysHeader()}
                        {renderMonthGrid()}
                    </div>
                </div>
            </div>

            {/* Quick Info Panel (Right Sidebar) - Hidden on smaller screens */}
            <div className="hidden xl:flex w-80 bg-white border-l border-gray-300 flex-col overflow-y-auto shrink-0 z-10">
                <div className="p-6">
                    <h3 className="font-display font-bold text-lg mb-6 text-primary">Resumen: {format(currentDate, "MMM yyyy", { locale: es })}</h3>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 border border-gray-300 hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <Theater className="h-5 w-5 text-gray-500" />
                                <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Funciones Teatro</span>
                            </div>
                            <p className="text-2xl font-display font-bold text-primary">{theaterCount} Funciones</p>
                        </div>

                        <div className="p-4 border border-gray-300 hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">Escuelas Viajeras</span>
                            </div>
                            <p className="text-2xl font-display font-bold text-primary">{travelCount} Visitas</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-300">
                        <h4 className="text-[11px] font-display font-bold text-gray-500 uppercase tracking-widest mb-4">Recordatorios (Hoy)</h4>
                        <div className="space-y-4">
                            {/* Mock Reminders */}
                            <div className="flex gap-3 items-start">
                                <div className="h-2 w-2 rounded-full bg-yellow-400 mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-display font-medium text-primary">Confirmar transporte (Día 5)</p>
                                    <p className="text-xs text-gray-500">Escuela Normal espera confirmación</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="h-2 w-2 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-display font-medium text-primary">Cervantes: Logística OK</p>
                                    <p className="text-xs text-gray-500">Todo listo para la función</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-6 bg-gray-50 border-t border-gray-300">
                    <button className="w-full border border-gray-300 px-6 py-3 text-sm font-display font-medium text-primary transition-all hover:border-primary/30 flex items-center justify-center gap-2">
                        <Download className="h-5 w-5 text-gray-500" />
                        <span>Exportar PDF</span>
                    </button>
                </div>
            </div>

            {/* FAB for Mobile/Quick Access */}
            <div className="absolute bottom-8 right-8 z-50 xl:hidden">
                <Link
                    href="/calendario/nuevo"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white hover:bg-black transition-all"
                >
                    <Plus className="h-8 w-8" />
                </Link>
            </div>
        </div>
    );
}
