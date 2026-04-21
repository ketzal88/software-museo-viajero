import { getSiteConfig } from "@/lib/actions";
import { SiteContactForm } from "@/features/cms/SiteContactForm";
import type { SiteConfigContact } from "@/types";

export const dynamic = "force-dynamic";

export default async function SiteContactPage() {
    const data = await getSiteConfig<SiteConfigContact>("contact");
    return <SiteContactForm data={data} />;
}
