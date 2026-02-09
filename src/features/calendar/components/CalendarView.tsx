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
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-bold tracking-tight capitalize text-slate-900 dark:text-white">
                            {format(currentDate, "MMMM yyyy", { locale: es })}
                        </h2>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button onClick={prevPeriod} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-all">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={goToToday} className="px-3 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-slate-700 rounded transition-all">
                                Hoy
                            </button>
                            <button onClick={nextPeriod} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-all">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <input
                                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg text-sm w-64 text-slate-900 dark:text-white placeholder:text-slate-500"
                                placeholder="Buscar eventos..."
                                type="text"
                            />
                            <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                        </div>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <Link
                            href="/calendario/nuevo"
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Crear
                        </Link>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtros:</span>
                        <div className="relative inline-block text-left">
                            <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                Temporada: 2024
                            </button>
                        </div>
                        <div className="relative inline-block text-left">
                            <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
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
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                {days.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 dark:border-slate-800 last:border-0">
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
                                "min-h-[120px] p-2 border-r border-b border-slate-200 dark:border-slate-800 relative group transition-colors",
                                isOtherMonth ? "bg-slate-50/30 dark:bg-slate-950/20 text-slate-400" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            )}
                        >
                            <span className={cn(
                                "text-sm font-semibold mb-2 block w-max",
                                isCurrentDay ? "text-primary bg-primary/10 px-2 rounded-full" : "text-slate-400"
                            )}>
                                {format(day, "d")}
                            </span>

                            <div className="flex flex-col gap-1.5">
                                {dayEvents.map(event => (
                                    <Link
                                        key={event.id}
                                        href={`/calendario/${dateStr}`} // Link to day detail
                                        className={cn(
                                            "block px-2 py-1 rounded text-[11px] font-bold border-l-2 truncate transition-all hover:brightness-95",
                                            event.type === EventType.THEATER
                                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-500"
                                                : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-500"
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
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-100 hover:bg-primary hover:text-white rounded-full text-slate-500"
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
        <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-background">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {renderHeader()}

                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-background-dark p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-w-[800px]">
                        {renderDaysHeader()}
                        {renderMonthGrid()}
                    </div>
                </div>
            </div>

            {/* Quick Info Panel (Right Sidebar) - Hidden on smaller screens */}
            <div className="hidden xl:flex w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col overflow-y-auto shrink-0 z-10">
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Resumen: {format(currentDate, "MMM yyyy", { locale: es })}</h3>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                                <Theater className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Funciones Teatro</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{theaterCount} Funciones</p>
                        </div>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-1">
                                <MapPin className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Escuelas Viajeras</span>
                            </div>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{travelCount} Visitas</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recordatorios (Hoy)</h4>
                        <div className="space-y-4">
                            {/* Mock Reminders */}
                            <div className="flex gap-3 items-start">
                                <div className="h-2 w-2 rounded-full bg-yellow-400 mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirmar transporte (Día 5)</p>
                                    <p className="text-xs text-slate-500">Escuela Normal espera confirmación</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="h-2 w-2 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cervantes: Logística OK</p>
                                    <p className="text-xs text-slate-500">Todo listo para la función</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                    <button className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-slate-200">
                        <Download className="h-5 w-5" />
                        <span>Exportar PDF</span>
                    </button>
                </div>
            </div>

            {/* FAB for Mobile/Quick Access */}
            <div className="absolute bottom-8 right-8 z-50 xl:hidden">
                <Link
                    href="/calendario/nuevo"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="h-8 w-8" />
                </Link>
            </div>
        </div>
    );
}
