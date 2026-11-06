"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetLight extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-on", "cmd-off", "label"];
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

  _subscribe() {
    const stateId = Number.parseInt(this.getAttribute("cmd-state") ?? "", 10);
    if (!stateId) {
      return;
    }
    this.unsubscribe = store.subscribe(stateId, ({ value }) => this._update(value));
  }

  callAction(attribute, optimisticState) {
    const cmdId = Number.parseInt(this.getAttribute(attribute) ?? "", 10);
    if (!cmdId) {
      return;
    }
    const stateId = Number.parseInt(this.getAttribute("cmd-state") ?? "", 10);
    if (stateId && optimisticState !== undefined) {
      store.setOptimistic(stateId, optimisticState);
    }
    window.JeeDashApi.execCmd(cmdId).catch((error) => {
      if (stateId && optimisticState !== undefined) {
        store.revertOptimistic(stateId);
      }
      console.error("[JeeDash light]", error);
    });
  }

  _build() {
    const label = this.getAttribute("label") ?? "Lumiere";

    this._card = document.createElement("div");
    this._card.className = "widget widget-light state-unknown";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = "Light";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._statusNode = document.createElement("div");
    this._statusNode.className = "widget-state";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    const actions = document.createElement("div");
    actions.className = "widget-actions";

    this._onBtn = document.createElement("button");
    this._onBtn.className = "btn-on";
    this._onBtn.type = "button";
    this._onBtn.textContent = t("on");
    this._onBtn.setAttribute("aria-label", t("turn_on"));
    this._onBtn.addEventListener("click", () => this.callAction("cmd-on", 1));

    this._offBtn = document.createElement("button");
    this._offBtn.className = "btn-off";
    this._offBtn.type = "button";
    this._offBtn.textContent = t("off");
    this._offBtn.setAttribute("aria-label", t("turn_off"));
    this._offBtn.addEventListener("click", () => this.callAction("cmd-off", 0));

    actions.append(this._onBtn, this._offBtn);
    this._card.append(icon, title, this._statusNode, actions);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "unknown";
    const isOn = value === true || value === 1 || value === "1" || value === "on";
    const state = isUnknown ? "unknown" : (isOn ? "on" : "off");

    this._card.className = `widget widget-light state-${state}`;
    this._statusNode.textContent = isUnknown ? t("unknown") : (isOn ? t("on") : t("off"));
    this._onBtn.disabled = isUnknown;
    this._offBtn.disabled = isUnknown;
  }
}

if (!customElements.get("widget-light")) {
  customElements.define("widget-light", WidgetLight);
}
}());
