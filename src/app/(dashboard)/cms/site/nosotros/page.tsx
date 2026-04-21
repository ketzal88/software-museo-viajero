import { getSiteConfig } from "@/lib/actions";
import { SiteNosotrosForm } from "@/features/cms/SiteNosotrosForm";
import type { SiteConfigNosotros } from "@/types";

export const dynamic = "force-dynamic";

export default async function SiteNosotrosPage() {
    const data = await getSiteConfig<SiteConfigNosotros>("nosotros");
    return <SiteNosotrosForm data={data} />;
}
