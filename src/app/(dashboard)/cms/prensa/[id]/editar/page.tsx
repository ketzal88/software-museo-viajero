import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { PrensaForm } from "@/features/cms/PrensaForm";
import type { NotaPrensa } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditarPrensaPage({ params }: { params: { id: string } }) {
    const doc = await adminDb.collection("prensa").doc(params.id).get();
    if (!doc.exists) notFound();
    const nota = serializeFirestore<NotaPrensa>({ id: doc.id, ...doc.data() });
    return <PrensaForm nota={nota} />;
}
