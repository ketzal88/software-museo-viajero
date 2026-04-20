---
description: Corre TypeScript check (tsc --noEmit) y reporta errores sin intentar arreglarlos
---

Ejecutá `npx tsc --noEmit 2>&1`.

- Cero errores → respondé "Limpio".
- Con errores → listá cada uno como `archivo:línea — diagnóstico breve`.
- NO arregles nada salvo que el usuario lo pida explícitamente. El comando es de diagnóstico.
