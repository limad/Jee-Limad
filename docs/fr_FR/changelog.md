# Changelog Jeedom V4.5

# 4.5.3.20 (Jee-Limad, branche alpha)

## Sécurité

- `symfony/expression-language` passe de 5.4.45 à 5.4.54 (CVE-2026-109449 : une expression très imbriquée pouvait faire planter le processus PHP). Cette bibliothèque évalue les expressions des scénarios. La CI bloque désormais toute dépendance de production signalée par `composer audit`

# 4.5.3.19 (Jee-Limad, branche alpha)

## Corrections

- Dépôt : la règle `log/` du `.gitignore` excluait aussi `vendor/psr/log`. Un clone frais de Jee-Limad n'avait donc pas cette bibliothèque et le core s'arrêtait au chargement (`Class "Psr\Log\AbstractLogger" not found`). Les règles `data/`, `backup/`, `log/`, `tmp/` et `plugins/` ne visent plus que la racine, et `vendor/psr/log` est suivi
- CI : PHPUnit a le droit d'écrire dans le dépôt (tests du shell) ; le contrôle ESLint n'ouvre plus de PR automatique de baseline (jeton en lecture seule) ; actions passées en v5

# 4.5.3.18 (Jee-Limad, branche alpha)

## Développement

- Tests : PHPUnit (9.6, dépendance de développement) tourne sur une base de test isolée ; le bootstrap refuse toute base dont le nom ne finit pas par `_test`, et `tests/ci/init_db.php` crée le schéma sans exécuter `install/consistency.php` (qui modifie le système). Tests périmés corrigés (journaux sans Monolog, état des scénarios en cache, délai des scénarios entier, crons) : 107 tests au vert
- Test de fumée de la connexion (`tests/smoke/login.mjs`, Playwright) : page de connexion, œil du mot de passe, validation par Entrée, arrivée sur le dashboard, aucune erreur console, chemins sensibles en 403
- CI GitHub sur la branche `alpha` : syntaxe PHP (7.4 et 8.4), composer validate et audit, PHPStan, PHPUnit sur MariaDB, test de fumée ; le contrôle ESLint visait la branche `develop` et ne tournait donc jamais

# 4.5.3.17 (Jee-Limad, branche alpha)

## Corrections

- Utilisateurs : la liste « Sessions actives » se remplit de nouveau. Les fichiers de session sont lus directement (ils appartiennent au serveur web), au lieu d'un `sudo cat` refusé par la liste sudo
- Connexion : le nettoyage des sessions expirées (au-delà de 500 sessions) est autorisé dans la liste sudo (`/usr/lib/php/sessionclean`)
- Dépendances npm : l'installation ne bute plus sur le refus de sudo de passer `NODE_OPTIONS` ; la variable est placée avant sudo et seule elle est conservée pour npm (`env_keep`)
- Dépendances yarn : `yarn` ajouté à la liste sudo
- Sauvegarde Samba : `smbclient` tourne sans sudo. Il n'en a pas besoin, et le fichier temporaire d'identifiants n'était pas supprimé (le `sudo rm -f` était refusé) : le mot de passe restait dans le dossier temporaire
- Liste sudo : `ip` autorisé aussi sous `/usr/bin/ip` (emplacement réel sur Debian 13)

# 4.5.3.16 (Jee-Limad, branche alpha)

## Sécurité

- Échappement HTML des valeurs encore affichées brutes : noms et couleurs des objets, équipements et commandes dans l'historique, paquets de la vérification des dépendances, nom et icône du produit (page principale), options du profil dans les vues et la double authentification ; le nom du produit passe en JSON dans le script de la page. Constat repris de l'audit de sécurité du projet Jeedom X (S-02) ; les noms étaient déjà nettoyés à l'enregistrement, ce correctif ferme les autres chemins

## Corrections

- Historique : le groupe « Aucun » (équipements sans objet) avait un attribut HTML non fermé

# 4.5.3.15 (Jee-Limad, branche alpha)

## Sécurité

- Les dossiers cachés (`.git`, `.claude`, `.codex`…) ne sont plus jamais servis par Apache, où qu'ils soient dans l'arborescence (plugins compris) ; seul `.well-known` reste accessible. Jusqu'ici, un fichier PHP placé dans un tel dossier, par exemple une copie de travail du core laissée par un outil de développement dans un plugin, pouvait être exécuté depuis le navigateur

# 4.5.3.14 (Jee-Limad, branche alpha)

## Connexion

- Le bouton œil de la page de connexion affiche de nouveau le mot de passe (le script n'écoutait que des liens, la page affiche un bouton)
- La touche Entrée valide de nouveau la connexion (champs identifiant, mot de passe et code à 2 facteurs), ainsi que les formulaires « mot de passe perdu » et « nouveau mot de passe » ; elle avait disparu avec la reprise de la procédure de mot de passe perdu (4.5.3.9)

# 4.5.3.13 (Jee-Limad, branche alpha)

## Sécurité

- Liste sudo de www-data (`install/sudoers.jeedom`) : les scripts de plugins ne sont plus autorisés que dans `plugins/*/resources/`, comme sur la box en service (avant : tout le dossier `plugins/`). Les scripts de dépendances et d'aide des plugins restent dans `resources/`, selon la convention Jeedom

# 4.5.3.12 (Jee-Limad, branche alpha)

## Designs 3D (repris de Jeedom)

- Un équipement placé sur un design 3D ne provoque plus d'erreur fatale à la recherche de ses utilisations (« Utilisé par », confirmation avant suppression) : appel à une méthode inexistante corrigé ([Détails](https://github.com/jeedom/core/pull/3653), encore ouverte chez Jeedom ; bug établi dans le code du fork)

# 4.5.3.11 (Jee-Limad, branche alpha)

## Sécurité

- `'unsafe-eval'` est réellement retiré de la politique de sécurité (CSP) : le retrait précédent ne touchait que `script-src-attr` et `script-src-elem`, où il est sans effet, et laissait `eval` autorisé par `script-src`. Le seul usage d'`eval` du core (suppression des accents dans les recherches des fenêtres d'insertion) est réécrit sans `eval`

# 4.5.3.10 (Jee-Limad, branche alpha)

## Graphiques (repris de Jeedom)

- Bibliothèque Highstock/Highcharts passée de 10.3.2 à 12.6.0, réduite aux fichiers utilisés (768 fichiers / 13 Mo → 85 fichiers / 3 Mo) ; jsPDF de l'export PDF passe de 2.5.0 à 4.2.1 ([Détails](https://github.com/jeedom/core/pull/3457))
- Export des graphiques en local (sans service externe) et export CSV activés
- Plus de graduation pour une date sans donnée en bout d'axe ; la barre de défilement suit de nouveau son réglage ; noms complets des jours et des mois dans les axes et les infobulles
- La politique de sécurité (CSP) du fork est conservée ; seule l'origine `blob:` est ajoutée aux images pour l'export

# 4.5.3.9 (Jee-Limad, branche alpha)

## Sécurité et comptes (repris de Jeedom)

- Mot de passe perdu : depuis la page de connexion, un lien de réinitialisation valable 5 minutes et à usage unique est envoyé par la commande de notification configurée dans le profil de l'utilisateur ; une demande par IP toutes les 5 minutes, réponse identique que le compte existe ou non ([Détails](https://github.com/jeedom/core/pull/3519))
- Appareils enregistrés (connexion sans double authentification) : durée de vie réglable de 7 à 90 jours (30 par défaut), prolongée à chaque utilisation, nettoyage automatique des appareils expirés ([Détails](https://github.com/jeedom/core/pull/3511))
- Nouveau journal `audit` : connexions, déconnexions, échecs, changements de mot de passe ou de clé API, création et suppression d'utilisateurs ([Détails](https://github.com/jeedom/core/pull/3493)) ; dans le fork, il écrit au niveau info par défaut
- Les cookies de connexion portent le drapeau `secure` aussi en HTTPS direct

## Historique (repris de Jeedom)

- Mode de rétention par commande numérique : dernière valeur du jour ou du mois, ou première et dernière ([Détails](https://github.com/jeedom/core/pull/3401))

## Retrait

- #3605 (détection de Node hors apt, ajoutée en 4.5.3.6) est retirée : la PR est encore ouverte et contestée chez Jeedom, et inutile ici

# 4.5.3.8 (Jee-Limad, branche alpha)

## Interface (repris de Jeedom)

- Redimensionnement des widgets (dashboard, vues, designs) : la fin du redimensionnement déclenche enfin le recalage et l'enregistrement de la position ([#3439](https://github.com/jeedom/core/pull/3439)) ; dans un design zoomé, un widget redimensionné ne déborde plus et le zoom invalide retombe à 1 ([#3441](https://github.com/jeedom/core/pull/3441))
- Designs : widgets d'une zone placés au bon endroit, plus de doublons ([Détails](https://github.com/jeedom/core/pull/3572))
- Tableaux : le tri d'une colonne mélangeant nombres et texte ne casse plus l'ordre ([Détails](https://github.com/jeedom/core/pull/3413))
- Fenêtres et menus : position de la fenêtre principale ([#3359](https://github.com/jeedom/core/pull/3359)), menus contextuels réaffichés correctement ([#3369](https://github.com/jeedom/core/pull/3369)), effacement des notifications limité à la fenêtre concernée ([#3414](https://github.com/jeedom/core/pull/3414))
- Les événements Jeedom sont aussi diffusés en événements JavaScript natifs pour les plugins ([Détails](https://github.com/jeedom/core/pull/3416))
- Recherche dans le sélecteur d'icônes ([Détails](https://github.com/jeedom/core/pull/3477))
- Correctifs JavaScript divers (dashboard, objets, widgets, édition en masse, utilisateurs, scénarios) ([#3318](https://github.com/jeedom/core/pull/3318), [#3326](https://github.com/jeedom/core/pull/3326), [#3333](https://github.com/jeedom/core/pull/3333))
- Interactions, API et designs 3D : plus d'erreur PHP lors du remplacement des tags ([#3407](https://github.com/jeedom/core/pull/3407), [#3408](https://github.com/jeedom/core/pull/3408))

# 4.5.3.7 (Jee-Limad, branche alpha)

## Corrections reprises de Jeedom

- Batterie des équipements : niveau borné entre 0 et 100, valeur non numérique ignorée, alertes recalculées quand on change les seuils et au plus une notification par jour et par niveau ([Détails](https://github.com/jeedom/core/pull/3543))
- La clé API du core générée à la première utilisation enregistre son mode sous la bonne clé (`api::core::mode`) ([Détails](https://github.com/jeedom/core/pull/3623))
- Ports série : les chemins `/dev/serial/by-id` sans nœud `ttyUSB`/`ttyACM` (périphérique passé à un conteneur) sont proposés ([Détails](https://github.com/jeedom/core/pull/3609))
- Chargement des classes : une classe `plugin_xxx` est cherchée dans son propre fichier `xxx.class.php` du plugin ([Détails](https://github.com/jeedom/core/pull/3444))
- Import d'équipement : option pour enregistrer sans relancer les traitements de sauvegarde ([Détails](https://github.com/jeedom/core/pull/3471))

# 4.5.3.6 (Jee-Limad, branche alpha)

## Mises à jour du core

- Les scripts de migration (`install/update/X.php`) suivent la numérotation à 4 chiffres du fork : chaque script est lancé une seule fois, quand le core atteint sa version (`4.5.4.php` à partir de 4.5.4.1), et non plus en avance

## Debian 13 et installation (repris de Jeedom, adapté à Debian 11 à 13)

- Santé : le contrôle « Version OS » accepte Debian 11 à 13 (`os::max` manquait et le faisait échouer) ; le compteur de processus tués par manque de mémoire lit le cgroup dans un conteneur ([Détails](https://github.com/jeedom/core/pull/3483), [#3595](https://github.com/jeedom/core/pull/3595))
- Paquets : liste mise à jour (plus de `software-properties-common`, absent de Debian 13, ni de paquets Python 2), espeak-ng ou espeak, libcurl4t64 ou libcurl4 ([Détails](https://github.com/jeedom/core/pull/3483))
- Le serveur NTP saisi dans la configuration est utilisé par la resynchronisation de l'heure ([Détails](https://github.com/jeedom/core/pull/3483))
- Installation : plus de redémarrage nécessaire (tmpfs `/tmp/jeedom` monté tout de suite, Apache relancé pour les nouveaux groupes), attente du verrou apt/dpkg, droits de `/etc/cron.d`, composer sans `HOME` ([#3544](https://github.com/jeedom/core/pull/3544), [#3535](https://github.com/jeedom/core/pull/3535), [#3537](https://github.com/jeedom/core/pull/3537), [#3612](https://github.com/jeedom/core/pull/3612))
- Gestion des paquets : utilisation d'apt revue, diagnostic d'installation plus clair ([Détails](https://github.com/jeedom/core/pull/3558)) ; Node détecté même installé hors apt ([Détails](https://github.com/jeedom/core/pull/3605))
- Sauvegarde : la sauvegarde du jour n'est plus supprimée pour respecter la taille maximale ([Détails](https://github.com/jeedom/core/pull/3542))
- Les logs ne plantent plus quand la base de données est indisponible au démarrage ([Détails](https://github.com/jeedom/core/pull/3536))
- Migration Debian 13 préparée pour 4.6.3 (`install/update/4.6.3.php`) ([Détails](https://github.com/jeedom/core/pull/3597))

La liste sudo restreinte du fork et les arguments shell échappés sont conservés.

# 4.5.3.5 (Jee-Limad, branche alpha)

## Historique et graphiques (repris de Jeedom)

- Les valeurs lues dans les archives d'historique sont rattachées à la table `historyArch` : les modifier ou les supprimer agit sur la bonne table ([Détails](https://github.com/jeedom/core/pull/3377), PR encore ouverte chez Jeedom)
- Une période (« 1 semaine »…) avec une date de fin se compte à partir de cette date de fin, et non plus d'aujourd'hui ([Détails](https://github.com/jeedom/core/pull/3458))
- Calculs d'historique : l'horodatage sert de clé entière, plus d'avertissement PHP 8.1 sur une clé flottante ([Détails](https://github.com/jeedom/core/pull/3399))
- Graphiques en direct : transformations appliquées et camemberts mis à jour ([Détails](https://github.com/jeedom/core/pull/3434)), échelle Y recalculée et garde-fous ([Détails](https://github.com/jeedom/core/pull/3437)), plus de mise à jour pendant un zoom ([Détails](https://github.com/jeedom/core/pull/3451)), zone en pointillé retirée à l'arrivée d'une nouvelle valeur ([Détails](https://github.com/jeedom/core/pull/3456))
- La valeur d'une commande n'est plus modifiée par son affichage ; balises HTML retirées dans le tableau des commandes ([Détails](https://github.com/jeedom/core/pull/3452))

# 4.5.3.4 (Jee-Limad, branche alpha)

## Sécurité

- Les options d'une mise à jour du core (API `jeedom::update`, centre de mises à jour) sont échappées avant d'être passées à `install/update.php`

## Centre de mises à jour (repris de Jeedom)

- Le message « De nouvelles mises à jour sont disponibles » suit l'état réel : mis à jour après chaque vérification ou mise à jour, retiré quand il n'y a plus rien à faire ([Détails](https://github.com/jeedom/core/pull/3410))
- Une source de mise à jour introuvable ou inactive donne une erreur claire au lieu d'un échec silencieux ([Détails](https://github.com/jeedom/core/pull/3526))
- Changer la source d'un plugin efface les réglages de l'ancienne source (dépôt, jeton GitHub…) ([Détails](https://github.com/jeedom/core/pull/3575))

# 4.5.3.3 (Jee-Limad, branche alpha)

## Sécurité

- Scénarios : un utilisateur non administrateur ne peut plus lister, lire, modifier ni importer des scénarios ou des modèles via l'AJAX ; il garde l'affichage des widgets, leur ordre et le lancement autorisé. L'ordre et la taille envoyés sont assainis ([Détails](https://github.com/jeedom/core/pull/3584))

## Corrections reprises de Jeedom

- Scénarios : un déclencheur entouré d'espaces ou de retours à la ligne est reconnu ([Détails](https://github.com/jeedom/core/pull/3494))
- Scénarios : timeout vide toléré après lecture en base (PHP 8), `save()` renvoie le résultat réel ([Détails](https://github.com/jeedom/core/pull/3393))

# 4.5.3.2 (Jee-Limad, branche alpha)

## Sécurité

- Les mots de passe sont hachés avec l'algorithme natif de PHP (`password_hash`, bcrypt) au lieu de SHA-512 sans sel. Les comptes existants sont migrés automatiquement à leur prochaine connexion, sans changer de mot de passe ; la migration est notée dans le log `audit` ([Détails](https://github.com/jeedom/core/pull/3476))
- La connexion n'accepte plus le hash SHA-512 du mot de passe à la place du mot de passe lui-même ([Détails](https://github.com/jeedom/core/pull/3476))
- La régénération du jeton d'accès d'un utilisateur ne provoque plus de double sauvegarde ([Détails](https://github.com/jeedom/core/pull/3470))

# 4.5.3.1 (Jee-Limad, branche alpha)

Version dérivée de Jeedom 4.5.3 (fork Jee-Limad). Numérotation : version officielle de base + numéro de fork (`4.5.3.1`, `4.5.3.2`…), le nom du fork est dans `core/config/fork`. Les correctifs repris de Jeedom sont liés à leur pull request d'origine.

## Sécurité

- Les sessions sont revérifiées à chaque requête : un compte désactivé, passé en « accès local uniquement » ou rétrogradé perd l'accès sans attendre la fin de sa session ([Détails](https://github.com/jeedom/core/pull/3520))
- L'accès par `localhost` en IPv6 (`::1`) est reconnu comme local, comme `127.0.0.1` : la double authentification n'est plus demandée à tort ([Détails](https://github.com/jeedom/core/issues/3547))
- L'adresse IP du client n'est lue dans `X-Forwarded-For` / `X-Real-IP` que si la requête vient d'un proxy de confiance déclaré (`security::trustedProxies`) ([Détails](https://github.com/jeedom/core/issues/3531))
- Les commandes système (gestion des paquets, processus) protègent leurs arguments contre l'injection shell ([Détails](https://github.com/jeedom/core/pull/3574))
- Le mot de passe Samba n'apparaît plus dans la ligne de commande : il passe par un fichier temporaire protégé, supprimé après usage ([Détails](https://github.com/jeedom/core/pull/3475))
- Le HTML des infobulles est nettoyé, et les liens `javascript:`, `vbscript:` et `data:` y sont retirés ([Détails](https://github.com/jeedom/core/pull/3440))
- Lot de correctifs de fuites de secrets et de contrôles d'accès (configuration, API, utilisateurs) ([#3482](https://github.com/jeedom/core/pull/3482), [#3500](https://github.com/jeedom/core/pull/3500), [#3507](https://github.com/jeedom/core/pull/3507), [#3576](https://github.com/jeedom/core/pull/3576), [#3580](https://github.com/jeedom/core/pull/3580))
- La modale widget en mobile applique les mêmes contrôles d'accès que sur ordinateur ([Détails](https://github.com/jeedom/core/pull/3538))
- Correctifs d'audit : traversée de chemin (modèles de scénarios), injection shell, XSS et CRLF dans les utilitaires PHP, `unsafe-eval` retiré de la CSP, `.git`/`.ssh` exclus du `chmod` de remise en ordre des droits
- Modèle fail2ban optionnel et guide `docs/SECURITY-HARDENING.md`

## Dashboard alternatif dashx

- Nouveau dashboard `dashx` avec mise à jour en temps réel (SSE)
- Les droits de l'utilisateur s'appliquent aux commandes et aux équipements affichés
- Un code d'accès et une confirmation sont exigés avant d'exécuter une action

## Corrections reprises de Jeedom

- Scénarios : délais différés fractionnaires, cibles d'annulation manquantes, liens d'objet invalides des scénarios désactivés ([#3617](https://github.com/jeedom/core/pull/3617), [#3637](https://github.com/jeedom/core/pull/3637))
- Événements et listeners : lecture des options, abonnements vidés, conservation des événements lors des conversions JSON ([#3615](https://github.com/jeedom/core/pull/3615), [#3624](https://github.com/jeedom/core/pull/3624))
- Commandes et variables : références de commandes conservées dans les options JSON, notifications de variables entre portées ([#3620](https://github.com/jeedom/core/pull/3620), [#3619](https://github.com/jeedom/core/pull/3619))
- Résumés d'objets à jour après l'enregistrement d'un objet ([#3618](https://github.com/jeedom/core/pull/3618))
- Plugins et mises à jour : état des équipements après désactivations répétées, protections de relance actives par défaut, mises à jour bloquées exclues du compteur, version des dépendances alternatives conservée ([#3625](https://github.com/jeedom/core/pull/3625), [#3626](https://github.com/jeedom/core/pull/3626), [#3627](https://github.com/jeedom/core/pull/3627), [#3622](https://github.com/jeedom/core/pull/3622))
- Base de données : succès des écritures et suppressions renvoyé, opérateurs de filtre reconnus seulement en préfixe, valeurs par défaut du schéma préservées, différences de clés primaires détectées et réparées ([#3633](https://github.com/jeedom/core/pull/3633), [#3634](https://github.com/jeedom/core/pull/3634), [#3635](https://github.com/jeedom/core/pull/3635), [#3636](https://github.com/jeedom/core/pull/3636))
- Utilitaires : sélection JSON vide, marqueur de chiffrement reconnu seulement en préfixe, valeurs nulles préservées à l'import d'objets ([#3629](https://github.com/jeedom/core/pull/3629), [#3630](https://github.com/jeedom/core/pull/3630), [#3628](https://github.com/jeedom/core/pull/3628))
- Timeline : sélection littérale des dossiers, dédoublonnage avant la rétention ([#3631](https://github.com/jeedom/core/pull/3631), [#3632](https://github.com/jeedom/core/pull/3632))
- Messages : décodage des apostrophes ([#3621](https://github.com/jeedom/core/pull/3621))

## Interface et thèmes

- Nouveaux thèmes coreX_Blue, coreX_Zinc et tailwind ; couleurs des thèmes en design tokens (oklch), sans conflit entre thèmes
- Boutons : liens `a.btn` remplacés par de vrais boutons, styles sémantiques homogènes
- Mobile : connexion tactile, tableaux responsives, logs lisibles
- Corrections : cases à cocher, lecture des couleurs `rgb()`, rafraîchissement des tables, fenêtre de configuration
- Bouton de redémarrage d'Apache dans l'onglet Système de l'administration
- CSS servi depuis les sources (fichiers minifiés supprimés)

## Performances et système

- moment.js (360 Ko) remplacé par day.js (22 Ko) ; requête N+1 du dashboard corrigée
- Debian 13 : synchronisation de l'heure par chrony
- Scripts PHP en arrière-plan : erreurs `sudo` corrigées (cohérence, restauration, nettoyage de la base, découpage des logs)

# 4.5.3

- Diverses corrections de bugs et optimisations
- Mise à jour dans les contrôles de version
- Mise à jour du nommage des ports de communication ([Détails](https://github.com/jeedom/core/issues/3210))
- Limitation de la taille maximale des fichiers de logs ([Détails](https://github.com/jeedom/core/pull/3045))
- Ajout du contenu de la page "Santé" aux demandes d'assistance communautaire ([Détails](https://github.com/jeedom/core/pull/3224))
- [Développeurs] Ajout de la prise en charge de configurations spécifiques au matériel via un fichier `core/config/specific.config.ini` dans le dossier du plugin ([Détails](https://github.com/jeedom/core/issues/3218))
- [Développeurs] Ajout de la méthode `config::byValue($_value, string $_key = null)`([Détails](https://github.com/jeedom/core/pull/3212/changes/559a010))

# 4.5.2

- Mise à jour indispensable qui corrige un bug sur la vérification de la date empêchant tout lancement de scénario ou de tâche planifiée.

# 4.5.1

- Le déclencheur de scénarios `#user_connect#` inclut dorénavant le tag `#trigger_value#` qui renseigne le nom de l'utilisateur venant de se connecter ([Détails](https://github.com/jeedom/core/pull/3109))
- Montée de version de nodejs 20 vers 22 ([Détails](https://github.com/jeedom/core/issues/3147))
- La sauvegarde se fera maintenant a une heure aléatoire entre 00:10 et 9:59
- Correction d'un warning sur les valeurs de tags null

# 4.5

- [Développeurs] Ajout de la fonction `$listener->removeEvent($_id)`
- Possibilité de rendre les colonnes des tableaux redimensionnables (seulement la liste des variables pour le moment ça sera étendu à d'autres tables si besoin) [LIEN](https://github.com/jeedom/core/issues/2499)
- Ajout d'une alerte si l'espace disque de jeedom est trop faible (la vérification se fait une fois par jour) [LIEN](https://github.com/jeedom/core/issues/2438)
- Ajout d'un bouton sur la fenêtre de configuration d'une commande au niveau du champ de calcul de valeur pour aller chercher une commande [LIEN](https://github.com/jeedom/core/issues/2776)
- Possibilité de masquer certains menus pour les utilisateurs aux droits limités [LIEN](https://github.com/jeedom/core/issues/2651)
- Les graphiques se mettent à jour automatiquement lors de l'arrivée de nouvelles valeurs [LIEN](https://github.com/jeedom/core/issues/2749)
- Jeedom ajoute automatiquement la hauteur de l'image lors de la création des widgets pour éviter les soucis de chevauchement en mobile [LIEN](https://github.com/jeedom/core/issues/2539)
- Refonte de la partie backup cloud [LIEN](https://github.com/jeedom/core/issues/2765)
- [Développeurs] Mise en place d'un système de queue pour l'exécution d'actions [LIEN](https://github.com/jeedom/core/issues/2489)
- Les tags des scénarios sont maintenant propres à l'instance du scénario (si vous avez deux lancements de scénarios très proches, les tags du dernier n'écrasent plus le premier) [LIEN](https://github.com/jeedom/core/issues/2763)
- Changement sur la partie trigger des scénarios : [LIEN](https://github.com/jeedom/core/issues/2414)
  - ``triggerId()`` est maintenant deprecated et sera retiré dans les futures mises à jour du core. Si vous avez ``triggerId() == 587`` il faut le remplacer par ``#trigger_id# == 587``
  - ``triggerValue()`` est maintenant deprecated et sera retiré dans les futures mises à jour du core. Si vous avez ``triggerValue() == 10`` il faut le remplacer par ``#trigger_value# == 10``
  -  ``trigger()`` est maintenant deprecated et sera retiré dans les futures mises à jour du core. Si vous avez ``trigger(#[objet][equipement][commande]#)`` il faut le remplacer par ``#trigger_name# == '[objet][equipement][commande]'``
  - ``#trigger#`` : Peut être :
    - ``api`` si le lancement a été déclenché par l'API,
    - ``TYPEcmd`` si le lancement a été déclenché par une commande, avec TYPE remplacé par l'id du plugin (ex virtualCmd),
    - ``schedule`` s'il a été lancé par une programmation,
    - ``user`` s'il a été lancé manuellement,
    - ``start`` pour un lancement au démarrage de Jeedom.
  - ``#trigger_id#`` : Si c'est une commande qui a déclenché le scénario alors ce tag prend la valeur de l'id de la commande qui l'a déclenché
  - ``#trigger_name#`` : Si c'est une commande qui a déclenché le scénario alors ce tag prend la valeur du nom de la commande (sous forme '[objet][équipement][commande]'). Notez qu'en utilisant la syntaxe : ``#trigger_name# == '[objet][equipement][commande]'``, en cas de modification de nom de votre objet ou équipement ou commande, ce ne sera pas mis à jour automatiquement dans votre code.
  - ``#trigger_value#`` : Si c'est une commande qui a déclenché le scénario alors ce tag prend la valeur de la commande ayant déclenché le scénario
  - ``#trigger_message#`` : Message indiquant l'origine du lancement du scénario
- Amélioration de la gestion des plugins sur github (plus de dépendances à une librairie tierce) [LIEN](https://github.com/jeedom/core/issues/2567)
- Suppression de l'ancien système de cache. [LIEN](https://github.com/jeedom/core/pull/2799)
- Possibilité de suppression les blocs DANS et A en attente d'un autre scénario [LIEN](https://github.com/jeedom/core/pull/2379)
- Correction d'un bug dans Safari sur les filtres avec accents [LIEN](https://github.com/jeedom/core/pull/2754)
- Correction d'un bug sur la génération des informations *generic type* dans les scénarios [LIEN](https://github.com/jeedom/core/pull/2806)
- Ajout d'une confirmation lors de l'ouverture de l'accès support depuis la page de gestion des utilisateurs [LIEN](https://github.com/jeedom/core/pull/2809)
- Amélioration du système de cron pour éviter quelques ratés de lancement [LIEN](https://github.com/jeedom/core/commit/533d6d4d508ffe5815f7ba6355ec45497df73313)
- Ajout dans l'assistant de condition des scénarios des conditions *supérieur ou égal* et *inférieur ou égal* [LIEN](https://github.com/jeedom/core/issues/2810)
- Possibilité d'exclure des commandes de l'analyse des commandes mortes [LIEN](https://github.com/jeedom/core/issues/2812)
- Correction d'un bug sur la numérotation du nombre de lignes des tableaux [LIEN](https://github.com/jeedom/core/commit/0e9e44492e29f7d0842b2c9b3df39d0d98957c83)
- Ajout d'openstreetmap.org dans les domaines externes autorisés par défaut [LIEN](https://github.com/jeedom/core/commit/2d62c64f0bd1958372844f6859ef691f88852422)
- Mise à jour automatique du fichier de sécurité apache lors de la mise à jour du core [LIEN](https://github.com/jeedom/core/issues/2815)
- Correction d'un warning sur les vues [LIEN](https://github.com/jeedom/core/pull/2816)
- Correction d'un bug sur la valeur du select du widget par défaut [LIEN](https://github.com/jeedom/core/pull/2813)
- Correction d'un bug si une commande dépasse son min ou son max la valeur passait à 0 (au lieu du min/max) [LIEN](https://github.com/jeedom/core/issues/2819)
- Correction d'un bug d'affichage du menu réglage dans certaines langues [LIEN](https://github.com/jeedom/core/issues/2821)
- Possibilité dans les déclencheurs programmés des scénarios d'utiliser des calculs/commandes/tags/formules donnant en résultat l'heure de lancement sous la forme Gi (heures sans zero initial et minutes, exemple pour 09h15 => 915 ou pour 23h40 => 2340) [LIEN](https://github.com/jeedom/core/pull/2808)
- Possibilité de mettre une image personnalisée pour les équipements dans les plugins (si le plugin le supporte), cela se fait dans la configuration avancée de l'équipement [LIEN](https://github.com/jeedom/core/pull/2802) [LIEN](https://github.com/jeedom/core/pull/2852)
- Ajout du nom de l'utilisateur qui a lancé le scénario dans le tag ``#trigger_value#`` [LIEN](https://github.com/jeedom/core/pull/2382)
- Correction d'une erreur qui pouvait arriver en quittant le dashboard avant la fin du chargement de celui-ci [LIEN](https://github.com/jeedom/core/pull/2827)
- Correction d'un bug sur la page de remplacement lors d'un filtre sur les objets [LIEN](https://github.com/jeedom/core/issues/2833)
- Amélioration de l'ouverture du changelog du core sous iOS (plus dans une popup) [LIEN](https://github.com/jeedom/core/issues/2835)
- Amélioration de la fenêtre de création avancée de widget [LIEN](https://github.com/jeedom/core/pull/2836)
- Amélioration de la fenêtre de configuration avancée des commandes [LIEN](https://github.com/jeedom/core/pull/2837)
- Correction d'un bug sur la création de widget [LIEN](https://github.com/jeedom/core/pull/2838)
- Correction d'un bug sur la page scénario et la fenêtre d'ajout d'actions qui pouvait ne plus fonctionner [LIEN](https://github.com/jeedom/core/issues/2839)
- Correction d'un bug qui pouvait changer l'ordre des commandes lors de l'édition du dashboard [LIEN](https://github.com/jeedom/core/issues/2841)
- Correction d'un erreur javascript sur les historiques [LIEN](https://github.com/jeedom/core/issues/2840)
- Ajout d'une sécurité sur l'encodage json en ajax pour éviter les erreurs dues à des caractères invalides [LIEN](https://github.com/jeedom/core/commit/0784cbf9e409cfc50dd9c3d085c329c7eaba7042)
- Si une commande d'un équipement est de type générique "Batterie" et a pour unité "%" alors le core va automatiquement affecter le niveau de batterie de l'équipement à la valeur de la commande [LIEN](https://github.com/jeedom/core/issues/2842)
- Amélioration des textes et correction de fautes [LIEN](https://github.com/jeedom/core/pull/2834)
- Lors de l'installation de dépendances npm le cache est nettoyé avant [LIEN](https://github.com/jeedom/core/commit/1a151208e0a66b88ea61dca8d112d20bb045c8d9)
- Correction d'un bug sur les plan 3d pouvant bloquer complètement la configuration [LIEN](https://github.com/jeedom/core/pull/2849)
- Correction d'un bug sur la fenêtre d'affichage des historiques [LIEN](https://github.com/jeedom/core/pull/2850)
- Possibilité de choisir le port d'écoute d'Apache en mode docker [LIEN](https://github.com/jeedom/core/pull/2847)
- Correction d'un warning lors d'une sauvegarde sur la table event [LIEN](https://github.com/jeedom/core/issues/2851)
- Ajout d'un nom d'affichage (display name) pour les objets [LIEN](https://github.com/jeedom/core/issues/2484)
- Ajout d'un bouton pour supprimer les historiques et évenements de la timeline dans le futur [LIEN](https://github.com/jeedom/core/issues/2415)
- Correction d'un soucis sur les commandes de type select dans les designs [LIEN](https://github.com/jeedom/core/issues/2853)
- Possibilité d'indiquer qu'un équipement n'a pas de batterie (en cas de mauvaise remontée) [LIEN](https://github.com/jeedom/core/issues/2855)
- Refonte de l'écriture dans les logs, suppression de la bibliothèque monolog (attention l'option d'envoi des logs dans syslog n'est plus disponible pour le moment, si la demande est forte nous verrons pour la remettre) [LIEN](https://github.com/jeedom/core/pull/2805)
- Meilleure gestion du niveau de log des sous log des plugins [LIEN](https://github.com/jeedom/core/issues/2860)
- Suppression du dossier vendor (utilisation de composer de manière normale), permet de réduire la taille du core [LIEN](https://github.com/jeedom/core/commit/3aa99c503b6b1903e6a07b346ceb4d03ca3c0c42)
- Les paramètres spécifiques des widgets peuvent maintent être traduits [LIEN](https://github.com/jeedom/core/pull/2862)
- Correction d'un bug sous mac sur les designs lors d'un clic droit [LIEN](https://github.com/jeedom/core/issues/2863)
- Ajout de widget badge pour les commandes de type texte [LIEN](https://github.com/jeedom/core/issues/2864)
- Amélioration du systeme de lancement des scénarios programmés [LIEN](https://github.com/jeedom/core/issues/2875)
- Amélioration des messages d'erreur d'exception si le niveau de log est debug [LIEN](https://github.com/jeedom/core/issues/2886)
- Sur la page de remplacement possibilité de demander la désactivation de l'équipement [LIEN](https://github.com/jeedom/core/issues/2893)
- Lors d'une mise à jour la sauvegarde avant prend maintenant en compte les exclusions des plugins [LIEN](https://github.com/jeedom/core/commit/22aa19b85028b0de6f7d3028ae0424d4f238f7df)
- Si un plugin est en beta mais n'a pas de changelog beta alors le centre de mise à jour renverra vers le changelog stable [LIEN](https://github.com/jeedom/core/commit/2af7b0a4d8680f68810cf9d07c657c51fe9e40bd)
- Ajout d'une alerte si la version de debian est 10 ou moins [LIEN](https://github.com/jeedom/core/issues/2912)
- Correction d'une erreur de mise à jour DB sur la table cache [LIEN](https://github.com/jeedom/core/commit/a21f3498195f0003c5ead7cd5e8589f1c77c1c06)
- Si la page d'équipement a un élément img_device (balise de type img) alors le core peut lui même configurer l'url pour afficher la bonne image d'équipement (en reprenant celle de la page de présentation de tous les équipements du plugin) [LIEN](https://github.com/jeedom/core/commit/07708ba4cbed982af968919dac3e406707867417)
- Correction d'un bug avec la fonction time_diff [LIEN](https://github.com/jeedom/core/issues/2915)
- Correction de bug sur la gestion de dépendances composer [LIEN](https://github.com/jeedom/core/issues/2920)
- En cas de commande vide Jeedom force le retour en fonction du sous type de la commande (donc 0 pour numerique et binaire) [LIEN](https://github.com/jeedom/core/commit/442d47246373e4f52b1dde7d1c7fdc9f67ea143e)
- Prise en charge des évènements personnalisés de type #pluginClass::*# ou #pluginClass::customId# [LIEN](https://github.com/jeedom/core/pull/2964)
- Ajout d'un bouton de mise à jour sur la ligne "core" en plus de celui en haut à droite [LIEN](https://github.com/jeedom/core/pull/2974)
- Correction de l'écran "package" au niveau des packages python2 [LIEN](https://github.com/jeedom/core/pull/2973)
- Correction d'un bug lors de la mise à jour des équipements sur la page de batterie [LIEN](https://github.com/jeedom/core/pull/3008)
- La vérification de la connexion réseau est désormais effectuée de manière aléatoire toutes les 10 minutes afin d'éviter que toutes les box Jeedom ne tentent de se reconnecter simultanément en cas de microcoupure.
- Correction du système de file d'attente sur la partie DB [LIEN](https://github.com/jeedom/core/pull/3051).

>**IMPORTANT**
>
> Dû à la refonte des logs et la réinternalisation de bibliothèques, lors de la mise à jour vous pouvez avoir une erreur type ``PHP Fatal error`` (rien de grave) il suffit de relancer la mise à jour.

>**IMPORTANT**
>
> La restauration d'un backup 4.4 peut dans certains cas finir par des erreurs dans l'interface web. Rien de grave cela peut facilement se corriger il suffit de faire : `cd /tmp;wget https://github.com/jeedom/core/archive/refs/tags/4.4.20.zip;unzip 4.4.20.zip;cd core-4.4.20;cp -rf * /var/www/html/;rm -rf /tmp/master.zip;rm -rf /tmp/core-4.4.20;`. Vous pouvez lancer cette commande depuis l'interface rescue de jeedom (ajouter `&rescue=1` dans l'url), ou directement en ssh.
