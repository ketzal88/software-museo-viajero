# Soft Museo Viajero

Plataforma operativa para compañías de teatro educativo itinerante. Gestiona calendario, reservas, asistencia, liquidaciones, pricing y reportes para obras en escuelas y teatros fijos en Argentina.

## Stack

- **Next.js 14** (App Router) + React 18 + TypeScript 5
- **Firestore** (Firebase Admin SDK) como base
- **Firebase Auth** (Email + Google)
- **Tailwind 3.4** + clsx/tailwind-merge
- **React Hook Form** + **Zod** para formularios
- **Sonner** (toasts), **date-fns** (fechas), **lucide-react** (iconos)
- Deploy: **Vercel**

Para el detalle completo de arquitectura, convenciones, modelos de datos y lógica de negocio, consultá la skill **`museo-viajero-context`** (se carga automáticamente cuando trabajás en este repo).

## Scripts

```bash
npm run dev           # next dev
npm run build         # next build
npm run lint          # next lint (ESLint)
npx tsc --noEmit      # chequeo de tipos
npm run seed          # pobla Firestore con datos de prueba
```

## Slash Commands

- `/ts-check` — chequeo de tipos, reporta sin arreglar.
- `/lint` — corre ESLint, reporta sin arreglar.
- `/build-check` — corre el build de Next.js y resume errores/bundle.
- `/commit-checkpoint` — commit seguro: tsc + lint + diff + mensaje propuesto con confirmación.

## Reglas modulares (invariantes del dominio)

Estas reglas describen contratos que **no se rompen** al agregar o modificar código.

@.claude/rules/server-actions.md
@.claude/rules/capacity-transactions.md
@.claude/rules/snapshot-pricing.md
@.claude/rules/payout-idempotency.md
@.claude/rules/firebase-admin-boundary.md

## Enforcement estructural

La skill `ast-rules` (`.claude/skills/ast-rules/`) contiene reglas de `ast-grep` que detectan violaciones comunes (Admin SDK en código cliente, SDK cliente en Server Actions). Correr con:

```bash
bash .claude/skills/ast-rules/scan.sh
```

## Hooks activos

- **Bash(git commit...)** → corre `scripts/check-no-secrets.sh` antes del commit para bloquear `.env`, service accounts, private keys, y patrones de Firebase/Google API keys.
- **Edit/Write sobre `src/lib/actions.ts`** → recordatorio de usar `adminDb.runTransaction` cuando toque capacidad/reservas.

Los hooks viven en `.claude/settings.json` (compartido). Tus permisos personales van en `.claude/settings.local.json` (no versionado).

## Seguridad

- **Nunca** incluir `.env*`, `serviceAccount*.json`, ni archivos con credenciales en commits. El hook los bloquea, pero no lo pongas a prueba.
- **Nunca** `--amend`, `--no-verify`, o fuerza sobre `main` salvo pedido explícito.
- Toda mutación sensible se valida dos veces: cliente (Zod via `zodResolver`) y server (schema.safeParse al principio de la action).
