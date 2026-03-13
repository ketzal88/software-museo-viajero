export function VenueListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-300 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gray-200" />
                    <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 w-3/4" />
                        <div className="h-4 bg-gray-200 w-1/2" />
                        <div className="h-20 bg-gray-200" />
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div className="h-4 bg-gray-200 w-20" />
                            <div className="h-8 w-8 bg-gray-200" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function WorkListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-300 p-6 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-200 w-3/4" />
                        <div className="h-4 bg-gray-200 w-1/2" />
                        <div className="h-4 bg-gray-200 w-full" />
                        <div className="h-4 bg-gray-200 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SchoolListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-gray-300 p-6 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-200 w-3/4" />
                        <div className="h-4 bg-gray-200 w-1/2" />
                        <div className="h-4 bg-gray-200 w-full" />
                        <div className="flex gap-2 mt-4">
                            <div className="h-5 bg-gray-200 w-16" />
                            <div className="h-5 bg-gray-200 w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-0">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-t border-gray-200 animate-pulse first:border-t-0">
                    <div className="h-10 w-10 bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 w-1/3" />
                        <div className="h-3 bg-gray-200 w-1/2" />
                    </div>
                    <div className="h-8 w-24 bg-gray-200" />
                </div>
            ))}
        </div>
    );
}
