# Estructura Firestore - Soft Museo Viajero

Este documento detalla el esquema de datos plano de Firestore. Todas las entidades se manejan en colecciones raíz para facilitar consultas transversales y escalabilidad.

## Nomenclatura de Colecciones

| Colección | Propósito |
| :--- | :--- |
| `schools` | Instituciones educativas. |
| `venues` | Sedes físicas (Teatros o centros culturales). |
| `works` | Catálogo de obras de teatro. |
| `seasons` | Ciclos anuales de trabajo. |
| `event_days` | Días marcados en el calendario (un día puede tener múltiples slots). |
| `event_slots` | Horarios específicos dentro de un día asociados a una obra. |
| `theater_bookings` | Reservas realizadas por escuelas para asistir a un teatro. |
| `travel_bookings` | Reservas para actuaciones donde el equipo viaja a una sede/escuela. |

## Consideraciones de Diseño
- **Estructura Plana**: Se evita el uso de subcolecciones (`schools/{id}/bookings`) para permitir consultas globales (ej: "todas las reservas de hoy de cualquier escuela") sin depender de `collectionGroup`, simplificando la lógica de negocio y las reglas de seguridad.
- **Fechas**: Se almacenarán preferentemente como strings ISO (`YYYY-MM-DD`) para facilitar búsquedas exactas, o como `Timestamp` si se requiere ordenamiento complejo.
- **Relaciones**: Se utilizan IDs (strings) como llaves foráneas.

## Diagrama Lógico
1. `Season` engloba el año.
2. `EventDay` se vincula a una `Season`.
3. `EventSlot` se vincula a un `EventDay` y a una `Work`.
4. `Bookings` (Theater/Travel) se vinculan a un `EventSlot` y a una `School`.
