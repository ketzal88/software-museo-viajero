import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { getWorksPublic } from "@/lib/actions";
import { PublicacionForm } from "@/features/cms/PublicacionForm";
import type { Publicacion } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditarPublicacionPage({ params }: { params: { id: string } }) {
    const [doc, obras] = await Promise.all([
        adminDb.collection("publicaciones").doc(params.id).get(),
        getWorksPublic(),
    ]);
    if (!doc.exists) notFound();
    const publicacion = serializeFirestore<Publicacion>({ id: doc.id, ...doc.data() });
    return <PublicacionForm publicacion={publicacion} obras={obras} />;
}
