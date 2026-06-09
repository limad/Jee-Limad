#!/bin/bash
# Usage : bash build/lint-css.sh [--fix]
set -e
FIX="${1:-}"
STYLELINT="./node_modules/.bin/stylelint"

FILES=(
  "desktop/css/desktop.main.css"
  "desktop/css/dom.ui.css"
  "desktop/css/coreWidgets.css"
  "mobile/css/mobile.main.css"
  "mobile/css/coreWidgets.css"
  "core/themes/coreX_Dark/desktop/coreX_Dark.css"
  "core/themes/coreX_Light/desktop/coreX_Light.css"
)

echo "=== Stylelint CSS Jeedom ==="
if [ "$FIX" = "--fix" ]; then
  $STYLELINT --fix "${FILES[@]}"
  echo "=== Fix applique ==="
else
  $STYLELINT "${FILES[@]}" --formatter compact 2>&1 | tail -20
fi
