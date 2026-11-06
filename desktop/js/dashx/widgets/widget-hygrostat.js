"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetHygrostat extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-setpoint", "cmd-set-setpoint", "cmd-humidity", "label"];
  }

  connectedCallback() {
    this.unsubscribers = [];
    this._sliderTimer = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    clearTimeout(this._sliderTimer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    clearTimeout(this._sliderTimer);
    this.unsubscribers = [];
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _build() {
    const card = document.createElement("div");
    card.className = "widget widget-hygrostat";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = "%";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Hygrostat";

    this._currentNode = document.createElement("div");
    this._currentNode.className = "hygro-current";
    this._currentNode.hidden = !this._cmdId("cmd-humidity");
    this._currentNode.textContent = "Humidite : -- %";

    this._setpointNode = document.createElement("div");
    this._setpointNode.className = "hygro-setpoint";
    this._setpointNode.textContent = "Consigne : -- %";

    this._sliderNode = document.createElement("input");
    this._sliderNode.className = "hygro-slider";
    this._sliderNode.type = "range";
    this._sliderNode.min = "0";
    this._sliderNode.max = "100";
    this._sliderNode.step = "1";
    this._sliderNode.disabled = !this._cmdId("cmd-set-setpoint");
    this._sliderNode.addEventListener("input", () => {
      const value = Math.max(0, Math.min(100, Number(this._sliderNode.value) || 0));
      this._setpointNode.textContent = `Consigne : ${Math.round(value)} %`;
      clearTimeout(this._sliderTimer);
      this._sliderTimer = setTimeout(() => this._execSetpoint(value), 300);
    });

    card.append(icon, title, this._currentNode, this._setpointNode, this._sliderNode);
    this.replaceChildren(card);
  }

  _subscribe() {
    this.unsubscribers = [];
    const setpointId = this._cmdId("cmd-setpoint");
    const humidityId = this._cmdId("cmd-humidity");

    if (setpointId) {
      this.unsubscribers.push(store.subscribe(setpointId, ({ value }) => this._update("setpoint", value)));
    }
    if (humidityId) {
      this.unsubscribers.push(store.subscribe(humidityId, ({ value }) => this._update("humidity", value)));
    }
  }

  _execSetpoint(value) {
    const cmdId = this._cmdId("cmd-set-setpoint");
    if (cmdId) {
      window.JeeDashApi?.execCmd(cmdId, { slider: Math.max(0, Math.min(100, value)) })
        .catch((error) => console.error("[JeeDash hygrostat]", error));
    }
  }

  _update(field, value) {
    const number = Math.max(0, Math.min(100, Number(value)));
    const display = Number.isFinite(number) ? Math.round(number) : "--";
    if (field === "setpoint") {
      this._setpointNode.textContent = `Consigne : ${display} %`;
      if (Number.isFinite(number)) {
        this._sliderNode.value = String(Math.round(number));
      }
      return;
    }
    if (field === "humidity") {
      this._currentNode.hidden = false;
      this._currentNode.textContent = `Humidite : ${display} %`;
    }
  }
}

if (!customElements.get("widget-hygrostat")) {
  customElements.define("widget-hygrostat", WidgetHygrostat);
}
}());
