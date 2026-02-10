"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/providers/AuthProvider";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Clear cookie
            document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "login_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-white dark:bg-[#1a2632] border-slate-200 dark:border-slate-800 md:flex transition-colors shrink-0 z-50">
            <div className="flex flex-col justify-center h-20 px-6 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                        <span className="font-bold text-lg">M</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Museo Viajero</h1>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Management System</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="space-y-1">
                    {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                <nav className="space-y-1 mb-4">
                    <Link
                        href="/ajustes"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <Settings className="h-4 w-4" />
                        Configuración
                    </Link>
                </nav>

                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
                        {user?.photoURL ? (
                            <NextImage src={user.photoURL} alt={user.displayName || "User"} width={32} height={32} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user?.displayName || "Operador"}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer hover:text-red-500 transition-colors border-none bg-transparent p-0 text-left outline-none"
                        >
                            <LogOut className="h-3 w-3" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
