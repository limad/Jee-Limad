"use strict";

(function () {

const store = window.JeeDashStore;
const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetAlarm extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-enable", "cmd-mode", "cmd-arm", "cmd-disarm", "label"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribe?.();
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _exec(attr) {
    const cmdId = this._cmdId(attr);
    if (cmdId) {
      if (!window.confirm("Confirmer l action sur l alarme ?")) {
        return;
      }
      window.JeeDashApi?.execCmd(cmdId).catch((error) => console.error("[JeeDash alarm]", error));
    }
  }

  _build() {
    this._card = document.createElement("div");
    this._card.className = "widget widget-alarm state-unknown";

    this._icon = document.createElement("div");
    this._icon.className = "widget-icon";
    this._icon.textContent = "?";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Alarme";

    this._statusNode = document.createElement("div");
    this._statusNode.className = "widget-state";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    this._modeNode = document.createElement("div");
    this._modeNode.className = "alarm-mode";
    this._modeNode.hidden = true;

    const actions = document.createElement("div");
    actions.className = "widget-actions";

    this._armBtn = document.createElement("button");
    this._armBtn.className = "btn-alarm-arm";
    this._armBtn.type = "button";
    this._armBtn.textContent = t("arm");
    this._armBtn.disabled = !this._cmdId("cmd-arm");
    this._armBtn.addEventListener("click", () => this._exec("cmd-arm"));

    this._disarmBtn = document.createElement("button");
    this._disarmBtn.className = "btn-alarm-disarm";
    this._disarmBtn.type = "button";
    this._disarmBtn.textContent = t("disarm");
    this._disarmBtn.disabled = !this._cmdId("cmd-disarm");
    this._disarmBtn.addEventListener("click", () => this._exec("cmd-disarm"));

    actions.append(this._armBtn, this._disarmBtn);
    this._card.append(this._icon, title, this._statusNode, this._modeNode, actions);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _subscribe() {
    const unsubscribers = [];
    const stateId = this._cmdId("cmd-state") || this._cmdId("cmd-enable");
    const modeId = this._cmdId("cmd-mode");

    if (stateId) {
      unsubscribers.push(store.subscribe(stateId, ({ value }) => this._update(value)));
    }
    if (modeId) {
      unsubscribers.push(store.subscribe(modeId, ({ value }) => this._updateMode(value)));
    }

    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "" || value === "unknown";
    const isArmed = !isUnknown && (value === true || value === 1 || value === "1" || value === "on");
    const state = isUnknown ? "unknown" : (isArmed ? "armed" : "disarmed");

    this._card.className = `widget widget-alarm state-${state}`;
    this._icon.textContent = isArmed ? "[+]" : "[-]";
    this._statusNode.textContent = isUnknown ? t("unknown") : (isArmed ? t("armed") : t("disarmed"));
  }

  _updateMode(value) {
    const mode = String(value ?? "").trim();
    this._modeNode.textContent = mode;
    this._modeNode.hidden = mode === "";
  }
}

if (!customElements.get("widget-alarm")) {
  customElements.define("widget-alarm", WidgetAlarm);
}
}());
