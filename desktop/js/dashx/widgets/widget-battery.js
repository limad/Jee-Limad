"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetBattery extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-level", "cmd-status", "label", "low-threshold"];
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

  _threshold() {
    return Math.max(1, Math.min(100, Number(this.getAttribute("low-threshold") ?? "20") || 20));
  }

  _build() {
    this._card = document.createElement("div");
    this._card.className = "widget widget-battery";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Batterie";

    this._valueNode = document.createElement("div");
    this._valueNode.className = "battery-value";
    this._valueNode.textContent = "-";

    const bar = document.createElement("div");
    bar.className = "battery-bar";
    this._fillNode = document.createElement("span");
    bar.append(this._fillNode);

    this._statusNode = document.createElement("div");
    this._statusNode.className = "battery-status";

    this._card.append(title, this._valueNode, bar, this._statusNode);
    this.replaceChildren(this._card);
  }

  _subscribe() {
    const unsubscribers = [];
    const levelId = this._cmdId("cmd-level");
    const statusId = this._cmdId("cmd-status");
    if (levelId) {
      unsubscribers.push(store.subscribe(levelId, ({ value }) => this._updateLevel(value)));
    }
    if (statusId) {
      unsubscribers.push(store.subscribe(statusId, ({ value }) => this._updateStatus(value)));
    }
    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _updateLevel(value) {
    const level = Math.max(0, Math.min(100, Number(value)));
    const display = Number.isFinite(level) ? Math.round(level) : 0;
    this._valueNode.textContent = `${display} %`;
    this._fillNode.style.width = `${display}%`;
    this._card.classList.toggle("battery-low", display <= this._threshold());
  }

  _updateStatus(value) {
    this._statusNode.textContent = String(value ?? "");
  }
}

if (!customElements.get("widget-battery")) {
  customElements.define("widget-battery", WidgetBattery);
}
}());
