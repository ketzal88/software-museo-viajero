#!/bin/bash
# Corre todas las reglas de ast-grep en rules/*.yml contra src/.
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RULES_DIR="$SCRIPT_DIR/rules"
EXIT_CODE=0

if ! command -v ast-grep >/dev/null 2>&1; then
  echo "ast-grep no está instalado. Instalalo con: npm i -g @ast-grep/cli"
  echo "Las reglas en $RULES_DIR siguen siendo documentación útil."
  exit 2
fi

for rule in "$RULES_DIR"/*.yml; do
  [ -f "$rule" ] || continue
  echo ""
  echo "== $(basename "$rule" .yml) =="
  if ! ast-grep scan --rule "$rule" src/ 2>&1; then
    EXIT_CODE=1
  fi
done

exit $EXIT_CODE
