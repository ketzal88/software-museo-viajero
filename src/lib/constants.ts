import { Calendar, BookOpen, GraduationCap, MapPin, Theater, Settings, Layers, Inbox } from "lucide-react";

export const NAV_LINKS = [
    { href: "/calendario", label: "Calendario", icon: Calendar },
    { href: "/inbox", label: "Bandeja", icon: Inbox },
    { href: "/reservas", label: "Reservas", icon: BookOpen },
    { href: "/escuelas", label: "Escuelas", icon: GraduationCap },
    { href: "/teatros", label: "Teatros", icon: MapPin },
    { href: "/obras", label: "Obras", icon: Theater },
    { href: "/temporadas", label: "Temporadas", icon: Layers },
    // { href: "/ajustes", label: "Ajustes", icon: Settings },
];
