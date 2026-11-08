<?php
/* Les tests écrivent dans la base : refuser toute base dont le nom ne finit pas par _test. */
function jeedom_test_guard(): void {
	global $CONFIG;
	$name = $CONFIG['db']['dbname'] ?? '';
	if (substr($name, -5) !== '_test') {
		fwrite(STDERR, "Refus : la base « $name » n'est pas une base de test (nom attendu en *_test).\n");
		exit(2);
	}
}
