import * as z from "zod";
import { BillingPolicy, PricingType } from "@/types";

export const venueSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    address: z.string().min(5, "La dirección es obligatoria"),
    addressLine: z.string().optional(),
    mapsUrl: z.string().url("URL de Google Maps no válida").or(z.literal("")),
    defaultCapacity: z.number().min(1, "La capacidad debe ser al menos 1"),
    contactName: z.string().min(3, "El nombre de contacto es obligatorio"),
    phone: z.string().min(7, "El teléfono no es válido"),
    notes: z.string().optional(),
    defaultSlotTemplate: z.array(z.object({
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
        label: z.string().optional(),
    })).optional(),
});

export const schoolSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    district: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email("Correo electrónico no válido").or(z.literal("")),
    phone: z.string().min(7, "El teléfono es obligatorio"),
    isPrivate: z.boolean().default(false),
    contactName: z.string().min(3, "El nombre de contacto es obligatorio"),
    notes: z.string().optional(),
});

export const workSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    duration: z.number().min(1, "La duración debe ser al menos 1 minuto"),
    description: z.string().optional(),
});

export const seasonSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
    endDate: z.string().min(1, "La fecha de fin es obligatoria"),
    workIds: z.array(z.string()).min(1, "Debes seleccionar al menos una obra"),
    isActive: z.boolean(),
});
export const theaterBookingSchema = z.object({
    schoolId: z.string().min(1, "Debes seleccionar una escuela"),
    qtyReservedStudents: z.number().min(1, "Debes ingresar al menos 1 alumno"),
    qtyReservedAdults: z.number().min(0),
    billingPolicy: z.nativeEnum(BillingPolicy),
    unitPriceStudent: z.number().min(0),
    unitPriceAdult: z.number().min(0),
    totalExpected: z.number().min(0),
    pricingRuleId: z.string().min(1, "Regla de precio requerida"),
    contactName: z.string().default(""),
    contactPhone: z.string().default(""),
    gradeLevel: z.string().default(""),
    notes: z.string().optional(),
    isHold: z.boolean(),
});

export const travelBookingSchema = z.object({
    schoolId: z.string().min(1, "Debes seleccionar una escuela"),
    modality: z.string().min(1, "Debes seleccionar una modalidad"),
    qtyReservedStudents: z.number().min(1, "Debes ingresar al menos 1 alumno"),
    qtyReservedAdults: z.number().min(0),
    totalPrice: z.number().min(0, "El precio no puede ser negativo"),
    pricingRuleId: z.string().min(1, "Regla de precio requerida"),
    notes: z.string().optional(),
});

export const eventDaySchema = z.object({
    date: z.string().min(1, "La fecha es obligatoria"),
    type: z.string().min(1, "El tipo es obligatorio"),
    seasonId: z.string().min(1, "La temporada es obligatoria"),
    locationId: z.string().optional(),
    workId: z.string().min(1, "La obra es obligatoria"),
});

export const pricingRuleSchema = z.object({
    type: z.nativeEnum(PricingType),
    scope: z.enum(["GLOBAL", "SEASON"]),
    seasonId: z.string().optional(),
    validFrom: z.string().min(1, "Fecha desde es obligatoria"),
    validTo: z.string().min(1, "Fecha hasta es obligatoria"),
    currency: z.literal("ARS"),
    values: z.record(z.string(), z.number().min(0)),
    isActive: z.boolean(),
    notes: z.string().optional(),
});

// ────────────────────────────────────────────────────────────────
// CMS público (Fase 1 — sitio público + editor del dashboard)
// ────────────────────────────────────────────────────────────────

const seoSchema = z.object({
    title: z.string().max(70, "Máximo 70 caracteres").optional(),
    description: z.string().max(160, "Máximo 160 caracteres").optional(),
    ogImage: z.string().url("URL no válida").optional().or(z.literal("")),
});

const obraImageSchema = z.object({
    url: z.string().min(1, "URL requerida"),
    alt: z.string().min(3, "El alt text es obligatorio para accesibilidad y SEO"),
    order: z.number().int().min(0),
});

const obraPremioSchema = z.object({
    texto: z.string().min(3, "Texto del premio requerido"),
    anio: z.number().int().min(1990).max(2100).nullable().optional(),
});

const obraVideoSchema = z.object({
    url: z.string().url("URL de YouTube no válida"),
    youtubeId: z.string().min(5, "ID de YouTube requerido"),
});

const ciclosSchema = z.object({
    inicial: z.boolean().default(false),
    primerCiclo: z.boolean().default(false),
    segundoCiclo: z.boolean().default(false),
    tercerCiclo: z.boolean().default(false),
    secundario: z.boolean().default(false),
});

export const workPublicSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    slug: z.string().min(2, "El slug es obligatorio").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
    subTitle: z.string().optional(),
    description: z.string().optional(),
    body: z.string().optional(),
    tipoDeObra: z.string().optional(),
    pie: z.string().optional(),
    temaSlug: z.string().optional(),
    imgPortada: z.string().optional(),
    images: z.array(obraImageSchema).optional(),
    premios: z.array(obraPremioSchema).optional(),
    keywords: z.array(z.string().min(1)).optional(),
    estreno: z.boolean().optional(),
    estrenoText: z.string().optional(),
    anioEstreno: z.number().int().nullable().optional(),
    mesEstreno: z.number().int().min(1).max(12).nullable().optional(),
    diaEstreno: z.number().int().min(1).max(31).nullable().optional(),
    ciclos: ciclosSchema.optional(),
    duration: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    audienceTags: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
    isPublicVisible: z.boolean().default(true),
    seo: seoSchema.optional(),
});

export const venuePublicSchema = venueSchema.extend({
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    isPublicVisible: z.boolean().default(true),
    seo: seoSchema.optional(),
});

export const funcionCarteleraSchema = z.object({
    workSlug: z.string().min(1, "Obra requerida"),
    venueSlug: z.string().min(1, "Sala requerida"),
    fechaInicio: z.string().min(10, "Fecha desde obligatoria"),
    fechaFin: z.string().min(10, "Fecha hasta obligatoria"),
    fechaFuncion: z.string().min(10, "Fecha de función obligatoria"),
    siempreVisible: z.boolean().default(false),
    agotada: z.boolean().default(false),
    horarios: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:mm")).min(1, "Al menos un horario"),
    precio: z.number().int().min(0),
    promo: z.object({
        nombre: z.string(),
        descripcion: z.string(),
    }).optional(),
    isActive: z.boolean().default(true),
});

export const temaObraSchema = z.object({
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    title: z.string().min(3),
    urlDestino: z.string().url().optional().or(z.literal("")),
    order: z.number().int().min(0),
    seo: seoSchema.optional(),
    isActive: z.boolean().default(true),
});

export const videoObraSchema = z.object({
    workSlug: z.string().min(1),
    url: z.string().url(),
    youtubeId: z.string().min(5),
    order: z.number().int().min(0).default(0),
});

export const heroSlideSchema = z.object({
    order: z.number().int().min(0),
    visible: z.boolean().default(true),
    small: z.string().optional(),
    titulo: z.string().min(3),
    subTitulo: z.string().optional(),
    img: z.string().min(1, "Imagen desktop requerida"),
    imgMobile: z.string().optional(),
    cta: z.string().optional(),
    ctaPage: z.string().optional(),
    urlOutside: z.string().url().optional().or(z.literal("")),
    ctaDisplay: z.string().optional(),
    imgPosition: z.enum(["center", "top", "bottom"]).default("center"),
    estreno: z.boolean().default(false),
    estrenoText: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const siteConfigContactSchema = z.object({
    email: z.string().email(),
    phone: z.string().min(6),
    celPhone: z.string().optional(),
    whatsApp: z.string().min(6),
});

export const siteConfigNosotrosSchema = z.object({
    title: z.string().min(3),
    body: z.string().min(50),
    seo: seoSchema.optional(),
});

export const siteConfigSocialSchema = z.object({
    links: z.array(z.object({
        icon: z.string().min(1),
        url: z.string().url(),
        label: z.string().min(1),
    })),
});

export const siteConfigStatsSchema = z.object({
    items: z.array(z.object({
        label: z.string().min(1),
        value: z.number(),
        suffix: z.string().optional(),
    })),
});

export const cronologiaItemSchema = z.object({
    year: z.number().int().min(1900).max(2100),
    events: z.array(z.string().min(1)).min(1, "Al menos un evento"),
    order: z.number().int(),
});

export const sponsorSchema = z.object({
    name: z.string().min(2),
    logoUrl: z.string().min(1),
    url: z.string().url().optional().or(z.literal("")),
    order: z.number().int().min(0),
    isActive: z.boolean().default(true),
});
