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
try {
	require_once __DIR__ . '/../../core/php/core.inc.php';
	include_file('core', 'authentification', 'php');

	$isAdmin = isConnect('admin');
	$onlyPluginId = 'all';

	if (!isConnect() && !jeedom::apiAccess(init('apikey'), init('plugin'))) {
		throw new Exception(__('401 - Accès non autorisé', __FILE__));
	}

	//global user created with an api key attached to a user
	if (isset($_USER_GLOBAL) && is_object($_USER_GLOBAL)) {
		$isAdmin = ($_USER_GLOBAL->getProfils() == 'admin');
		log::add('api', 'debug', 'downloadFile - profil connecté est admin : ' . ($isAdmin ? 'true' : 'false'));
	} else { // if not a user and usage of apikey => get from which plugin this apikey comes from
		$onlyPluginId = init('plugin', 'core');
	}

	unautorizedInDemo();
	$pathfile = calculPath(init('pathfile'));
	if (strpos($pathfile, '*') !== false) {
		$basePath = realpath(str_replace('*', '', $pathfile));
		if ($basePath === false) {
			log::add('api', 'debug', 'downloadFile - fichier introuvable');
			throw new Exception(__('401 - Accès non autorisé', __FILE__));
		}
		$pathfile = rtrim($basePath, DIRECTORY_SEPARATOR) . '/*';
	} else {
		$pathfile = realpath($pathfile);
	}

	if ($pathfile === false) {
		log::add('api', 'debug', 'downloadFile - fichier introuvable');
		throw new Exception(__('401 - Accès non autorisé', __FILE__));
	}

	if (!$isAdmin) {
		$authorized = false;
		foreach (getWhiteListFolders($onlyPluginId) as $publicFolder) {
			$publicFolder = realpath($publicFolder);
			if ($publicFolder !== false && ($pathfile === $publicFolder || strpos($pathfile, $publicFolder . DIRECTORY_SEPARATOR) === 0)) {
				$authorized = true;
				break;
			}
		}
		if (!$authorized) {
			log::add('api', 'debug', 'downloadFile - fichier non accessible en zone blanche');
			throw new Exception(__('401 - Accès non autorisé', __FILE__));
		}
	}

	if (strpos($pathfile, '.php') !== false) {
		throw new Exception(__('401 - Accès non autorisé', __FILE__));
	}
	$rootPath = realpath(__DIR__ . '/../../');
	$pathForCheck = (strpos($pathfile, '*') !== false) ? realpath(dirname($pathfile)) : realpath($pathfile);
	if ($rootPath === false || $pathForCheck === false || ($pathForCheck !== $rootPath && strpos($pathForCheck, $rootPath . DIRECTORY_SEPARATOR) !== 0)) {
		log::add('api', 'debug', 'downloadFile - fichier hors racine web');
		throw new Exception(__('401 - Accès non autorisé', __FILE__));
	}
	if (!$isAdmin) {
		$adminFiles = array('log', 'backup', '.sql', 'scenario', '.tar', '.gz');
		foreach ($adminFiles as $adminFile) {
			if (strpos($pathfile, $adminFile) !== false) {
				throw new Exception(__('401 - Accès non autorisé', __FILE__));
			}
		}
	}
	if (strpos($pathfile, '*') === false) {
		if (!file_exists($pathfile)) {
			throw new Exception(__('Fichier non trouvé :', __FILE__) . ' ' . $pathfile);
		}
	} elseif (is_dir(str_replace('*', '', $pathfile))) {
		if (!$isAdmin) {
			throw new Exception(__('401 - Accès non autorisé', __FILE__));
		}
		$downloadFolder = jeedom::getTmpFolder('downloads');
		if (!is_dir($downloadFolder)) {
			mkdir($downloadFolder, 0775, true);
		}
		$archivePath = $downloadFolder . '/archive.tar.gz';
		system('cd ' . escapeshellarg(dirname($pathfile)) . ';tar cfz ' . escapeshellarg($archivePath) . ' * > /dev/null 2>&1');
		$pathfile = $archivePath;
	} else {
		if (!$isAdmin) {
			throw new Exception(__('401 - Accès non autorisé', __FILE__));
		}
		$files = glob($pathfile);
		if ($files === false || count($files) == 0) {
			throw new Exception(__('Fichier non trouvé :', __FILE__) . ' ' . $pathfile);
		}
		$escapedFiles = array();
		foreach ($files as $file) {
			$escapedFiles[] = escapeshellarg(basename($file));
		}
		$downloadFolder = jeedom::getTmpFolder('downloads');
		if (!is_dir($downloadFolder)) {
			mkdir($downloadFolder, 0775, true);
		}
		$archivePath = $downloadFolder . '/archive.tar.gz';
		system('cd ' . escapeshellarg(dirname($pathfile)) . ';tar cfz ' . escapeshellarg($archivePath) . ' ' . implode(' ', $escapedFiles) . '> /dev/null 2>&1');
		$pathfile = $archivePath;
	}
	ob_clean();
	$path_parts = pathinfo($pathfile);
	$downloadName = str_replace(array("\r", "\n"), '', (string) $path_parts['basename']);
	if (isset($path_parts['extension']) && $path_parts['extension'] == 'pdf') {
		header('Content-Type: application/pdf');
		header('Content-Disposition: inline; filename="' . addcslashes($downloadName, '"\\') . '"');
	} else {
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="' . addcslashes($downloadName, '"\\') . '"');
	}
	readfile($pathfile);
	if (file_exists(jeedom::getTmpFolder('downloads') . '/archive.tar.gz')) {
		unlink(jeedom::getTmpFolder('downloads') . '/archive.tar.gz');
	}
	exit;
} catch (Exception $e) {
	echo log::exception($e);
}
