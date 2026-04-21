import type { Metadata } from "next";
import { getSiteConfig, getCronologia } from "@/lib/actions";
import { SanitizedHtml } from "@/features/public/SanitizedHtml";
import { StructuredData } from "@/features/public/StructuredData";
import { buildAboutPageSchema, buildBreadcrumbSchema } from "@/lib/schema";
import { htmlToPlainText } from "@/lib/sanitize";
import type { SiteConfigNosotros } from "@/types";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    const nosotros = await getSiteConfig<SiteConfigNosotros>("nosotros");
    const desc = nosotros?.seo?.description
        || htmlToPlainText(nosotros?.body, 160)
        || "El Museo Viajero es una compañía argentina de teatro histórico para escuelas fundada en 1995.";
    return {
        title: nosotros?.seo?.title ?? "Sobre nosotros",
        description: desc,
        alternates: { canonical: "/nosotros" },
    };
}

export default async function NosotrosPage() {
    const [nosotros, cronologia] = await Promise.all([
        getSiteConfig<SiteConfigNosotros>("nosotros"),
        getCronologia(),
    ]);

    const title = nosotros?.title ?? "Sobre nosotros";
    const body = nosotros?.body ?? "<p>El Museo Viajero es una compañía argentina de teatro histórico para escuelas fundada en 1995 por Héctor López Girondo, Raquel Prestigiacomo y Fabián Uccello.</p>";

    return (
        <div>
            <StructuredData
                schema={[
                    buildBreadcrumbSchema([
                        { name: "Inicio", url: "/" },
                        { name: "Nosotros", url: "/nosotros" },
                    ]),
                    buildAboutPageSchema(title, body, cronologia),
                ]}
                id="nosotros-schema"
            />

            <header className="mx-auto max-w-4xl px-6 pt-20 pb-10 md:px-10">
                <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                    Compañía fundada en 1995
                </p>
                <h1 className="mt-3 text-[54px] md:text-[84px] font-display font-bold tracking-[-3px] text-primary leading-[1]">
                    {title}
                </h1>
            </header>

            <section className="mx-auto max-w-4xl px-6 pb-20 md:px-10">
                <SanitizedHtml
                    html={body}
                    className="prose prose-lg max-w-none font-sans text-gray-800 leading-relaxed [&>*]:mb-5 [&_h3]:text-2xl [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-primary [&_h3]:mt-8 [&_strong]:text-primary [&_strong]:font-display [&_strong]:font-bold [&_b]:text-primary [&_b]:font-display [&_b]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
                />
            </section>

            {/* Cronología */}
            {cronologia.length > 0 && (
                <section className="border-t border-gray-200 py-16 md:py-24 bg-gray-50">
                    <div className="mx-auto max-w-5xl px-6 md:px-10">
                        <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                            Más de 30 años
                        </p>
                        <h2 className="mt-3 text-[38px] md:text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight mb-12">
                            Cronología
                        </h2>
                        <ol className="space-y-10">
                            {cronologia.map(item => (
                                <li key={item.id} className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-6 border-t border-gray-200 pt-8">
                                    <span className="text-3xl md:text-4xl font-display font-bold tracking-tight text-accent">
                                        {item.year}
                                    </span>
                                    <ul className="space-y-2 font-sans text-gray-700 leading-relaxed">
                                        {item.events.map((e, i) => (
                                            <li key={i} className="text-base">{e}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}
        </div>
    );
}
