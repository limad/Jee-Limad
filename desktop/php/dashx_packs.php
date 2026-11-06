<?php

/* ⚠️ PAGE TEMPORAIRE — parking de la "pack-palette" (modèles de démo Themes/Layouts/Series)
 * retirée de l'éditeur Dashx le 2026-06-28. Contenu codé en dur, non lié au matériel réel.
 * Vouée à être SUPPRIMÉE : pour décommissionner, supprimer ce fichier + l'entrée de menu
 * éventuelle. Aucune dépendance depuis le reste du core. Accès : index.php?v=d&p=dashx_packs&m=core */

if (!isConnect('admin')) {
    throw new Exception('{{401 - Accès non autorisé}}');
}
?>
<?php include_file('desktop', 'dashx', 'css'); ?>
<div id="app" data-theme="dark">
  <header class="dash-header">
    <span class="dash-title">Dashx — Modèles (parking temporaire)</span>
  </header>
  <main style="padding:16px;">
    <p class="editor-note">
      Ces modèles (Thèmes / Layouts / Séries) ont été retirés de l'éditeur de tuiles.
      Contenu de démonstration codé en dur, sans commandes réelles. Page d'archive, vouée à suppression.
    </p>
    <div id="pack-palette" class="pack-palette"></div>
  </main>
</div>
<script>
(function () {
  "use strict";
  var packCatalog = {
    themes: [
      { id: "minimalist", name: "Minimalist" },
      { id: "mushroom", name: "Mushroom" },
      { id: "nord", name: "Nord" },
      { id: "solarized", name: "Solarized" }
    ],
    layouts: [
      { id: "home-minimal", name: "Maison Minimalist", theme: "minimalist",
        widgets: ["summary", "climate", "light", "cover", "sensor"] },
      { id: "room-mushroom", name: "Piece Mushroom", theme: "mushroom",
        widgets: ["presence", "color", "thermostat", "scene"] },
      { id: "security", name: "Securite", theme: "nord",
        widgets: ["alarm", "lock", "garage", "camera"] }
    ],
    series: [
      { id: "room", name: "Serie Piece", widgets: ["presence", "climate", "color"] },
      { id: "energy", name: "Serie Energie", widgets: ["electricity", "chart"] },
      { id: "security", name: "Serie Securite", widgets: ["alarm", "lock", "garage"] }
    ]
  };

  var root = document.getElementById("pack-palette");

  function preview() {
    var p = document.createElement("span");
    p.className = "pack-preview";
    for (var i = 0; i < 6; i++) { p.append(document.createElement("span")); }
    return p;
  }

  function item(it, detail) {
    var b = document.createElement("div");
    b.className = "pack-item";
    b.append(preview());
    var label = document.createElement("span");
    label.className = "pack-label";
    label.textContent = it.name;
    var action = document.createElement("span");
    action.className = "pack-action";
    action.textContent = detail;
    b.append(label, action);
    return b;
  }

  [
    ["Themes", packCatalog.themes, function (t) { return t.id; }],
    ["Layouts", packCatalog.layouts, function (l) { return (l.widgets || []).join(", "); }],
    ["Series", packCatalog.series, function (s) { return (s.widgets || []).join(", "); }]
  ].forEach(function (g) {
    var section = document.createElement("section");
    section.className = "pack-group";
    var h = document.createElement("span");
    h.className = "pack-title";
    h.textContent = g[0];
    var list = document.createElement("div");
    list.className = "pack-list";
    g[1].forEach(function (it) { list.append(item(it, g[2](it))); });
    section.append(h, list);
    root.append(section);
  });
}());
</script>
