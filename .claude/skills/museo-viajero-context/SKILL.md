---
name: museo-viajero-context
description: >
  Project context and architecture guide for Soft Museo Viajero - an operational management platform
  for educational theater companies in Argentina. Use this skill ALWAYS when producing code, adding features,
  fixing bugs, or making any changes to the museo-viajero codebase. Provides tech stack details, data models,
  business logic rules, file conventions, and coding patterns that must be followed. Triggers on any development
  task within this project.
---

# Soft Museo Viajero - Project Context

## What Is This Software

Operational management platform for educational traveling theater companies. Manages the complete lifecycle:
calendar scheduling, reservations, attendance tracking, artist compensation (liquidaciones), pricing rules,
and financial reporting. Built for theater operators coordinating shows at schools and fixed venues across Argentina.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: TailwindCSS 3.4 + clsx/tailwind-merge
- **Forms**: React Hook Form + Zod validation
- **Database**: Google Cloud Firestore (NoSQL) via Firebase Admin SDK
- **Auth**: Firebase Auth (Email + Google OAuth)
- **Icons**: Lucide React
- **Toasts**: Sonner
- **Dates**: date-fns
- **Deployment**: Vercel

## Architecture & Conventions

### Data Flow

```
Client Component -> Server Action ("use server") -> Firebase Admin SDK -> Firestore
                                                  -> revalidatePath() -> UI update
```

No REST API. All backend logic lives in Server Actions at `src/lib/actions.ts`.

### File Organization

```
src/
  app/(dashboard)/        # Protected routes (all require auth)
    calendario/           # Calendar & event management
    reservas/             # Bookings
    escuelas/             # Schools (customers)
    teatros/              # Venues
    obras/                # Works (plays)
    staff/                # Staff & cast
    temporadas/           # Seasons
    liquidaciones/        # Payouts
    reportes/             # Reports
    ajustes/precios/      # Pricing rules
    inbox/                # Pending bookings
  app/login/              # Auth page
  lib/
    actions.ts            # ALL server actions (single file, ~55KB)
    firebase.ts           # Client SDK init
    firebaseAdmin.ts      # Admin SDK init
    validations.ts        # Zod schemas
    constants.ts          # Nav links, travel prices
    utils.ts              # Search tokens, serialization
    communication.ts      # WhatsApp/email templates
  types/index.ts          # All TypeScript interfaces & enums
  features/               # Feature modules with components/
    bookings/components/  # TheaterBookingForm, TravelBookingForm
    calendar/components/  # CalendarView, EventDayForm
    schools/components/   # SchoolAutocomplete, SchoolForm, SchoolList
    venues/components/
    works/components/     # WorkCastManager
    staff/components/     # StaffForm, PersonDetails, PayoutsList
    seasons/components/
    pricing/components/   # PricingManager, PricingRuleForm
    reports/components/   # AttendanceManager, CloseoutButton
    inbox/components/
  components/             # Shared: Sidebar, BottomNav, ErrorBoundary, Skeletons
  providers/              # AuthProvider, ToastProvider
```

### Coding Patterns

- **Pages**: Server Components by default. Fetch data with server actions, pass to feature components.
- **Feature components**: `"use client"` when interactive. Use React Hook Form + Zod for forms.
- **Server Actions**: Return `{ success: boolean; id?: string; error?: string }`.
- **Transactions**: Use `adminDb.runTransaction()` for bookings (prevent race conditions on capacity).
- **UI language**: Spanish (Argentina). All labels, messages, headings in Spanish.
- **Design tokens**: Inter (sans), Space Grotesk (display). Primary: #0A0A0A. Accent: #FF3B30.
- **Heading style**: `text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight`
- **Label style**: `text-[11px] font-display font-bold uppercase tracking-widest text-gray-500`
- **Card/border style**: `border border-gray-300 p-6` (no rounded corners, minimal)

### Page Template Pattern

```tsx
// Server page (app/(dashboard)/[feature]/page.tsx)
import { getData } from "@/lib/actions";
import { FeatureComponent } from "@/features/[feature]/components/FeatureComponent";

export default async function FeaturePage() {
    const data = await getData();
    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    Titulo
                </h1>
                <p className="text-gray-600 font-sans text-xl">Descripcion.</p>
            </header>
            <FeatureComponent data={data} />
        </div>
    );
}
```

### Form Component Pattern

```tsx
// Client component (features/[feature]/components/FeatureForm.tsx)
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { serverAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({ /* fields */ });
type FormData = z.infer<typeof schema>;

export function FeatureForm({ initialData }: { initialData?: Type | null }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { /* ... */ },
    });

    const onSubmit = async (data: FormData) => {
        const result = await serverAction(data);
        if (result.success) {
            toast.success("Operacion exitosa");
            router.push("/feature");
            router.refresh();
        } else {
            toast.error(result.error || "Error");
        }
    };

    return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

## Key Business Rules

For detailed data models and business logic, see:
- [references/data-models.md](references/data-models.md) - Firestore collections and TypeScript types
- [references/business-logic.md](references/business-logic.md) - Pricing, payouts, attendance, event lifecycle

### Critical Rules Summary

1. **Snapshot pricing**: Prices frozen at booking time. Never recalculate from current rules.
2. **Capacity transactions**: Theater bookings MUST use Firestore transactions to atomically check/update slot capacity.
3. **Billing policies**: RESERVED (charge reserved qty), ATTENDED (charge actual), CUSTOM.
4. **Payout idempotency**: Never overwrite APPROVED or PAID payouts. Only PENDING can be updated.
5. **Shift type resolution**: Based on slot count/timing: >=3 slots = FULL_DAY, morning+afternoon = MIXED, etc.
6. **Rate priority**: Work-specific rate > General rate > Highest priority rate.
7. **Event closure cascade**: Close day -> calculate finals -> generate daily summary -> generate payouts -> update aggregates.
8. **Search tokens**: Schools indexed with `buildSearchTokens(name)` for prefix autocomplete.
9. **Hold bookings**: HOLD status expires after 72 hours (`expiresAt` field).
10. **Cascading deletes**: EventDay deletion cascades to EventSlots. Booking deletion restores slot capacity.
