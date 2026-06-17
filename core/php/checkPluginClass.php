<?php

/** @entrypoint */
/** @console */

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

/* Valide qu'un fichier de classe plugin est chargeable sans erreur fatale.
   Doit tourner dans un process séparé : un trait/parent manquant produit une
   erreur fatale de compilation NON rattrapable par try/catch, qui tuerait le
   process appelant. Sortie : 0 = OK, 2 = erreur fatale, 3 = classe absente. */

require_once __DIR__ . '/console.php';

$pluginId = isset($argv[1]) ? $argv[1] : '';
if ($pluginId === '' || !preg_match('/^[a-zA-Z0-9_]+$/', $pluginId)) {
	fwrite(STDERR, 'invalid plugin id');
	exit(4);
}

$classFile = __DIR__ . '/../../plugins/' . $pluginId . '/core/class/' . $pluginId . '.class.php';
if (!file_exists($classFile)) {
	fwrite(STDERR, 'class file not found: ' . $classFile);
	exit(3);
}

/* Une erreur fatale de compilation ne lève pas d'exception : on la récupère
   via le shutdown handler en lisant error_get_last(). */
register_shutdown_function(function () {
	$e = error_get_last();
	if ($e !== null && in_array($e['type'], array(E_ERROR, E_COMPILE_ERROR, E_CORE_ERROR, E_PARSE, E_RECOVERABLE_ERROR), true)) {
		fwrite(STDERR, $e['message']);
		exit(2);
	}
});

require_once $classFile;

if (!class_exists($pluginId)) {
	fwrite(STDERR, 'class ' . $pluginId . ' not defined after include');
	exit(3);
}
exit(0);
