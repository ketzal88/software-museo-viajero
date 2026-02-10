"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Venue, School, Work, Season, EventDay, EventSlot, EventType, TheaterBooking, TravelBooking, BookingStatus, SlotTemplate } from "@/types";
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
                return acc + data.countStudents;
            }
            return acc;
        }, 0);
    } catch (error) {
        console.error("Error calculating occupancy:", error);
        return 0;
    }
}

export async function addTheaterBooking(booking: Omit<TheaterBooking, "id" | "createdAt" | "status">, isHold: boolean = true) {
    try {
        const slotRef = adminDb.collection("event_slots").doc(booking.eventSlotId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const slotDoc = await transaction.get(slotRef);
            if (!slotDoc.exists) throw new Error("El slot no existe.");

            const slotData = slotDoc.data() as EventSlot;
            const currentOccupancy = await getSlotOccupancy(booking.eventSlotId);

            if (currentOccupancy + booking.countStudents > slotData.totalCapacity) {
                throw new Error(`Capacidad excedida. Disponible: ${slotData.totalCapacity - currentOccupancy}`);
            }

            const bookingRef = adminDb.collection("theater_bookings").doc();
            const now = new Date();
            const expiresAt = isHold ? addHours(now, 72).toISOString() : undefined;

            const newBooking: Omit<TheaterBooking, "id"> = {
                ...booking,
                createdAt: now.toISOString(),
                status: isHold ? BookingStatus.HOLD : BookingStatus.PENDING,
                expiresAt,
            };

            transaction.set(bookingRef, newBooking);

            // Update available capacity in slot
            transaction.update(slotRef, {
                availableCapacity: slotData.totalCapacity - (currentOccupancy + booking.countStudents)
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

export async function addTravelBooking(booking: Omit<TravelBooking, "id" | "createdAt" | "status">) {
    try {
        const bookingRef = await adminDb.collection("travel_bookings").add({
            ...booking,
            createdAt: new Date().toISOString(),
            status: BookingStatus.PENDING,
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
                        availableCapacity: slotData.availableCapacity + data.countStudents
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
