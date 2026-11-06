<?php
/* Smoke test backend du dashboard core "dashx" — zéro dépendance.
 * Usage : php tests/dashx/backend.php
 * Couvre : classe dashx (payloads/layout/normalisation), endpoint AJAX (auth),
 * route de page. NE modifie PAS la config dashx::layout (lecture seule).
 */
declare(strict_types=1);

require_once __DIR__ . '/../../core/php/core.inc.php';
require_once __DIR__ . '/../../core/class/dashx.class.php';

$passed = 0;
$failed = 0;
function ok(string $l): void { global $passed; $passed++; echo "  \033[32m[PASS]\033[0m $l\n"; }
function ko(string $l, $exp, $got): void { global $failed; $failed++; echo "  \033[31m[FAIL]\033[0m $l\n    attendu: " . var_export($exp, true) . "\n    obtenu : " . var_export($got, true) . "\n"; }
function eq(string $l, $exp, $got): void { $exp === $got ? ok($l) : ko($l, $exp, $got); }
function truthy(string $l, $v): void { $v ? ok($l) : ko($l, true, (bool) $v); }

$base = 'http://127.0.0.1';
function http_get(string $path, array $cookies = []): array {
    $ch = curl_init('http://127.0.0.1' . $path);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_HEADER => false]);
    if ($cookies) {
        curl_setopt($ch, CURLOPT_COOKIE, implode('; ', array_map(fn($k, $v) => "$k=$v", array_keys($cookies), $cookies)));
    }
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => (string) $body];
}

echo "--- dashx backend smoke ---\n";

/* 1. defaultLayout / getLayout : structure */
$def = dashx::defaultLayout();
eq('defaultLayout version=2', 2, $def['version'] ?? null);
truthy('defaultLayout a un onglet', !empty($def['tabs']));
truthy('defaultLayout widgets=array', is_array($def['widgets'] ?? null));

$layout = dashx::getLayout();
truthy('getLayout widgets=array', is_array($layout['widgets'] ?? null));
truthy('getLayout tabs non vide', !empty($layout['tabs']));

/* 2. normalizeLayout : sanitation (type invalide rejeté, w/h bornés) */
$norm = (function () {
    $m = new ReflectionMethod('dashx', 'normalizeLayout');
    $m->setAccessible(true);
    return $m->invoke(null, [
        'theme' => 'dark',
        'tabs' => [['id' => 'default', 'name' => 'G']],
        'widgets' => [
            ['id' => 'a', 'tabId' => 'default', 'type' => 'sensor', 'w' => 99, 'h' => 99, 'config' => []],
            ['id' => 'b', 'tabId' => 'default', 'type' => 'INVALID_TYPE', 'config' => []],
        ],
    ]);
})();
eq('normalizeLayout rejette type invalide', 1, count($norm['widgets']));
eq('normalizeLayout borne w<=12', 12, $norm['widgets'][0]['w']);
eq('normalizeLayout borne h<=6', 6, $norm['widgets'][0]['h']);

/* 3. allowedWidgetTypes : couvre les types attendus */
$types = dashx::allowedWidgetTypes();
foreach (['equipment', 'sensor', 'switch', 'thermostat', 'divider', 'summary', 'chart'] as $t) {
    truthy("type '$t' autorisé", in_array($t, $types, true));
}
truthy('au moins 30 types de widgets', count($types) >= 30);

/* 4. payloads : structure (sans dépendre d'un équipement précis) */
truthy('getObjectsPayload=array', is_array(dashx::getObjectsPayload()));
$sum = dashx::getSummaryPayload();
foreach (['lights', 'messages', 'updates', 'summary'] as $k) {
    truthy("getSummary a la clé '$k'", array_key_exists($k, $sum));
}
$health = dashx::getHealthPayload();
eq('getHealth realtime=sse-core', 'sse-core', $health['realtime'] ?? null);
truthy('getHealth ne référence plus le daemon', !array_key_exists('daemon', $health));

/* 5. getCmdsPayload tolère un id inexistant (régression "cmd_missing") */
$cmds = dashx::getCmdsPayload([999999999]);
eq('getCmdsPayload id inconnu -> 1 entrée', 1, count($cmds));
eq('getCmdsPayload id inconnu -> available=false', false, $cmds[0]['available'] ?? null);

/* 6. Protection des actions : code et confirmation refusés avant exécution. */
$protectedCmd = new cmd();
$protectedCmd->setType('action');
$protectedCmd->setConfiguration('actionCodeAccess', '1234');
try {
    dashx::checkActionCmdAccess($protectedCmd);
    ko('actionCodeAccess absent refusé', -32005, 0);
} catch (Exception $e) {
    eq('actionCodeAccess absent refusé', -32005, $e->getCode());
}
try {
    dashx::checkActionCmdAccess($protectedCmd, 'mauvais');
    ko('actionCodeAccess faux refusé', -32005, 0);
} catch (Exception $e) {
    eq('actionCodeAccess faux refusé', -32005, $e->getCode());
}
$confirmCmd = new cmd();
$confirmCmd->setType('action');
$confirmCmd->setConfiguration('actionConfirm', 1);
try {
    dashx::checkActionCmdAccess($confirmCmd);
    ko('actionConfirm absent refusé', -32006, 0);
} catch (Exception $e) {
    eq('actionConfirm absent refusé', -32006, $e->getCode());
}

/* 7. AJAX : refus sans session (sécurité). Les flux AUTHENTIFIÉS (200, rendu page,
 * SSE) sont couverts par le smoke Playwright (smoke.mjs) où la session est gérée. */
$r = http_get('/core/ajax/dashx.ajax.php?action=getLayout');
eq('AJAX sans session refusé (401)', 401, $r['code']);

/* 8. Route de page : pas d'erreur 500 (sans session = login/redirect, doit rester < 500) */
$r = http_get('/index.php?v=d&p=dashx&m=core');
truthy('route page dashx ne 500 pas', $r['code'] < 500);

echo "\n--- $passed PASS / $failed FAIL ---\n";
exit($failed === 0 ? 0 : 1);
