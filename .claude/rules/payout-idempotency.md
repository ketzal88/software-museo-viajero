## Liquidaciones: idempotencia por estado

Los `Payout` tienen máquina de estados `PENDING → APPROVED → PAID`. Solo los `PENDING` se pueden regenerar o modificar. Una vez aprobados o pagados, son inmutables.

### Contrato

Antes de escribir/regenerar un payout:

```ts
const existing = await adminDb
  .collection("payouts")
  .where("eventDayId", "==", dayId)
  .where("staffId", "==", staffId)
  .limit(1).get();

if (!existing.empty) {
  const current = existing.docs[0].data();
  if (current.status !== "PENDING") {
    // No sobrescribir. Reportar al operador.
    return { success: false, error: "Liquidación ya aprobada/pagada" };
  }
}
```

### Por qué

El operador aprueba liquidaciones contra montos específicos. Si un recálculo posterior las sobrescribe, cambiamos lo que él ya firmó. Eso rompe auditoría, confianza del equipo artístico, y posibles pagos ya hechos.

### Cierre de día (closeout)

Al ejecutar el cascade `closeEventDay()`:
1. Calcular finales desde attendance + snapshot pricing.
2. Generar `DailySummary`.
3. Generar/regenerar `Payout`s **solo** donde no exista uno APPROVED/PAID.
4. Actualizar agregados (temporada, reportes).

Si encontrás un payout APPROVED durante el cascade, seguir adelante con el resto pero loggear `{ skipped: payoutId, reason: "already approved" }` para que el reporte final lo refleje.

### Rollback de cierre

Si hay que reabrir un día, primero revertir payouts a PENDING requiere acción explícita del operador (no automática). Documentar en `src/lib/actions.ts` qué función lo permite.
