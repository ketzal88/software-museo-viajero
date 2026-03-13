import { getVenues } from "@/lib/actions";
import { VenueList } from "@/features/venues/components/VenueList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TeatrosPage() {
    const venues = await getVenues();

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                        Teatros
                    </h1>
                    <p className="text-gray-600 font-sans text-xl mt-2">Administra las salas y centros culturales.</p>
                </div>
                <Link
                    href="/teatros/nuevo"
                    className="flex items-center gap-2 bg-primary px-8 py-3.5 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                >
                    <Plus className="h-5 w-5" /> Nuevo Teatro
                </Link>
            </header>

            <VenueList venues={venues} />
        </div>
    );
}
