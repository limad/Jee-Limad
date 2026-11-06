"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetColor extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-color", "cmd-color-temp", "cmd-set-color-temp", "cmd-on", "cmd-off", "label"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    clearTimeout(this._tempTimer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribe?.();
    clearTimeout(this._tempTimer);
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _exec(attribute, options = {}) {
    const cmdId = this._cmdId(attribute);
    if (!cmdId) {
      return;
    }
    window.JeeDashApi?.execCmd(cmdId, options).catch((error) => console.error("[JeeDash color]", error));
  }

  _build() {
    const label = this.getAttribute("label") ?? "Couleur";

    this._card = document.createElement("div");
    this._card.className = "widget widget-color state-unknown";

    this._icon = document.createElement("div");
    this._icon.className = "widget-icon color-swatch";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._statusNode = document.createElement("div");
    this._statusNode.className = "widget-state";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    this._colorInput = document.createElement("input");
    this._colorInput.type = "color";
    this._colorInput.className = "color-picker";
    this._colorInput.disabled = !this._cmdId("cmd-color");
    this._colorInput.setAttribute("aria-label", t("color"));
    this._colorInput.addEventListener("change", () => {
      this._exec("cmd-color", { color: this._colorInput.value });
    });

    const actions = document.createElement("div");
    actions.className = "widget-actions";
    actions.append(this._colorInput);

    this._tempSlider = null;
    const colorTempId = this._cmdId("cmd-color-temp") || this._cmdId("cmd-set-color-temp");
    if (colorTempId) {
      this._tempSlider = document.createElement("input");
      this._tempSlider.type = "range";
      this._tempSlider.className = "color-temp-slider";
      this._tempSlider.min = "2700";
      this._tempSlider.max = "6500";
      this._tempSlider.step = "100";
      this._tempSlider.value = "4000";
      this._tempSlider.disabled = !this._cmdId("cmd-set-color-temp");
      this._tempSlider.addEventListener("input", () => {
        clearTimeout(this._tempTimer);
        this._tempTimer = setTimeout(() => {
          this._exec("cmd-set-color-temp", { slider: Number(this._tempSlider.value) });
        }, 300);
      });
      actions.append(this._tempSlider);
    }

    this._onBtn = document.createElement("button");
    this._onBtn.className = "btn-on";
    this._onBtn.type = "button";
    this._onBtn.textContent = t("on");
    this._onBtn.disabled = !this._cmdId("cmd-on");
    this._onBtn.setAttribute("aria-label", t("turn_on"));
    this._onBtn.addEventListener("click", () => this._exec("cmd-on"));

    this._offBtn = document.createElement("button");
    this._offBtn.className = "btn-off";
    this._offBtn.type = "button";
    this._offBtn.textContent = t("off");
    this._offBtn.disabled = !this._cmdId("cmd-off");
    this._offBtn.setAttribute("aria-label", t("turn_off"));
    this._offBtn.addEventListener("click", () => this._exec("cmd-off"));

    actions.append(this._onBtn, this._offBtn);
    this._card.append(this._icon, title, this._statusNode, actions);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _subscribe() {
    const stateId = this._cmdId("cmd-state");
    const colorId = this._cmdId("cmd-color");
    const tempId = this._cmdId("cmd-color-temp");
    const unsubscribers = [];

    if (stateId) {
      unsubscribers.push(store.subscribe(stateId, ({ value }) => this._update(value)));
    }
    if (colorId) {
      unsubscribers.push(store.subscribe(colorId, ({ value }) => this._updateColor(String(value ?? ""))));
    }
    if (tempId) {
      unsubscribers.push(store.subscribe(tempId, ({ value }) => this._updateColorTemp(value)));
    }

    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "" || value === "unknown";
    const isOn = !isUnknown && (value === true || value === 1 || value === "1" || value === "on");
    const state = isUnknown ? "unknown" : (isOn ? "on" : "off");

    this._card.className = `widget widget-color state-${state}`;
    this._statusNode.textContent = isUnknown ? t("unknown") : (isOn ? t("on") : t("off"));
  }

  _updateColor(value) {
    const hexColor = value.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(hexColor)) {
      return;
    }
    this._colorInput.value = hexColor;
    this._icon.style.setProperty("--swatch-color", hexColor);
  }

  _updateColorTemp(value) {
    const kelvin = Number(value);
    if (!this._tempSlider || !Number.isFinite(kelvin)) {
      return;
    }
    this._tempSlider.value = String(Math.max(2700, Math.min(6500, kelvin)));
  }
}

if (!customElements.get("widget-color")) {
  customElements.define("widget-color", WidgetColor);
}
}());
