<?php

/* Dashboard alternatif core (dashx) — helpers de données.
 * Porté depuis le plugin jeeDash, dégraissé de tout le lifecycle plugin
 * (eqLogic, daemon, tokens de partage). Le temps réel passe désormais par
 * core/ajax/event_sse.ajax.php. Layout stocké en clé config core. */

class dashx {
    public static function defaultLayout(): array {
        return [
            'version' => 2,
            'theme' => self::sanitizeTheme(config::byKey('dashx::default_theme', 'core', 'dark')),
            'tabs' => [
                ['id' => 'default', 'name' => 'General'],
            ],
            'badges' => [],
            'widgets' => [],
        ];
    }

    public static function getLayout(): array {
        $raw = config::byKey('dashx::layout', 'core', '');
        if ($raw === '') {
            return self::defaultLayout();
        }
        if (is_array($raw)) {
            return self::normalizeLayout($raw);
        }
        if (!is_string($raw)) {
            log::add('dashx', 'error', 'Layout config invalide');
            return self::defaultLayout();
        }

        $layout = json_decode($raw, true);
        if (!is_array($layout) || json_last_error() !== JSON_ERROR_NONE) {
            log::add('dashx', 'error', 'Layout JSON invalide : ' . json_last_error_msg());
            return self::defaultLayout();
        }

        return self::normalizeLayout($layout);
    }

    public static function saveLayout(array $layout): array {
        $normalized = self::normalizeLayout($layout);
        config::save('dashx::layout', $normalized, 'core');
        config::save('dashx::layout_saved_at', time(), 'core');
        return $normalized;
    }

    public static function getCmdPayload(int $id): array {
        $cmd = cmd::byId($id);
        if (!is_object($cmd)) {
            throw new Exception(__('Commande introuvable', __FILE__));
        }

        $eqLogic = method_exists($cmd, 'getEqLogic') ? $cmd->getEqLogic() : eqLogic::byId($cmd->getEqLogic_id());
        $available = is_object($eqLogic) && (int) $eqLogic->getIsEnable() === 1;

        return [
            'id' => (int) $cmd->getId(),
            'name' => $cmd->getName(),
            'logicalId' => $cmd->getLogicalId(),
            'type' => $cmd->getType(),
            'subType' => $cmd->getSubType(),
            'genericType' => $cmd->getConfiguration('generic_type', ''),
            'unit' => $cmd->getUnite(),
            'value' => $available ? $cmd->getCache('value') : null,
            'valueCmdId' => self::valueCmdId($cmd),
            'valueCmdValue' => self::valueCmdValue($cmd),
            'datetime' => $cmd->getCache('collectDate'),
            'available' => $available,
            'reason' => $available ? null : 'eqLogic_disabled',
            'eqLogic' => is_object($eqLogic) ? [
                'id' => (int) $eqLogic->getId(),
                'name' => $eqLogic->getName(),
                'isEnable' => (int) $eqLogic->getIsEnable(),
                'isVisible' => (int) $eqLogic->getIsVisible(),
            ] : null,
        ];
    }

    public static function getHistoryPayload(int $id, int $hours = 24): array {
        $cmd = cmd::byId($id);
        if (!is_object($cmd)) {
            throw new Exception(__('Commande introuvable', __FILE__));
        }

        $hours = max(1, min(168, $hours));
        $start = date('Y-m-d H:i:s', time() - $hours * 3600);
        $end = date('Y-m-d H:i:s');

        $points = [];
        foreach ($cmd->getHistory($start, $end) as $history) {
            $value = $history->getValue();
            if (!is_numeric($value)) {
                continue;
            }
            $points[] = [
                't' => strtotime($history->getDatetime()) * 1000,
                'v' => (float) $value,
            ];
        }

        $max = 500;
        if (count($points) > $max) {
            $step = (int) ceil(count($points) / $max);
            $points = array_values(array_filter($points, function ($_point, $index) use ($step) {
                return $index % $step === 0;
            }, ARRAY_FILTER_USE_BOTH));
        }

        return [
            'id' => (int) $cmd->getId(),
            'unit' => $cmd->getUnite(),
            'hours' => $hours,
            'points' => $points,
        ];
    }

    public static function getCmdsPayload(array $ids): array {
        $result = [];
        foreach ($ids as $id) {
            $id = (int) $id;
            if ($id <= 0) {
                continue;
            }
            $cmd = cmd::byId($id);
            if (!is_object($cmd)) {
                $result[] = [
                    'id' => $id,
                    'value' => null,
                    'available' => false,
                    'reason' => 'cmd_missing',
                ];
                continue;
            }
            $eqLogic = method_exists($cmd, 'getEqLogic') ? $cmd->getEqLogic() : eqLogic::byId($cmd->getEqLogic_id());
            $available = is_object($eqLogic) && (int) $eqLogic->getIsEnable() === 1;
            $result[] = [
                'id' => (int) $cmd->getId(),
                'value' => $available ? $cmd->getCache('value') : null,
                'valueCmdId' => self::valueCmdId($cmd),
                'valueCmdValue' => self::valueCmdValue($cmd),
                'unit' => $cmd->getUnite(),
                'genericType' => $cmd->getConfiguration('generic_type', ''),
                'subType' => $cmd->getSubType(),
                'type' => $cmd->getType(),
                'available' => $available,
                'reason' => $available ? null : 'eqLogic_disabled',
                'eqLogic' => is_object($eqLogic) ? [
                    'id' => (int) $eqLogic->getId(),
                    'name' => $eqLogic->getName(),
                    'isEnable' => (int) $eqLogic->getIsEnable(),
                    'isVisible' => (int) $eqLogic->getIsVisible(),
                ] : null,
            ];
        }
        return $result;
    }

    public static function execActionCmd(int $id, array $options = []): void {
        $cmd = cmd::byId($id);
        if (!is_object($cmd)) {
            throw new Exception(__('Commande introuvable', __FILE__));
        }
        if ($cmd->getType() !== 'action') {
            throw new Exception(__('La commande n est pas une action', __FILE__));
        }
        $cmd->execCmd($options);
    }

    public static function canExecuteActionCmd(int $id, ?array $layout = null): bool {
        if ($id <= 0) {
            return false;
        }

        $layout = $layout === null ? self::getLayout() : self::normalizeLayout($layout);
        foreach (($layout['widgets'] ?? []) as $widget) {
            $config = $widget['config'] ?? [];
            if (($widget['type'] ?? '') === 'equipment' && self::isVisibleCmdInEqLogic($id, (int) ($config['eqlogic_id'] ?? 0), 'action')) {
                return true;
            }
            foreach (self::widgetActionKeys((string) ($widget['type'] ?? '')) as $key) {
                if ((int) ($config[$key] ?? 0) === $id) {
                    return true;
                }
            }
        }
        foreach (($layout['badges'] ?? []) as $badge) {
            if ((int) ($badge['cmd_action'] ?? 0) === $id) {
                return true;
            }
        }
        return false;
    }

    public static function isCmdInLayout(int $id): bool {
        if ($id <= 0) {
            return false;
        }

        foreach ((self::getLayout()['widgets'] ?? []) as $widget) {
            if ((int) ($widget['condition']['cmd_id'] ?? 0) === $id) {
                return true;
            }
            if (($widget['type'] ?? '') === 'equipment' && self::isVisibleCmdInEqLogic($id, (int) ($widget['config']['eqlogic_id'] ?? 0))) {
                return true;
            }
            foreach (($widget['config'] ?? []) as $key => $value) {
                if (strpos((string) $key, 'cmd_') === 0 && (int) $value === $id) {
                    return true;
                }
            }
        }
        foreach ((self::getLayout()['badges'] ?? []) as $badge) {
            if ((int) ($badge['cmd_id'] ?? 0) === $id) {
                return true;
            }
        }
        return false;
    }

    public static function isEqLogicInLayout(int $id, ?array $layout = null): bool {
        if ($id <= 0) {
            return false;
        }

        $layout = $layout === null ? self::getLayout() : self::normalizeLayout($layout);
        foreach (($layout['widgets'] ?? []) as $widget) {
            if (($widget['type'] ?? '') === 'equipment' && (int) ($widget['config']['eqlogic_id'] ?? 0) === $id) {
                return true;
            }
        }
        return false;
    }

    public static function getObjectsPayload(): array {
        $result = [];
        foreach (jeeObject::all() as $object) {
            $result[] = [
                'id' => (int) $object->getId(),
                'name' => $object->getName(),
            ];
        }
        if (self::hasEqLogicWithoutObject()) {
            $result[] = [
                'id' => 0,
                'name' => __('Sans objet', __FILE__),
            ];
        }
        return $result;
    }

    public static function getCmdsByObjectPayload(int $objectId): array {
        $result = [];
        foreach (self::eqLogicsByObjectId($objectId) as $eqLogic) {
            $commands = [];
            foreach ($eqLogic->getCmd() as $cmd) {
                $commands[] = [
                    'id' => (int) $cmd->getId(),
                    'name' => $cmd->getName(),
                    'logicalId' => $cmd->getLogicalId(),
                    'type' => $cmd->getType(),
                    'subType' => $cmd->getSubType(),
                    'genericType' => $cmd->getConfiguration('generic_type', ''),
                    'unit' => $cmd->getUnite(),
                    'value' => $cmd->getCache('value'),
                    'valueCmdId' => self::valueCmdId($cmd),
                    'valueCmdValue' => self::valueCmdValue($cmd),
                    'isVisible' => (int) $cmd->getIsVisible(),
                ];
            }
            $result[] = [
                'id' => (int) $eqLogic->getId(),
                'name' => $eqLogic->getName(),
                'type' => $eqLogic->getEqType_name(),
                'objectId' => (int) $eqLogic->getObject_id(),
                'isEnable' => (int) $eqLogic->getIsEnable(),
                'isVisible' => (int) $eqLogic->getIsVisible(),
                'cmds' => $commands,
            ];
        }
        return $result;
    }

    public static function getEqLogicPayload(int $id): array {
        $eqLogic = eqLogic::byId($id);
        if (!is_object($eqLogic)) {
            throw new Exception(__('Equipement introuvable', __FILE__));
        }

        $available = (int) $eqLogic->getIsEnable() === 1;
        $commands = [];
        foreach ($eqLogic->getCmd() as $cmd) {
            if ((int) $cmd->getIsVisible() !== 1) {
                continue;
            }
            $commands[] = [
                'id' => (int) $cmd->getId(),
                'name' => $cmd->getName(),
                'logicalId' => $cmd->getLogicalId(),
                'type' => $cmd->getType(),
                'subType' => $cmd->getSubType(),
                'genericType' => $cmd->getConfiguration('generic_type', ''),
                'unit' => $cmd->getUnite(),
                'value' => $available ? $cmd->getCache('value') : null,
                'valueCmdId' => self::valueCmdId($cmd),
                'valueCmdValue' => self::valueCmdValue($cmd),
                'datetime' => $cmd->getCache('collectDate'),
                'available' => $available,
                'reason' => $available ? null : 'eqLogic_disabled',
                'isVisible' => (int) $cmd->getIsVisible(),
                'configuration' => [
                    'minValue' => (string) $cmd->getConfiguration('minValue', ''),
                    'maxValue' => (string) $cmd->getConfiguration('maxValue', ''),
                    'listValue' => mb_substr((string) $cmd->getConfiguration('listValue', ''), 0, 2000),
                ],
                'eqLogic' => [
                    'id' => (int) $eqLogic->getId(),
                    'name' => $eqLogic->getName(),
                    'isEnable' => (int) $eqLogic->getIsEnable(),
                    'isVisible' => (int) $eqLogic->getIsVisible(),
                ],
            ];
        }

        return [
            'id' => (int) $eqLogic->getId(),
            'name' => $eqLogic->getName(),
            'type' => $eqLogic->getEqType_name(),
            'objectId' => (int) $eqLogic->getObject_id(),
            'isEnable' => (int) $eqLogic->getIsEnable(),
            'isVisible' => (int) $eqLogic->getIsVisible(),
            'cmds' => $commands,
        ];
    }

    public static function getSummaryPayload(): array {
        $summary = [];
        if (method_exists('jeeObject', 'getGlobalArraySummary')) {
            foreach (jeeObject::getGlobalArraySummary('dashboard') as $key => $value) {
                $summary[$key] = [
                    'value' => $value['value'] ?? 0,
                    'unit' => $value['unit'] ?? '',
                ];
            }
        }

        return [
            'lights' => (int) ($summary['light']['value'] ?? 0),
            'messages' => method_exists('message', 'all') ? count(message::all()) : 0,
            'updates' => method_exists('update', 'nbNeedUpdate') ? (int) update::nbNeedUpdate() : 0,
            'summary' => $summary,
        ];
    }

    public static function getHealthPayload(): array {
        // Le temps réel passe par core/ajax/event_sse.ajax.php (servi par Apache),
        // plus de daemon/port dédié à sonder. On expose une santé core minimale.
        return [
            'realtime' => 'sse-core',
            'sseEndpoint' => 'core/ajax/event_sse.ajax.php',
            'updates' => method_exists('update', 'nbNeedUpdate') ? (int) update::nbNeedUpdate() : 0,
            'messages' => method_exists('message', 'all') ? count(message::all()) : 0,
        ];
    }

    public static function allowedWidgetTypes(): array {
        return ['light', 'sensor', 'switch', 'climate', 'summary', 'divider', 'equipment', 'binary', 'cover', 'dimmer', 'thermostat', 'lock', 'chart', 'color', 'camera', 'scene', 'select', 'media', 'electricity', 'weather', 'alarm', 'fan', 'garage', 'message', 'dialogue', 'text', 'timer', 'hygrostat', 'battery', 'airQuality', 'presence', 'systemHealth'];
    }

    public static function widgetActionKeysByType(): array {
        return [
            'light' => ['cmd_on', 'cmd_off'],
            'color' => ['cmd_on', 'cmd_off', 'cmd_color', 'cmd_set_color_temp'],
            'scene' => ['cmd_action'],
            'select' => ['cmd_action'],
            'media' => ['cmd_play', 'cmd_pause', 'cmd_stop', 'cmd_next', 'cmd_prev', 'cmd_volume'],
            'alarm' => ['cmd_arm', 'cmd_disarm'],
            'fan' => ['cmd_speed', 'cmd_on', 'cmd_off'],
            'garage' => ['cmd_open', 'cmd_close', 'cmd_toggle'],
            'message' => ['cmd_action'],
            'dialogue' => ['cmd_action'],
            'text' => ['cmd_action'],
            'timer' => ['cmd_set', 'cmd_pause', 'cmd_resume'],
            'hygrostat' => ['cmd_set_setpoint'],
            'dimmer' => ['cmd_slider'],
            'switch' => ['cmd_toggle'],
            'cover' => ['cmd_up', 'cmd_down', 'cmd_stop', 'cmd_slider'],
            'lock' => ['cmd_open', 'cmd_close'],
            'thermostat' => ['cmd_set_setpoint'],
        ];
    }

    private static function normalizeLayout(array $layout): array {
        $theme = self::sanitizeTheme($layout['theme'] ?? 'dark');
        $tabs = [];
        foreach (array_slice(($layout['tabs'] ?? []), 0, 20) as $tab) {
            if (!is_array($tab)) {
                continue;
            }
            $id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($tab['id'] ?? ''));
            if ($id === '') {
                continue;
            }
            $name = trim((string) ($tab['name'] ?? ''));
            $tabs[] = [
                'id' => $id,
                'name' => mb_substr($name !== '' ? $name : 'General', 0, 40),
            ];
        }
        if (count($tabs) === 0) {
            $tabs[] = ['id' => 'default', 'name' => 'General'];
        }
        $tabIds = array_column($tabs, 'id');
        $fallbackTabId = $tabIds[0];
        $widgets = [];
        $allowedTypes = self::allowedWidgetTypes();

        foreach (($layout['widgets'] ?? []) as $widget) {
            if (!is_array($widget) || !in_array(($widget['type'] ?? ''), $allowedTypes, true)) {
                continue;
            }
            $tabId = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($widget['tabId'] ?? $fallbackTabId));
            if (!in_array($tabId, $tabIds, true)) {
                $tabId = $fallbackTabId;
            }

            $widgets[] = [
                'id' => preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($widget['id'] ?? uniqid('w', false))),
                'tabId' => $tabId,
                'type' => $widget['type'],
                'x' => max(0, (int) ($widget['x'] ?? 0)),
                'y' => max(0, (int) ($widget['y'] ?? 0)),
                'w' => max(1, min(12, (int) ($widget['w'] ?? 1))),
                'h' => max(1, min(6, (int) ($widget['h'] ?? 1))),
                'config' => self::sanitizeWidgetConfig($widget['config'] ?? []),
                'condition' => self::normalizeCondition($widget['condition'] ?? null),
            ];
        }

        $badges = [];
        foreach (array_slice(($layout['badges'] ?? []), 0, 20) as $badge) {
            if (!is_array($badge)) {
                continue;
            }
            $cmdId = (int) ($badge['cmd_id'] ?? 0);
            if ($cmdId <= 0) {
                continue;
            }
            $id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($badge['id'] ?? ''));
            $badges[] = [
                'id' => $id !== '' ? $id : uniqid('b', false),
                'cmd_id' => $cmdId,
                'cmd_action' => (int) ($badge['cmd_action'] ?? 0),
                'icon' => mb_substr(trim((string) ($badge['icon'] ?? '')), 0, 4),
                'label' => mb_substr(trim((string) ($badge['label'] ?? '')), 0, 30),
                'color_on' => preg_match('/^#[0-9a-fA-F]{3,6}$/', (string) ($badge['color_on'] ?? '')) ? (string) $badge['color_on'] : '',
            ];
        }

        return [
            'version' => 2,
            'theme' => $theme,
            'tabs' => $tabs,
            'badges' => $badges,
            'widgets' => $widgets,
        ];
    }

    private static function valueCmdId(cmd $cmd): int {
        return max(0, (int) $cmd->getValue());
    }

    private static function valueCmdValue(cmd $cmd) {
        $valueCmdId = self::valueCmdId($cmd);
        if ($valueCmdId <= 0) {
            return null;
        }
        $valueCmd = cmd::byId($valueCmdId);
        return is_object($valueCmd) ? $valueCmd->getCache('value') : null;
    }

    private static function normalizeCondition($raw): ?array {
        if (!is_array($raw)) {
            return null;
        }
        $id = (int) ($raw['cmd_id'] ?? 0);
        if ($id <= 0) {
            return null;
        }
        $validOperators = ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'truthy', 'falsy'];
        $op = in_array($raw['operator'] ?? '', $validOperators, true) ? $raw['operator'] : 'truthy';
        return [
            'cmd_id' => $id,
            'operator' => $op,
            'value' => isset($raw['value']) ? (string) $raw['value'] : '',
        ];
    }

    private static function sanitizeTheme($theme): string {
        $theme = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $theme);
        $allowed = ['dark', 'light', 'minimalist', 'mushroom', 'nord', 'solarized', 'aurora'];
        return in_array($theme, $allowed, true) ? $theme : 'dark';
    }

    private static function extractCmdId(array $_options): int {
        if (isset($_options['cmd_id'])) {
            return (int) $_options['cmd_id'];
        }
        if (isset($_options['event_id']) && preg_match('/cmd::update::([0-9]+)/', (string) $_options['event_id'], $matches)) {
            return (int) $matches[1];
        }
        return 0;
    }

    private static function sanitizeWidgetConfig($config): array {
        if (!is_array($config)) {
            return [];
        }

        $result = [];
        $actionKeys = ['tap_action', 'double_tap_action', 'hold_action'];
        $allowedActions = ['default', 'more-info', 'toggle', 'none'];
        foreach ($config as $key => $value) {
            if (!preg_match('/^[a-zA-Z0-9_:-]{1,40}$/', (string) $key)) {
                continue;
            }
            if (in_array($key, $actionKeys, true)) {
                if (is_string($value) && in_array($value, $allowedActions, true)) {
                    $result[$key] = $value;
                }
                continue;
            }
            if (is_bool($value) || is_int($value) || is_float($value)) {
                $result[$key] = $value;
                continue;
            }
            if (is_string($value)) {
                $result[$key] = mb_substr($value, 0, 120);
            }
        }
        return $result;
    }

    private static function widgetActionKeys(string $type): array {
        return self::widgetActionKeysByType()[$type] ?? [];
    }

    private static function hasEqLogicWithoutObject(): bool {
        foreach (eqLogic::all(true) as $eqLogic) {
            if ((int) $eqLogic->getObject_id() === 0) {
                return true;
            }
        }
        return false;
    }

    private static function eqLogicsByObjectId(int $objectId): array {
        if ($objectId !== 0) {
            return eqLogic::byObjectId($objectId, true, false);
        }

        $result = [];
        foreach (eqLogic::all(true) as $eqLogic) {
            if ((int) $eqLogic->getObject_id() === 0) {
                $result[] = $eqLogic;
            }
        }
        usort($result, function ($a, $b) {
            return strcasecmp($a->getName() . $a->getEqType_name(), $b->getName() . $b->getEqType_name());
        });
        return $result;
    }

    private static function isVisibleCmdInEqLogic(int $cmdId, int $eqLogicId, ?string $type = null): bool {
        if ($cmdId <= 0 || $eqLogicId <= 0) {
            return false;
        }
        $cmd = cmd::byId($cmdId);
        if (!is_object($cmd) || (int) $cmd->getEqLogic_id() !== $eqLogicId || (int) $cmd->getIsVisible() !== 1) {
            return false;
        }
        return $type === null || $cmd->getType() === $type;
    }

}
