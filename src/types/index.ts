export enum EventType {
    THEATER = "theater",
    TRAVEL = "travel",
}

export enum BookingStatus {
    HOLD = "hold", // Reserva temporal, bloquea cupo
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
}

export enum TravelMode {
    CLASSROOM = "classroom", // Hasta 40 chicos
    DOUBLE_CLASSROOM = "double_classroom", // Hasta 80 chicos
    AUDITORIUM = "auditorium", // Más de 80 chicos (patio/gimnasio)
}

export interface School {
    id: string;
    name: string;
    address: string;
    district: string; // Barrio/Comuna
    email: string;
    phone: string;
    isPrivate: boolean;
    contactName: string;
    notes?: string;
    searchTokens?: string[];
    displayLabel?: string;
}

export interface SlotTemplate {
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    label?: string; // ej: "Turno Tarde"
}

export interface Venue {
    id: string;
    name: string;
    slug?: string;
    address?: string; // Legacy field
    addressLine?: string; // New field from seed
    mapsUrl?: string;
    defaultCapacity: number;
    contactName?: string;
    phone?: string;
    notes?: string;
    defaultSlotTemplate?: string[]; // Simplified from SlotTemplate
    isActive?: boolean;
}

export interface Work {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    duration?: number; // en minutos
    tags?: string[];
    audienceTags?: string[];
    isActive?: boolean;
}

export interface Season {
    id: string;
    name: string; // ej: "Temporada 2024"
    slug?: string;
    startDate?: string; // ISO Date
    endDate?: string; // ISO Date
    isActive?: boolean;
    worksIds?: string[];
}

export interface SeasonWork {
    id: string;
    seasonId: string;
    workId: string;
    seasonSlug: string;
    workSlug: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EventDay {
    id: string;
    date: string; // ISO Date
    type: EventType;
    seasonId: string;
    locationId: string; // Venue ID (si es Teatro) o se deja nulo/ID de la Escuela base (si es Viaje)
}

export interface EventSlot {
    id: string;
    eventDayId: string;
    workId: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    totalCapacity: number;
    availableCapacity: number;
}

export interface TheaterBooking {
    id: string;
    eventSlotId: string;
    schoolId: string;
    countStudents: number;
    countTeachers: number;
    status: BookingStatus;
    totalPrice: number;
    notes?: string;
    createdAt: string;
    expiresAt?: string; // Para reservas en HOLD
}

export interface TravelBooking {
    id: string;
    eventSlotId: string;
    schoolId: string;
    modality: TravelMode;
    countStudents: number;
    countTeachers: number;
    status: BookingStatus;
    totalPrice: number;
    notes?: string;
    createdAt: string;
    expiresAt?: string; // Para reservas temporales
}
