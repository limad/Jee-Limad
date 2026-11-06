"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetDimmer extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-brightness", "cmd-slider", "label"];
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

  _subscribe() {
    const id = this._cmdId("cmd-brightness");
    if (!id) {
      return;
    }
    this.unsubscribe = store.subscribe(id, ({ value }) => this._update(value));
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _execSlider(value) {
    const cmdId = this._cmdId("cmd-slider");
    if (!cmdId) {
      return;
    }
    window.JeeDashApi.execCmd(cmdId, { slider: Math.max(0, Math.min(100, value)) })
      .catch((error) => console.error("[JeeDash dimmer]", error));
  }

  _build() {
    const label = this.getAttribute("label") ?? "Variateur";

    const card = document.createElement("div");
    card.className = "widget widget-dimmer";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = "Dim";

    this._valueNode = document.createElement("div");
    this._valueNode.className = "dimmer-value";

    this._rangeNode = document.createElement("input");
    this._rangeNode.className = "dimmer-slider";
    this._rangeNode.type = "range";
    this._rangeNode.min = "0";
    this._rangeNode.max = "100";
    this._rangeNode.value = "0";
    this._rangeNode.disabled = !this._cmdId("cmd-slider");
    this._rangeNode.setAttribute("aria-label", t("brightness"));
    this._rangeTimer = null;
    this._rangeNode.addEventListener("input", () => {
      this._valueNode.textContent = `${this._rangeNode.value} %`;
      this._rangeNode.setAttribute("aria-valuetext", `${this._rangeNode.value} %`);
      clearTimeout(this._rangeTimer);
      this._rangeTimer = setTimeout(() => {
        this._execSlider(Number(this._rangeNode.value));
      }, 300);
    });

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    card.append(icon, this._valueNode, this._rangeNode, title);
    this.replaceChildren(card);
    this._update(null);
  }

  _update(value) {
    const number = Number(value);
    if (value === null || value === undefined || value === "" || Number.isNaN(number)) {
      this._valueNode.textContent = "—";
      return;
    }
    this._valueNode.textContent = `${number.toFixed(0)} %`;
    this._rangeNode.value = String(Math.round(number));
    this._rangeNode.setAttribute("aria-valuetext", `${Math.round(number)} %`);
  }
}

if (!customElements.get("widget-dimmer")) {
  customElements.define("widget-dimmer", WidgetDimmer);
}
}());
