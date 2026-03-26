# Plan de Optimización: Firestore Reads

**Problema central:** El modelo actual usa un patrón relacional sobre una base de datos NoSQL. Cada vez que se necesita mostrar datos enriquecidos (una reserva con su escuela, un pago con el nombre del artista), se hacen N queries adicionales. Esto dispara el consumo de lecturas.

---

## Costo actual por página (estimado)

| Página | Lecturas actuales | Causa |
|--------|-------------------|-------|
| Calendario | ~5 ✅ | Ya optimizado con batch |
| Detalle día (4 slots, 20 reservas) | ~45 | N+1 en bookings → escuelas |
| Inbox (10 reservas) | ~52 | N+1 en bookings → escuelas + slots + obras |
| Liquidaciones (50 pagos) | ~101 | 1+2N por persona + obra |
| Cierre de día | ~50+ | Recalcula todo desde cero |

---

## Mejoras priorizadas

### PRIORIDAD 1 — Denormalización de nombres (máximo impacto, mínimo riesgo)

El patrón que más se repite: mostrar una reserva implica buscar la escuela; mostrar un pago implica buscar la persona y la obra. La solución: guardar los campos de display directamente en el documento.

**`theater_bookings` y `travel_bookings`**: agregar `schoolName` al momento de crear la reserva.
```
Al crear: schoolName = school.name
Al buscar escuela para mostrar en tabla: ya está en el doc, 0 queries extra
```

**`payouts`**: agregar `personName` y `workTitle` al generar la liquidación.
```
Al crear: personName = person.displayName, workTitle = work.title
Al listar pagos: 1 sola query, sin N+1
```

**`workCast`**: agregar `personName` al asignar el elenco.
```
Al crear: personName = person.displayName
Al listar elenco: 1 sola query
```

**Impacto:**
- Inbox: 52 → ~8 lecturas (−85%)
- Liquidaciones: 101 → ~2 lecturas (−98%)
- Detalle día: 45 → ~5 lecturas (−89%)

**Costo de migración:** Bajo. Los documentos existentes sin `schoolName` caen al fallback actual (fetch individual). Se van completando a medida que se crean/editan registros.

---

### PRIORIDAD 2 — Batch queries en lugar de loops de queries

Varias funciones hacen una query por ítem dentro de un loop. Firestore soporta `where("field", "in", [...ids])` con hasta 30 valores por batch.

**`getInboxItems`**: actualmente hace `getSlotDetails()` por cada booking (que a su vez hace 3 queries). Con batch:
```
Antes: 2 + (10 bookings × 5) = 52 reads
Después: 2 + 2 batch queries = 4 reads
```

**`getTheaterBookingsBySlot` + `getTravelBookingsBySlot`**: sacar el loop de `getSchoolById`. Si ya tenemos `schoolName` denormalizado, sobra. Si no, hacer un batch query de escuelas.

**`getPayouts`**: sacar el loop de `getPersonById` + `getWorkById`. Con denormalización = 1 sola query.

---

### PRIORIDAD 3 — Slot summary pre-computado

El `availableCapacity` ya existe en el slot (correcto). El problema es que para mostrar los *ciclos* en el calendario hacemos una query adicional de bookings.

**Solución:** Guardar un campo `gradeCycles: string[]` en el slot, que se actualiza cada vez que se agrega/edita/cancela una reserva.

```
EventSlot:
  + gradeCycles: string[]  // ej: ["J", "1er"] — recalculado en cada write de booking
```

Al agregar/editar/cancelar booking → actualizar `gradeCycles` del slot con un set de los ciclos activos.

**Impacto:** El calendario carga en ~3 queries totales sin importar cuántos días tenga el mes.

---

### PRIORIDAD 4 — Denormalización en EventSlot

`getSlotDetails()` hace 3 queries (slot + work + eventDay). Se llama en muchos contextos.

**Solución:** Guardar en el slot los campos de display de la obra y el día:
```
EventSlot:
  + workTitle: string      // De Work.title
  + eventDate: string      // De EventDay.date
  + eventType: EventType   // De EventDay.type
```

Al crear el slot → copiar estos campos. Al cambiar la obra de un evento → actualizar los slots.

**Impacto:** `getSlotDetails` pasa de 3 queries a 1.

---

### PRIORIDAD 5 — Índices compuestos de Firestore

Algunas queries fallan en producción sin índices. Revisar y crear:

```
theater_bookings: [eventSlotId ASC, status ASC]
theater_bookings: [status ASC, createdAt DESC]
travel_bookings:  [eventSlotId ASC, status ASC]
payouts:          [personId ASC, status ASC]
payouts:          [date DESC, status ASC]
event_slots:      [eventDayId ASC, startTime ASC]
workCast:         [workId ASC]
workCast:         [personId ASC]
pricingRules:     [type ASC, isActive ASC, validFrom ASC]
```

Estos se pueden definir en `firestore.indexes.json` y deployar con Firebase CLI.

---

## Orden de implementación sugerido

```
Semana 1: Denormalizar schoolName en bookings (PRIORIDAD 1 parcial)
           → Fix inmediato en detalle día e inbox

Semana 1: Denormalizar personName + workTitle en payouts (PRIORIDAD 1 parcial)
           → Fix inmediato en liquidaciones

Semana 2: Batch queries en getInboxItems (PRIORIDAD 2)
           → Inbox pasa de 52 a ~4 reads

Semana 2: gradeCycles en EventSlot (PRIORIDAD 3)
           → Calendario completamente eficiente

Semana 3: workTitle + eventDate en EventSlot (PRIORIDAD 4)
           → getSlotDetails de 3 a 1 query

Semana 3: Índices compuestos (PRIORIDAD 5)
           → Previene errores en prod y mejora velocidad
```

---

## Regla de diseño para features nuevas

> **Nunca** hacer un loop de queries. Si necesitás N documentos relacionados, usá:
> 1. `where("id", "in", [ids])` (batch query, máx 30)
> 2. Datos denormalizados en el documento padre (snapshot en el momento de escritura)
> 3. Una colección de agregados que se actualiza en cada write

> **Siempre** guardar el nombre/label de entidades relacionadas en el documento hijo (schoolName, personName, workTitle). El dato de display no cambia seguido; si cambia, es aceptable que los documentos históricos tengan el nombre viejo.
