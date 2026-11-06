"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetBinary extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "label", "icon", "active-label", "inactive-label"];
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

  isActive(value) {
    const normalized = String(value).toLowerCase();
    return value === true || value === 1 || ["1", "on", "open", "true", "yes"].includes(normalized);
  }

  _build() {
    const label = this.getAttribute("label") ?? "Etat";
    const iconText = this.getAttribute("icon") ?? "State";

    this._card = document.createElement("div");
    this._card.className = "widget widget-binary";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = iconText;

    this._stateNode = document.createElement("div");
    this._stateNode.className = "widget-state";
    this._stateNode.setAttribute("aria-live", "polite");
    this._stateNode.setAttribute("aria-atomic", "true");

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._card.append(icon, this._stateNode, title);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "";
    const isActive = this.isActive(value);
    const status = isUnknown
      ? t("unknown")
      : (isActive ? (this.getAttribute("active-label") ?? "Actif") : (this.getAttribute("inactive-label") ?? "OK"));

    this._card.classList.toggle("active", isActive);
    this._stateNode.textContent = status;
  }
}

if (!customElements.get("widget-binary")) {
  customElements.define("widget-binary", WidgetBinary);
}
}());
