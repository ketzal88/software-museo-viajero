import Link from "next/link";
import { Calculator, DollarSign, Shield, Settings, ChevronRight } from "lucide-react";

export default function AjustesPage() {
    const sections = [
        {
            title: "Operación & Finanzas",
            items: [
                {
                    title: "Reglas de Precios",
                    description: "Tickets de teatro y formatos de viaje por vigencia.",
                    icon: <Calculator className="h-5 w-5" />,
                    href: "/ajustes/precios",
                },
                {
                    title: "Tarifas de Elenco",
                    description: "Gestión de pagos por función y modalidad.",
                    icon: <DollarSign className="h-5 w-5" />,
                    href: "/liquidaciones",
                },
            ],
        },
        {
            title: "Sistema",
            items: [
                {
                    title: "Usuarios y Roles",
                    description: "Administradores y operadores del sistema.",
                    icon: <Shield className="h-5 w-5" />,
                    href: "#",
                },
                {
                    title: "General",
                    description: "Nombre de la empresa, logo y contacto.",
                    icon: <Settings className="h-5 w-5" />,
                    href: "#",
                },
            ],
        },
    ];

    return (
        <div className="flex flex-col gap-10">
            <header>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Configuración
                </h1>
                <p className="text-gray-600 font-sans text-xl mt-2">Parámetros del negocio y configuración técnica.</p>
            </header>

            <div className="space-y-10">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-500">
                            {section.title}
                        </h2>
                        <div className="grid gap-3">
                            {section.items.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group flex items-center justify-between p-6 border border-gray-300 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-gray-700">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-primary">{item.title}</h3>
                                            <p className="text-sm text-gray-600 font-sans">{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
