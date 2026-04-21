import { getWorksPublic, getVenuesPublic } from "@/lib/actions";
import { FuncionForm } from "@/features/cms/FuncionForm";

export const dynamic = "force-dynamic";

export default async function NuevaFuncionPage() {
    const [obras, venues] = await Promise.all([getWorksPublic(), getVenuesPublic()]);
    return <FuncionForm obras={obras} venues={venues} />;
}
