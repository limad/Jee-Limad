#!/bin/bash
# build/css.sh — Workflow CSS unifié Jeedom Core (vérification + minification)
#
# Usage: bash build/css.sh <verify|minify|all>
#   verify  — audit anti-régression tokens (rgb(var(--X))/rgba(var(--X),a) cassés)
#             + stylelint sur les fichiers clés
#   minify  — régénère tous les .min.css : desktop.main (avec wrapper @layer base +
#             import bootstrap), coreWidgets, dom.ui, bootstrap, mobile.main, thèmes
#   all     — verify puis minify  (défaut)
#
# Note: le serveur peut servir les sources non-min via la config css::minify=0
#       (cf. core/php/utils.inc.php). Les .min restent générés pour la prod ou la
#       réactivation du flag.

set -uo pipefail
cd "$(dirname "$0")/.."

CLEANCSS="./node_modules/.bin/cleancss"
STYLELINT="./node_modules/.bin/stylelint"

# Familles de tokens migrées CSV→rgb() : toute syntaxe rgb(var(--X)) (nesting) ou
# rgba(var(--X),a) (relative color sur couleur non bare-CSV) est invalide.
MIGRATED='bg-color|panel-bg-color|eq-bg-color|defaultBkg-color|contrast-color|cat-[a-z]+-color'

# CSS minifiés sans wrapper @layer (composants hors couche / vendored / mobile)
CSS_FLAT=(
  "desktop/css/coreWidgets.css"
  "desktop/css/dom.ui.css"
  "desktop/css/bootstrap.css"
  "mobile/css/mobile.main.css"
)

minify_one() {
  local src="$1" dest="${1%.css}.min.css"
  [ -f "$src" ] || { echo "  ⚠️  absent: $src"; return; }
  echo "  CSS: $(basename "$src") → $(basename "$dest")"
  "$CLEANCSS" -O2 --source-map --source-map-inline-sources -o "$dest" "$src"
}

minify_desktop_main() {
  # desktop.main : wrapper @layer base + import bootstrap → cascade bootstrap<base<theme
  local src="desktop/css/desktop.main.css" dest="desktop/css/desktop.main.min.css"
  [ -f "$src" ] || { echo "  ⚠️  absent: $src"; return; }
  echo "  CSS: desktop.main.css → desktop.main.min.css [+@layer base wrapper]"
  local tmp; tmp=$(mktemp /tmp/desktop.main.XXXXXX.css)
  printf '@layer bootstrap,base,theme;\n@import url("/desktop/css/bootstrap.min.css") layer(bootstrap);\n@layer base{\n' > "$tmp"
  cat "$src" >> "$tmp"
  printf '\n}' >> "$tmp"
  "$CLEANCSS" -O2 --source-map --source-map-inline-sources -o "$dest" "$tmp"
  rm -f "$tmp"
}

do_minify() {
  [ -f "$CLEANCSS" ] || { echo "❌ clean-css-cli absent. Lancer: npm install"; exit 1; }
  echo "═══ Minification CSS ═══"
  minify_desktop_main
  for f in "${CSS_FLAT[@]}"; do minify_one "$f"; done
  for theme_dir in core/themes/*/desktop/; do
    for css in "$theme_dir"*.css; do
      [[ "$css" == *.min.css ]] && continue
      [[ "$css" == */colors.css ]] && continue
      [[ "$css" == */shadows.css ]] && continue
      [ -f "$css" ] && minify_one "$css"
    done
  done
  echo "✅ Minification terminée"
}

do_verify() {
  local rc=0
  echo "═══ Vérification CSS ═══"

  echo "── Audit tokens (rgb(var(--X)) / rgba(var(--X),a) cassés) ──"
  local hits
  hits=$(grep -rEn "rgba\(var\(--($MIGRATED)\)|rgb\(var\(--($MIGRATED)\)" \
      --include='*.css' --include='*.php' core/ desktop/ mobile/ 2>/dev/null \
      | grep -vi 'NouveauDossier\|copy ')
  if [ -n "$hits" ]; then echo "$hits"; echo "❌ usages tokens cassés ci-dessus"; rc=1
  else echo "✅ 0 usage token cassé"; fi

  if [ -f "$STYLELINT" ]; then
    echo "── Stylelint ──"
    "$STYLELINT" \
      desktop/css/desktop.main.css desktop/css/dom.ui.css desktop/css/coreWidgets.css \
      mobile/css/mobile.main.css \
      core/themes/coreX_Dark/desktop/coreX_Dark.css \
      core/themes/coreX_Light/desktop/coreX_Light.css \
      --formatter compact 2>&1 | tail -20 || rc=1
  else
    echo "── Stylelint absent (npm install) — ignoré ──"
  fi

  [ "$rc" -eq 0 ] && echo "✅ Vérification OK" || echo "⚠️  Vérification : anomalies ci-dessus"
  return $rc
}

case "${1:-all}" in
  verify) do_verify ;;
  minify) do_minify ;;
  all)    do_verify || true; echo; do_minify ;;
  *) echo "Usage: bash build/css.sh <verify|minify|all>"; exit 2 ;;
esac
