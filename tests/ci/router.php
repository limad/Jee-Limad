<?php
/* Routeur pour « php -S » (tests de fumée et CI) : refuse ce qu'Apache refuse en production
 * (données, journaux, configuration, dossiers cachés, clés et dumps). */
$u = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(data|log|\.git|core/config|backup|tmp)(/|$)#', $u) || preg_match('#\.(key|sql|log)$#', $u) || preg_match('#/\.[^/]+/#', $u)) {
	http_response_code(403);
	exit;
}
return false;
