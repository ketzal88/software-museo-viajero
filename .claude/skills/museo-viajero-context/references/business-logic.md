# Business Logic Rules

## Table of Contents
- [Event Lifecycle](#event-lifecycle)
- [Reservation Flow](#reservation-flow)
- [Pricing System](#pricing-system)
- [Attendance & Billing](#attendance--billing)
- [Payout System](#payout-system)
- [Search & Autocomplete](#search--autocomplete)

## Event Lifecycle

### Creating an Event Day
1. Select type: THEATER or TRAVEL
2. Select season, date, and venue (theater) or location info (travel)
3. Select work (play) to perform
4. System auto-generates `event_slots` from venue's `defaultSlotTemplate`
5. Event day created with status OPEN

### Closing an Event Day (Full Cascade)
```
closeEventDay(eventDayId):
1. Verify all bookings have attendance recorded (attendanceStatus = FINAL)
2. For each booking: recalculate totalFinal based on billingPolicy
   - RESERVED: totalFinal = reserved qty * unit price
   - ATTENDED: totalFinal = attended qty * unit price
   - CUSTOM: totalFinal = manually entered amount
3. Generate DailySummary (revenue, costs, margin snapshot)
4. Generate Payouts for each cast member assigned to the work
5. Set EventDay status = CLOSED, closedAt = now()
6. Apply daily summary to monthly and season aggregates
```

## Reservation Flow

### Theater Booking Flow
```
1. User navigates to calendar day -> clicks slot -> "Create Booking"
2. System calls resolvePricing(date, THEATER_TICKET, seasonId)
3. User enters: school, student qty, adult qty, billing policy
4. If isHold=true: status=HOLD, expiresAt=now()+72h
5. Server Action (TRANSACTIONAL):
   a. Read slot's availableCapacity inside transaction
   b. Validate: qtyReserved <= availableCapacity
   c. Create booking with snapshot prices (unitPriceStudent, unitPriceAdult)
   d. Decrement slot.availableCapacity
   e. Commit transaction
6. Status lifecycle: HOLD -> PENDING -> CONFIRMED -> COMPLETED
```

### Travel Booking Flow
```
1. User selects school and modality
2. Modality determines capacity range:
   - CLASSROOM: 1-40 students
   - DOUBLE_CLASSROOM: 41-80 students
   - AUDITORIUM: 81+ students
3. System resolves fixed price per modality from pricing rules
4. Creates booking with totalPrice snapshot
5. Same status lifecycle as theater
```

### Booking Status Transitions
```
HOLD ---------> PENDING (manual confirmation or 72h auto-expire)
PENDING ------> CONFIRMED (payment received / verified)
CONFIRMED ----> COMPLETED (event closed, attendance final)
Any status ---> CANCELLED (manual cancellation, restores capacity)
```

## Pricing System

### Price Resolution Algorithm
```
resolvePricing(date, type, seasonId?):
1. Query pricingRules where:
   - type matches (THEATER_TICKET or TRAVEL_FORMAT)
   - validFrom <= date <= validTo
   - isActive = true
2. Priority:
   a. Season-scoped rule matching seasonId (scope=SEASON)
   b. Global rule (scope=GLOBAL)
3. Return matching rule with values map
```

### Price Snapshot Principle
- At booking creation, prices are copied from the active rule into the booking record
- `pricingRuleId` stored for audit trail
- Booking prices NEVER change even if the pricing rule is later modified
- This prevents retroactive price changes on existing bookings

### Pricing Rule Structure
- **THEATER_TICKET**: `values: { student: number, adult: number }` (per-ticket prices)
- **TRAVEL_FORMAT**: `values: { classroom: number, double_classroom: number, auditorium: number }` (fixed per-modality)
- Rules have date ranges (`validFrom`, `validTo`) for versioning
- Multiple rules can exist; resolution picks the best match

## Attendance & Billing

### Recording Attendance
1. On the event day detail page, each booking shows attendance fields
2. User enters `qtyAttendedStudents` and `qtyAttendedAdults`
3. System sets `attendanceStatus = FINAL`

### Total Calculation by Policy
```
RESERVED policy:
  totalFinal = (qtyReservedStudents * unitPriceStudent) + (qtyReservedAdults * unitPriceAdult)

ATTENDED policy:
  totalFinal = (qtyAttendedStudents * unitPriceStudent) + (qtyAttendedAdults * unitPriceAdult)

CUSTOM policy:
  totalFinal = manually entered amount at closeout
```

## Payout System

### Shift Type Resolution
```
resolveShiftType(eventDay, slots):
  if slots.length >= 3: return FULL_DAY

  hasMorning = any slot starts before 13:00
  hasAfternoon = any slot starts at/after 13:00

  if hasMorning && hasAfternoon: return HALF_DAY_MIXED
  if hasAfternoon: return HALF_DAY_AFTERNOON
  return HALF_DAY_MORNING
```

### Rate Resolution Priority
```
resolvePersonRate(personId, roleType, shiftType, workId?):
  1. Look for rate where personId + roleType + shiftType + workId matches (work-specific)
  2. If not found: look for rate where personId + roleType + shiftType + no workId (general)
  3. If still not found: look for rate with highest priority number
  4. Return resolved amount (ARS)
```

### Payout Generation
```
generatePayoutsForDay(eventDayId):
  1. Get all event slots for the day
  2. Determine shiftType from slots
  3. For each slot, get work's cast (workCasts where workId matches)
  4. For each cast member:
     a. Check if payout already exists for this person+day
     b. If exists and status is APPROVED or PAID: SKIP (immutable)
     c. If exists and status is PENDING: UPDATE amount
     d. If not exists: CREATE new payout
     e. Resolve rate: resolvePersonRate(personId, roleType, shiftType, workId)
     f. Set payout amount = resolved rate * units
```

### Payout Lifecycle
```
PENDING -----> APPROVED (manager review, can still edit notes)
APPROVED ----> PAID (accounting confirms payment)

APPROVED and PAID payouts are immutable - never overwritten by regeneration.
```

## Search & Autocomplete

### School Search Tokens
```
buildSearchTokens(name):
  1. Normalize: lowercase, remove accents (a/e/i/o/u)
  2. Split into words
  3. Generate all prefixes for each word (min 2 chars)
  Example: "Escuela N 5" -> ["es", "esc", "escu", "escue", "escuel", "escuela", "n", "5"]
```

Firestore query uses `array-contains-any` on searchTokens for prefix matching.

### School Autocomplete Component
- `SchoolAutocomplete` component in `features/schools/components/`
- Debounced input triggers search
- Shows matching schools in dropdown
- Selecting a school populates the booking form's schoolId
