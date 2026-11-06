"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetThermostat extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-temp", "cmd-setpoint", "cmd-set-setpoint", "cmd-mode", "label", "cmd-history", "history-hours"];
  }

  connectedCallback() {
    this.unsubscribers = [];
    this.temperature = null;
    this.setpoint = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    clearInterval(this._sparkTimer);
    clearTimeout(this._sliderTimer);
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

  _subscribe() {
    this.unsubscribers = [];
    const tempId = this._cmdId("cmd-temp");
    const spId = this._cmdId("cmd-setpoint");
    const modeId = this._cmdId("cmd-mode");

    if (tempId) {
      this.unsubscribers.push(store.subscribe(tempId, ({ value }) => {
        this.temperature = value;
        this._renderTempNode(this._tempNode, value);
      }));
    }
    if (spId) {
      this.unsubscribers.push(store.subscribe(spId, ({ value }) => {
        this.setpoint = value;
        this._setpointNode.textContent = `${t("setpoint")} : ${this._formatTemp(value)}`;
        if (Number.isFinite(Number(value))) {
          this._sliderNode.value = String(Math.round(Number(value) * 2) / 2);
          this._sliderNode.setAttribute("aria-valuetext", `${this._sliderNode.value} degres`);
          this._updateSliderFill();
          this._syncSetpointDisplay(Number(this._sliderNode.value));
        }
      }));
    }
    if (modeId) {
      this.unsubscribers.push(store.subscribe(modeId, ({ value }) => {
        this._modeNode.textContent = value ?? "";
        this._modeNode.hidden = !value;
      }));
    }
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _execSetpoint(value) {
    const cmdId = this._cmdId("cmd-set-setpoint");
    if (!cmdId) {
      return;
    }
    window.JeeDashApi.execCmd(cmdId, { slider: Math.max(5, Math.min(30, value)) })
      .catch((error) => console.error("[JeeDash thermostat]", error));
  }

  _setSetpoint(value) {
    const next = Math.max(5, Math.min(30, Math.round(Number(value) * 2) / 2));
    if (!Number.isFinite(next)) {
      return;
    }
    this.setpoint = next;
    this._sliderNode.value = String(next);
    this._sliderNode.setAttribute("aria-valuetext", `${next} degres`);
    this._updateSliderFill();
    this._syncSetpointDisplay(next);
    clearTimeout(this._sliderTimer);
    this._sliderTimer = setTimeout(() => this._execSetpoint(next), 300);
  }

  _updateSliderFill() {
    if (!this._sliderNode) {
      return;
    }
    const min = Number(this._sliderNode.min || 0);
    const max = Number(this._sliderNode.max || 100);
    const value = Number(this._sliderNode.value || min);
    const span = max - min || 1;
    const percent = Math.max(0, Math.min(100, ((value - min) / span) * 100));
    this._sliderNode.style.setProperty("--thermo-range-fill", `${percent}%`);
  }

  _syncSetpointDisplay(value) {
    if (!this._targetValueNode) {
      return;
    }
    this._renderTempNode(this._targetValueNode, value, false);
    this._setpointNode.textContent = `${t("setpoint")} : ${this._formatTemp(value)}`;
  }

  _renderTempNode(node, value, withDegree = false) {
    if (!node) {
      return;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      node.textContent = "—";
      return;
    }
    const fixed = numeric.toFixed(1);
    const [integer, decimal] = fixed.split(".");
    const main = document.createElement("span");
    main.className = "thermo-number-main";
    main.textContent = integer;
    const dec = document.createElement("span");
    dec.className = "thermo-number-decimal";
    dec.textContent = decimal ? `.${decimal}${withDegree ? "°" : ""}` : withDegree ? "°" : "";
    node.replaceChildren(main, dec);
  }

  _formatTemp(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    return `${Number(value).toFixed(1)} °C`;
  }

  _build() {
    clearInterval(this._sparkTimer);
    this._sparklineContainer = null;
    this.temperature = null;
    this.setpoint = null;
    const label = this.getAttribute("label") ?? "Thermostat";

    const card = document.createElement("div");
    card.className = "widget widget-thermostat";

    this._labelNode = document.createElement("div");
    this._labelNode.className = "widget-label";
    this._labelNode.textContent = label;

    const face = document.createElement("div");
    face.className = "thermo-face";

    const dial = document.createElement("div");
    dial.className = "thermo-dial";

    const currentPane = document.createElement("div");
    currentPane.className = "thermo-pane thermo-current";

    this._tempNode = document.createElement("div");
    this._tempNode.className = "thermo-temp widget-value";
    this._renderTempNode(this._tempNode, this.temperature);

    const targetPane = document.createElement("div");
    targetPane.className = "thermo-pane thermo-target";
    this._targetValueNode = document.createElement("span");
    this._targetValueNode.className = "thermo-target-value";
    this._targetValueNode.textContent = "—";

    currentPane.append(this._tempNode);
    targetPane.append(this._targetValueNode);
    dial.append(currentPane, targetPane);

    const row = document.createElement("div");
    row.className = "thermo-row";

    this._setpointNode = document.createElement("div");
    this._setpointNode.className = "thermo-setpoint";
    this._setpointNode.textContent = `${t("setpoint")} : ${this._formatTemp(this.setpoint)}`;

    this._sliderNode = document.createElement("input");
    this._sliderNode.className = "thermo-slider";
    this._sliderNode.type = "range";
    this._sliderNode.min = "5";
    this._sliderNode.max = "30";
    this._sliderNode.step = "0.5";
    this._sliderNode.disabled = !this._cmdId("cmd-set-setpoint");
    this._sliderNode.setAttribute("aria-label", t("temperature"));
    this._sliderTimer = null;
    this._sliderNode.addEventListener("input", () => {
      this._setSetpoint(Number(this._sliderNode.value));
    });
    this._updateSliderFill();

    const controls = document.createElement("div");
    controls.className = "thermo-stepper";
    this._incNode = document.createElement("button");
    this._incNode.type = "button";
    this._incNode.className = "thermo-step thermo-step-plus";
    this._incNode.textContent = "+";
    this._incNode.title = "Augmenter la consigne";
    this._incNode.disabled = this._sliderNode.disabled;
    this._incNode.addEventListener("click", (event) => {
      event.stopPropagation();
      this._setSetpoint(Number(this._sliderNode.value || this.setpoint || 20) + 0.5);
    });

    this._decNode = document.createElement("button");
    this._decNode.type = "button";
    this._decNode.className = "thermo-step thermo-step-minus";
    this._decNode.textContent = "-";
    this._decNode.title = "Diminuer la consigne";
    this._decNode.disabled = this._sliderNode.disabled;
    this._decNode.addEventListener("click", (event) => {
      event.stopPropagation();
      this._setSetpoint(Number(this._sliderNode.value || this.setpoint || 20) - 0.5);
    });
    controls.append(this._incNode, this._decNode);
    face.append(dial, controls);

    this._modeNode = document.createElement("div");
    this._modeNode.className = "thermo-mode";
    this._modeNode.hidden = !this._cmdId("cmd-mode");

    row.append(this._setpointNode, this._sliderNode);
    card.append(this._labelNode, face, row, this._modeNode);
    this.replaceChildren(card);
    const histId = this._cmdId("cmd-history");
    if (histId) {
      this._sparklineContainer = document.createElement("div");
      this._sparklineContainer.className = "inline-sparkline";
      card.append(this._sparklineContainer);
      this._fetchSparkline();
      this._sparkTimer = setInterval(() => this._fetchSparkline(), 300000);
    }
    this._applyInitial();
  }

  _applyInitial() {
    const tempId = this._cmdId("cmd-temp");
    const spId = this._cmdId("cmd-setpoint");
    const modeId = this._cmdId("cmd-mode");

    if (tempId) {
      const state = store.get(tempId);
      this.temperature = state?.value;
      this._renderTempNode(this._tempNode, this.temperature);
    }
    if (spId) {
      const state = store.get(spId);
      this.setpoint = state?.value;
      this._setpointNode.textContent = `${t("setpoint")} : ${this._formatTemp(this.setpoint)}`;
      if (Number.isFinite(Number(this.setpoint))) {
        this._sliderNode.value = String(Math.round(Number(this.setpoint) * 2) / 2);
        this._sliderNode.setAttribute("aria-valuetext", `${this._sliderNode.value} degres`);
        this._updateSliderFill();
        this._syncSetpointDisplay(Number(this._sliderNode.value));
      }
    }
    if (modeId) {
      const value = store.get(modeId)?.value;
      this._modeNode.textContent = value ?? "";
      this._modeNode.hidden = !value;
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

if (!customElements.get("widget-thermostat")) {
  customElements.define("widget-thermostat", WidgetThermostat);
}
}());
