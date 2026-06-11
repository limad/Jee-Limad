#!/bin/bash
# Minification CSS Jeedom - a relancer apres chaque modification CSS
# Usage : bash build/minify-css.sh

set -e
CLEANCSS=$(command -v cleancss || echo "./node_modules/.bin/cleancss")
ROOT="/var/www/html"

minify() {
  local src="$1"
  local out="${src%.css}.min.css"
  echo "  $src -> $out"
  "$CLEANCSS" \
    -O2 \
    --source-map \
    --source-map-inline-sources \
    -o "$out" \
    "$src"
}

echo "=== Stylelint ==="
STYLELINT="$ROOT/node_modules/.bin/stylelint"
if [ -x "$STYLELINT" ]; then
  STYLELINT_ERRORS=$("$STYLELINT"     "$ROOT/desktop/css/desktop.main.css"     "$ROOT/desktop/css/dom.ui.css"     "$ROOT/mobile/css/mobile.main.css"     --formatter compact 2>&1     | grep -c "error" || true)
  if [ "$STYLELINT_ERRORS" -gt 0 ]; then
    echo "  ATTENTION : $STYLELINT_ERRORS erreurs Stylelint detectees"
    echo "  Lancer 'bash $ROOT/build/lint-css.sh' pour les voir"
  else
    echo "  Stylelint OK - 0 erreur"
  fi
else
  echo "  Stylelint non installe"
fi

echo "=== Minification CSS Jeedom ==="
minify "$ROOT/desktop/css/bootstrap.css"
minify "$ROOT/desktop/css/desktop.main.css"
minify "$ROOT/desktop/css/dom.ui.css"
minify "$ROOT/desktop/css/coreWidgets.css"
minify "$ROOT/mobile/css/mobile.main.css"
minify "$ROOT/mobile/css/coreWidgets.css"

echo "=== Conflits CSS (desktop.main vs thèmes) ==="
FUZZY="$ROOT/audits/css-tools/css_fuzzy.py"
if [ -f "$FUZZY" ]; then
  TOTAL_CONFLICTS=0
  for THEME in coreX_Dark coreX_Light core2019_Dark core2019_Light; do
    THEME_CSS="$ROOT/core/themes/$THEME/desktop/$THEME.css"
    if [ -f "$THEME_CSS" ]; then
      N=$(python3 "$FUZZY" "$ROOT/desktop/css/desktop.main.css" "$THEME_CSS" 2>&1 | grep -oP '(?<=TOTAL conflits réels: )\d+' || echo 0)
      TOTAL_CONFLICTS=$((TOTAL_CONFLICTS + N))
      echo "  $THEME : $N conflit(s)"
    fi
  done
  if [ "$TOTAL_CONFLICTS" -gt 0 ]; then
    echo "  ATTENTION : $TOTAL_CONFLICTS conflit(s) total — relancer 'python3 $FUZZY <base> <theme>' pour détails"
  else
    echo "  Conflits = 0 OK"
  fi
else
  echo "  css_fuzzy.py introuvable — ignoré"
fi

echo "=== Resultat ==="
for f in \
  "$ROOT/desktop/css/bootstrap.min.css" \
  "$ROOT/desktop/css/desktop.main.min.css" \
  "$ROOT/desktop/css/dom.ui.min.css" \
  "$ROOT/desktop/css/coreWidgets.min.css" \
  "$ROOT/mobile/css/mobile.main.min.css" \
  "$ROOT/mobile/css/coreWidgets.min.css"; do
  orig="${f%.min.css}.css"
  echo "  $(basename "$orig"): $(wc -c < "$orig") -> $(wc -c < "$f") octets"
done
echo "=== OK ==="
