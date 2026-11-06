"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetClimate extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-temp", "cmd-humidity", "label", "cmd-history", "history-hours"];
  }

  connectedCallback() {
    this.unsubscribers = [];
    this.temperature = null;
    this.humidity = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    clearInterval(this._sparkTimer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _subscribe() {
    const tempId = this._cmdId("cmd-temp");
    const humidityId = this._cmdId("cmd-humidity");

    if (tempId) {
      this.unsubscribers.push(store.subscribe(tempId, ({ value }) => {
        this.temperature = value;
        this._tempNode.textContent = this.format(this.temperature, 1, " °C");
      }));
    }
    if (humidityId) {
      this.unsubscribers.push(store.subscribe(humidityId, ({ value }) => {
        this.humidity = value;
        this._humNode.textContent = this.format(this.humidity, 0, " %");
      }));
    }
  }

  format(value, decimals, suffix) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toFixed(decimals)}${suffix}` : `${value}${suffix}`;
  }

  _build() {
    clearInterval(this._sparkTimer);
    this._sparklineContainer = null;
    const label = this.getAttribute("label") ?? "Climat";

    const card = document.createElement("div");
    card.className = "widget widget-climate";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    const row = document.createElement("div");
    row.className = "climate-row";

    this._tempNode = document.createElement("span");
    this._tempNode.className = "climate-temp";
    this._tempNode.textContent = this.format(this.temperature, 1, " °C");
    this._tempNode.setAttribute("aria-live", "polite");
    this._tempNode.setAttribute("aria-atomic", "true");

    this._humNode = document.createElement("span");
    this._humNode.className = "climate-hum";
    this._humNode.textContent = this.format(this.humidity, 0, " %");
    this._humNode.setAttribute("aria-live", "polite");
    this._humNode.setAttribute("aria-atomic", "true");

    row.append(this._tempNode, this._humNode);
    card.append(title, row);
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

if (!customElements.get("widget-climate")) {
  customElements.define("widget-climate", WidgetClimate);
}
}());
