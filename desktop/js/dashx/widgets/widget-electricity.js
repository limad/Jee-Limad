"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetElectricity extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-power", "cmd-consumption", "cmd-daily", "cmd-voltage", "label", "cmd-history", "history-hours"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._nodes = new Map();
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    clearInterval(this._sparkTimer);
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
    clearInterval(this._sparkTimer);
    this._sparklineContainer = null;
    this._nodes = new Map();

    const card = document.createElement("div");
    card.className = "widget widget-electricity";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Electricite";

    const rows = document.createElement("div");
    rows.className = "elec-rows";

    for (const item of this._fields()) {
      if (!this._cmdId(item.attr)) {
        continue;
      }
      const row = document.createElement("div");
      row.className = "elec-row";

      const label = document.createElement("span");
      label.className = "elec-label";
      label.textContent = item.label;

      const value = document.createElement("span");
      value.className = "elec-value";
      value.textContent = "-";

      row.append(label, value);
      rows.append(row);
      this._nodes.set(item.field, { node: value, unit: item.unit });
    }

    card.append(title, rows);
    this.replaceChildren(card);
    const histId = this._cmdId("cmd-history");
    if (histId) {
      this._sparklineContainer = document.createElement("div");
      this._sparklineContainer.className = "inline-sparkline";
      card.append(this._sparklineContainer);
      this._fetchSparkline();
      this._sparkTimer = setInterval(() => this._fetchSparkline(), 300000);
    }
  }

  _fields() {
    return [
      { field: "power", attr: "cmd-power", label: "Puissance", unit: "W" },
      { field: "consumption", attr: "cmd-consumption", label: "Conso", unit: "kWh" },
      { field: "daily", attr: "cmd-daily", label: "Conso/j", unit: "kWh" },
      { field: "voltage", attr: "cmd-voltage", label: "Tension", unit: "V" },
    ];
  }

  _subscribe() {
    const unsubscribers = [];
    for (const item of this._fields()) {
      const cmdId = this._cmdId(item.attr);
      if (cmdId) {
        unsubscribers.push(store.subscribe(cmdId, ({ value, unit }) => this._update(item.field, value, unit)));
      }
    }
    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _update(field, value, unit = null) {
    const target = this._nodes.get(field);
    if (!target) {
      return;
    }
    target.node.textContent = `${this._format(value)} ${unit || target.unit}`.trim();
  }

  _format(value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return String(value);
    }
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
  }

  async _fetchSparkline() {
    const id = this._cmdId("cmd-history");
    if (!id || !this._sparklineContainer || !window.JeeDashApi?.getHistory) {
      return;
    }
    const hours = Math.max(1, Math.min(168, Number(this.getAttribute("history-hours") ?? "24")));
    try {
      const data = await window.JeeDashApi.getHistory(id, hours);
      this._renderSparkline(data?.points ?? []);
    } catch (error) {
      console.warn("[JeeDash sparkline]", error);
    }
  }

  _renderSparkline(points) {
    if (!this._sparklineContainer) {
      return;
    }
    if (points.length < 2) {
      this._sparklineContainer.replaceChildren();
      return;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "sparkline-svg");
    svg.setAttribute("viewBox", "0 0 100 20");
    svg.setAttribute("preserveAspectRatio", "none");
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    poly.setAttribute("class", "sparkline-line");
    const xs = points.map((point) => point.t);
    const ys = points.map((point) => point.v);
    const minX = Math.min(...xs);
    const spanX = Math.max(...xs) - minX || 1;
    const minY = Math.min(...ys);
    const spanY = Math.max(...ys) - minY || 1;
    poly.setAttribute("points", points.map((point) =>
      `${(((point.t - minX) / spanX) * 100).toFixed(1)},${(20 - ((point.v - minY) / spanY) * 18).toFixed(1)}`
    ).join(" "));
    svg.append(poly);
    this._sparklineContainer.replaceChildren(svg);
  }
}

if (!customElements.get("widget-electricity")) {
  customElements.define("widget-electricity", WidgetElectricity);
}
}());
