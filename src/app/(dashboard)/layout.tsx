"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="relative flex min-h-screen">
            <div className="print:hidden"><Sidebar /></div>
            <main className="flex-1 pb-16 md:pb-0 md:pl-[260px] print:pl-0 bg-white">
                <div className="h-full min-h-screen px-6 py-10 md:px-14 md:py-10 print:px-6 print:py-4">
                    {children}
                </div>
            </main>
            <div className="print:hidden"><BottomNav /></div>
        </div>
    );
}
