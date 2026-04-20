## Firebase: límite estricto Admin/Client SDK

Dos SDKs distintos viven en el proyecto y **nunca** deben cruzarse.

| Archivo | SDK | Dónde corre | Para qué |
|---|---|---|---|
| `src/lib/firebase.ts` | `firebase` (client) | Browser | Auth UI (login, logout, session). |
| `src/lib/firebaseAdmin.ts` | `firebase-admin` | Server Actions / Server Components | Lecturas y escrituras a Firestore con privilegios. |

### Reglas

- **Nunca** importar `firebase-admin` en un archivo con `"use client"`. Rompe el build, expone credenciales.
- **Nunca** importar `src/lib/firebase.ts` en un archivo con `"use server"` o en Server Components que hacen queries. Usá `firebaseAdmin`.
- Los tipos de Firestore difieren entre SDKs (`Timestamp`, `DocumentReference`). Cuando los pasás de server a client, **serializalos** — typical pattern: convertir `Timestamp` a número (ms) o ISO string con el helper de `src/lib/utils.ts`.

### Checklist al editar Server Actions

- [ ] ¿Uso `adminDb` de `firebaseAdmin.ts`, no `db` de `firebase.ts`?
- [ ] ¿Los datos retornados al cliente están serializados (sin `Timestamp`, sin `DocumentReference`)?
- [ ] ¿No estoy importando accidentalmente `getAuth` del SDK cliente?
