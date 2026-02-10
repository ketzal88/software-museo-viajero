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
    defaultSlotTemplate?: SlotTemplate[]; // Rich slot info
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
    status: "OPEN" | "CLOSED";
    closedAt?: string;
    updatedAt: string;
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

export enum AttendanceStatus {
    PENDING = "PENDING",
    FINAL = "FINAL",
}

export enum BillingPolicy {
    RESERVED = "RESERVED",
    ATTENDED = "ATTENDED",
    CUSTOM = "CUSTOM",
}

export interface TheaterBooking {
    id: string;
    eventSlotId: string;
    schoolId: string;
    // Reserved counts
    qtyReservedStudents: number;
    qtyReservedAdults: number;
    // Attended counts (filled later)
    qtyAttendedStudents?: number;
    qtyAttendedAdults?: number;
    // Calculation & Policy
    billingPolicy: BillingPolicy;
    unitPriceStudent: number;
    unitPriceAdult: number;
    totalExpected: number;
    totalFinal?: number;

    status: BookingStatus;
    attendanceStatus: AttendanceStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string; // Para reservas en HOLD
}

export interface TravelBooking {
    id: string;
    eventSlotId: string;
    schoolId: string;
    modality: TravelMode;
    // Reserved counts
    qtyReservedStudents: number;
    qtyReservedAdults: number;
    // Attended counts
    qtyAttendedStudents?: number;
    qtyAttendedAdults?: number;

    status: BookingStatus;
    attendanceStatus: AttendanceStatus;
    totalPrice: number; // For travel, it's usually fixed by modality
    notes?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string; // Para reservas temporales
}

// REPORTS & SUMMARIES
export interface DailySummary {
    id: string; // daily_YYYY-MM-DD_type_id
    date: string;
    type: EventType;
    seasonId: string;
    workId: string;
    venueId?: string;
    schoolId?: string;
    shiftType: ShiftType;
    attendance: {
        reservedStudents: number;
        reservedAdults: number;
        attendedStudents: number;
        attendedAdults: number;
    };
    revenue: {
        expected: number;
        final: number;
        currency: "ARS";
        breakdown?: {
            ticketsStudents: number;
            ticketsAdults: number;
            fixedTravel: number;
        };
    };
    costs: {
        staffTotal: number;
        actorsTotal: number;
        assistantsTotal: number;
        otherCosts?: number;
    };
    margin: {
        gross: number;
    };
    status: "OPEN" | "CLOSED";
    closedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MonthlySummary {
    id: string; // month_YYYY-MM
    month: string; // YYYY-MM
    revenueTotal: number;
    costsTotal: number;
    marginTotal: number;
    attendanceTotal: number;
    typeBreakdown: {
        theater: number;
        travel: number;
    };
    updatedAt: string;
}

export interface SeasonSummary {
    id: string; // season_id
    seasonId: string;
    revenueTotal: number;
    marginTotal: number;
    attendanceTotal: number;
    topWorks: { workId: string; title: string; count: number }[];
    topVenues: { venueId: string; name: string; count: number }[];
    attendanceRatio: number; // attended / reserved
    updatedAt: string;
}

// STAFF & PAYOUTS
export enum RoleType {
    ACTOR = "actor",
    ASSISTANT = "assistant",
    STAFF = "staff"
}

export enum ShiftType {
    HALF_DAY_MORNING = "half_day_morning",
    HALF_DAY_AFTERNOON = "half_day_afternoon",
    HALF_DAY_MIXED = "half_day_mixed",
    FULL_DAY = "full_day"
}

export enum PayoutStatus {
    PENDING = "pending",
    APPROVED = "approved",
    PAID = "paid"
}

export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    roleTypes: RoleType[];
    phone?: string;
    email?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkCast {
    id: string;
    workId: string;
    personId: string;
    roleType: RoleType;
    characterName?: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PersonRate {
    id: string;
    personId: string;
    roleType: RoleType;
    shiftType: ShiftType;
    amount: number;
    currency: "ARS";
    workId?: string;
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Payout {
    id: string;
    eventDayId: string;
    date: string;
    workId: string;
    personId: string;
    roleType: RoleType;
    shiftType: ShiftType;
    units: number;
    amount: number;
    currency: "ARS";
    status: PayoutStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
