<?php
/**
 * OPcache Preloading — Jeedom Core
 *
 * Preloads the heaviest core classes into shared memory at server start.
 * Requires PHP 8.0+ and opcache.preload configured in php.ini.
 * Compatible PHP 8.2+.
 */

$classes = [
    __DIR__ . '/../class/cmd.class.php',
    __DIR__ . '/../class/eqLogic.class.php',
    __DIR__ . '/../class/scenarioExpression.class.php',
    __DIR__ . '/../class/scenario.class.php',
    __DIR__ . '/../class/jeedom.class.php',
    __DIR__ . '/../class/jeeObject.class.php',
    __DIR__ . '/../class/plugin.class.php',
    __DIR__ . '/../class/history.class.php',
    __DIR__ . '/../class/DB.class.php',
    __DIR__ . '/../class/config.class.php',
    __DIR__ . '/../class/cache.class.php',
    __DIR__ . '/../class/cron.class.php',
    __DIR__ . '/../class/translate.class.php',
    __DIR__ . '/../class/event.class.php',
    // log.class.php exclue : extends Psr\Log\AbstractLogger (Composer autoload requis)
    __DIR__ . '/../class/utils.class.php',
];

foreach ($classes as $file) {
    if (file_exists($file)) {
        opcache_compile_file($file);
    }
}
