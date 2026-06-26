<?php

/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

if (!isConnect()) {
	include_file('desktop', '404', 'php');
	die();
}

require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');

$plugId = 'alexaapiv2';
$plugin = plugin::byId($plugId);
$update = update::byLogicalId($plugId);
$eqLogics = eqLogic::byType($plugId);

// small config helper to avoid repeating config::byKey(...)
$configGet = function (string $key, $default = '') use ($plugId) {
	return config::byKey($key, $plugId, $default);
};

$versionJeedom = utils::o2a($update)['configuration']['version'] ?? '';
$cron_SmartHome = $configGet("cron_SmartHome");

// -------------------- Prepare object options --------------------
$objectOptions = '<option value="">{{Aucune}}</option>';
foreach (jeeObject::all() as $object) {
	$objectOptions .= sprintf(
		'<option value="%d">%s</option>',
		(int) $object->getId(),
		htmlspecialchars($object->getName(), ENT_QUOTES, 'UTF-8')
	);
}

// -------------------- Prepare routines --------------------
$listRoutinesHtml = '<option value="">Aucune</option>';
$listRoutinesRaw = $configGet("listRoutines", '');
if ($listRoutinesRaw !== '') {
	$tmp = '';
	foreach (explode(';', $listRoutinesRaw) as $element) {
		if (trim($element) === '') continue;
		$parts = explode('|', $element, 2);
		$id = $parts[0] ?? '';
		$name = $parts[1] ?? '';
		if ($id === '' || $name === '') continue;
		$tmp .= sprintf(
			'<option value="%s">%s</option>',
			htmlspecialchars($id, ENT_QUOTES, 'UTF-8'),
			htmlspecialchars($name, ENT_QUOTES, 'UTF-8')
		);
	}
	if ($tmp !== '') $listRoutinesHtml = $tmp;
}

$listRoutinesValidDebut = date("d-m-Y H:i:s", (int)$configGet("listRoutinesValidDebut", 0));
$listRoutinesValidFin   = date("d-m-Y H:i:s", (int)$configGet("listRoutinesValidFin", 0));
$listRoutinesProchain   = date("d-m-Y H:i:s", (int)$configGet("listRoutinesProchain", 0));
if ($configGet("listRoutinesValidFin") === "123") {
	$listRoutinesValidFin = $listRoutinesProchain;
}
$nbrRoutines = (int)$configGet("nbrRoutines", 100);

// -------------------- Prepare users --------------------
$listUsersRaw = $configGet("listUsers", '');
$usersHtml = '';
$sel_defaultUser = '';

if ($listUsersRaw !== '') {
	foreach (explode(';', $listUsersRaw) as $user) {
		if (trim($user) === '') continue;
		$parts = explode('|', $user, 2);
		$userId = trim($parts[0] ?? '');
		$userName = trim($parts[1] ?? '');
		if ($userName === '' || $userId === '') continue;
		$usersHtml .= sprintf(
			'<option class="opt_user" value="%s" title="%s">%s</option>',
			htmlspecialchars($userId, ENT_QUOTES, 'UTF-8'),
			htmlspecialchars($userId, ENT_QUOTES, 'UTF-8'),
			htmlspecialchars($userName, ENT_QUOTES, 'UTF-8')
		);
		$sel_defaultUser .= sprintf(
			'<option class="opt_user" value="%s" title="%s">%s</option>',
			htmlspecialchars($userId, ENT_QUOTES, 'UTF-8'),
			htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'),
			htmlspecialchars($userName, ENT_QUOTES, 'UTF-8')
		);
	}
}
// -------------------- Prepare devices --------------------
$deviceOptions = '<option value="">{{Aucun}}</option>';
$defaultDevice = $configGet('defaultDevice', '');
foreach ($eqLogics as $eqLogic) {
	$intType = $eqLogic->getConfiguration('intType');
	$family = $eqLogic->getConfiguration('family');
	if ($intType !== 'Device' || in_array($family, ['WHA', 'FIRE_TV', 'TABLET', 'VOX', 'ALEXA_APP'])) continue;
	$serial = $eqLogic->getConfiguration('serialNumber');
	$deviceOptions .= sprintf(
		'<option value="%s"%s>%s</option>',
		htmlspecialchars($serial, ENT_QUOTES, 'UTF-8'),
		($serial === $defaultDevice) ? ' selected' : '',
		htmlspecialchars($eqLogic->getName(), ENT_QUOTES, 'UTF-8')
	);
}

// -------------------- Prepare Account Linking --------------------
$oauthHelperFile = dirname(__FILE__) . '/../core/php/_oauth_helper.php';
if (file_exists($oauthHelperFile)) {
	require_once $oauthHelperFile;
	$al_clientId   = shp_oauth_client_id();
	$al_configured = ($al_clientId !== '');
	$al_extUrl     = rtrim(network::getNetworkAccess('external'), '/');
	$al_authUrl    = $al_extUrl ? ($al_extUrl . '/plugins/alexaapiv2/core/php/oauth/authorize.php') : '';
	$al_tokenUrl   = $al_extUrl ? ($al_extUrl . '/plugins/alexaapiv2/core/php/oauth/token.php') : '';
} else {
	$al_configured = false;
	$al_clientId   = '';
	$al_authUrl    = '';
	$al_tokenUrl   = '';
}

// -------------------- Prepare manufacturers --------------------
$manufacturers = [];
foreach (eqLogic::byTypeAndSearchConfiguration($plugId, ["intType" => 'SmartHome']) as $eqSmartHome) {
	$m = $eqSmartHome->getConfiguration('manufacturerName', '');
	if ($m !== '' && $m !== "Jeedom") {
		$manufacturers[$m] = true;
	}
}
$manufacturers = array_keys($manufacturers);
sort($manufacturers, SORT_NATURAL | SORT_FLAG_CASE);

?>


<!-- Génération du cookie -->
<form class="form-horizontal" style="text-align:center;">

	<fieldset>
		<legend><i class="icon divers-triangular42"></i> {{Génération du cookie Amazon}}</legend>
		<!-- Actual cookie state -->
		<div class="div_cookieState">
			<span class="btn btn-success btn-sm bt_cookieState disabled" style="opacity: 1"><i class="fas fa-check"></i> {{Cookie d'identification Amazon Ok}} </span><span style="display:none">'</span>
			<span class="btn btn-info btn-sm bt_cookieInfos disabled" style="opacity: 1"><i class="fas fa-check"></i>
			</span>
		</div>

		<!-- Session status panel (P1 daemon / P2 PHP) -->
		<div class="div_authStatus" style="display:none; margin:10px auto; max-width:650px;">
			<table class="table table-condensed" style="margin-bottom:5px; font-size:12px;">
				<thead>
					<tr>
						<th style="width:170px" title="{{Profil de session Amazon (P1 = daemon Node.js, P2 = PHP)}}">{{Session}}</th>
						<th title="{{État de la connexion Amazon (OK, Invalide, Absent, Injoignable)}}">{{Statut}}</th>
						<th title="{{Temps restant avant expiration du Bearer Token (refresh automatique quand < 5 min)}}">{{Bearer TTL}}</th>
						<th title="{{Date de dernière mise à jour des tokens d'authentification}}">{{Mis à jour}}</th>
					</tr>
				</thead>
				<tbody>
					<tr id="auth_daemon_row">
						<td title="{{Session principale — maintenue par le daemon Node.js (refresh automatique)}}"><b>P1</b> (Daemon)</td>
						<td class="auth-status-cell">—</td>
						<td class="auth-bearer-cell">—</td>
						<td class="auth-date-cell">—</td>
					</tr>
					<tr id="auth_php_row">
						<td title="{{Session secondaire — maintenue par PHP (fallback si daemon indisponible)}}"><b>P2</b> (PHP)</td>
						<td class="auth-status-cell">—</td>
						<td class="auth-bearer-cell">—</td>
						<td class="auth-date-cell">—</td>
					</tr>
					<tr id="auth_com_row">
						<td title="{{Cookie .amazon.com (at-main/x-main) — 3ème voie /api/behaviors/preview, dilue les quotas 429}}"><b>P2</b> comCookie</td>
						<td class="auth-status-cell">—</td>
						<td class="auth-bearer-cell" title="{{Âge du comCookie — refresh auto si > 6h}}">—</td>
						<td class="auth-date-cell">—</td>
					</tr>
					<tr id="auth_actor_row">
						<td title="{{Cookie actor — session déléguée du principal via secUserData. 4ème voie /api/behaviors/preview}}"><b>P2</b> actorCookie</td>
						<td class="auth-status-cell">—</td>
						<td class="auth-bearer-cell" title="{{Âge du actorCookie — refresh auto si > 6h}}">—</td>
						<td class="auth-date-cell">—</td>
					</tr>
				</tbody>
			</table>
			<a class="btn btn-default btn-xs bt_checkAuthLive"><i class="fas fa-stethoscope"></i> {{Tester la connexion Amazon}}</a>
			<span class="auth-live-result" style="margin-left:8px; font-size:12px;"></span>
		</div>

		<!-- Generate_cookie_process state -->
		<div class="div_generateState">
			<span class="btn btn-sm bt_progress tippie" style="min-width: 300px;display:none" data-title="Avancement">
				<i class="fas fa-spinner fa-spin"></i>
				<span class="bt_ProcessState"></span>
				<br>
			</span>
			<span class="btn btn-danger btn-sm bt_waitingCookieFail" style="display:none"><i class="fas fa-times"></i> {{La génération du Cookie Amazon a échoué}} </span>

			<span class="btn btn-default btn-sm bt_identificationCookieEnd" style="display:none"><i class="fas fa-spinner fa-spin"></i> {{Cliquez ici quand vous avez terminé l'identification}} </a><span style="display:none">'</span>

		</div>
		<!-- Generate_cookie actions -->

		<div class="div_cookieActions" style="margin-top:5px">

			<a class="btn btn-success btn-sm bt_startDeamonCookie" style="display:none">
				{{Identifiez-vous sur Amazon pour créer le cookie}} </a>
			<a class="btn btn-danger btn-sm manualCookielink" target="_blank" id="bt_manualCookielink" rel="noopener noreferrer" href="http://your_url_here.html" style="display:none"> <i class="fas fa-terminal"></i>
				Lien d'authentification<span style="display:none">'</span></a>
			<a class="btn btn-warning btn-sm bt_regenerateCookie" style="display:none"><i class="fas fa-recycle"></i>
				{{Régénérer le cookie}} </a>
			<a class="btn btn-danger  btn-sm bt_removeCookie" style="display:none"><i class="fas fa-minus-circle"></i>
				{{Supprimer le cookie}} </a>
			<a class="btn btn-default btn-sm bt_authForm" style=""><i class="icon fab fa-amazon"></i> {{Auth}} </a>

		</div>



		<br>
		<b>{{Note}}</b>:
		<small> {{Cette fonctionnalité n'est necessaire qu'a l'installation du plugin ou en cas de probleme, le plugin prend ensuite en charge la regeneration du cookie}}.
			<br>{{La génération manuelle doit se faire depuis un ordinateur se trouvant sur le même réseau local que votre jeedom. (Pas d'accès à distance)}}
		</small>
	</fieldset>
</form>


<br>

<!-- Options du plugin -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="icon nature-planet5"></i> {{Options du plugin}}</legend>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="amazonserver">{{Serveur Amazon}}</label>
			<div class="col-sm-2">
				<select class="configKey form-control" data-l1key="amazonserver" id="amazonserver">
					<option value="amazon.com" selected>Amazon.com (USA)</option>
					<option value="amazon.fr">Amazon.fr (France)</option>
					<option value="amazon.de">Amazon.de (Allemagne)</option>
					<option value="amazon.co.uk">Amazon.co.uk (Royaume-Uni)</option>
					<option value="amazon.it">Amazon.it (Italie)</option>
					<option value="amazon.es">Amazon.es (Espagne)</option>
					<option value="amazon.ca">Amazon.ca (Canada)</option>
					<option value="amazon.com.au">Amazon.com.au (Australie)</option>
					<option value="amazon.nl">Amazon.nl (Pays-Bas)</option>
					<option value="amazon.se">Amazon.se (Suede)</option>
					<option value="amazon.pl">Amazon.pl (Pologne)</option>
				</select>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="voiceHistory_chk">{{Activer l'historique vocal}}</label><span style="display:none">'</span>
			<div class="col-sm-2">
				<input type="checkbox" class="configKey tippied" data-l1key="voiceHistory_chk" id="voiceHistory_chk" data-title="Activer la récuperation de l'historique vocal">
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="shCron_chk">{{Désactiver le cron SmartHome}}</label>
			<div class="col-sm-2">
				<input type="checkbox" class="configKey tippied" data-l1key="disableShCron" id="shCron_chk" data-title="Bloque le cron des équipements SmartHome">
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="cronInput">{{Cron des équipements SmartHome}}</label>
			<div class="col-sm-2">
				<div class="input-group">
					<input type="text" class="configKey form-control roundedLeft" data-l1key="cron_SmartHome" id="cronInput" placeholder="expression cron">
					<span class="input-group-btn">
						<a class="btn btn-default cursor jeeHelper roundedRight" data-helper="cron" data-title="Assistant cron">
							<i class="fas fa-question-circle"></i>
						</a>
					</span>
				</div>
			</div>
		</div>


		<div class="form-group">
			<label class="col-sm-4 control-label" for="sel_object">{{Choisir l'appareil par défaut}}</label><span style="display:none">'</span>
			<div class="col-sm-2">
				<select id="sel_defaultDevice" class="configKey form-control" data-l1key="defaultDevice" title="{{L'appareil défini ici est celui qui annoncera les soucis ou qui sera utilisé par défaut. Choisir celui qui est dans la pièce de vie. Eviter les Fire TV, groupes ...}}">
					<?= $deviceOptions ?>
				</select>
			</div>
		</div>


		<div class="form-group">
			<label class="col-sm-4 control-label" for="sel_defaultParentObject">{{Ajouter automatiquement les équipements détectés à}}</label>
			<div class="col-sm-2">
				<select id="sel_defaultParentObject" class="configKey form-control" data-l1key="defaultParentObject">
					<?= $objectOptions ?>
				</select>
			</div>
		</div>

		<div class="form-group">
			<label class="col-sm-4 control-label" for="sel_defaultUser">{{Utilisateur par defaut}}</label>
			<div class="col-sm-2">
				<select id="sel_defaultUser" class="configKey form-control" data-l1key="sel_defaultUser">
					<?= $sel_defaultUser ?>
				</select>
			</div>
		</div>

		<div class="form-group">
			<label class="col-sm-4 control-label" for="utilisateurExperimente">{{Activer les fonctions réservées aux utilisateurs expérimentés}}</label>
			<div class="col-sm-3">
				<input type="checkbox" class="configKey" data-l1key="utilisateurExperimente" id="utilisateurExperimente" />
			</div>
		</div>


	</fieldset>
</form>
<br>

<!-- Skill Alexa -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="fas fa-question"></i> {{Skill Alexa ASK}}</legend>
		<label class="col-sm-3 control-label" for="idSkill">{{ID du Skill ASK}}</label>
		<div class="col-sm-4" style="width: 390px !important;">
			<input type="text" class="configKey tippied" style="width:100%;" id="idSkill" data-l1key="idSkill" data-title="Veuillez vous référer à la documentation pour créer votre Skill ASK">

		</div>
		<div class="col-sm-2">
			<i class="icon fas fa-times-circle pull-left" id="imgStatusSkill" style="font-size: large;margin: 4px 6px 0px -10px;" title="checking..."></i>
			<a class="btn btn-default btn-sm pull-left" id="bt_askTest"><i class="fas fa-sync"></i> {{Tester}}</a>
			<input type="hidden" class="configKey" style="width:100%" id="skillPresent" data-l1key="skillPresent" />
			<a class="btn btn-default btn-sm pull-left" id="bt_askParams">{{Params}}</a>
		</div>
	</fieldset>
</form>
<br>

<!-- Account Linking OAuth -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="fas fa-link"></i> {{Account Linking (Alexa → Jeedom)}}</legend>
		<div class="form-group">
			<label class="col-sm-3 control-label" style="padding-top:6px; line-height:20px;">{{Statut}}</label>
			<div class="col-sm-8" style="padding-top:6px; line-height:20px;">
				<?php if ($al_configured): ?>
					<span style="color:#27ae60;"><i class="fas fa-check-circle"></i> {{Configuré}}</span>
					<span style="font-size:11px; color:var(--text-color-secondary,#888); margin-left:8px;">client_id: <?= htmlspecialchars(substr($al_clientId, 0, 8), ENT_QUOTES) ?>…</span>
				<?php else: ?>
					<span style="color:#e67e22;"><i class="fas fa-exclamation-circle"></i> {{Non configuré — déployer le skill pour initialiser}}</span>
				<?php endif; ?>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-3 control-label">{{Skill Alexa}}</label>
			<div class="col-sm-8" style="padding-top:4px;">
				<button type="button" class="btn btn-sm btn-default" onclick="alCheckStatus()">
					<i class="fas fa-search"></i> {{Vérifier l'état}}
				</button>
				<button type="button" class="btn btn-sm btn-success" onclick="alSetAccountLinking()" style="margin-left:4px;">
					<i class="fas fa-link"></i> {{Configurer sur Alexa}}
				</button>
				<button type="button" class="btn btn-sm btn-danger" onclick="alDeleteAccountLinking()" style="margin-left:4px;">
					<i class="fas fa-unlink"></i> {{Supprimer d'Alexa}}
				</button>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-3 control-label"></label>
			<div class="col-sm-8">
				<div id="al-status-result" class="alert alert-info" style="display:none; margin:4px 0 0; padding:8px 10px;"></div>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-3 control-label"></label>
			<div class="col-sm-8" style="padding-top:4px; font-size:12px; color:var(--text-color-secondary,#888);">
				{{La configuration Account Linking est appliquée automatiquement sur le skill premiumAsk. L'utilisateur lie son compte depuis l'app Alexa.}}
			</div>
		</div>
	</fieldset>
</form>
<br>

<!-- Voice Query LLM -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="fas fa-robot"></i> {{Voice Query — IA via ai_assistant}}</legend>
		<div class="form-group">
			<label class="col-sm-4 control-label" style="padding-top:6px; line-height:20px;">{{Provider LLM}}</label>
			<div class="col-sm-7" style="padding-top:6px; line-height:20px; font-size:12px; color:var(--text-color-secondary, #888);">
				{{Utilise le provider par défaut configuré dans le plugin ai_assistant (Claude, Gemini, Ollama…). Aucune clé API à saisir ici.}}
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="alexavoice_llm_voice">{{Activer LLM Voice Query dans le skill ASK}}</label>
			<div class="col-sm-2">
				<input type="checkbox" class="configKey" id="alexavoice_llm_voice"
					data-l1key="alexavoice_llm_voice"
					title="{{Si coché, le skill premiumAsk utilisera voiceQuery.php (LLM via ai_assistant) au lieu de voiceControl.php — redéployer le skill après activation}}">
			</div>
			<div class="col-sm-5" style="padding-top:6px; font-size:12px; color:var(--text-color-secondary, #888);">
				{{Redéployer le skill après modification}}
			</div>
		</div>
	</fieldset>
</form>
<br>

<!-- Protection du sommeil -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="fas fa-bed"></i> {{Protection du sommeil}}</legend>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="dodo">{{Activer le silence la nuit}}</label>
			<div class="col-sm-3">
				<input type="checkbox" class="configKey" data-l1key="dodo" id="dodo" title="{{Bloque les commandes durant la plage spécifiée}}" />
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="dododebut">{{Heure de début (22 par défaut)}}</label>
			<div class="col-sm-1">
				<input type="number" class="configKey form-control" data-l1key="dododebut" id="dododebut" placeholder="{{22}}" />
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-4 control-label" for="dodofin">{{Heure de fin (07 par défaut)}}</label>
			<div class="col-sm-1">
				<input type="number" class="configKey form-control" data-l1key="dodofin" id="dodofin" placeholder="{{07}}" />
			</div>
		</div>
	</fieldset>
</form>

<!--  Utilisateurs Alexa -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="fas fa-project-diagram"></i> {{Utilisateurs Alexa}}</legend>
		<label class="col-sm-4 control-label" for="userList">{{Liste des Utilisateurs}}</label>
		<div class="col-sm-4" style="background: var(--form-bg-color) !important;height:100px; overflow: auto;">
			<?= $usersHtml ?>
		</div>
		<div class="col-sm-5">
			<span style="display:none;" class=""></span>
		</div>
	</fieldset>
</form>
<br>

<!-- Activer/Désactiver fabriquants -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="far fa-check-square"></i> {{Activer/Désactiver les équipements smartHome de certains fabriquants}}</legend>
		<div class="form-group">
			<div class="col-sm-1 control-label"></div>
			<div class="col-sm-10 control-label" style="text-align: center !important;">
				<?php // The labels are associated with inputs inside the loop
				foreach ($manufacturers as $manufacturer) {
					$manufacturerID = str_replace(" ", "_", $manufacturer);
					echo '<label class="checkbox-inline">';
					echo '<input type="checkbox" class="configKey" id="fabriquants" data-l1key="fabriquant_' . $manufacturerID . '"/>' . $manufacturer;
					echo '</label>';
				}
				?>
			</div>
			<div class="col-sm-1 control-label"></div>
			<br>
			<label class="col-sm-5 control-label"></label>
			<div class="col-sm-3">
				<a class="btn btn-success bt_desactiverFabriquants"><i class="far fa-check-square"></i> {{Activer uniquement les fabriquants cochés}}</a>
			</div>
			<label class="col-sm-4 control-label"></label>
		</div>
	</fieldset>
</form>
<br>

<br>

<!-- Réparations -->
<form class="form-horizontal">
	<fieldset>
		<legend><i class="icon nature-planet5"></i> {{Réparations}}</legend>
		<div class="form-group" style="text-align:center;">
			<a class="btn btn-danger btn-sm" id="bt_reinstallNodeJS"><i class="fas fa-recycle"></i> {{Réparation de NodeJS}}</a>
			<a class="btn btn-warning btn-sm " id="bt_refreshAlleqCmds" title="{{Recharger la configuration par défaut de toutes les commandes}}"><i class="fas fa-search"></i> {{Reset des commandes}}</a>

		</div>


	</fieldset>
</form>
<br>

<!-- ======================= END HTML ======================= -->



<script>
	(() => {
		// =========================
		// Config
		// =========================
		const POPUP_TIMEOUT_SECONDS = 180;
		const PLUGIN_ID = '<?= $plugId ?>';

		// Global-ish state
		let authWindow = null;
		let popupWatchTimer = null;
		let popupOpenTimestamp = null;

		// Helpers
		const qs = sel => document.querySelector(sel);
		const qsa = sel => document.querySelectorAll(sel);
		const show = (...sels) => sels.forEach(s => qsa(s).forEach(el => el.style.display = 'inline-block'));
		const escHtml = str => {
			const d = document.createElement('div');
			d.textContent = String(str ?? '');
			return d.innerHTML;
		};
		const hide = (...sels) => sels.forEach(s => qsa(s).forEach(el => el.style.display = 'none'));
		const setHtml = (sel, val) => {
			const el = qs(sel);
			if (el) el.innerHTML = val;
		};
		const setText = (sel, val) => {
			const el = qs(sel);
			if (el) el.innerText = val;
		};
		const alertMsg = (msg, level = 'info') => jeedomUtils.showAlert({
			message: msg,
			level
		});

		/**
		 * AJAX call using domUtils.ajax (Jeedom native, CSRF-safe).
		 * Returns a Promise for async/await usage.
		 */
		function ajaxCall(action, data = {}, showLoader = false) {
			return new Promise(function(resolve, reject) {
				domUtils.ajax({
					type: 'POST',
					url: 'plugins/alexaapiv2/core/ajax/alexaapiv2.ajax.php',
					data: Object.assign({
						action: action
					}, data),
					dataType: 'json',
					global: showLoader, // false = no Jeedom spinner
					error: function(request, status, error) {
						reject(new Error(error || status || 'Network error'));
					},
					success: function(data) {
						resolve(data);
					}
				});
			});
		}

		// =========================
		// Configuration
		// =========================
		const POLL_CONFIG = {
			MAX_ATTEMPTS: 8,
			INTERVAL_MS: 2000
		};

		const UI_MESSAGES = {
			COOKIE_DETECTED: 'Cookie détecté — Auth OK',
			COOKIE_CHECKING: 'Vérification cookie en cours...',
			COOKIE_NOT_FOUND: 'Échec : cookie introuvable',
			SKILL_ID_EMPTY: 'Skill id vide'
		};

		// =========================
		// State management
		// =========================
		const state = {
			isPolling: false,
			pollTimer: null,
			pollAttempts: 0,
			cookiePresent: 0,
			shouldStopPolling: false // Flag pour arrêter le polling
		};

		// =========================
		// Cookie verification
		// =========================
		async function checkCookieFile(showErrors = false) {
			try {
				const data = await ajaxCall('VerifiePresenceCookie');

				if (data?.state === 'ok') {
					updateCookieInfo(data.result);
					return true;
				}

				// Only show alert when explicitly requested (user action, not polling)
				if (showErrors && data?.result) {
					alertMsg(`VerifiePresenceCookie: ${data.result}`, 'warning');
				}

				return false;
			} catch (error) {
				return false;
			}
		}

		function updateCookieInfo(result) {
			const dateInfo = result?.bt_cookieInfos || result?.tokenDate;
			if (!dateInfo) return;

			const label = result?.bt_cookieInfos ?
				"{{Cookies mis à jour le : }}" :
				"{{Cookies créés le : }}";

			setHtml('.bt_cookieInfos', `${label} ${dateInfo}`);
			show('.bt_cookieInfos');

			// Update dual session panel if data available
			if (result?.daemon || result?.php) {
				updateAuthStatusPanel(result.daemon || null, result.php || null, result.com || null, result.actor || null);
			}
		}

		function formatBearerTTL(ttl) {
			if (ttl === null || ttl === undefined) return '—';
			if (ttl <= 0) return '<span style="color:var(--al-danger-color, #e74c3c)">{{Expiré}}</span>';
			let txt;
			if (ttl < 300) {
				txt = `<span style="color:var(--al-warning-color, #f39c12)">${Math.round(ttl / 60)} min</span>`;
			} else {
				const h = Math.floor(ttl / 3600);
				const m = Math.round((ttl % 3600) / 60);
				txt = h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m} min`;
			}
			return `<i class="fas fa-clock" style="opacity:.4;margin-right:3px"></i>${txt}`;
		}

		function statusBadge(status) {
			const map = {
				ok: '<span class="label label-success">OK</span>',
				failed: '<span class="label label-danger">{{Invalide}}</span>',
				invalid: '<span class="label label-danger">{{Invalide}}</span>',
				absent: '<span class="label label-default">{{Absent}}</span>',
				unreachable: '<span class="label label-warning">{{Injoignable}}</span>',
				unknown: '<span class="label label-default">—</span>',
			};
			return map[status] || `<span class="label label-default">${escHtml(status)}</span>`;
		}

		function fillRowCells(row, status, bearerTTL, date) {
			if (!row) return;
			const s = row.querySelector('.auth-status-cell');
			const b = row.querySelector('.auth-bearer-cell');
			const d = row.querySelector('.auth-date-cell');
			if (s) s.innerHTML = statusBadge(status);
			if (b) {
				b.innerHTML = formatBearerTTL(bearerTTL);
				b.title = (bearerTTL !== null && bearerTTL !== undefined) ?
					`Expire dans ${bearerTTL}s — refresh auto si < 300s` :
					'Non disponible';
			}
			if (d) d.textContent = date || '—';
		}

		function formatAge(ageSec) {
			if (ageSec === null || ageSec === undefined) return '—';
			if (ageSec < 60) return ageSec + 's';
			if (ageSec < 3600) return Math.floor(ageSec / 60) + ' min';
			return Math.floor(ageSec / 3600) + 'h ' + Math.floor((ageSec % 3600) / 60) + 'min';
		}

		function fillCookieRowCells(row, status, ageSec, date) {
			if (!row) return;
			const s = row.querySelector('.auth-status-cell');
			const b = row.querySelector('.auth-bearer-cell');
			const d = row.querySelector('.auth-date-cell');
			if (s) s.innerHTML = statusBadge(status);
			if (b) {
				b.innerHTML = '<i class="fas fa-clock" style="opacity:.4;margin-right:3px"></i>' + formatAge(ageSec);
				b.title = ageSec !== null && ageSec !== undefined ? `Cookie créé il y a ${ageSec}s — refresh auto si > 6h` : 'Non disponible';
			}
			if (d) d.textContent = date || '—';
		}

		function updateAuthStatusPanel(daemon, php, com, actor) {
			const panel = qs('.div_authStatus');
			if (!panel) return;
			panel.style.display = 'block';

			if (daemon) fillRowCells(qs('#auth_daemon_row'), daemon.status, daemon.bearerTTL, daemon.tokenDate);
			if (php) fillRowCells(qs('#auth_php_row'), php.status, php.bearerTTL, php.lastUpdate);
			if (com) fillCookieRowCells(qs('#auth_com_row'), com.status, com.ageSec, com.lastUpdate);
			if (actor) fillCookieRowCells(qs('#auth_actor_row'), actor.status, actor.ageSec, actor.lastUpdate);
		}

		// =========================
		// Skill verification
		// =========================
		async function checkSkillAsk() {
			const idSkill = qs('#idSkill').value.trim();
			const img = qs('#imgStatusSkill');

			if (!idSkill) {
				updateSkillStatus(img, 0, 'times-circle', 'danger', UI_MESSAGES.SKILL_ID_EMPTY);
				return false;
			}

			try {
				const data = await ajaxCall('checkSkillAsk', {
					idSkill
				});

				if (data?.state === 'ok') {
					updateSkillStatus(img, 1, 'check-circle', 'success', 'Ok');
					return 'ok';
				}

				if (data?.result) {
					updateSkillStatus(img, 0, 'times-circle', 'warning', data.result);
					return data.result;
				}

				return false;
			} catch (error) {
				// Skill check error handled silently
				return false;
			}
		}

		function updateSkillStatus(img, skillPresent, iconType, colorType, title) {
			qs('#skillPresent').value = skillPresent;
			img.className = `icon fas fa-${iconType} pull-left`;
			img.style.color = `var(--al-${colorType}-color)`;
			img.title = title;
		}

		// =========================
		// UI state management
		// =========================
		function onCookieFound() {
			state.cookiePresent = 1;
			state.pollAttempts = 0;
			state.shouldStopPolling = true;
			stopPolling();

			show('.div_cookieState', '.bt_cookieState', '.bt_cookieInfos', '.bt_regenerateCookie');
			hide('.div_generateState', '.bt_startDeamonCookie', '.bt_waitingCookieFail');
			// Restore green state
			qsa('.bt_cookieState').forEach(function(el) {
				el.classList.remove('btn-danger', 'btn-warning');
				el.classList.add('btn-success');
			});
			setHtml('.bt_cookieState', '<i class="fas fa-check"></i> {{Cookie d\'identification Amazon Ok}}');
			setText('.bt_ProcessState', UI_MESSAGES.COOKIE_DETECTED);
		}

		async function checkAuthLive() {
			const resultEl = qs('.auth-live-result');
			if (resultEl) resultEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> {{Test en cours...}}';
			try {
				const data = await ajaxCall('checkAuthLive');
				if (!data?.result) throw new Error('No response');
				const r = data.result;
				const daemonStatus = r.daemon?.status || r.daemon || 'unknown';
				const phpStatus = r.php?.status || r.php || 'unknown';

				// Update panel rows with live status
				fillRowCells(qs('#auth_daemon_row'), daemonStatus, r.daemon?.bearerTTL, r.daemon?.tokenDate);
				fillRowCells(qs('#auth_php_row'), phpStatus, r.php?.bearerTTL, r.php?.lastUpdate);

				let msg = '';
				if (daemonStatus === 'ok' && phpStatus === 'ok') {
					msg = '<span style="color:var(--al-success-color, #27ae60)"><i class="fas fa-check-circle"></i> {{Les deux sessions sont valides}}</span>';
				} else if (daemonStatus === 'ok' || phpStatus === 'ok') {
					const active = daemonStatus === 'ok' ? 'Daemon (P1)' : 'PHP (P2)';
					const failed = daemonStatus !== 'ok' ? 'Daemon (P1)' : 'PHP (P2)';
					msg = `<span style="color:var(--al-warning-color, #f39c12)"><i class="fas fa-exclamation-triangle"></i> ${active} OK — ${failed} {{en échec}}</span>`;
					qsa('.bt_cookieState').forEach(function(el) {
						el.classList.remove('btn-success', 'btn-danger');
						el.classList.add('btn-warning');
					});
					setHtml('.bt_cookieState', '<i class="fas fa-exclamation-triangle"></i> {{Session partiellement valide}}');
				} else {
					msg = '<span style="color:var(--al-danger-color, #e74c3c)"><i class="fas fa-times-circle"></i> {{Aucune session valide}}</span>';
					const dErr = r.daemon?.error || r.daemonError;
					const pErr = r.php?.error || r.phpError;
					const pCode = r.php?.phpCode || r.phpCode;
					if (dErr) msg += `<br><small>Daemon: ${escHtml(dErr)}</small>`;
					if (pErr) msg += `<br><small>PHP: ${escHtml(pErr)}</small>`;
					if (pCode === 403) msg += '<br><small>{{Amazon refuse la connexion (403) — régénérez le cookie}}</small>';
					qsa('.bt_cookieState').forEach(function(el) {
						el.classList.remove('btn-success', 'btn-warning');
						el.classList.add('btn-danger');
					});
					setHtml('.bt_cookieState', '<i class="fas fa-times"></i> {{Authentification échouée}}');
					show('.bt_regenerateCookie');
				}
				if (resultEl) resultEl.innerHTML = msg;
			} catch (e) {
				if (resultEl) resultEl.innerHTML = '<span style="color:var(--al-danger-color, #e74c3c)">{{Erreur}}: ' + escHtml(e.message || e) + '</span>';
			}
		}

		function onPollingTimeout() {
			state.shouldStopPolling = true; // Signal d'arrêt
			stopPolling();
			show('.bt_waitingCookieFail');
			hide('.bt_progress');

			setText('.bt_ProcessState', UI_MESSAGES.COOKIE_NOT_FOUND);
		}

		// =========================
		// Polling logic
		// =========================
		async function pollForCookie() {
			// Vérifier si on doit arrêter avant de commencer
			if (state.shouldStopPolling || state.isPolling) {
				return;
			}

			state.isPolling = true;

			try {
				const found = await checkCookieFile();

				if (found) {
					onCookieFound();
					return;
				}

				state.pollAttempts++;

				if (state.pollAttempts >= POLL_CONFIG.MAX_ATTEMPTS) {
					onPollingTimeout();
				} else {
					hide('.bt_identificationCookieEnd');
				}
			} finally {
				state.isPolling = false;
			}
		}

		function startPolling() {
			// Réinitialiser complètement l'état avant de démarrer
			stopPolling();
			resetPollingState();
			updatePollingUI();

			state.pollTimer = setInterval(pollForCookie, POLL_CONFIG.INTERVAL_MS);
			pollForCookie(); // Execute immediately
		}

		function stopPolling() {
			if (state.pollTimer) {
				clearInterval(state.pollTimer);
				state.pollTimer = null;
			}
		}

		function resetPollingState() {
			state.pollAttempts = 0;
			state.cookiePresent = 0;
			state.shouldStopPolling = false; // Réinitialiser le flag
		}

		function updatePollingUI() {
			hide('.div_cookieState');
			show('.bt_progress');
			setText('.bt_ProcessState', UI_MESSAGES.COOKIE_CHECKING);
		}

		// =========================
		// Popup handling
		// =========================
		function openAuthWindow() {
			const left = Math.round(window.screen.width / 2 - 240);
			const top = Math.round(window.screen.height / 2 - 350);
			const rnd = Math.floor(Math.random() * 100000);
			const url = "http://<?php print htmlspecialchars(config::byKey('internalAddr'), ENT_QUOTES, 'UTF-8') ?>:3477";

			setText('.bt_ProcessState', 'Ouverture de la fenêtre...');
			authWindow = window.open(
				url,
				`_blank${rnd}`,
				`status=no,height=700,width=480,resizable=yes,left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
			);

			if (!authWindow) {
				setText('.bt_ProcessState', 'Ouverture de la fenêtre impossible');
				alertMsg("⚠️ Votre navigateur bloque la fenêtre d'authentification !<br>👉 Cliquez sur <b>'Lien Authentification'</b> pour continuer.", 'danger');
				const link = qs('#bt_manualCookielink');
				if (link) {
					link.href = url;
					link.style.display = 'inline-block';
					setText('.bt_ProcessState', 'Lien authentification Manuel');
				}
				return;
			}

			// Start watching popup and start polling only after it closes
			popupOpenTimestamp = Date.now();
			setText('.bt_ProcessState', 'Authentification en attente...');
			// Clear any previous timers
			if (popupWatchTimer) {
				clearInterval(popupWatchTimer);
				popupWatchTimer = null;
			}

			popupWatchTimer = setInterval(() => {
				const elapsedSeconds = Math.floor((Date.now() - popupOpenTimestamp) / 1000);

				// If popup timed out
				if (elapsedSeconds > POPUP_TIMEOUT_SECONDS) {
					try {
						authWindow.close();
					} catch (e) {}
					clearInterval(popupWatchTimer);
					popupWatchTimer = null;
					stopPolling();
					show('.bt_waitingCookieFail');
					setText('.bt_ProcessState', 'Delai dépassé...Fermeture de la fenêtre!');

					return;
				}

				// if user closed popup -> wait for cookie write, poll, then stop daemon
				if (authWindow.closed) {
					clearInterval(popupWatchTimer);
					popupWatchTimer = null;
					setText('.bt_ProcessState', 'Fenêtre fermée — vérification du cookie...');
					// Give getCookie.js 1.5s to finish writing the cookie file
					setTimeout(() => {
						startPolling();
						// Stop cookie daemon after polling completes (cookie already saved)
						setTimeout(stopDeamonCookie, 6000);
					}, 1500);
				}
			}, 500);
		}

		// =========================
		// Public actions: start/regen buttons should call this
		// =========================
		async function startDaemonAndOpenPopup({
			debug = 0,
			forceRestart = 0
		} = {}) {
			show('.bt_progress');
			hide('.div_cookieState', '.bt_regenerateCookie', '.bt_startDeamonCookie');
			setText('.bt_ProcessState', 'Démarrage du daemon cookie...');

			try {
				const result = await ajaxCall('startDeamonCookie', {
					id: PLUGIN_ID,
					debug,
					forceRestart
				});
				if (result.state === 'ok') {
					setText('.bt_ProcessState', 'Daemon cookie démarré — ouverture auth...');
					setTimeout(openAuthWindow, 800);
				} else {
					setText('.bt_ProcessState', 'Échec démarrage daemon cookie');
					alertMsg('Échec du démarrage du daemon cookie', 'danger');
					show('.bt_startDeamonCookie');
				}
			} catch (e) {
				setText('.bt_ProcessState', 'Erreur daemon cookie');
				alertMsg(e.message || 'Erreur démarrage daemon', 'danger');
				show('.bt_startDeamonCookie');
			}
		}

		async function stopDeamonCookie() {
			try {
				await ajaxCall('stopDeamonCookie', {
					id: PLUGIN_ID
				});
			} catch (e) {
				/* silent */ }
		}
		// ==========================================================
		// 🛠️ ACTIONS BOOTBOX CONFIRM
		// ==========================================================
		function confirmAction(title, message, action, successMsg) {
			jeeDialog.confirm({
				title,
				message,
				callback: async result => {
					if (!result) return;
					domUtils.showLoading();
					try {
						await ajaxCall(action);
						alertMsg(successMsg, 'success');
					} catch (e) {
						alertMsg(e.message, 'danger');
					} finally {
						domUtils.hideLoading();
					}
				}
			});
		}

		// Ouvrir le formulaire d'ajout
		function openAuthForm() {
			jeeDialog.dialog({
				minHeight: 260,
				height: 260,
				minWidth: 700,
				width: 800,
				id: 'md_auth',
				title: '{{Autentification Amazon}}',
				contentUrl: 'index.php?v=d&plugin=alexaapiv2&modal=auth&id=alexaapiv2'
			});
		}
		// =========================
		// Wiring to existing buttons / handlers
		// =========================
		{ // UI wiring
			async function initView() {
				let present = await checkCookieFile();
				if (present) {
					state.cookiePresent = 1;
					show('.div_cookieState', '.bt_regenerateCookie');
					hide('.bt_startDeamonCookie', '.bt_progress', '.bt_waitingCookieFail');
					setHtml('.bt_cookieState', '<i class="fas fa-check"></i> {{Cookie d\'identification Amazon Ok}}');
				} else {
					state.cookiePresent = 0;
					hide('.bt_regenerateCookie', '.bt_progress', '.bt_cookieInfos');
					show('.bt_startDeamonCookie');
					setHtml('.bt_cookieState', '<i class="fas fa-exclamation-triangle"></i> {{Cookie absent ou invalide}}');
					show('.div_cookieState');
					qsa('.bt_cookieState').forEach(function(el) {
						el.classList.remove('btn-success');
						el.classList.add('btn-danger');
					});
				}
			}

			qs('.bt_checkAuthLive')?.addEventListener('click', function(e) {
				e.preventDefault();
				checkAuthLive();
			});
			// Defer skill check until after render is complete
			requestAnimationFrame(() => {
				setTimeout(checkSkillAsk, 500);
			});
			qs('#bt_askParams')?.addEventListener('click', () => {
				jeeDialog.dialog({
					minHeight: 200,
					height: 300,
					minWidth: 800,
					width: 900,
					id: 'md_askParams',
					title: '{{Paramètres à renseigner dans le code du skill ASK}}',
					contentUrl: 'index.php?v=d&plugin=alexaapiv2&modal=askParams'
				});
			});

			qs('.bt_authForm')?.addEventListener('click', function(e) {
				e.preventDefault();
				openAuthForm(e);
				return;
			});

			// Both buttons trigger the same flow (start daemon + open auth popup)
			async function handleCookieGeneration() {
				await startDaemonAndOpenPopup({
					forceRestart: 1
				});
			}
			qs('.bt_regenerateCookie')?.addEventListener('click', handleCookieGeneration);
			qs('.bt_startDeamonCookie')?.addEventListener('click', handleCookieGeneration);
			// Manual trigger to poll once (keeping compatibility)
			qs('.bt_identificationCookieEnd')?.addEventListener('click', async () => {
				// manual single attempt — show errors since user-initiated
				const found = await checkCookieFile(true);
				if (found) onCookieFound();
				else alertMsg('Cookie non trouve', 'warning');
			});
			qs('#bt_reinstallNodeJS')?.addEventListener('click', () => {
				confirmAction(
					"{{Réinstallation de NodeJS}}",
					"{{Êtes-vous sûr de vouloir supprimer et réinstaller NodeJS ?}}",
					'reinstallNodeJS',
					"{{Réinstallation NodeJS effectuée, veuillez patienter pendant l'installation}}"
				);
			});
			qs('#bt_refreshAlleqCmds')?.addEventListener('click', () => {


				confirmAction(
					"{{Réinstallation des commandes des équipements}}",
					"{{Êtes-vous sûr de vouloir réinitialiser les commandes des équipements ?}}",
					'refresh_AlleqCmds',
					"{{Réinstallation des commandes des équipements effectuée}}"
				);
			});

			qs('.bt_supprimeTouslesDevices')?.addEventListener('click', () => {
				confirmAction(
					"{{Suppression des équipements}}",
					"{{Voulez-vous supprimer tous les équipements du plugin Alexa-API (hors smartHome) ?}}",
					'supprimeTouslesDevices',
					"{{Suppression effectuée}}"
				);
			});

			qs('.bt_forcerDefaultAllCmd')?.addEventListener('click', () => {
				confirmAction(
					"{{Réinitialisation des commandes}}",
					"{{Voulez-vous recharger la configuration par défaut de toutes les commandes ?}}",
					'forcerDefaultAllCmd',
					"{{Réinitialisation effectuée}}"
				);
			});

			qs('.bt_desactiverFabriquants')?.addEventListener('click', async () => {
				jeeFrontEnd.plugin.savePluginConfig({
					success: async () => {
						domUtils.showLoading();
						const data = await ajaxCall('disable_UnthorizedManufacturer');
						if (data.state === 'ok') {
							window.location.reload();
						} else {
							alertMsg(data.result, 'danger');
						}
						domUtils.hideLoading();
					}
				});
			});

			qs('#bt_askTest')?.addEventListener('click', async () => {
				jeeFrontEnd.plugin.savePluginConfig({
					success: async () => {
						const skillAskState = await checkSkillAsk();

						if (skillAskState == 'ok') {
							let eqLogId = qs('#sel_defaultDevice').value;
							if (eqLogId == '') alertMsg('{{Aucun appareil par défaut configuré}}', 'warning');

							domUtils.showLoading();
							const data = await ajaxCall('askTest', {
								eqLogId
							});
							if (data.state === 'ok') {
								alertMsg('askTest ok' + data.result, 'success');
								domUtils.hideLoading();
							} else {
								alertMsg(data.result, 'danger');
							}
						} else {
							alertMsg(skillAskState || 'Skill check failed', 'danger');
						}
						domUtils.hideLoading();
					}
				});
			});
			qs('#checkSkillAsk')?.addEventListener('click', async () => {
				jeeFrontEnd.plugin.savePluginConfig({
					success: async () => {
						let eqLogId = qs('#sel_defaultDevice').value;
						if (eqLogId == '') alertMsg('{{Aucun appareil par défaut configuré}}', 'warning');

						domUtils.showLoading();
						const data = await ajaxCall('askTest', {
							eqLogId
						});
						if (data.state === 'ok') {
							//window.location.reload();
						} else {
							alertMsg(data.result, 'danger');
						}
						domUtils.hideLoading();
					}
				});
			});


			var deamonStateCell = document.querySelector('#md_pluginDaemon .deamonState');

			// Debounced initView to avoid multiple rapid calls from MutationObserver
			let initViewTimer = null;

			function debouncedInitView() {
				if (initViewTimer) clearTimeout(initViewTimer);
				initViewTimer = setTimeout(initView, 500);
			}

			if (deamonStateCell) {
				var observer = new MutationObserver(() => {
					debouncedInitView();
				});
				observer.observe(deamonStateCell, {
					childList: true,
					subtree: true
				});
			}
			// Defer initial view check until page is fully rendered
			requestAnimationFrame(() => {
				setTimeout(initView, 100);
			});


		}

		// Clean timers when leaving page
		window.addEventListener('beforeunload', () => {
			stopPolling();
			if (popupWatchTimer) clearInterval(popupWatchTimer);
			if (authWindow && !authWindow.closed) try {
				authWindow.close();
			} catch (e) {}
		});

	})();

	// ── Account Linking helpers ─────────────────────────────────────────────
	function alDeplyCall(action, data) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				type: 'POST',
				url: 'plugins/alexaapiv2/core/ajax/alexaapiv2.ajax.deplySkill.php',
				data: Object.assign({ action }, data),
				dataType: 'json',
				global: false,
				success: resolve,
				error: function(xhr, s, e) { reject(new Error(e || s || 'Network error')); }
			});
		});
	}

	async function alFindSkillId() {
		const r = await alDeplyCall('findSkillByName', { skillName: 'premiumAsk' });
		if (r.state !== 'ok' || !r.result || !r.result.skillId) {
			throw new Error('Skill premiumAsk introuvable');
		}
		return r.result.skillId;
	}

	function alStatus(el, type, text) {
		el.className = 'alert alert-' + type;
		el.style.display = 'block';
		el.textContent = text;
	}

	async function alCheckStatus() {
		const el = document.getElementById('al-status-result');
		alStatus(el, 'info', 'Recherche du skill...');
		try {
			const skillId = await alFindSkillId();
			alStatus(el, 'info', 'Vérification Account Linking...');
			const r = await alDeplyCall('getAccountLinkingClient', { skillId });
			if (r.state !== 'ok') {
				alStatus(el, 'danger', 'Vérification impossible: ' + JSON.stringify(r.result));
				return;
			}
			const body = r.result.body;
			if (body && body.accountLinkingResponse) {
				const cfg = body.accountLinkingResponse;
				const client = cfg.clientId ? cfg.clientId.substring(0, 8) + '...' : 'non renseigné';
				alStatus(el, 'success', 'Account Linking configuré sur Alexa. Type: ' + (cfg.type || '-') + '. Token: ' + (cfg.accessTokenScheme || '-') + '. Client: ' + client);
			} else if (r.result.code === 404) {
				alStatus(el, 'warning', 'Aucun Account Linking configuré sur Alexa. Le skill utilise encore l APIKEY statique.');
			} else {
				alStatus(el, 'warning', 'Réponse Amazon inattendue. Code HTTP: ' + (r.result.code || 'n/a'));
			}
		} catch (e) {
			alStatus(el, 'danger', e.message);
		}
	}

	async function alSetAccountLinking() {
		const el = document.getElementById('al-status-result');
		el.style.display = 'block';
		el.textContent = '⏳ Recherche du skill…';
		try {
			const skillId = await alFindSkillId();
			el.textContent = '⏳ Configuration Account Linking…';
			const r = await alDeplyCall('setAskAccountLinking', { skillId });
			el.textContent = (r.state === 'ok' && (r.result.success || r.result.code < 300))
				? '✓ Account Linking configuré — l\'utilisateur doit lier son compte depuis l\'app Alexa'
				: '❌ ' + JSON.stringify(r.result);
		} catch (e) {
			el.textContent = '❌ ' + e.message;
		}
	}

	async function alDeleteAccountLinking() {
		if (!confirm('Supprimer la configuration Account Linking du skill Alexa ?\n\nCela restaure le fonctionnement avec APIKEY statique (pas de liaison de compte requise).')) return;
		const el = document.getElementById('al-status-result');
		el.style.display = 'block';
		el.textContent = '⏳ Recherche du skill…';
		try {
			const skillId = await alFindSkillId();
			el.textContent = '⏳ Suppression Account Linking…';
			const r = await alDeplyCall('deleteAskAccountLinking', { skillId });
			el.textContent = (r.state === 'ok' && (r.result.success || r.result.code === 204))
				? '✓ Account Linking supprimé — skill restauré (APIKEY statique)'
				: '❌ ' + JSON.stringify(r.result);
		} catch (e) {
			el.textContent = '❌ ' + e.message;
		}
	}
</script>
