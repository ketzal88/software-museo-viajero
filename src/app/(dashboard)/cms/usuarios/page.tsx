import { listPublicUsers } from "@/lib/actions";
import { UsuariosList } from "@/features/cms/UsuariosList";
import { SimpleCmsHeader } from "@/features/cms/SimpleList";

export const dynamic = "force-dynamic";

export default async function CmsUsuariosPage() {
    const users = await listPublicUsers();
    return (
        <div className="flex flex-col gap-6">
            <SimpleCmsHeader
                eyebrow="CMS · Administración"
                title="Usuarios del sitio"
                subtitle={`${users.length} cuentas públicas registradas. Cambiá el nivel o eliminá desde acá.`}
            />
            <UsuariosList users={users} />
        </div>
    );
}
