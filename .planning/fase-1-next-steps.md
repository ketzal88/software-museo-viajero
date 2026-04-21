# Fase 1 — Pasos pendientes para poner el sitio en producción

Estado al cerrar Fase 1 (código):
- ✓ Tipos, schemas Zod, helpers (slugify, parsers, sanitize).
- ✓ 30+ server actions nuevas para CRUD público + CMS.
- ✓ Script idempotente de migración Sheet → Firestore (`scripts/migrate-sheet-to-firestore.ts`).
- ✓ 5 páginas públicas SSR con SEO/GEO completo (JSON-LD, sitemap dinámico, robots, llms.txt).
- ✓ CMS mínimo viable: Obras, Cartelera (CRUD), Site config (Nosotros + Contacto).
- ✓ Middleware que separa rutas públicas y protegidas.
- ✓ Dashboard home movido a `/panel`. `/` es ahora la Home pública.
- ✓ `npx tsc --noEmit` limpio.
- ✓ `npx next lint` limpio.
- ✓ `npx next build` compila 38 rutas.

Lo que falta (no-código) para que el sitio tenga contenido real:

## 1. Copiar assets del repo origen

Hay ~200 imágenes `.webp` (portadas y fotos de obras), SVGs, logos, hero slider.

```bash
bash scripts/copy-public-assets.sh
# o con ruta explícita:
bash scripts/copy-public-assets.sh /c/Users/gabri/Documents/Worker/Webs/museoViajeroWeb2
```

Los archivos quedan en `public/images/obras/`, `public/images/hero/`, `public/images/sponsors/`, y `public/favicon.svg|ico`.

## 2. (Opcional) Generar data-source-dump para enriquecer obras

El script de migración lee de 10 pestañas del Sheet, pero el contenido rico de las fichas (body HTML, premios, keywords SEO) vive en `src/data/dataSourese.js` del origen. Para importarlo:

**Opción A — saltar por ahora**: las obras se migran con solo metadata (título, slug, estreno, etc.). El body, images y premios se cargan manualmente desde `/cms/obras/[id]/editar` copiando del `dataSourese.js`.

**Opción B — extraer el dump**: crear `scripts/migration/data-source-dump.ts` exportando un array `dataSourceDump` con el contenido de cada obra (ver interface `DataSourceObra` en `scripts/migrate-sheet-to-firestore.ts`). El script de migración lo detecta y mergea automáticamente. Requiere una extracción manual de 1700 líneas del archivo origen.

Recomendado: A para arrancar, B cuando sea prioridad.

## 3. Configurar `.env.local` (si no está)

Verificar que el destino tenga:
```
FIREBASE_PROJECT_ID=museoviajero
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-XXXXX@museoviajero.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII..."

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=museoviajero.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=museoviajero
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_SITE_URL=https://elmuseoviajero.com.ar
# Opcional, para el Sheet (ya hardcodeado por default):
# SHEET_ID=1ZWVllf4g9nsJP-H_Jkk0Fg0eQg7s_QnXR9iNZJGaMeA
```

## 4. Correr la migración

```bash
# Primero en modo dry (no escribe, solo logs):
npm run migrate-sheet:dry

# Si se ve bien:
npm run migrate-sheet
```

Se pobla:
- `works` (obras del Sheet + dump si hay)
- `venues` (salas del Sheet, mergea con existentes)
- `funciones_cartelera` (funciones activas)
- `temas_obras`, `videos_obras`, `hero_slides`

Las colecciones de Fase 2 (prensa, recursos, categoriasRecursos, calculator) están marcadas como TODO en el script.

## 5. Completar site_config desde el CMS

Hay contenido que vive en `dataSourese.js` (hardcoded) que el script NO migra automáticamente y hay que cargar una vez desde el CMS:

- `/cms/site/nosotros` — copiar el HTML de `nosotrosData.body` del origen.
- `/cms/site/contact` — completar email, teléfono, WhatsApp.
- `/cms/site/stats` (pendiente — agregar formulario similar cuando se quiera).
- `/cms/site/social` (pendiente).

Todos estos alimentan la Home, Nosotros, Contacto, Footer.

## 6. Correr el dev server y verificar

```bash
npm run dev
# Abrir http://localhost:3000/
```

Checklist:
- `/` Home con hero, próximas funciones, obras destacadas.
- `/cartelera` lista de funciones.
- `/repertorio` obras agrupadas por tema.
- `/repertorio/obligada` ficha individual (si la obra se migró).
- `/nosotros` texto rico si se completó el CMS.
- `/contacto` formulario + info.
- `/sitemap.xml` lista de URLs.
- `/robots.txt` allow crawlers de IA.
- `/llms.txt` descripción para LLMs.
- `/login` → post-login → `/panel` (dashboard home).
- `/cms` → navegación al CMS.

## 7. Validar SEO/GEO

- Abrir "View source" en `/cartelera` → ver `<script type="application/ld+json">` con `TheaterEvent`.
- Pegar `/repertorio/obligada` en [Google Rich Results Test](https://search.google.com/test/rich-results).
- Correr Lighthouse (DevTools) en mobile → SEO ≥ 90, Performance ≥ 85.
- Probar en ChatGPT / Perplexity: "¿Qué obras tiene El Museo Viajero?" → debería citar la URL correcta.

## 8. Deploy

Cuando el sitio esté funcionando local:
- Push a branch (NO main hasta aprobar).
- Vercel preview → validar otra vez.
- Configurar env vars en Vercel (las mismas de `.env.local` + `NEXT_PUBLIC_SITE_URL` con el dominio preview/prod).
- Merge → deploy a prod.

## Deuda conocida (Fase 2+)

- CMS completo para: Hero slides, Temas, Videos, Stats, Social, Footer, Cronología, Sponsors.
- Páginas públicas restantes: Publicaciones, Prensa, Materiales, DiarioDeMarcha, Crucigrama, CalculadorDeFuncion, Perfil.
- Sistema de login público y tiers de suscripción (mantener 0/1/2/3/9).
- Admin de usuarios + admin de materiales del origen → consolidar en dashboard (Fase 3).
- Rotar `firebase-service-account.json` filtrado (Fase 0 postergada por pedido).
