/**
 * Seed Firestore for Museo Viajero
 * Loads: seasons, works, venues, seasonWorks
 */

import admin from "firebase-admin";

const PROJECT_ID = "software-museo-viajero";

if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (privateKey && clientEmail) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: PROJECT_ID,
                clientEmail,
                privateKey,
            }),
            projectId: PROJECT_ID,
        });
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: PROJECT_ID,
        });
    }
}

const db = admin.firestore();

function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function uniqBy<T>(arr: T[], keyFn: (x: T) => string): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of arr) {
        const k = keyFn(item);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(item);
    }
    return out;
}

async function upsertMany(col: string, docs: any[]) {
    const batchSize = 400;
    for (let i = 0; i < docs.length; i += batchSize) {
        const slice = docs.slice(i, i + batchSize);
        const batch = db.batch();
        for (const d of slice) {
            batch.set(db.collection(col).doc(d.id), d, { merge: true });
        }
        await batch.commit();
    }
}

const seasonNames = [
    "revolución de mayo y el 25 de mayo",
    "independencia y el 9 de julio",
    "Manuel Belgrano y el 20 de junio",
    "San Martín y el 17 de agosto",
    "Sarmiento y el 11 de septiembre",
    "diversidad cultural y el 12 de octubre",
    "dia de la tradición y el 11 de noviembre",
    "dia de la soberanía combate de vuelta de obligado",
    "festejar fin de año",
    "adultos y secundarios",
];

const seasons = seasonNames.map((name) => {
    const slug = slugify(name);
    return {
        id: `season_${slug}`,
        name,
        slug,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
});

const worksTitles = [
    "Obligada estaba la vuelta",
    "La pequeña aldea",
    "Chocolate por la Libertad",
    "El tesoro Argentino",
    "Sarmiento, un Domingo en la escuela",
    "Viaje adentro de la Tierra",
    "Originariamente Argentina",
    "El arbolito frente al Cabildo",
    "Cabildo Abierto",
    "La Gran Semana de Mayo",
    "La pulpería de Jacinto",
    "Mondongo para Manuel",
    "Manuel Belgrano, ensayo ¡General!",
    "Celestiblanca",
    "Pequeño corazón",
    "Dos tipos audaces",
    "Nueve cajones mágicos en julio",
    "Viajecitos de Independencia",
    "Alegría de la Libertad",
    "Caminito Criollo",
    "Habla la casita",
    "San Martín, un general sin Remedios",
    "Empanadas para José",
    "Cuentos con granaderos",
    "La juguetería de José",
    "Libertadores de América",
    "Juntos a la mar",
    "Un regalo muuuy especial",
    "El regalo de Belgrano",
];

const works = worksTitles.map((title) => {
    const slug = slugify(title);
    const audienceTags: string[] = [];
    if (slug === "libertadores-de-america") audienceTags.push("secundario");

    return {
        id: `work_${slug}`,
        title,
        slug,
        isActive: true,
        tags: [],
        audienceTags,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
});

const venuesRaw = [
    {
        name: "Facultad de Veterinaria",
        addressLine: "Av. Chorroarín 280, AGRONOMÍACABA",
        mapsUrl: "https://maps.app.goo.gl/1FYthUxRYxK7tGGA7",
        defaultCapacity: 120,
    },
    {
        name: "Museo Histórico Sarmiento",
        addressLine: "Cuba 2079, BELGRANO CABA",
        mapsUrl: "https://maps.app.goo.gl/LhHNKt9vjd9JGXtw5",
        defaultCapacity: 100,
    },
    {
        name: "El Tinglado",
        addressLine: "Mario Bravo 948,  PALERMO CABA",
        mapsUrl: "https://maps.app.goo.gl/bbvs91KQYL9paYDN7",
        defaultCapacity: 250,
    },
    {
        name: "Teatro de la Sociedad Científica Argentina",
        addressLine: "Santa Fe 1145 - CABA",
        mapsUrl: "https://maps.app.goo.gl/FXpQsxk3xePZ3d4K7",
        defaultCapacity: 180,
    },
    {
        name: "Teatro Delta School",
        addressLine: "Av. Italia 4046 - Nordelta - Benavidez",
        mapsUrl: "https://maps.app.goo.gl/LPPyRRJexdL49tkt5",
        defaultCapacity: 160,
    },
    {
        name: "Salón Jiju´s",
        addressLine: "Mercedes 918 - FLORESTA - CABA",
        mapsUrl: "https://maps.app.goo.gl/2RY3B6NEgCdW9zjz6",
        defaultCapacity: 150,
    },
    {
        name: "Teatro Trinidad Guevara de Luján",
        addressLine: "Rivadavia 1096 - Luján",
        mapsUrl: "https://maps.app.goo.gl/aCUvzfzpY9CNxZ1UA",
        defaultCapacity: 175,
    },
];

// dedupe by name+address
const venues = uniqBy(
    venuesRaw.map((v) => {
        const slug = slugify(`${v.name}-${v.addressLine}`);
        return {
            id: `venue_${slug}`,
            name: v.name,
            slug: slugify(v.name),
            addressLine: v.addressLine,
            mapsUrl: v.mapsUrl,
            defaultCapacity: v.defaultCapacity,
            defaultSlotTemplate: ["09:00", "10:30", "14:00"],
            notes: "",
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
    }),
    (x) => x.id
);

// ---- mapping work slug -> season slug
const WORK_TO_SEASON_SLUG: Record<string, string> = {
    // 25 de mayo
    "la-pequena-aldea": "revolucion-de-mayo-y-el-25-de-mayo",
    "cabildo-abierto": "revolucion-de-mayo-y-el-25-de-mayo",
    "la-gran-semana-de-mayo": "revolucion-de-mayo-y-el-25-de-mayo",
    "la-pulperia-de-jacinto": "revolucion-de-mayo-y-el-25-de-mayo",
    "chocolate-por-la-libertad": "revolucion-de-mayo-y-el-25-de-mayo",
    "el-arbolito-frente-al-cabildo": "revolucion-de-mayo-y-el-25-de-mayo",

    // Belgrano
    "manuel-belgrano-ensayo-general": "manuel-belgrano-y-el-20-de-junio",
    "celestiblanca": "manuel-belgrano-y-el-20-de-junio",
    "pequeno-corazon": "manuel-belgrano-y-el-20-de-junio",
    "dos-tipos-audaces": "manuel-belgrano-y-el-20-de-junio",
    "el-regalo-de-belgrano": "manuel-belgrano-y-el-20-de-junio",
    "mondongo-para-manuel": "manuel-belgrano-y-el-20-de-junio",

    // 9 de julio
    "nueve-cajones-magicos-en-julio": "independencia-y-el-9-de-julio",
    "viajecitos-de-independencia": "independencia-y-el-9-de-julio",
    "alegria-de-la-libertad": "independencia-y-el-9-de-julio",
    "caminito-criollo": "independencia-y-el-9-de-julio",
    "habla-la-casita": "independencia-y-el-9-de-julio",

    // San Martín
    "san-martin-un-general-sin-remedios": "san-martin-y-el-17-de-agosto",
    "empanadas-para-jose": "san-martin-y-el-17-de-agosto",
    "cuentos-con-granaderos": "san-martin-y-el-17-de-agosto",
    "la-jugueteria-de-jose": "san-martin-y-el-17-de-agosto",
    "libertadores-de-america": "san-martin-y-el-17-de-agosto",

    // Sarmiento
    "sarmiento-un-domingo-en-la-escuela": "sarmiento-y-el-11-de-septiembre",

    // Diversidad cultural
    "juntos-a-la-mar": "diversidad-cultural-y-el-12-de-octubre",
    "viaje-adentro-de-la-tierra": "diversidad-cultural-y-el-12-de-octubre",
    "originariamente-argentina": "diversidad-cultural-y-el-12-de-octubre",

    // Tradición
    "el-tesoro-argentino": "dia-de-la-tradicion-y-el-11-de-noviembre",

    // Soberanía
    "obligada-estaba-la-vuelta": "dia-de-la-soberania-combate-de-vuelta-de-obligado",

    // Fin de año
    "un-regalo-muuuy-especial": "festejar-fin-de-ano",
};

function buildSeasonWorks() {
    const out: any[] = [];
    for (const w of works) {
        const seasonSlug = WORK_TO_SEASON_SLUG[w.slug];
        if (!seasonSlug) continue;
        const seasonId = `season_${seasonSlug}`;
        const workId = w.id;
        out.push({
            id: `${seasonId}__${workId}`,
            seasonId,
            workId,
            seasonSlug,
            workSlug: w.slug,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    return out;
}

async function main() {
    console.log("Seeding seasons...");
    await upsertMany("seasons", seasons);

    console.log("Seeding works...");
    await upsertMany("works", works);

    console.log("Seeding venues...");
    await upsertMany("venues", venues);

    const seasonWorks = buildSeasonWorks();

    // validation: every work mapped?
    const unmapped = works.filter((w) => !WORK_TO_SEASON_SLUG[w.slug]).map((w) => w.title);
    if (unmapped.length) {
        console.log("⚠️ Unmapped works:", unmapped);
    }

    console.log("Seeding seasonWorks...");
    await upsertMany("seasonWorks", seasonWorks);

    console.log("✅ Seed complete:", {
        seasons: seasons.length,
        works: works.length,
        venues: venues.length,
        seasonWorks: seasonWorks.length,
        unmapped: unmapped.length,
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
