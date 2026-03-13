"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
        <aside className="fixed left-0 top-0 hidden h-screen w-[260px] flex-col border-r bg-[#0A0A0A] border-gray-800 md:flex transition-colors shrink-0 z-50">
            <div className="flex flex-col justify-center h-32 px-8">
                <div className="flex items-center gap-3.5">
                    <div className="h-8 w-8 bg-accent flex items-center justify-center text-white shrink-0">
                        <span className="font-display font-bold text-lg tracking-[2px]">M</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-display font-bold tracking-[2px] text-white leading-tight uppercase">Museo Viajero</h1>
                        <span className="text-[10px] font-sans font-medium text-gray-500 uppercase tracking-wider">Management System</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 px-8">
                <nav className="space-y-1.5">
                    {NAV_LINKS.map((link, index) => {
                        const isActive = pathname.startsWith(link.href);
                        const number = (index + 1).toString().padStart(2, '0');

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-4 py-3.5 transition-all duration-200 group",
                                    isActive ? "text-white" : "text-gray-600 hover:text-gray-400"
                                )}
                            >
                                <span className={cn(
                                    "font-display text-[15px] w-6 shrink-0",
                                    isActive ? "text-accent" : "text-gray-600"
                                )}>
                                    {number}
                                </span>
                                <span className={cn(
                                    "font-display text-[15px] tracking-tight",
                                    isActive ? "font-semibold" : "font-normal"
                                )}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-8 space-y-7">
                <nav className="space-y-1">
                    <Link
                        href="/ajustes"
                        className="flex items-center gap-4 py-2 text-gray-600 hover:text-gray-400 font-display text-[15px] transition-all"
                    >
                        <span className="w-6 text-gray-600">--</span>
                        <span>Configuración</span>
                    </Link>
                </nav>

                <div className="flex items-center gap-3 py-4 border-t border-gray-800">
                    <div className="h-7 w-7 bg-accent flex items-center justify-center text-white overflow-hidden text-xs font-display font-semibold">
                        {user?.photoURL ? (
                            <NextImage src={user.photoURL} alt={user.displayName || "User"} width={28} height={28} className="h-full w-full object-cover" />
                        ) : (
                            user?.displayName?.charAt(0) || "U"
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-display font-medium text-white truncate">
                            {user?.displayName || "Operador"}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer hover:text-accent transition-colors border-none bg-transparent p-0 text-left outline-none font-sans"
                        >
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
