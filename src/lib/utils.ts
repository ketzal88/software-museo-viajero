import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TravelMode } from "@/types";

export const TRAVEL_PRICES = {
    [TravelMode.CLASSROOM]: { min: 1, max: 40, price: 150000, label: "Sala de Grado" },
    [TravelMode.DOUBLE_CLASSROOM]: { min: 41, max: 80, price: 250000, label: "Aula Doble" },
    [TravelMode.AUDITORIUM]: { min: 81, max: 300, price: 400000, label: "Patio / Gimnasio" },
};

export function recommendTravelModality(studentCount: number): TravelMode {
    if (studentCount <= 40) return TravelMode.CLASSROOM;
    if (studentCount <= 80) return TravelMode.DOUBLE_CLASSROOM;
    return TravelMode.AUDITORIUM;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .trim();
}

export function buildSearchTokens(input: string): string[] {
    const normalized = normalizeString(input);
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    const tokens = new Set<string>();

    words.forEach(word => {
        tokens.add(word);
        // We add prefixes for autocomplete
        for (let i = 1; i <= word.length; i++) {
            tokens.add(word.substring(0, i));
        }
    });

    return Array.from(tokens);
}

// Sheet parsing helpers (public-site migration, Fase 1a)

export function parseSheetBool(value: unknown): boolean {
    if (typeof value !== "string") return Boolean(value);
    const normalized = value.trim().toLowerCase();
    return normalized === "si" || normalized === "sí" || normalized === "true" || normalized === "1";
}

export function parseSheetPrice(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    const cleaned = value.replace(/\s/g, "").replace(/\$/g, "").replace(/\./g, "");
    const commaSplit = cleaned.split(",");
    const int = parseInt(commaSplit[0], 10);
    return isNaN(int) ? 0 : int;
}

export function parseSheetPercent(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    const cleaned = value.replace("%", "").replace(",", ".").trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return num / 100;
}

export function parseSheetHorarios(value: unknown): string[] {
    if (typeof value !== "string" || !value.trim()) return [];
    return value
        .split(",")
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => {
            const clean = h.replace(/[^0-9.:]/g, "");
            if (!clean) return null;
            const [hStr, mStr = "0"] = clean.split(/[:.]/);
            const hours = parseInt(hStr, 10);
            const minutes = parseInt(mStr.padEnd(2, "0").slice(0, 2), 10);
            if (isNaN(hours)) return null;
            return `${String(hours).padStart(2, "0")}:${String(isNaN(minutes) ? 0 : minutes).padStart(2, "0")}`;
        })
        .filter((h): h is string => h !== null);
}

export function parseSheetDate(value: unknown): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    const trimmed = value.trim();
    // Try D/M/YY or D/M/YYYY or D de mes de YYYY
    const dmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (dmy) {
        const [, d, m, y] = dmy;
        const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
        const month = String(parseInt(m, 10)).padStart(2, "0");
        const day = String(parseInt(d, 10)).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    // Fallback: native Date parse
    const native = new Date(trimmed);
    if (!isNaN(native.getTime())) {
        return native.toISOString().slice(0, 10);
    }
    return null;
}

export function serializeFirestore<T>(data: unknown): T {
    if (!data) return data as T;

    // Handle Timestamps
    if (data && typeof data === 'object' && 'toDate' in data && typeof (data as { toDate: unknown }).toDate === 'function') {
        return (data as { toDate: () => Date }).toDate().toISOString() as unknown as T;
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestore(item)) as unknown as T;
    }

    // Handle Objects
    if (typeof data === 'object' && data !== null) {
        const serialized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeFirestore(value);
        }
        return serialized as unknown as T;
    }

    return data as T;
}
