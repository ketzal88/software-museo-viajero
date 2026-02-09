import { getInboxItems } from "@/lib/actions";
import { InboxList } from "@/features/inbox/components/InboxList";
import { Inbox as InboxIcon, Activity, Clock, Truck } from "lucide-react";

export default async function InboxPage() {
    const items = await getInboxItems();
    const pendingCount = items.length;

    return (
        <div className="flex flex-col mx-auto w-full max-w-[1280px] py-8 px-4 lg:px-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-[#111418] dark:text-white leading-tight">Bandeja de Reservas</h1>
                    <p className="text-[#617589] dark:text-gray-400 text-base font-normal">Priorizando reservas por fecha de vencimiento</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#1c2a38] border border-gray-200 dark:border-gray-700 px-4 text-[#111418] dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <InboxIcon className="h-5 w-5" />
                        <span>Filtrar</span>
                    </button>
                    <button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-white font-bold shadow-sm hover:opacity-90 transition-opacity">
                        <Activity className="h-5 w-5" />
                        <span>Nueva Reserva</span>
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="mb-6 border-b border-[#dbe0e6] dark:border-[#2d3a4a]">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-primary text-primary pb-3 pt-2" href="#">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold leading-normal tracking-[0.015em]">HOLD</span>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{pendingCount}</span>
                        </div>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#617589] dark:text-gray-400 pb-3 pt-2 hover:text-[#111418] dark:hover:text-white transition-colors" href="#">
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">CONFIRMADAS</p>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#617589] dark:text-gray-400 pb-3 pt-2 hover:text-[#111418] dark:hover:text-white transition-colors" href="#">
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">VENCIDAS</p>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#617589] dark:text-gray-400 pb-3 pt-2 hover:text-[#111418] dark:hover:text-white transition-colors" href="#">
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">CANCELADAS</p>
                    </a>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 text-sm font-medium shadow-sm">
                    Todos
                </button>
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1c2a38] border border-gray-200 dark:border-gray-700 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[#617589] dark:text-gray-300">
                    <Truck className="h-4 w-4" /> Viajes
                </button>
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1c2a38] border border-gray-200 dark:border-gray-700 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[#617589] dark:text-gray-300">
                    <Clock className="h-4 w-4" /> Teatros
                </button>
            </div>

            {/* Content */}
            <InboxList items={items as any} />
        </div>
    );
}
