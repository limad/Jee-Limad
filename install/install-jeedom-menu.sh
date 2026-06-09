#!/bin/bash
# Installe jeedom-menu dans /usr/local/bin pour un accès global

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="${SCRIPT_DIR}/jeedom-menu"
TARGET="/usr/local/bin/jeedom-menu"

R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m' N='\033[0m'

[[ $EUID -ne 0 ]] && { echo -e "${R}[ERREUR] Lancer en root : sudo bash $0${N}"; exit 1; }
[[ ! -f "${SOURCE}" ]] && { echo -e "${R}[ERREUR] Fichier source introuvable : ${SOURCE}${N}"; exit 1; }

cp "${SOURCE}" "${TARGET}"
chmod +x "${TARGET}"

echo -e "${G}[OK] jeedom-menu installé dans ${TARGET}${N}"
echo -e "${Y}Usage : jeedom-menu${N}"
