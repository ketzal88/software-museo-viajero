# HANDOFF — Absorción web pública elmuseoviajero.com.ar

**Branch**: `feat/absorcion-web-publica`
**Commits**: 3 (Fase 1, Fase 2-3, fixes de migración + seed)
**Estado**: código construido, tsc/lint/build verificados, datos migrados a Firestore, pushed a GitHub.

---

## ✅ Lo que YO hice (no requiere intervención tuya)

1. **Código completo** en la branch — Fases 1, 2, 3 del plan original ejecutadas.
2. **203 assets copiados** desde el repo origen (`public/images/obras/`, `public/images/hero/`, logos, favicon).
3. **Migración Sheet → Firestore ejecutada contra el proyecto `museoviajero`**:
   - 10 temas
   - 8 salas (mergeadas con venues del staff — campos operativos preservados)
   - 30 obras (extendidas con campos del sitio público — título/isActive/duration NO se pisaron)
   - 21 funciones de cartelera
   - 33 videos de YouTube
   - 7 hero slides
   - 48 notas de prensa
   - 7 materiales educativos
4. **Seed de site_config ejecutado**:
   - `site_config/contact` — email, teléfono, WhatsApp
   - `site_config/nosotros` — texto rico con fundadores y trayectoria
   - `site_config/social` — Instagram, YouTube, Facebook
   - `site_config/stats` — 4 números grandes
   - 9 sponsors
   - 3 publicaciones EUDEBA (2 tomos de Comedias + La pequeña aldea)
   - 6 entradas de cronología (1995, 1996, 2002, 2005, 2023, 2024)
5. **Push a GitHub** — Vercel debería estar construyendo preview ahora mismo.

---

## ⚠️ Lo que SÍ O SÍ tenés que hacer vos

### 1. Verificar el preview de Vercel y mirar el sitio

Vercel te creó un deploy preview de la branch `feat/absorcion-web-publica`. Abrí la URL (la vas a ver en GitHub en la pestaña del PR, o en el dashboard de Vercel).

**Checklist de páginas a mirar**:
- `/` — hero slider con 7 slides rotando + próximas funciones + obras destacadas + stats + sponsors.
- `/cartelera` — lista de 21 funciones con obra, sala, fecha, horarios, precio.
- `/repertorio` — 30 obras agrupadas por tema (revolución, belgrano, san martín, etc.).
- `/repertorio/aldea` (o cualquier slug) — ficha de obra.
- `/publicaciones` — 3 libros EUDEBA con covers.
- `/prensa` — 48 notas ordenadas por fecha.
- `/materiales` — 7 recursos (algunos marcados "nivel Bronce/Plata" si vas sin loguearte).
- `/nosotros` — texto rich + cronología.
- `/contacto` — email/tel/WhatsApp + form (probá enviar, debería guardar en `contact_leads`).
- `/ingresar` — signup con email o Google.
- `/perfil` — tu perfil tras loguearte.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` — deberían devolver contenido.
- `/panel` — dashboard interno (requiere que te logueés como staff en `/login`).
- `/cms` — desde el sidebar del dashboard.

### 2. Configurar `NEXT_PUBLIC_SITE_URL` en Vercel

En el dashboard de Vercel → Settings → Environment Variables, agregá:
```
NEXT_PUBLIC_SITE_URL = https://<tu-preview-url>.vercel.app
```
(o el dominio de producción cuando merge a main)

Sin esto, los JSON-LD y sitemap apuntan al default `https://elmuseoviajero.com.ar`.

### 3. Rotar el `firebase-service-account.json` filtrado

**No es urgente para probar el preview, pero es un riesgo de seguridad real mientras exista.** El archivo está en el repo público `ketzal88/museoViajeroWeb2`. Pasos:

1. Firebase Console → proyecto `museoviajero` → Settings → Service Accounts → **Generate new private key**.
2. Del JSON nuevo, copiar `client_email` y `private_key` a env vars de Vercel de **ambos proyectos**:
   - `software-museo-viajero` (destino): `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
   - `museo-viajero-web2` (origen, mientras siga vivo): mismas env vars
3. Redeploy los dos proyectos en Vercel.
4. Google Cloud IAM → encontrar la service account vieja → **eliminar la key vieja**.
5. En el repo `museoViajeroWeb2` eliminar el JSON y purgar del historial:
   ```bash
   cd /path/to/museoViajeroWeb2
   git filter-repo --path firebase-service-account.json --invert-paths
   git push --force origin main
   ```

### 4. Completar contenido faltante desde el CMS

La migración es minimal para las **obras** — solo metadata estructural del Sheet. El contenido rico (body HTML largo, imágenes, premios, keywords SEO) vive en `src/data/dataSourese.js` del origen y NO está migrado. Dos opciones:

**Opción A — Cargar manualmente por cada obra** (30 obras, ~10 min c/u):
1. Ir a `/cms/obras/<id>/editar` para cada una.
2. Copiar del archivo origen:
   - `body` → campo "Descripción (HTML)" del form
   - `subTitle` → "Subtítulo"
   - `tipoDeObra`, `pie`
   - `imgPortada` → `/images/obras/<slug>Portada.webp` (los archivos ya están en public/)
   - `premios[].premio` → ir creando uno por uno
   - `keywords[]` → array SEO
3. Guardar.

**Opción B — Scriptearlo** (más trabajo ahora, menos después):
- Generar `scripts/migration/data-source-dump.ts` exportando `dataSourceDump: DataSourceObra[]` con las 30 obras extraídas. El formato está en el script `migrate-sheet-to-firestore.ts` (interface `DataSourceObra`).
- Re-ejecutar `npm run migrate-sheet` — detecta el dump y enriquece todas las obras automáticamente.

### 5. Si querés publicar a producción

Cuando el preview esté OK:
1. Desde GitHub abrir el PR `feat/absorcion-web-publica` → `main`.
2. Merge (recomiendo squash).
3. Vercel hace deploy a producción automáticamente.
4. Verificar el sitemap y los Rich Results en Google Search Console.

---

## 🔧 Decisiones arquitectónicas importantes tomadas

- **`/` es la Home pública** (antes era el dashboard). Dashboard home movido a `/panel`.
- **Mismo Firebase `museoviajero`** para staff y público. Diferencia por rol y nivel (users/{uid} en Firestore).
- **Niveles 0/1/2/3/9** mantenidos (free/bronce/plata/oro/admin). No los redesigné — tu pedido.
- **Auth separada**: `/login` para staff (cookie `session`), `/ingresar` para público (cookie `public_session_token` httpOnly). Un mismo Firebase Auth pero sesiones separadas.
- **Paywall de materiales** via filtro por nivel en el render (no HTTP-level). Un user con Level 0 ve los títulos pero los de nivel >0 tienen botón "Nivel Bronce" locked en vez de "Descargar".
- **SEO/GEO transversal**: SSR por default, JSON-LD en todas las páginas (Organization, TheaterEvent, CreativeWork, BreadcrumbList, FAQPage, AboutPage, ContactPage, CollectionPage, Book), sitemap dinámico, robots permisivo con crawlers IA, llms.txt dedicado con descripción semántica de la compañía.

---

## 📁 Nuevos archivos importantes

| Path | Qué hace |
|---|---|
| `.planning/sheet-mapping.md` | Doc técnico del mapping Sheet → Firestore |
| `.planning/fase-1-next-steps.md` | Pasos de Fase 1 (superseded por este HANDOFF) |
| `scripts/migrate-sheet-to-firestore.ts` | Script idempotente de migración |
| `scripts/seed-site-config.ts` | Seed inicial de site_config, sponsors, publicaciones, cronologia |
| `scripts/copy-public-assets.sh` | Copia assets del repo origen |
| `src/lib/schema.ts` | Helpers JSON-LD (SEO + GEO) |
| `src/lib/sanitize.ts` | DOMPurify isomorphic |
| `src/lib/slugify.ts` | Slug único con resolución de colisiones |
| `src/lib/rawHtml.ts` | Helper para inyectar HTML sanitizado |
| `src/features/public/*` | Componentes del sitio público |
| `src/features/cms/*` | Forms del CMS |
| `src/app/(public)/*` | 8 rutas públicas (home, cartelera, repertorio, obras, nosotros, contacto, ingresar, perfil, publicaciones, prensa, materiales) + sitemap + robots + llms.txt |
| `src/app/(dashboard)/cms/*` | CMS: obras, cartelera, materiales, prensa, publicaciones, hero, usuarios, site |

## 📦 Nuevas colecciones Firestore

`funciones_cartelera`, `temas_obras`, `videos_obras`, `hero_slides`, `site_config` (doc-based), `cronologia`, `sponsors`, `prensa`, `materiales`, `publicaciones`, `users` (de auth público), `contact_leads`.

## 📦 npm scripts nuevos

```bash
npm run migrate-sheet        # Migrar el Sheet a Firestore (idempotente)
npm run migrate-sheet:dry    # Dry run (no escribe)
npm run seed-site-config     # Seed inicial de site_config / sponsors / publicaciones / cronologia
```

---

## 🚫 Lo que NO hice (para otra iteración)

- Páginas `/crucigrama`, `/diario-de-marcha`, `/calculador-de-funcion` del origen (interactivos, no críticos).
- CMS dedicado para temas, stats, social, cronología, sponsors — podés editarlos directo en Firestore o crear formularios usando el patrón de `PrensaForm` / `SimpleList`.
- Firebase Storage integration en `/cms/materiales` (upload de archivos) — por ahora solo URL externa manual.
- Data-source-dump de obras — ver opción B de punto 4.
- Rotación del service account — punto 3, pendiente tuyo.

Todo lo demás del plan original está hecho. ¡Suerte con el preview!
