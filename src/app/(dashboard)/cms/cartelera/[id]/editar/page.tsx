import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { getWorksPublic, getVenuesPublic } from "@/lib/actions";
import { FuncionForm } from "@/features/cms/FuncionForm";
import type { FuncionCartelera } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditarFuncionPage({ params }: { params: { id: string } }) {
    const [docSnap, obras, venues] = await Promise.all([
        adminDb.collection("funciones_cartelera").doc(params.id).get(),
        getWorksPublic(),
        getVenuesPublic(),
    ]);
    if (!docSnap.exists) notFound();
    const funcion = serializeFirestore<FuncionCartelera>({ id: docSnap.id, ...docSnap.data() });
    return <FuncionForm funcion={funcion} obras={obras} venues={venues} />;
}
