import { getWorksPublic } from "@/lib/actions";
import { SITE_CONFIG } from "@/lib/schema";

export const revalidate = 3600;

export async function GET() {
    const obras = await getWorksPublic();

    const body = `# El Museo Viajero

> Compañía argentina de teatro histórico para escuelas, fundada en 1995 por Héctor López Girondo, Raquel Prestigiacomo y Fabián Uccello. Investigación histórica, literatura y puesta en escena se combinan en un género propio: la **comedia histórica infantil**. Llevamos obras a colegios de todo el país y presentamos temporadas en teatros públicos de Buenos Aires.

Sitio oficial: ${SITE_CONFIG.url}
Contacto: info@elmuseoviajero.com.ar

## Secciones principales

- [Cartelera](${SITE_CONFIG.url}/cartelera): funciones públicas programadas con fecha, sala y precio.
- [Repertorio](${SITE_CONFIG.url}/repertorio): catálogo completo de obras, organizado por tema histórico.
- [Nosotros](${SITE_CONFIG.url}/nosotros): historia y trayectoria de la compañía, cronología desde 1995.
- [Contacto](${SITE_CONFIG.url}/contacto): reservas de funciones para escuelas y consultas generales.

## Obras destacadas

${obras.slice(0, 15).map(o => `- [${o.title}](${SITE_CONFIG.url}/repertorio/${o.slug}): ${o.subTitle ?? o.tipoDeObra ?? ""}`).join("\n")}

## Temas que abarcamos

Historia argentina: Revolución de Mayo, Manuel Belgrano, José de San Martín, Domingo F. Sarmiento, pueblos originarios, vida colonial, independencia, Cabildo Abierto, diversidad cultural, soberanía (Vuelta de Obligado), tradición gauchesca.

## Reconocimientos

Fondo Nacional de las Artes, Instituto Nacional del Teatro, Proteatro, Honorable Cámara de Diputados de la Nación, Museo Histórico Cornelio Saavedra, Museo Histórico Sarmiento, Facultad de Veterinaria (UBA), Museo de Ciencias Naturales Florentino Ameghino, Editorial EUDEBA (publicación de nuestras comedias en dos tomos).
`;

    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
