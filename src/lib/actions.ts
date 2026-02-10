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

// EVENTS (EventDay + EventSlot)
export async function getEventDays(): Promise<EventDay[]> {
    try {
        const snapshot = await adminDb.collection("event_days").orderBy("date", "asc").get();
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
                // Handle both string array and SlotTemplate object formats
                venue.defaultSlotTemplate.forEach((template) => {
                    const slotRef = adminDb.collection("event_slots").doc();

                    let startTime: string;
                    let endTime: string;

                    if (typeof (template as unknown) === 'string') {
                        const timeStr = template as unknown as string;
                        startTime = timeStr;
                        const endHour = (parseInt(timeStr.split(':')[0]) + 2).toString().padStart(2, '0');
                        endTime = `${endHour}:${timeStr.split(':')[1]}`;
                    } else {
                        const t = template as SlotTemplate;
                        startTime = t.startTime;
                        endTime = t.endTime;
                    }

                    const slotData: Omit<EventSlot, "id"> = {
                        eventDayId,
                        workId,
                        startTime,
                        endTime,
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
        const slotRef = adminDb.collection("event_slots").doc(booking.eventSlotId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const slotDoc = await transaction.get(slotRef);
            if (!slotDoc.exists) throw new Error("El slot no existe.");

            const slotData = slotDoc.data() as EventSlot;
            const currentOccupancy = await getSlotOccupancy(booking.eventSlotId);

            if (currentOccupancy + booking.qtyReservedStudents > slotData.totalCapacity) {
                throw new Error(`Capacidad excedida. Disponible: ${slotData.totalCapacity - currentOccupancy}`);
            }

            const bookingRef = adminDb.collection("theater_bookings").doc();
            const now = new Date().toISOString();
            const expiresAt = isHold ? addHours(new Date(), 72).toISOString() : undefined;

            const newBooking: Omit<TheaterBooking, "id"> = {
                ...booking,
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
        const now = new Date().toISOString();
        const bookingRef = await adminDb.collection("travel_bookings").add({
            ...booking,
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

        const theaterItems = await Promise.all(theaterSnap.docs.map(async (doc) => {
            const data = serializeFirestore<TheaterBooking>({ id: doc.id, ...doc.data() });
            const school = await getSchoolById(data.schoolId);
            const slotDetails = await getSlotDetails(data.eventSlotId);
            return { ...data, school, slotDetails, type: 'theater' as const };
        }));

        const travelItems = await Promise.all(travelSnap.docs.map(async (doc) => {
            const data = serializeFirestore<TravelBooking>({ id: doc.id, ...doc.data() });
            const school = await getSchoolById(data.schoolId);
            const slotDetails = await getSlotDetails(data.eventSlotId);
            return { ...data, school, slotDetails, type: 'travel' as const };
        }));

        return [...theaterItems, ...travelItems].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
        console.error("Error fetching inbox items:", error);
        return [];
    }
}

export async function updateBookingStatus(id: string, type: 'theater' | 'travel', status: BookingStatus) {
    try {
        const collection = type === 'theater' ? "theater_bookings" : "travel_bookings";
        const updateData: Record<string, unknown> = { status };

        // If confirming, remove expiration
        if (status === BookingStatus.CONFIRMED) {
            updateData.expiresAt = null;
        }

        await adminDb.collection(collection).doc(id).update(updateData);
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
export async function getTheaterBookingsBySlot(eventSlotId: string) {
    if (!eventSlotId) return [];
    try {
        const snapshot = await adminDb.collection("theater_bookings")
            .where("eventSlotId", "==", eventSlotId)
            // .where("status", "in", [BookingStatus.CONFIRMED, BookingStatus.HOLD]) // Maybe we want pending too for the report? User said "list of schools". I'll include all non-cancelled.
            .get();

        const bookings = snapshot.docs
            .map(doc => serializeFirestore<TheaterBooking>({ id: doc.id, ...doc.data() }))
            .filter(b => b.status !== BookingStatus.CANCELLED);

        const bookingsWithSchools = await Promise.all(bookings.map(async (booking) => {
            const school = await getSchoolById(booking.schoolId);
            return { ...booking, school };
        }));

        return bookingsWithSchools;
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

        const bookingsWithSchools = await Promise.all(bookings.map(async (booking) => {
            const school = await getSchoolById(booking.schoolId);
            return { ...booking, school };
        }));

        return bookingsWithSchools;
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

        const payouts = await Promise.all(snapshot.docs.map(async (doc: admin.firestore.QueryDocumentSnapshot) => {
            const data = serializeFirestore<Payout>({ id: doc.id, ...doc.data() });
            const [person, work] = await Promise.all([
                getPersonById(data.personId),
                getWorkById(data.workId)
            ]);
            return { ...data, person, work };
        }));

        return payouts;
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
                personId,
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
                attendedStudents += b.qtyAttendedStudents || (b.qtyReservedStudents || 0);
                attendedAdults += b.qtyAttendedAdults || (b.qtyReservedAdults || 0);

                expectedRev += b.totalExpected || 0;
                finalRev += b.totalFinal || b.totalExpected || 0;

                ticketsStudents += (b.qtyAttendedStudents || b.qtyReservedStudents || 0) * (b.unitPriceStudent || 0);
                ticketsAdults += (b.qtyAttendedAdults || b.qtyReservedAdults || 0) * (b.unitPriceAdult || 0);
            });

            travelBookings.forEach(b => {
                if (b.status === BookingStatus.CANCELLED) return;
                reservedStudents += b.qtyReservedStudents || 0;
                reservedAdults += b.qtyReservedAdults || 0;
                attendedStudents += b.qtyAttendedStudents || (b.qtyReservedStudents || 0);
                attendedAdults += b.qtyAttendedAdults || (b.qtyReservedAdults || 0);

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
