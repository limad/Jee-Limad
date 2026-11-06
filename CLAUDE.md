# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexte

Fork personnalisé de **Jeedom Core 4.5.x** (domotique, PHP + JS sans bundler), installé en production dans `/var/www/html` (Apache + MariaDB, Debian). Remote : `github.com/limad/Jee-Limad`, branche de travail `alpha` (la CI ESLint cible `develop`). L'installation tourne en direct : modifier un fichier = modifier la box vivante.

Ajouts/refontes propres à ce fork (absents du Jeedom amont) :
- **`dashx`** : dashboard alternatif intégré au core (`core/class/dashx.class.php`, `core/ajax/dashx.ajax.php`, `core/ajax/event_sse.ajax.php` pour le temps réel via SSE, `desktop/css/dashx.css`). Porté du plugin `jeedash`, sans cycle de vie plugin ; le layout est stocké dans la clé config core `dashx::layout`.
- **Refonte CSS** : tokens/variables dans `desktop/css/desktop.props.css` et `desktop.main.css` (couches `@layer`), styles inline déplacés hors des pages PHP (ex. `administration2`). Les couleurs migrées sont au format `rgb()` : les imbrications `rgb(var(--X))` / `rgba(var(--X),a)` sont invalides (vérifié par `build/css.sh`). Allowlist des overrides : `desktop/css/CSS-OVERRIDES-ALLOWLIST.md`.
- Durcissement sécurité (requêtes paramétrées, CORS restreint, sudoers limité, X-Forwarded-For validé via `security::trustedProxies`) : voir `docs/SECURITY-HARDENING.md`.

## Commandes

Pas d'étape de build : PHP/JS/CSS sont servis tels quels (CSS non minifié).

```bash
# Tests du dashboard dashx (backend PHP + smoke Playwright), à lancer en root ou www-data
tests/dashx/run.sh
php tests/dashx/backend.php

# JS : ESLint avec baseline (ce que la CI exécute)
npm run lint            # eslint core/js desktop/js
npm run lint:check      # compare à eslint-baseline.json
npm run lint:baseline   # régénère la baseline

# CSS/JS : audit des tokens cassés + stylelint + syntaxe JS (acorn), avant commit
bash build/css.sh

# Syntaxe PHP d'un fichier
php -l chemin/fichier.php

# Santé système (disque, MySQL, cron, Apache)
sh health.sh
```

Tests PHPUnit : `phpunit.xml.dist` et `tests/*Test.php` existent (bootstrap `tests/bootstrap.php` charge `core/php/core.inc.php`, donc la vraie DB), mais `phpunit` n'est pas dans `composer.json` et `vendor/bin` est vide ; il faut l'installer ou fournir un phar avant de lancer `phpunit tests/configTest.php` (un fichier) ou `--filter <méthode>` (un test). Même chose pour PHPStan (`phpstan.neon`, niveau 1, baseline `phpstan-baseline.neon`) : déclaré en require-dev mais non installé.

CLI Jeedom pour plugins/daemons : `php core/php/jeecli.php plugin <id> deamon_start|deamon_stop`.

## Architecture

Point d'entrée commun : `core/php/core.inc.php` (charge les classes de `core/class/*.class.php`, config DB depuis `core/config/common.config.php`, non versionné). Classes statiques de type ActiveRecord : `DB`, `eqLogic`, `cmd`, `scenario*`, `jeeObject`, `config`, `cache`, `event`, `history`, `plugin`, `update`, `user`, etc.

Couches :
- `core/ajax/*.ajax.php` : endpoints AJAX, un par domaine. Chacun vérifie l'auth (`isConnect()` / `isConnect('admin')`) via `authentification.php` ; paramètres lus avec `init()`.
- `core/api/` : API JSON-RPC / HTTP externe (clé API).
- `desktop/php/` (pages), `desktop/modal/` (dialogues), `desktop/js/` + `desktop/common/js/` (logique front), `mobile/` (UI mobile), `core/js/` + `core/dom/` (JS partagé : `jeedom.*`, `jeeDialog`, `jeeFrontEnd`).
- `plugins/` : plugins de l'instance (ignoré par git) : `mcp_jeedom`, `ai_assistant`, `jeedash`, `alexaapiv2`, `virtual`, `tailscale_ctrl`, `openvpn`, etc. Chaque plugin a `plugin_info/info.json`, `core/class`, `desktop/`, souvent un daemon Python dans `resources/`. `plugins/jeedash/` a son propre `CLAUDE.md`.
- `install/` : scripts d'installation/mise à jour (`install.sh` par étapes numérotées, utilisées par le `Dockerfile`).
- `3rdparty/`, `vendor/`, `node_modules/` : dépendances, ne pas modifier.

## Pièges

- Instance-spécifique et **ignoré par git** : `data/` (dont `jeedom_encryption.key`), `backup/`, `log/`, `plugins/`, `tmp/`, `*.sql`, `core/config/common.config.php`, `prompts/`, `audits/`. Ne jamais les committer ni exposer leur contenu (clés, dumps DB).
- Le dépôt appartient à `www-data` et `.git` à `root` : git exige `-c safe.directory=/var/www/html` (ou une config `safe.directory`), et l'écriture demande sudo ou l'utilisateur `www-data`.
- Des modifications non committées sont en cours (refonte CSS/UI et dashx) ; lire `git status` avant de supposer l'état de la branche.
- `index2.php`, `index3.php`, `patch.diff` sont des artefacts locaux, pas des références.
- `prompts/` et `audits/` contiennent un flux de travail interne (Claude conçoit les lots dans `prompts/NEXT.md`, Codex les exécute, avancement dans `PROGRESS.md` / `status.json`) et des audits CSS/sécurité : à lire pour le contexte, ne pas modifier sans raison.
- Commits en Conventional Commits (`fix(css): …`, `feat(ui): …`, `refactor(html): …`).
