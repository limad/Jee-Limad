# Surcharges Bootstrap volontaires (allowlist)

Contrat de cascade : bootstrap (base) -> desktop.main (densite/layout Jeedom) -> coreX_* (couleurs/radius/ombres).

Ecrasements INTENTIONNELS (ne pas "nettoyer" sans test visuel large) :
- `.dropdown-menu` / `.modal-content` background-color : blanc Bootstrap -> sombre theme.
- `.alert-info|.label-info|.alert-warning|.label-warning` : couleurs theme + texte fonce (contraste Bootstrap-5-like).
- `.form-control` : densite/couleurs Jeedom.
- `input[type=checkbox]`, `.checkbox input`, `.radio input` : positionnement Jeedom.
- `.btn/.btn-sm/.btn-xs` dimensions : centralisees dans desktop.main.css (cf. regle de couche ci-dessous).

Regle de couche :
- Dimensions / layout des composants Bootstrap -> desktop.main.css uniquement.
- coreX_* -> couleurs, bordures, radius, ombres uniquement (pas de padding/hauteur/display).
