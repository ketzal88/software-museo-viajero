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
    district: z.string().min(2, "El distrito/localidad es obligatorio"),
    address: z.string().min(5, "La dirección es obligatoria"),
    email: z.string().email("Correo electrónico no válido").or(z.literal("")),
    phone: z.string().min(7, "El teléfono no es válido"),
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
