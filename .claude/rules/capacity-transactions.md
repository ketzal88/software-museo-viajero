## Reservas de teatro: transacciones atómicas obligatorias

Cualquier creación/actualización/eliminación de `Booking` que afecte capacidad de un `EventSlot` **debe** ejecutarse dentro de `adminDb.runTransaction(async (tx) => { ... })`.

### Contrato

```ts
await adminDb.runTransaction(async (tx) => {
  const slotRef = adminDb.collection("eventSlots").doc(slotId);
  const slotSnap = await tx.get(slotRef);
  const current = slotSnap.data();

  if (current.reservedCount + qty > current.capacity) {
    throw new Error("Capacidad excedida");
  }

  tx.update(slotRef, { reservedCount: current.reservedCount + qty });
  tx.set(adminDb.collection("bookings").doc(), { /* ... */ });
});
```

### Qué evita

- Dos reservas concurrentes leyendo el mismo `reservedCount` y guardando capacidad sobrevendida.
- Borrar una reserva sin devolver el cupo al slot (rollback parcial).

### Señales de que hay que usar transacción

- Tocás `eventSlots.reservedCount` o `eventSlots.capacity`.
- Creás, movés, o eliminás documentos de `bookings`.
- Cambiás `status` de HOLD → CONFIRMED (sube el contador de firmes).

### Qué NO necesita transacción

- Consultas de solo lectura.
- Updates a schools/teatros/obras/staff (no tienen contadores concurrentes).
- Cambios cosméticos de Booking (notes, tags) que no tocan `quantity` ni `slotId`.
