/**
 * Migración Sheet → Firestore (Fase 1 del plan de absorción)
 *
 * Fuentes:
 *  - Google Sheet público `1ZWVllf4g9nsJP-H_Jkk0Fg0eQg7s_QnXR9iNZJGaMeA` (10 pestañas)
 *  - `scripts/migration/data-source-dump.ts` (si existe) — fichas ricas extraídas
 *    manualmente del `src/data/dataSourese.js` del repo origen (museoViajeroWeb2).
 *
 * Destino: Firestore del proyecto `museoviajero` — colecciones nuevas y extendidas.
 *
 * Idempotente: upsertea por slug/clave natural. Re-ejecutable sin duplicar.
 *
 * Uso:
 *   1) Exportar credenciales en .env.local:
 *      FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   2) `npm run migrate-sheet` (alias de tsx)
 *
 * Flags:
 *   --dry          No escribe a Firestore, solo loggea.
 *   --collection=X Limita a una colección (works|funciones|temas|videos|hero|salas|...).
 */

import admin from "firebase-admin";
import Papa from "papaparse";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { existsSync } from "node:fs";
import { slugify, ensureUniqueSlug } from "../src/lib/slugify";
import {
    parseSheetBool,
    parseSheetPrice,
    parseSheetHorarios,
    parseSheetDate,
} from "../src/lib/utils";

loadEnv({ path: ".env.local" });

const SHEET_ID = process.env.SHEET_ID || "1ZWVllf4g9nsJP-H_Jkk0Fg0eQg7s_QnXR9iNZJGaMeA";
const DRY = process.argv.includes("--dry");
const ONLY = process.argv.find(a => a.startsWith("--collection="))?.split("=")[1];

const GIDS = {
    obras: "0",
    cartelera: "393736360",
    salas: "129995417",
    prensa: "210931182",
    slider: "394605623",
    recursos: "1257531079",
    temas: "1888943415",
    videos: "1389993981",
    categoriasRecursos: "2079661031",
    calculator: "954763227",
} as const;

// ─────────────────────────────────────────────────────────────
// Firebase init
// ─────────────────────────────────────────────────────────────

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

const db = admin.firestore();

// ─────────────────────────────────────────────────────────────
// Sheet fetch
// ─────────────────────────────────────────────────────────────

async function fetchSheetCsv(gid: string): Promise<Record<string, string>[]> {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?gid=${gid}&format=csv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheet fetch failed (${gid}): ${res.status}`);
    const csv = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
    if (parsed.errors.length) {
        console.warn(`[${gid}] parse warnings:`, parsed.errors.slice(0, 3));
    }
    return parsed.data;
}

// ─────────────────────────────────────────────────────────────
// Slug management (idempotent — one slug per row)
// ─────────────────────────────────────────────────────────────

async function slugExistsInCollection(col: string, slug: string, excludeDocId?: string): Promise<boolean> {
    const snap = await db.collection(col).where("slug", "==", slug).limit(2).get();
    if (snap.empty) return false;
    if (!excludeDocId) return true;
    return snap.docs.some(d => d.id !== excludeDocId);
}

async function upsertBySlug(col: string, slug: string, data: Record<string, unknown>) {
    if (DRY) {
        console.log(`  [dry] upsert ${col}/${slug}`);
        return;
    }
    const existing = await db.collection(col).where("slug", "==", slug).limit(1).get();
    if (existing.empty) {
        await db.collection(col).add({ ...data, slug });
    } else {
        await existing.docs[0].ref.set({ ...data, slug }, { merge: true });
    }
}

// ─────────────────────────────────────────────────────────────
// DataSource dump (optional, enriches obras)
// ─────────────────────────────────────────────────────────────

type DataSourceObra = {
    ID: string;
    title: string;
    subTitle?: string;
    body?: string;
    tipoDeObra?: string;
    pie?: string;
    temaKey?: string;            // "revolucion", "belgrano", etc.
    imgPortadaName?: string;     // Nombre de archivo (ej: "aldeaPortada.webp")
    images?: { imgName: string; url: string }[];
    premios?: { premio: string }[];
    keywords?: string[];
};

async function loadDataSourceDump(): Promise<DataSourceObra[] | null> {
    const dumpPath = path.resolve("scripts/migration/data-source-dump.ts");
    if (!existsSync(dumpPath)) {
        console.log("[dataSource] dump no encontrado — se migra solo con metadata del Sheet.");
        return null;
    }
    const mod = await import(dumpPath);
    return (mod.dataSourceDump ?? mod.default ?? null) as DataSourceObra[] | null;
}

// ─────────────────────────────────────────────────────────────
// Collection migrators
// ─────────────────────────────────────────────────────────────

async function migrateTemas() {
    console.log("▸ temas_obras");
    const rows = await fetchSheetCsv(GIDS.temas);
    let order = 1;
    for (const row of rows) {
        const slug = (row.temaID || "").trim();
        if (!slug) continue;
        const data = {
            slug,
            title: row.temaTlite || row.temaID,
            urlDestino: row.urlDestino || undefined,
            order: order++,
            isActive: true,
        };
        await upsertBySlug("temas_obras", slug, data);
    }
    console.log(`  ${rows.length} temas`);
}

async function migrateSalas() {
    console.log("▸ venues (salas públicas)");
    const rows = await fetchSheetCsv(GIDS.salas);
    for (const row of rows) {
        const name = (row.nombreSala || "").trim();
        if (!name) continue;
        const slug = slugify(name);
        const data: Record<string, unknown> = {
            name,
            slug,
            addressLine: row.direccion || "",
            address: row.direccion || "",
            mapsUrl: row.link || undefined,
            defaultCapacity: parseInt(row.capacidad || "0", 10) || 0,
            isPublicVisible: true,
            isActive: true,
        };
        // Match by name if existing (extend dashboard venue), else create
        const existing = await db.collection("venues").where("name", "==", name).limit(1).get();
        if (DRY) {
            console.log(`  [dry] ${existing.empty ? "create" : "update"} venue ${name}`);
            continue;
        }
        if (existing.empty) {
            await db.collection("venues").add(data);
        } else {
            await existing.docs[0].ref.set(data, { merge: true });
        }
    }
    console.log(`  ${rows.length} salas`);
}

async function migrateObras(dump: DataSourceObra[] | null) {
    console.log("▸ works (obras)");
    const sheetRows = await fetchSheetCsv(GIDS.obras);
    const recursosRows = await fetchSheetCsv(GIDS.recursos);
    const videosRows = await fetchSheetCsv(GIDS.videos);

    // Derived indexes
    const ciclosByObra: Record<string, Record<string, boolean>> = {};
    for (const r of recursosRows) {
        const id = (r.obraID || "").trim();
        if (!id) continue;
        if (!ciclosByObra[id]) ciclosByObra[id] = {
            inicial: false, primerCiclo: false, segundoCiclo: false, tercerCiclo: false, secundario: false,
        };
        ciclosByObra[id] = {
            inicial: ciclosByObra[id].inicial || parseSheetBool(r.inicial),
            primerCiclo: ciclosByObra[id].primerCiclo || parseSheetBool(r.primerCiclo),
            segundoCiclo: ciclosByObra[id].segundoCiclo || parseSheetBool(r.segundoCiclo),
            tercerCiclo: ciclosByObra[id].tercerCiclo || parseSheetBool(r.tercerCiclo),
            secundario: ciclosByObra[id].secundario || parseSheetBool(r.secundario),
        };
    }

    const videosByObra: Record<string, { url: string; youtubeId: string }[]> = {};
    for (const v of videosRows) {
        const id = (v.ID || "").trim();
        if (!id || !v.youtubeUrl) continue;
        (videosByObra[id] ||= []).push({ url: v.youtubeUrl, youtubeId: v.youtubeID });
    }

    // Merge: all IDs present in sheet OR dump
    const allIds = new Set<string>();
    sheetRows.forEach(r => r.ID && allIds.add(r.ID.trim()));
    dump?.forEach(d => d.ID && allIds.add(d.ID.trim()));

    for (const id of allIds) {
        const sheetRow = sheetRows.find(r => (r.ID || "").trim() === id);
        const dumpRow = dump?.find(d => d.ID === id);
        const slug = slugify(id);
        const title = sheetRow?.title || dumpRow?.title || id;

        const data: Record<string, unknown> = {
            title,
            slug,
            isActive: true,
            isPublicVisible: true,
            dateModified: new Date().toISOString(),
        };

        // From sheet
        if (sheetRow) {
            data.estreno = parseSheetBool(sheetRow.estreno);
            data.estrenoText = sheetRow.estrenoText || undefined;
            if (sheetRow.anioDeEstren) data.anioEstreno = parseInt(sheetRow.anioDeEstren, 10) || null;
            if (sheetRow.mesDeEstreno) data.mesEstreno = parseInt(sheetRow.mesDeEstreno, 10) || null;
            if (sheetRow.diaDeEsterno) data.diaEstreno = parseInt(sheetRow.diaDeEsterno, 10) || null;
        }

        // Merge dump (rich content)
        if (dumpRow) {
            if (dumpRow.subTitle) data.subTitle = dumpRow.subTitle;
            if (dumpRow.body) data.body = dumpRow.body;
            if (dumpRow.tipoDeObra) data.tipoDeObra = dumpRow.tipoDeObra;
            if (dumpRow.pie) data.pie = dumpRow.pie;
            if (dumpRow.temaKey) data.temaSlug = dumpRow.temaKey;
            if (dumpRow.imgPortadaName) {
                // Convención MVP: archivos copiados a /public/images/obras/
                data.imgPortada = `/images/obras/${slug}-portada.webp`;
            }
            if (dumpRow.images?.length) {
                data.images = dumpRow.images.map((img, i) => ({
                    url: `/images/obras/${slug}-${String(i + 1).padStart(2, "0")}.webp`,
                    alt: `${title} — foto ${i + 1}`,
                    order: i,
                }));
            }
            if (dumpRow.premios?.length) {
                data.premios = dumpRow.premios.map(p => ({ texto: p.premio, anio: null }));
            }
            if (dumpRow.keywords?.length) data.keywords = dumpRow.keywords;
        }

        if (ciclosByObra[id]) data.ciclos = ciclosByObra[id];
        if (videosByObra[id]?.length) data.videos = videosByObra[id];

        // SEO defaults (si no vienen en dump)
        data.seo = {
            title: title.length > 60 ? title.slice(0, 57) + "..." : title,
            description: dumpRow?.subTitle || (typeof data.body === "string" ? data.body.replace(/<[^>]+>/g, "").slice(0, 155) : undefined),
            ogImage: data.imgPortada,
        };

        await upsertBySlug("works", slug, data);
    }
    console.log(`  ${allIds.size} obras`);
}

async function migrateFunciones() {
    console.log("▸ funciones_cartelera");
    const rows = await fetchSheetCsv(GIDS.cartelera);
    // Load venues to resolve sala name → slug
    const venuesSnap = await db.collection("venues").get();
    const venuesByName = new Map<string, string>();
    venuesSnap.forEach(d => {
        const data = d.data();
        if (data.name && data.slug) venuesByName.set(data.name.toLowerCase().trim(), data.slug);
    });

    let idx = 0;
    for (const row of rows) {
        const workSlug = slugify((row.ID || "").trim());
        if (!workSlug) continue;
        const salaName = (row.sala || "").trim().toLowerCase();
        const venueSlug = venuesByName.get(salaName);
        if (!venueSlug) {
            console.warn(`  ⚠ sala no resuelta: "${row.sala}" para ${workSlug}`);
        }

        const key = `${workSlug}_${salaName.replace(/\s+/g, "-")}_${row.fechaFuncion || idx}`;
        const id = slugify(key);
        idx++;

        const data: Record<string, unknown> = {
            workSlug,
            venueSlug: venueSlug || "",
            fechaInicio: parseSheetDate(row.fechaInicio) || "",
            fechaFin: parseSheetDate(row.fechaFin) || "",
            fechaFuncion: parseSheetDate(row.fechaFuncion) || "",
            siempreVisible: parseSheetBool(row.siempreVisible),
            agotada: parseSheetBool(row.agotada),
            horarios: parseSheetHorarios(row.hora),
            precio: parseSheetPrice(row.precio),
            isActive: true,
            dateModified: new Date().toISOString(),
        };
        if (row.promoName || row.promoDescription) {
            data.promo = { nombre: row.promoName || "", descripcion: row.promoDescription || "" };
        }

        if (DRY) {
            console.log(`  [dry] upsert funciones_cartelera/${id}`);
            continue;
        }
        await db.collection("funciones_cartelera").doc(id).set(data, { merge: true });
    }
    console.log(`  ${rows.length} funciones`);
}

async function migrateVideos() {
    console.log("▸ videos_obras");
    const rows = await fetchSheetCsv(GIDS.videos);
    for (const row of rows) {
        const workSlug = slugify((row.ID || "").trim());
        const youtubeId = (row.youtubeID || "").trim();
        if (!workSlug || !youtubeId) continue;
        const id = `${workSlug}_${youtubeId}`;
        const data = {
            workSlug,
            url: row.youtubeUrl || "",
            youtubeId,
            order: 0,
        };
        if (DRY) {
            console.log(`  [dry] upsert videos_obras/${id}`);
            continue;
        }
        await db.collection("videos_obras").doc(id).set(data, { merge: true });
    }
    console.log(`  ${rows.length} videos`);
}

async function migrateHeroSlides() {
    console.log("▸ hero_slides");
    const rows = await fetchSheetCsv(GIDS.slider);
    let order = 1;
    for (const row of rows) {
        const id = `slide-${order}`;
        const data: Record<string, unknown> = {
            order: parseInt(row.slide || String(order), 10) || order,
            visible: parseSheetBool(row.visible),
            small: row.small || undefined,
            titulo: row.tituloSlide || "",
            subTitulo: row.subTituloSlide || undefined,
            img: row.img || "",
            imgMobile: row.imgMobile || undefined,
            cta: row.cta || undefined,
            ctaPage: row.ctaPage || undefined,
            urlOutside: row.urlOutside || undefined,
            ctaDisplay: row.ctaDisplay || undefined,
            imgPosition: (["center", "top", "bottom"].includes(row.imgPosition) ? row.imgPosition : "center") as "center" | "top" | "bottom",
            estreno: parseSheetBool(row.estreno),
            estrenoText: row.estrenoText || undefined,
            isActive: true,
            dateModified: new Date().toISOString(),
        };
        if (DRY) {
            console.log(`  [dry] upsert hero_slides/${id}`);
        } else {
            await db.collection("hero_slides").doc(id).set(data, { merge: true });
        }
        order++;
    }
    console.log(`  ${rows.length} slides`);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
    console.log(`Migración Sheet → Firestore (Sheet: ${SHEET_ID})`);
    console.log(`Modo: ${DRY ? "DRY (sin escribir)" : "WRITE"}${ONLY ? ` — solo ${ONLY}` : ""}\n`);

    const dump = await loadDataSourceDump();

    const run = async (name: string, fn: () => Promise<void>) => {
        if (ONLY && ONLY !== name) return;
        try {
            await fn();
        } catch (e) {
            console.error(`✗ ${name} FAIL:`, e);
        }
    };

    // Order matters: temas and venues first (referenced by works and funciones)
    await run("temas", migrateTemas);
    await run("salas", migrateSalas);
    await run("works", () => migrateObras(dump));
    await run("funciones", migrateFunciones);
    await run("videos", migrateVideos);
    await run("hero", migrateHeroSlides);
    await run("prensa", migratePrensa);
    await run("materiales", migrateMateriales);

    // TODO: sponsors, cronologia, publicaciones desde dataSource dump (no vienen del Sheet)
    // TODO: site_config (contact, nosotros, social, stats, footer) desde dump + CMS

    console.log("\nDone.");
}

async function migratePrensa() {
    console.log("▸ prensa");
    const rows = await fetchSheetCsv(GIDS.prensa);
    for (const row of rows) {
        const title = (row.title || "").trim();
        if (!title) continue;
        const slug = slugify(`${title}-${row.medio || ""}`).slice(0, 100);
        const data: Record<string, unknown> = {
            slug,
            title,
            medio: row.medio || "",
            fecha: parseSheetDate(row.date) || "",
            autor: row.autor || undefined,
            url: row.url || "",
            destacadoSlider: parseSheetBool(row.slider),
            isActive: true,
            dateModified: new Date().toISOString(),
        };
        await upsertBySlug("prensa", slug, data);
    }
    console.log(`  ${rows.length} notas`);
}

async function migrateMateriales() {
    console.log("▸ materiales");
    const rows = await fetchSheetCsv(GIDS.recursos);
    for (const row of rows) {
        const title = (row.title || "").trim();
        if (!title) continue;
        const slug = slugify(`${row.obraID || ""}-${title}`).slice(0, 100);
        const workSlug = row.obraID ? slugify(row.obraID) : undefined;
        const data: Record<string, unknown> = {
            slug,
            workSlug,
            title,
            description: row.description || undefined,
            descargas: parseInt(row.descargas || "0", 10) || 0,
            tipo: row.tipo || "Actividad",
            ciclos: {
                inicial: parseSheetBool(row.inicial),
                primerCiclo: parseSheetBool(row.primerCiclo),
                segundoCiclo: parseSheetBool(row.segundoCiclo),
                tercerCiclo: parseSheetBool(row.tercerCiclo),
                secundario: parseSheetBool(row.secundario),
            },
            url: row.link || undefined,
            googleId: row.googleId || undefined,
            nivelAcceso: 1, // Default: Bronce — editable desde CMS
            isActive: true,
            dateModified: new Date().toISOString(),
        };
        await upsertBySlug("materiales", slug, data);
    }
    console.log(`  ${rows.length} materiales`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
