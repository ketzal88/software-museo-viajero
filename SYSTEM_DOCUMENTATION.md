
# 📚 Documentación del Sistema "Soft Museo Viajero"

**Versión del Documento:** 1.0  
**Fecha de Actualización:** 09/02/2026  
**Estado:** Activo / En Desarrollo

---

## 1. Visión General
El **Soft Museo Viajero** es una plataforma integral de gestión diseñada para compañías de teatro educativo y eventos itinerantes. Permite administrar todo el ciclo de vida de las funciones, desde la programación en calendario hasta la facturación y liquidación de sueldos artísticos.

### Stack Tecnológico
- **Frontend:** Next.js 14+ (App Router), React, TailwindCSS.
- **Backend:** Server Actions (Next.js), Firebase Admin SDK.
- **Base de Datos:** Google Cloud Firestore (NoSQL).
- **Autenticación:** Firebase Auth.
- **Validación:** Zod.
- **Librerías Clave:** `date-fns` (fechas), `lucide-react` (iconos), `react-hook-form` (formularios), `sonner` (notificaciones).

---

## 2. Módulos Principales

### 📅 2.1 Calendario y Eventos
El corazón del sistema. Permite visualizar y gestionar la agenda de funciones.
- **Tipos de Evento:**
  - **Teatro:** Funciones en sedes fijas (Teatros). Tienen capacidad, slots horarios y múltiples reservas por slot.
  - **Viajera:** Funciones en escuelas (Itinerantes). El slot se adapta a la escuela.
- **Jornada (EventDay):** Representa un día de actividad. Puede tener múltiples slots.
- **Slot (EventSlot):** Un horario específico de función (ej: 10:00 - 12:00) donde se asigna una Obra.
- **Estados:** `OPEN` (Abierto a reservas), `CLOSED` (Jornada finalizada y reportada).

### 🎟️ 2.2 Reservas (Bookings)
Gestión de ventas y cupos.
- **Reserva de Teatro:** Se asocia a un Slot y una Escuela. Controla cupos de alumnos y adultos.
  - **Precio:** Se congela al momento de reservar (Snapshot) según la Vigencia de Precios activa.
  - **Billing Policy:** `RESERVED` (cobra por reservado), `ATTENDED` (cobra por lo que vino), `CUSTOM`.
- **Reserva Viajera:** Se asocia a un Slot y una Escuela.
  - **Modalidad:** Aula, Doble Aula, Auditorio.
  - **Precio:** Fijo por función según modalidad y vigencia.
- **Estados:** `HOLD` (Bloqueo temporal 72hs), `PENDING` (Confirmada sin pagar), `CONFIRMED` (Señada/Pagada), `CANCELLED`, `COMPLETED`.

### 🏫 2.3 Escuelas
Base de datos de clientes institucionales.
- **Datos:** Nombre, Distrito, Dirección, Contacto, Privada/Pública.
- **Funcionalidad:** Autocompletado inteligente en formularios de reserva, historial de visitas (pendiente).

### 👥 2.4 Staff y Elenco
Gestión de recursos humanos artísticos.
- **Personas:** Actores, Asistentes, Staff técnico.
- **Roles:** `ACTOR`, `ASSISTANT`, `STAFF`.
- **Asignación (Cast):** Qué actores saben hacer qué obra y qué personaje interpretan.

### 💰 2.5 Liquidaciones (Payouts)
Cálculo automático de honorarios por función.
- **Lógica:** Al cerrar una jornada, el sistema calcula cuánto cobrar cada persona basándose en:
  - Rol (Actor/Asistente).
  - Tipo de Jornada (Media Mañana, Media Tarde, Doble, etc.).
  - Tarifas vigentes (PersonRate).
- **Estados:** `PENDING`, `APPROVED`, `PAID`.

### 📊 2.6 Reportes
Inteligencia de negocio y cierre de caja.
- **Daily Summary:** Resumen automático al cerrar una jornada (Ingresos vs Costos = Margen).
- **Monthly/Season Summary:** Agregados automáticos para visión macro.
- **Métricas:** Asistencia real vs esperada, recaudación por tipo de evento.

### ⚙️ 2.7 Ajustes y Configuración
Panel de control del sistema.
- **Reglas de Precios (Pricing Rules):** Sistema versionado de precios.
  - Permite definir precios con fechas de vigencia (`validFrom`, `validTo`).
  - Los precios históricos no cambian si se actualiza la lista de precios actual.
  - **Tipos:** Tickets de Teatro (Alumno/Adulto) y Formatos Viajeros (Por función).

---

## 3. Estructura de Datos (Core Entities)

### `EventDay`
- `date`: Fecha del evento.
- `type`: THEATER | TRAVEL.
- `status`: OPEN | CLOSED.
- `locationId`: ID del Teatro (si es Theater).

### `TheaterBooking`
- `eventSlotId`: Slot asignado.
- `schoolId`: Escuela cliente.
- `qtyReservedStudents`, `qtyReservedAdults`: Cupo reservado.
- `qtyAttendedStudents`, `qtyAttendedAdults`: Asistencia real (post-evento).
- `unitPriceStudent`, `unitPriceAdult`: **Snapshot** del precio al momento de reservar.
- `totalExpected`: `(Res * Precio)`.
- `totalFinal`: Calculado al cerrar según asistencia y política.
- `pricingRuleId`: ID de la regla de precio aplicada.

### `TravelBooking`
- `modality`: CLASSROOM | DOUBLE | AUDITORIUM.
- `totalPrice`: Precio fijo acordado (**Snapshot**).
- `pricingRuleId`: ID de la regla aplicada.

### `PricingRule`
- `type`: THEATER_TICKET | TRAVEL_FORMAT.
- `scope`: GLOBAL | SEASON.
- `validFrom`, `validTo`: Fecha de vigencia.
- `values`: Objeto JSON con los valores monetarios.

### `Payout`
- `personId`: Quién cobra.
- `amount`: Cuánto cobra.
- `workId`: Por qué obra.
- `shiftType`: Turno trabajado.

---

## 4. Flujos Críticos

### 4.1. Creación de Reserva (Teatro)
1. Usuario selecciona Slot en Calendario.
2. Ingresa Escuela y Cantidad de alumnos.
3. **Frontend:** Consulta `resolvePricing(date)` al Backend.
4. **Backend:** Devuelve la `PricingRule` vigente para esa fecha.
5. **Frontend:** Pre-llena los precios unitarios en el formulario (Editables si es necesario).
6. **Guardado:** Se guarda la reserva con los precios congelados y el `pricingRuleId`.

### 4.2. Cierre de Jornada (Closeout)
1. Usuario ingresa asistencia real en `AttendanceManager`.
2. Sistema calcula `totalFinal` para cada reserva.
3. Usuario hace click en "Cerrar Jornada".
4. **Backend:**
   - Genera `DailySummary` con Recaudación Final y Costos de Staff.
   - Pasa la jornada a `CLOSED`.
   - Actualiza acumuladores Mensuales y de Temporada.
   - Genera los `Payouts` pendientes para los actores asignados.

---

## 5. Directorios Clave (`src/`)
- `app/`: Rutas de la aplicación (Next.js App Router).
  - `(dashboard)/`: Layout con Sidebar autenticado.
- `components/`: Componentes UI reutilizables.
- `features/`: Módulos funcionales (booking, pricing, schools, etc) con sus componentes específicos.
- `lib/`:
  - `actions.ts`: **Toda la lógica de negocio y llamadas a BD.**
  - `firebase.ts` / `firebaseAdmin.ts`: Conexión a Firestore.
  - `validations.ts`: Schemas de Zod.
  - `utils.ts`: Helpers generales.
- `types/`: Definiciones TypeScript compartidas.

---
*Documentación generada automáticamente por Antigravity AI Assistant.*
