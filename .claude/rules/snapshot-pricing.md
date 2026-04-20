## Snapshot pricing: los precios se congelan al reservar

Cuando se crea una `Booking`, el precio aplicado se guarda en el documento. **Nunca** se recalcula desde las `PricingRules` actuales al leer reservas existentes.

### Contrato

Al crear o actualizar una reserva, resolvé el precio con la lógica de prioridad (work-specific > general > highest priority) y persistí:

```ts
{
  unitPrice: number,        // snapshot del precio resuelto
  currency: string,
  appliedRuleId: string,    // trazabilidad: qué PricingRule se usó
  pricedAt: Timestamp,      // cuándo se resolvió
  billingPolicy: "RESERVED" | "ATTENDED" | "CUSTOM",
}
```

### Qué NO hacer

- **No** leer `bookings` y hacer `resolvePrice(booking)` usando reglas actuales — eso mutaría totales históricos.
- **No** usar `PricingRule.rate` como source of truth para reportes, liquidaciones, o closeouts. Usá siempre `booking.unitPrice`.
- **No** cambiar retroactivamente `unitPrice` de bookings ya cerradas (status CLOSED / PAID).

### Cuándo sí se re-resuelve

- Edición explícita de una reserva HOLD/CONFIRMED todavía abierta → re-resolver y sobrescribir el snapshot (y dejar rastro en `appliedRuleId`).
- Override manual con `billingPolicy: CUSTOM` → el operador ingresa `unitPrice` a mano; no se toca.

### Dónde vive la resolución

Helpers de pricing en `src/lib/actions.ts` (o archivos dedicados si se extrae). Cualquier función que resuelva precio debe retornar `{ unitPrice, appliedRuleId, currency }` y el caller escribe el snapshot.
