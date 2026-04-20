#!/bin/bash
# Bloquea commits que incluyan archivos sospechosos de contener secretos.
# Invocado automáticamente por el hook PreCommit en .claude/settings.json
# cuando Claude ejecuta `git commit`.

set -u

STAGED=$(git diff --cached --name-only)
FAIL=0

block() {
  echo "BLOCKED: $1" >&2
  FAIL=1
}

for file in $STAGED; do
  case "$file" in
    *.env|*.env.*|.env*)
      # Permitir plantillas de ejemplo, bloquear el resto.
      case "$file" in
        *.example|*.sample|*.template) ;;
        *) block "$file parece contener variables de entorno reales." ;;
      esac
      ;;
    *serviceAccount*.json|*service-account*.json|*firebase-adminsdk*.json)
      block "$file parece una clave de service account de Firebase."
      ;;
    *credentials*.json|*credentials*.yaml|*credentials*.yml)
      block "$file parece un archivo de credenciales."
      ;;
    *.pem|*.key|*id_rsa*|*id_ed25519*)
      block "$file parece una clave privada."
      ;;
  esac
done

# Escaneo rápido de contenido staged buscando patrones de claves conocidos.
STAGED_DIFF=$(git diff --cached -U0 2>/dev/null || true)

if echo "$STAGED_DIFF" | grep -qE 'BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY'; then
  block "Se detectó un bloque PRIVATE KEY en el diff staged."
fi

if echo "$STAGED_DIFF" | grep -qE 'FIREBASE_PRIVATE_KEY\s*=\s*["'\'']?-----BEGIN'; then
  block "FIREBASE_PRIVATE_KEY con contenido real en el diff staged."
fi

if echo "$STAGED_DIFF" | grep -qE 'AIza[0-9A-Za-z_-]{35}'; then
  block "Se detectó una posible Google/Firebase API key (patrón AIza...)."
fi

if [ $FAIL -ne 0 ]; then
  echo "" >&2
  echo "Si es un falso positivo, remové el archivo del stage o rebautizalo:" >&2
  echo "  git restore --staged <archivo>" >&2
  exit 1
fi

exit 0
