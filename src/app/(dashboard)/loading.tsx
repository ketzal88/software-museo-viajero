import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-10 animate-pulse">
            <header>
                <div className="h-14 bg-gray-200 w-72 mb-3" />
                <div className="h-6 bg-gray-200 w-96" />
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="border border-gray-300 p-6">
                        <div className="h-4 bg-gray-200 w-20 mb-4" />
                        <div className="h-10 bg-gray-200 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
