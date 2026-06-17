#!/bin/bash
# build/minify.sh — Minification CSS + JS pour Jeedom Core
# Usage: bash build/minify.sh [--css-only|--js-only]
#
# Les sources CSS (.css) sont trackées dans git mais peuvent être
# absentes du disque (seul le .min.css est déployé).
# Ce script utilise les sources présentes sur disque OU dans git.

set -euo pipefail
cd "$(dirname "$0")/.."

CLEANCSS="./node_modules/.bin/cleancss"

if [ ! -f "$CLEANCSS" ]; then
    echo "❌ clean-css-cli non trouvé. Lancer: npm install"
    exit 1
fi

CSS_ONLY=false
JS_ONLY=false
case "${1:-}" in
    --css-only) CSS_ONLY=true ;;
    --js-only)  JS_ONLY=true ;;
esac

# ── CSS ──────────────────────────────────────────────────
minify_css() {
    local src="$1"
    local dest="${2:-${src%.css}.min.css}"

    # Si le source n'existe pas sur disque, le restaurer depuis git
    if [ ! -f "$src" ]; then
        if git show "HEAD:$src" > /dev/null 2>&1; then
            git show "HEAD:$src" > "$src"
            echo "  ↻ Restauré depuis git: $(basename "$src")"
        else
            echo "  ⚠️  Source introuvable (ni disque ni git): $src"
            return
        fi
    fi

    echo "  CSS: $(basename "$src") → $(basename "$dest")"
    "$CLEANCSS" -O2 \
        --source-map --source-map-inline-sources \
        -o "$dest" "$src"
}

if [ "$JS_ONLY" = false ]; then
    echo "═══ Minification CSS ═══"

    # Desktop CSS
    minify_css "desktop/css/desktop.main.css"
    minify_css "desktop/css/coreWidgets.css"
    minify_css "desktop/css/dom.ui.css"
    minify_css "desktop/css/bootstrap.css"

    # Thèmes
    for theme_dir in core/themes/*/desktop/; do
        for css in "$theme_dir"*.css; do
            if [[ "$css" != *.min.css ]] && [[ "$css" != */colors.css ]] && [[ "$css" != */shadows.css ]] && [ -f "$css" ]; then
                minify_css "$css"
            fi
        done
    done

    echo "✅ CSS terminé"
fi

# ── JS ───────────────────────────────────────────────────
if [ "$CSS_ONLY" = false ]; then
    echo ""
    echo "═══ Vérification syntaxe JS ═══"

    ACORN="./node_modules/.bin/acorn"
    errors=0

    if [ -f "$ACORN" ]; then
        for js in core/js/*.js desktop/js/*.js; do
            if [ -f "$js" ]; then
                if ! "$ACORN" --ecma2020 "$js" > /dev/null 2>&1; then
                    echo "  ⚠️  Erreur syntaxe: $js"
                    errors=$((errors + 1))
                fi
            fi
        done

        if [ "$errors" -eq 0 ]; then
            echo "✅ JS: 0 erreur de syntaxe"
        else
            echo "❌ JS: $errors fichier(s) avec erreurs"
        fi
    else
        echo "  ℹ️  acorn non disponible, vérification syntaxe ignorée"
    fi
fi

echo ""
echo "═══ Terminé ═══"
