<?php
/* Initialise une base de test vide pour PHPUnit et le test de fumée.
 * Ne touche pas au système : n'exécute pas install/consistency.php.
 * Usage : php tests/ci/init_db.php [login_admin mot_de_passe] */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../core/config/common.config.php';
require_once __DIR__ . '/guard.php';
jeedom_test_guard();
require_once __DIR__ . '/../../core/class/DB.class.php';

DB::compareAndFix(json_decode(file_get_contents(__DIR__ . '/../../install/database.json'), true));
require_once __DIR__ . '/../../core/php/core.inc.php';

/* Identifiants de test très hauts : cron::halt() et scenario::stop() cherchent les processus « cron_id=N » /
 * « scenario_id=N » sur toute la machine ; un identifiant de test ne doit jamais désigner un processus réel. */
foreach (DB::Prepare('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND AUTO_INCREMENT IS NOT NULL AND AUTO_INCREMENT < 900000000', array(), DB::FETCH_TYPE_ALL) as $table) {
	DB::Prepare('ALTER TABLE `' . $table['TABLE_NAME'] . '` AUTO_INCREMENT = 900000000', array());
}

$tmp = getenv('JEEDOM_TEST_TMP') ?: '/tmp/jeedom-test';
config::save('folder::tmp', $tmp);
if (!is_dir($tmp)) {
	mkdir($tmp, 0775, true);
}
if (config::byKey('api') == '') {
	config::save('api', config::genKey());
}
config::save('log::level', 400);
config::save('jeedom::firstUse', 0); // pas de fenêtre de bienvenue pendant les tests navigateur
config::save('version', jeedom::version());

if (isset($argv[2])) {
	$user = user::byLogin($argv[1]) ?: new user();
	$user->setLogin($argv[1]);
	$user->setPassword($argv[2]);
	$user->setProfils('admin');
	$user->setEnable(1);
	$user->save();
	echo "admin " . $argv[1] . " OK\n";
}
echo "init_db OK (" . $CONFIG['db']['dbname'] . ", tmp " . $tmp . ")\n";
