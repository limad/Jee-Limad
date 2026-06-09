# Guide de durcissement sécurité

Ce guide liste les actions recommandées pour sécuriser votre installation,
en particulier si elle est **accessible depuis Internet**. Le cœur applicatif
est déjà durci par défaut (requêtes paramétrées, anti-bruteforce login intégré,
en-têtes de sécurité, CORS restreint, sudoers limité, session strict mode,
X-Forwarded-For validé). Les points ci-dessous dépendent de **votre** réseau.

## 1. Chiffrement HTTPS/TLS (priorité haute si exposé Internet)

Sans HTTPS, mots de passe, sessions et clés API transitent en clair.
Choisissez **une** option selon votre situation :

| Situation | Solution recommandée |
|-----------|---------------------|
| Nom de domaine + accès Internet | Let's Encrypt (certbot) — certificat gratuit valide |
| Accès distant sans domaine | VPN (WireGuard / Tailscale) — vous n'exposez rien |
| Déjà un reverse proxy | Terminer le TLS au proxy (nginx / Caddy / Traefik) |
| Réseau local uniquement | Certificat auto-signé (avertissement navigateur) |

Après activation de HTTPS, pensez à activer le cookie Secure et HSTS (section 2).

> **Si vous êtes derrière un reverse proxy** : renseignez l'IP de votre proxy dans
> Configuration → Sécurité → `security::trustedProxies` (séparées par `;`, CIDR
> accepté). Sans cela, par sécurité Jeedom ignore l'en-tête `X-Forwarded-For` (qui
> serait sinon falsifiable) et verra toutes les connexions comme venant du proxy —
> ce qui désactive de fait la 2FA "externe" et fausse l'anti-bruteforce. C'est la
> contrepartie d'un comportement sûr par défaut : déclarez votre proxy.

## 2. Activer cookie Secure + HSTS (après HTTPS)

Une fois HTTPS opérationnel et stable :
- Cookie de session `Secure` : `php_flag session.cookie_secure on` dans le
  `.htaccess` (bloc mod_php).
- HSTS : `Header always set Strict-Transport-Security "max-age=31536000"` dans
  la config Apache.

> N'activez HSTS qu'**après** avoir confirmé que HTTPS fonctionne durablement.

## 3. Double authentification (2FA)

Activez la 2FA sur **tous** les comptes administrateur :
Préférences → onglet Sécurité → Authentification en 2 étapes → Configurer →
scanner le QR code. L'application vous y invite au premier usage.

> Note : la 2FA n'est demandée que pour les connexions **externes** (pas en LAN).
> Si vous perdez votre téléphone, connectez-vous depuis le réseau local pour la
> désactiver. Un administrateur peut aussi retirer la 2FA d'un autre compte.

## 4. Pare-feu hôte

> ⚠️ **À lire avant de toucher au pare-feu.** De nombreux plugins ouvrent un port
> sur le réseau **local** pour fonctionner : serveur MCP (mcp_jeedom), MQTT/jMQTT
> (1883), Z-Wave JS UI, Zigbee, caméras, plugins avec daemon ou websocket propre.
> Ces ports sont **légitimes** et nécessaires côté LAN. Un pare-feu "tout refuser"
> appliqué sans réflexion casse ces plugins et la communication avec vos objets.

Le bon principe : **distinguer le côté Internet (WAN) du côté local (LAN)** :

- **Côté WAN / box opérateur** : c'est là qu'on durcit. N'exposez sur Internet
  **que** ce dont vous avez besoin (idéalement rien — préférez un VPN, section 1).
  N'exposez jamais directement les ports daemon des plugins vers Internet.
- **Côté LAN / segment de confiance** : laissez vos objets et plugins communiquer.
  Si vous mettez un pare-feu hôte, autorisez explicitement les ports des plugins.

Avant toute politique restrictive, **inventoriez les ports écoutés** :

```bash
ss -tulpn        # ports ouverts + processus qui écoute
```

Identifiez ceux de vos plugins et autorisez-les **depuis le LAN**.

Exemple de politique raisonnable (`nftables` / `ufw`) :
- SSH (22) : **uniquement** depuis votre IP d'administration.
- HTTP/HTTPS (80/443) : depuis les réseaux attendus (LAN, ou reverse proxy).
- Ports daemon des plugins : autorisés **depuis le LAN uniquement**, jamais WAN.
- Refus par défaut en entrée **depuis Internet**, IPv4 **et** IPv6.

> Testez SSH et la communication de vos plugins **avant** d'activer le refus par
> défaut, pour éviter de vous verrouiller dehors ou de couper vos objets.

Découverte LAN (mDNS/avahi, 5353) : utilisée par certains plugins pour détecter
des appareils (Chromecast, HomeKit…). **Ne la désactivez que si aucun plugin n'en
dépend.** LLMNR (5355) est rarement utile et peut généralement être désactivé.

## 4 bis. fail2ban (optionnel, utilisateurs avertis exposant la box)

Jeedom protège déjà le login contre le bruteforce au niveau applicatif
(bannissement après plusieurs échecs — réglable dans Configuration → Sécurité).
Si vous exposez votre box et voulez une couche système supplémentaire, un template
fail2ban est fourni (non activé par défaut) :

```bash
apt install fail2ban
cp /var/www/html/install/fail2ban/jeedom-filter.conf /etc/fail2ban/filter.d/jeedom.conf
cp /var/www/html/install/fail2ban/jeedom-jail.conf   /etc/fail2ban/jail.d/jeedom.conf
systemctl enable --now fail2ban
fail2ban-client status jeedom
```

> Pas obligatoire ; le cœur de Jeedom ne l'installe pas pour vous (comme les autres
> plateformes domotiques). La protection intégrée suffit dans la plupart des cas,
> surtout via VPN plutôt qu'exposition directe.

## 5. SSH

- Authentification par clé (désactiver le mot de passe : `PasswordAuthentication no`).
- Éviter le login root direct : compte admin nominatif + sudo, puis `PermitRootLogin no`.

## 6. Compte administrateur

- Mot de passe long et unique (ne pas réutiliser).
- Éviter le compte générique `admin` : créer un compte nominatif.

## 7. Maintenance

- Système à jour (`apt update && apt upgrade`).
- Branche **stable** en production (pas `develop`).
- Sauvegardes régulières (non accessibles en HTTP).

---

Pour signaler une vulnérabilité, voir la procédure de sécurité du projet.
