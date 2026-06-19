#!/bin/bash
# build/minify.sh — shim de compatibilité.
# Le workflow CSS (minification + vérification) est désormais build/css.sh.
# Ce script délègue le CSS à css.sh et conserve la vérification syntaxe JS (acorn).
#
# Usage: bash build/minify.sh [--css-only|--js-only]

set -uo pipefail
cd "$(dirname "$0")/.."

run_css=true
run_js=true
case "${1:-}" in
  --css-only) run_js=false ;;
  --js-only)  run_css=false ;;
esac

if [ "$run_css" = true ]; then
  bash build/css.sh minify
fi

if [ "$run_js" = true ]; then
  echo ""
  echo "═══ Vérification syntaxe JS ═══"
  ACORN="./node_modules/.bin/acorn"
  errors=0
  if [ -f "$ACORN" ]; then
    for js in core/js/*.js desktop/js/*.js; do
      [ -f "$js" ] || continue
      "$ACORN" --ecma2020 "$js" > /dev/null 2>&1 || { echo "  ⚠️  Erreur syntaxe: $js"; errors=$((errors + 1)); }
    done
    [ "$errors" -eq 0 ] && echo "✅ JS: 0 erreur de syntaxe" || echo "❌ JS: $errors fichier(s) avec erreurs"
  else
    echo "  ℹ️  acorn non disponible, vérification ignorée"
  fi
fi
