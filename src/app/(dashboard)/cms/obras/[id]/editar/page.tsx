import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { getTemasObras } from "@/lib/actions";
import { ObraForm } from "@/features/cms/ObraForm";
import type { Work } from "@/types";

export const dynamic = "force-dynamic";

async function getWorkById(id: string): Promise<Work | null> {
    const doc = await adminDb.collection("works").doc(id).get();
    if (!doc.exists) return null;
    return serializeFirestore<Work>({ id: doc.id, ...doc.data() });
}

export default async function EditarObraPage({ params }: { params: { id: string } }) {
    const [obra, temas] = await Promise.all([getWorkById(params.id), getTemasObras()]);
    if (!obra) notFound();

    return <ObraForm obra={obra} temas={temas} />;
}
