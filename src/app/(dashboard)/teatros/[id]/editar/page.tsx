import { getVenueById } from "@/lib/actions";
import { VenueForm } from "@/features/venues/components/VenueForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditarTeatroPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarTeatroPage({ params }: EditarTeatroPageProps) {
    const { id } = await params;
    const venue = await getVenueById(id);

    if (!venue) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/teatros"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-sans"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Teatros
                </Link>
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Editar Teatro
                </h1>
                <p className="text-gray-600 font-sans text-xl">Modificando datos de {venue.name}.</p>
            </header>

            <div className="border border-gray-300 p-6 md:p-10">
                <VenueForm initialData={venue} />
            </div>
        </div>
    );
}
