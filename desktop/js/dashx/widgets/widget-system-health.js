"use strict";

(function () {

class WidgetSystemHealth extends HTMLElement {
  static get observedAttributes() {
    return ["label", "refresh"];
  }

  connectedCallback() {
    this._timer = null;
    this._build();
    this._refresh();
    this._timer = window.setInterval(() => this._refresh(), this._interval());
  }

  disconnectedCallback() {
    window.clearInterval(this._timer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    window.clearInterval(this._timer);
    this._build();
    this._refresh();
    this._timer = window.setInterval(() => this._refresh(), this._interval());
  }

  _interval() {
    return Math.max(15, Math.min(300, Number(this.getAttribute("refresh") ?? "60") || 60)) * 1000;
  }

  _build() {
    const card = document.createElement("div");
    card.className = "widget widget-system-health";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Systeme";

    this._rows = document.createElement("div");
    this._rows.className = "health-rows";

    card.append(title, this._rows);
    this.replaceChildren(card);
    this._render({ daemon: "-", sse: "-" });
  }

  async _refresh() {
    if (!window.JeeDashApi?.getHealth) {
      return;
    }
    try {
      const health = await window.JeeDashApi.getHealth();
      this._render({
        daemon: health?.daemon?.state ?? "-",
        sse: health?.sseProxyHttpStatus ?? "-",
        socket: health?.eventSocketPort ?? "-",
      });
    } catch (error) {
      this._render({ daemon: "error", sse: "-", socket: "-" });
      console.error("[JeeDash health]", error);
    }
  }

  _render(values) {
    this._rows.replaceChildren(
      this._row("Daemon", values.daemon),
      this._row("SSE", values.sse),
      this._row("Socket", values.socket)
    );
  }

  _row(labelText, valueText) {
    const row = document.createElement("div");
    row.className = "health-row";
    const label = document.createElement("span");
    label.textContent = labelText;
    const value = document.createElement("strong");
    value.textContent = String(valueText);
    row.append(label, value);
    return row;
  }
}

if (!customElements.get("widget-system-health")) {
  customElements.define("widget-system-health", WidgetSystemHealth);
}
}());
