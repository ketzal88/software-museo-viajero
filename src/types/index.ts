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
    address?: string;
    district?: string; // Barrio/Comuna
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
    // Sitio público (Fase 1)
    isPublicVisible?: boolean;
    seo?: SeoMeta;
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

    // Sitio público (Fase 1)
    subTitle?: string;
    body?: string;                 // HTML sanitizado
    tipoDeObra?: string;
    pie?: string;
    temaSlug?: string;
    imgPortada?: string;
    images?: { url: string; alt: string; order: number }[];
    premios?: { texto: string; anio?: number | null }[];
    keywords?: string[];
    estreno?: boolean;
    estrenoText?: string;
    anioEstreno?: number | null;
    mesEstreno?: number | null;
    diaEstreno?: number | null;
    ciclos?: {
        inicial: boolean;
        primerCiclo: boolean;
        segundoCiclo: boolean;
        tercerCiclo: boolean;
        secundario: boolean;
    };
    videos?: { url: string; youtubeId: string }[];
    seo?: SeoMeta;
    isPublicVisible?: boolean;
    dateModified?: string;
}

export interface Season {
    id: string;
    name: string; // ej: "Temporada 2024"
    slug?: string;
    startDate?: string; // ISO Date
    endDate?: string; // ISO Date
    isActive?: boolean;
    workIds?: string[];
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
    schoolName?: string; // Denormalized for display — avoids N+1 lookups
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
    // Contact per booking (teacher/responsible for this group)
    contactName?: string;
    contactPhone?: string;
    // Grade level
    gradeLevel?: string;
    gradeCycle?: string;

    status: BookingStatus;
    attendanceStatus: AttendanceStatus;
    pricingRuleId: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string; // Para reservas en HOLD
}

export interface TravelBooking {
    id: string;
    eventSlotId: string;
    schoolId: string;
    schoolName?: string; // Denormalized for display — avoids N+1 lookups
    modality: TravelMode;
    // Reserved counts
    qtyReservedStudents: number;
    qtyReservedAdults: number;
    // Attended counts
    qtyAttendedStudents?: number;
    qtyAttendedAdults?: number;
    // Contact per booking
    contactName?: string;
    contactPhone?: string;
    // Grade level
    gradeLevel?: string;
    gradeCycle?: string;

    status: BookingStatus;
    attendanceStatus: AttendanceStatus;
    pricingRuleId: string;
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
    workTitle?: string; // Denormalized for display
    personId: string;
    personName?: string; // Denormalized for display
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

// PRICING SYSTEM
export enum PricingType {
    THEATER_TICKET = "THEATER_TICKET",
    TRAVEL_FORMAT = "TRAVEL_FORMAT",
}

export interface PricingRule {
    id: string;
    type: PricingType;
    scope: "GLOBAL" | "SEASON";
    seasonId?: string;
    validFrom: string; // ISO Date YYYY-MM-DD
    validTo: string; // ISO Date YYYY-MM-DD
    currency: "ARS";
    values: {
        // For THEATER_TICKET: student, adult
        // For TRAVEL_FORMAT: half_day_morning, half_day_afternoon, half_day_mixed, full_day
        [key: string]: number | undefined;
    };
    isActive: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// ────────────────────────────────────────────────────────────────
// Sitio público — tipos nuevos (Fase 1)
// ────────────────────────────────────────────────────────────────

export interface SeoMeta {
    title?: string;
    description?: string;
    ogImage?: string;
}

export interface FuncionCartelera {
    id: string;
    workSlug: string;
    venueSlug: string;
    fechaInicio: string;   // ISO Date YYYY-MM-DD
    fechaFin: string;
    fechaFuncion: string;
    siempreVisible: boolean;
    agotada: boolean;
    horarios: string[];    // ["09:00", "10:30", "14:00"]
    precio: number;        // ARS
    promo?: {
        nombre: string;
        descripcion: string;
    };
    isActive: boolean;
    dateModified: string;
}

export interface TemaObra {
    id: string;
    slug: string;
    title: string;
    urlDestino?: string;
    order: number;
    seo?: SeoMeta;
    isActive: boolean;
}

export interface VideoObra {
    id: string;
    workSlug: string;
    url: string;
    youtubeId: string;
    order: number;
}

export interface HeroSlide {
    id: string;
    order: number;
    visible: boolean;
    small?: string;
    titulo: string;
    subTitulo?: string;
    img: string;
    imgMobile?: string;
    cta?: string;
    ctaPage?: string;
    urlOutside?: string;
    ctaDisplay?: string;
    imgPosition: "center" | "top" | "bottom";
    estreno: boolean;
    estrenoText?: string;
    isActive: boolean;
    dateModified: string;
}

export interface SiteConfigContact {
    email: string;
    phone: string;
    celPhone?: string;
    whatsApp: string;
}

export interface SiteConfigNosotros {
    title: string;
    body: string;     // HTML sanitizado
    seo?: SeoMeta;
    dateModified?: string;
}

export interface SiteConfigSocial {
    links: { icon: string; url: string; label: string }[];
}

export interface SiteConfigStats {
    items: { label: string; value: number; suffix?: string }[];
}

export interface CronologiaItem {
    id: string;
    year: number;
    events: string[];
    order: number;
}

export interface Sponsor {
    id: string;
    name: string;
    logoUrl: string;
    url?: string;
    order: number;
    isActive: boolean;
}

// Server Action result types
export type ActionSuccess<T = void> = T extends void
    ? { success: true }
    : { success: true } & T;

export type ActionError = {
    success: false;
    error: string;
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;

// Grade levels for bookings
// isCycle=true entries are selectable cycle-level options (e.g. "todo el 1er ciclo")
export const GRADE_LEVELS = [
    { value: "jardin",       label: "Jardín",     cycle: "Jardin",    isCycle: true  },
    { value: "sala_3",       label: "Sala de 3",  cycle: "Jardin",    isCycle: false },
    { value: "sala_4",       label: "Sala de 4",  cycle: "Jardin",    isCycle: false },
    { value: "sala_5",       label: "Sala de 5",  cycle: "Jardin",    isCycle: false },
    { value: "primer_ciclo", label: "1er Ciclo",  cycle: "1er Ciclo", isCycle: true  },
    { value: "1ro",          label: "1er Grado",  cycle: "1er Ciclo", isCycle: false },
    { value: "2do",          label: "2do Grado",  cycle: "1er Ciclo", isCycle: false },
    { value: "3ro",          label: "3er Grado",  cycle: "1er Ciclo", isCycle: false },
    { value: "segundo_ciclo",label: "2do Ciclo",  cycle: "2do Ciclo", isCycle: true  },
    { value: "4to",          label: "4to Grado",  cycle: "2do Ciclo", isCycle: false },
    { value: "5to",          label: "5to Grado",  cycle: "2do Ciclo", isCycle: false },
    { value: "6to",          label: "6to Grado",  cycle: "2do Ciclo", isCycle: false },
    { value: "7mo",          label: "7mo Grado",  cycle: "2do Ciclo", isCycle: false },
] as const;

// Firestore collection names
export const COLLECTIONS = {
    VENUES: 'venues',
    SCHOOLS: 'schools',
    WORKS: 'works',
    SEASONS: 'seasons',
    EVENT_DAYS: 'event_days',
    EVENT_SLOTS: 'event_slots',
    THEATER_BOOKINGS: 'theater_bookings',
    TRAVEL_BOOKINGS: 'travel_bookings',
    PEOPLE: 'people',
    WORK_CASTS: 'workCasts',
    PERSON_RATES: 'personRates',
    PAYOUTS: 'payouts',
    PRICING_RULES: 'pricingRules',
    DAILY_SUMMARIES: 'dailySummaries',
    MONTHLY_SUMMARIES: 'monthlySummaries',
    SEASON_SUMMARIES: 'seasonSummaries',
    CONFIG: 'config',
    // Sitio público (Fase 1)
    FUNCIONES_CARTELERA: 'funciones_cartelera',
    TEMAS_OBRAS: 'temas_obras',
    VIDEOS_OBRAS: 'videos_obras',
    HERO_SLIDES: 'hero_slides',
    SITE_CONFIG: 'site_config',
    CRONOLOGIA: 'cronologia',
    SPONSORS: 'sponsors',
} as const;
