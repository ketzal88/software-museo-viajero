/**
 * Seed Firestore: Schools from Base de Contactos CSV
 * Parses the CSV and uploads schools to the 'schools' collection.
 *
 * Usage:
 *   npx tsx scripts/seed-schools.ts
 */

import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, "../.env.local");
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
    console.log("✅ Loaded .env.local");
}

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

// ---------- helpers ----------

function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .trim();
}

function buildSearchTokens(input: string): string[] {
    const normalized = normalizeString(input);
    const words = normalized.split(/\s+/).filter((w) => w.length > 0);
    const tokens = new Set<string>();

    words.forEach((word) => {
        tokens.add(word);
        for (let i = 1; i <= word.length; i++) {
            tokens.add(word.substring(0, i));
        }
    });

    return Array.from(tokens);
}

function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/** Heuristic: names with DIST, ESC, or numbered schools are public */
function inferIsPrivate(name: string): boolean {
    const upper = name.toUpperCase();
    if (/\bDIST\b/.test(upper)) return false;
    if (/^\d+\s/.test(upper)) return false;
    if (/^ESC\b/.test(upper)) return false;
    if (/^ESWC\b/.test(upper)) return false;
    return true;
}

function cleanPhone(raw: string): string {
    // Take first phone number if multiple separated by / or |
    const first = raw.split(/[/|]/)[0];
    return first.replace(/\s+/g, "").trim();
}

function cleanName(raw: string): string {
    // Remove price annotations like "$45.000" or "$90.000."
    const withoutPrice = raw.replace(/\s*\$[\d.,]+\.?/g, "");
    return withoutPrice
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .map((w) => {
            if (w.length <= 2) return w.toUpperCase();
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(" ");
}

// ---------- CSV parsing (comma-separated with quoted fields) ----------

/**
 * Headers: Escuela, Cant. Reservas, Años, Cant. Años, Último Año,
 *          Contacto (último), Teléfono (último), Email, Niveles,
 *          Total Chicos, Sección, Otros Contactos, Otros Teléfonos
 */
interface CsvRow {
    escuela: string;
    cantReservas: string;
    anos: string;
    cantAnos: string;
    ultimoAno: string;
    contacto: string;
    telefono: string;
    email: string;
    niveles: string;
    totalChicos: string;
    seccion: string;
    otrosContactos: string;
    otrosTelefonos: string;
}

/** Parse a CSV line respecting quoted fields (commas inside quotes) */
function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            fields.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}

function parseRows(csvContent: string): CsvRow[] {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim());
    const rows: CsvRow[] = [];

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
        const fields = parseCsvLine(lines[i]);
        const escuela = fields[0]?.trim();
        if (!escuela) continue;

        rows.push({
            escuela: fields[0] || "",
            cantReservas: fields[1] || "",
            anos: fields[2] || "",
            cantAnos: fields[3] || "",
            ultimoAno: fields[4] || "",
            contacto: fields[5] || "",
            telefono: fields[6] || "",
            email: fields[7] || "",
            niveles: fields[8] || "",
            totalChicos: fields[9] || "",
            seccion: fields[10] || "",
            otrosContactos: fields[11] || "",
            otrosTelefonos: fields[12] || "",
        });
    }
    return rows;
}

// ---------- transform to School docs ----------

function buildNotes(row: CsvRow): string {
    const parts: string[] = [];

    if (row.cantReservas) parts.push(`Total reservas: ${row.cantReservas}`);
    if (row.cantAnos) parts.push(`Años que vino: ${row.cantAnos}`);
    if (row.anos) parts.push(`Detalle años: ${row.anos}`);
    if (row.ultimoAno) parts.push(`Último año: ${row.ultimoAno}`);
    if (row.niveles) parts.push(`Niveles: ${row.niveles}`);
    if (row.totalChicos) parts.push(`Total chicos: ${row.totalChicos}`);
    if (row.seccion) parts.push(`Sección: ${row.seccion}`);
    if (row.otrosContactos) parts.push(`Otros contactos: ${row.otrosContactos}`);
    if (row.otrosTelefonos) parts.push(`Otros teléfonos: ${row.otrosTelefonos}`);

    return parts.join(" | ");
}

function rowToSchool(row: CsvRow) {
    const name = cleanName(row.escuela);
    const district = "";
    const displayLabel = district ? `${name} (${district})` : name;
    const searchTokens = buildSearchTokens(`${name} ${district}`);
    const slug = slugify(row.escuela);

    return {
        id: `school_${slug}`,
        name,
        address: "",
        district,
        email: (row.email || "").trim().toLowerCase(),
        phone: cleanPhone(row.telefono),
        isPrivate: inferIsPrivate(row.escuela),
        contactName: row.contacto.trim() || "Sin contacto",
        notes: buildNotes(row),
        searchTokens,
        displayLabel,
    };
}

// ---------- upsert ----------

async function upsertMany(col: string, docs: any[]) {
    const batchSize = 400;
    for (let i = 0; i < docs.length; i += batchSize) {
        const slice = docs.slice(i, i + batchSize);
        const batch = db.batch();
        for (const d of slice) {
            batch.set(db.collection(col).doc(d.id), d, { merge: true });
        }
        await batch.commit();
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${slice.length} docs committed`);
    }
}

// ---------- main ----------

async function main() {
    const csvPath = resolve(
        __dirname,
        "../docs/RESERVAS Museo - Resumen a 2025 completo - Base de Contactos.csv"
    );
    console.log("Reading CSV from:", csvPath);

    const raw = readFileSync(csvPath, "utf-8");
    const rows = parseRows(raw);
    console.log(`Parsed ${rows.length} school rows from CSV`);

    const schools = rows.map(rowToSchool);

    // Dedupe by id
    const seen = new Set<string>();
    const unique = schools.filter((s) => {
        if (seen.has(s.id)) {
            console.log(`  ⚠️ Duplicate skipped: ${s.name} (${s.id})`);
            return false;
        }
        seen.add(s.id);
        return true;
    });

    console.log(`\nSchools to upload: ${unique.length}`);
    console.log("\nSample (first 5):");
    unique.slice(0, 5).forEach((s) => {
        console.log(`  - ${s.name} | private=${s.isPrivate} | contact=${s.contactName} | phone=${s.phone}`);
    });

    console.log("\nUploading to Firestore...");
    await upsertMany("schools", unique);

    console.log(`\n✅ Seed complete: ${unique.length} schools uploaded to 'schools' collection`);

    // Stats
    const privateCount = unique.filter((s) => s.isPrivate).length;
    const publicCount = unique.length - privateCount;
    const withEmail = unique.filter((s) => s.email).length;
    const withPhone = unique.filter((s) => s.phone).length;

    console.log("\n📊 Stats:");
    console.log(`  Privadas: ${privateCount}`);
    console.log(`  Públicas: ${publicCount}`);
    console.log(`  Con email: ${withEmail}`);
    console.log(`  Con teléfono: ${withPhone}`);
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
