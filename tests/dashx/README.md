# Tests — dashboard core `dashx`

Filet de sécurité contre les régressions (front + back). Couvre les bugs réels
rencontrés pendant le développement : redéclaration de widget, `meta is null`,
boutons/selects, payloads backend, auth.

## Lancer

```bash
tests/dashx/run.sh          # backend + smoke
# ou séparément :
php  tests/dashx/backend.php # tests backend (zéro dépendance)
node tests/dashx/smoke.mjs   # smoke runtime (Playwright)
```

À lancer **en root** (ou www-data) : la session de test est `chown` vers `www-data`
pour qu'Apache la lise. Aucun impact sur ton dashboard : `smoke.mjs` **sauvegarde
puis restaure** `dashx::layout` autour du test (backup `/tmp/dashx-smoke-layout-*.json`).

## Contenu

| Fichier | Type | Couvre |
|---|---|---|
| `backend.php` | PHP, 0 dépendance | `dashx` (payloads, `normalizeLayout`, types, `getCmds` id inconnu), endpoint AJAX refusé sans session, route page < 500 |
| `smoke.mjs` | Playwright headless | chargement dashboard, **SSE connecté**, création des 9 types de tuiles, **0 erreur console**, restauration layout |

## Dépendances

`smoke.mjs` requiert le package `playwright` (les navigateurs sont déjà en cache
dans `~/.cache/ms-playwright`). Installation isolée :

```bash
cd tests/dashx && npm install
```

Le test détecte automatiquement le binaire chromium en cache (variable
`DASHX_CHROME` pour forcer un chemin). Base URL configurable via `DASHX_BASE_URL`.

## Étendre

Ajouter un type de tuile : compléter le tableau `types` dans `smoke.mjs`.
Ajouter une assertion backend : nouvelle ligne `eq(...)`/`truthy(...)` dans `backend.php`.
