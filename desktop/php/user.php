<?php
if (!isConnect('admin')) {
	throw new Exception('{{401 - Accès non autorisé}}');
}
sendVarToJS('jeeFrontEnd.ldapEnable', config::byKey('ldap::enable'));
?>

<form class="form-horizontal">
	<div id="div_administration">
		<div class="tab-pane" id="user">
			<legend><i class="icon personne-toilet1"></i> {{Liste des utilisateurs}}
				<div class="input-group pull-right" style="display:inline-flex">
					<span class="input-group-btn">
						<button type="button" class="btn btn-sm roundedLeft" id="bt_addUser"><i class="fas fa-plus-circle"></i> {{Ajouter un utilisateur}}</button>
						<?php if (config::byKey('ldap::enable') != '1') {
							$user = user::byLogin('jeedom_support');
							if (!is_object($user)) {
								echo '<button type="button" class="btn btn-success btn-sm " id="bt_supportAccess" data-enable="1"><i class="fas fa-user"></i> {{Activer accès support}}</button>';
							} else {
								echo '<button type="button" class="btn btn-danger btn-sm " id="bt_supportAccess" data-enable="0"><i class="fas fa-user"></i> {{Désactiver accès support}}</button>';
							}
						?>
						<button type="button" class="btn btn-success btn-sm roundedRight" id="bt_saveUser"><i class="fas fa-check-circle"></i> {{Sauvegarder}}</button>
						<?php }
						?>
					</span>
				</div>
			</legend>
			<table class="table table-condensed" id="table_user">
				<thead>
					<th style="min-width: 120px;">{{Utilisateur}}</th>
					<th style="width: 250px;">{{Actif}}</th>
					<th>{{Profil}}</th>
					<th style="width: 15%;">{{API}}</th>
					<th>{{Double authentification}}</th>
					<th>{{Dernière connexion}}</th>
					<th>{{Actions}}</th>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	</div>
</form>

<form class="form-horizontal">
	<legend>{{Session(s) active(s)}}</legend>
	<table id="tableSessions" class="table table-condensed">
		<thead>
			<tr>
				<th>{{ID}}</th>
				<th>{{Utilisateur}}</th>
				<th>{{IP}}</th>
				<th>{{Date}}</th>
				<th style="width:80px;">{{Actions}}</th>
			</tr>
		</thead>
		<tbody>
			<?php
			$sessions = null;
			try {
				$sessions = listSession();
			} catch (Exception $e) {
				echo '<div class="alert alert-danger">' . log::exception($e) . '</div>';
			}
			if (is_array($sessions) && count($sessions) > 0) {
				foreach ($sessions as $id => $session) {
					if (!isset($session['ip'])) {
						$session['ip'] = '';
					}
					if (!isset($session['datetime'])) {
						$session['datetime'] = '';
					}
					$tr = '';
					$tr .= '<tr data-id="' . $id . '">';
					$tr .= '<td>' . $id . '</td>';
					$tr .= '<td>' . $session['login'] . '</td>';
					$tr .= '<td>' . $session['ip'] . '</td>';
					$tr .= '<td>' . $session['datetime'] . '</td>';
					$tr .= '<td><button type="button" class="btn btn-xs btn-warning bt_deleteSession"><i class="fas fa-sign-out-alt"></i> {{Déconnecter}}</button></td>';
					$tr .= '</tr>';
					echo $tr;
				}
			}
			?>
		</tbody>
	</table>
</form>

<form id="div_Devices" class="form-horizontal">
	<legend>{{Périphérique(s) enregistré(s)}} <button type="button" class="btn btn-xs btn-danger pull-right" id="bt_removeAllRegisterDevice"><i class="fas fa-trash"></i> {{Supprimer tout}}</button></legend>
	<table id="tableDevices" class="table table-condensed dataTable">
		<thead>
			<tr>
				<th style="width:220px;">{{ID}}</th>
				<th>{{Utilisateur}}</th>
				<th style="width:180px;">{{IP}}</th>
				<th data-type="date" data-format="YYYY-MM-DD hh:mm:ss" style="width:180px;">{{Date}}</th>
				<th data-sortable="false" data-filter="false" style="width:100px;">{{Action}}</th>
			</tr>
		</thead>
		<tbody>
			<?php
			foreach ((user::all()) as $user) {
				if (!is_array($user->getOptions('registerDevice')) || count($user->getOptions('registerDevice')) == 0) {
					continue;
				}
				foreach (($user->getOptions('registerDevice')) as $key => $value) {
					$tr = '';
					$tr .= '<tr data-key="' . $key . '" data-user_id="' . $user->getId() . '">';
					$tr .= '<td title="' . $key . '">';
					$tr .= substr($key, 0, 20) . '...';
					$tr .= '</td>';
					$tr .= '<td>';
					$tr .= $user->getLogin();
					$tr .= '</td>';
					$tr .= '<td>';
					$tr .= $value['ip'];
					$tr .= '</td>';
					$tr .= '<td>';
					$tr .= $value['datetime'];
					$tr .= '</td>';
					$tr .= '<td>';
					$tr .= '<button type="button" class="btn btn-danger btn-xs bt_removeRegisterDevice"><i class="fas fa-trash"></i> {{Supprimer}}</button>';
					$tr .= '</td>';
					$tr .= '</tr>';
					echo $tr;
				}
			}
			?>
		</tbody>
	</table>
</form>

<?php include_file("desktop", "user", "js"); ?>