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
require_once __DIR__ . '/../class/dashx.class.php';

function dashx_api_json($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function dashx_api_body(int $maxBytes = 65536): string {
    $body = file_get_contents('php://input');
    if (strlen($body) > $maxBytes) {
        dashx_api_json(['error' => 'Payload trop volumineux'], 413);
    }
    return $body;
}

// Auth core : session uniquement (pas de token/apikey de partage en v1).
if (!isConnect()) {
    dashx_api_json(['error' => 'Non autorisé'], 401);
}
$canEdit = isConnect('admin');

header('Content-Type: application/json; charset=utf-8');
$action = isset($_GET['action']) ? (string) $_GET['action'] : '';

try {
    switch ($action) {
        case 'getCmd':
            dashx_api_json(dashx::getCmdPayload((int) ($_GET['id'] ?? 0)));

        case 'getHistory':
            dashx_api_json(dashx::getHistoryPayload((int) ($_GET['id'] ?? 0), (int) ($_GET['hours'] ?? 24)));

        case 'getCmds':
            $ids = array_slice(array_filter(array_map('intval', explode(',', (string) ($_GET['ids'] ?? '')))), 0, 200);
            dashx_api_json(dashx::getCmdsPayload($ids));

        case 'getEqLogic':
            dashx_api_json(dashx::getEqLogicPayload((int) ($_GET['id'] ?? 0)));

        case 'execCmd':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                dashx_api_json(['error' => 'POST requis'], 405);
            }
            $cmdId = (int) ($_GET['id'] ?? 0);
            if (!dashx::canExecuteActionCmd($cmdId)) {
                dashx_api_json(['error' => 'Commande non autorisée pour ce dashboard'], 403);
            }
            $rawBody = dashx_api_body();
            $body = $rawBody !== '' ? json_decode($rawBody, true) : [];
            if (!is_array($body) || json_last_error() !== JSON_ERROR_NONE) {
                dashx_api_json(['error' => 'JSON invalide'], 400);
            }
            $options = [];
            foreach (['slider', 'title', 'message', 'color', 'select', 'text'] as $key) {
                if (array_key_exists($key, $body)) {
                    $options[$key] = $body[$key];
                }
            }
            // Anti-rafale par utilisateur (30 actions / 10s).
            $rlKey = 'dashx::rl::' . md5((string) ($_SESSION['user']->getId() ?? 'anon'));
            $window = (int) floor(time() / 10);
            $rlData = cache::byKey($rlKey)->getValue([]);
            if (!is_array($rlData) || (int) ($rlData['window'] ?? -1) !== $window) {
                $rlData = ['window' => $window, 'count' => 0];
            }
            $rlData['count']++;
            cache::set($rlKey, $rlData, 20);
            if ($rlData['count'] > 30) {
                dashx_api_json(['error' => 'Too many requests'], 429);
            }
            try {
                dashx::execActionCmd(
                    $cmdId,
                    $options,
                    (string) ($body['codeAccess'] ?? ''),
                    (string) ($body['confirmAction'] ?? '') === '1'
                );
            } catch (Exception $e) {
                if ($e->getCode() === -32005) {
                    dashx_api_json(['error' => $e->getMessage(), 'code' => 'code_required'], 403);
                }
                if ($e->getCode() === -32006) {
                    $cmd = cmd::byId($cmdId);
                    dashx_api_json([
                        'error' => $e->getMessage(),
                        'code' => 'confirm_required',
                        'command' => is_object($cmd) ? $cmd->getName() : '',
                    ], 403);
                }
                throw $e;
            }
            dashx_api_json(['status' => 'ok']);

        case 'getLayout':
            dashx_api_json(dashx::getLayout());

        case 'exportLayout':
            header('Content-Disposition: attachment; filename="dashx-layout.json"');
            echo json_encode(dashx::getLayout(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;

        case 'saveLayout':
            if (!$canEdit) {
                dashx_api_json(['error' => 'Édition non autorisée'], 403);
            }
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                dashx_api_json(['error' => 'POST requis'], 405);
            }
            $payload = json_decode(dashx_api_body(), true);
            if (!is_array($payload) || json_last_error() !== JSON_ERROR_NONE) {
                dashx_api_json(['error' => 'JSON invalide'], 400);
            }
            dashx_api_json(['status' => 'ok', 'layout' => dashx::saveLayout($payload)]);

        case 'getObjects':
            if (!$canEdit) {
                dashx_api_json(['error' => 'Édition non autorisée'], 403);
            }
            dashx_api_json(dashx::getObjectsPayload());

        case 'getCmdsByObject':
            if (!$canEdit) {
                dashx_api_json(['error' => 'Édition non autorisée'], 403);
            }
            dashx_api_json(dashx::getCmdsByObjectPayload((int) ($_GET['object_id'] ?? 0)));

        case 'getSummary':
            dashx_api_json(dashx::getSummaryPayload());

        case 'getHealth':
            dashx_api_json(dashx::getHealthPayload());

        default:
            dashx_api_json(['error' => 'Action inconnue : ' . htmlspecialchars($action, ENT_QUOTES, 'UTF-8')], 400);
    }
} catch (Exception $e) {
    log::add('dashx', 'error', 'API : ' . $e->getMessage());
    dashx_api_json(['error' => $e->getMessage()], 500);
}
