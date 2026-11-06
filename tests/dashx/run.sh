#!/usr/bin/env bash
# Lance toute la suite de tests dashx : backend PHP + smoke runtime Playwright.
# Usage : tests/dashx/run.sh
set -u
cd "$(dirname "$0")"
ROOT="$(cd ../.. && pwd)"

echo "==================== BACKEND (PHP) ===================="
php "$ROOT/tests/dashx/backend.php"
BACKEND=$?

echo
echo "==================== SMOKE (Playwright) ==============="
if [ ! -d node_modules/playwright ]; then
  echo "  playwright absent — installation (npm i)…"
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund >/dev/null 2>&1
fi
node smoke.mjs
SMOKE=$?

echo
if [ $BACKEND -eq 0 ] && [ $SMOKE -eq 0 ]; then
  echo "✅ TOUS LES TESTS PASSENT"
  exit 0
fi
echo "❌ ÉCHEC (backend=$BACKEND smoke=$SMOKE)"
exit 1
