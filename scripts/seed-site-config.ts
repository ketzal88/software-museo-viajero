/**
 * Seed inicial de site_config (nosotros, contact, social, stats, footer).
 * Idempotente — usa merge:true. Re-ejecutable para ajustes.
 * Los valores base vienen del `src/data/dataSourese.js` del repo origen.
 *
 * Uso: npm run seed-site-config
 */

import admin from "firebase-admin";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

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
db.settings({ ignoreUndefinedProperties: true });

const NOSOTROS_BODY = `
El Museo Viajero es una compañía de teatro para escuelas e investigación histórica fundada en 1995 por <b>Héctor López Girondo</b> (Titiritero del TGSM, actor y director de teatro), <b>Raquel Prestigiacomo</b> (Lic. y prof. en Letras, docente de la UBA, semióloga y escritora) y <b>Fabián Uccello</b> (historiador, actor y director de teatro).<br/>
<br/>
<h3>El Museo Viajero parte de cuatro propuestas:</h3>
<ul>
<li>Propuesta educacional: ver el teatro como una herramienta pedagógica.</li>
<li>Propuesta museológica: integrar el objeto al observador.</li>
<li>Propuesta histórica: recrear el discurso histórico tradicional.</li>
<li>Propuesta literaria: incorporar la narración descriptiva y la dramatización.</li>
</ul>
De la combinación de estas cuatro propuestas surge un género propio: <strong>la comedia histórica infantil</strong>.<br/>
<br/>
La seriedad en la selección de los contenidos de nuestras obras de teatro para colegios y la eficacia en su presentación está avalada por años de ejercicio docente, investigación histórico-literaria y una larga y fructífera actividad teatral infantil.<br/>
<br/>
Durante estos 30 años haciendo obras de teatro para escuelas, hemos recibido el reconocimiento entre otros muchos del <b>Fondo Nacional de las Artes</b>, del <b>Instituto Nacional del Teatro</b>, <b>Proteatro</b>, <b>Honorable Cámara de Diputados de la Nación</b>, el Museo de la Historia del Traje, el Museo Histórico Cornelio Saavedra, el Museo Histórico Sarmiento, la Facultad de Veterinaria (UBA), la Municipalidad de San Isidro, la Sociedad Científica Argentina, el Museo de Ciencias Naturales Florentino Ameghino. Y de la Editorial <b>EUDEBA</b> que ha publicado cuatro ediciones de La pequeña aldea y los tomos 1 y 2 de la compilación de nuestras comedias, bajo el título Comedias del Museo Viajero, editados en 2023.<br/>
<br/>
En nuestra larga trayectoria iniciada en 1995 hemos contado con la colaboración de prestigiosos profesionales como el escenógrafo y artista plástico Miguel Nigro, las coreógrafas Leticia Marín y Cecilia Esteves, los músicos Sergio Alem, Jorge Rabito, Miguel Magud y Martín Dell'Aquila, el vestuarista Juan Pablo Mastrangelo, el iluminador José Luis Calvo, la gráfica comunicacional de Apsis y la prensa de Gabriel Uccello.<br/>
<br/>
Por nuestras filas han pasado destacados actores y directores como Hugo Grosso (Premio Molière), Leonardo Gavriloff (Premio Estrella de Mar), Carlos Canosa, Belén Brito, Lucía Rosso, Paula Uccello, Soledad Piacenza, Daniel García, Damián Albariño, Malena Faletti, Juan Ignacio Sandoval, Norberto Benavidez, Roberto Echaide, Melina Saavedra, Ayelén Lázaro, Julián Felcman, Lucas Herrera, Daniel Mercado, Ariel Langsman y Álvaro Ruiz.
`.trim();

async function main() {
    console.log("Seeding site_config...");

    // Contact
    await db.collection("site_config").doc("contact").set({
        email: "info@elmuseoviajero.com.ar",
        phone: "+54 9 11 3255 6397",
        celPhone: "+54 9 11 3255 6399",
        whatsApp: "5491132556399",
        dateModified: new Date().toISOString(),
    }, { merge: true });
    console.log("  ✓ contact");

    // Nosotros
    await db.collection("site_config").doc("nosotros").set({
        title: "Sobre nosotros",
        body: NOSOTROS_BODY,
        seo: {
            title: "Sobre nosotros — El Museo Viajero",
            description: "Compañía de teatro histórico para escuelas fundada en 1995. Investigación histórica, puesta en escena y literatura combinadas en un género propio: la comedia histórica infantil.",
        },
        dateModified: new Date().toISOString(),
    }, { merge: true });
    console.log("  ✓ nosotros");

    // Social
    await db.collection("site_config").doc("social").set({
        links: [
            { icon: "IG", url: "https://www.instagram.com/elmuseoviajero/", label: "Instagram" },
            { icon: "YT", url: "https://www.youtube.com/@MuseoViajero", label: "YouTube" },
            { icon: "FB", url: "https://www.facebook.com/elmuseoviajero/", label: "Facebook" },
        ],
        dateModified: new Date().toISOString(),
    }, { merge: true });
    console.log("  ✓ social");

    // Stats
    await db.collection("site_config").doc("stats").set({
        items: [
            { label: "Años en escena", value: 30 },
            { label: "Obras en repertorio", value: 30 },
            { label: "Funciones realizadas", value: 4000, suffix: "+" },
            { label: "Escuelas atendidas", value: 1200, suffix: "+" },
        ],
        dateModified: new Date().toISOString(),
    }, { merge: true });
    console.log("  ✓ stats");

    // Sponsors (nombres — los logos se cargan manualmente desde CMS si se quieren imágenes)
    const sponsors = [
        { name: "Museos de Buenos Aires", order: 1 },
        { name: "Buenos Aires Ciudad", order: 2 },
        { name: "Pro Teatro", order: 3 },
        { name: "Fondo Nacional de las Artes", order: 4 },
        { name: "Instituto Nacional del Teatro", order: 5 },
        { name: "Honorable Cámara de Diputados", order: 6 },
        { name: "EUDEBA", order: 7 },
        { name: "Facultad de Ciencias Veterinarias UBA", order: 8 },
        { name: "Museo Histórico Sarmiento", order: 9 },
    ];
    for (const s of sponsors) {
        await db.collection("sponsors").doc(`sponsor-${s.order}`).set({
            ...s,
            logoUrl: `/images/sponsors/sponsor0${s.order}.svg`,
            isActive: true,
        }, { merge: true });
    }
    console.log(`  ✓ ${sponsors.length} sponsors`);

    // Publicaciones hardcoded (EUDEBA)
    const publicaciones = [
        {
            slug: "comedias-museo-viajero-tomo-1",
            title: "Comedias del Museo Viajero — Tomo 1",
            subtitle: "Cuatro comedias históricas para chicos",
            year: 2023,
            editorial: "EUDEBA",
            obrasIncluidas: ["celestiblanca", "alegria", "libertadores", "tesoro"],
            description: "Primer tomo de la compilación de comedias históricas del Museo Viajero, editado por EUDEBA.",
            coverUrl: "/images/obras/libroComedias01.webp",
            buyUrl: "https://www.eudeba.com.ar/",
            order: 1,
            isActive: true,
        },
        {
            slug: "comedias-museo-viajero-tomo-2",
            title: "Comedias del Museo Viajero — Tomo 2",
            subtitle: "Cuatro comedias históricas para chicos",
            year: 2023,
            editorial: "EUDEBA",
            obrasIncluidas: ["arbolito", "mondongo", "viajecitos", "granaderos"],
            description: "Segundo tomo de la compilación de comedias históricas del Museo Viajero, editado por EUDEBA.",
            coverUrl: "/images/obras/libroComedias02.webp",
            buyUrl: "https://www.eudeba.com.ar/",
            order: 2,
            isActive: true,
        },
        {
            slug: "la-pequena-aldea",
            title: "La pequeña aldea",
            subtitle: "Vida cotidiana 1800-1860",
            year: 2020,
            editorial: "EUDEBA",
            obrasIncluidas: ["aldea"],
            description: "Cuatro ediciones publicadas por EUDEBA. La pequeña aldea es nuestra obra más representada, con más de 3000 funciones desde 1995.",
            coverUrl: "/images/obras/libroAldea.webp",
            buyUrl: "https://www.eudeba.com.ar/",
            order: 3,
            isActive: true,
        },
    ];
    for (const p of publicaciones) {
        await db.collection("publicaciones").doc(p.slug).set({ ...p, dateModified: new Date().toISOString() }, { merge: true });
    }
    console.log(`  ✓ ${publicaciones.length} publicaciones`);

    // Cronologia mínima — entradas clave. El usuario puede extender desde el CMS.
    const cronologia = [
        { year: 1995, events: ["Se funda el grupo con el estreno de Un siglo en un ratito."] },
        { year: 1996, events: ["Estreno de La pequeña aldea — obra fundadora del repertorio."] },
        { year: 2002, events: ["Premio Proteatro, Gobierno de la Ciudad de Buenos Aires."] },
        { year: 2005, events: ["Premio Proteatro, Premio Fondo Nacional de las Artes y Premio Instituto Nacional del Teatro por Cabildo Abierto."] },
        { year: 2023, events: ["EUDEBA publica Comedias del Museo Viajero en dos tomos."] },
        { year: 2024, events: ["Estreno de Obligada estaba la vuelta — sobre el Día de la Soberanía Nacional."] },
    ];
    for (const c of cronologia) {
        await db.collection("cronologia").doc(`cron-${c.year}`).set({
            ...c,
            order: c.year,
        }, { merge: true });
    }
    console.log(`  ✓ ${cronologia.length} cronologia`);

    console.log("\nDone.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
