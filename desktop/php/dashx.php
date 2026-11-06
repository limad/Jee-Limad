<?php
if (!isConnect()) {
    throw new Exception('{{401 - Accès non autorisé}}');
}
require_once __DIR__ . '/../../core/class/dashx.class.php';
$configuredTheme = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) config::byKey('dashx::default_theme', 'core', 'dark'));
$theme = in_array($configuredTheme, ['dark', 'light', 'minimalist', 'mushroom', 'nord', 'solarized'], true) ? $configuredTheme : 'dark';
$canEdit = isConnect('admin');
$assetVersion = (string) max(
    @filemtime(__DIR__ . '/../css/dashx.css') ?: 0,
    @filemtime(__DIR__ . '/../js/dashx/dashx.js') ?: 0,
    @filemtime(__DIR__ . '/../js/dashx/widget-definitions.js') ?: 0
);
$apiBase = 'core/ajax';
$sseUrl = 'core/ajax/event_sse.ajax.php';
$lang = config::byKey('language', 'core', 'fr_FR');
$isEn = strpos($lang, 'en') === 0;
$i18n = $isEn ? [
    'unknown' => 'Unknown',
    'on' => 'ON',
    'off' => 'OFF',
    'turn_on' => 'Turn on',
    'turn_off' => 'Turn off',
    'open' => 'Open',
    'close' => 'Close',
    'locked' => 'Locked',
    'unlocked' => 'Unlocked',
    'lock_open_aria' => 'Unlock',
    'lock_close_aria' => 'Lock',
    'cover_up' => 'Open shutter',
    'cover_stop' => 'Stop shutter',
    'cover_down' => 'Close shutter',
    'setpoint' => 'Setpoint',
    'brightness' => 'Brightness',
    'color' => 'Color',
    'arm' => 'Arm',
    'disarm' => 'Disarm',
    'armed' => 'Armed',
    'disarmed' => 'Disarmed',
    'closed' => 'Closed',
    'temperature' => 'Temperature',
    'no_widget' => 'No widget configured.',
    'load_error' => 'Loading error.',
    'confirm_delete' => 'Delete this widget?',
    'confirm_import' => 'Import {n} widget(s)? Current layout will be replaced.',
    'confirm_cancel_edit' => 'Discard unsaved changes?',
    'confirm_pack_apply' => 'Apply layout "{name}"? Current layout will be replaced.',
    'modal_cancel' => 'Cancel',
    'modal_confirm' => 'Confirm',
    'modal_ok' => 'OK',
    'toast_json_invalid' => 'Invalid JSON file.',
    'toast_format_invalid' => 'Unrecognized layout format.',
    'toast_import_error' => 'Import error: ',
    'toast_save_error' => 'Save error: ',
    'widget_type_suggested' => 'Suggested type',
    'badge_dialog_title' => 'Add badge',
    'badge_cmd_prompt' => 'Info command ID:',
    'badge_cmd_label' => 'Info command ID',
    'badge_icon_prompt' => 'Icon (emoji):',
    'badge_icon_label' => 'Icon',
    'badge_label_prompt' => 'Label (optional):',
    'badge_label_label' => 'Label',
    'condition_title' => 'Display condition',
    'condition_cmd' => 'Info command',
    'condition_none' => 'Always visible',
    'condition_operator' => 'Operator',
    'condition_value' => 'Reference value',
    'add_tab' => 'Add tab',
    'tab_name_prompt' => 'Tab name:',
    'tab_dialog_title' => 'Tab',
    'tab_name_label' => 'Tab name',
    'new_tab_default' => 'New tab',
    'tab_not_empty' => 'Tab is not empty: move or delete widgets first.',
    'interactions_title' => 'Interactions',
    'action_tap' => 'Single tap',
    'action_dbl' => 'Double tap',
    'action_hold' => 'Long press',
    'action_default' => 'Default',
    'action_moreinfo' => 'Details',
    'action_toggle' => 'Toggle',
    'action_none' => 'None',
    'moreinfo_edit_widget' => 'Edit widget',
    'moreinfo_equipment_title' => 'Equipment tile',
    'moreinfo_eqlogic_id' => 'Equipment ID',
    'moreinfo_size' => 'Size',
    'moreinfo_columns' => 'Command columns',
    'moreinfo_actions' => 'Actions',
    'moreinfo_actions_visible' => 'visible',
    'moreinfo_actions_hidden' => 'hidden',
    'moreinfo_auto' => 'Auto',
    'moreinfo_equipment_note' => 'Commands are already visible in this tile. Use Edit widget to change display options.',
    'sse_connected' => 'Live connected',
    'sse_reconnecting' => 'Reconnecting...',
    'sse_offline' => 'Offline',
] : [
    'unknown' => 'Inconnu',
    'on' => 'ON',
    'off' => 'OFF',
    'turn_on' => 'Allumer',
    'turn_off' => 'Éteindre',
    'open' => 'Ouvrir',
    'close' => 'Fermer',
    'locked' => 'Verrouillé',
    'unlocked' => 'Ouvert',
    'lock_open_aria' => 'Ouvrir la serrure',
    'lock_close_aria' => 'Fermer la serrure',
    'cover_up' => 'Monter le volet',
    'cover_stop' => 'Stopper le volet',
    'cover_down' => 'Descendre le volet',
    'setpoint' => 'Consigne',
    'brightness' => 'Intensité lumineuse',
    'color' => 'Couleur',
    'arm' => 'Armer',
    'disarm' => 'Désarmer',
    'armed' => 'Armée',
    'disarmed' => 'Désarmée',
    'closed' => 'Fermé',
    'temperature' => 'Température',
    'no_widget' => 'Aucun widget configuré.',
    'load_error' => 'Erreur de chargement.',
    'confirm_delete' => 'Supprimer ce widget ?',
    'confirm_import' => 'Importer {n} widget(s) ? Le layout actuel sera remplacé.',
    'confirm_cancel_edit' => 'Annuler les modifications non sauvegardées ?',
    'confirm_pack_apply' => 'Appliquer le layout "{name}" ? Le layout actuel sera remplacé.',
    'modal_cancel' => 'Annuler',
    'modal_confirm' => 'Confirmer',
    'modal_ok' => 'OK',
    'toast_json_invalid' => 'Fichier JSON invalide.',
    'toast_format_invalid' => 'Format de layout non reconnu.',
    'toast_import_error' => 'Erreur import : ',
    'toast_save_error' => 'Erreur sauvegarde : ',
    'widget_type_suggested' => 'Type suggere',
    'badge_dialog_title' => 'Ajouter un badge',
    'badge_cmd_prompt' => 'ID de la commande info :',
    'badge_cmd_label' => 'ID de la commande info',
    'badge_icon_prompt' => 'Icone (emoji) :',
    'badge_icon_label' => 'Icone',
    'badge_label_prompt' => 'Label (optionnel) :',
    'badge_label_label' => 'Label',
    'condition_title' => 'Condition d affichage',
    'condition_cmd' => 'Commande info',
    'condition_none' => 'Toujours visible',
    'condition_operator' => 'Operateur',
    'condition_value' => 'Valeur de reference',
    'add_tab' => 'Ajouter un onglet',
    'tab_name_prompt' => 'Nom de l onglet :',
    'tab_dialog_title' => 'Onglet',
    'tab_name_label' => 'Nom de l onglet',
    'new_tab_default' => 'Nouvel onglet',
    'tab_not_empty' => 'Onglet non vide : deplacez ou supprimez les widgets d abord.',
    'interactions_title' => 'Interactions',
    'action_tap' => 'Clic simple',
    'action_dbl' => 'Double-clic',
    'action_hold' => 'Appui long',
    'action_default' => 'Par defaut',
    'action_moreinfo' => 'Details',
    'action_toggle' => 'Basculer',
    'action_none' => 'Aucune',
    'moreinfo_edit_widget' => 'Modifier la tuile',
    'moreinfo_equipment_title' => 'Tuile equipement',
    'moreinfo_eqlogic_id' => 'ID equipement',
    'moreinfo_size' => 'Taille',
    'moreinfo_columns' => 'Colonnes commandes',
    'moreinfo_actions' => 'Actions',
    'moreinfo_actions_visible' => 'visibles',
    'moreinfo_actions_hidden' => 'masquees',
    'moreinfo_auto' => 'Auto',
    'moreinfo_equipment_note' => 'Les commandes sont deja visibles dans la tuile. Utilisez Modifier la tuile pour regler son affichage.',
    'sse_connected' => 'Temps reel connecte',
    'sse_reconnecting' => 'Reconnexion...',
    'sse_offline' => 'Hors ligne',
];
?>
<?php include_file('desktop', 'dashx', 'css'); ?>
  <div id="app">
    <header class="dash-header">
      <span class="dash-title">Dashx</span>
      <div class="dash-header-actions">
        <div class="toolbar-group">
          <span class="sse-status" title="SSE"></span>
          <button class="btn-icon" id="btn-export" type="button" title="Exporter le layout">Export</button>
          <label class="btn-icon btn-import-label" title="Importer un layout">
            Import
            <input type="file" id="import-file" accept=".json" hidden>
          </label>
        </div>
        <div class="toolbar-group">
          <select class="btn-icon theme-select" id="toolbar-theme" title="Theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="minimalist">Minimalist</option>
            <option value="mushroom">Mushroom</option>
            <option value="nord">Nord</option>
            <option value="solarized">Solarized</option>
            <option value="aurora">Aurora</option>
          </select>
          <button class="btn-icon" id="btn-compact" type="button" title="Mode compact">Compact</button>
          <button class="btn-icon" id="btn-fullscreen" type="button" title="Plein écran">⛶ Plein écran</button>
        </div>
        <div class="toolbar-group toolbar-group-edit">
          <button class="btn-icon" id="btn-add" type="button" title="Ajouter un widget">Ajouter</button>
          <button class="btn-icon" id="btn-edit" type="button" title="Edition">Editer</button>
          <span class="edit-status hidden" id="edit-status">Mode edition</span>
          <button class="btn-icon" id="btn-cancel-edit" type="button" title="Annuler edition" hidden>Annuler</button>
          <button class="btn-icon" id="btn-save" type="button" title="Sauvegarder">Terminer</button>
        </div>
      </div>
    </header>
    <div id="badge-bar" class="badge-bar" hidden></div>
    <div id="floating-toolbar" class="floating-toolbar" hidden>
      <button class="ft-btn" data-ft-action="edit" type="button" title="Editer">Editer</button>
      <button class="ft-btn" data-ft-action="copy" type="button" title="Copier">Copier</button>
      <button class="ft-btn" data-ft-action="w-inc" type="button" title="Plus large">L+</button>
      <button class="ft-btn" data-ft-action="w-dec" type="button" title="Moins large">L-</button>
      <button class="ft-btn" data-ft-action="h-inc" type="button" title="Plus haut">H+</button>
      <button class="ft-btn" data-ft-action="h-dec" type="button" title="Moins haut">H-</button>
      <button class="ft-btn ft-danger" data-ft-action="delete" type="button" title="Supprimer">Suppr.</button>
    </div>
    <section id="widget-editor" class="editor-panel" hidden>
      <div class="editor-row">
        <label>Type
          <select id="widget-type">
            <option value="summary">Resume</option>
            <option value="divider">Separateur</option>
            <option value="equipment">Equipement</option>
            <option value="scene">Scene / Action</option>
            <option value="select">Selecteur</option>
            <option value="media">Multimedia</option>
            <option value="electricity">Electricite</option>
            <option value="weather">Meteo / Vent</option>
            <option value="alarm">Alarme</option>
            <option value="fan">Ventilateur</option>
            <option value="garage">Garage / Portail</option>
            <option value="message">Message</option>
            <option value="dialogue">Dialogue / Chat</option>
            <option value="text">Saisie texte</option>
            <option value="timer">Minuteur</option>
            <option value="hygrostat">Hygrostat</option>
            <option value="battery">Batterie</option>
            <option value="airQuality">Qualite air</option>
            <option value="presence">Presence</option>
            <option value="systemHealth">Sante systeme</option>
            <option value="sensor">Capteur</option>
            <option value="chart">Graphique</option>
            <option value="binary">Binaire</option>
            <option value="camera">Camera</option>
            <option value="lock">Serrure</option>
            <option value="light">Lumiere</option>
            <option value="color">Lumiere couleur</option>
            <option value="dimmer">Variateur</option>
            <option value="switch">Switch</option>
            <option value="cover">Volet</option>
            <option value="climate">Climat</option>
            <option value="thermostat">Thermostat</option>
          </select>
        </label>
        <label>Libelle
          <input id="widget-label" type="text" maxlength="80" placeholder="Salon">
        </label>
        <label>Objet
          <select id="object-select"></select>
        </label>
        <label>Equipement
          <select id="eqlogic-select"></select>
        </label>
      </div>
      <div class="editor-row editor-row-size">
        <label>Colonnes (1-12)
          <input id="widget-w" type="number" min="1" max="12" value="1">
        </label>
        <label>Hauteur (1-6)
          <input id="widget-h" type="number" min="1" max="6" value="1">
        </label>
      </div>
      <div id="command-fields" class="editor-row"></div>
      <fieldset class="editor-section editor-interactions">
        <legend data-i18n="interactions_title">Interactions</legend>
        <label>
          <span data-i18n="action_tap">Clic simple</span>
          <select id="widget-tap-action" data-config-key="tap_action">
            <option value="default" data-i18n="action_default">Par defaut</option>
            <option value="more-info" data-i18n="action_moreinfo">Details</option>
            <option value="toggle" data-i18n="action_toggle">Basculer</option>
            <option value="none" data-i18n="action_none">Aucune</option>
          </select>
        </label>
        <label>
          <span data-i18n="action_dbl">Double-clic</span>
          <select id="widget-dbl-action" data-config-key="double_tap_action">
            <option value="default" data-i18n="action_default">Par defaut</option>
            <option value="more-info" data-i18n="action_moreinfo">Details</option>
            <option value="toggle" data-i18n="action_toggle">Basculer</option>
            <option value="none" data-i18n="action_none">Aucune</option>
          </select>
        </label>
        <label>
          <span data-i18n="action_hold">Appui long</span>
          <select id="widget-hold-action" data-config-key="hold_action">
            <option value="default" data-i18n="action_default">Par defaut</option>
            <option value="more-info" data-i18n="action_moreinfo">Details</option>
            <option value="toggle" data-i18n="action_toggle">Basculer</option>
            <option value="none" data-i18n="action_none">Aucune</option>
          </select>
        </label>
      </fieldset>
      <div class="editor-actions">
        <button id="btn-create-widget" type="button">Ajouter le widget</button>
        <button id="btn-update-widget" type="button" hidden>Modifier le widget</button>
        <button id="btn-delete-widget" type="button">Supprimer selection</button>
      </div>
    </section>
    <nav id="tab-bar" class="tab-bar"></nav>
    <main id="grid" class="dash-grid">
      <p class="loading-msg">Chargement...</p>
    </main>
    <div id="more-info-overlay" class="more-info-overlay" hidden aria-modal="true" role="dialog">
      <div class="more-info-panel" id="more-info-panel">
        <header class="more-info-header">
          <span class="more-info-title" id="more-info-title"></span>
          <button class="more-info-close" id="more-info-close" type="button" aria-label="Fermer">x</button>
        </header>
        <div class="more-info-body" id="more-info-body"></div>
      </div>
    </div>
    <div id="dash-dialog-overlay" class="dash-dialog-overlay" hidden>
      <form id="dash-dialog" class="dash-dialog" role="dialog" aria-modal="true" aria-labelledby="dash-dialog-title">
        <header class="dash-dialog-header">
          <span id="dash-dialog-title" class="dash-dialog-title"></span>
        </header>
        <p id="dash-dialog-message" class="dash-dialog-message"></p>
        <div id="dash-dialog-fields" class="dash-dialog-fields"></div>
        <div class="dash-dialog-actions">
          <button id="dash-dialog-cancel" class="dash-dialog-cancel" type="button"></button>
          <button id="dash-dialog-confirm" class="dash-dialog-confirm" type="submit"></button>
        </div>
      </form>
    </div>
  </div>

  <script id="jeedash-config" type="application/json" data-version="<?= htmlspecialchars($assetVersion, ENT_QUOTES, 'UTF-8') ?>"><?= json_encode([
      'theme' => $theme,
      'canEdit' => $canEdit,
      'apiBase' => $apiBase,
      'sseUrl' => $sseUrl,
      'baseUrl' => rtrim(dirname($_SERVER['REQUEST_URI']), '/'),
      'i18n' => $i18n,
  ], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>
  <?php
  include_file('desktop', 'dashx/store', 'js');
  include_file('desktop', 'dashx/widgets/widget-divider', 'js');
  include_file('desktop', 'dashx/widgets/widget-equipment', 'js');
  include_file('desktop', 'dashx/widgets/widget-scene', 'js');
  include_file('desktop', 'dashx/widgets/widget-select', 'js');
  include_file('desktop', 'dashx/widgets/widget-media', 'js');
  include_file('desktop', 'dashx/widgets/widget-electricity', 'js');
  include_file('desktop', 'dashx/widgets/widget-weather', 'js');
  include_file('desktop', 'dashx/widgets/widget-alarm', 'js');
  include_file('desktop', 'dashx/widgets/widget-fan', 'js');
  include_file('desktop', 'dashx/widgets/widget-garage', 'js');
  include_file('desktop', 'dashx/widgets/widget-message', 'js');
  include_file('desktop', 'dashx/widgets/widget-dialogue', 'js');
  include_file('desktop', 'dashx/widgets/widget-text', 'js');
  include_file('desktop', 'dashx/widgets/widget-timer', 'js');
  include_file('desktop', 'dashx/widgets/widget-hygrostat', 'js');
  include_file('desktop', 'dashx/widgets/widget-battery', 'js');
  include_file('desktop', 'dashx/widgets/widget-air-quality', 'js');
  include_file('desktop', 'dashx/widgets/widget-presence', 'js');
  include_file('desktop', 'dashx/widgets/widget-system-health', 'js');
  include_file('desktop', 'dashx/widgets/widget-light', 'js');
  include_file('desktop', 'dashx/widgets/widget-color', 'js');
  include_file('desktop', 'dashx/widgets/widget-dimmer', 'js');
  include_file('desktop', 'dashx/widgets/widget-sensor', 'js');
  include_file('desktop', 'dashx/widgets/widget-camera', 'js');
  include_file('desktop', 'dashx/widgets/widget-switch', 'js');
  include_file('desktop', 'dashx/widgets/widget-climate', 'js');
  include_file('desktop', 'dashx/widgets/widget-summary', 'js');
  include_file('desktop', 'dashx/widgets/widget-binary', 'js');
  include_file('desktop', 'dashx/widgets/widget-cover', 'js');
  include_file('desktop', 'dashx/widgets/widget-lock', 'js');
  include_file('desktop', 'dashx/widgets/widget-thermostat', 'js');
  include_file('desktop', 'dashx/widgets/widget-chart', 'js');
  include_file('desktop', 'dashx/widget-definitions', 'js');
  include_file('desktop', 'dashx/dashx', 'js');
  include_file('desktop', 'dashx/highlight', 'js');
  ?>
