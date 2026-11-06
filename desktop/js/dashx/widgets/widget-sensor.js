"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetSensor extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-value", "label", "unit", "icon", "cmd-history", "history-hours"];
  }

  connectedCallback() {
    this.unsubscribe = null;
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

  _subscribe() {
    const id = this._cmdId("cmd-value");
    if (!id) {
      return;
    }
    this.unsubscribe = store.subscribe(id, ({ value, unit }) => this._update(value, unit));
  }

  formatValue(value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const number = Number(value);
    return Number.isFinite(number) ? (Number.isInteger(number) ? String(number) : number.toFixed(1)) : String(value);
  }

  _build() {
    clearInterval(this._sparkTimer);
    this._sparklineContainer = null;
    const label = this.getAttribute("label") ?? "Capteur";
    const iconText = this.getAttribute("icon") ?? "Sensor";

    const card = document.createElement("div");
    card.className = "widget widget-sensor";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = iconText;

    const displayValue = document.createElement("div");
    displayValue.className = "widget-value";
    displayValue.setAttribute("aria-live", "polite");
    displayValue.setAttribute("aria-atomic", "true");
    this._valueText = document.createTextNode("");
    displayValue.append(this._valueText);

    this._unitNode = document.createElement("span");
    this._unitNode.className = "widget-unit";
    displayValue.append(this._unitNode);

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    card.append(icon, displayValue, title);
    this.replaceChildren(card);
    const histId = this._cmdId("cmd-history");
    if (histId) {
      this._sparklineContainer = document.createElement("div");
      this._sparklineContainer.className = "inline-sparkline";
      card.append(this._sparklineContainer);
      this._fetchSparkline();
      this._sparkTimer = setInterval(() => this._fetchSparkline(), 300000);
    }
    this._update(null, null);
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

  _update(value, unit) {
    this._valueText.textContent = this.formatValue(value);
    this._unitNode.textContent = unit ?? this.getAttribute("unit") ?? "";
  }
}

if (!customElements.get("widget-sensor")) {
  customElements.define("widget-sensor", WidgetSensor);
}
}());
