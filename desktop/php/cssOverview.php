<?php
//html/desktop/php/cssOverview.php
if (!isConnect('admin')) {
  throw new Exception('{{401 - Acces non autorise}}');
}
?>
<style>
/* ===== SCOPING ===== */
#cssOverviewPage {
  margin-left: 0;
  margin-right: 0;
  padding-bottom: 40px;
}
#cssOverviewPage .panel-body { margin-right: 0; overflow: hidden; }
#cssOverviewPage .panel-body > .row { margin-left: -6px; margin-right: -6px; }
#cssOverviewPage .panel-body > .row > [class*="col-"] { padding-left: 6px; padding-right: 6px; }

/* ===== BOUTONS ===== */
#cssOverviewPage .btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: .35em; min-width: 32px; min-height: 32px;
  line-height: 1.2; vertical-align: middle; white-space: nowrap;
}
#cssOverviewPage .btn > i { width: 1em; line-height: 1; text-align: center; }
#cssOverviewPage .btn-xs { min-width: 28px; min-height: 24px; padding-top: 3px; padding-bottom: 3px; }
#cssOverviewPage .btn-sm { min-height: 28px; }
#cssOverviewPage .btn-lg { min-height: 40px; }
#cssOverviewPage .panel-body > p > .btn,
#cssOverviewPage .modal-footer > .btn { margin: 2px 3px 5px 0; }
#cssOverviewPage .input-group .btn,
#cssOverviewPage .input-group-addon { min-height: 32px; align-items: center; justify-content: center; }
#cssOverviewPage .input-group .btn { min-width: 34px; }
#cssOverviewPage .input-group .form-control { height: 32px; line-height: 20px; padding-top: 5px; padding-bottom: 5px; }

/* ===== DIVERS ===== */
#cssOverviewPage .label, #cssOverviewPage .badge { vertical-align: middle; }
#cssOverviewPage .form-horizontal .form-group { margin-left: 0; margin-right: 0; }
#cssOverviewPage .cssov-password-demo {
  font-family: 'text-security-disc', system-ui, sans-serif;
}

/* ===== WIDGETS ===== */
#cssOverviewPage .cssOverview-widgetGrid {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch;
}
#cssOverviewPage .cssOverview-widgetGrid > .eqLogic-widget,
#cssOverviewPage .cssOverview-widgetGrid > .scenario-widget {
  float: none; width: 190px; margin: 0 !important; flex: 0 0 190px;
}

/* ===== OBJETS ===== */
#cssOverviewPage #objectOverviewContainer {
  display: flex; flex-wrap: wrap; gap: 12px; overflow: hidden;
}
#cssOverviewPage #objectOverviewContainer .objectPreview {
  margin: 0 !important; flex: 1 1 320px; max-width: 420px; overflow: hidden;
}
#cssOverviewPage #objectOverviewContainer .bottomPreview { right: 0; width: 100%; overflow: hidden; }
#cssOverviewPage #objectOverviewContainer .resume,
#cssOverviewPage #objectOverviewContainer .resume > span { max-width: 100%; overflow: hidden; }

/* ===== TIMELINE ===== */
#cssOverviewPage #timelineContainer { overflow: hidden; }
#cssOverviewPage #timelineContainer ul { padding-left: 0; margin-bottom: 0; }
#cssOverviewPage #timelineContainer ul::before { display: none; }
#cssOverviewPage #timelineContainer ul li {
  display: grid; grid-template-columns: 74px 96px 1fr;
  align-items: center; gap: 8px; width: 100%; min-height: 32px;
  margin-left: 0; padding: 6px 8px;
}
#cssOverviewPage #timelineContainer div.time {
  position: static; width: auto; height: auto; margin: 0; padding: 0;
  min-width: 78px; text-align: right; white-space: nowrap;
}
#cssOverviewPage #timelineContainer div.time::after,
#cssOverviewPage #timelineContainer li > span.vertLine { display: none; }
#cssOverviewPage #timelineContainer div.type,
#cssOverviewPage #timelineContainer .tml-cmd { width: auto; min-width: 0; }

/* ===== CHART / GAUGE ===== */
#cssOverviewPage .chartContainer { overflow: hidden; }

/* ===== NOUISLIDER custom ===== */
#cssOverviewPage .cssov-slider-wrap { padding: 18px 8px 8px; }
#cssOverviewPage .noUiSlider-container { height: 6px; }

/* ===== CODEMIRROR ===== */
#cssOverviewPage .CodeMirror { border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 13px; }

/* ===== FLATPICKR ===== */
#cssOverviewPage .flatpickr-input { background-color: var(--form-bg-color) !important; }

/* ===== TOOLTIP démo ===== */
#cssOverviewPage .cssov-tooltip-demo { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 8px; }

/* ===== SPINNER ===== */
#cssOverviewPage .cssov-spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid var(--border-color, #ccc); border-top-color: var(--jeedom-color, #95c12b); border-radius: 50%; animation: cssov-spin .8s linear infinite; vertical-align: middle; }
@keyframes cssov-spin { to { transform: rotate(360deg); } }

/* ===== SECTION DEMOS interactives ===== */
#cssOverviewPage .cssov-demo-grid { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; }
#cssOverviewPage .cssov-result-box { margin-top: 10px; padding: 8px 12px; border-radius: 4px; background: rgba(0,0,0,.08); min-height: 36px; font-size: .92em; word-break: break-all; }

/* ===== LOGOPRIMARY / LOGOSECONDARY ===== */
#cssOverviewPage .cssov-logobar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
#cssOverviewPage .cssov-logobar .logoPrimary,
#cssOverviewPage .cssov-logobar .logoSecondary { text-align: center; width: 64px; }

/* ===== DRAG HANDLE ===== */
#cssOverviewPage .cssov-sortable-list { list-style: none; padding: 0; margin: 0; }
#cssOverviewPage .cssov-sortable-list li {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; margin-bottom: 4px; border-radius: 4px;
  background: rgba(0,0,0,.06); cursor: grab;
}
#cssOverviewPage .cssov-sortable-list li .fa-grip-vertical { opacity: .4; }

/* ===== BADGE COUNTER ===== */
#cssOverviewPage .cssov-badge-stack { position: relative; display: inline-block; }
#cssOverviewPage .cssov-badge-stack .badge { position: absolute; top: -8px; right: -10px; }

/* ===== ROW ACTIONS / CONTEXT MENU ===== */
#cssOverviewPage .cssov-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
#cssOverviewPage .cssov-row-actions > .btn {
  min-width: 28px;
  min-height: 28px;
  padding: 0 7px;
}
#cssOverviewPage .cssov-context-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  margin-top: 12px;
}
#cssOverviewPage .cssov-context-target {
  flex: 1 1 190px;
  min-width: 0;
  padding: 8px 10px;
  border-left: 2px solid var(--logo-primary-color);
  background: rgba(0,0,0,.06);
  cursor: context-menu;
}
#cssOverviewPage .cssov-context-target small {
  display: block;
  margin-top: 3px;
  opacity: .7;
}
#cssOverviewPage .cssov-context-menu {
  position: static !important;
  display: block !important;
  min-width: 220px;
  max-width: 280px;
  margin: 0;
}
#cssOverviewPage .cssov-clicked {
  box-shadow: inset 0 0 0 2px var(--logo-primary-color);
}

/* ===== SIDEBAR NAV ===== */
#cssOverviewPage .cssov-sidebar-demo {
  max-width: 390px;
  margin-top: 12px;
  padding: 10px;
  border: 1px solid var(--el-defaultColor);
  border-radius: var(--border-radius);
  background: rgba(var(--bg-color), .45);
}
#cssOverviewPage .cssov-sidebar-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-defaultColor);
}
#cssOverviewPage .cssov-sidebar-label {
  display: block;
  margin: 0 0 8px 10px;
  font-size: 12px;
  color: var(--link-color);
}
#cssOverviewPage .cssov-side-nav,
#cssOverviewPage .cssov-side-subnav {
  list-style: none;
  margin: 0;
  padding: 0;
}
#cssOverviewPage .cssov-side-nav li {
  margin: 2px 0;
}
#cssOverviewPage .cssov-side-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  padding: 8px 10px;
  border-left: 4px solid transparent;
  border-radius: calc(var(--border-radius) - 2px);
  color: var(--txt-color);
  background: transparent;
}
#cssOverviewPage .cssov-side-nav a > i:first-child {
  flex: 0 0 18px;
  text-align: center;
  color: var(--link-color);
}
#cssOverviewPage .cssov-side-nav a > span {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#cssOverviewPage .cssov-side-nav a .fa-chevron-up {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--link-color);
}
#cssOverviewPage .cssov-side-nav li.active > a,
#cssOverviewPage .cssov-side-nav a:hover,
#cssOverviewPage .cssov-side-nav a:focus {
  color: var(--linkHoverLight-color);
  background: color-mix(in srgb, var(--logo-primary-color) 10%, transparent);
}
#cssOverviewPage .cssov-side-nav li.active > a {
  border-left-color: var(--logo-primary-color);
  font-weight: 600;
}
#cssOverviewPage .cssov-side-subnav {
  margin: 3px 0 7px 32px;
}
#cssOverviewPage .cssov-side-subnav a {
  min-height: 30px;
  padding: 5px 8px;
  border-left-width: 0;
  font-size: 13px;
}

/* Sélecteur de thème — fixe en haut à droite, reste visible au scroll */
#cssov-theme-picker {
  position: fixed;
  top: 58px;
  right: 15px;
  z-index: 1050;
  max-width: 280px;
}
</style>

<div id="cssOverviewPage" class="row row-overflow">

  <!-- TITRE -->
  <div class="col-xs-12" style="display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:10px;">
    <legend style="margin:0; border:0; flex:1 1 auto;"><i class="fas fa-palette"></i> {{Vue globale CSS Jeedom}}</legend>
    <div id="cssov-theme-picker" class="input-group">
      <span class="input-group-addon"><i class="fas fa-palette"></i> {{Theme}}</span>
      <select id="cssov-theme-switch" class="form-control" title="{{Basculer le theme (apercu local)}}">
        <option value="core2019_Dark">core2019_Dark</option>
        <option value="core2019_Light">core2019_Light</option>
        <option value="coreX_Blue">coreX_Blue</option>
        <option value="coreX_Dark">coreX_Dark</option>
        <option value="coreX_Zinc">coreX_Zinc</option>
        <option value="coreX_Light">coreX_Light</option>
        <option value="tailwind">tailwind</option>
      </select>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       1. SYNTHÈSE VISUELLE
       ══════════════════════════════════════════════════ -->
  <div class="col-xs-12">
    <div class="panel panel-default">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-layer-group"></i> {{Synthese visuelle}}</h3></div>
      <div class="panel-body">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div class="alert alert-info"><i class="fas fa-desktop"></i> {{Theme courant}} <strong>coreX</strong></div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div class="alert alert-success"><i class="fas fa-check-circle"></i> {{Contraste}} <strong>{{texte / fond}}</strong></div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div class="alert alert-warning"><i class="fas fa-ruler-combined"></i> {{Densite}} <strong>{{compact}}</strong></div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div class="alert alert-danger"><i class="fas fa-bug"></i> {{Cas limites}} <strong>{{disabled / hover}}</strong></div>
          </div>
        </div>
        <div class="input-group" style="max-width: 760px;">
          <span class="input-group-addon roundedLeft"><i class="fas fa-search"></i></span>
          <input class="form-control noCorner" value="Search compact avec texte visible">
          <span class="input-group-addon noCorner"><span class="label label-info">tag</span></span>
          <span class="input-group-btn"><button type="button" class="btn btn-danger roundedRight"><i class="fas fa-times"></i></button></span>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       2. TYPOGRAPHIE
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <div class="panel panel-default">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-font"></i> {{Typographie et etats}}</h3></div>
      <div class="panel-body">
        <h1>H1 Jeedom</h1>
        <h2>H2 Jeedom</h2>
        <h3>H3 Jeedom</h3>
        <h4>H4 Jeedom</h4>
        <h5>H5 Jeedom</h5>
        <p><strong>{{Gras}}</strong>, <em>{{italique}}</em>, <small>{{small}}</small>, <span class="label label-sm label-primary">label-sm</span>, <sup class="danger"><i class="fas fa-asterisk"></i></sup></p>
        <p>{{Texte standard}}, <a href="#">{{lien}}</a>, <span class="warning">{{warning}}</span>, <span class="danger">{{danger}}</span>, <span class="success">{{success}}</span>, <span class="info">{{info}}</span>, <span class="text-muted">{{muted}}</span>.</p>
        <p><i class="fas fa-check-circle success"></i> <i class="fas fa-exclamation-triangle warning"></i> <i class="fas fa-times-circle danger"></i> <i class="fas fa-info-circle info"></i> <i class="fas fa-cog cursor"></i></p>
        <blockquote>{{Citation / note longue pour verifier les espacements, la couleur du texte et la lisibilite en theme sombre ou clair.}}</blockquote>
        <hr class="hrPrimary">
        <hr class="hrSecondary">
        <p><code>inline code</code> &nbsp; <kbd>Ctrl+S</kbd> &nbsp; <span class="text-muted">text-muted</span></p>
        <pre>{{Bloc pre / log}}
[2026-06-07 20:00:00] INFO  Scenario execute
[2026-06-07 20:00:01] ERROR Message exemple</pre>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       3. BOUTONS
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <div class="panel panel-default">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-mouse-pointer"></i> {{Boutons}}</h3></div>
      <div class="panel-body">
        <p>
          <button type="button" class="btn btn-default"><i class="fas fa-cog"></i> Default</button>
          <button type="button" class="btn btn-primary"><i class="fas fa-star"></i> Primary</button>
          <button type="button" class="btn btn-success"><i class="fas fa-check"></i> Success</button>
          <button type="button" class="btn btn-info"><i class="fas fa-info"></i> Info</button>
          <button type="button" class="btn btn-warning"><i class="fas fa-exclamation"></i> Warning</button>
          <button type="button" class="btn btn-danger"><i class="fas fa-trash"></i> Danger</button>
        </p>
        <p>
          <a class="btn btn-default" href="#" role="button"><i class="fas fa-link"></i> Default</a>
          <a class="btn btn-primary" href="#" role="button"><i class="fas fa-star"></i> Primary</a>
          <a class="btn btn-success" href="#" role="button"><i class="fas fa-check"></i> Success</a>
          <a class="btn btn-info" href="#" role="button"><i class="fas fa-info"></i> Info</a>
          <a class="btn btn-warning" href="#" role="button"><i class="fas fa-exclamation"></i> Warning</a>
          <a class="btn btn-danger" href="#" role="button"><i class="fas fa-trash"></i> Danger</a>
        </p>
        <p>
          <a class="btn btn-xs btn-default" href="#" role="button">XS</a>
          <a class="btn btn-sm btn-primary" href="#" role="button">SM</a>
          <a class="btn btn-success" href="#" role="button">Normal</a>
          <a class="btn btn-lg btn-warning" href="#" role="button">LG</a>
          <a class="btn btn-default active" href="#" role="button"><i class="fas fa-toggle-on"></i> Active</a>
          <a class="btn btn-default disabled" href="#" role="button" aria-disabled="true">Disabled</a>
        </p>
        <p>
          <button type="button" class="btn btn-xs btn-default">XS</button>
          <button type="button" class="btn btn-sm btn-primary">SM</button>
          <button type="button" class="btn btn-success">Normal</button>
          <button type="button" class="btn btn-lg btn-warning">LG</button>
          <button type="button" class="btn btn-default disabled">Disabled</button>
        </p>
        <p>
          <button type="button" class="btn btn-default active"><i class="fas fa-toggle-on"></i> Active</button>
          <button type="button" class="btn btn-default"><i class="fas fa-download"></i></button>
          <button type="button" class="btn btn-default"><i class="fas fa-upload"></i></button>
          <button type="button" class="btn btn-default"><i class="fas fa-copy"></i></button>
          <button type="button" class="btn btn-default"><i class="fas fa-ellipsis-v"></i></button>
          <!-- Badge sur bouton -->
          <span class="cssov-badge-stack">
            <button type="button" class="btn btn-default"><i class="fas fa-bell"></i></button>
            <span class="badge badge-danger">3</span>
          </span>
        </p>
        <!-- Boutons groupe -->
        <p>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-default active"><i class="fas fa-list"></i></button>
            <button type="button" class="btn btn-default"><i class="fas fa-th-large"></i></button>
            <button type="button" class="btn btn-default"><i class="fas fa-map"></i></button>
          </div>
          &nbsp;
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-primary">Jour</button>
            <button type="button" class="btn btn-sm btn-default">Sem.</button>
            <button type="button" class="btn btn-sm btn-default">Mois</button>
          </div>
          &nbsp;
          <div class="btn-group" role="group">
            <a class="btn btn-sm btn-default active" href="#" role="button"><i class="fas fa-list"></i></a>
            <a class="btn btn-sm btn-default" href="#" role="button"><i class="fas fa-th-large"></i></a>
            <a class="btn btn-sm btn-default" href="#" role="button"><i class="fas fa-map"></i></a>
          </div>
        </p>
        <!-- logoPrimary / logoSecondary -->
        <div class="cssov-logobar">
          <div class="cursor logoPrimary"><i class="fas fa-plus-circle"></i><br><span>{{Ajouter}}</span></div>
          <div class="cursor logoPrimary"><i class="fas fa-cog"></i><br><span>{{Config}}</span></div>
          <div class="cursor logoSecondary"><i class="fas fa-question-circle"></i><br><span>{{Aide}}</span></div>
        </div>
        <div class="input-group" style="max-width: 520px; margin-top: 8px;">
          <span class="input-group-btn"><button type="button" class="btn btn-default roundedLeft"><i class="fas fa-minus"></i></button></span>
          <input class="form-control noCorner" value="Input group">
          <span class="input-group-btn"><button type="button" class="btn btn-success roundedRight"><i class="fas fa-plus"></i></button></span>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       4. DIALOGUES INTERACTIFS (bootbox / jeeDialog / modal)
       ══════════════════════════════════════════════════ -->
  <div class="col-xs-12">
    <div class="panel panel-default">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-comment-dots"></i> {{Dialogues interactifs}}</h3></div>
      <div class="panel-body">
        <p class="text-muted" style="margin-bottom: 12px;">{{Tous les boutons ci-dessous sont fonctionnels. Cliquez pour tester chaque type de dialogue.}}</p>

        <!-- bootbox -->
        <p>
          <strong>bootbox :</strong>
          <button type="button" class="btn btn-default" id="bt_bbAlert"><i class="fas fa-exclamation-circle"></i> bootbox.alert</button>
          <button type="button" class="btn btn-warning" id="bt_bbConfirm"><i class="fas fa-question-circle"></i> bootbox.confirm</button>
          <button type="button" class="btn btn-info" id="bt_bbPrompt"><i class="fas fa-pencil-alt"></i> bootbox.prompt</button>
          <button type="button" class="btn btn-danger" id="bt_bbConfirmDanger"><i class="fas fa-trash"></i> bootbox.confirm (danger)</button>
        </p>

        <!-- jeeDialog -->
        <p>
          <strong>jeeDialog :</strong>
          <button type="button" class="btn btn-default" id="bt_jdAlert"><i class="fas fa-bell"></i> jeeDialog.alert</button>
          <button type="button" class="btn btn-warning" id="bt_jdConfirm"><i class="fas fa-question"></i> jeeDialog.confirm</button>
          <button type="button" class="btn btn-success" id="bt_jdToastOk"><i class="fas fa-check"></i> toast success</button>
          <button type="button" class="btn btn-danger" id="bt_jdToastErr"><i class="fas fa-times"></i> toast error</button>
          <button type="button" class="btn btn-warning" id="bt_jdToastWarn"><i class="fas fa-exclamation-triangle"></i> toast warning</button>
          <button type="button" class="btn btn-info" id="bt_jdToastInfo"><i class="fas fa-info-circle"></i> toast info</button>
        </p>

        <!-- Modal Bootstrap classique -->
        <p>
          <strong>Modal Bootstrap :</strong>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#cssovModalExample">
            <i class="fas fa-window-maximize"></i> {{Ouvrir modal}}
          </button>
          <button type="button" class="btn btn-default" data-toggle="modal" data-target="#cssovModalLarge">
            <i class="fas fa-expand"></i> {{Modal large}}
          </button>
          <button type="button" class="btn btn-default" data-toggle="modal" data-target="#cssovModalForm">
            <i class="fas fa-keyboard"></i> {{Modal formulaire}}
          </button>
        </p>

        <!-- Alert Jeedom bandeau -->
        <p>
          <strong>Alert bandeau :</strong>
          <button type="button" class="btn btn-success" id="bt_alertSuccess"><i class="fas fa-check"></i> jeedomUtils.showAlert success</button>
          <button type="button" class="btn btn-danger" id="bt_alertDanger"><i class="fas fa-times"></i> showAlert danger</button>
          <button type="button" class="btn btn-default" id="bt_alertHide"><i class="fas fa-ban"></i> hideAlert</button>
        </p>

        <!-- Spinner / Loading -->
        <p>
          <strong>Spinner :</strong>
          <span class="cssov-spinner"></span>&nbsp;
          <button type="button" class="btn btn-default" id="bt_showLoading"><i class="fas fa-circle-notch fa-spin"></i> domUtils.showLoading</button>
          <button type="button" class="btn btn-default" id="bt_hideLoading"><i class="fas fa-stop-circle"></i> domUtils.hideLoading</button>
        </p>

        <div class="cssov-result-box" id="cssov-dialog-result">{{Resultat des clics s'affichera ici...}}</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       5. FORMULAIRES
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-keyboard"></i> {{Formulaires}}</legend>
    <form class="form-horizontal">
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Texte}}</label>
        <div class="col-sm-8"><input class="form-control" value="Texte lisible" placeholder="Rechercher | nom | :not(nom)"></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Placeholder}}</label>
        <div class="col-sm-8"><input class="form-control" placeholder="Placeholder seul"></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Mot de passe}}</label>
        <div class="col-sm-8"><input type="text" class="form-control cssov-password-demo" value="password" readonly></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Readonly / disabled}}</label>
        <div class="col-sm-4"><input class="form-control" readonly value="Readonly"></div>
        <div class="col-sm-4"><input class="form-control" disabled value="Disabled"></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Select}}</label>
        <div class="col-sm-8">
          <select class="form-control"><option>Primary</option><option>Secondary</option><option>Tertiary</option></select>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Select multiple}}</label>
        <div class="col-sm-8">
          <select class="form-control" multiple size="3"><option selected>Option A</option><option>Option B</option><option>Option C</option></select>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Textarea}}</label>
        <div class="col-sm-8"><textarea class="form-control" rows="3">Texte long multilignes</textarea></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Couleur / nombre}}</label>
        <div class="col-sm-4"><input type="color" class="form-control" value="#0d6efd"></div>
        <div class="col-sm-4"><input type="number" class="form-control" value="42"></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Checks}}</label>
        <div class="col-sm-8">
          <label class="checkbox-inline"><input type="checkbox" checked> {{Actif}}</label>
          <label class="checkbox-inline"><input type="checkbox"> {{Inactif}}</label>
          <label class="radio-inline"><input type="radio" name="cssOverviewRadio" checked> A</label>
          <label class="radio-inline"><input type="radio" name="cssOverviewRadio"> B</label>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Range}}</label>
        <div class="col-sm-8"><input type="range" class="form-control" value="60" min="0" max="100"></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Date/heure}}</label>
        <div class="col-sm-4"><input type="date" class="form-control" value="2026-06-07"></div>
        <div class="col-sm-4"><input type="time" class="form-control" value="20:00"></div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">flatpickr</label>
        <div class="col-sm-8">
          <input type="text" id="cssov-flatpickr" class="form-control" placeholder="{{Choisir date/heure}}" readonly>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-4 control-label">{{Help block}}</label>
        <div class="col-sm-8">
          <input class="form-control" value="Avec aide">
          <p class="help-block text-muted"><i class="fas fa-info-circle"></i> {{Texte d'aide sous le champ.}}</p>
        </div>
      </div>
      <!-- form-group avec has-error / has-warning / has-success -->
      <div class="form-group has-error">
        <label class="col-sm-4 control-label"><i class="fas fa-times-circle"></i> {{Erreur}}</label>
        <div class="col-sm-8"><input class="form-control" value="Valeur invalide"><span class="help-block">{{Champ requis}}</span></div>
      </div>
      <div class="form-group has-warning">
        <label class="col-sm-4 control-label"><i class="fas fa-exclamation-circle"></i> {{Attention}}</label>
        <div class="col-sm-8"><input class="form-control" value="Valeur douteuse"></div>
      </div>
      <div class="form-group has-success">
        <label class="col-sm-4 control-label"><i class="fas fa-check-circle"></i> {{Valide}}</label>
        <div class="col-sm-8"><input class="form-control" value="Valeur correcte"></div>
      </div>
    </form>
  </div>

  <!-- ══════════════════════════════════════════════════
       6. LABELS, ALERTES, LISTES
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-tags"></i> {{Labels et alertes}}</legend>
    <p>
      <span class="label label-default">Default</span>
      <span class="label label-primary">Primary</span>
      <span class="label label-success">Success</span>
      <span class="label label-info">Info</span>
      <span class="label label-warning">Warning</span>
      <span class="label label-danger">Danger</span>
    </p>
    <div class="alert alert-success"><i class="fas fa-check"></i> {{Alerte success}} <button type="button" class="close" style="float:right;">&times;</button></div>
    <div class="alert alert-info"><i class="fas fa-info"></i> {{Alerte info}}</div>
    <div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> {{Alerte warning}} — <a href="#">{{Voir details}}</a></div>
    <div class="alert alert-danger"><i class="fas fa-times"></i> {{Alerte danger}} avec <strong>{{texte gras}}</strong></div>
    <!-- list-group -->
    <ul class="list-group">
      <li class="list-group-item"><span class="badge">14</span>{{Element de liste}}</li>
      <li class="list-group-item list-group-item-success"><i class="fas fa-check-circle success"></i> {{Liste success}}</li>
      <li class="list-group-item list-group-item-warning"><i class="fas fa-exclamation-triangle warning"></i> {{Liste warning}}</li>
      <li class="list-group-item list-group-item-danger"><i class="fas fa-times-circle danger"></i> {{Liste danger}}</li>
      <li class="list-group-item"><span class="label label-info pull-right">New</span>{{Avec label pull-right}}</li>
    </ul>
    <!-- Breadcrumb -->
    <ol class="breadcrumb" style="margin-top: 10px;">
      <li><a href="#"><i class="fas fa-home"></i></a></li>
      <li><a href="#">{{Plugins}}</a></li>
      <li class="active">{{Mon plugin}}</li>
    </ol>
  </div>

  <!-- ══════════════════════════════════════════════════
       7. TOOLTIPS & POPOVERS
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-comment-alt"></i> {{Tooltips et popovers}}</legend>
    <div class="cssov-tooltip-demo">
      <!-- Bootstrap data-toggle tooltip -->
      <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top"    title="Tooltip en haut"><i class="fas fa-arrow-up"></i> Top</button>
      <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="Tooltip en bas"><i class="fas fa-arrow-down"></i> Bottom</button>
      <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="left"   title="Tooltip à gauche"><i class="fas fa-arrow-left"></i> Left</button>
      <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="right"  title="Tooltip à droite"><i class="fas fa-arrow-right"></i> Right</button>
      <!-- Popover -->
      <button type="button" class="btn btn-info" id="bt_popoverExample"
              data-toggle="popover" data-placement="right"
              data-title="{{Popover titre}}"
              data-content="{{Contenu du popover avec texte plus long et explication.}}">
        <i class="fas fa-info-circle"></i> Popover
      </button>
      <!-- Tippy (si disponible) -->
      <button type="button" class="btn btn-default" id="bt_tippyExample">
        <i class="fas fa-magic"></i> Tippy.js
      </button>
    </div>
    <p class="text-muted" style="margin-top: 8px;"><small>{{Les tooltips Bootstrap sont initialises via $('[data-toggle=tooltip]').tooltip()}} — voir le JS en bas de page.</small></p>
  </div>

  <!-- ══════════════════════════════════════════════════
       8. SLIDERS noUiSlider
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-sliders-h"></i> {{Sliders noUiSlider}}</legend>
    <div class="cssov-slider-wrap">
      <label>{{Slider simple}} — <strong id="cssov-slider1-val">50</strong></label>
      <div id="cssov-slider1"></div>
    </div>
    <div class="cssov-slider-wrap">
      <label>{{Plage (range)}} — <strong id="cssov-slider2-val">20 – 75</strong></label>
      <div id="cssov-slider2"></div>
    </div>
    <div class="cssov-slider-wrap">
      <label>{{Vertical (hauteur fixe)}}</label><br>
      <div id="cssov-slider3" style="height: 80px; display: inline-block; margin-left: 20px;"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       9. EDITEUR CODEMIRROR
       ══════════════════════════════════════════════════ -->
  <div class="col-xs-12">
    <legend><i class="fas fa-code"></i> {{Editeur CodeMirror}}</legend>
    <textarea id="cssov-codemirror" style="display: none;">// Scenario Jeedom — exemple JS
if (cmd.execCmd({id: 12345}).value > 20) {
  scenario.setLog('Temp elevee : ' + value);
  cmd.execCmd({id: 99, value: 1});
}</textarea>
    <div id="cssov-cm-wrapper"></div>
    <p class="text-muted" style="margin-top: 6px;"><small>{{Mode}}: <code>javascript</code> — CodeMirror disponible globalement sous <code>CodeMirror</code></small></p>
  </div>

  <!-- ══════════════════════════════════════════════════
       10. TABLES ET ONGLETS
       ══════════════════════════════════════════════════ -->
  <div class="col-xs-12">
    <legend><i class="fas fa-table"></i> {{Tables et onglets}}</legend>
    <ul class="nav nav-tabs" role="tablist">
      <li class="active"><a href="#cssOverviewTab1" role="tab" data-toggle="tab"><i class="fas fa-list"></i> {{Table}}</a></li>
      <li><a href="#cssOverviewTab2" role="tab" data-toggle="tab"><i class="fas fa-sliders-h"></i> {{Controles}}</a></li>
      <li><a href="#cssOverviewTab3" role="tab" data-toggle="tab"><i class="fas fa-code"></i> {{Code}}</a></li>
      <li><a href="#cssOverviewTab4" role="tab" data-toggle="tab"><i class="fas fa-sitemap"></i> {{Listes}}</a></li>
      <li><a href="#cssOverviewTab5" role="tab" data-toggle="tab"><i class="fas fa-sort"></i> {{Sortable}}</a></li>
    </ul>
    <div class="tab-content">

      <!-- TAB 1 : TABLE -->
      <div class="tab-pane active" id="cssOverviewTab1">
        <div class="input-group" style="max-width: 300px; margin: 8px 0;">
          <span class="input-group-addon"><i class="fas fa-search"></i></span>
          <input type="text" id="cssov-tableSearch" class="form-control" placeholder="{{Filtrer...}}">
        </div>
        <table class="table table-condensed table-striped tablesorter" id="cssov-mainTable">
          <thead>
            <tr>
              <th>{{Nom}} <i class="fas fa-sort"></i></th>
              <th>{{Etat}}</th>
              <th>{{Action}}</th>
              <th>{{Valeur}} <i class="fas fa-sort"></i></th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Scenario</td><td><span class="label label-success">OK</span></td><td><button type="button" class="btn btn-xs btn-primary"><i class="fas fa-play"></i></button> <button type="button" class="btn btn-xs btn-default"><i class="fas fa-stop"></i></button></td><td>42</td></tr>
            <tr><td>Commande</td><td><span class="label label-warning">WARN</span></td><td><button type="button" class="btn btn-xs btn-warning"><i class="fas fa-sync"></i></button></td><td>12%</td></tr>
            <tr><td>Plugin</td><td><span class="label label-danger">NOK</span></td><td><button type="button" class="btn btn-xs btn-danger"><i class="fas fa-trash"></i></button></td><td>-</td></tr>
            <tr class="success"><td>Backup</td><td><span class="label label-success">DONE</span></td><td><button type="button" class="btn btn-xs btn-success"><i class="fas fa-download"></i></button></td><td>100%</td></tr>
            <tr class="warning"><td>Update</td><td><span class="label label-warning">WAIT</span></td><td><button type="button" class="btn btn-xs btn-default"><i class="fas fa-clock"></i></button></td><td>3</td></tr>
          </tbody>
        </table>
        <ul class="pagination pagination-sm">
          <li><a href="#"><i class="fas fa-angle-left"></i></a></li>
          <li class="active"><a href="#">1</a></li>
          <li><a href="#">2</a></li>
          <li><a href="#"><i class="fas fa-angle-right"></i></a></li>
        </ul>
      </div>

      <!-- TAB 2 : CONTROLES -->
      <div class="tab-pane" id="cssOverviewTab2">
        <div class="progress progressbarContainer"><div class="progress-bar progress-bar-success" style="width: 65%">65%</div></div>
        <div class="progress progressbarContainer"><div class="progress-bar progress-bar-warning progress-bar-striped active" style="width: 35%">En cours…</div></div>
        <div class="progress progressbarContainer"><div class="progress-bar progress-bar-danger" style="width: 88%">88%</div></div>
        <input type="range" class="form-control" value="40">
        <div class="input-group" style="max-width: 520px; margin-top: 8px;">
          <span class="input-group-addon roundedLeft">min</span>
          <input class="form-control noCorner" type="number" value="12">
          <span class="input-group-addon roundedRight">max</span>
        </div>
      </div>

      <!-- TAB 3 : CODE -->
      <div class="tab-pane" id="cssOverviewTab3">
        <pre>if (scenario.active) {
  jeeDialog.toast({ level: 'success', title: 'OK', text: 'Scenario execute' });
  cmd.execCmd({ id: 12345, value: 1 });
}</pre>
      </div>

      <!-- TAB 4 : LISTES -->
      <div class="tab-pane" id="cssOverviewTab4">
        <div class="row">
          <div class="col-sm-4">
            <ul class="nav nav-pills nav-stacked">
              <li class="active"><a href="#"><i class="fas fa-home"></i> {{Accueil}}</a></li>
              <li><a href="#"><i class="fas fa-bolt"></i> {{Commandes}}</a></li>
              <li><a href="#"><i class="fas fa-plug"></i> {{Plugins}}</a></li>
              <li class="disabled"><a href="#"><i class="fas fa-lock"></i> {{Verrouille}}</a></li>
            </ul>
            <nav class="cssov-sidebar-demo">
              <ul class="cssov-side-nav">
                <li class="active"><a href="#"><i class="far fa-user"></i><span>{{Public profile}}</span></a></li>
                <li><a href="#"><i class="fas fa-cog"></i><span>{{Account}}</span></a></li>
                <li><a href="#"><i class="fas fa-paint-brush"></i><span>{{Appearance}}</span></a></li>
                <li><a href="#"><i class="fas fa-universal-access"></i><span>{{Accessibility}}</span></a></li>
                <li><a href="#"><i class="far fa-bell"></i><span>{{Notifications}}</span></a></li>
              </ul>
              <div class="cssov-sidebar-section">
                <span class="cssov-sidebar-label">{{Access}}</span>
                <ul class="cssov-side-nav">
                  <li>
                    <a href="#"><i class="far fa-credit-card"></i><span>{{Billing and licensing}}</span><i class="fas fa-chevron-up"></i></a>
                    <ul class="cssov-side-subnav">
                      <li><a href="#"><span>{{Overview}}</span></a></li>
                      <li><a href="#"><span>{{Usage}}</span></a></li>
                      <li><a href="#"><span>{{AI usage}}</span></a></li>
                    </ul>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
	          <div class="col-sm-8">
	            <div style="max-width: 460px; margin-bottom: 12px;">
	              <div class="jeeListRow">
	                <span class="jeeListRow-title">{{CSS audit and architecture improvements avec un libellé long}}</span>
	                <div class="dropdown jeeListRow-actions">
	                  <button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown">
	                    <i class="fas fa-ellipsis-v"></i>
	                  </button>
	                  <ul class="dropdown-menu dropdown-menu-right">
	                    <li><a href="#"><i class="fas fa-edit"></i> {{Modifier}}</a></li>
	                    <li><a href="#"><i class="fas fa-copy"></i> {{Dupliquer}}</a></li>
	                    <li class="divider"></li>
	                    <li><a href="#"><i class="fas fa-trash danger"></i> {{Supprimer}}</a></li>
	                  </ul>
	                </div>
	              </div>
		              <div class="jeeListRow" data-menu-open="true">
		                <span class="jeeListRow-title">{{Ligne avec menu ouvert et masque de texte raccourci}}</span>
		                <button type="button" class="btn btn-xs btn-default jeeListRow-actions"><i class="fas fa-ellipsis-v"></i></button>
		              </div>
		              <div class="jeeListRow">
		                <span class="jeeListRow-title">{{Actions directes a droite sur une ligne longue}}</span>
		                <span class="jeeListRow-actions cssov-row-actions">
		                  <button type="button" class="btn btn-xs btn-success"><i class="fas fa-play"></i></button>
		                  <button type="button" class="btn btn-xs btn-info"><i class="fas fa-edit"></i></button>
		                  <button type="button" class="btn btn-xs btn-danger"><i class="fas fa-trash"></i></button>
		                </span>
		              </div>
		            </div>
		            <div class="dropdown open" style="position: relative;">
		              <ul class="dropdown-menu" style="display: block; position: static; float: none;">
		                <li class="dropdown-header">{{Actions}}</li>
	                <li><a href="#"><i class="fas fa-edit"></i> {{Editer}}</a></li>
                <li><a href="#"><i class="fas fa-copy"></i> {{Dupliquer}}</a></li>
                <li class="divider"></li>
                <li class="disabled"><a href="#"><i class="fas fa-ban"></i> {{Desactive}}</a></li>
	                <li><a href="#"><i class="fas fa-trash danger"></i> {{Supprimer}}</a></li>
	              </ul>
	            </div>
	            <div class="cssov-context-preview">
	              <div class="cssov-context-target">
	                <i class="fas fa-mouse-pointer"></i> {{Cible de menu contextuel}}
	                <small>{{Objets, scenarios, widgets, types, interactions}}</small>
	              </div>
	              <ul class="context-menu-list context-menu-root cssov-context-menu">
	                <li class="context-menu-item context-menu-icon context-menu-icon--fa5">
	                  <i class="fas fa-edit"></i><span>{{Editer}}</span>
	                </li>
	                <li class="context-menu-item context-menu-icon context-menu-icon--fa5">
	                  <i class="fas fa-copy"></i><span>{{Dupliquer}}</span>
	                </li>
	                <li class="context-menu-separator"></li>
	                <li class="context-menu-item context-menu-icon context-menu-icon--fa5 context-menu-submenu">
	                  <i class="fas fa-folder"></i><span>{{Groupe}}</span>
	                </li>
	                <li class="context-menu-item context-menu-disabled">
	                  <span>{{Action indisponible}}</span>
	                </li>
	                <li class="context-menu-item context-menu-icon context-menu-icon--fa5">
	                  <i class="fas fa-trash danger"></i><span>{{Supprimer}}</span>
	                </li>
	              </ul>
	            </div>
	          </div>
	        </div>
	      </div>

      <!-- TAB 5 : SORTABLE -->
      <div class="tab-pane" id="cssOverviewTab5">
        <p class="text-muted"><small><i class="fas fa-info-circle"></i> {{Glisser-deposer les elements (Sortable.js disponible globalement).}}</small></p>
        <ul class="cssov-sortable-list" id="cssov-sortableList">
          <li data-id="1"><i class="fas fa-grip-vertical"></i> <span class="label label-primary">1</span> &nbsp;{{Element A}}</li>
          <li data-id="2"><i class="fas fa-grip-vertical"></i> <span class="label label-success">2</span> &nbsp;{{Element B}}</li>
          <li data-id="3"><i class="fas fa-grip-vertical"></i> <span class="label label-warning">3</span> &nbsp;{{Element C}}</li>
          <li data-id="4"><i class="fas fa-grip-vertical"></i> <span class="label label-danger">4</span> &nbsp;{{Element D}}</li>
        </ul>
        <div class="cssov-result-box" id="cssov-sortable-order">{{Ordre : 1, 2, 3, 4}}</div>
      </div>

    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       11. WIDGETS DASHBOARD
       ══════════════════════════════════════════════════ -->
  <div class="col-xs-12">
    <legend><i class="fas fa-th-large"></i> {{Widgets dashboard}}</legend>
    <div class="cssOverview-widgetGrid">
      <div class="eqLogic eqLogic-widget allowResize" data-category="security" style="height: 150px; position: relative;">
        <div class="widget-name"><a><i class="fas fa-shield-alt"></i> Securite</a></div>
        <span class="cmd refresh pull-right"><i class="fas fa-sync"></i></span>
        <center><span class="iconCmd"><i class="fas fa-lock"></i></span><br><span class="state">Verrouille</span></center>
      </div>
      <div class="eqLogic eqLogic-widget" data-category="light" style="height: 150px; position: relative;">
        <div class="widget-name"><a><i class="far fa-lightbulb"></i> Lumiere</a></div>
        <center><span class="iconCmd"><i class="fas fa-lightbulb"></i></span><br><button type="button" class="btn btn-xs btn-success">ON</button> <button type="button" class="btn btn-xs btn-danger">OFF</button></center>
      </div>
      <div class="scenario scenario-widget" style="height: 150px; position: relative;">
        <div class="widget-name"><a><i class="fas fa-film"></i> Scenario</a></div>
        <center><span class="iconCmd"><i class="fas fa-play-circle"></i></span><br><span class="label label-info">Actif</span></center>
      </div>
      <div class="eqLogic eqLogic-widget eqSignalInfo" data-category="heating" style="height: 150px; position: relative;">
        <div class="widget-name"><a><i class="fas fa-thermometer-half"></i> Thermostat</a></div>
        <center><span class="state">21.4 °C</span><br><div class="progress progressbarContainer"><div class="progress-bar progress-bar-info" style="width: 54%"></div></div><span class="timeCmd">20:12</span></center>
      </div>
      <div class="eqLogic eqLogic-widget eqSignalAction" data-category="energy" style="height: 150px; position: relative;">
        <div class="widget-name"><a><i class="fas fa-bolt"></i> Energie</a></div>
        <center><span class="iconCmd"><i class="fas fa-plug"></i></span><br><strong class="state">842 W</strong><br><span class="label label-warning">Pic</span></center>
      </div>
      <div class="eqLogic eqLogic-widget" data-category="camera" style="height: 150px; position: relative;">
        <div class="widget-name"><a><i class="fas fa-video"></i> Camera</a></div>
        <center><i class="fas fa-video-slash fa-2x text-muted"></i><br><span class="label label-default">Hors ligne</span><br><span class="timeCmd">il y a 3h</span></center>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       12. OBJETS ET RESUMES
       ══════════════════════════════════════════════════ -->
  <div class="col-xs-12">
    <legend><i class="fas fa-home"></i> {{Objets et resumes}}</legend>
    <div id="objectOverviewContainer">
      <div class="objectPreview" style="background-image: linear-gradient(135deg, rgba(13,17,23,.82), rgba(13,110,253,.24));">
        <div class="topPreview">
          <span class="name"><i class="fas fa-home"></i> Maison</span>
          <span class="objectSummaryParent success"><i class="fas fa-thermometer-half"></i> 21°</span>
        </div>
        <div class="bottomPreview">
          <div class="resume"><span>
            <span class="objectSummaryParent"><i class="fas fa-lightbulb"></i> 8</span>
            <span class="objectSummaryParent warning"><i class="fas fa-bolt"></i> 842W</span>
          </span></div>
        </div>
      </div>
      <div class="objectPreview" style="background-image: linear-gradient(135deg, rgba(13,17,23,.82), rgba(25,135,84,.24));">
        <div class="topPreview">
          <span class="name"><i class="fas fa-tree"></i> Jardin</span>
          <span class="objectSummaryParent"><i class="fas fa-tint"></i> 62%</span>
        </div>
        <div class="bottomPreview">
          <div class="resume"><span>
            <span class="objectSummaryParent danger"><i class="fas fa-exclamation-triangle"></i> 1</span>
            <span class="objectSummaryParent"><i class="fas fa-video"></i> 2</span>
          </span></div>
        </div>
      </div>
      <div class="objectPreview" style="background-image: linear-gradient(135deg, rgba(13,17,23,.82), rgba(220,53,69,.24));">
        <div class="topPreview">
          <span class="name"><i class="fas fa-bed"></i> Chambre</span>
          <span class="objectSummaryParent danger"><i class="fas fa-shield-alt"></i> Alarme</span>
        </div>
        <div class="bottomPreview">
          <div class="resume"><span>
            <span class="objectSummaryParent"><i class="fas fa-lock"></i> 3</span>
            <span class="objectSummaryParent"><i class="fas fa-thermometer-quarter"></i> 19°</span>
          </span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       13. TIMELINE
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-clock"></i> {{Timeline}}</legend>
    <div id="timelineContainer">
      <ul id="events">
        <li class="event"><div class="time">19:58</div><div class="type label label-default">Cmd</div><div class="tml-cmd">Thermostat 19°→21°</div></li>
        <li class="event"><div class="time">20:00</div><div class="type label label-info">Info</div><div class="tml-cmd">Commande executee</div></li>
        <li class="event"><div class="time">20:01</div><div class="type label label-warning">Warn</div><div class="tml-cmd">Valeur haute (88%)</div></li>
        <li class="event"><div class="time">20:03</div><div class="type label label-success">Scen</div><div class="tml-cmd">Scenario Reveil execute</div></li>
        <li class="event"><div class="time">20:05</div><div class="type label label-danger">Err</div><div class="tml-cmd">Plugin deconnecte</div></li>
      </ul>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       14. GRAPHIQUES ET JAUGES
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-chart-line"></i> {{Graphiques et jauges}}</legend>
    <div class="chartContainer" style="padding: 12px;">
      <div class="progress progressbarContainer"><div class="progress-bar progress-bar-info" style="width: 72%">CPU 72%</div></div>
      <div class="progress progressbarContainer"><div class="progress-bar progress-bar-success" style="width: 48%">RAM 48%</div></div>
      <div class="progress progressbarContainer"><div class="progress-bar progress-bar-danger" style="width: 88%">Disque 88%</div></div>
      <div id="cssov-highchart" style="height: 160px; margin-top: 8px;"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       15. PANNEAUX
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-columns"></i> {{Panneaux}}</legend>
    <div class="panel panel-primary">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-star"></i> {{Panel primary}}</h3></div>
      <div class="panel-body">{{Corps de panel avec contenu court.}}</div>
      <div class="panel-footer"><button type="button" class="btn btn-xs btn-default">{{Action}}</button> <button type="button" class="btn btn-xs btn-primary">{{Valider}}</button></div>
    </div>
    <div class="panel panel-warning">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-exclamation-triangle"></i> {{Panel warning}}</h3></div>
      <div class="panel-body">{{Etat degradé visible.}}</div>
    </div>
    <div class="panel panel-success">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-check"></i> {{Panel success}}</h3></div>
      <div class="panel-body">{{Tout va bien.}}</div>
    </div>
    <div class="panel panel-danger">
      <div class="panel-heading"><h3 class="panel-title"><i class="fas fa-times"></i> {{Panel danger}}</h3></div>
      <div class="panel-body">{{Erreur critique.}}</div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       16. MODALE (inline preview statique)
       ══════════════════════════════════════════════════ -->
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <legend><i class="fas fa-window-maximize"></i> {{Modale (preview)}}</legend>
    <div class="modal-content" style="display: block; position: relative; z-index: 1;">
      <div class="modal-header"><button type="button" class="close" style="float:right;">&times;</button><h4 class="modal-title"><i class="fas fa-cog"></i> {{Titre modale}}</h4></div>
      <div class="modal-body">
        <p>{{Contenu de modale avec formulaire et message.}}</p>
        <div class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-4 control-label">{{Valeur}}</label>
            <div class="col-sm-8"><input class="form-control" value="Valeur"></div>
          </div>
        </div>
        <div class="alert alert-info"><i class="fas fa-info-circle"></i> {{Note importante dans la modale.}}</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default"><i class="fas fa-times"></i> {{Annuler}}</button>
        <button type="button" class="btn btn-success"><i class="fas fa-save"></i> {{Sauvegarder}}</button>
      </div>
    </div>
  </div>

</div><!-- /#cssOverviewPage -->

<!-- ══════════════════════════════════════════════════════════
     MODALES BOOTSTRAP (réelles, déclenchées par boutons)
     ══════════════════════════════════════════════════════════ -->

<!-- Modal standard -->
<div class="modal fade" id="cssovModalExample" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title"><i class="fas fa-window-maximize"></i> {{Titre de la modale}}</h4>
      </div>
      <div class="modal-body">
        <p>{{Ceci est le contenu de la modale. Les modales Jeedom sont injectees dans #md_modal via jeeDialog.dialog.}}</p>
        <div class="alert alert-info"><i class="fas fa-info-circle"></i> {{Rappel : toujours scoper les CSS et IIFE le JS dans une modale Jeedom reelle.}}</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fas fa-times"></i> {{Fermer}}</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal"><i class="fas fa-check"></i> {{OK}}</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal large -->
<div class="modal fade" id="cssovModalLarge" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title"><i class="fas fa-expand"></i> {{Modale large (modal-lg)}}</h4>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-sm-6"><div class="panel panel-default"><div class="panel-body">{{Colonne gauche}}</div></div></div>
          <div class="col-sm-6"><div class="panel panel-default"><div class="panel-body">{{Colonne droite}}</div></div></div>
        </div>
        <p>{{La classe modal-lg donne plus de largeur. modal-sm reduit. Sans classe = standard (600px).}}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fas fa-times"></i> {{Fermer}}</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal formulaire -->
<div class="modal fade" id="cssovModalForm" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title"><i class="fas fa-keyboard"></i> {{Modale formulaire}}</h4>
      </div>
      <div class="modal-body">
        <form class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-4 control-label">{{Nom}}</label>
            <div class="col-sm-8"><input class="form-control" placeholder="{{Saisir un nom}}"></div>
          </div>
          <div class="form-group">
            <label class="col-sm-4 control-label">{{Mode}}</label>
            <div class="col-sm-8">
              <select class="form-control"><option>Auto</option><option>Manuel</option><option>Planifie</option></select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-4 control-label">{{Actif}}</label>
            <div class="col-sm-8"><label class="checkbox-inline"><input type="checkbox" checked> {{Activer}}</label></div>
          </div>
          <div class="form-group">
            <label class="col-sm-4 control-label">{{Notes}}</label>
            <div class="col-sm-8"><textarea class="form-control" rows="3" placeholder="{{Notes optionnelles}}"></textarea></div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fas fa-times"></i> {{Annuler}}</button>
        <button type="button" class="btn btn-success" id="cssovModalFormSave"><i class="fas fa-save"></i> {{Sauvegarder}}</button>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     JAVASCRIPT
     ══════════════════════════════════════════════════════════ -->
<script>
(function () {
'use strict';

var resultBox = document.getElementById('cssov-dialog-result');
function log(msg) { if (resultBox) resultBox.textContent = msg; }
function controlLabel(element) {
  if (!element) return '{{Action demo}}';
  const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
  if (text !== '') return text;
  const icon = element.querySelector('i');
  if (icon && icon.className) return icon.className.replace(/\s+/g, ' ').trim();
  return element.getAttribute('title') || '{{Action demo}}';
}
function flashControl(element) {
  if (!element || !element.classList) return;
  element.classList.add('cssov-clicked');
  setTimeout(function () { element.classList.remove('cssov-clicked'); }, 450);
}
function demoClickLabel(prefix, element) {
  flashControl(element);
  log(prefix + ' : ' + controlLabel(element));
}
function showCssovModal(target) {
  const modal = typeof target === 'string' ? document.querySelector(target) : target;
  if (!modal) return;
  modal.style.display = 'block';
  modal.classList.add('in');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (!document.getElementById('cssov-modal-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'cssov-modal-backdrop';
    backdrop.className = 'modal-backdrop fade in';
    document.body.appendChild(backdrop);
  }
}
function hideCssovModal(target) {
  const modal = target ? target.closest('.modal') : document.querySelector('.modal.in');
  if (!modal) return;
  modal.classList.remove('in');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  const backdrop = document.getElementById('cssov-modal-backdrop');
  if (backdrop) backdrop.remove();
}
function activateCssovTab(link) {
  const pane = document.querySelector(link.getAttribute('href'));
  if (!pane) return;
  const nav = link.closest('.nav');
  if (nav) {
    Array.from(nav.children).forEach(function (item) { item.classList.remove('active'); });
  }
  if (link.parentElement) link.parentElement.classList.add('active');
  Array.from(pane.parentElement.children).forEach(function (item) { item.classList.remove('active'); });
  pane.classList.add('active');
  demoClickLabel('{{Onglet}}', link);
}
function toggleCssovDropdown(button) {
  const dropdown = button.closest('.dropdown');
  if (!dropdown) return;
  const willOpen = !dropdown.classList.contains('open');
  Array.from(document.querySelectorAll('#cssOverviewPage .dropdown.open')).forEach(function (item) {
    if (item !== dropdown) item.classList.remove('open');
  });
  dropdown.classList.toggle('open', willOpen);
  button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  const row = button.closest('.jeeListRow');
  if (row) row.setAttribute('data-menu-open', willOpen ? 'true' : 'false');
  demoClickLabel('{{Dropdown}}', button);
}

/* ── Tooltips Bootstrap ── */
if (typeof $ !== 'undefined' && $.fn) {
  if ($.fn.tooltip) {
  $('[data-toggle="tooltip"]').tooltip();
  }
  if ($.fn.popover) {
  $('#bt_popoverExample').popover({ trigger: 'click' });
  }
}

/* ── Tippy ── */
if (typeof tippy !== 'undefined') {
  tippy('#bt_tippyExample', {
    content: 'Tippy.js tooltip — plus souple que Bootstrap tooltip',
    theme: 'translucent',
    placement: 'right'
  });
} else {
  var el = document.getElementById('bt_tippyExample');
  if (el) el.setAttribute('title', 'tippy non disponible — utilise Bootstrap tooltip');
}

/* ── bootbox ── */
var bbAlert   = document.getElementById('bt_bbAlert');
var bbConfirm = document.getElementById('bt_bbConfirm');
var bbPrompt  = document.getElementById('bt_bbPrompt');
var bbConfDng = document.getElementById('bt_bbConfirmDanger');

if (typeof bootbox !== 'undefined') {
  if (bbAlert) bbAlert.addEventListener('click', function () {
    bootbox.alert({ title: 'Information', message: '{{Ceci est un bootbox.alert}}', callback: function () { log('bootbox.alert : OK cliqué'); } });
  });
  if (bbConfirm) bbConfirm.addEventListener('click', function () {
    bootbox.confirm({ title: 'Confirmation', message: '{{Voulez-vous vraiment effectuer cette action ?}}', buttons: { confirm: { label: 'Oui', className: 'btn-warning' }, cancel: { label: 'Non', className: 'btn-default' } }, callback: function (r) { log('bootbox.confirm : ' + (r ? 'confirmé' : 'annulé')); } });
  });
  if (bbPrompt) bbPrompt.addEventListener('click', function () {
    bootbox.prompt({ title: '{{Saisir une valeur}}', inputType: 'text', value: '42', callback: function (r) { if (r !== null) log('bootbox.prompt : "' + r + '"'); else log('bootbox.prompt : annulé'); } });
  });
  if (bbConfDng) bbConfDng.addEventListener('click', function () {
    bootbox.confirm({ title: '<span class="danger"><i class="fas fa-trash"></i> {{Supprimer}}</span>', message: '{{Cette action est irreversible. Confirmer la suppression ?}}', buttons: { confirm: { label: '<i class="fas fa-trash"></i> {{Supprimer}}', className: 'btn-danger' }, cancel: { label: '{{Annuler}}', className: 'btn-default' } }, callback: function (r) { log('bootbox.confirm danger : ' + (r ? 'SUPPRIME' : 'annulé')); } });
  });
} else {
  [bbAlert, bbConfirm, bbPrompt, bbConfDng].forEach(function (el) {
    if (el) el.addEventListener('click', function () { log(controlLabel(el) + ' : fallback demo'); });
  });
}

/* ── jeeDialog / toastr ── */
var jdAlert  = document.getElementById('bt_jdAlert');
var jdConf   = document.getElementById('bt_jdConfirm');
var jdTOk    = document.getElementById('bt_jdToastOk');
var jdTErr   = document.getElementById('bt_jdToastErr');
var jdTWarn  = document.getElementById('bt_jdToastWarn');
var jdTInfo  = document.getElementById('bt_jdToastInfo');

if (jdAlert) jdAlert.addEventListener('click', function () {
  if (typeof jeeDialog !== 'undefined' && jeeDialog.alert) {
    jeeDialog.alert({ message: '{{Message jeeDialog.alert}}', backdrop: false, callback: function () { log('jeeDialog.alert fermé'); } });
  } else if (typeof bootbox !== 'undefined') {
    bootbox.alert('{{jeeDialog non dispo — fallback bootbox.alert}}');
  } else {
    log('jeeDialog.alert : fallback demo');
  }
});

if (jdConf) jdConf.addEventListener('click', function () {
  if (typeof jeeDialog !== 'undefined' && jeeDialog.confirm) {
    jeeDialog.confirm({ message: '{{Confirmer via jeeDialog.confirm ?}}', backdrop: false, callback: function (r) { log('jeeDialog.confirm : ' + (r ? 'oui' : 'non')); } });
  } else if (typeof bootbox !== 'undefined') {
    bootbox.confirm('{{jeeDialog non dispo — fallback bootbox.confirm}}', function (r) { log('fallback confirm : ' + r); });
  } else {
    log('jeeDialog.confirm : fallback demo');
  }
});

if (jdTOk)   jdTOk  .addEventListener('click', function () { if (typeof toastr !== 'undefined') { toastr.success('{{Action reussie !}}'); log('toastr.success'); } else { log('toastr non disponible'); } });
if (jdTErr)  jdTErr .addEventListener('click', function () { if (typeof toastr !== 'undefined') { toastr.error('{{Erreur lors de l\'operation}}'); log('toastr.error'); } else { log('toastr.error : fallback demo'); } });
if (jdTWarn) jdTWarn.addEventListener('click', function () { if (typeof toastr !== 'undefined') { toastr.warning('{{Attention : verifier la valeur}}'); log('toastr.warning'); } else { log('toastr.warning : fallback demo'); } });
if (jdTInfo) jdTInfo.addEventListener('click', function () { if (typeof toastr !== 'undefined') { toastr.info('{{Information disponible}}'); log('toastr.info'); } else { log('toastr.info : fallback demo'); } });

/* ── Alert bandeau jeedomUtils ── */
var btAS = document.getElementById('bt_alertSuccess');
var btAD = document.getElementById('bt_alertDanger');
var btAH = document.getElementById('bt_alertHide');
if (btAS) btAS.addEventListener('click', function () {
  if (typeof jeedomUtils !== 'undefined') jeedomUtils.showAlert({ message: '{{Action effectuee avec succes !}}', level: 'success' });
  log('jeedomUtils.showAlert success');
});
if (btAD) btAD.addEventListener('click', function () {
  if (typeof jeedomUtils !== 'undefined') jeedomUtils.showAlert({ message: '{{Erreur critique detectee !}}', level: 'danger' });
  log('jeedomUtils.showAlert danger');
});
if (btAH) btAH.addEventListener('click', function () {
  if (typeof jeedomUtils !== 'undefined') jeedomUtils.hideAlert();
  log('jeedomUtils.hideAlert');
});

/* ── Spinner / Loading ── */
var btSL = document.getElementById('bt_showLoading');
var btHL = document.getElementById('bt_hideLoading');
if (btSL) btSL.addEventListener('click', function () {
  if (typeof domUtils !== 'undefined') { domUtils.showLoading(); setTimeout(function () { domUtils.hideLoading(); }, 1500); }
  log('domUtils.showLoading (auto-hide 1.5s)');
});
if (btHL) btHL.addEventListener('click', function () {
  if (typeof domUtils !== 'undefined') domUtils.hideLoading();
  log('domUtils.hideLoading');
});

/* ── Modal form save demo ── */
var mfSave = document.getElementById('cssovModalFormSave');
if (mfSave) mfSave.addEventListener('click', function () {
  if (typeof $ !== 'undefined' && $.fn && typeof $.fn.modal !== 'undefined') $('#cssovModalForm').modal('hide');
  else hideCssovModal(mfSave);
  if (typeof toastr !== 'undefined') toastr.success('{{Formulaire sauvegarde (demo)}}');
  log('Modal formulaire : sauvegarde demo');
});

/* ── noUiSlider ── */
if (typeof noUiSlider !== 'undefined') {
  var s1 = document.getElementById('cssov-slider1');
  var s2 = document.getElementById('cssov-slider2');
  var s3 = document.getElementById('cssov-slider3');
  var v1 = document.getElementById('cssov-slider1-val');
  var v2 = document.getElementById('cssov-slider2-val');

  if (s1) {
    noUiSlider.create(s1, { start: 50, connect: true, range: { min: 0, max: 100 }, format: { to: function (v) { return Math.round(v); }, from: Number } });
    s1.noUiSlider.on('update', function (values) { if (v1) v1.textContent = values[0]; });
  }
  if (s2) {
    noUiSlider.create(s2, { start: [20, 75], connect: true, range: { min: 0, max: 100 }, format: { to: function (v) { return Math.round(v); }, from: Number } });
    s2.noUiSlider.on('update', function (values) { if (v2) v2.textContent = values[0] + ' – ' + values[1]; });
  }
  if (s3) {
    noUiSlider.create(s3, { start: 40, orientation: 'vertical', direction: 'rtl', connect: true, range: { min: 0, max: 100 }, format: { to: function (v) { return Math.round(v); }, from: Number } });
  }
}

/* ── flatpickr ── */
const cssovFlatpickrInput = document.getElementById('cssov-flatpickr');
if (cssovFlatpickrInput && typeof flatpickr !== 'undefined') {
  const initCssovFlatpickr = function() {
    flatpickr(cssovFlatpickrInput, {
      enableTime: true,
      dateFormat: 'd/m/Y H:i',
      defaultDate: 'today',
      locale: (typeof flatpickr.l10ns !== 'undefined' && flatpickr.l10ns.fr) ? 'fr' : 'default'
    });
  };
  if (typeof jeedomUtils !== 'undefined' && typeof jeedomUtils.loadFlatpickrCSS === 'function') {
    jeedomUtils.loadFlatpickrCSS().then(initCssovFlatpickr);
  } else {
    initCssovFlatpickr();
  }
}

/* ── CodeMirror ── */
if (typeof CodeMirror !== 'undefined') {
  var cmWrap = document.getElementById('cssov-cm-wrapper');
  var cmSource = document.getElementById('cssov-codemirror');
  if (cmWrap && cmSource) {
    CodeMirror(cmWrap, {
      value: cmSource.value,
      mode: 'javascript',
      theme: 'default',
      lineNumbers: true,
      lineWrapping: false,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
      autofocus: false
    });
  }
} else {
  /* Fallback : afficher le textarea brut */
  var cmSource2 = document.getElementById('cssov-codemirror');
  if (cmSource2) cmSource2.style.display = 'block';
}

/* ── Highcharts ── */
if (typeof Highcharts !== 'undefined') {
  Highcharts.chart('cssov-highchart', {
    chart: { type: 'spline', margin: [10, 10, 20, 36], height: 160, backgroundColor: 'transparent', animation: false },
    title: { text: null },
    legend: { enabled: false },
    credits: { enabled: false },
    xAxis: { categories: ['00:00','04:00','08:00','12:00','16:00','20:00'], labels: { style: { fontSize: '10px' } } },
    yAxis: { title: { text: null }, labels: { style: { fontSize: '10px' } } },
    series: [
      { name: 'Temp', data: [19, 18, 20, 22, 23, 21], color: '#0d6efd' },
      { name: 'Hum',  data: [60, 62, 58, 55, 57, 62], color: '#95c12b' }
    ],
    plotOptions: { spline: { marker: { radius: 2 } } }
  });
} else {
  var hcEl = document.getElementById('cssov-highchart');
  if (hcEl) hcEl.innerHTML = '<p class="text-muted text-center" style="line-height: 160px;">Highcharts non disponible</p>';
}

/* ── Sortable ── */
if (typeof Sortable !== 'undefined') {
  var sortList = document.getElementById('cssov-sortableList');
  var sortResult = document.getElementById('cssov-sortable-order');
  if (sortList) {
    Sortable.create(sortList, {
      animation: 150,
      handle: '.fa-grip-vertical',
      onEnd: function () {
        var order = Array.from(sortList.querySelectorAll('li')).map(function (li) { return li.dataset.id; });
        if (sortResult) sortResult.textContent = 'Ordre : ' + order.join(', ');
      }
    });
  }
}

/* ── Filtre table live ── */
var tSearch = document.getElementById('cssov-tableSearch');
var tBody   = document.querySelector('#cssov-mainTable tbody');
if (tSearch && tBody) {
  tSearch.addEventListener('input', function () {
    var q = tSearch.value.toLowerCase();
    Array.from(tBody.rows).forEach(function (row) {
      row.style.display = row.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
    });
  });
}

/* ── Actions demo pour les controles purement visuels ── */
const overviewPage = document.getElementById('cssOverviewPage');
if (overviewPage) {
  overviewPage.addEventListener('click', function (event) {
    const tabLink = event.target.closest('a[data-toggle="tab"]');
    if (tabLink && overviewPage.contains(tabLink)) {
      event.preventDefault();
      activateCssovTab(tabLink);
      return;
    }

    const contextItem = event.target.closest('.cssov-context-menu .context-menu-item');
    if (contextItem && overviewPage.contains(contextItem)) {
      event.preventDefault();
      if (contextItem.classList.contains('context-menu-disabled')) {
        demoClickLabel('Menu contextuel indisponible', contextItem);
        return;
      }
      demoClickLabel('Menu contextuel', contextItem);
      return;
    }

    const closeButton = event.target.closest('button.close');
    if (closeButton && overviewPage.contains(closeButton) && !closeButton.hasAttribute('data-dismiss')) {
      event.preventDefault();
      const alertBox = closeButton.closest('.alert');
      if (alertBox) {
        alertBox.remove();
        log('{{Alerte fermee}}');
        return;
      }
      demoClickLabel('{{Preview modale}}', closeButton);
      return;
    }

    const link = event.target.closest('a[href="#"]');
    if (link && overviewPage.contains(link)) {
      event.preventDefault();
      const linkParent = link.closest('li');
      if (link.classList.contains('disabled') || link.getAttribute('aria-disabled') === 'true' || (linkParent && linkParent.classList.contains('disabled'))) return;
      const linkButtonGroup = link.closest('.btn-group');
      if (linkButtonGroup) {
        Array.from(linkButtonGroup.querySelectorAll('.btn')).forEach(function (btn) { btn.classList.remove('active'); });
        link.classList.add('active');
        demoClickLabel('{{Groupe de liens boutons}}', link);
        return;
      }
      const linkGroup = link.closest('.nav, .pagination');
      if (linkGroup && linkParent) {
        Array.from(linkGroup.children).forEach(function (child) { child.classList.remove('active'); });
        linkParent.classList.add('active');
        demoClickLabel('{{Navigation demo}}', link);
        return;
      }
      if (link.closest('.dropdown-menu')) {
        const linkRow = link.closest('.jeeListRow');
        if (linkRow) linkRow.setAttribute('data-menu-open', 'true');
        demoClickLabel('{{Menu deroulant}}', link);
        return;
      }
      demoClickLabel('{{Lien demo}}', link);
      return;
    }

    const button = event.target.closest('button');
    if (!button || !overviewPage.contains(button)) return;
    if (button.disabled || button.classList.contains('disabled') || button.closest('.disabled')) return;
    const toggle = button.getAttribute('data-toggle');
    if (toggle === 'dropdown') {
      event.preventDefault();
      toggleCssovDropdown(button);
      return;
    }
    if (toggle === 'modal') {
      event.preventDefault();
      showCssovModal(button.getAttribute('data-target'));
      demoClickLabel('{{Modale}}', button);
      return;
    }
    if (toggle === 'tooltip') {
      event.preventDefault();
      demoClickLabel('{{Tooltip}} ' + (button.getAttribute('data-placement') || ''), button);
      return;
    }
    if (button.id === 'bt_popoverExample') {
      event.preventDefault();
      demoClickLabel('{{Popover}}', button);
      return;
    }
    if (button.id === 'bt_tippyExample') {
      event.preventDefault();
      demoClickLabel('{{Tippy}}', button);
      return;
    }
    if (button.id || button.hasAttribute('data-dismiss')) return;
    event.preventDefault();

    const inputGroup = button.closest('.input-group');
    if (inputGroup) {
      const input = inputGroup.querySelector('input.form-control');
      if (input) {
        const icon = button.querySelector('i');
        if (button.classList.contains('btn-danger')) {
          input.value = '';
        } else if (icon && icon.classList.contains('fa-plus')) {
          input.value = (input.value || '{{Valeur}}') + ' +';
        } else if (icon && icon.classList.contains('fa-minus')) {
          input.value = (input.value || '{{Valeur}}') + ' -';
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      demoClickLabel('{{Input group}}', button);
      return;
    }

    const buttonGroup = button.closest('.btn-group');
    if (buttonGroup) {
      Array.from(buttonGroup.querySelectorAll('.btn')).forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');
      demoClickLabel('{{Groupe de boutons}}', button);
      return;
    }

    const listRow = button.closest('.jeeListRow');
    if (listRow) {
      listRow.setAttribute('data-menu-open', 'true');
      demoClickLabel('{{Action de ligne}}', button);
      return;
    }

    const tableRow = button.closest('#cssov-mainTable tbody tr');
    if (tableRow) {
      demoClickLabel('{{Action tableau}} ' + tableRow.cells[0].textContent, button);
      return;
    }

    if (button.closest('.eqLogic-widget, .scenario-widget, .cmd-widget')) {
      demoClickLabel('{{Action widget}}', button);
      return;
    }

    if (button.closest('.panel-footer')) {
      demoClickLabel('{{Action panel}}', button);
      return;
    }

    if (button.closest('.modal-content')) {
      demoClickLabel('{{Preview modale}}', button);
      return;
    }

    demoClickLabel('{{Bouton demo}}', button);
  });

  overviewPage.addEventListener('contextmenu', function (event) {
    const target = event.target.closest('.cssov-context-target');
    if (!target || !overviewPage.contains(target)) return;
    event.preventDefault();
    demoClickLabel('{{Ouverture clic droit}}', target);
  });
}

document.addEventListener('click', function (event) {
  const dismiss = event.target.closest('[data-dismiss="modal"], .modal button.close');
  if (!dismiss) return;
  const modal = dismiss.closest('#cssovModalExample, #cssovModalLarge, #cssovModalForm');
  if (!modal) return;
  event.preventDefault();
  hideCssovModal(dismiss);
  log('{{Modale fermee}}');
});

// --- Bascule de theme (apercu local, ne modifie pas la preference utilisateur) ---
(function () {
  const sel = document.getElementById('cssov-theme-switch');
  if (!sel) return;
  const themeLink = document.getElementById('jeedom_theme_currentcss');
  const colorsStyle = document.getElementById('jeedom_theme_colors');
  // Pre-selectionne le theme courant d'apres le <link> charge
  if (themeLink) {
    const m = (themeLink.getAttribute('href') || '').match(/themes\/([^/]+)\/desktop/);
    if (m && sel.querySelector('option[value="' + m[1] + '"]')) sel.value = m[1];
  }
  sel.addEventListener('change', function () {
    const t = sel.value;
    const base = 'core/themes/' + t + '/desktop/';
    const bust = '?v=' + Date.now();
    if (themeLink) themeLink.setAttribute('href', base + t + '.css' + bust);
    const shadow = document.getElementById('shadows_theme_css');
    if (shadow) shadow.setAttribute('href', base + 'shadows.css' + bust);
    if (colorsStyle) {
      fetch(base + 'colors.css' + bust)
        .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function (css) { colorsStyle.textContent = css; log('{{Theme bascule}} -> ' + t); })
        .catch(function () { log('{{Echec chargement colors.css}} ' + t); });
    } else {
      log('{{Theme bascule}} -> ' + t);
    }
  });
}());

}());
</script>
