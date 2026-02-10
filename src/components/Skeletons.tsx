export function VenueListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-40 bg-muted" />
                    <div className="p-5 space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-20 bg-muted rounded" />
                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="h-4 bg-muted rounded w-20" />
                            <div className="h-8 w-8 bg-muted rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function WorkListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm animate-pulse">
                    <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
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
                <div key={i} className="rounded-xl border bg-card p-5 shadow-sm animate-pulse">
                    <div className="space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="flex gap-2 mt-4">
                            <div className="h-6 bg-muted rounded-full w-16" />
                            <div className="h-6 bg-muted rounded-full w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                    <div className="h-12 w-12 bg-muted rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-8 w-24 bg-muted rounded" />
                </div>
            ))}
        </div>
    );
}
