# Tests du core Jeedom (Jee-Limad)

## Règle absolue : jamais contre la base de production
Les tests écrivent et suppriment des données en base. `tests/bootstrap.php` et `tests/ci/init_db.php` chargent `tests/ci/guard.php`, qui refuse toute exécution si le nom de la base (`$CONFIG['db']['dbname']`) ne se termine pas par `_test`. Ne jamais lancer `install/install.php` ni `install/consistency.php` dans un environnement de test.

## 1. Base de test isolée
1. Créer la base et l'utilisateur MariaDB :
   ```sql
   CREATE DATABASE IF NOT EXISTS jeedom_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   GRANT ALL PRIVILEGES ON jeedom_test.* TO 'jeedom_test'@'127.0.0.1' IDENTIFIED BY 'jeedom_test';
   FLUSH PRIVILEGES;
   ```
2. Générer `core/config/common.config.php` dans le worktree depuis `core/config/common.config.sample.php` en remplaçant `#HOST#` (`127.0.0.1`), `#PORT#` (`3306`), `#DBNAME#` (`jeedom_test`), `#USERNAME#` (`jeedom_test`) et `#PASSWORD#`.
3. Initialiser le schéma et le dossier temporaire (`/tmp/jeedom-test` par défaut, surchargeable via `JEEDOM_TEST_TMP`) :
   ```bash
   sudo -u www-data -E php tests/ci/init_db.php ci_admin MotDePasseTest123
   ```

   `init_db.php` fait démarrer les identifiants de toutes les tables à 900000000 : `cron::halt()` et l'arrêt des
   scénarios cherchent les processus `cron_id=N` / `scenario_id=N` sur toute la machine, un identifiant de test ne
   doit jamais désigner un processus de la box.

Sur une box dont PHP précharge le core (`opcache.preload`), ajouter `-d opcache.enable_cli=0 -d opcache.preload=`
à chaque commande `php` lancée depuis un worktree, sinon les classes de la production entrent en conflit.

## 2. PHPUnit et PHPStan
Installer les dépendances de développement dans un worktree de test (`composer install`, sans jamais commiter les changements de `vendor/`) :
```bash
# PHPUnit (en www-data car jeedom::getTmpFolder applique chown www-data sur le cache)
sudo -u www-data -E vendor/bin/phpunit

# PHPStan
vendor/bin/phpstan analyse --no-progress --memory-limit=2G
```

## 3. Test de fumée de la connexion (`tests/smoke/login.mjs`)
1. Démarrer le serveur PHP intégré avec le routeur de sécurité (6 workers requis pour le long-polling `event.ajax.php`) :
   ```bash
   sudo -u www-data -E env PHP_CLI_SERVER_WORKERS=6 php -d opcache.enable_cli=0 -d opcache.preload= -S 127.0.0.1:8096 tests/ci/router.php
   ```
2. Installer Playwright et lancer le test :
   ```bash
   cd tests/smoke && npm install && cd ../..
   JEEDOM_BASE_URL=http://127.0.0.1:8096 JEEDOM_LOGIN=ci_admin JEEDOM_PASSWORD=MotDePasseTest123 node tests/smoke/login.mjs
   ```
   Variables optionnelles : `JEEDOM_CHROME` (binaire Chromium), `JEEDOM_SMOKE_SCREENSHOT` (capture d'écran).

## 4. CI GitHub Actions (`.github/workflows/ci.yml` & `eslint.yml`)
Déclenchée sur `push` et `pull_request` vers la branche `alpha` (ainsi que `workflow_dispatch`) :
- `php-lint` : vérification syntaxique `php -l` en PHP 7.4 et 8.4 (hors `3rdparty/`, `vendor/`, `plugins/`).
- `composer` : `composer validate --no-check-publish` et `composer audit --locked --no-dev` (non bloquant).
- `phpstan` : analyse statique PHPStan en PHP 8.4.
- `phpunit` : suite unitaire sur MariaDB 11 (`jeedom_test`) exécutée sous `www-data`.
- `smoke` : serveur `php -S` + parcours de connexion Playwright headless et vérification des `403` sur les chemins sensibles.
- `eslint.yml` : vérification et mise à jour du baseline ESLint sur `alpha`.
