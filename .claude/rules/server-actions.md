## Server Actions: forma, validación, revalidación

Toda mutación desde cliente pasa por una Server Action en `src/lib/actions.ts`. Nada de API routes REST.

### Contrato de retorno

```ts
type ActionResult<T = void> =
  | { success: true; id?: string; data?: T }
  | { success: false; error: string };
```

El cliente (React Hook Form + Sonner) espera exactamente esa forma. No tires excepciones hacia el cliente — atrápalas y devolvé `{ success: false, error: "mensaje para usuario" }`.

### Validación con Zod

1. El schema del formulario vive en `src/lib/validations.ts`.
2. El cliente valida con `zodResolver(schema)` antes de llamar a la action.
3. La action **también** valida: `schema.safeParse(input)` como primer paso — nunca confíes en que el cliente ya validó.

```ts
"use server";
export async function createBooking(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };

  try {
    // ... lógica con adminDb ...
    revalidatePath("/reservas");
    return { success: true, id: bookingId };
  } catch (err) {
    console.error("createBooking", err);
    return { success: false, error: "No se pudo crear la reserva" };
  }
}
```

### Revalidación

Cada action que muta datos leídos por una página debe llamar `revalidatePath("/ruta-afectada")` al final del camino exitoso. Si la mutación afecta múltiples secciones (ej: cerrar día afecta calendario + liquidaciones + reportes), revalidar todas.

### Errores hacia el usuario

- El `error` del resultado se muestra como `toast.error(result.error)`. Redactalo en español, corto, accionable.
- Logs técnicos van a `console.error()` con prefijo del nombre de la action (útil para Vercel logs).

### Auth

Verificar sesión al inicio de toda action sensible. Si el proyecto tiene un helper `getCurrentUser()` o similar en `src/lib/firebaseAdmin.ts`, usalo. No tomes decisiones de autorización basadas en datos venidos del cliente.