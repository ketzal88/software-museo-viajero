import { Calendar, BookOpen, GraduationCap, MapPin, Theater, Layers, Inbox, Users, DollarSign, TrendingUp, Globe } from "lucide-react";

export const NAV_LINKS = [
    { href: "/panel", label: "Panel", icon: TrendingUp },
    { href: "/calendario", label: "Calendario", icon: Calendar },
    { href: "/reportes", label: "Reportes", icon: TrendingUp },
    { href: "/inbox", label: "Bandeja", icon: Inbox },
    { href: "/staff", label: "Elenco", icon: Users },
    { href: "/liquidaciones", label: "Liquidaciones", icon: DollarSign },
    { href: "/reservas", label: "Reservas", icon: BookOpen },
    { href: "/escuelas", label: "Escuelas", icon: GraduationCap },
    { href: "/teatros", label: "Teatros", icon: MapPin },
    { href: "/obras", label: "Obras", icon: Theater },
    { href: "/temporadas", label: "Temporadas", icon: Layers },
    { href: "/cms", label: "CMS · Web", icon: Globe },
    // { href: "/ajustes", label: "Ajustes", icon: Settings },
];
