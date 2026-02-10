import Link from "next/link";
import { DollarSign, Settings, Users, Shield, Bell, ChevronRight, Calculator } from "lucide-react";

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
                    color: "bg-blue-50 text-blue-600"
                },
                {
                    title: "Tarifas de Elenco",
                    description: "Gestión de pagos por función y modalidad.",
                    icon: <DollarSign className="h-5 w-5" />,
                    href: "/staff/tarifas",
                    color: "bg-green-50 text-green-600"
                }
            ]
        },
        {
            title: "Sistema",
            items: [
                {
                    title: "Usuarios y Roles",
                    description: "Administradores y operadores del sistema.",
                    icon: <Shield className="h-5 w-5" />,
                    href: "#",
                    color: "bg-purple-50 text-purple-600"
                },
                {
                    title: "General",
                    description: "Nombre de la empresa, logo y contacto.",
                    icon: <Settings className="h-5 w-5" />,
                    href: "#",
                    color: "bg-slate-50 text-slate-600"
                }
            ]
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Panel de Control</h1>
                <p className="text-muted-foreground mt-1">Configuración técnica y parámetros del negocio.</p>
            </header>

            <div className="space-y-10">
                {sections.map(section => (
                    <div key={section.title} className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">{section.title}</h2>
                        <div className="grid gap-3">
                            {section.items.map(item => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group flex items-center justify-between p-5 bg-card border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${item.color}`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
