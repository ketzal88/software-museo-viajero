import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { getWorksPublic } from "@/lib/actions";
import { MaterialForm } from "@/features/cms/MaterialForm";
import type { MaterialEducativo } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditarMaterialPage({ params }: { params: { id: string } }) {
    const [doc, obras] = await Promise.all([
        adminDb.collection("materiales").doc(params.id).get(),
        getWorksPublic(),
    ]);
    if (!doc.exists) notFound();
    const material = serializeFirestore<MaterialEducativo>({ id: doc.id, ...doc.data() });
    return <MaterialForm material={material} obras={obras} />;
}
