import { getSeasons, getWorks, getSchools, getVenues, getPeople } from "@/lib/actions";
import Link from "next/link";
import { Calendar, GraduationCap, MapPin, Theater, Users, Layers, ArrowRight } from "lucide-react";

export default async function Home() {
    const [seasons, works, schools, venues, people] = await Promise.all([
        getSeasons(),
        getWorks(),
        getSchools(),
        getVenues(),
        getPeople(),
    ]);

    const activeSeason = seasons.find((s) => s.isActive);

    const stats = [
        { label: "Temporadas", value: seasons.length, icon: Layers, href: "/temporadas" },
        { label: "Obras", value: works.length, icon: Theater, href: "/obras" },
        { label: "Escuelas", value: schools.length, icon: GraduationCap, href: "/escuelas" },
        { label: "Teatros", value: venues.length, icon: MapPin, href: "/teatros" },
        { label: "Elenco", value: people.length, icon: Users, href: "/staff" },
    ];

    return (
        <div className="flex flex-col gap-12">
            <header>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Dashboard
                </h1>
                <p className="text-gray-600 font-sans text-xl mt-2">
                    Bienvenido al núcleo de gestión operativa.
                </p>
            </header>

            {activeSeason && (
                <div className="border border-accent bg-accent/5 p-8">
                    <p className="text-[11px] font-display font-bold text-accent uppercase tracking-widest mb-2">
                        Temporada Activa
                    </p>
                    <h2 className="text-2xl font-display font-bold tracking-tight text-primary">
                        {activeSeason.name}
                    </h2>
                    {activeSeason.startDate && activeSeason.endDate && (
                        <p className="text-sm text-gray-600 font-sans mt-1">
                            {activeSeason.startDate} — {activeSeason.endDate}
                        </p>
                    )}
                    {activeSeason.workIds && (
                        <p className="text-sm text-gray-500 font-sans mt-2">
                            {activeSeason.workIds.length} obra{activeSeason.workIds.length !== 1 ? "s" : ""} programada{activeSeason.workIds.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="group border border-gray-300 p-6 hover:border-primary/30 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className="h-5 w-5 text-gray-500" />
                                <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-4xl font-display font-bold tracking-tight text-primary">
                                {stat.value}
                            </p>
                        </Link>
                    );
                })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Link
                    href="/calendario"
                    className="group flex items-center justify-between border border-gray-300 p-8 hover:border-primary/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <Calendar className="h-6 w-6 text-gray-500" />
                        <div>
                            <h3 className="font-display font-bold text-lg text-primary">Calendario</h3>
                            <p className="text-sm text-gray-600 font-sans">Ver programación de funciones</p>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </Link>
                <Link
                    href="/reservas"
                    className="group flex items-center justify-between border border-gray-300 p-8 hover:border-primary/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <GraduationCap className="h-6 w-6 text-gray-500" />
                        <div>
                            <h3 className="font-display font-bold text-lg text-primary">Reservas</h3>
                            <p className="text-sm text-gray-600 font-sans">Gestionar reservas de escuelas</p>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </Link>
            </div>
        </div>
    );
}
