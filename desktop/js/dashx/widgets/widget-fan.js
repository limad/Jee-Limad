"use strict";

(function () {

const store = window.JeeDashStore;
const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetFan extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-speed-state", "cmd-speed", "cmd-on", "cmd-off", "label"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._timer = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    clearTimeout(this._timer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribe?.();
    clearTimeout(this._timer);
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _exec(attr, options = {}, optimisticState) {
    const cmdId = this._cmdId(attr);
    if (cmdId) {
      const stateId = this._cmdId("cmd-speed-state");
      if (stateId && optimisticState !== undefined) {
        store.setOptimistic(stateId, optimisticState);
      }
      window.JeeDashApi?.execCmd(cmdId, options).catch((error) => {
        if (stateId && optimisticState !== undefined) {
          store.revertOptimistic(stateId);
        }
        console.error("[JeeDash fan]", error);
      });
    }
  }

  _build() {
    this._card = document.createElement("div");
    this._card.className = "widget widget-fan";

    this._icon = document.createElement("div");
    this._icon.className = "widget-icon";
    this._icon.textContent = "*";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Ventilateur";

    this._valueNode = document.createElement("div");
    this._valueNode.className = "fan-speed-value";
    this._valueNode.textContent = "-";

    this._slider = document.createElement("input");
    this._slider.className = "fan-slider";
    this._slider.type = "range";
    this._slider.min = "0";
    this._slider.max = "100";
    this._slider.step = "1";
    this._slider.disabled = !this._cmdId("cmd-speed");
    this._slider.setAttribute("aria-label", "Vitesse");
    this._slider.addEventListener("input", () => {
      this._update(this._slider.value);
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._exec("cmd-speed", { slider: this._slider.value }, Number(this._slider.value));
      }, 300);
    });

    this._card.append(this._icon, title, this._valueNode, this._slider);

    if (this._cmdId("cmd-on") || this._cmdId("cmd-off")) {
      const actions = document.createElement("div");
      actions.className = "widget-actions";

      const onBtn = document.createElement("button");
      onBtn.className = "btn-fan-on";
      onBtn.type = "button";
      onBtn.textContent = t("on");
      onBtn.disabled = !this._cmdId("cmd-on");
      onBtn.addEventListener("click", () => this._exec("cmd-on", {}, 1));

      const offBtn = document.createElement("button");
      offBtn.className = "btn-fan-off";
      offBtn.type = "button";
      offBtn.textContent = t("off");
      offBtn.disabled = !this._cmdId("cmd-off");
      offBtn.addEventListener("click", () => this._exec("cmd-off", {}, 0));

      actions.append(onBtn, offBtn);
      this._card.append(actions);
    }

    this.replaceChildren(this._card);
    this._update(null);
  }

  _subscribe() {
    const speedId = this._cmdId("cmd-speed-state");
    if (!speedId) {
      return;
    }
    this.unsubscribe = store.subscribe(speedId, ({ value }) => this._update(value));
  }

  _update(value) {
    const number = Math.max(0, Math.min(100, Number(value)));
    const speed = Number.isFinite(number) ? number : 0;
    this._valueNode.textContent = `${Math.round(speed)} %`;
    this._slider.value = String(Math.round(speed));
    this._card.classList.toggle("spinning", speed > 0);
    this._card.style.setProperty("--fan-duration", `${Math.max(.4, 3 - speed / 40).toFixed(2)}s`);
  }
}

if (!customElements.get("widget-fan")) {
  customElements.define("widget-fan", WidgetFan);
}
}());
