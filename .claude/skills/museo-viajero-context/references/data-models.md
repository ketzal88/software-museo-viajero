# Data Models - Firestore Collections & TypeScript Types

## Table of Contents
- [Enums](#enums)
- [Master Data Collections](#master-data-collections)
- [Events & Bookings Collections](#events--bookings-collections)
- [Staff & Compensation Collections](#staff--compensation-collections)
- [Pricing Collection](#pricing-collection)
- [Reporting Collections](#reporting-collections)
- [Server Actions Reference](#server-actions-reference)

## Enums

```typescript
enum EventType { THEATER = "theater", TRAVEL = "travel" }
enum EventStatus { OPEN = "OPEN", CLOSED = "CLOSED" }
enum BookingStatus { HOLD = "HOLD", PENDING = "PENDING", CONFIRMED = "CONFIRMED", COMPLETED = "COMPLETED", CANCELLED = "CANCELLED" }
enum AttendanceStatus { PENDING = "PENDING", FINAL = "FINAL" }
enum BillingPolicy { RESERVED = "RESERVED", ATTENDED = "ATTENDED", CUSTOM = "CUSTOM" }
enum TravelModality { CLASSROOM = "classroom", DOUBLE_CLASSROOM = "double_classroom", AUDITORIUM = "auditorium" }
enum RoleType { ACTOR = "actor", ASSISTANT = "assistant", STAFF = "staff" }
enum ShiftType { HALF_DAY_MORNING = "half_day_morning", HALF_DAY_AFTERNOON = "half_day_afternoon", HALF_DAY_MIXED = "half_day_mixed", FULL_DAY = "full_day" }
enum PayoutStatus { PENDING = "pending", APPROVED = "approved", PAID = "paid" }
enum PricingType { THEATER_TICKET = "THEATER_TICKET", TRAVEL_FORMAT = "TRAVEL_FORMAT" }
enum PricingScope { GLOBAL = "GLOBAL", SEASON = "SEASON" }
```

## Master Data Collections

### `venues` - Theater/venue locations
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| name | string | Venue name |
| address / addressLine | string | Street address |
| defaultCapacity | number | Max seats |
| defaultSlotTemplate | SlotTemplate[] | Time slots with labels (startTime, endTime, label) |
| mapsUrl | string | Google Maps link |
| isActive | boolean | Soft delete flag |

### `schools` - Customer institutions
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| name | string | School name |
| district | string | District/partido |
| address | string | Street address |
| email | string | Contact email |
| phone | string | Contact phone |
| isPrivate | boolean | Public/private school |
| searchTokens | string[] | For prefix autocomplete |
| displayLabel | string | Formatted display name |

### `works` - Plays/theatrical works
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| title | string | Play title |
| description | string | Synopsis |
| duration | number | Minutes |
| tags | string[] | Genre tags |
| audienceTags | string[] | Target audience |
| isActive | boolean | Soft delete flag |

### `seasons` - Theatrical seasons
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| name | string | Season name |
| startDate | string | ISO date |
| endDate | string | ISO date |
| workIds | string[] | Assigned works |
| isActive | boolean | Currently active |

## Events & Bookings Collections

### `event_days` - Individual performance days
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| date | string | ISO date (YYYY-MM-DD) |
| type | "theater" / "travel" | Event type |
| seasonId | string | Associated season |
| locationId | string | Venue ID (theater) or school area |
| status | "OPEN" / "CLOSED" | Whether day is finalized |
| closedAt | string | Timestamp of closure |
| updatedAt | string | Last update timestamp |

### `event_slots` - Time slots within a day
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| eventDayId | string | Parent event day |
| workId | string | Which play |
| startTime | string | HH:mm format |
| endTime | string | HH:mm format |
| totalCapacity | number | Max capacity |
| availableCapacity | number | Decreases with bookings |

### `theater_bookings` - Fixed-venue bookings
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| eventSlotId | string | Target slot |
| schoolId | string | Customer school |
| qtyReservedStudents | number | Reserved student count |
| qtyReservedAdults | number | Reserved adult count |
| qtyAttendedStudents | number | Actual attendance (filled at closeout) |
| qtyAttendedAdults | number | Actual attendance |
| unitPriceStudent | number | **Snapshot** at booking time |
| unitPriceAdult | number | **Snapshot** at booking time |
| totalExpected | number | Calculated from reserved * price |
| totalFinal | number | Recalculated at closeout |
| billingPolicy | BillingPolicy | RESERVED / ATTENDED / CUSTOM |
| status | BookingStatus | HOLD -> PENDING -> CONFIRMED -> COMPLETED |
| attendanceStatus | AttendanceStatus | PENDING / FINAL |
| pricingRuleId | string | Audit trail |
| expiresAt | string | For HOLD status (72 hours) |
| createdAt, updatedAt | string | Timestamps |

### `travel_bookings` - School-based performances
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| eventSlotId | string | Target slot |
| schoolId | string | Host school |
| modality | TravelModality | classroom / double_classroom / auditorium |
| qtyReservedStudents | number | Reserved count |
| qtyReservedAdults | number | Reserved count |
| qtyAttendedStudents | number | Actual (closeout) |
| qtyAttendedAdults | number | Actual (closeout) |
| totalPrice | number | **Fixed snapshot** per modality |
| status | BookingStatus | Same lifecycle as theater |
| attendanceStatus | AttendanceStatus | PENDING / FINAL |
| pricingRuleId | string | Audit trail |
| createdAt, updatedAt | string | Timestamps |

## Staff & Compensation Collections

### `people` - Artists and staff
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| firstName | string | First name |
| lastName | string | Last name |
| displayName | string | Formatted display |
| roleTypes | RoleType[] | actor / assistant / staff |
| phone | string | Contact |
| email | string | Contact |
| isActive | boolean | Soft delete |
| createdAt, updatedAt | string | Timestamps |

### `workCasts` - Artist-Work assignments
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| workId | string | Which play |
| personId | string | Which artist |
| roleType | RoleType | Role in this work |
| characterName | string | Character played |
| isPrimary | boolean | Primary or understudy |
| createdAt | string | Timestamp |

### `personRates` - Compensation rates
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| personId | string | Which artist |
| roleType | RoleType | For which role |
| shiftType | ShiftType | For which shift type |
| amount | number | ARS amount |
| workId | string | Optional: work-specific override |
| priority | number | Resolution priority |
| isActive | boolean | Active flag |
| createdAt | string | Timestamp |

### `payouts` - Payment records
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| eventDayId | string | For which day |
| date | string | Event date |
| workId | string | Which play |
| personId | string | Which artist |
| roleType | RoleType | Role performed |
| shiftType | ShiftType | Shift worked |
| units | number | Number of units |
| amount | number | ARS total |
| status | PayoutStatus | pending -> approved -> paid |
| notes | string | Optional notes |
| createdAt | string | Timestamp |

## Pricing Collection

### `pricingRules` - Version-controlled prices
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| type | PricingType | THEATER_TICKET / TRAVEL_FORMAT |
| scope | PricingScope | GLOBAL / SEASON |
| seasonId | string | Optional: season-scoped |
| validFrom | string | ISO date start |
| validTo | string | ISO date end |
| currency | "ARS" | Always ARS |
| values | Record<string, number> | Price map (see below) |
| isActive | boolean | Active flag |
| createdAt | string | Timestamp |

**values for THEATER_TICKET**: `{ student: number, adult: number }`
**values for TRAVEL_FORMAT**: `{ classroom: number, double_classroom: number, auditorium: number }`

## Reporting Collections

### `dailySummaries` - Daily financial snapshot
| Field | Type | Description |
|-------|------|-------------|
| date | string | Event date |
| type | EventType | theater / travel |
| seasonId | string | Season |
| workId | string | Play |
| attendance | object | reservedStudents, reservedAdults, attendedStudents, attendedAdults |
| revenue | object | expected, final, breakdown |
| costs | object | staffTotal, actorsTotal, assistantsTotal |
| margin | object | gross |
| status | "OPEN" / "CLOSED" | Summary status |

### `monthlySummaries` - Monthly aggregates
Fields: month (YYYY-MM), revenueTotal, costsTotal, marginTotal, attendanceTotal, typeBreakdown

### `seasonSummaries` - Season aggregates
Fields: seasonId, revenueTotal, marginTotal, attendanceTotal, topWorks, topVenues, attendanceRatio

## Server Actions Reference

All server actions are in `src/lib/actions.ts`. Pattern: `async function name(params): Promise<Result>`.

### CRUD Actions
| Action | Returns | Description |
|--------|---------|-------------|
| `getVenues()` | Venue[] | All venues |
| `getVenueById(id)` | Venue / null | Single venue |
| `addVenue(data)` | { success, id } | Create venue |
| `updateVenue(id, data)` | { success } | Update venue |
| `deleteVenue(id)` | { success } | Delete venue |
| `getSchools()` | School[] | All schools |
| `getSchoolById(id)` | School / null | Single school |
| `addSchool(data)` | { success, id } | Create school (builds searchTokens) |
| `updateSchool(id, data)` | { success } | Update school |
| `getWorks()` | Work[] | All works |
| `getWorkById(id)` | Work / null | Single work |
| `addWork(data)` | { success, id } | Create work |
| `getCastByWork(workId)` | WorkCast[] | Cast for a work |
| `getSeasons()` | Season[] | All seasons |
| `getPeople()` | Person[] | All staff |
| `addPerson(data)` | { success, id } | Create person |
| `updatePerson(id, data)` | { success } | Update person |

### Event Actions
| Action | Returns | Description |
|--------|---------|-------------|
| `getEventDays()` | EventDay[] | All event days |
| `getEventDaysByDate(date)` | EventDay[] | Events on specific date |
| `addEventDay(data, workId)` | { success, id } | Create event day + auto-generate slots |
| `getSlotsByEventDay(id)` | EventSlot[] | Slots for a day |
| `getSlotDetails(slotId)` | { slot, work, eventDay } | Full slot context |

### Booking Actions
| Action | Returns | Description |
|--------|---------|-------------|
| `addTheaterBooking(data, isHold)` | { success, id } | Create theater booking (TRANSACTIONAL) |
| `addTravelBooking(data)` | { success, id } | Create travel booking |
| `getInboxItems()` | InboxItem[] | Pending bookings with enriched data |
| `updateBookingStatus(id, type, status)` | { success } | Transition booking status |
| `deleteBooking(id, type)` | { success } | Delete + restore capacity |
| `updateTheaterBookingAttendance(id, data, policy)` | { success } | Record attendance |

### Pricing Actions
| Action | Returns | Description |
|--------|---------|-------------|
| `getPricingRules(filters?)` | PricingRule[] | Filtered pricing rules |
| `resolvePricing(date, type, seasonId?)` | { success, rule } | Find active rule for date |
| `upsertPricingRule(data)` | { success, id } | Create or update rule |

### Staff & Payout Actions
| Action | Returns | Description |
|--------|---------|-------------|
| `getCastByPerson(personId)` | (WorkCast & { work })[] | Person's cast assignments |
| `getPersonRates(personId)` | PersonRate[] | Person's rate config |
| `upsertPersonRate(data)` | { success, id } | Set rate |
| `getPayouts(filters?)` | (Payout & { person, work })[] | Enriched payouts |
| `generatePayoutsForDay(eventDayId)` | { success } | Auto-generate payouts |
| `updatePayoutStatus(id, status, notes?)` | { success } | Transition payout status |
| `resolveShiftType(eventDay, slots)` | ShiftType | Calculate shift from slots |
| `resolvePersonRate(personId, role, shift, workId?)` | number | Resolve rate with priority |

### Reporting Actions
| Action | Returns | Description |
|--------|---------|-------------|
| `closeEventDay(eventDayId)` | { success } | Full closure cascade |
| `generateDailySummary(eventDayId)` | { success, summary } | Build daily snapshot |
| `applyDailySummaryToAggregates(summary)` | { success } | Update monthly/season rollups |
