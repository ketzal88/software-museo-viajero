---
name: ast-rules
description: Enforcement estructural de invariantes del proyecto museo-viajero vía ast-grep. Corrés `bash .claude/skills/ast-rules/scan.sh` para chequear que no se hayan roto contratos críticos.
---

# AST Rules — Museo Viajero

Reglas estructurales que detectan violaciones de los invariantes documentados en `.claude/rules/`.

## Cómo correrlo

Requiere [`ast-grep`](https://ast-grep.github.io/) instalado (`npm i -g @ast-grep/cli` o `cargo install ast-grep`).

```bash
bash .claude/skills/ast-rules/scan.sh
```

Si `ast-grep` no está instalado, el scan falla pero las reglas siguen siendo **documentación útil** (describen el patrón prohibido con ejemplos).

## Reglas actuales

| Regla | Severidad | Qué atrapa |
|---|---|---|
| `no-admin-sdk-in-client` | error | Import de `firebase-admin` en archivos `"use client"`. Rompe build y expone credenciales. |
| `no-client-sdk-in-actions` | warn | Import de `src/lib/firebase.ts` (SDK cliente) dentro de `src/lib/actions.ts` (server). |
| `no-new-date-in-actions` | warn | Uso de `new Date()` dentro de server actions sin pasar `referenceDate` — hace los tests/reportes no-deterministas. |

Las reglas se agregan creando `.yml` en `rules/`. Seguí el formato de ast-grep.
