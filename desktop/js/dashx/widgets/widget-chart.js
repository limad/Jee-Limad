"use strict";

(function () {

class WidgetChart extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-value", "label", "hours"];
  }

  connectedCallback() {
    this._build();
    this._startPolling();
  }

  disconnectedCallback() {
    clearInterval(this._timer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    clearInterval(this._timer);
    this._build();
    this._startPolling();
  }

  _cmdId() {
    return Number.parseInt(this.getAttribute("cmd-value") ?? "", 10) || 0;
  }

  _hours() {
    return Number.parseInt(this.getAttribute("hours") ?? "24", 10) || 24;
  }

  _build() {
    const card = document.createElement("div");
    card.className = "widget widget-chart";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "";

    this._svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._svg.setAttribute("class", "chart-svg");
    this._svg.setAttribute("viewBox", "0 0 100 40");
    this._svg.setAttribute("preserveAspectRatio", "none");

    this._poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    this._poly.setAttribute("class", "chart-line");
    this._svg.append(this._poly);

    this._meta = document.createElement("div");
    this._meta.className = "chart-meta";

    card.append(title, this._svg, this._meta);
    this.replaceChildren(card);
    this._update(null);
  }

  async _fetch() {
    const id = this._cmdId();
    if (!id || !window.JeeDashApi?.getHistory) {
      return;
    }
    try {
      const data = await window.JeeDashApi.getHistory(id, this._hours());
      this._update(data);
    } catch (error) {
      console.warn("[JeeDash chart] history fetch", error);
    }
  }

  _startPolling() {
    this._fetch();
    this._timer = setInterval(() => this._fetch(), 300000);
  }

  _update(data) {
    const points = data?.points ?? [];
    if (points.length < 2) {
      this._poly.setAttribute("points", "");
      this._meta.textContent = "—";
      return;
    }

    const xs = points.map((point) => point.t);
    const ys = points.map((point) => point.v);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;

    const coords = points.map((point) => {
      const x = ((point.t - minX) / spanX) * 100;
      const y = 40 - ((point.v - minY) / spanY) * 38 - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
    this._poly.setAttribute("points", coords);

    const unit = data?.unit ?? "";
    const last = ys[ys.length - 1];
    this._meta.textContent = `${last}${unit} · min ${minY}${unit} · max ${maxY}${unit}`;
  }
}

if (!customElements.get("widget-chart")) {
  customElements.define("widget-chart", WidgetChart);
}
}());
