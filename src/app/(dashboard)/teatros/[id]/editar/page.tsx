import { getVenueById } from "@/lib/actions";
import { VenueForm } from "@/features/venues/components/VenueForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditarTeatroPageProps {
    params: {
        id: string;
    };
}

export default async function EditarTeatroPage({ params }: EditarTeatroPageProps) {
    const venue = await getVenueById(params.id);

    if (!venue) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <header className="flex flex-col gap-2">
                <Link
                    href="/teatros"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a Teatros
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Teatro</h1>
                <p className="text-muted-foreground">Modifica la información de {venue.name}.</p>
            </header>

            <VenueForm initialData={venue} />
        </div>
    );
}
