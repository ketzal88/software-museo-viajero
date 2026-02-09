import { getVenues } from "@/lib/actions";
import { VenueList } from "@/features/venues/components/VenueList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TeatrosPage() {
    const venues = await getVenues();

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Teatros</h1>
                    <p className="text-muted-foreground text-lg">Administra las salas y centros culturales.</p>
                </div>
                <Link
                    href="/teatros/nuevo"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-sm"
                >
                    <Plus className="h-4 w-4" /> Nuevo Teatro
                </Link>
            </header>

            <VenueList venues={venues} />
        </div>
    );
}
