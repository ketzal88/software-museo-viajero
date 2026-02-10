import { getMonthlySummaries, getDailySummaries } from "@/lib/actions";
import { EventType } from "@/types";
import { TrendingUp, Users, DollarSign, Wallet, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    const [monthlySummaries, dailySummaries] = await Promise.all([
        getMonthlySummaries(),
        getDailySummaries()
    ]);

    // Totales rápidos para el mes actual (si hay datos)
    const latestMonth = monthlySummaries[0];

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" /> Reportes de Gestión
                </h1>
                <p className="text-muted-foreground mt-1">Análisis de recaudación, costos y márgenes operativos.</p>
            </header>

            {/* Resumen General */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Ventas Totales"
                    value={`$${latestMonth?.revenueTotal.toLocaleString() || 0}`}
                    badge={latestMonth?.month}
                    icon={<DollarSign className="h-5 w-5" />}
                    color="blue"
                />
                <SummaryCard
                    title="Margen Bruto"
                    value={`$${latestMonth?.marginTotal.toLocaleString() || 0}`}
                    badge={`${latestMonth ? Math.round((latestMonth.marginTotal / latestMonth.revenueTotal) * 100) : 0}%`}
                    icon={<Wallet className="h-5 w-5" />}
                    color="green"
                />
                <SummaryCard
                    title="Asistencia"
                    value={latestMonth?.attendanceTotal.toLocaleString() || 0}
                    badge="Alumnos"
                    icon={<Users className="h-5 w-5" />}
                    color="amber"
                />
                <SummaryCard
                    title="Proporción"
                    value={`${latestMonth?.typeBreakdown.theater ? Math.round((latestMonth.typeBreakdown.theater / latestMonth.revenueTotal) * 100) : 0}%`}
                    badge="Teatro"
                    icon={<FileText className="h-5 w-5" />}
                    color="purple"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Tabla Mensual */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black uppercase tracking-tight">Historial Mensual</h2>
                    </div>
                    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-6 py-4">Mes</th>
                                    <th className="px-6 py-4">Ingresos</th>
                                    <th className="px-6 py-4">Costos</th>
                                    <th className="px-6 py-4">Margen</th>
                                    <th className="px-6 py-4">Asist.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {monthlySummaries.map((summary) => (
                                    <tr key={summary.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-sm uppercase">
                                            {format(new Date(summary.month + "-01T12:00:00"), "MMMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">${summary.revenueTotal.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-red-600">-${summary.costsTotal.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                                                ${summary.marginTotal.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{summary.attendanceTotal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Listado Diario Reciente */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black uppercase tracking-tight">Últimos Cierres</h2>
                    <div className="space-y-3">
                        {dailySummaries.slice(0, 10).map((summary) => (
                            <div key={summary.id} className="p-4 bg-card border rounded-xl flex items-center justify-between hover:border-primary transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        summary.type === EventType.THEATER ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight text-slate-500">
                                            {format(new Date(summary.date + "T12:00:00"), "dd MMM", { locale: es })}
                                        </p>
                                        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">
                                            ${summary.revenue.final.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-green-600">+{Math.round((summary.margin.gross / summary.revenue.final) * 100)}%</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{summary.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, badge, icon, color }: { title: string, value: string | number, badge?: string, icon: React.ReactNode, color: "blue" | "green" | "amber" | "purple" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="bg-card p-6 border rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl", colors[color])}>
                    {icon}
                </div>
                {badge && (
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        </div>
    );
}
