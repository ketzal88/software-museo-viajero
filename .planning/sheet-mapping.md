# Sheet Mapping — Origen `museoViajeroWeb2` → Destino `software-museo-viajero`

> Doc técnico de la migración Sheet → Firestore (Sub-fase 1a de Fase 1).
> Único source of truth para los esquemas nuevos, transformaciones, merges entre Sheet y `dataSourese.js`, y convenciones de slugs.
> Cualquier cambio de columnas en el Sheet actual debe reflejarse acá antes de tocar código.

## Fuentes

1. **Google Sheet público** — `1ZWVllf4g9nsJP-H_Jkk0Fg0eQg7s_QnXR9iNZJGaMeA` — 10 pestañas, lectura CSV anónima.
2. **`src/data/dataSourese.js`** en el repo origen — 2344+ líneas hardcodeadas con fichas de obras, cronología, nosotros, sponsors. Se mergea con el Sheet en runtime via `combinarArrays(sheet, dataSource)` por campo `ID`.

## Pestañas del Sheet (10) + rol

| GID | Nombre DataContext | Filas | Rol | Colección Firestore destino |
|---|---|---|---|---|
| 0 | obras | 29 | Catálogo maestro de obras (metadata estructurada) | **extender `works`** |
| 393736360 | cartelera | 20 | Funciones públicas programadas (fechas/salas/precios) | **nueva `funciones_cartelera`** |
| 129995417 | salasDB | 7 | Teatros (venues públicos) | **extender `venues`** |
| 210931182 | prensa | 47 | Notas de prensa | **nueva `prensa`** (Fase 2) |
| 394605623 | slider | 6 | Hero slider Home | **nueva `hero_slides`** |
| 1257531079 | recursos | 6 | Materiales educativos (Sheet + Firebase Storage) | **nueva `materiales`** (Fase 2) |
| 1888943415 | temas | 9 | Taxonomía temática (Revolución, Belgrano, San Martín, etc.) | **nueva `temas_obras`** |
| 1389993981 | videos | 32 | Videos YouTube por obra | **nueva `videos_obras`** |
| 2079661031 | categoriasRecursos | 12 | Taxonomía plana de recursos | **nueva `categorias_recursos`** (Fase 2) |
| 954763227 | calculator | 3 | Reglas del calculador de presupuesto | **nueva `calculator_rules`** (Fase 2) |

## Contenido hardcoded en `dataSourese.js`

Vive en código, no en el Sheet. Se migra una única vez:

| Constante | Líneas | Destino |
|---|---|---|
| `contactData` (email, phones, whatsApp) | 200–205 | `site_config/contact` (doc único) |
| `temasObras` (mapping slug→display) | 207–218 | Se mergea con pestaña `temas` del Sheet en `temas_obras` |
| `temasObrasArray` (orden + display) | 220–231 | ídem — `orden` va al campo `order` de `temas_obras` |
| `ciclos` | 233–239 | Constante en `src/lib/constants.ts` (no es contenido editorial) |
| `publicaciones.obrasIncluidas0X` | 241–245 | `publicaciones` (Fase 2) |
| `sponsors` | 247–258 | Colección `sponsors` |
| `paths` | 259–275 | Se vuelven rutas reales del App Router del grupo `(public)`. No se migra. |
| `socialMedia` | 276–293 | `site_config/social` |
| `navBarNavigation` | 294–331 | Se genera desde `NAV_LINKS_PUBLIC` en `constants.ts`. No se migra. |
| `nosotrosData` (HTML rico, fundadores, trayectoria) | 333–364 | `site_config/nosotros` (body HTML) |
| `cronologia` (timeline 1995→hoy) | 366–573 | Colección `cronologia` (1 doc por año con `yearEvents[]`) |
| `dataSource` (ARRAY DE 29 OBRAS con fichas completas) | 574–2262 | **Mergea con `obras` del Sheet → se carga a `works` extendida** |
| `stats` | 2263–2325 | `site_config/stats` |
| `footerData` | 2326–fin | `site_config/footer` |

El `dataSource` es **la fuente más rica** — contiene por cada obra: `body` (descripción HTML larga), `subTitle`, `tipoDeObra`, `pie`, `images[]` (10 fotos c/u), `premios[]`, `keywords[]` (SEO/GEO pre-pensadas), `temaObra`, `imgPortada`. El Sheet solo aporta `estreno`, `estrenoText`, `anioDeEstren`. **Al mergear, la obra final tiene el superset**.

---

## Esquemas Firestore finales

### 1. `works` (extender existente)

Se agregan campos opcionales. Campos actuales (`id, title, slug?, description?, duration?, tags?, audienceTags?, isActive?`) se mantienen. Añadido:

```ts
interface Work {
  // existentes
  id: string;
  title: string;
  slug?: string;
  description?: string;
  duration?: number;
  tags?: string[];
  audienceTags?: string[];
  isActive?: boolean;
  // NUEVOS — sitio público
  subTitle?: string;
  body?: string;             // HTML largo sanitizado
  tipoDeObra?: string;       // "Comedia musical", "Comedia histórica", etc.
  pie?: string;              // nota al pie editorial
  temaSlug?: string;         // FK a temas_obras.slug
  imgPortada?: string;       // URL (Firebase Storage o /images/obras/)
  images?: { url: string; alt: string; order: number }[];
  premios?: { texto: string; anio?: number }[];
  keywords?: string[];       // Ya vienen pensadas para SEO/GEO
  estreno?: boolean;
  estrenoText?: string;      // "23 de octubre<br/>Estreno"
  anioEstreno?: number;
  mesEstreno?: number;
  diaEstreno?: number;
  ciclos?: {                 // De recursos — por qué ciclo educativo aplica
    inicial: boolean;
    primerCiclo: boolean;
    segundoCiclo: boolean;
    tercerCiclo: boolean;
    secundario: boolean;
  };
  videos?: { url: string; youtubeId: string }[];
  seo?: {
    title?: string;          // Si vacío → usar `title`
    description?: string;    // Si vacío → usar 155 chars de `body` plain
    ogImage?: string;        // Si vacío → `imgPortada`
  };
  isPublicVisible?: boolean; // Para ocultar de repertorio sin borrar
  dateModified?: string;     // ISO — para freshness signal
}
```

**Transformaciones al migrar**:
- `ID` (Sheet `obras.ID`) → `slug` (si ya no existe; el `id` de Firestore se autogenera).
- `dataSource.body` → sanitizar con DOMPurify + guardar como string (mantiene `<br/>`, `<b>`, `<strong>`, `<ul>`, `<li>`).
- `imgPortada` y `images[].url` hoy son imports JS de `.webp`. En la migración hay dos caminos:
  - **MVP Fase 1**: copiar los `.webp` del origen a `public/images/obras/` del destino con nombres slug-based (`el-arbolito-frente-al-cabildo-01.webp`) y guardar la ruta relativa.
  - **Fase 4/5**: mover a Firebase Storage con URLs firmadas.
- `temaObra: temasObras.revolucion` → `temaSlug: 'revolucion'` (string key del mapping).
- `premios: [{ premio: "..." }]` → `premios: [{ texto: "...", anio: null }]`.
- `startDate` (creado via `createStartDate()`) → no migrar; es artefacto del código viejo.
- `ciclos` se deriva desde pestaña `recursos` del Sheet (bools TRUE/FALSE → bool reales).

### 2. `funciones_cartelera` (nueva)

```ts
interface FuncionCartelera {
  id: string;
  workSlug: string;            // FK a works.slug
  venueSlug: string;           // FK a venues.slug
  fechaInicio: string;         // ISO Date (desde "D/MM/YY")
  fechaFin: string;            // ISO Date
  fechaFuncion: string;        // ISO Date — día específico de la función
  siempreVisible: boolean;     // "si" / "no" → bool
  agotada: boolean;            // "si" / "no" → bool
  horarios: string[];          // ["09:00", "10:30", "14:00"] — parseado del CSV embebido
  precio: number;              // 12000 — desde "12.000"
  promo?: {
    nombre: string;
    descripcion: string;
  };
  isActive: boolean;           // Para fecha pasada sin siempreVisible
  dateModified: string;
}
```

**Transformaciones**:
- `sala` (nombre textual en Sheet) → lookup en `venues` por `name`, resolver `venueSlug`.
- `hora: "9, 10.30, 14"` → split(",").map(trim).map(normalizar "9"→"09:00", "10.30"→"10:30").
- `precio: "12.000"` → parseInt sin puntos.
- `fechaInicio: "17/02/26"` → "2026-02-17". Si año es 2 dígitos, asumir 20XX.

### 3. `venues` (extender existente)

Campos actuales (`id, name, slug, address, addressLine, mapsUrl, defaultCapacity, contactName?, phone?, notes?, defaultSlotTemplate?, isActive?`). La pestaña `salasDB` aporta salas del sitio público que pueden o no estar ya en el dashboard.

**Transformaciones**:
- Por cada fila de `salasDB`, buscar `venue` existente por `name`. Si existe, agregar (si faltan) `mapsUrl` y `capacidad`. Si no existe, crear nuevo con `{ name, addressLine: direccion, mapsUrl: link, defaultCapacity: capacidad, isActive: true, isPublicVisible: true }`.
- Nuevos campos a agregar a `Venue`: `isPublicVisible?: boolean` (para mostrar/ocultar del sitio público), `seo?: { title?, description?, ogImage? }`.

### 4. `temas_obras` (nueva)

```ts
interface TemaObra {
  id: string;
  slug: string;                // "revolucion", "belgrano", "sanMartin"
  title: string;               // "Para la revolución de mayo y el 25 de mayo"
  urlDestino?: string;         // Opcional, del Sheet (deprecar en favor de slug)
  order: number;               // Del `temasObrasArray.orden`
  seo?: { title?: string; description?: string; ogImage?: string };
  isActive: boolean;
}
```

**Transformaciones**:
- Merge: pestaña `temas` del Sheet (`temaID, temaTlite, urlDestino`) + `temasObrasArray` del JS (orden + display oficial). El JS manda para `title` si ambos existen. Si una fuente tiene un tema que la otra no, se incluye igual.
- Typo `temaTlite` → `title`.

### 5. `videos_obras` (nueva)

```ts
interface VideoObra {
  id: string;
  workSlug: string;            // FK
  url: string;                 // YouTube URL completa
  youtubeId: string;
  order: number;               // Si hay más de uno por obra
}
```

**Transformaciones**:
- `ID` (Sheet) → `workSlug`.
- Si hay duplicados por `(workSlug, youtubeId)`, dedup.

### 6. `hero_slides` (nueva)

```ts
interface HeroSlide {
  id: string;
  order: number;               // Del campo `slide`
  visible: boolean;            // "si"/"no"
  small?: string;              // Eyebrow / categoría ("Comedia musical")
  titulo: string;              // Puede contener HTML
  subTitulo?: string;          // HTML: <b>, <br/>
  img: string;                 // URL Cloudinary o local
  imgMobile?: string;
  cta?: string;                // Texto del botón
  ctaPage?: string;            // Slug interno destino (ej: "obligada")
  urlOutside?: string;         // URL externa
  ctaDisplay: string;          // Texto alternativo
  imgPosition: 'center' | 'top' | 'bottom';
  estreno: boolean;
  estrenoText?: string;        // HTML corto
  isActive: boolean;
  dateModified: string;
}
```

**Transformaciones**:
- `googleId: "#VALUE!"` → **ignorar campo** (error de fórmula en Sheet). Si en el futuro se quiere usar Drive, se manejará aparte.
- `visible: "si"/"no"` → bool.
- HTML en `subTitulo` se sanitiza con DOMPurify al guardar.

### 7. `site_config` (nueva — doc-based)

Colección con docs de ID conocido:

- **`site_config/contact`**: `{ email, phone, celPhone, whatsApp }`
- **`site_config/nosotros`**: `{ title, body: string (HTML sanitizado), dateModified, seo: {} }`
- **`site_config/social`**: `{ links: [{ icon, url, label }] }`
- **`site_config/stats`**: `{ items: [{ label, value, suffix? }] }`
- **`site_config/footer`**: `{ columns: [...], legal, social }`

### 8. `cronologia` (nueva)

```ts
interface CronologiaItem {
  id: string;
  year: number;
  events: string[];            // Array de bullets HTML
  order: number;               // año para sort DESC
}
```

### 9. `sponsors` (nueva)

```ts
interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;             // URL local `/images/sponsors/` o Storage
  url?: string;                // Link externo
  order: number;
  isActive: boolean;
}
```

### 10–13. Pospuestas a Fase 2

- `prensa` — notas de prensa
- `materiales` — recursos educativos (relación con Firebase Storage existente)
- `categorias_recursos` — taxonomía plana
- `calculator_rules` — reglas del calculador de presupuesto
- `publicaciones` — libros EUDEBA (hardcoded; solo 3 registros; se puede migrar junto con F1 si es trivial, decidir al llegar)

---

## Reglas de transformación transversales

### Slug único (stable ID)

- Por cada entidad que tenga `slug`, garantizar unicidad con query Firestore antes de insert. Si colisiona, append `-2`, `-3`, etc.
- Helper `src/lib/slugify.ts` — mapea acentos, elimina puntuación, lowercase, reemplaza espacios por `-`. Ejemplo: `"El arbolito frente al Cabildo"` → `"el-arbolito-frente-al-cabildo"`.
- Los `ID` del Sheet (ya son slug-like: "obligada", "aldea", "sanMartin") se **respetan tal cual** si son válidos. Si hay camelCase como "sanMartin" → normalizar a kebab-case "san-martin" para consistencia URL.

### Fechas

- Formato Sheet: `D/MM/YY` (ej: "17/02/26") o `D/MM/YYYY` (ej: "20/02/2024").
- Parser: intentar 4 dígitos, sino 2 → prefix "20".
- Salida: ISO 8601 `YYYY-MM-DD` (solo fecha, sin hora).
- Timezone: asumir America/Argentina/Buenos_Aires para la función (`fechaFuncion`), UTC para timestamps.

### HTML embebido

- Cualquier celda con `<br/>`, `<b>`, `<strong>`, `<ul>`, `<li>`, `<h3>` → pasar por `DOMPurify` antes de persistir y renderizar con helper `<SanitizedHtml html={...}>` (wrapper isomorphic).
- Tags permitidos: `b, strong, em, i, u, br, p, h1-h6, ul, ol, li, a (con rel="noopener noreferrer" forzado), blockquote, span`. Prohibidos: `script, iframe, object, embed, on*` attributes.

### Booleans

- `"si"`, `"Si"`, `"SI"`, `"TRUE"`, `"true"` → `true`.
- `"no"`, `"No"`, `"NO"`, `"FALSE"`, `"false"`, vacío → `false`.

### Precios

- `" $1.500.000"` → `1500000`.
- `"12.000"` → `12000`.
- Siempre `number`, moneda implícita ARS.

### Porcentajes

- `"10,00%"` → `0.10` (fraction para math) Y `10` (int para display en UI).

### Referencias cruzadas

- `cartelera.sala` (nombre textual) → `venues.slug` vía lookup exacto por `name`. Si no matchea, log warning y crear venue nuevo con `isPublicVisible=true`.
- `videos.ID` → `works.slug`. Si no matchea → log warning y skip.
- `recursos.obraID` → `works.slug`.
- `dataSource[].temaObra` (es referencia objeto `temasObras.revolucion`) → `temaSlug: 'revolucion'` (la key del mapping).

### Merge Sheet ↔ dataSource

Para **obras**:
1. Base: fila del Sheet `obras` (metadata estructurada: estreno, anioDeEstren).
2. Enriquecer con entry de `dataSource` que matchee por `ID`. Copiar: `title, subTitle, body, tipoDeObra, pie, imgPortada, images, premios, keywords, temaObra→temaSlug`.
3. Derivar `ciclos` desde `recursos` del Sheet (flags por `obraID`).
4. Derivar `videos` desde pestaña `videos` del Sheet por `ID`.
5. Si la obra está solo en el Sheet pero no en `dataSource` → migrar solo con la metadata del Sheet y log warning.
6. Si está solo en `dataSource` pero no en el Sheet → migrar con `estreno=false, anioEstreno=null`.

---

## Colecciones nuevas a agregar a `COLLECTIONS` en `src/types/index.ts`

```ts
export const COLLECTIONS = {
  // ... existentes
  FUNCIONES_CARTELERA: 'funciones_cartelera',
  TEMAS_OBRAS: 'temas_obras',
  VIDEOS_OBRAS: 'videos_obras',
  HERO_SLIDES: 'hero_slides',
  SITE_CONFIG: 'site_config',
  CRONOLOGIA: 'cronologia',
  SPONSORS: 'sponsors',
  // Fase 2:
  // PRENSA, MATERIALES, CATEGORIAS_RECURSOS, CALCULATOR_RULES, PUBLICACIONES
} as const;
```

---

## Cobertura para el MVP (5 páginas Fase 1)

| Ruta | Lee de | Requiere |
|---|---|---|
| `/` | `hero_slides` + `funciones_cartelera` (upcoming) + `works` (destacadas) + `site_config/stats` + `sponsors` | hero_slides, works, funciones_cartelera, sponsors |
| `/cartelera` | `funciones_cartelera` (filtradas por fecha) + `venues` + `works` | funciones_cartelera, works, venues |
| `/repertorio` | `works` (isPublicVisible=true) + `temas_obras` para agrupar | works, temas_obras |
| `/repertorio/[slug]` | `works` por slug + `videos_obras` | works, videos_obras |
| `/nosotros` | `site_config/nosotros` + `cronologia` | site_config, cronologia |
| `/contacto` | `site_config/contact` + `site_config/social` | site_config |

8 colecciones para el MVP: `works` (extendida), `venues` (extendida), `funciones_cartelera`, `temas_obras`, `videos_obras`, `hero_slides`, `site_config`, `cronologia`, `sponsors`.

---

## Assets (imágenes)

- **MVP**: copiar desde `museoViajeroWeb2/src/assets/images/` a `software-museo-viajero/public/images/obras/` con nombres slug-based.
- Cada obra del `dataSource` tiene entre 2 y 13 fotos → ~200 archivos `.webp`, probablemente 30–50 MB total.
- Logos SVG y favicon → `public/` raíz.
- Lottie/PDFs → dejar por ahora, se deciden al portar sus páginas (Fase 2).
- **Fase 4/5**: mover a Firebase Storage con URLs via `next/image` + `remotePatterns`.

---

## Riesgos del mapping

1. **Nombres de sala inconsistentes**: `cartelera.sala` es texto libre ("El Tinglado", "Museo Histórico Sarmiento"). Un typo rompe la FK. Mitigación: tolerar case-insensitive + log de warnings durante migración.
2. **Obras solo en `dataSource` no en Sheet**: detectar y migrar. Mitigación: pasarlas todas, marcar `isPublicVisible=true` por default.
3. **Fechas con formato mixto**: `"24/05/23"` vs `"20/02/2024"`. Mitigación: parser tolerante.
4. **`#VALUE!` en slider.googleId**: skippear campo. No afecta nada.
5. **HTML en celdas del Sheet**: depende de DOMPurify isomorphic — agregar dep `isomorphic-dompurify`.
6. **dataSource usa imports JS de imágenes**: no podemos ejecutar ese JS desde TS/Node de destino directamente. Mitigación: en el script de migración, tener un diccionario hardcodeado `dataSourceDump.ts` con el contenido extraído (se hace manualmente una vez) o parsear el JS con un parser ad-hoc. **Recomendado**: copiar el contenido relevante a un JSON plano `scripts/migration/data-source-dump.json` antes de correr la migración. Una vez.
