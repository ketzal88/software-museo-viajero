#!/usr/bin/env bash
# Copia las imágenes `.webp`, SVG y assets necesarios del repo origen (museoViajeroWeb2)
# al public/ del destino, en ubicaciones consumibles por el App Router + `next/image`.
#
# Uso: bash scripts/copy-public-assets.sh [<ruta-repo-origen>]
# Default origen: ../museoViajeroWeb2 relativo al destino.

set -euo pipefail

DEST_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORIGIN_DEFAULT="$(cd "$DEST_ROOT/../museoViajeroWeb2" 2>/dev/null && pwd || true)"
ORIGIN="${1:-$ORIGIN_DEFAULT}"

if [ -z "$ORIGIN" ] || [ ! -d "$ORIGIN" ]; then
    echo "❌ No encuentro el repo origen. Pasá la ruta:"
    echo "   bash scripts/copy-public-assets.sh /ruta/a/museoViajeroWeb2"
    exit 1
fi

echo "Origen:  $ORIGIN"
echo "Destino: $DEST_ROOT"
echo

mkdir -p "$DEST_ROOT/public/images/obras"
mkdir -p "$DEST_ROOT/public/images/hero"
mkdir -p "$DEST_ROOT/public/images/sponsors"
mkdir -p "$DEST_ROOT/public/images/personajes"

# Imagen fallback para obras sin portada
cp -n "$ORIGIN/src/assets/images/portadaPlaceHolder.webp" "$DEST_ROOT/public/images/obras/_placeholder.webp" 2>/dev/null || true

# Todas las .webp de obras (nombres originales)
echo "▸ Copiando imágenes de obras..."
find "$ORIGIN/src/assets/images" -maxdepth 1 -type f -iname "*.webp" -exec cp -n {} "$DEST_ROOT/public/images/obras/" \; 2>/dev/null
COUNT=$(find "$DEST_ROOT/public/images/obras" -type f -iname "*.webp" | wc -l)
echo "  $COUNT archivos"

# Hero slider
echo "▸ Copiando hero slider..."
find "$ORIGIN/src/assets/images/Heroslider" -type f -iname "*.webp" -exec cp -n {} "$DEST_ROOT/public/images/hero/" \; 2>/dev/null || true
COUNT=$(find "$DEST_ROOT/public/images/hero" -type f -iname "*.webp" 2>/dev/null | wc -l)
echo "  $COUNT archivos"

# SVGs principales
echo "▸ Copiando SVGs..."
for svg in logoMuseo.svg logoMuseoSoloLetra.svg isoMuseoViajero.svg isoPrimary.svg iconoMuseoBlanco.svg; do
    if [ -f "$ORIGIN/src/assets/svg/$svg" ]; then
        cp -n "$ORIGIN/src/assets/svg/$svg" "$DEST_ROOT/public/$svg" 2>/dev/null || true
    fi
done
find "$ORIGIN/src/assets/svg" -maxdepth 1 -type f -name "sponsor*.svg" -exec cp -n {} "$DEST_ROOT/public/images/sponsors/" \; 2>/dev/null || true

# Favicon
if [ -f "$ORIGIN/public/favicon.svg" ]; then
    cp -n "$ORIGIN/public/favicon.svg" "$DEST_ROOT/public/favicon.svg"
fi
if [ -f "$ORIGIN/public/favicon.ico" ]; then
    cp -n "$ORIGIN/public/favicon.ico" "$DEST_ROOT/public/favicon.ico"
fi

# OG image default
if [ -f "$ORIGIN/public/OGimage_1200x630.jpg" ]; then
    cp -n "$ORIGIN/public/OGimage_1200x630.jpg" "$DEST_ROOT/public/og-default.jpg"
fi

echo
echo "✓ Assets copiados. Revisá $DEST_ROOT/public/images/"
echo
echo "Siguiente paso: npm run migrate-sheet:dry  (verificar lectura Sheet)"
echo "                npm run migrate-sheet       (escribir a Firestore)"
