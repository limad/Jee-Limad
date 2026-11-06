"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetPresence extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "label", "present-label", "absent-label"];
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

  _build() {
    this._card = document.createElement("div");
    this._card.className = "widget widget-presence state-unknown";

    this._icon = document.createElement("div");
    this._icon.className = "widget-icon";
    this._icon.textContent = "?";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Presence";

    this._stateNode = document.createElement("div");
    this._stateNode.className = "widget-state";

    this._card.append(this._icon, title, this._stateNode);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _subscribe() {
    const stateId = this._cmdId("cmd-state");
    if (!stateId) {
      return;
    }
    this.unsubscribe = store.subscribe(stateId, ({ value }) => this._update(value));
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "" || value === "unknown";
    const present = !isUnknown && (value === true || value === 1 || value === "1" || value === "on" || value === "present");
    const state = isUnknown ? "unknown" : (present ? "present" : "absent");
    this._card.className = `widget widget-presence state-${state}`;
    this._icon.textContent = present ? "in" : (isUnknown ? "?" : "out");
    this._stateNode.textContent = isUnknown
      ? "Inconnu"
      : (present ? (this.getAttribute("present-label") || "Present") : (this.getAttribute("absent-label") || "Absent"));
  }
}

if (!customElements.get("widget-presence")) {
  customElements.define("widget-presence", WidgetPresence);
}
}());
