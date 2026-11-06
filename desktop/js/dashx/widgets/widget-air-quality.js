"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetAirQuality extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-co2", "cmd-voc", "cmd-pm25", "cmd-aqi", "label"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._nodes = new Map();
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

  _fields() {
    return [
      ["co2", "cmd-co2", "CO2", "ppm"],
      ["voc", "cmd-voc", "COV", "ppb"],
      ["pm25", "cmd-pm25", "PM2.5", "µg/m3"],
      ["aqi", "cmd-aqi", "AQI", ""],
    ];
  }

  _build() {
    this._nodes = new Map();
    const card = document.createElement("div");
    card.className = "widget widget-air-quality";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Air";

    const rows = document.createElement("div");
    rows.className = "air-rows";
    for (const [field, attr, labelText, unit] of this._fields()) {
      if (!this._cmdId(attr)) {
        continue;
      }
      const row = document.createElement("div");
      row.className = "air-row";
      const label = document.createElement("span");
      label.textContent = labelText;
      const value = document.createElement("strong");
      value.textContent = "-";
      row.append(label, value);
      rows.append(row);
      this._nodes.set(field, { node: value, unit });
    }

    card.append(title, rows);
    this.replaceChildren(card);
  }

  _subscribe() {
    const unsubscribers = [];
    for (const [field, attr] of this._fields()) {
      const cmdId = this._cmdId(attr);
      if (cmdId) {
        unsubscribers.push(store.subscribe(cmdId, ({ value, unit }) => this._update(field, value, unit)));
      }
    }
    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _update(field, value, unit = null) {
    const item = this._nodes.get(field);
    if (!item) {
      return;
    }
    const n = Number(value);
    const text = Number.isFinite(n) ? (Number.isInteger(n) ? String(n) : n.toFixed(1)) : String(value ?? "-");
    item.node.textContent = `${text} ${unit || item.unit}`.trim();
  }
}

if (!customElements.get("widget-air-quality")) {
  customElements.define("widget-air-quality", WidgetAirQuality);
}
}());
