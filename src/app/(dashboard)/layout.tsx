import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pb-16 md:pb-0 md:pl-64">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
