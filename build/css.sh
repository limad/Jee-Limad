#!/bin/bash
# build/css.sh — Workflow de vérification CSS/JS Jeedom Core.
#
# Le CSS est servi en source (non minifié) : pas d'étape de minification.
# Ce script vérifie la qualité avant commit.
#
# Usage: bash build/css.sh
#   1. Audit anti-régression tokens : rgb(var(--X)) / rgba(var(--X),a) cassés
#      (familles migrées CSV→rgb() : la syntaxe imbriquée/legacy est invalide)
#   2. Stylelint sur les fichiers CSS clés
#   3. Vérification syntaxe JS (acorn)

set -uo pipefail
cd "$(dirname "$0")/.."

STYLELINT="./node_modules/.bin/stylelint"
ACORN="./node_modules/.bin/acorn"
MIGRATED='bg-color|panel-bg-color|eq-bg-color|defaultBkg-color|contrast-color|cat-[a-z]+-color'
rc=0

echo "═══ 1. Audit tokens (rgb(var(--X)) / rgba(var(--X),a) cassés) ═══"
hits=$(grep -rEn "rgba\(var\(--($MIGRATED)\)|rgb\(var\(--($MIGRATED)\)" \
    --include='*.css' --include='*.php' core/ desktop/ mobile/ 2>/dev/null)
if [ -n "$hits" ]; then echo "$hits"; echo "❌ usages tokens cassés ci-dessus"; rc=1
else echo "✅ 0 usage token cassé"; fi

echo ""
echo "═══ 2. Stylelint ═══"
if [ -f "$STYLELINT" ]; then
  "$STYLELINT" \
    desktop/css/desktop.main.css desktop/css/dom.ui.css desktop/css/coreWidgets.css \
    mobile/css/mobile.main.css \
    core/themes/coreX_Dark/desktop/coreX_Dark.css \
    core/themes/coreX_Light/desktop/coreX_Light.css \
    --formatter compact 2>&1 | tail -20 || rc=1
else
  echo "ℹ️  stylelint absent (npm install) — ignoré"
fi

echo ""
echo "═══ 3. Syntaxe JS (acorn) ═══"
if [ -f "$ACORN" ]; then
  errors=0
  for js in core/js/*.js desktop/js/*.js; do
    [ -f "$js" ] || continue
    "$ACORN" --ecma2020 "$js" > /dev/null 2>&1 || { echo "  ⚠️  Erreur syntaxe: $js"; errors=$((errors + 1)); }
  done
  [ "$errors" -eq 0 ] && echo "✅ JS: 0 erreur de syntaxe" || { echo "❌ JS: $errors fichier(s)"; rc=1; }
else
  echo "ℹ️  acorn absent — ignoré"
fi

echo ""
[ "$rc" -eq 0 ] && echo "═══ ✅ Vérification OK ═══" || echo "═══ ⚠️  Anomalies ci-dessus ═══"
exit $rc
