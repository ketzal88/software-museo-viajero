import { getWorksPublic } from "@/lib/actions";
import { PublicacionForm } from "@/features/cms/PublicacionForm";

export const dynamic = "force-dynamic";

export default async function NuevaPublicacionPage() {
    const obras = await getWorksPublic();
    return <PublicacionForm obras={obras} />;
}
