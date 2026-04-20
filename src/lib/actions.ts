"use server";

import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { Venue, School, Work, Season, EventDay, EventSlot, EventType, TheaterBooking, TravelBooking, BookingStatus, SlotTemplate, Person, WorkCast, PersonRate, Payout, RoleType, ShiftType, PayoutStatus, AttendanceStatus, BillingPolicy, DailySummary, MonthlySummary, SeasonSummary, PricingRule, PricingType } from "@/types";
import { revalidatePath } from "next/cache";
import { buildSearchTokens, serializeFirestore } from "./utils";
import { addHours } from "date-fns";

export async function getTestCollection() {
    try {
        const snapshot = await adminDb.collection("config").limit(1).get();
        return {
            status: "connected",
            message: "Firestore is accessible from Server Actions",
            empty: snapshot.empty
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Failed to connect to Firestore"
        };
    }
}

// VENUES
export async function getVenues(): Promise<Venue[]> {
    try {
        const snapshot = await adminDb.collection("venues").get();
        return snapshot.docs.map(doc => serializeFirestore<Venue>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching venues:", error);
        return [];
    }
}

export async function getVenueById(id: string): Promise<Venue | null> {
    if (!id) return null;
    try {
        const doc = await adminDb.collection("venues").doc(id).get();
        if (!doc.exists) return null;
        return serializeFirestore<Venue>({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching venue:", error);
        return null;
    }
}

export async function addVenue(venue: Omit<Venue, "id">) {
    try {
        const docRef = await adminDb.collection("venues").add(venue);
        revalidatePath("/teatros");
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        console.error("Error adding venue:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateVenue(id: string, venue: Partial<Venue>) {
    try {
        await adminDb.collection("venues").doc(id).update(venue);
        revalidatePath("/teatros");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating venue:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteVenue(id: string) {
    try {
        await adminDb.collection("venues").doc(id).delete();
        revalidatePath("/teatros");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting venue:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// SCHOOLS
export async function getSchools(): Promise<School[]> {
    try {
        const snapshot = await adminDb.collection("schools").orderBy("name").get();
        return snapshot.docs.map(doc => serializeFirestore<School>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching schools:", error);
        return [];
    }
}

export async function getSchoolById(id: string): Promise<School | null> {
    if (!id) return null;
    try {
        const doc = await adminDb.collection("schools").doc(id).get();
        if (!doc.exists) return null;
        return serializeFirestore<School>({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching school:", error);
        return null;
    }
}

function prepareSchoolData(school: Omit<School, "id" | "searchTokens" | "displayLabel">) {
    const displayLabel = `${school.name} (${school.district})`;
    const searchTokens = buildSearchTokens(`${school.name} ${school.district}`);
    return {
        ...school,
        displayLabel,
        searchTokens
    };
}

export async function addSchool(school: Omit<School, "id" | "searchTokens" | "displayLabel">) {
    try {
        const data = prepareSchoolData(school);
        const docRef = await adminDb.collection("schools").add(data);
        revalidatePath("/escuelas");
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        console.error("Error adding school:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateSchool(id: string, school: Partial<School>) {
    try {
        const updateData = { ...school } as Partial<School>;
        if (school.name || school.district) {
            const current = await getSchoolById(id);
            if (current) {
                const newData = {
                    name: school.name || current.name,
                    district: school.district || current.district,
                    address: school.address || current.address,
                    email: school.email || current.email,
                    phone: school.phone || current.phone,
                    isPrivate: school.isPrivate !== undefined ? school.isPrivate : current.isPrivate,
                    contactName: school.contactName || current.contactName,
                };
                const { searchTokens, displayLabel } = prepareSchoolData(newData);
                updateData.searchTokens = searchTokens;
                updateData.displayLabel = displayLabel;
            }
        }
        await adminDb.collection("schools").doc(id).update(updateData);
        revalidatePath("/escuelas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating school:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteSchool(id: string) {
    try {
        await adminDb.collection("schools").doc(id).delete();
        revalidatePath("/escuelas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting school:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// WORKS
export async function getWorks(): Promise<Work[]> {
    try {
        const snapshot = await adminDb.collection("works").orderBy("title").get();
        return snapshot.docs.map(doc => serializeFirestore<Work>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching works:", error);
        return [];
    }
}

export async function getWorkById(id: string): Promise<Work | null> {
    if (!id) return null;
    try {
        const doc = await adminDb.collection("works").doc(id).get();
        if (!doc.exists) return null;
        return serializeFirestore<Work>({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching work:", error);
        return null;
    }
}

export async function addWork(work: Omit<Work, "id">) {
    try {
        const docRef = await adminDb.collection("works").add(work);
        revalidatePath("/obras");
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        console.error("Error adding work:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateWork(id: string, work: Partial<Work>) {
    try {
        await adminDb.collection("works").doc(id).update(work);
        revalidatePath("/obras");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating work:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteWork(id: string) {
    try {
        await adminDb.collection("works").doc(id).delete();
        revalidatePath("/obras");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting work:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// SEASONS
export async function getSeasons(): Promise<Season[]> {
    try {
        const snapshot = await adminDb.collection("seasons").orderBy("startDate", "desc").get();
        return snapshot.docs.map(doc => serializeFirestore<Season>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching seasons:", error);
        return [];
    }
}

export async function getSeasonById(id: string): Promise<Season | null> {
    if (!id) return null;
    try {
        const doc = await adminDb.collection("seasons").doc(id).get();
        if (!doc.exists) return null;
        return serializeFirestore<Season>({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching season:", error);
        return null;
    }
}

export async function addSeason(season: Omit<Season, "id">) {
    try {
        const docRef = await adminDb.collection("seasons").add(season);
        revalidatePath("/temporadas");
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        console.error("Error adding season:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateSeason(id: string, season: Partial<Season>) {
    try {
        await adminDb.collection("seasons").doc(id).update(season);
        revalidatePath("/temporadas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating season:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteSeason(id: string) {
    try {
        await adminDb.collection("seasons").doc(id).delete();
        revalidatePath("/temporadas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting season:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// CALENDAR SUMMARY
export interface CalendarSlotSummary {
    slotId: string;
    startTime: string;
    endTime: string;
    availableCapacity: number;
    totalCapacity: number;
    cycles: string[]; // ["J", "1er", "2do"] — deduplicated cycle tags from bookings
    workTitle: string;
}

export async function getCalendarDaySummaries(eventDayIds: string[]): Promise<Record<string, CalendarSlotSummary[]>> {
    if (!eventDayIds.length) return {};
    try {
        const BATCH_SIZE = 25; // Firestore "in" limit is 30
        const result: Record<string, CalendarSlotSummary[]> = {};

        // 1. Fetch ALL slots in batches using "in" query — avoids N per-day queries
        const allSlots: EventSlot[] = [];
        for (let i = 0; i < eventDayIds.length; i += BATCH_SIZE) {
            const batch = eventDayIds.slice(i, i + BATCH_SIZE);
            const snap = await adminDb.collection("event_slots")
                .where("eventDayId", "in", batch)
                .get();
            snap.docs.forEach(doc => {
                allSlots.push(serializeFirestore<EventSlot>({ id: doc.id, ...doc.data() }));
            });
        }

        // 2. Fetch unique works in one pass (deduplicated)
        const uniqueWorkIds = [...new Set(allSlots.map(s => s.workId).filter(Boolean))];
        const workDocs = await Promise.all(uniqueWorkIds.map(id => adminDb.collection("works").doc(id).get()));
        const workMap: Record<string, string> = {};
        workDocs.forEach(doc => { if (doc.exists) workMap[doc.id] = (doc.data() as Work).title; });

        // 3. Fetch booking cycles for all slots in batches (no school expansion)
        const slotIds = allSlots.map(s => s.id);
        const GRADE_TO_CYCLE: Record<string, string> = {
            "jardin": "J", "sala_3": "J", "sala_4": "J", "sala_5": "J",
            "primer_ciclo": "1er", "1ro": "1er", "2do": "1er", "3ro": "1er",
            "segundo_ciclo": "2do", "4to": "2do", "5to": "2do", "6to": "2do", "7mo": "2do",
        };
        const CYCLE_LABEL: Record<string, string> = { "Jardin": "J", "1er Ciclo": "1er", "2do Ciclo": "2do" };
        const cyclesBySlot: Record<string, Set<string>> = {};

        for (let i = 0; i < slotIds.length; i += BATCH_SIZE) {
            const batch = slotIds.slice(i, i + BATCH_SIZE);
            // Note: cannot combine "in" + "not-in" in Firestore — filter cancelled in-memory
            const snap = await adminDb.collection("theater_bookings")
                .where("eventSlotId", "in", batch)
                .get();
            snap.docs.forEach(doc => {
                const b = doc.data() as TheaterBooking;
                if (b.status === BookingStatus.CANCELLED) return;
                const label = (b.gradeCycle && CYCLE_LABEL[b.gradeCycle])
                    || (b.gradeLevel && GRADE_TO_CYCLE[b.gradeLevel]);
                if (label) {
                    if (!cyclesBySlot[b.eventSlotId]) cyclesBySlot[b.eventSlotId] = new Set();
                    cyclesBySlot[b.eventSlotId].add(label);
                }
            });
        }

        // 4. Build result grouped by eventDayId
        for (const dayId of eventDayIds) {
            const daySlots = allSlots
                .filter(s => s.eventDayId === dayId)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (!daySlots.length) continue;

            result[dayId] = daySlots.map(slot => ({
                slotId: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                availableCapacity: slot.availableCapacity,
                totalCapacity: slot.totalCapacity,
                cycles: ["J", "1er", "2do"].filter(c => cyclesBySlot[slot.id]?.has(c)),
                workTitle: workMap[slot.workId] ?? "",
            }));
        }

        return result;
    } catch (error) {
        console.error("Error fetching calendar summaries:", error);
        return {};
    }
}

// EVENTS (EventDay + EventSlot)
export async function getEventDays(options?: { fromDate?: string; toDate?: string }): Promise<EventDay[]> {
    try {
        let q: FirebaseFirestore.Query = adminDb.collection("event_days");
        if (options?.fromDate) q = q.where("date", ">=", options.fromDate);
        if (options?.toDate) q = q.where("date", "<=", options.toDate);
        const snapshot = await q.orderBy("date", "asc").get();
        return snapshot.docs.map(doc => serializeFirestore<EventDay>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching event days:", error);
        return [];
    }
}

export async function getEventDaysByDate(date: string): Promise<EventDay[]> {
    if (!date || date === "undefined") return [];
    try {
        const snapshot = await adminDb.collection("event_days")
            .where("date", "==", date)
            .get();
        return snapshot.docs.map(doc => serializeFirestore<EventDay>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching event days by date:", error);
        return [];
    }
}

export async function getEventDayById(id: string): Promise<EventDay | null> {
    if (!id) return null;
    try {
        const doc = await adminDb.collection("event_days").doc(id).get();
        if (!doc.exists) return null;
        return serializeFirestore<EventDay>({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching event day:", error);
        return null;
    }
}

export async function getSlotsByEventDay(eventDayId: string): Promise<EventSlot[]> {
    if (!eventDayId) return [];
    try {
        const snapshot = await adminDb.collection("event_slots")
            .where("eventDayId", "==", eventDayId)
            .get();
        return snapshot.docs.map(doc => serializeFirestore<EventSlot>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching slots:", error);
        return [];
    }
}

export async function getSlotDetails(slotId: string) {
    if (!slotId) return null;
    try {
        const slotDoc = await adminDb.collection("event_slots").doc(slotId).get();
        if (!slotDoc.exists) return null;
        const slot = serializeFirestore<EventSlot>({ id: slotDoc.id, ...slotDoc.data() });

        const [work, eventDay] = await Promise.all([
            getWorkById(slot.workId),
            getEventDayById(slot.eventDayId)
        ]);

        return { slot, work, eventDay };
    } catch (error) {
        console.error("Error fetching slot details:", error);
        return null;
    }
}

export async function addEventDay(
    eventDay: Omit<EventDay, "id">,
    workId: string // Obra que se presenta ese día
) {
    try {
        // 1. Create EventDay
        const docRef = await adminDb.collection("event_days").add(eventDay);
        const eventDayId = docRef.id;

        // 2. If it's Theater, auto-generate slots
        if (eventDay.type === EventType.THEATER) {
            const venue = await getVenueById(eventDay.locationId);
            if (venue && venue.defaultSlotTemplate && venue.defaultSlotTemplate.length > 0) {
                const batch = adminDb.batch();
                venue.defaultSlotTemplate.forEach((template) => {
                    const slotRef = adminDb.collection("event_slots").doc();

                    const slotData: Omit<EventSlot, "id"> = {
                        eventDayId,
                        workId,
                        startTime: template.startTime,
                        endTime: template.endTime,
                        totalCapacity: venue.defaultCapacity,
                        availableCapacity: venue.defaultCapacity,
                    };
                    batch.set(slotRef, slotData);
                });
                await batch.commit();
            }
        } else if (eventDay.type === EventType.TRAVEL) {
            // For TRAVEL, we might create a single default slot or allow manual creation
            // For now, let's create 1 default slot if workId is provided
            if (workId) {
                await adminDb.collection("event_slots").add({
                    eventDayId,
                    workId,
                    startTime: "09:00", // Default
                    endTime: "11:00",   // Default
                    totalCapacity: 0,    // Travel capacity is usually defined by the booking
                    availableCapacity: 0,
                });
            }
        }

        revalidatePath("/calendario");
        return { success: true, id: eventDayId };
    } catch (error: unknown) {
        console.error("Error adding event day:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateEventDay(id: string, data: { status?: "OPEN" | "CLOSED"; locationId?: string }) {
    try {
        await adminDb.collection("event_days").doc(id).update({
            ...data,
            updatedAt: new Date().toISOString(),
        });
        revalidatePath("/calendario");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating event day:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteEventDay(id: string) {
    try {
        const batch = adminDb.batch();

        // Delete all related slots first
        const slotsSnapshot = await adminDb.collection("event_slots")
            .where("eventDayId", "==", id)
            .get();

        slotsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete EventDay
        batch.delete(adminDb.collection("event_days").doc(id));

        await batch.commit();
        revalidatePath("/calendario");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting event day:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// BOOKINGS
export async function getSlotOccupancy(eventSlotId: string): Promise<number> {
    try {
        const bookingsSnapshot = await adminDb.collection("theater_bookings")
            .where("eventSlotId", "==", eventSlotId)
            .get();

        return bookingsSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data() as TheaterBooking;
            if (data.status === BookingStatus.CONFIRMED || data.status === BookingStatus.HOLD || data.status === BookingStatus.PENDING) {
                return acc + (data.qtyReservedStudents || 0);
            }
            return acc;
        }, 0);
    } catch (error) {
        console.error("Error calculating occupancy:", error);
        return 0;
    }
}

export async function addTheaterBooking(booking: Omit<TheaterBooking, "id" | "createdAt" | "status" | "updatedAt">, isHold: boolean = true) {
    try {
        // Fetch school name for denormalization (outside transaction — non-critical read)
        const schoolDoc = await adminDb.collection("schools").doc(booking.schoolId).get();
        const schoolName = schoolDoc.exists ? (schoolDoc.data() as School).name : undefined;

        const slotRef = adminDb.collection("event_slots").doc(booking.eventSlotId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const slotDoc = await transaction.get(slotRef);
            if (!slotDoc.exists) throw new Error("El slot no existe.");

            const slotData = slotDoc.data() as EventSlot;

            // Calculate occupancy inside transaction to prevent race conditions
            const bookingsSnapshot = await transaction.get(
                adminDb.collection("theater_bookings")
                    .where("eventSlotId", "==", booking.eventSlotId)
            );
            const currentOccupancy = bookingsSnapshot.docs.reduce((acc, doc) => {
                const data = doc.data() as TheaterBooking;
                if (data.status === BookingStatus.CONFIRMED || data.status === BookingStatus.HOLD || data.status === BookingStatus.PENDING) {
                    return acc + (data.qtyReservedStudents ?? 0);
                }
                return acc;
            }, 0);

            if (currentOccupancy + booking.qtyReservedStudents > slotData.totalCapacity) {
                throw new Error(`Capacidad excedida. Disponible: ${slotData.totalCapacity - currentOccupancy}`);
            }

            const bookingRef = adminDb.collection("theater_bookings").doc();
            const now = new Date().toISOString();
            const expiresAt = isHold ? addHours(new Date(), 72).toISOString() : undefined;

            const newBooking: Omit<TheaterBooking, "id"> = {
                ...booking,
                schoolName,
                createdAt: now,
                updatedAt: now,
                status: isHold ? BookingStatus.HOLD : BookingStatus.PENDING,
                attendanceStatus: AttendanceStatus.PENDING,
                expiresAt,
            };

            transaction.set(bookingRef, newBooking);

            // Update available capacity in slot
            transaction.update(slotRef, {
                availableCapacity: slotData.totalCapacity - (currentOccupancy + booking.qtyReservedStudents)
            });

            return { id: bookingRef.id };
        });

        revalidatePath("/reservas");
        return { success: true, id: result.id };
    } catch (error: unknown) {
        console.error("Error creating theater booking:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function addTravelBooking(booking: Omit<TravelBooking, "id" | "createdAt" | "status" | "updatedAt">) {
    try {
        const schoolDoc = await adminDb.collection("schools").doc(booking.schoolId).get();
        const schoolName = schoolDoc.exists ? (schoolDoc.data() as School).name : undefined;

        const now = new Date().toISOString();
        const bookingRef = await adminDb.collection("travel_bookings").add({
            ...booking,
            schoolName,
            createdAt: now,
            updatedAt: now,
            status: BookingStatus.PENDING,
            attendanceStatus: AttendanceStatus.PENDING,
        });

        revalidatePath("/reservas");
        return { success: true, id: bookingRef.id };
    } catch (error: unknown) {
        console.error("Error creating travel booking:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getInboxItems() {
    try {
        const [theaterSnap, travelSnap] = await Promise.all([
            adminDb.collection("theater_bookings")
                .where("status", "in", [BookingStatus.HOLD, BookingStatus.PENDING])
                .orderBy("createdAt", "desc")
                .get(),
            adminDb.collection("travel_bookings")
                .where("status", "in", [BookingStatus.HOLD, BookingStatus.PENDING])
                .orderBy("createdAt", "desc")
                .get()
        ]);

        const theaterBookings = theaterSnap.docs.map(doc =>
            serializeFirestore<TheaterBooking>({ id: doc.id, ...doc.data() })
        );
        const travelBookings = travelSnap.docs.map(doc =>
            serializeFirestore<TravelBooking>({ id: doc.id, ...doc.data() })
        );

        // Collect unique IDs for batch fetches
        const allBookings = [...theaterBookings, ...travelBookings];
        const missingSchoolIds = [...new Set(allBookings.filter(b => !b.schoolName).map(b => b.schoolId))];
        const uniqueSlotIds = [...new Set(allBookings.map(b => b.eventSlotId))];

        // Batch fetch schools (only missing), slots, then eventDays + works
        const [schoolMap, slotsSnap] = await Promise.all([
            batchFetchSchools(missingSchoolIds),
            uniqueSlotIds.length > 0
                ? adminDb.collection("event_slots")
                    .where(admin.firestore.FieldPath.documentId(), "in", uniqueSlotIds.slice(0, 30))
                    .get()
                : Promise.resolve({ docs: [] as admin.firestore.QueryDocumentSnapshot[] })
        ]);

        const slotMap: Record<string, EventSlot & { id: string }> = {};
        slotsSnap.docs.forEach(doc => {
            slotMap[doc.id] = { id: doc.id, ...doc.data() } as EventSlot & { id: string };
        });

        const uniqueEventDayIds = [...new Set(Object.values(slotMap).map(s => s.eventDayId))];
        const uniqueWorkIds = [...new Set(Object.values(slotMap).map(s => s.workId))];

        const [eventDaysSnap, worksSnap] = await Promise.all([
            uniqueEventDayIds.length > 0
                ? adminDb.collection("event_days")
                    .where(admin.firestore.FieldPath.documentId(), "in", uniqueEventDayIds.slice(0, 30))
                    .get()
                : Promise.resolve({ docs: [] as admin.firestore.QueryDocumentSnapshot[] }),
            uniqueWorkIds.length > 0
                ? adminDb.collection("works")
                    .where(admin.firestore.FieldPath.documentId(), "in", uniqueWorkIds.slice(0, 30))
                    .get()
                : Promise.resolve({ docs: [] as admin.firestore.QueryDocumentSnapshot[] })
        ]);

        const eventDayMap: Record<string, EventDay> = {};
        eventDaysSnap.docs.forEach(doc => {
            eventDayMap[doc.id] = { id: doc.id, ...doc.data() } as EventDay;
        });
        const workMap: Record<string, Work> = {};
        worksSnap.docs.forEach(doc => {
            workMap[doc.id] = { id: doc.id, ...doc.data() } as Work;
        });

        const buildSlotDetails = (slotId: string) => {
            const slotRaw = slotMap[slotId];
            if (!slotRaw) return null;
            const slot = serializeFirestore<EventSlot>(slotRaw);
            return {
                slot,
                eventDay: eventDayMap[slotRaw.eventDayId] ?? null,
                work: workMap[slotRaw.workId] ?? null,
            };
        };

        const theaterItems = theaterBookings.map(data => ({
            ...data,
            school: schoolMap[data.schoolId] ?? null,
            slotDetails: buildSlotDetails(data.eventSlotId),
            type: 'theater' as const
        }));

        const travelItems = travelBookings.map(data => ({
            ...data,
            school: schoolMap[data.schoolId] ?? null,
            slotDetails: buildSlotDetails(data.eventSlotId),
            type: 'travel' as const
        }));

        return [...theaterItems, ...travelItems].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
        console.error("Error fetching inbox items:", error);
        return [];
    }
}

export async function updateTheaterBooking(id: string, data: {
    qtyReservedStudents?: number;
    qtyReservedAdults?: number;
    contactName?: string;
    contactPhone?: string;
    gradeLevel?: string;
    gradeCycle?: string;
    notes?: string;
    status?: BookingStatus;
}) {
    try {
        const bookingRef = adminDb.collection("theater_bookings").doc(id);
        const doc = await bookingRef.get();
        if (!doc.exists) return { success: false, error: "Reserva no encontrada" };

        const current = doc.data() as TheaterBooking;
        const updateData: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() };

        // Recalculate totalExpected if quantities changed
        if (data.qtyReservedStudents !== undefined || data.qtyReservedAdults !== undefined) {
            const students = data.qtyReservedStudents ?? current.qtyReservedStudents;
            const adults = data.qtyReservedAdults ?? current.qtyReservedAdults;
            updateData.totalExpected = (students * current.unitPriceStudent) + (adults * current.unitPriceAdult);

            // Update slot capacity if student count changed
            if (data.qtyReservedStudents !== undefined && data.qtyReservedStudents !== current.qtyReservedStudents) {
                const diff = current.qtyReservedStudents - data.qtyReservedStudents;
                const slotRef = adminDb.collection("event_slots").doc(current.eventSlotId);
                await adminDb.runTransaction(async (transaction) => {
                    const slotDoc = await transaction.get(slotRef);
                    if (slotDoc.exists) {
                        const slot = slotDoc.data()!;
                        transaction.update(slotRef, { availableCapacity: slot.availableCapacity + diff });
                    }
                    transaction.update(bookingRef, updateData);
                });
                revalidatePath("/calendario");
                revalidatePath("/reservas");
                revalidatePath("/inbox");
                return { success: true };
            }
        }

        await bookingRef.update(updateData);
        revalidatePath("/calendario");
        revalidatePath("/reservas");
        revalidatePath("/inbox");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating theater booking:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateBookingStatus(id: string, type: 'theater' | 'travel', status: BookingStatus) {
    try {
        const collection = type === 'theater' ? "theater_bookings" : "travel_bookings";
        const bookingRef = adminDb.collection(collection).doc(id);
        const bookingDoc = await bookingRef.get();
        if (!bookingDoc.exists) return { success: false, error: "Reserva no encontrada" };

        const booking = bookingDoc.data() as TheaterBooking;
        const updateData: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };

        if (status === BookingStatus.CONFIRMED) {
            updateData.expiresAt = null;
        }

        const wasActive = booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED;
        const becomesActive = status !== BookingStatus.CANCELLED && status !== BookingStatus.COMPLETED;
        const studentQty = booking.qtyReservedStudents || 0;

        // Adjust slot capacity when activation state changes (theater only)
        if (type === 'theater' && studentQty > 0 && wasActive !== becomesActive) {
            const slotRef = adminDb.collection("event_slots").doc(booking.eventSlotId);
            await adminDb.runTransaction(async (transaction) => {
                const slotDoc = await transaction.get(slotRef);
                if (slotDoc.exists) {
                    const slot = slotDoc.data()!;
                    const delta = becomesActive ? -studentQty : studentQty; // cancel → restore, restore → subtract
                    transaction.update(slotRef, { availableCapacity: (slot.availableCapacity || 0) + delta });
                }
                transaction.update(bookingRef, updateData);
            });
        } else {
            await bookingRef.update(updateData);
        }

        revalidatePath("/calendario");
        revalidatePath("/inbox");
        revalidatePath("/reservas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating booking status:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteBooking(id: string, type: 'theater' | 'travel') {
    try {
        const bookingRef = adminDb.collection(type === 'theater' ? "theater_bookings" : "travel_bookings").doc(id);

        if (type === 'theater') {
            await adminDb.runTransaction(async (transaction) => {
                const doc = await transaction.get(bookingRef);
                if (!doc.exists) return;

                const data = doc.data() as TheaterBooking;
                const slotRef = adminDb.collection("event_slots").doc(data.eventSlotId);
                const slotDoc = await transaction.get(slotRef);

                if (slotDoc.exists) {
                    const slotData = slotDoc.data() as EventSlot;
                    transaction.update(slotRef, {
                        availableCapacity: (slotData.availableCapacity || 0) + (data.qtyReservedStudents || 0)
                    });
                }

                transaction.delete(bookingRef);
            });
        } else {
            await bookingRef.delete();
        }

        revalidatePath("/inbox");
        revalidatePath("/reservas");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting booking:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// REPORTING HELPERS

/** Batch-fetches schools by ID. Skips IDs already covered by denormalized schoolName. */
async function batchFetchSchools(schoolIds: string[]): Promise<Record<string, School>> {
    if (schoolIds.length === 0) return {};
    const map: Record<string, School> = {};
    // Firestore "in" supports max 30 items
    for (let i = 0; i < schoolIds.length; i += 30) {
        const chunk = schoolIds.slice(i, i + 30);
        const snap = await adminDb.collection("schools")
            .where(admin.firestore.FieldPath.documentId(), "in", chunk)
            .get();
        snap.docs.forEach(doc => {
            map[doc.id] = serializeFirestore<School>({ id: doc.id, ...doc.data() });
        });
    }
    return map;
}

export async function getTheaterBookingsBySlot(eventSlotId: string) {
    if (!eventSlotId) return [];
    try {
        const snapshot = await adminDb.collection("theater_bookings")
            .where("eventSlotId", "==", eventSlotId)
            .get();

        const bookings = snapshot.docs
            .map(doc => serializeFirestore<TheaterBooking>({ id: doc.id, ...doc.data() }))
            .filter(b => b.status !== BookingStatus.CANCELLED);

        // Only fetch schools for old docs that lack the denormalized schoolName
        const missingIds = [...new Set(bookings.filter(b => !b.schoolName).map(b => b.schoolId))];
        const schoolMap = await batchFetchSchools(missingIds);

        return bookings.map(booking => ({
            ...booking,
            school: schoolMap[booking.schoolId] ?? null
        }));
    } catch (error) {
        console.error("Error fetching theater bookings:", error);
        return [];
    }
}

export async function getTravelBookingsBySlot(eventSlotId: string) {
    if (!eventSlotId) return [];
    try {
        const snapshot = await adminDb.collection("travel_bookings")
            .where("eventSlotId", "==", eventSlotId)
            .get();

        const bookings = snapshot.docs
            .map(doc => serializeFirestore<TravelBooking>({ id: doc.id, ...doc.data() }))
            .filter(b => b.status !== BookingStatus.CANCELLED);

        const missingIds = [...new Set(bookings.filter(b => !b.schoolName).map(b => b.schoolId))];
        const schoolMap = await batchFetchSchools(missingIds);

        return bookings.map(booking => ({
            ...booking,
            school: schoolMap[booking.schoolId] ?? null
        }));
    } catch (error) {
        console.error("Error fetching travel bookings:", error);
        return [];
    }
}

export async function searchSchools(query: string): Promise<School[]> {
    if (!query) return [];
    try {
        const token = query.toLowerCase().trim();
        const snapshot = await adminDb.collection("schools")
            .where("searchTokens", "array-contains", token)
            .limit(10)
            .get();
        return snapshot.docs.map(doc => serializeFirestore<School>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error searching schools:", error);
        return [];
    }
}

// PEOPLE (ACTORS & ASSISTANTS)
export async function getPeople(): Promise<Person[]> {
    try {
        const snapshot = await adminDb.collection("people")
            .orderBy("lastName", "asc")
            .get();
        return snapshot.docs.map(doc => serializeFirestore<Person>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching people:", error);
        return [];
    }
}

export async function getPersonById(id: string): Promise<Person | null> {
    if (!id) return null;
    try {
        const doc = await adminDb.collection("people").doc(id).get();
        if (!doc.exists) return null;
        return serializeFirestore<Person>({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching person:", error);
        return null;
    }
}

export async function addPerson(person: Omit<Person, "id" | "createdAt" | "updatedAt" | "displayName">) {
    try {
        const now = new Date().toISOString();
        const data = {
            ...person,
            displayName: `${person.firstName} ${person.lastName}`,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await adminDb.collection("people").add(data);
        revalidatePath("/staff");
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        console.error("Error adding person:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updatePerson(id: string, person: Partial<Omit<Person, "id" | "createdAt" | "updatedAt">>) {
    try {
        const now = new Date().toISOString();
        const updateData: Record<string, unknown> = {
            ...person,
            updatedAt: now,
        };
        if (person.firstName || person.lastName) {
            const current = await getPersonById(id);
            if (current) {
                updateData.displayName = `${person.firstName || current.firstName} ${person.lastName || current.lastName}`;
            }
        }
        await adminDb.collection("people").doc(id).update(updateData);
        revalidatePath("/staff");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating person:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deletePerson(id: string) {
    try {
        await adminDb.collection("people").doc(id).delete();
        revalidatePath("/staff");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting person:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// WORK CAST (RELATION BETWEEN WORK & PEOPLE)
export async function getCastByWork(workId: string): Promise<(WorkCast & { person: Person | null })[]> {
    if (!workId) return [];
    try {
        const snapshot = await adminDb.collection("workCast")
            .where("workId", "==", workId)
            .get();

        const castItems = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = serializeFirestore<WorkCast>({ id: doc.id, ...doc.data() });
            const person = await getPersonById(data.personId);
            return { ...data, person };
        }));

        return castItems;
    } catch (error) {
        console.error("Error fetching cast by work:", error);
        return [];
    }
}

export async function assignPersonToWork(castData: Omit<WorkCast, "id" | "createdAt" | "updatedAt">) {
    try {
        const now = new Date().toISOString();
        const id = `work_${castData.workId}__person_${castData.personId}`;
        const data = {
            ...castData,
            createdAt: now,
            updatedAt: now,
        };
        await adminDb.collection("workCast").doc(id).set(data);
        revalidatePath(`/obras/${castData.workId}`);
        return { success: true, id };
    } catch (error: unknown) {
        console.error("Error assigning person to work:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function removePersonFromWork(workId: string, personId: string) {
    try {
        const id = `work_${workId}__person_${personId}`;
        await adminDb.collection("workCast").doc(id).delete();
        revalidatePath(`/obras/${workId}`);
        return { success: true };
    } catch (error: unknown) {
        console.error("Error removing person from work:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getCastByPerson(personId: string): Promise<(WorkCast & { work: Work | null })[]> {
    if (!personId) return [];
    try {
        const snapshot = await adminDb.collection("workCast")
            .where("personId", "==", personId)
            .get();

        const castItems = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = serializeFirestore<WorkCast>({ id: doc.id, ...doc.data() });
            const work = await getWorkById(data.workId);
            return { ...data, work };
        }));

        return castItems;
    } catch (error) {
        console.error("Error fetching cast by person:", error);
        return [];
    }
}

// PERSON RATES
export async function getPersonRates(personId: string): Promise<PersonRate[]> {
    if (!personId) return [];
    try {
        const snapshot = await adminDb.collection("personRates")
            .where("personId", "==", personId)
            .get();
        return snapshot.docs.map(doc => serializeFirestore<PersonRate>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching person rates:", error);
        return [];
    }
}

export async function upsertPersonRate(rate: Omit<PersonRate, "id" | "createdAt" | "updatedAt">) {
    try {
        const now = new Date().toISOString();
        const id = `rate_${rate.personId}_${rate.roleType}_${rate.shiftType}${rate.workId ? `_${rate.workId}` : ""}`;
        const data = {
            ...rate,
            createdAt: now,
            updatedAt: now,
        };
        await adminDb.collection("personRates").doc(id).set(data);
        revalidatePath("/staff");
        return { success: true, id };
    } catch (error: unknown) {
        console.error("Error upserting person rate:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Resuelve qué tipo de bloque de pago corresponde a una jornada.
 */
export async function resolveShiftType(eventDay: EventDay, slots: EventSlot[]): Promise<ShiftType> {
    if (eventDay.type === EventType.TRAVEL) {
        // En Viajera usualmente hay un solo slot o la modalidad define el bloque.
        // Simulamos la lógica basada en cantidad de slots por ahora (Placeholder para travelModality)
        if (slots.length >= 4) return ShiftType.FULL_DAY;
        if (slots.length >= 2) return ShiftType.HALF_DAY_MORNING; // Simplificado
        return ShiftType.HALF_DAY_MORNING;
    } else {
        // Lógica de Teatro: Basada en slots del día
        const morningSlots = slots.filter(s => parseInt(s.startTime.split(':')[0]) < 13);
        const afternoonSlots = slots.filter(s => parseInt(s.startTime.split(':')[0]) >= 13);

        if (slots.length >= 3) return ShiftType.FULL_DAY; // Tu recomendación: 3 slots = FULL_DAY
        if (morningSlots.length > 0 && afternoonSlots.length > 0) return ShiftType.HALF_DAY_MIXED;
        if (afternoonSlots.length > 0) return ShiftType.HALF_DAY_AFTERNOON;
        return ShiftType.HALF_DAY_MORNING;
    }
}

/**
 * Resuelve la tarifa aplicable a una persona para un bloque y obra específicos.
 */
export async function resolvePersonRate(personId: string, roleType: RoleType, shiftType: ShiftType, workId: string): Promise<number> {
    try {
        const rates = await getPersonRates(personId);

        // Filtrar por rol y bloque
        const matchingRates = rates.filter(r => r.roleType === roleType && r.shiftType === shiftType && r.isActive);

        if (matchingRates.length === 0) return 0;

        // Prioridad 1: Override por Obra específica
        const workSpecific = matchingRates.find(r => r.workId === workId);
        if (workSpecific) return workSpecific.amount;

        // Prioridad 2: Tarifa general (sin workId)
        const general = matchingRates.find(r => !r.workId);
        if (general) return general.amount;

        // Prioridad 3: El que tenga mayor prioridad numérica
        return matchingRates.sort((a, b) => b.priority - a.priority)[0].amount;
    } catch (error) {
        console.error("Error resolving person rate:", error);
        return 0;
    }
}

// PAYOUTS (LIQUIDACIONES)
export async function getPayouts(filters?: { personId?: string, status?: PayoutStatus, startDate?: string, endDate?: string }): Promise<(Payout & { person: Person | null, work: Work | null })[]> {
    try {
        let query: admin.firestore.Query = adminDb.collection("payouts");

        if (filters?.personId) query = query.where("personId", "==", filters.personId);
        if (filters?.status) query = query.where("status", "==", filters.status);
        if (filters?.startDate) query = query.where("date", ">=", filters.startDate);
        if (filters?.endDate) query = query.where("date", "<=", filters.endDate);

        const snapshot = await query.orderBy("date", "desc").get();
        const rawPayouts = snapshot.docs.map(doc =>
            serializeFirestore<Payout>({ id: doc.id, ...doc.data() })
        );

        // Only batch-fetch for old docs missing denormalized fields
        const missingPersonIds = [...new Set(rawPayouts.filter(p => !p.personName).map(p => p.personId))];
        const missingWorkIds = [...new Set(rawPayouts.filter(p => !p.workTitle).map(p => p.workId))];

        const personMap: Record<string, Person> = {};
        const workMap: Record<string, Work> = {};

        await Promise.all([
            (async () => {
                for (let i = 0; i < missingPersonIds.length; i += 30) {
                    const chunk = missingPersonIds.slice(i, i + 30);
                    const snap = await adminDb.collection("people")
                        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
                        .get();
                    snap.docs.forEach(doc => {
                        personMap[doc.id] = serializeFirestore<Person>({ id: doc.id, ...doc.data() });
                    });
                }
            })(),
            (async () => {
                for (let i = 0; i < missingWorkIds.length; i += 30) {
                    const chunk = missingWorkIds.slice(i, i + 30);
                    const snap = await adminDb.collection("works")
                        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
                        .get();
                    snap.docs.forEach(doc => {
                        workMap[doc.id] = serializeFirestore<Work>({ id: doc.id, ...doc.data() });
                    });
                }
            })()
        ]);

        return rawPayouts.map(p => ({
            ...p,
            person: personMap[p.personId] ?? null,
            work: workMap[p.workId] ?? null,
        }));
    } catch (error) {
        console.error("Error fetching payouts:", error);
        return [];
    }
}

/**
 * Genera automáticamente las liquidaciones para una jornada específica.
 * Idempotente: Si ya existe un payout aprobado/pagado para esa persona ese día, no lo pisa.
 */
export async function generatePayoutsForDay(eventDayId: string) {
    try {
        const eventDay = await getEventDayById(eventDayId);
        if (!eventDay) throw new Error("Jornada no encontrada");

        const slots = await getSlotsByEventDay(eventDayId);
        if (slots.length === 0) return { success: true, message: "Sin slots, nada que liquidar" };

        const workId = slots[0].workId; // Asumimos una obra por día por ahora
        const shiftType = await resolveShiftType(eventDay, slots);
        const cast = await getCastByWork(workId);

        if (cast.length === 0) return { success: true, message: "Obra sin elenco asignado" };

        // Batch fetch work title + person names for denormalization
        const [workDoc, ...personDocs] = await Promise.all([
            adminDb.collection("works").doc(workId).get(),
            ...cast.map(c => adminDb.collection("people").doc(c.personId).get())
        ]);
        const workTitle = workDoc.exists ? (workDoc.data() as Work).title : undefined;
        const personNameMap: Record<string, string> = {};
        cast.forEach((c, i) => {
            const doc = personDocs[i];
            if (doc.exists) personNameMap[c.personId] = (doc.data() as Person).displayName;
        });

        const batch = adminDb.batch();
        const now = new Date().toISOString();

        for (const castMember of cast) {
            const personId = castMember.personId;
            const roleType = castMember.roleType;
            const payoutId = `payout_${eventDayId}__${personId}`;

            // Verificar si ya existe un payout procesado
            const existingRef = adminDb.collection("payouts").doc(payoutId);
            const existingDoc = await existingRef.get();

            if (existingDoc.exists) {
                const existingData = existingDoc.data() as Payout;
                if (existingData.status !== PayoutStatus.PENDING) continue; // No tocar si ya está aprobado/pagado
            }

            const amount = await resolvePersonRate(personId, roleType, shiftType, workId);

            const payoutData: Payout = {
                id: payoutId,
                eventDayId,
                date: eventDay.date,
                workId,
                workTitle,
                personId,
                personName: personNameMap[personId],
                roleType,
                shiftType,
                units: 1,
                amount,
                currency: "ARS",
                status: PayoutStatus.PENDING,
                createdAt: now,
                updatedAt: now,
            };

            batch.set(existingRef, payoutData);
        }

        await batch.commit();
        revalidatePath("/liquidaciones");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error generating payouts:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updatePayoutStatus(id: string, status: PayoutStatus, notes?: string) {
    try {
        const now = new Date().toISOString();
        const updateData: Partial<Payout> = {
            status,
            updatedAt: now
        };
        if (notes !== undefined) updateData.notes = notes;

        await adminDb.collection("payouts").doc(id).update(updateData);
        revalidatePath("/liquidaciones");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating payout status:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// --- REPORTING & CLOSEOUT ACTIONS ---

/**
 * Actualiza la asistencia de una reserva de teatro y recalcula el monto final.
 */
export async function updateTheaterBookingAttendance(
    id: string,
    attendedData: { students: number; adults: number },
    policy?: BillingPolicy
) {
    try {
        const bookingRef = adminDb.collection("theater_bookings").doc(id);
        const doc = await bookingRef.get();
        if (!doc.exists) throw new Error("Reserva no encontrada");

        const data = doc.data() as TheaterBooking;
        const currentPolicy = policy || data.billingPolicy || BillingPolicy.RESERVED;

        let totalFinal = 0;
        if (currentPolicy === BillingPolicy.RESERVED) {
            totalFinal = (data.qtyReservedStudents * data.unitPriceStudent) + (data.qtyReservedAdults * data.unitPriceAdult);
        } else if (currentPolicy === BillingPolicy.ATTENDED) {
            totalFinal = (attendedData.students * data.unitPriceStudent) + (attendedData.adults * data.unitPriceAdult);
        } else {
            // CUSTOM: Por ahora mismo que attended
            totalFinal = (attendedData.students * data.unitPriceStudent) + (attendedData.adults * data.unitPriceAdult);
        }

        await bookingRef.update({
            qtyAttendedStudents: attendedData.students,
            qtyAttendedAdults: attendedData.adults,
            billingPolicy: currentPolicy,
            totalFinal,
            attendanceStatus: AttendanceStatus.FINAL,
            updatedAt: new Date().toISOString()
        });

        revalidatePath("/reservas");
        return { success: true };
    } catch (error) {
        console.error("Error updating theater attendance:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Actualiza la asistencia de una reserva de viajera.
 */
export async function updateTravelBookingAttendance(
    id: string,
    attendedData: { students: number; adults: number }
) {
    try {
        await adminDb.collection("travel_bookings").doc(id).update({
            qtyAttendedStudents: attendedData.students,
            qtyAttendedAdults: attendedData.adults,
            attendanceStatus: AttendanceStatus.FINAL,
            updatedAt: new Date().toISOString()
        });

        revalidatePath("/reservas");
        return { success: true };
    } catch (error) {
        console.error("Error updating travel attendance:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Cierre de jornada: Marca el día como CLOSED y genera los reportes/snapshots.
 */
export async function closeEventDay(eventDayId: string) {
    try {
        const dayRef = adminDb.collection("event_days").doc(eventDayId);
        const dayDoc = await dayRef.get();
        if (!dayDoc.exists) throw new Error("Jornada no encontrada");

        const dayData = dayDoc.data() as EventDay;
        if (dayData.status === "CLOSED") return { success: true, message: "Ya está cerrada" };

        // 1. Generar resumen diario (Snapshot)
        const summaryResult = await generateDailySummary(eventDayId);
        if (!summaryResult.success) throw new Error(summaryResult.error);

        // 2. Marcar como cerrado
        const now = new Date().toISOString();
        await dayRef.update({
            status: "CLOSED",
            closedAt: now,
            updatedAt: now
        });

        // 3. Actualizar agregados (Mes, Temporada)
        if (summaryResult.summary) {
            await applyDailySummaryToAggregates(summaryResult.summary);
        }

        revalidatePath("/calendario");
        revalidatePath("/reportes");
        return { success: true };
    } catch (error) {
        console.error("Error closing event day:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Genera el snapshot DailySummary leyendo todas las fuentes de datos del día.
 */
async function generateDailySummary(eventDayId: string): Promise<{ success: boolean; summary?: DailySummary; error?: string }> {
    try {
        const day = await getEventDayById(eventDayId);
        if (!day) throw new Error("Day not found");

        const slots = await getSlotsByEventDay(eventDayId);
        const now = new Date().toISOString();

        // Agregadores
        let reservedStudents = 0, reservedAdults = 0;
        let attendedStudents = 0, attendedAdults = 0;
        let expectedRev = 0, finalRev = 0;
        let ticketsStudents = 0, ticketsAdults = 0, fixedTravel = 0;

        // IDs para el resumen (usaremos el primero que encontremos si es necesario)
        let firstWorkId = "";

        for (const slot of slots) {
            if (!firstWorkId) firstWorkId = slot.workId;

            const [theaterBookings, travelBookings] = await Promise.all([
                getTheaterBookingsBySlot(slot.id),
                getTravelBookingsBySlot(slot.id)
            ]);

            theaterBookings.forEach(b => {
                if (b.status === BookingStatus.CANCELLED) return;
                reservedStudents += b.qtyReservedStudents || 0;
                reservedAdults += b.qtyReservedAdults || 0;
                attendedStudents += b.qtyAttendedStudents ?? (b.qtyReservedStudents ?? 0);
                attendedAdults += b.qtyAttendedAdults ?? (b.qtyReservedAdults ?? 0);

                expectedRev += b.totalExpected ?? 0;
                finalRev += b.totalFinal ?? b.totalExpected ?? 0;

                ticketsStudents += (b.qtyAttendedStudents ?? b.qtyReservedStudents ?? 0) * (b.unitPriceStudent ?? 0);
                ticketsAdults += (b.qtyAttendedAdults ?? b.qtyReservedAdults ?? 0) * (b.unitPriceAdult ?? 0);
            });

            travelBookings.forEach(b => {
                if (b.status === BookingStatus.CANCELLED) return;
                reservedStudents += b.qtyReservedStudents ?? 0;
                reservedAdults += b.qtyReservedAdults ?? 0;
                attendedStudents += b.qtyAttendedStudents ?? (b.qtyReservedStudents ?? 0);
                attendedAdults += b.qtyAttendedAdults ?? (b.qtyReservedAdults ?? 0);

                expectedRev += b.totalPrice || 0;
                finalRev += b.totalPrice || 0;
                fixedTravel += b.totalPrice || 0;
            });
        }

        // Costos (Payouts)
        const dayPayouts = await getPayouts({ startDate: day.date, endDate: day.date });
        const staffTotal = dayPayouts.reduce((acc, p) => acc + p.amount, 0);
        const actorsTotal = dayPayouts.filter(p => p.roleType === RoleType.ACTOR).reduce((acc, p) => acc + p.amount, 0);
        const assistantsTotal = dayPayouts.filter(p => p.roleType === RoleType.ASSISTANT).reduce((acc, p) => acc + p.amount, 0);

        const summaryId = `daily_${day.date}_${day.type}_${eventDayId}`;
        const summary: DailySummary = {
            id: summaryId,
            date: day.date,
            type: day.type,
            seasonId: day.seasonId,
            workId: firstWorkId,
            venueId: day.type === EventType.THEATER ? day.locationId : undefined,
            schoolId: day.type === EventType.TRAVEL ? day.locationId : undefined,
            shiftType: await resolveShiftType(day, slots),
            attendance: { reservedStudents, reservedAdults, attendedStudents, attendedAdults },
            revenue: {
                expected: expectedRev,
                final: finalRev,
                currency: "ARS",
                breakdown: { ticketsStudents, ticketsAdults, fixedTravel }
            },
            costs: { staffTotal, actorsTotal, assistantsTotal },
            margin: { gross: finalRev - staffTotal },
            status: "CLOSED",
            closedAt: now,
            createdAt: now,
            updatedAt: now
        };

        await adminDb.collection("daily_summaries").doc(summaryId).set(summary);
        return { success: true, summary };
    } catch (error) {
        console.error("Error generating daily summary:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Actualiza los agregados mensuales y de temporada basándose en un resumen diario.
 */
async function applyDailySummaryToAggregates(summary: DailySummary) {
    const monthId = `month_${summary.date.substring(0, 7)}`;
    const seasonId = `season_${summary.seasonId}`;

    const now = new Date().toISOString();

    // 1. Monthly Summary
    const monthRef = adminDb.collection("monthly_summaries").doc(monthId);
    await monthRef.set({
        month: summary.date.substring(0, 7),
        revenueTotal: admin.firestore.FieldValue.increment(summary.revenue.final),
        costsTotal: admin.firestore.FieldValue.increment(summary.costs.staffTotal),
        marginTotal: admin.firestore.FieldValue.increment(summary.margin.gross),
        attendanceTotal: admin.firestore.FieldValue.increment(summary.attendance.attendedStudents),
        typeBreakdown: {
            theater: admin.firestore.FieldValue.increment(summary.type === EventType.THEATER ? summary.revenue.final : 0),
            travel: admin.firestore.FieldValue.increment(summary.type === EventType.TRAVEL ? summary.revenue.final : 0),
        },
        updatedAt: now
    }, { merge: true });

    // 2. Season Summary
    const seasonRef = adminDb.collection("season_summaries").doc(seasonId);
    await seasonRef.set({
        seasonId: summary.seasonId,
        revenueTotal: admin.firestore.FieldValue.increment(summary.revenue.final),
        marginTotal: admin.firestore.FieldValue.increment(summary.margin.gross),
        attendanceTotal: admin.firestore.FieldValue.increment(summary.attendance.attendedStudents),
        updatedAt: now
    }, { merge: true });
}

export async function getMonthlySummaries() {
    try {
        const snapshot = await adminDb.collection("monthly_summaries").orderBy("month", "desc").get();
        return snapshot.docs.map(doc => serializeFirestore<MonthlySummary>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching monthly summaries:", error);
        return [];
    }
}

export async function getDailySummaries(filters?: { startDate?: string, endDate?: string }) {
    try {
        let query: admin.firestore.Query = adminDb.collection("daily_summaries");
        if (filters?.startDate) query = query.where("date", ">=", filters.startDate);
        if (filters?.endDate) query = query.where("date", "<=", filters.endDate);

        const snapshot = await query.orderBy("date", "desc").get();
        return snapshot.docs.map(doc => serializeFirestore<DailySummary>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching daily summaries:", error);
        return [];
    }
}// PRICING RULES (Mission P1 & P2)
export async function getPricingRules(): Promise<PricingRule[]> {
    try {
        const snapshot = await adminDb.collection("pricingRules")
            .orderBy("validFrom", "desc")
            .get();
        return snapshot.docs.map(doc => serializeFirestore<PricingRule>({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching pricing rules:", error);
        return [];
    }
}

export async function addPricingRule(rule: Omit<PricingRule, "id" | "createdAt" | "updatedAt">) {
    try {
        const now = new Date().toISOString();
        const docRef = await adminDb.collection("pricingRules").add({
            ...rule,
            createdAt: now,
            updatedAt: now,
        });
        revalidatePath("/reportes");
        revalidatePath("/ajustes");
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        console.error("Error adding pricing rule:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updatePricingRule(id: string, updates: Partial<PricingRule>) {
    try {
        const now = new Date().toISOString();
        await adminDb.collection("pricingRules").doc(id).update({
            ...updates,
            updatedAt: now,
        });
        revalidatePath("/reportes");
        revalidatePath("/ajustes");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating pricing rule:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deletePricingRule(id: string) {
    try {
        await adminDb.collection("pricingRules").doc(id).delete();
        revalidatePath("/ajustes");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting pricing rule:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Resolves the active pricing rule for a specific date and type.
 * Rule must satisfy: validFrom <= date <= validTo
 * Mission P2
 */
export async function resolvePricing(date: string, type: PricingType, seasonId?: string): Promise<{ success: boolean; rule?: PricingRule; error?: string }> {
    try {
        const snapshot = await adminDb.collection("pricingRules")
            .where("type", "==", type)
            .where("isActive", "==", true)
            .get();

        const rules = snapshot.docs.map(doc => serializeFirestore<PricingRule>({ id: doc.id, ...doc.data() }));

        const dateObj = new Date(date + "T12:00:00");
        const matches = rules.filter(rule => {
            const from = new Date(rule.validFrom + "T00:00:00");
            const to = new Date(rule.validTo + "T23:59:59");
            const seasonMatch = !rule.seasonId || rule.seasonId === seasonId;
            return dateObj >= from && dateObj <= to && seasonMatch;
        });

        if (matches.length === 0) {
            return { success: false, error: `No se encontró una regla de precios vigente para la fecha ${date}.` };
        }

        if (matches.length > 1) {
            // Priority: Season-specific rules over Global rules
            const seasonSpecific = matches.find(m => m.scope === "SEASON");
            if (seasonSpecific) return { success: true, rule: seasonSpecific };

            return { success: false, error: `Se encontraron múltiples reglas de precios (${matches.length}) superpuestas para la fecha ${date}.` };
        }

        return { success: true, rule: matches[0] };
    } catch (error) {
        console.error("Error resolving pricing:", error);
        return { success: false, error: "Error al resolver precios." };
    }
}
