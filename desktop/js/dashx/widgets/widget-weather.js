"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetWeather extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-wind-speed", "cmd-wind-dir", "cmd-rain", "cmd-pressure", "label"];
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
    const card = document.createElement("div");
    card.className = "widget widget-weather";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Meteo";

    const compass = document.createElement("div");
    compass.className = "weather-compass";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 60 60");
    svg.setAttribute("width", "60");
    svg.setAttribute("height", "60");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "30");
    circle.setAttribute("cy", "30");
    circle.setAttribute("r", "28");
    circle.setAttribute("class", "compass-bg");

    this._needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this._needle.setAttribute("x1", "30");
    this._needle.setAttribute("y1", "30");
    this._needle.setAttribute("x2", "30");
    this._needle.setAttribute("y2", "6");
    this._needle.setAttribute("class", "compass-needle");

    svg.append(circle, this._needle);
    compass.append(svg);

    this._windNode = document.createElement("div");
    this._windNode.className = "weather-wind";
    this._windNode.textContent = "-";

    const rows = document.createElement("div");
    rows.className = "weather-rows";

    this._rainNode = this._row(rows, "Pluie", "cmd-rain");
    this._pressNode = this._row(rows, "Pression", "cmd-pressure");

    card.append(title, compass, this._windNode, rows);
    this.replaceChildren(card);
  }

  _row(container, labelText, attr) {
    if (!this._cmdId(attr)) {
      return null;
    }
    const row = document.createElement("div");
    row.className = "weather-row";

    const label = document.createElement("span");
    label.textContent = labelText;

    const value = document.createElement("span");
    value.textContent = "-";

    row.append(label, value);
    container.append(row);
    return value;
  }

  _subscribe() {
    const fields = [
      ["windSpeed", "cmd-wind-speed"],
      ["windDir", "cmd-wind-dir"],
      ["rain", "cmd-rain"],
      ["pressure", "cmd-pressure"],
    ];
    const unsubscribers = [];
    for (const [field, attr] of fields) {
      const cmdId = this._cmdId(attr);
      if (cmdId) {
        unsubscribers.push(store.subscribe(cmdId, ({ value, unit }) => this._update(field, value, unit)));
      }
    }
    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _update(field, value, unit = null) {
    if (field === "windSpeed") {
      this._windNode.textContent = `-> ${this._format(value)} ${unit || "km/h"}`.trim();
      return;
    }
    if (field === "windDir") {
      this._updateDir(Number(value));
      return;
    }
    if (field === "rain" && this._rainNode) {
      this._rainNode.textContent = `${this._format(value)} ${unit || "mm"}`.trim();
      return;
    }
    if (field === "pressure" && this._pressNode) {
      this._pressNode.textContent = `${this._format(value)} ${unit || "hPa"}`.trim();
    }
  }

  _updateDir(degrees) {
    if (!Number.isFinite(degrees)) {
      return;
    }
    const rad = (degrees - 90) * Math.PI / 180;
    const x2 = 30 + 22 * Math.cos(rad);
    const y2 = 30 + 22 * Math.sin(rad);
    this._needle.setAttribute("x2", x2.toFixed(1));
    this._needle.setAttribute("y2", y2.toFixed(1));
  }

  _format(value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return String(value);
    }
    return Number.isInteger(number) ? String(number) : number.toFixed(1);
  }
}

if (!customElements.get("widget-weather")) {
  customElements.define("widget-weather", WidgetWeather);
}
}());
