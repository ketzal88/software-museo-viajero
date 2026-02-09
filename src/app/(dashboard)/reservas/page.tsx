import { BookOpen, Plus, Calendar as CalendarIcon, Truck } from "lucide-react";
import Link from "next/link";

export default function ReservasPage() {
    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
                        <p className="text-muted-foreground text-lg">Gestiona el aforo y las visitas a instituciones.</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/calendario"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl text-muted-foreground hover:text-primary hover:border-primary transition-all bg-card hover:bg-primary/5 group"
                >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                        <CalendarIcon className="h-8 w-8" />
                    </div>
                    <p className="font-bold text-center">Programar desde Calendario</p>
                    <p className="text-xs text-center mt-1">Selecciona una fecha y sede para agregar grupos.</p>
                </Link>

                <div className="flex flex-col items-center justify-center p-8 border rounded-2xl bg-muted/20 text-muted-foreground opacity-60">
                    <p>No hay reservas recientes para mostrar.</p>
                </div>
            </div>

            <section className="mt-8">
                <h2 className="text-xl font-bold mb-4">Accesos Rápidos</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/calendario"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Nueva Reserva Teatro
                    </Link>
                    <Link
                        href="/calendario"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 hover:opacity-90 transition-all active:scale-95"
                    >
                        <Truck className="h-4 w-4" /> Nueva Reserva Viajera
                    </Link>
                </div>
            </section>
        </div>
    );
}
