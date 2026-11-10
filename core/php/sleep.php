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
require_once __DIR__ . '/../php/utils.inc.php';
// Pause demandée par la page en mode rapport (iframe de desktop/php/index.php), pour laisser le navigateur
// headless de la box finir le rendu. Sans authentification : on n'accepte que la box elle-même (le rapport
// l'appelle par son adresse réseau) et au plus 60 s, sinon n'importe qui pourrait bloquer des processus Apache.
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if ($remote !== ($_SERVER['SERVER_ADDR'] ?? '') && $remote !== '127.0.0.1' && $remote !== '::1') {
	http_response_code(403);
	die();
}
$delay = (int) init('delay', 0);
usleep(max(0, min($delay, 60000)) * 1000);
