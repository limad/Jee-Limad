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

require_once __DIR__ . '/../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');

if (!isConnect() && !jeedom::apiAccess(init('apikey'), 'core')) {
	http_response_code(401);
	header('Content-Type: text/plain; charset=utf-8');
	echo 'Unauthorized';
	exit;
}

// Libère le verrou de session : sinon toute autre requête PHP de cet utilisateur
// reste bloquée pendant toute la durée du flux SSE.
@session_write_close();
@set_time_limit(0);
@ignore_user_abort(true);
while (@ob_get_level() > 0) {
	@ob_end_flush();
}

header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

// Cursor = le microtime renvoyé par event::changes (id SSE). EventSource le
// renvoie via Last-Event-ID à la reconnexion → reprise sans perte d'événement.
$cursor = 0;
if (isset($_SERVER['HTTP_LAST_EVENT_ID']) && is_numeric($_SERVER['HTTP_LAST_EVENT_ID'])) {
	$cursor = $_SERVER['HTTP_LAST_EVENT_ID'];
} elseif (is_numeric(init('datetime'))) {
	$cursor = init('datetime');
}
if ($cursor == 0) {
	$cursor = getmicrotime();
}
$filter = (init('filter', null) == '') ? null : init('filter');

echo "retry: 3000\n";
echo ": connected\n\n";
@flush();

// On recycle le worker Apache au bout de ~50s en fermant le flux ; EventSource
// se reconnecte automatiquement avec Last-Event-ID. Chaque cycle réutilise
// event::changes() (donc le signal fichier + le filet de sécurité du core).
$deadline = microtime(true) + 50;
while (microtime(true) < $deadline) {
	if (connection_aborted()) {
		break;
	}
	$changes = event::changes($cursor, 20, $filter);
	$cursor = $changes['datetime'];
	foreach ($changes['result'] as $event) {
		$data = json_encode($event, JSON_UNESCAPED_UNICODE);
		if ($data === false) {
			continue;
		}
		echo 'id: ' . $cursor . "\n";
		echo 'event: ' . (isset($event['name']) ? $event['name'] : 'message') . "\n";
		echo 'data: ' . $data . "\n\n";
	}
	echo ": ping\n\n";
	@flush();
}
