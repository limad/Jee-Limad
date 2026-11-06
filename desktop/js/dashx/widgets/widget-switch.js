"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetSwitch extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-toggle", "label"];
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
    const id = Number.parseInt(this.getAttribute("cmd-state") ?? "", 10);
    if (!id) {
      return;
    }
    this.unsubscribe = store.subscribe(id, ({ value }) => this._update(value));
  }

  toggle() {
    const cmdId = Number.parseInt(this.getAttribute("cmd-toggle") ?? "", 10);
    if (!cmdId) {
      return;
    }
    const stateId = Number.parseInt(this.getAttribute("cmd-state") ?? "", 10);
    const current = store.get(stateId)?.value;
    const isOn = current === true || current === 1 || current === "1" || current === "on";
    if (stateId) {
      store.setOptimistic(stateId, isOn ? 0 : 1);
    }
    window.JeeDashApi.execCmd(cmdId).catch((error) => {
      if (stateId) {
        store.revertOptimistic(stateId);
      }
      console.error("[JeeDash switch]", error);
    });
  }

  _build() {
    const label = this.getAttribute("label") ?? "Switch";

    this._card = document.createElement("div");
    this._card.className = "widget widget-switch";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._btn = document.createElement("button");
    this._btn.className = "toggle-btn";
    this._btn.type = "button";
    this._btn.title = "Toggle";
    this._btn.setAttribute("role", "switch");
    this._btn.setAttribute("aria-checked", "false");
    this._btn.setAttribute("aria-label", label);
    this._btn.addEventListener("click", () => this.toggle());

    const knob = document.createElement("span");
    knob.className = "toggle-knob";
    this._btn.append(knob);

    this._statusNode = document.createElement("div");
    this._statusNode.className = "widget-state";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    this._card.append(title, this._btn, this._statusNode);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "unknown";
    const isOn = value === true || value === 1 || value === "1" || value === "on";

    this._btn.classList.toggle("active", isOn);
    this._btn.disabled = isUnknown;
    this._statusNode.textContent = isUnknown ? t("unknown") : (isOn ? t("on") : t("off"));
    this._btn.setAttribute("aria-checked", isUnknown ? "mixed" : String(isOn));
  }
}

if (!customElements.get("widget-switch")) {
  customElements.define("widget-switch", WidgetSwitch);
}
}());
