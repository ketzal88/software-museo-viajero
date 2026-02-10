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
