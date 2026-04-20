---
description: Commit seguro - tsc + lint + diff resumido antes de commitear. Pide confirmación del mensaje.
---

Pasos en orden. Si alguno falla, PARÁ y reportá el error sin intentar arreglarlo.

1. `git status --short` y `git diff --stat` para ver qué cambió.
2. `npx tsc --noEmit`. Si hay errores, parar.
3. `npm run lint`. Si hay errores bloqueantes, parar. Warnings se reportan pero no bloquean.
4. Mirá los últimos commits con `git log --oneline -10` para imitar el estilo (prefijos `feat:`, `fix:`, `refactor:`, etc. en español/inglés según el patrón del repo).
5. Proponé un mensaje de commit de 1-3 líneas enfocado en el *por qué*, no el *qué*.
6. Esperá la confirmación del usuario antes de commitear.
7. Cuando confirme, stageá **archivos específicos por nombre** (nunca `git add -A` ni `git add .`), luego `git commit -m`.

## Reglas duras

- Nunca uses `--amend` salvo que el usuario lo pida.
- Nunca uses `--no-verify`.
- Nunca stagees `.env*`, `serviceAccount*.json`, ni archivos con credenciales. El hook `check-no-secrets.sh` corre igual, pero no lo pongas a prueba.
- Si `git status` muestra cambios en `.claude/settings.local.json`, NO los incluyas — ese archivo es personal.
