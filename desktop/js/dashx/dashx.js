"use strict";

(function () {

const store = window.JeeDashStore;

const configElement = document.getElementById("jeedash-config");
const cfg = window.JEEDASH_CONFIG ?? (configElement ? JSON.parse(configElement.textContent || "{}") : {});
window.JEEDASH_CONFIG = cfg;
const appRoot = document.getElementById("app");
const compactStorageKey = "jeedash:compact:v1";
let simulatedFullscreen = false;
function applyTheme(theme) {
  const allowed = ["dark", "light", "minimalist", "mushroom", "nord", "solarized", "aurora"];
  const next = allowed.includes(theme) ? theme : "dark";
  document.documentElement.dataset.theme = next;
  appRoot?.setAttribute("data-theme", next);
  if (toolbarTheme) {
    toolbarTheme.value = next;
  }
}
function applyCompact(enabled) {
  appRoot?.classList.toggle("compact-mode", enabled);
  const btn = document.getElementById("btn-compact");
  if (btn) {
    btn.textContent = enabled ? "Standard" : "Compact";
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
  }
}
function syncFullscreenButton() {
  const active = Boolean(document.fullscreenElement) || simulatedFullscreen;
  appRoot?.classList.toggle("fullscreen-mode", active);
  const btn = document.getElementById("btn-fullscreen");
  if (btn) {
    btn.textContent = active ? "✕ Quitter" : "⛶ Plein écran";
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  }
}
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      simulatedFullscreen = false;
    } else if (simulatedFullscreen) {
      simulatedFullscreen = false;
    } else if (appRoot?.requestFullscreen) {
      await appRoot.requestFullscreen();
      simulatedFullscreen = !document.fullscreenElement;
    } else {
      simulatedFullscreen = true;
    }
  } catch (error) {
    simulatedFullscreen = true;
  }
  syncFullscreenButton();
}
const I18N = cfg.i18n ?? {};
function t(key, vars = {}) {
  let str = I18N[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}
function setSseStatus(state) {
  const el = document.querySelector(".sse-status");
  if (!el) {
    return;
  }
  el.classList.remove("connected", "reconnecting", "offline");
  const labels = {
    connected: t("sse_connected"),
    reconnecting: t("sse_reconnecting"),
    offline: t("sse_offline"),
  };
  if (state === "connected") {
    el.classList.add("connected");
  } else if (state === "reconnecting") {
    el.classList.add("reconnecting");
  } else {
    el.classList.add("offline");
  }
  el.title = labels[state] ?? labels.offline;
  el.setAttribute("aria-label", el.title);
}
window.JeeDashApi = window.JeeDashApi ?? {};
window.JeeDashI18n = { t };

function closeDashDialog() {}

function openDashDialog({ title = "", message = "", fields = [], confirmLabel = t("modal_ok"), cancelLabel = t("modal_cancel"), danger = false }) {
  const overlay = document.getElementById("dash-dialog-overlay");
  const form = document.getElementById("dash-dialog");
  const titleEl = document.getElementById("dash-dialog-title");
  const messageEl = document.getElementById("dash-dialog-message");
  const fieldsEl = document.getElementById("dash-dialog-fields");
  const cancelBtn = document.getElementById("dash-dialog-cancel");
  const confirmBtn = document.getElementById("dash-dialog-confirm");
  if (!overlay || !form || !titleEl || !messageEl || !fieldsEl || !cancelBtn || !confirmBtn) {
    return Promise.resolve(null);
  }

  closeDashDialog();
  titleEl.textContent = title;
  messageEl.textContent = message;
  messageEl.hidden = message === "";
  fieldsEl.replaceChildren();
  cancelBtn.textContent = cancelLabel;
  confirmBtn.textContent = confirmLabel;
  confirmBtn.classList.toggle("danger", Boolean(danger));

  for (const field of fields) {
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = document.createElement("input");
    input.name = field.name;
    input.type = field.type ?? "text";
    input.value = field.value ?? "";
    input.autocomplete = "off";
    if (field.maxLength) {
      input.maxLength = field.maxLength;
    }
    if (field.required) {
      input.required = true;
    }
    label.append(input);
    fieldsEl.append(label);
  }

  overlay.hidden = false;
  const firstInput = fieldsEl.querySelector("input");
  (firstInput ?? confirmBtn).focus();

  return new Promise((resolve) => {
    const finish = (value) => {
      overlay.hidden = true;
      form.onsubmit = null;
      cancelBtn.onclick = null;
      overlay.onclick = null;
      document.removeEventListener("keydown", onKeydown);
      fieldsEl.replaceChildren();
      closeDashDialog = function () {};
      resolve(value);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        finish(null);
      }
    };
    closeDashDialog = () => finish(null);
    form.onsubmit = (event) => {
      event.preventDefault();
      const values = {};
      for (const input of fieldsEl.querySelectorAll("input")) {
        values[input.name] = input.value;
      }
      finish(fields.length > 0 ? values : true);
    };
    cancelBtn.onclick = () => finish(null);
    overlay.onclick = (event) => {
      if (event.target === overlay) {
        finish(null);
      }
    };
    document.addEventListener("keydown", onKeydown);
  });
}

function askConfirm(message, options = {}) {
  return openDashDialog({
    title: options.title ?? t("modal_confirm"),
    message,
    confirmLabel: options.confirmLabel ?? t("modal_confirm"),
    cancelLabel: options.cancelLabel ?? t("modal_cancel"),
    danger: options.danger ?? false,
  }).then(Boolean);
}

async function askText({ title, label, value = "", maxLength = 80 }) {
  const result = await openDashDialog({
    title,
    fields: [{ name: "value", label, value, maxLength, required: true }],
    confirmLabel: t("modal_ok"),
  });
  return result?.value ?? null;
}

function askFields({ title, fields }) {
  return openDashDialog({
    title,
    fields,
    confirmLabel: t("modal_ok"),
  });
}
window.JeeDashDialog = { askConfirm, askFields, askText };
const grid = document.getElementById("grid");
const badgeBar = document.getElementById("badge-bar");
const floatingToolbar = document.getElementById("floating-toolbar");
const moreInfoOverlay = document.getElementById("more-info-overlay");
const moreInfoPanel = document.getElementById("more-info-panel");
const moreInfoTitle = document.getElementById("more-info-title");
const moreInfoBody = document.getElementById("more-info-body");
const moreInfoClose = document.getElementById("more-info-close");
const editor = document.getElementById("widget-editor");
const widgetType = document.getElementById("widget-type");
const widgetLabel = document.getElementById("widget-label");
const widgetW = document.getElementById("widget-w");
const widgetH = document.getElementById("widget-h");
const objectSelect = document.getElementById("object-select");
const eqLogicSelect = document.getElementById("eqlogic-select");
const commandFields = document.getElementById("command-fields");
const widgetTapAction = document.getElementById("widget-tap-action");
const widgetDblAction = document.getElementById("widget-dbl-action");
const widgetHoldAction = document.getElementById("widget-hold-action");
const importFile = document.getElementById("import-file");
const toolbarTheme = document.getElementById("toolbar-theme");
const gestureActions = new Set(["default", "more-info", "toggle", "none"]);
applyTheme(cfg.theme);
let layout = { version: 2, theme: "dark", tabs: [{ id: "default", name: "General" }], widgets: [] };
let activeTabId = null;
let editMode = false;
let editDirty = false;
let editSnapshot = null;
let eventSource = null;
let selectedWidgetId = null;
let editingWidgetId = null;
let objectCatalog = [];
let eqLogicCatalog = [];
let moreInfoUnsubs = [];
const cmdShellMap = new Map();
let saveTimer = null;
let saveInFlight = false;
let saveAgain = false;
let sseReconnectTimer = null;
let sseRetryCount = 0;


function showToast(msg, type = "error") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.append(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.append(toast);
  void toast.offsetWidth;
  toast.classList.add("toast-visible");
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3000);
}

const widgetDefinitions = window.JeeDashWidgetDefinitions ?? {};


function endpoint(file, params = {}) {
  const url = new URL(`${cfg.apiBase ?? "../core/php"}/${file}`, window.location.href);
  if (cfg.token) {
    url.searchParams.set("token", cfg.token);
  } else if (cfg.apikey) {
    url.searchParams.set("apikey", cfg.apikey);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function sseEndpoint() {
  const url = new URL(cfg.sseUrl ?? "../sse", window.location.href);
  if (cfg.token) {
    url.searchParams.set("token", cfg.token);
  } else if (cfg.apikey) {
    url.searchParams.set("apikey", cfg.apikey);
  }
  return url.toString();
}

async function fetchJson(action, params = {}, options = {}) {
  const response = await fetch(endpoint("dashx.ajax.php", { action, ...params }), options);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error ?? `HTTP ${response.status}`);
    error.code = data?.code;
    error.command = data?.command;
    throw error;
  }
  return data;
}

function askAccessCode() {
  if (typeof jeeDialog !== "undefined" && typeof jeeDialog.prompt === "function") {
    return new Promise((resolve) => {
      jeeDialog.prompt({
        title: "Code d'accès",
        message: '<input class="promptAttr" data-l1key="result" type="password" autocomplete="off">',
        inputType: false,
      }, resolve);
    });
  }
  return Promise.resolve(window.prompt("Veuillez indiquer le code d'accès ?", ""));
}

function askActionConfirm(command) {
  const message = `Confirmer l'exécution de « ${command || "cette commande"} » ?`;
  if (typeof jeeDialog !== "undefined" && typeof jeeDialog.confirm === "function") {
    const escapedMessage = message.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    })[character]);
    return new Promise((resolve) => jeeDialog.confirm(escapedMessage, (result) => resolve(Boolean(result))));
  }
  return Promise.resolve(window.confirm(message));
}

async function execCmd(cmdId, options = {}, handled = {}) {
  try {
    return await fetchJson("execCmd", { id: String(cmdId) }, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
  } catch (error) {
    if (error?.code === "code_required" && !handled.code) {
      const codeAccess = await askAccessCode();
      if (codeAccess === null) {
        return null;
      }
      return execCmd(cmdId, { ...options, codeAccess }, { ...handled, code: true });
    }
    if (error?.code === "confirm_required" && !handled.confirm) {
      if (!await askActionConfirm(error.command)) {
        return null;
      }
      return execCmd(cmdId, { ...options, confirmAction: 1 }, { ...handled, confirm: true });
    }
    throw error;
  }
}

async function getCmd(cmdId) {
  return fetchJson("getCmd", { id: String(cmdId) });
}

async function getEqLogic(eqLogicId) {
  return fetchJson("getEqLogic", { id: String(eqLogicId) });
}

async function getSummary() {
  return fetchJson("getSummary");
}

async function getHistory(cmdId, hours = 24) {
  return fetchJson("getHistory", { id: String(cmdId), hours: String(hours) });
}

window.JeeDashApi = { execCmd, getCmd, getEqLogic, getSummary, getHistory };

async function saveLayoutNow() {
  if (!cfg.canEdit) {
    return false;
  }
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (saveInFlight) {
    saveAgain = true;
    return false;
  }

  saveInFlight = true;
  let saved = false;
  try {
    await fetchJson("saveLayout", {}, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layout),
    });
    saved = true;
    flashSaveButton();
  } catch (error) {
    console.error("[JeeDash] save layout", error);
    showToast(t("toast_save_error") + error.message);
  } finally {
    saveInFlight = false;
    if (saveAgain) {
      saveAgain = false;
      scheduleLayoutSave();
    }
  }
  return saved;
}

function cloneLayout(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function flashSaveButton() {
  const btn = document.getElementById("btn-save");
  if (!btn) {
    return;
  }
  const original = btn.textContent;
  btn.textContent = "✓ Sauve";
  btn.classList.add("btn-saved");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("btn-saved");
  }, 1500);
}

function scheduleLayoutSave(delay = 900) {
  if (!cfg.canEdit || editMode) {
    if (editMode) {
      markEditDirty();
    }
    return;
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveLayoutNow();
  }, delay);
}

function flushLayoutSave() {
  if (!cfg.canEdit || editMode || !saveTimer) {
    return;
  }
  clearTimeout(saveTimer);
  saveTimer = null;
  fetch(endpoint("dashx.ajax.php", { action: "saveLayout" }), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(layout),
    keepalive: true,
  }).catch(() => {});
}

function exportLayout() {
  window.location.assign(endpoint("dashx.ajax.php", { action: "exportLayout" }));
}

async function importLayout(file) {
  if (!cfg.canEdit) {
    return;
  }
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    showToast(t("toast_json_invalid"));
    return;
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.widgets)) {
    showToast(t("toast_format_invalid"));
    return;
  }
  if (!await askConfirm(t("confirm_import", { n: parsed.widgets.length }))) {
    return;
  }
  try {
    const result = await fetchJson("saveLayout", {}, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    layout = result.layout ?? parsed;
    activeTabId = tabIdFromHash() ?? layout.tabs?.[0]?.id ?? null;
    syncTabHash(true);
    applyTheme(layout.theme);
    await preloadStates(commandIdsFromLayout(layout));
    renderLayout();
  } catch (error) {
    console.error("[JeeDash] import layout", error);
    showToast(t("toast_import_error") + error.message);
  }
}

function commandIdsFromLayout(value) {
  const ids = new Set();
  for (const badge of value.badges ?? []) {
    const cmdId = Number(badge.cmd_id);
    if (Number.isInteger(cmdId) && cmdId > 0) {
      ids.add(String(cmdId));
    }
  }
  for (const widget of value.widgets ?? []) {
    const condId = Number(widget.condition?.cmd_id);
    if (Number.isInteger(condId) && condId > 0) {
      ids.add(String(condId));
    }
    for (const [key, rawValue] of Object.entries(widget.config ?? {})) {
      const cmdId = Number(rawValue);
      if (key.startsWith("cmd_") && Number.isInteger(cmdId) && cmdId > 0) {
        ids.add(String(cmdId));
      }
    }
  }
  return [...ids];
}

async function addBadge() {
  if (!cfg.canEdit) {
    return;
  }
  const values = await askFields({
    title: t("badge_dialog_title"),
    fields: [
      { name: "cmd_id", label: t("badge_cmd_label"), type: "number", required: true },
      { name: "icon", label: t("badge_icon_label"), value: "●", maxLength: 4 },
      { name: "label", label: t("badge_label_label"), value: "", maxLength: 30 },
    ],
  });
  if (!values) {
    return;
  }
  const cmdIdStr = values.cmd_id;
  const cmdId = Number.parseInt(cmdIdStr ?? "", 10);
  if (!cmdId || Number.isNaN(cmdId)) {
    return;
  }
  const icon = values.icon || "●";
  const label = values.label ?? "";
  layout.badges = layout.badges ?? [];
  layout.badges.push({
    id: `b${Date.now().toString(36)}`,
    cmd_id: cmdId,
    cmd_action: 0,
    icon: icon.slice(0, 4),
    label: label.slice(0, 30),
    color_on: "",
  });
  preloadStates([String(cmdId)]).catch((error) => console.warn("[JeeDash] preload badge failed", error));
  renderBadges();
  scheduleLayoutSave();
}

function deleteBadge(id) {
  if (!cfg.canEdit || !id) {
    return;
  }
  layout.badges = (layout.badges ?? []).filter((badge) => badge.id !== id);
  renderBadges();
  scheduleLayoutSave();
}

function renderBadges() {
  if (!badgeBar) {
    return;
  }
  for (const el of badgeBar.querySelectorAll("[data-badge-id]")) {
    el._badgeUnsub?.();
  }
  badgeBar.replaceChildren();

  if (editMode) {
    badgeBar.hidden = !cfg.canEdit;
    if (!cfg.canEdit) {
      return;
    }
    const add = document.createElement("button");
    add.type = "button";
    add.className = "badge-add";
    add.textContent = "+ Badge";
    add.addEventListener("click", addBadge);
    badgeBar.append(add);
    return;
  }

  const badges = layout.badges ?? [];
  badgeBar.hidden = badges.length === 0;
  for (const badge of badges) {
    const el = document.createElement(badge.cmd_action ? "button" : "span");
    el.className = "badge-item";
    el.dataset.badgeId = badge.id;
    if (badge.color_on) {
      el.style.setProperty("--badge-color", badge.color_on);
    }

    const iconEl = document.createElement("span");
    iconEl.className = "badge-icon";
    iconEl.textContent = badge.icon || "●";

    const valEl = document.createElement("span");
    valEl.className = "badge-value";
    valEl.textContent = "—";

    if (badge.label) {
      const labelEl = document.createElement("span");
      labelEl.className = "badge-label";
      labelEl.textContent = badge.label;
      el.append(iconEl, valEl, labelEl);
    } else {
      el.append(iconEl, valEl);
    }

    if (badge.cmd_action) {
      el.classList.add("badge-clickable");
      el.type = "button";
      el.addEventListener("click", () => {
        window.JeeDashApi?.execCmd(badge.cmd_action);
      });
    }

    const unsub = store.subscribe(badge.cmd_id, ({ value, unit }) => {
      const display = value !== null && value !== undefined ? `${String(value)}${unit ? ` ${unit}` : ""}` : "—";
      valEl.textContent = display;
      const active = value !== "" && value !== "0" && value !== null && value !== undefined;
      el.classList.toggle("badge-active", active && !!badge.color_on);
    });
    el._badgeUnsub = unsub;

    badgeBar.append(el);
  }
}

function unavailableMessage(state) {
  if (!state) {
    return "";
  }
  if (state.reason === "eqLogic_disabled") {
    return "Equipement desactive";
  }
  if (state.reason === "cmd_missing") {
    return "Commande indisponible";
  }
  return "Commande indisponible";
}

function unavailableStatesForWidget(widget) {
  const states = [];
  for (const [key, rawValue] of Object.entries(widget.config ?? {})) {
    const cmdId = Number(rawValue);
    if (!key.startsWith("cmd_") || !Number.isInteger(cmdId) || cmdId <= 0) {
      continue;
    }
    const state = store.get(cmdId);
    if (state?.available === false) {
      states.push(state);
    }
  }
  return states;
}

function applyWidgetAvailability(shell, widget) {
  const states = unavailableStatesForWidget(widget);
  const unavailable = states.length > 0;
  shell.classList.toggle("unavailable", unavailable);
  if (unavailable) {
    shell.dataset.unavailable = unavailableMessage(states[0]);
    return;
  }
  delete shell.dataset.unavailable;
}

function syncWidgetAvailability() {
  for (const widget of layout.widgets ?? []) {
    const shell = grid.querySelector(`[data-widget-id="${CSS.escape(widget.id)}"]`);
    if (shell) {
      applyWidgetAvailability(shell, widget);
    }
  }
}

function evaluateCondition(condition, value) {
  if (!condition) {
    return true;
  }
  const v = String(value ?? "").trim();
  const ref = String(condition.value ?? "").trim();
  const num = Number.parseFloat(v);
  const refNum = Number.parseFloat(ref);
  switch (condition.operator) {
    case "eq":
      return v === ref;
    case "ne":
      return v !== ref;
    case "gt":
      return !Number.isNaN(num) && !Number.isNaN(refNum) && num > refNum;
    case "lt":
      return !Number.isNaN(num) && !Number.isNaN(refNum) && num < refNum;
    case "gte":
      return !Number.isNaN(num) && !Number.isNaN(refNum) && num >= refNum;
    case "lte":
      return !Number.isNaN(num) && !Number.isNaN(refNum) && num <= refNum;
    case "truthy":
      return v !== "" && v !== "0" && v !== "false";
    case "falsy":
      return v === "" || v === "0" || v === "false";
    default:
      return true;
  }
}

function syncEditToolbar() {
  const editButton = document.getElementById("btn-edit");
  const addButton = document.getElementById("btn-add");
  const saveButton = document.getElementById("btn-save");
  const cancelButton = document.getElementById("btn-cancel-edit");
  const status = document.getElementById("edit-status");
  // En édition, on masque les groupes de toolbar non-éditants (cf. CSS #app.editing).
  appRoot?.classList.toggle("editing", cfg.canEdit && editMode);
  if (addButton) {
    addButton.hidden = !cfg.canEdit || !editMode;
  }
  if (editButton) {
    editButton.hidden = !cfg.canEdit || editMode;
  }
  if (saveButton) {
    saveButton.hidden = !cfg.canEdit || !editMode;
    saveButton.disabled = false;
    saveButton.title = editDirty ? "Sauvegarder" : "Quitter le mode edition";
  }
  if (cancelButton) {
    cancelButton.hidden = !cfg.canEdit || !editMode;
  }
  if (status) {
    const shouldShowStatus = cfg.canEdit && editMode;
    status.classList.toggle("hidden", !shouldShowStatus);
    if (!shouldShowStatus) {
      status.textContent = "";
      status.classList.remove("dirty");
      return;
    }
    const selectedWidget = editMode ? widgetById(selectedWidgetId) : null;
    const stateLabel = editDirty ? "Modifie" : "A jour";
    const widgetLabel = selectedWidget ? `${selectedWidget.config?.label || selectedWidget.type} - ${selectedWidget.w ?? 1} x ${selectedWidget.h ?? 1}` : "";
    status.textContent = selectedWidget ? `${stateLabel} - ${widgetLabel}` : "Mode edition";
    status.classList.toggle("dirty", editDirty);
  }
}

function markEditDirty() {
  if (!editMode || editDirty) {
    return;
  }
  editDirty = true;
  syncEditToolbar();
}

function enterEditMode() {
  if (!cfg.canEdit) {
    return;
  }
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  editSnapshot = cloneLayout(layout);
  editMode = true;
  editDirty = false;
  renderLayout();
  syncEditToolbar();
}

function exitEditMode() {
  hideFloatingToolbar();
  editMode = false;
  editDirty = false;
  editSnapshot = null;
  selectedWidgetId = null;
  resetEditorMode();
  editor.hidden = true;
  renderLayout();
  syncEditToolbar();
}

function cancelEditMode() {
  if (editSnapshot) {
    layout = cloneLayout(editSnapshot);
    activeTabId = layout.tabs?.some((tab) => tab.id === activeTabId) ? activeTabId : layout.tabs?.[0]?.id ?? null;
    applyTheme(layout.theme);
    preloadStates(commandIdsFromLayout(layout)).catch((error) =>
      console.warn("[JeeDash] preload after cancel failed", error)
    );
  }
  exitEditMode();
}

async function requestCancelEditMode() {
  if (editDirty && !await askConfirm(t("confirm_cancel_edit"))) {
    return;
  }
  cancelEditMode();
}

async function saveEditMode() {
  if (!cfg.canEdit) {
    return;
  }
  if (editMode && !editDirty) {
    exitEditMode();
    return;
  }
  if (await saveLayoutNow()) {
    exitEditMode();
  }
}

async function preloadStates(ids) {
  if (ids.length === 0) {
    return;
  }
  const commands = await fetchJson("getCmds", { ids: ids.join(",") });
  for (const command of commands) {
    store.setCommand(command);
  }
}

function widgetTag(type) {
  return {
    divider: "widget-divider",
    equipment: "widget-equipment",
    light: "widget-light",
    color: "widget-color",
    scene: "widget-scene",
    select: "widget-select",
    media: "widget-media",
    electricity: "widget-electricity",
    weather: "widget-weather",
    alarm: "widget-alarm",
    fan: "widget-fan",
    garage: "widget-garage",
    message: "widget-message",
    dialogue: "widget-dialogue",
    text: "widget-text",
    timer: "widget-timer",
    hygrostat: "widget-hygrostat",
    battery: "widget-battery",
    airQuality: "widget-air-quality",
    presence: "widget-presence",
    systemHealth: "widget-system-health",
    dimmer: "widget-dimmer",
    sensor: "widget-sensor",
    camera: "widget-camera",
    switch: "widget-switch",
    cover: "widget-cover",
    climate: "widget-climate",
    summary: "widget-summary",
    binary: "widget-binary",
    lock: "widget-lock",
    thermostat: "widget-thermostat",
    chart: "widget-chart",
  }[type] ?? "";
}

function placeShell(shell, widget) {
  const w = Math.max(1, Math.min(12, Number(widget.w ?? 1)));
  const h = Math.max(1, Math.min(6, Number(widget.h ?? 1)));
  shell.style.setProperty("--w", String(w));
  shell.style.setProperty("--h", String(h));
  shell.dataset.size = `${w} × ${h}`;
}

function makeWidgetId() {
  return `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function duplicateWidget(widget) {
  if (!cfg.canEdit || !editMode || !widget) {
    return;
  }
  const copy = cloneLayout(widget);
  copy.id = makeWidgetId();
  copy.x = 0;
  copy.y = 0;
  copy.tabId = activeTabId ?? widget.tabId ?? layout.tabs?.[0]?.id ?? "default";
  layout.widgets.push(copy);
  selectedWidgetId = copy.id;
  preloadStates(commandIdsFromLayout({ widgets: [copy] })).catch((error) =>
    console.warn("[JeeDash] preload duplicate failed", error)
  );
  renderLayout();
  showFloatingToolbar(copy.id);
  scheduleLayoutSave();
}

function resizeWidgetBy(widget, dw, dh) {
  if (!cfg.canEdit || !editMode || !widget) {
    return;
  }
  const nextW = Math.max(1, Math.min(12, Number(widget.w ?? 1) + dw));
  const nextH = Math.max(1, Math.min(6, Number(widget.h ?? 1) + dh));
  if (nextW === Number(widget.w ?? 1) && nextH === Number(widget.h ?? 1)) {
    return;
  }
  widget.w = nextW;
  widget.h = nextH;
  selectedWidgetId = widget.id;
  renderLayout();
  scheduleLayoutSave();
}

function positionFloatingToolbar(shell) {
  if (!floatingToolbar || !shell || !appRoot) {
    return;
  }
  const rect = shell.getBoundingClientRect();
  const appRect = appRoot.getBoundingClientRect();
  const needed = floatingToolbar.offsetHeight + 6;
  // Place la toolbar AU-DESSUS de la tuile seulement s'il reste assez d'espace
  // entre le bas de la barre d'onglets (chrome fixe) et le haut de la tuile.
  // Sinon (tuile en haut de grille, ou éditeur ouvert qui descend les onglets),
  // on la bascule SOUS la tuile pour ne pas recouvrir les onglets.
  const tabBar = document.getElementById("tab-bar");
  const chromeBottom = tabBar ? tabBar.getBoundingClientRect().bottom : appRect.top;
  const roomAbove = rect.top - chromeBottom;
  const base = rect.top - appRect.top + appRoot.scrollTop;
  const top = roomAbove >= needed
    ? base - needed
    : rect.bottom - appRect.top + appRoot.scrollTop + 6;
  const left = rect.left - appRect.left + appRoot.scrollLeft;
  floatingToolbar.style.top = `${top}px`;
  floatingToolbar.style.left = `${Math.max(0, left)}px`;
  floatingToolbar.style.width = `${rect.width}px`;
}

function showFloatingToolbar(widgetId) {
  if (!floatingToolbar || !editMode || !widgetId) {
    return;
  }
  const shell = grid.querySelector(`[data-widget-id="${CSS.escape(widgetId)}"]`);
  if (!shell) {
    hideFloatingToolbar();
    return;
  }
  floatingToolbar.dataset.widgetId = widgetId;
  floatingToolbar.hidden = false;
  positionFloatingToolbar(shell);
}

function hideFloatingToolbar() {
  if (!floatingToolbar) {
    return;
  }
  floatingToolbar.hidden = true;
  delete floatingToolbar.dataset.widgetId;
}

function indexCmdShells() {
  cmdShellMap.clear();
  for (const shell of grid.querySelectorAll("[data-widget-id]")) {
    const widget = widgetById(shell.dataset.widgetId);
    if (!widget?.config) {
      continue;
    }
    for (const [key, value] of Object.entries(widget.config)) {
      if (!key.startsWith("cmd_")) {
        continue;
      }
      const id = Number(value);
      if (!Number.isFinite(id) || id <= 0) {
        continue;
      }
      if (!cmdShellMap.has(id)) {
        cmdShellMap.set(id, new Set());
      }
      cmdShellMap.get(id).add(shell);
      if (store.get(id)) {
        shell.classList.remove("is-loading");
      }
    }
  }
}

function flashShellValue(payload) {
  const cmdId = Number(payload?.cmdId ?? payload);
  const shells = cmdShellMap.get(cmdId);
  if (!shells) {
    return;
  }
  for (const shell of shells) {
    shell.classList.remove("is-loading");
    const value = shell.querySelector(".widget-value");
    if (!value) {
      continue;
    }
    value.classList.remove("jd-flash");
    void value.offsetWidth;
    value.classList.add("jd-flash");
  }
}

function formatCmdValue(value, unit = "") {
  return `${value ?? "-"}${unit ? ` ${unit}` : ""}`;
}

function closeMoreInfo() {
  if (!moreInfoOverlay || !moreInfoBody) {
    return;
  }
  moreInfoOverlay.hidden = true;
  moreInfoBody.replaceChildren();
  for (const unsub of moreInfoUnsubs) {
    unsub();
  }
  moreInfoUnsubs = [];
}

function renderMoreInfoChart(cmdId, container) {
  getHistory(cmdId, 24).then((data) => {
    const points = data?.points ?? [];
    if (points.length < 2) {
      return;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "minfo-sparkline");
    svg.setAttribute("viewBox", "0 0 100 30");
    svg.setAttribute("preserveAspectRatio", "none");
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    poly.setAttribute("class", "minfo-spark-line");
    const xs = points.map((point) => Number(point.t));
    const ys = points.map((point) => Number(point.v));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    poly.setAttribute("points", points.map((point) => {
      const x = ((Number(point.t) - minX) / spanX) * 100;
      const y = 30 - ((Number(point.v) - minY) / spanY) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" "));
    svg.append(poly);
    container.replaceChildren(svg);
  }).catch(() => {});
}

function renderMoreInfoCommand(cmd) {
  const row = document.createElement("div");
  row.className = "minfo-cmd-row";

  const name = document.createElement("span");
  name.className = "minfo-cmd-name";
  name.textContent = cmd.name;
  row.append(name);

  if (cmd.type === "action") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "minfo-cmd-btn";
    button.textContent = "Executer";
    button.addEventListener("click", () => {
      execCmd(cmd.id).catch((error) => showToast(error.message));
    });
    row.append(button);
    return row;
  }

  const value = document.createElement("span");
  value.className = "minfo-cmd-val";
  const current = store.get(cmd.id);
  value.textContent = current ? formatCmdValue(current.value, current.unit) : formatCmdValue(cmd.value, cmd.unit);
  moreInfoUnsubs.push(store.subscribe(cmd.id, (state) => {
    value.textContent = formatCmdValue(state.value, state.unit ?? cmd.unit);
  }));
  row.append(value);
  return row;
}

function renderMoreInfoMetaRow(label, value) {
  const row = document.createElement("div");
  row.className = "minfo-meta-row";
  const labelEl = document.createElement("span");
  labelEl.className = "minfo-meta-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("span");
  valueEl.className = "minfo-meta-value";
  valueEl.textContent = value || "-";
  row.append(labelEl, valueEl);
  return row;
}

function renderEquipmentMoreInfo(widget) {
  const section = document.createElement("div");
  section.className = "minfo-summary";
  const title = document.createElement("h4");
  title.className = "minfo-section-title";
  title.textContent = t("moreinfo_equipment_title");
  section.append(
    title,
    renderMoreInfoMetaRow(t("moreinfo_eqlogic_id"), String(widget.config?.eqlogic_id ?? "-")),
    renderMoreInfoMetaRow(t("moreinfo_size"), `${widget.w ?? 1} x ${widget.h ?? 1}`),
    renderMoreInfoMetaRow(t("moreinfo_columns"), widget.config?.columns ? String(widget.config.columns) : t("moreinfo_auto")),
    renderMoreInfoMetaRow(t("moreinfo_actions"), widget.config?.show_actions === "0" ? t("moreinfo_actions_hidden") : t("moreinfo_actions_visible")),
  );
  const note = document.createElement("p");
  note.className = "minfo-empty";
  note.textContent = t("moreinfo_equipment_note");
  section.append(note);
  return section;
}

function appendMoreInfoActions(widget) {
  if (!cfg.canEdit || !moreInfoBody) {
    return;
  }
  const actions = document.createElement("div");
  actions.className = "minfo-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "minfo-action-btn";
  editButton.textContent = t("moreinfo_edit_widget");
  editButton.addEventListener("click", () => {
    const widgetId = widget.id;
    closeMoreInfo();
    if (!editMode) {
      enterEditMode();
    }
    const current = widgetById(widgetId);
    if (!current) {
      return;
    }
    selectedWidgetId = current.id;
    renderLayout();
    openEditorForWidget(current).catch((error) => console.error("[JeeDash] open editor", error));
  });
  actions.append(editButton);
  moreInfoBody.append(actions);
}

async function openMoreInfo(widget) {
  if (!widget || editMode || !moreInfoOverlay || !moreInfoTitle || !moreInfoBody) {
    return;
  }
  closeMoreInfo();
  moreInfoTitle.textContent = widget.config?.label ?? widget.type;
  if (widget.type === "equipment") {
    moreInfoBody.replaceChildren(renderEquipmentMoreInfo(widget));
    appendMoreInfoActions(widget);
    moreInfoOverlay.hidden = false;
    return;
  }
  const loading = document.createElement("p");
  loading.className = "minfo-empty";
  loading.textContent = "Chargement...";
  moreInfoBody.replaceChildren(loading);
  moreInfoOverlay.hidden = false;

  const body = document.createDocumentFragment();
  const mainCmdId = firstWidgetCommandId(widget);
  let eqLogicId = Number(widget.config?.eqlogic_id ?? 0) || null;
  let eqLogicName = "";
  const chartSlot = document.createElement("div");
  chartSlot.className = "minfo-chart";

  if (mainCmdId) {
    try {
      const cmd = await getCmd(mainCmdId);
      eqLogicId = cmd.eqLogic?.id ?? null;
      eqLogicName = cmd.eqLogic?.name ?? "";
      const stateRow = document.createElement("div");
      stateRow.className = "minfo-state-row";
      const stateValue = document.createElement("span");
      stateValue.className = "minfo-state-value";
      stateValue.textContent = formatCmdValue(cmd.value, cmd.unit);
      const stateDate = document.createElement("span");
      stateDate.className = "minfo-state-date";
      stateDate.textContent = cmd.datetime ? new Date(cmd.datetime).toLocaleString() : "";
      stateRow.append(stateValue, stateDate);
      body.append(stateRow);
      body.append(chartSlot);
      moreInfoUnsubs.push(store.subscribe(mainCmdId, ({ value, unit, datetime }) => {
        stateValue.textContent = formatCmdValue(value, unit ?? cmd.unit);
        if (datetime) {
          stateDate.textContent = new Date(datetime).toLocaleString();
        }
      }));
      renderMoreInfoChart(mainCmdId, chartSlot);
    } catch (error) {
      console.warn("[JeeDash] more-info cmd", error);
    }
  }

  moreInfoBody.replaceChildren(body);

  if (eqLogicId) {
    const section = document.createElement("div");
    section.className = "minfo-cmds";
    const title = document.createElement("h4");
    title.className = "minfo-section-title";
    title.textContent = eqLogicName || "Commandes";
    const loading = document.createElement("p");
    loading.className = "minfo-empty";
    loading.textContent = "Chargement des commandes...";
    section.append(title, loading);
    moreInfoBody.append(section);

    try {
      const eqLogic = await getEqLogic(eqLogicId);
      if (eqLogic) {
        title.textContent = eqLogic.name || eqLogicName || "Commandes";
        section.replaceChildren(title);
        for (const cmd of eqLogic.cmds ?? []) {
          section.append(renderMoreInfoCommand(cmd));
        }
      } else {
        loading.textContent = "Commandes indisponibles.";
      }
    } catch (error) {
      console.warn("[JeeDash] more-info eqLogic", error);
      loading.textContent = "Commandes indisponibles.";
    }
  }

  if (!moreInfoBody.childElementCount) {
    const empty = document.createElement("p");
    empty.className = "minfo-empty";
    empty.textContent = "Aucune information disponible.";
    moreInfoBody.append(empty);
  }
  appendMoreInfoActions(widget);
}

function interactionValue(select) {
  const value = select?.value ?? "default";
  return gestureActions.has(value) ? value : "default";
}

function setInteractionControls(config = {}) {
  if (widgetTapAction) {
    widgetTapAction.value = gestureActions.has(config.tap_action) ? config.tap_action : "default";
  }
  if (widgetDblAction) {
    widgetDblAction.value = gestureActions.has(config.double_tap_action) ? config.double_tap_action : "default";
  }
  if (widgetHoldAction) {
    widgetHoldAction.value = gestureActions.has(config.hold_action) ? config.hold_action : "default";
  }
}

function applyInteractionConfig(config, source = {}) {
  const values = {
    tap_action: source.tap_action ?? interactionValue(widgetTapAction),
    double_tap_action: source.double_tap_action ?? interactionValue(widgetDblAction),
    hold_action: source.hold_action ?? interactionValue(widgetHoldAction),
  };
  for (const [key, value] of Object.entries(values)) {
    if (value === "default") {
      delete config[key];
    } else {
      config[key] = value;
    }
  }
}

function booleanState(value) {
  const normalized = String(value ?? "").toLowerCase();
  return ["1", "true", "on", "open", "opened", "active", "armed"].includes(normalized);
}

function primaryToggleCmd(widget) {
  const config = widget?.config ?? {};
  switch (widget?.type) {
    case "switch":
      return config.cmd_toggle ?? null;
    case "garage":
      return config.cmd_toggle ?? config.cmd_open ?? null;
    case "scene":
    case "select":
    case "message":
    case "dialogue":
    case "text":
      return config.cmd_action ?? null;
    case "light":
    case "color":
    case "fan": {
      const state = store.get(config.cmd_state);
      return booleanState(state?.value) ? config.cmd_off ?? null : config.cmd_on ?? null;
    }
    case "cover":
      return config.cmd_up ?? config.cmd_down ?? null;
    case "lock":
      return config.cmd_open ?? config.cmd_close ?? null;
    default:
      return null;
  }
}

function runWidgetGesture(widget, slot) {
  if (editMode || !widget) {
    return;
  }
  const config = widget.config ?? {};
  let action = config[slot] ?? "default";
  if (!gestureActions.has(action)) {
    action = "default";
  }
  if (action === "default") {
    // Défaut : clic simple = rien ; appui long = bascule (si toggle) sinon détails ;
    // double-clic = détails. (Pas de détails sur une tuile équipement.)
    const hasToggle = Boolean(primaryToggleCmd(widget));
    const canInfo = widget.type !== "equipment";
    if (slot === "hold_action") {
      action = hasToggle ? "toggle" : (canInfo ? "more-info" : "none");
    } else if (slot === "double_tap_action") {
      action = canInfo ? "more-info" : "none";
    } else {
      action = "none";
    }
  }
  if (action === "none") {
    return;
  }
  if (action === "more-info") {
    openMoreInfo(widget).catch((error) => console.error("[JeeDash] more-info", error));
    return;
  }
  if (action === "toggle") {
    const cmdId = primaryToggleCmd(widget);
    if (cmdId) {
      execCmd(cmdId).catch((error) => showToast(error.message));
    } else {
      openMoreInfo(widget).catch((error) => console.error("[JeeDash] more-info", error));
    }
  }
}

function isGestureIgnoredTarget(target) {
  return Boolean(target?.closest?.("button,input,select,textarea,a,[role='button'],.resize-handle"));
}

function hasStaticCommandIds(widget) {
  return Object.entries(widget?.config ?? {}).some(([key, value]) => {
    const id = Number(value);
    return key.startsWith("cmd_") && Number.isFinite(id) && id > 0;
  });
}

function createWidget(widget) {
  const tag = widgetTag(widget.type);
  if (!tag) {
    return null;
  }

  const shell = document.createElement("section");
  shell.className = "widget-shell";
  if (hasStaticCommandIds(widget)) {
    shell.classList.add("is-loading");
  }
  shell.dataset.widgetId = widget.id;
  placeShell(shell, widget);
  const applyConfiguredSizeClasses = () => {
    const width = Number.parseInt(widget.w ?? "", 10);
    const height = Number.parseInt(widget.h ?? "", 10);
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      return;
    }
    const compact = width <= 1 || height <= 1;
    const large = width >= 3 && height >= 2;
    shell.classList.toggle("is-compact", compact);
    shell.classList.toggle("is-large", large && !compact);
  };
  const updateShellSizeClasses = ({ width, height }) => {
    const compact = width < 140 || height < 110;
    const large = width >= 280 && height >= 220;
    shell.classList.toggle("is-compact", compact);
    shell.classList.toggle("is-large", large && !compact);
  };
  const refreshShellSizeClasses = () => {
    const rect = shell.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    updateShellSizeClasses(rect);
  };
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(refreshShellSizeClasses);
  } else {
    window.setTimeout(refreshShellSizeClasses, 0);
    window.setTimeout(refreshShellSizeClasses, 100);
  }
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateShellSizeClasses(entry.contentRect);
      }
    });
    resizeObserver.observe(shell);
    shell._resizeObserver = resizeObserver;
  } else {
    window.addEventListener("resize", refreshShellSizeClasses, { passive: true });
    shell._resizeFallback = refreshShellSizeClasses;
  }
  applyConfiguredSizeClasses();

  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(widget.config ?? {})) {
    element.setAttribute(key.replaceAll("_", "-"), String(value));
  }

  const resize = document.createElement("span");
  resize.className = "resize-handle";
  resize.title = "Redimensionner";
  resize.setAttribute("aria-label", "Redimensionner");
  resize.textContent = "↘";

  let pressTimer = null;
  let tapTimer = null;
  let longPressed = false;
  const clearPressTimer = () => {
    clearTimeout(pressTimer);
    pressTimer = null;
  };
  shell.addEventListener("pointerdown", (event) => {
    if (editMode || event.defaultPrevented || isGestureIgnoredTarget(event.target)) {
      return;
    }
    longPressed = false;
    clearPressTimer();
    pressTimer = setTimeout(() => {
      longPressed = true;
      clearTimeout(tapTimer);
      tapTimer = null;
      runWidgetGesture(widget, "hold_action");
    }, 500);
  });
  shell.addEventListener("pointerup", (event) => {
    if (editMode || event.defaultPrevented || isGestureIgnoredTarget(event.target)) {
      clearPressTimer();
      return;
    }
    clearPressTimer();
    if (longPressed) {
      return;
    }
    if (tapTimer) {
      clearTimeout(tapTimer);
      tapTimer = null;
      runWidgetGesture(widget, "double_tap_action");
      return;
    }
    tapTimer = setTimeout(() => {
      tapTimer = null;
      runWidgetGesture(widget, "tap_action");
    }, 300);
  });
  shell.addEventListener("pointercancel", clearPressTimer);
  shell.addEventListener("pointerleave", clearPressTimer);

  shell.append(element, resize);
  if (widget.condition?.cmd_id) {
    const condId = String(widget.condition.cmd_id);
    const current = store.get(condId);
    shell.hidden = !evaluateCondition(widget.condition, current?.value ?? null);
    const unsub = store.subscribe(condId, ({ value }) => {
      shell.hidden = !evaluateCondition(widget.condition, value);
    });
    shell._condUnsub = unsub;
  }
  return shell;
}

function ensureActiveTab() {
  if (!Array.isArray(layout.tabs) || layout.tabs.length === 0) {
    layout.tabs = [{ id: "default", name: "General" }];
  }
  if (!layout.tabs.some((tab) => tab.id === activeTabId)) {
    activeTabId = layout.tabs[0].id;
  }
}

function tabIdFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const tabId = params.get("tab");
  return layout.tabs?.some((tab) => tab.id === tabId) ? tabId : null;
}

function syncTabHash(replace = false) {
  if (!activeTabId) {
    return;
  }
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (params.get("tab") === activeTabId) {
    return;
  }
  params.set("tab", activeTabId);
  const next = `${window.location.pathname}${window.location.search}#${params.toString()}`;
  if (replace) {
    window.history.replaceState(null, "", next);
    return;
  }
  window.history.pushState(null, "", next);
}

function activateTab(tabId, updateHash = true) {
  if (!layout.tabs?.some((tab) => tab.id === tabId)) {
    return false;
  }
  activeTabId = tabId;
  selectedWidgetId = null;
  hideFloatingToolbar();
  resetEditorMode();
  editor.hidden = true;
  renderLayout();
  if (updateHash) {
    syncTabHash();
  }
  return true;
}

async function addTab() {
  if (!cfg.canEdit || (layout.tabs?.length ?? 0) >= 20) {
    return;
  }
  const name = await askText({
    title: t("tab_dialog_title"),
    label: t("tab_name_label"),
    value: t("new_tab_default"),
    maxLength: 40,
  });
  if (!name?.trim()) {
    return;
  }
  const tab = {
    id: `tab${Date.now().toString(36)}`,
    name: name.trim().slice(0, 40),
  };
  layout.tabs.push(tab);
  activeTabId = tab.id;
  renderLayout();
  syncTabHash();
  scheduleLayoutSave();
}

async function renameTab(tab) {
  if (!cfg.canEdit) {
    return;
  }
  const name = await askText({
    title: t("tab_dialog_title"),
    label: t("tab_name_label"),
    value: tab.name,
    maxLength: 40,
  });
  if (!name?.trim()) {
    return;
  }
  tab.name = name.trim().slice(0, 40);
  renderTabs();
  scheduleLayoutSave();
}

function deleteTab(tabId) {
  if (!cfg.canEdit || (layout.tabs?.length ?? 0) <= 1) {
    return;
  }
  if ((layout.widgets ?? []).some((widget) => widget.tabId === tabId)) {
    showToast(t("tab_not_empty"), "error");
    return;
  }
  layout.tabs = layout.tabs.filter((tab) => tab.id !== tabId);
  if (activeTabId === tabId) {
    activeTabId = layout.tabs[0]?.id ?? null;
    syncTabHash(true);
  }
  renderLayout();
  scheduleLayoutSave();
}

function renderTabs() {
  const tabBar = document.getElementById("tab-bar");
  if (!tabBar) {
    return;
  }
  ensureActiveTab();
  tabBar.replaceChildren();
  for (const tab of layout.tabs) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-btn";
    button.classList.toggle("active", tab.id === activeTabId);
    button.textContent = tab.name;
    button.addEventListener("click", () => {
      activateTab(tab.id);
    });
    button.addEventListener("dblclick", () => renameTab(tab));
    if (editMode && layout.tabs.length > 1) {
      const close = document.createElement("span");
      close.className = "tab-delete";
      close.textContent = "x";
      close.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteTab(tab.id);
      });
      button.append(close);
    }
    tabBar.append(button);
  }
  if (editMode && layout.tabs.length < 20) {
    const add = document.createElement("button");
    add.type = "button";
    add.className = "tab-btn tab-add";
    add.textContent = "+";
    add.title = t("add_tab");
    add.addEventListener("click", addTab);
    tabBar.append(add);
  }
}

function renderLayout() {
  ensureActiveTab();
  renderBadges();
  renderTabs();
  for (const shell of grid.querySelectorAll("[data-widget-id]")) {
    shell._condUnsub?.();
    shell._resizeObserver?.disconnect();
    if (shell._resizeFallback) {
      window.removeEventListener("resize", shell._resizeFallback);
    }
  }
  grid.replaceChildren();
  const widgets = (layout.widgets ?? []).filter((widget) => widget.tabId === activeTabId);
  if (!widgets.length) {
    const empty = document.createElement("p");
    empty.className = "loading-msg";
    empty.textContent = t("no_widget");
    grid.append(empty);
    grid.classList.toggle("edit-mode", editMode);
    indexCmdShells();
    hideFloatingToolbar();
    syncEditToolbar();
    return;
  }

  for (const widget of widgets) {
    const element = createWidget(widget);
    if (element) {
      element.classList.toggle("selected", widget.id === selectedWidgetId);
      applyWidgetAvailability(element, widget);
      grid.append(element);
    }
  }
  grid.classList.toggle("edit-mode", editMode);
  if (editMode && selectedWidgetId && floatingToolbar && !floatingToolbar.hidden) {
    showFloatingToolbar(selectedWidgetId);
  }
  indexCmdShells();
  syncEditToolbar();
}

function renderSkeleton(count) {
  grid.replaceChildren();
  const n = Math.max(1, Math.min(count, 20));
  for (let i = 0; i < n; i++) {
    const shell = document.createElement("section");
    shell.className = "widget-shell";
    shell.style.setProperty("--w", "1");
    shell.style.setProperty("--h", "1");
    const skel = document.createElement("div");
    skel.className = "widget widget-skeleton";
    shell.append(skel);
    grid.append(shell);
  }
}

function widgetById(id) {
  return layout.widgets.find((widget) => widget.id === id) ?? null;
}

function widgetDefinition(type) {
  return widgetDefinitions[type] ?? { cmds: [], extraFields: [] };
}

function resetEditorMode() {
  editingWidgetId = null;
  widgetType.disabled = false;
  widgetLabel.value = "";
  widgetLabel.dataset.autoLabel = "1";
  setInteractionControls();
  if (widgetW) {
    widgetW.value = String(widgetSize(widgetType.value));
  }
  if (widgetH) {
    widgetH.value = "1";
  }
  document.getElementById("btn-create-widget").hidden = false;
  document.getElementById("btn-update-widget").hidden = true;
}

function widgetSize(type) {
  if (type === "divider") {
    return 12;
  }
  return ["climate", "equipment", "summary"].includes(type) ? 2 : 1;
}

function moveWidget(sourceId, targetId) {
  const from = layout.widgets.findIndex((widget) => widget.id === sourceId && widget.tabId === activeTabId);
  const to = layout.widgets.findIndex((widget) => widget.id === targetId && widget.tabId === activeTabId);
  if (from < 0 || to < 0 || from === to) {
    return;
  }
  const [widget] = layout.widgets.splice(from, 1);
  layout.widgets.splice(to, 0, widget);
  renderLayout();
  scheduleLayoutSave();
}

function currentEqLogic() {
  return eqLogicCatalog.find((item) => String(item.id) === eqLogicSelect.value) ?? null;
}

function populateSelect(select, items, labelKey = "name") {
  select.replaceChildren();
  for (const item of items) {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = typeof labelKey === "function" ? labelKey(item) : (item[labelKey] ?? item.name ?? String(item.id));
    select.append(option);
  }
}

function eqLogicOptionLabel(eqLogic) {
  const name = eqLogic?.name ?? String(eqLogic?.id ?? "");
  return eqLogic?.type ? `${name} (${eqLogic.type})` : name;
}

function commandsForDefinition(definition) {
  const eqLogic = currentEqLogic();
  if (!eqLogic) {
    return [];
  }
  return (eqLogic.cmds ?? [])
    .filter((cmd) => cmd.type === definition.type)
    .sort((a, b) => commandScore(a, definition) - commandScore(b, definition) || String(a.name).localeCompare(String(b.name)));
}

function commandScore(cmd, definition) {
  const genericType = String(cmd.genericType ?? "").toUpperCase();
  const genericIndex = (definition.genericTypes ?? []).indexOf(genericType);
  if (genericIndex >= 0) {
    return genericIndex;
  }
  return genericType === "" ? 100 : 200;
}

function suggestWidgetType(eqLogic) {
  const cmds = eqLogic?.cmds ?? [];
  if (cmds.length === 0) {
    return null;
  }

  let bestType = null;
  let bestScore = Infinity;

  for (const [type, def] of Object.entries(widgetDefinitions)) {
    if (type === "summary" || type === "divider") {
      continue;
    }
    const defCmds = def.cmds ?? [];
    if (defCmds.length === 0) {
      continue;
    }

    let total = 0;
    let matched = 0;
    for (const defCmd of defCmds) {
      const scores = cmds
        .filter((cmd) => cmd.type === defCmd.type)
        .map((cmd) => commandScore(cmd, defCmd));
      const best = scores.length > 0 ? Math.min(...scores) : 300;
      if (best < 300) {
        matched++;
      }
      total += best;
    }
    if (matched === 0) {
      continue;
    }
    const avg = total / defCmds.length;
    if (avg < bestScore) {
      bestScore = avg;
      bestType = type;
    }
  }
  return bestType;
}

function applySuggestedWidgetType() {
  if (editingWidgetId || widgetType.value === "equipment") {
    return;
  }
  const suggested = suggestWidgetType(currentEqLogic());
  if (!suggested || widgetType.value === suggested) {
    return;
  }
  widgetType.value = suggested;
  if (widgetW) {
    widgetW.value = String(widgetSize(suggested));
  }
  if (widgetH) {
    widgetH.value = "1";
  }
  renderCommandFields();
  showToast(`${t("widget_type_suggested")} : ${suggested}`, "info");
}

function renderCommandFields() {
  commandFields.replaceChildren();
  const eqLogic = currentEqLogic();
  if (eqLogic && (widgetLabel.value.trim() === "" || widgetLabel.dataset.autoLabel === "1")) {
    widgetLabel.value = eqLogic.name ?? "";
    widgetLabel.dataset.autoLabel = "1";
  }
  const definitionGroup = widgetDefinition(widgetType.value);
  const definitions = definitionGroup.cmds ?? [];
  const extraFields = definitionGroup.extraFields ?? [];
  const editedWidget = editingWidgetId ? widgetById(editingWidgetId) : null;
  const usesEqLogic = definitionGroup.usesEqLogic === true;
  const needsCommands = definitions.length > 0 || usesEqLogic;
  if (objectSelect?.closest("label")) {
    objectSelect.closest("label").hidden = !needsCommands;
  }
  if (eqLogicSelect?.closest("label")) {
    eqLogicSelect.closest("label").hidden = !needsCommands;
  }
  if (!needsCommands && extraFields.length === 0) {
    const note = document.createElement("p");
    note.className = "editor-note";
    note.textContent = "Aucune commande requise.";
    commandFields.append(note);
  } else {
    if (usesEqLogic && definitions.length === 0) {
      const note = document.createElement("p");
      note.className = "editor-note";
      note.textContent = "La tuile utilisera les commandes visibles de l equipement.";
      commandFields.append(note);
    }
    for (const definition of definitions) {
      const label = document.createElement("label");
      label.textContent = definition.label;

      const select = document.createElement("select");
      select.dataset.configKey = definition.key;
      const commands = commandsForDefinition(definition);
      if (commands.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Aucune commande compatible";
        select.append(option);
        select.disabled = true;
      }
      for (const cmd of commands) {
        const option = document.createElement("option");
        option.value = String(cmd.id);
        option.textContent = `${cmd.name} (${cmd.type}/${cmd.subType}${cmd.genericType ? ` - ${cmd.genericType}` : ""})`;
        option.dataset.unit = cmd.unit ?? "";
        select.append(option);
      }
      if (editedWidget?.config?.[definition.key]) {
        select.value = String(editedWidget.config[definition.key]);
      }
      label.append(select);
      commandFields.append(label);
    }
    for (const extraField of extraFields) {
      const label = document.createElement("label");
      label.textContent = extraField.label;

      const input = document.createElement("input");
      input.type = "text";
      input.dataset.extraKey = extraField.key;
      input.value = String(editedWidget?.config?.[extraField.key] ?? extraField.default ?? "");
      label.append(input);
      commandFields.append(label);
    }
  }

  const condSection = document.createElement("fieldset");
  condSection.className = "editor-condition";
  const condLegend = document.createElement("legend");
  condLegend.textContent = t("condition_title");
  condSection.append(condLegend);

  const condCmdLabel = document.createElement("label");
  condCmdLabel.textContent = t("condition_cmd");
  const condCmdSelect = document.createElement("select");
  condCmdSelect.dataset.condKey = "cmd_id";
  const blankOpt = document.createElement("option");
  blankOpt.value = "";
  blankOpt.textContent = t("condition_none");
  condCmdSelect.append(blankOpt);
  const infoCmds = (currentEqLogic()?.cmds ?? []).filter((cmd) => cmd.type === "info");
  for (const cmd of infoCmds) {
    const option = document.createElement("option");
    option.value = String(cmd.id);
    option.textContent = cmd.name;
    condCmdSelect.append(option);
  }
  if (editedWidget?.condition?.cmd_id) {
    condCmdSelect.value = String(editedWidget.condition.cmd_id);
  }
  condCmdLabel.append(condCmdSelect);

  const condOpLabel = document.createElement("label");
  condOpLabel.textContent = t("condition_operator");
  const condOpSelect = document.createElement("select");
  condOpSelect.dataset.condKey = "operator";
  for (const op of ["truthy", "falsy", "eq", "ne", "gt", "gte", "lt", "lte"]) {
    const option = document.createElement("option");
    option.value = op;
    option.textContent = op;
    condOpSelect.append(option);
  }
  if (editedWidget?.condition?.operator) {
    condOpSelect.value = editedWidget.condition.operator;
  }
  condOpLabel.append(condOpSelect);

  const condValLabel = document.createElement("label");
  condValLabel.textContent = t("condition_value");
  const condValInput = document.createElement("input");
  condValInput.type = "text";
  condValInput.dataset.condKey = "value";
  condValInput.value = editedWidget?.condition?.value ?? "";
  condValLabel.append(condValInput);

  condSection.append(condCmdLabel, condOpLabel, condValLabel);
  commandFields.append(condSection);
}

async function loadObjects() {
  if (objectCatalog.length === 0) {
    objectCatalog = await fetchJson("getObjects");
    populateSelect(objectSelect, objectCatalog);
  }
  await loadEqLogics();
}

async function loadEqLogics() {
  const objectId = objectSelect.value;
  if (!objectId) {
    eqLogicCatalog = [];
    populateSelect(eqLogicSelect, []);
    renderCommandFields();
    return;
  }
  eqLogicCatalog = await fetchJson("getCmdsByObject", { object_id: objectId });
  populateSelect(eqLogicSelect, eqLogicCatalog, eqLogicOptionLabel);
  renderCommandFields();
  applySuggestedWidgetType();
}

function configFromEditor(type) {
  const definitionGroup = widgetDefinition(type);
  const definitions = definitionGroup.cmds ?? [];
  const extraFields = definitionGroup.extraFields ?? [];
  const eqLogic = currentEqLogic();
  const config = { label: widgetLabel.value.trim() || (definitionGroup.usesEqLogic ? eqLogic?.name : "") || widgetType.selectedOptions[0]?.textContent || type };

  if (definitionGroup.usesEqLogic) {
    if (!eqLogic?.id) {
      throw new Error("Equipement manquant");
    }
    config.eqlogic_id = Number(eqLogic.id);
  }

  for (const definition of definitions) {
    const select = commandFields.querySelector(`[data-config-key="${definition.key}"]`);
    const cmdId = Number(select?.value ?? 0);
    if (!cmdId) {
      throw new Error(`Commande manquante: ${definition.label}`);
    }
    config[definition.key] = cmdId;
    if (type === "sensor" && definition.key === "cmd_value") {
      config.unit = select.selectedOptions[0]?.dataset.unit ?? "";
    }
  }

  for (const extraField of extraFields) {
    const input = commandFields.querySelector(`[data-extra-key="${extraField.key}"]`);
    config[extraField.key] = String(input?.value ?? extraField.default ?? "").trim();
  }
  applyInteractionConfig(config);

  const condCmd = commandFields.querySelector("[data-cond-key='cmd_id']")?.value;
  if (condCmd) {
    config._condition = {
      cmd_id: Number(condCmd),
      operator: commandFields.querySelector("[data-cond-key='operator']")?.value ?? "truthy",
      value: commandFields.querySelector("[data-cond-key='value']")?.value ?? "",
    };
  }

  return config;
}

function createWidgetFromEditor() {
  const type = widgetType.value;
  const config = configFromEditor(type);
  const cleanConfig = { ...config };
  delete cleanConfig._condition;

  return {
    id: `w${Date.now().toString(36)}`,
    tabId: activeTabId ?? layout.tabs?.[0]?.id ?? "default",
    type,
    x: 0,
    y: 0,
    w: Math.max(1, Math.min(12, Number(widgetW?.value ?? widgetSize(type)))),
    h: Math.max(1, Math.min(6, Number(widgetH?.value ?? 1))),
    condition: config._condition ?? null,
    config: cleanConfig,
  };
}


function firstWidgetCommandId(widget) {
  for (const definition of widgetDefinition(widget.type).cmds ?? []) {
    const cmdId = Number(widget.config?.[definition.key] ?? 0);
    if (cmdId > 0) {
      return String(cmdId);
    }
  }
  return "";
}

async function selectEqLogicForCmd(cmdId) {
  if (!cmdId) {
    renderCommandFields();
    return false;
  }
  await loadObjects();
  for (const object of objectCatalog) {
    objectSelect.value = String(object.id);
    eqLogicCatalog = await fetchJson("getCmdsByObject", { object_id: objectSelect.value });
    populateSelect(eqLogicSelect, eqLogicCatalog, eqLogicOptionLabel);
    const eqLogic = eqLogicCatalog.find((item) => (item.cmds ?? []).some((cmd) => String(cmd.id) === cmdId));
    if (eqLogic) {
      eqLogicSelect.value = String(eqLogic.id);
      renderCommandFields();
      return true;
    }
  }
  renderCommandFields();
  return false;
}

async function selectEqLogicById(eqLogicId) {
  if (!eqLogicId) {
    renderCommandFields();
    return false;
  }
  await loadObjects();
  for (const object of objectCatalog) {
    objectSelect.value = String(object.id);
    eqLogicCatalog = await fetchJson("getCmdsByObject", { object_id: objectSelect.value });
    populateSelect(eqLogicSelect, eqLogicCatalog, eqLogicOptionLabel);
    const eqLogic = eqLogicCatalog.find((item) => String(item.id) === String(eqLogicId));
    if (eqLogic) {
      eqLogicSelect.value = String(eqLogic.id);
      renderCommandFields();
      return true;
    }
  }
  renderCommandFields();
  return false;
}

async function openEditorForWidget(widget) {
  if (!cfg.canEdit || !widget) {
    return;
  }
  editingWidgetId = widget.id;
  selectedWidgetId = widget.id;
  editor.hidden = false;
  widgetType.value = widget.type;
  widgetType.disabled = true;
  widgetLabel.value = widget.config?.label ?? "";
  widgetLabel.dataset.autoLabel = "0";
  setInteractionControls(widget.config ?? {});
  if (widgetW) {
    widgetW.value = String(Math.max(1, Math.min(12, Number(widget.w ?? 1))));
  }
  if (widgetH) {
    widgetH.value = String(Math.max(1, Math.min(6, Number(widget.h ?? 1))));
  }
  document.getElementById("btn-create-widget").hidden = true;
  document.getElementById("btn-update-widget").hidden = false;

  const definition = widgetDefinition(widget.type);
  if (definition.usesEqLogic === true) {
    await selectEqLogicById(widget.config?.eqlogic_id);
    return;
  }
  if ((definition.cmds ?? []).length > 0) {
    await selectEqLogicForCmd(firstWidgetCommandId(widget));
    return;
  }
  renderCommandFields();
}

async function deleteSelectedWidget() {
  if (!cfg.canEdit || !selectedWidgetId) {
    return;
  }
  if (!await askConfirm(t("confirm_delete"), { danger: true })) {
    return;
  }
  hideFloatingToolbar();
  layout.widgets = layout.widgets.filter((widget) => widget.id !== selectedWidgetId);
  if (editingWidgetId === selectedWidgetId) {
    resetEditorMode();
    editor.hidden = true;
  }
  selectedWidgetId = null;
  renderLayout();
  scheduleLayoutSave();
}

function bindEditMode() {
  let dragState = null;
  let resizeState = null;

  function clearDragOver() {
    for (const el of grid.querySelectorAll(".drag-over")) {
      el.classList.remove("drag-over");
    }
  }

  function updateDragPreview(event) {
    if (!dragState?.preview) {
      return;
    }
    dragState.preview.style.transform = `translate3d(${event.clientX - dragState.offsetX}px, ${event.clientY - dragState.offsetY}px, 0)`;
  }

  function createDragPreview(shell, event, id) {
    const rect = shell.getBoundingClientRect();
    const preview = document.createElement("section");
    const content = shell.querySelector(".widget")?.cloneNode(true);
    if (!content) {
      return null;
    }
    preview.className = "widget-shell widget-drag-preview";
    preview.dataset.size = shell.dataset.size ?? "";
    preview.style.width = `${rect.width}px`;
    preview.style.height = `${rect.height}px`;
    preview.append(content);
    document.body.append(preview);
    dragState = {
      id,
      preview,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    updateDragPreview(event);
    return dragState;
  }

  function stopDragPreview() {
    dragState?.preview?.remove();
    dragState = null;
  }

  grid.addEventListener("pointerdown", (event) => {
    if (!editMode) {
      return;
    }
    const shell = event.target.closest(".widget-shell");
    if (!shell) {
      return;
    }
    const widget = widgetById(shell.dataset.widgetId);
    if (!widget) {
      return;
    }
    if (event.target.closest(".resize-handle")) {
      const rect = shell.getBoundingClientRect();
      const w = Math.max(1, Number(widget.w ?? 1));
      const h = Math.max(1, Number(widget.h ?? 1));
      resizeState = {
        id: widget.id,
        x: event.clientX,
        y: event.clientY,
        w,
        h,
        cellW: Math.max(1, rect.width / w),
        cellH: Math.max(1, rect.height / h),
      };
      shell.classList.add("resizing");
      shell.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      return;
    }
    for (const el of grid.querySelectorAll(".widget-shell.selected")) {
      el.classList.remove("selected");
    }
    selectedWidgetId = widget.id;
    shell.classList.add("selected", "dragging");
    createDragPreview(shell, event, widget.id);
    shell.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    syncEditToolbar();
    showFloatingToolbar(widget.id);
    if (!editor.hidden) {
      openEditorForWidget(widget).catch((error) => console.error("[JeeDash] open editor", error));
    }
  });

  grid.addEventListener("pointermove", (event) => {
    if (resizeState) {
      const widget = widgetById(resizeState.id);
      const shell = grid.querySelector(`[data-widget-id="${CSS.escape(resizeState.id)}"]`);
      if (!widget || !shell) {
        return;
      }
      widget.w = Math.max(1, Math.min(12, resizeState.w + Math.round((event.clientX - resizeState.x) / resizeState.cellW)));
      widget.h = Math.max(1, Math.min(6, resizeState.h + Math.round((event.clientY - resizeState.y) / resizeState.cellH)));
      placeShell(shell, widget);
      if (editingWidgetId === widget.id) {
        if (widgetW) widgetW.value = String(widget.w);
        if (widgetH) widgetH.value = String(widget.h);
      }
      return;
    }
    if (dragState) {
      updateDragPreview(event);
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".widget-shell");
      clearDragOver();
      if (target?.dataset.widgetId && target.dataset.widgetId !== dragState.id) {
        target.classList.add("drag-over");
      }
    }
  });

  grid.addEventListener("pointerup", (event) => {
    clearDragOver();
    if (resizeState) {
      grid.querySelector(`[data-widget-id="${CSS.escape(resizeState.id)}"]`)?.classList.remove("resizing");
      resizeState = null;
      scheduleLayoutSave();
      return;
    }
    if (!dragState) {
      return;
    }
    const draggedId = dragState.id;
    const shell = grid.querySelector(`[data-widget-id="${CSS.escape(draggedId)}"]`);
    shell?.releasePointerCapture?.(event.pointerId);
    shell?.classList.remove("dragging");
    stopDragPreview();
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".widget-shell");
    if (target?.dataset.widgetId) {
      moveWidget(draggedId, target.dataset.widgetId);
    }
  });

  grid.addEventListener("pointercancel", (event) => {
    clearDragOver();
    if (!dragState) {
      return;
    }
    const shell = grid.querySelector(`[data-widget-id="${CSS.escape(dragState.id)}"]`);
    shell?.releasePointerCapture?.(event.pointerId);
    shell?.classList.remove("dragging");
    stopDragPreview();
  });
}

function bindControls() {
  for (const id of ["btn-add", "btn-edit", "btn-save", "btn-cancel-edit"]) {
    const button = document.getElementById(id);
    if (button) {
      button.hidden = !cfg.canEdit;
    }
  }
  syncEditToolbar();
  const importLabel = document.querySelector(".btn-import-label");
  if (importLabel) {
    importLabel.hidden = !cfg.canEdit;
  }

  floatingToolbar?.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  floatingToolbar?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ft-action]");
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const action = button.dataset.ftAction;
    const widgetId = floatingToolbar.dataset.widgetId;
    const widget = widgetById(widgetId);
    if (!widget) {
      hideFloatingToolbar();
      return;
    }
    if (action === "edit") {
      hideFloatingToolbar();
      openEditorForWidget(widget).catch((error) => console.error("[JeeDash] open editor", error));
      return;
    }
    if (action === "copy") {
      // duplicateWidget re-sélectionne la copie et repositionne la toolbar dessus.
      duplicateWidget(widget);
      return;
    }
    if (action === "delete") {
      selectedWidgetId = widgetId;
      deleteSelectedWidget();
      return;
    }
    const sizeActions = {
      "w-inc": [1, 0],
      "w-dec": [-1, 0],
      "h-inc": [0, 1],
      "h-dec": [0, -1],
    };
    const delta = sizeActions[action];
    if (delta) {
      resizeWidgetBy(widget, delta[0], delta[1]);
      showFloatingToolbar(widgetId);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (floatingToolbar?.hidden) {
      return;
    }
    if (!event.target.closest("#floating-toolbar,[data-widget-id]")) {
      hideFloatingToolbar();
    }
  });

  grid.addEventListener("scroll", () => {
    if (floatingToolbar?.hidden) {
      return;
    }
    const widgetId = floatingToolbar.dataset.widgetId;
    if (widgetId) {
      positionFloatingToolbar(grid.querySelector(`[data-widget-id="${CSS.escape(widgetId)}"]`));
    }
  });

  window.addEventListener("resize", () => {
    if (!floatingToolbar?.hidden) {
      hideFloatingToolbar();
    }
  });

  moreInfoClose?.addEventListener("click", closeMoreInfo);
  moreInfoOverlay?.addEventListener("click", (event) => {
    if (event.target === moreInfoOverlay) {
      closeMoreInfo();
    }
  });
  moreInfoPanel?.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !moreInfoOverlay?.hidden) {
      closeMoreInfo();
    }
  });

  document.getElementById("btn-add")?.addEventListener("click", async () => {
    if (!cfg.canEdit || !editMode) {
      return;
    }
    editor.hidden = !editor.hidden;
    if (editor.hidden) {
      resetEditorMode();
      return;
    }
    const selectedWidget = editMode ? widgetById(selectedWidgetId) : null;
    if (selectedWidget) {
      await openEditorForWidget(selectedWidget).catch((error) => console.error("[JeeDash] open editor", error));
      return;
    }
    resetEditorMode();
    await loadObjects().catch((error) => console.error("[JeeDash] load objects", error));
    renderCommandFields();
  });

  toolbarTheme?.addEventListener("change", () => {
    const theme = toolbarTheme.value;
    applyTheme(theme);
    layout.theme = theme;
    scheduleLayoutSave();
  });

  document.getElementById("btn-compact")?.addEventListener("click", () => {
    const enabled = !appRoot?.classList.contains("compact-mode");
    applyCompact(enabled);
    localStorage.setItem(compactStorageKey, enabled ? "1" : "0");
  });

  document.getElementById("btn-fullscreen")?.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", syncFullscreenButton);
  applyCompact(localStorage.getItem(compactStorageKey) === "1");
  syncFullscreenButton();

  document.getElementById("btn-edit")?.addEventListener("click", () => {
    enterEditMode();
  });

  document.getElementById("btn-cancel-edit")?.addEventListener("click", requestCancelEditMode);
  document.getElementById("btn-save")?.addEventListener("click", saveEditMode);

  objectSelect?.addEventListener("change", () => loadEqLogics().catch((error) => console.error(error)));
  eqLogicSelect?.addEventListener("change", () => {
    renderCommandFields();
    applySuggestedWidgetType();
  });
  widgetLabel?.addEventListener("input", () => {
    widgetLabel.dataset.autoLabel = "0";
  });
  widgetType?.addEventListener("change", () => {
    renderCommandFields();
    if (widgetW && !editingWidgetId) {
      widgetW.value = String(widgetSize(widgetType.value));
    }
    if (widgetH && !editingWidgetId) {
      widgetH.value = "1";
    }
  });
  document.getElementById("btn-create-widget")?.addEventListener("click", async () => {
    if (!cfg.canEdit) {
      return;
    }
    try {
      const widget = createWidgetFromEditor();
      layout.widgets.push(widget);
      selectedWidgetId = widget.id;
      await preloadStates(commandIdsFromLayout({ widgets: [widget] }));
      renderLayout();
      scheduleLayoutSave();
    } catch (error) {
      showToast(error.message);
    }
  });
  document.getElementById("btn-update-widget")?.addEventListener("click", async () => {
    if (!cfg.canEdit || !editingWidgetId) {
      return;
    }
    const widget = widgetById(editingWidgetId);
    if (!widget) {
      resetEditorMode();
      return;
    }
    try {
      const config = configFromEditor(widget.type);
      const cleanConfig = { ...config };
      delete cleanConfig._condition;
      widget.config = cleanConfig;
      widget.condition = config._condition ?? null;
      widget.w = Math.max(1, Math.min(12, Number(widgetW?.value ?? widget.w)));
      widget.h = Math.max(1, Math.min(6, Number(widgetH?.value ?? widget.h)));
      selectedWidgetId = widget.id;
      await preloadStates(commandIdsFromLayout({ widgets: [widget] }));
      renderLayout();
      scheduleLayoutSave();
    } catch (error) {
      showToast(error.message);
    }
  });
  document.getElementById("btn-delete-widget")?.addEventListener("click", deleteSelectedWidget);
  document.getElementById("btn-export")?.addEventListener("click", exportLayout);
  importFile?.addEventListener("change", async () => {
    const file = importFile.files?.[0];
    if (!file) {
      return;
    }
    await importLayout(file);
    importFile.value = "";
  });


  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && editMode) {
      event.preventDefault();
      saveEditMode();
      return;
    }
    if (event.key === "Escape" && editMode) {
      event.preventDefault();
      requestCancelEditMode();
      return;
    }
    if (event.target instanceof Element && event.target.matches("input, select, textarea, [contenteditable='true']")) {
      return;
    }
    if ((event.key === "e" || event.key === "E") && !event.ctrlKey && !event.metaKey) {
      if (editMode) {
        requestCancelEditMode();
        return;
      }
      enterEditMode();
    }
  });
}

function initSse() {
  setSseStatus(sseRetryCount > 0 && sseRetryCount < 6 ? "reconnecting" : "offline");
  if (eventSource) {
    eventSource.onopen = null;
    eventSource.onerror = null;
    eventSource.onmessage = null;
    eventSource.close();
    eventSource = null;
  }
  clearTimeout(sseReconnectTimer);

  eventSource = new EventSource(sseEndpoint());

  eventSource.onopen = () => {
    sseRetryCount = 0;
    setSseStatus("connected");
    preloadStates(commandIdsFromLayout(layout)).catch((error) =>
      console.warn("[JeeDash] preload on reconnect failed", error)
    );
  };

  eventSource.onerror = () => {
    if (eventSource && eventSource.readyState === EventSource.CLOSED) {
      setSseStatus("reconnecting");
      const base = Math.min(30000, 1000 * 2 ** sseRetryCount);
      const jitter = Math.random() * 1000;
      sseRetryCount++;
      if (sseRetryCount >= 6) {
        setSseStatus("offline");
      }
      sseReconnectTimer = setTimeout(() => initSse(), base + jitter);
    } else {
      setSseStatus("reconnecting");
    }
  };

  // SSE core (core/ajax/event_sse.ajax.php) : événements nommés Jeedom.
  // cmd::update -> data {datetime, name, option:{cmd_id, value}}.
  const onCmdUpdate = (event) => {
    try {
      const message = JSON.parse(event.data);
      const opt = message.option ?? message;
      const cmdId = opt.cmd_id ?? message.cmd_id;
      if (cmdId != null) {
        store.update(cmdId, opt.value ?? message.value, message.datetime ?? null);
      }
    } catch (error) {
      console.warn("[dashx SSE] message invalide", error);
    }
  };
  eventSource.addEventListener("cmd::update", onCmdUpdate);
  // Fallback si un jour des événements anonymes (sans champ event:) arrivent.
  eventSource.onmessage = onCmdUpdate;
}

async function init() {
  bindControls();
  bindEditMode();
  store.subscribeAll(syncWidgetAvailability);
  store.subscribeAll(flashShellValue);
  layout = await fetchJson("getLayout");
  activeTabId = tabIdFromHash() ?? layout.tabs?.[0]?.id ?? null;
  syncTabHash(true);
  applyTheme(layout.theme);
  if (layout.widgets?.length) {
    renderSkeleton(layout.widgets.length);
  }
  await preloadStates(commandIdsFromLayout(layout));
  renderLayout();
  initSse();
}

window.addEventListener("hashchange", () => {
  const tabId = tabIdFromHash();
  if (tabId && tabId !== activeTabId) {
    activateTab(tabId, false);
  }
});

window.addEventListener("beforeunload", (event) => {
  if (editMode && editDirty) {
    event.preventDefault();
    event.returnValue = "";
    return;
  }
  flushLayoutSave();
  clearTimeout(sseReconnectTimer);
  eventSource?.close();
});

init().catch((error) => {
  console.error("[JeeDash] init error", error);
  const message = document.createElement("p");
  message.className = "loading-msg";
  message.textContent = t("load_error") + " " + error.message;
  grid.replaceChildren(message);
});
}());
