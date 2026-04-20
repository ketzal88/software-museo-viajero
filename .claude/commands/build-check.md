---
description: Corre el build de Next.js y reporta errores de compilación y páginas que fallaron
---

Ejecutá `npm run build 2>&1`.

- Build exitoso → resumí tamaños de bundle relevantes (páginas > 100 KB First Load JS) y listo.
- Con errores → identificá si es TypeScript, ESLint bloqueante, o runtime (Server Component / Server Action). Reportá archivo:línea + causa probable.
- NO arregles nada salvo pedido explícito.

Tip: si falla solo en build pero `tsc --noEmit` pasa, suele ser un problema de Server Actions (uso de APIs de cliente en server components, o imports cruzando el límite server/client).
