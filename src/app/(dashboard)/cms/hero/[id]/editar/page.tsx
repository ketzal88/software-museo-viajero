import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { HeroForm } from "@/features/cms/HeroForm";
import type { HeroSlide } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditarHeroPage({ params }: { params: { id: string } }) {
    const doc = await adminDb.collection("hero_slides").doc(params.id).get();
    if (!doc.exists) notFound();
    const slide = serializeFirestore<HeroSlide>({ id: doc.id, ...doc.data() });
    return <HeroForm slide={slide} />;
}
