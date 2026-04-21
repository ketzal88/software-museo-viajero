import { getWorksPublic } from "@/lib/actions";
import { MaterialForm } from "@/features/cms/MaterialForm";

export const dynamic = "force-dynamic";

export default async function NuevoMaterialPage() {
    const obras = await getWorksPublic();
    return <MaterialForm obras={obras} />;
}
