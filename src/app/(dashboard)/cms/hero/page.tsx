import { adminDb } from "@/lib/firebaseAdmin";
import { serializeFirestore } from "@/lib/utils";
import { SimpleCmsHeader, SimpleCmsRow } from "@/features/cms/SimpleList";
import type { HeroSlide } from "@/types";

export const dynamic = "force-dynamic";

export default async function CmsHeroPage() {
    const snap = await adminDb.collection("hero_slides").get();
    const slides = snap.docs
        .map(d => serializeFirestore<HeroSlide>({ id: d.id, ...d.data() }))
        .sort((a, b) => a.order - b.order);
    return (
        <div className="flex flex-col gap-6">
            <SimpleCmsHeader
                eyebrow="CMS · Home"
                title="Hero slides"
                subtitle={`${slides.length} slides en el encabezado de la home.`}
                newHref="/cms/hero/nuevo"
                newLabel="Nuevo slide"
            />
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {slides.map(s => (
                    <li key={s.id}>
                        <SimpleCmsRow
                            href={`/cms/hero/${s.id}/editar`}
                            eyebrow={`Orden ${s.order} · ${s.visible ? "Visible" : "Oculto"}${s.isActive ? "" : " · Inactivo"}`}
                            title={s.titulo.replace(/<[^>]+>/g, " ")}
                            meta={s.small}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
