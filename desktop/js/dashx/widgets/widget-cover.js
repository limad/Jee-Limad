"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetCover extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-up", "cmd-down", "cmd-stop", "cmd-slider", "label"];
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
    const id = this._cmdId("cmd-state");
    if (!id) {
      return;
    }
    this.unsubscribe = store.subscribe(id, ({ value }) => this._update(value));
  }

  _cmdId(attribute) {
    const cmdId = Number.parseInt(this.getAttribute(attribute) ?? "", 10);
    return cmdId > 0 ? cmdId : 0;
  }

  _exec(attribute, optimisticState) {
    const cmdId = this._cmdId(attribute);
    if (!cmdId) {
      return;
    }
    const stateId = this._cmdId("cmd-state");
    if (stateId && optimisticState !== undefined) {
      store.setOptimistic(stateId, optimisticState);
    }
    window.JeeDashApi.execCmd(cmdId).catch((error) => {
      if (stateId && optimisticState !== undefined) {
        store.revertOptimistic(stateId);
      }
      console.error("[JeeDash cover]", error);
    });
  }

  _button(className, text, attribute) {
    const button = document.createElement("button");
    button.className = `btn-cover ${className}`;
    button.type = "button";
    button.textContent = text;
    button.disabled = !this._cmdId(attribute);
    const labels = {
      "cmd-up": t("cover_up"),
      "cmd-stop": t("cover_stop"),
      "cmd-down": t("cover_down"),
      "cmd-slider": "Position volet",
    };
    if (labels[attribute]) {
      button.setAttribute("aria-label", labels[attribute]);
    }
    const optimistic = attribute === "cmd-up" ? 100 : (attribute === "cmd-down" ? 0 : undefined);
    button.addEventListener("click", () => this._exec(attribute, optimistic));
    return button;
  }

  _build() {
    const label = this.getAttribute("label") ?? "Volet";

    this._card = document.createElement("div");
    this._card.className = "widget widget-cover";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._stateNode = document.createElement("div");
    this._stateNode.className = "cover-state";
    this._stateNode.setAttribute("aria-live", "polite");
    this._stateNode.setAttribute("aria-atomic", "true");

    const controls = document.createElement("div");
    controls.className = "cover-controls";
    controls.append(
      this._button("btn-up", "↑", "cmd-up"),
      this._button("btn-stop", "■", "cmd-stop"),
      this._button("btn-down", "↓", "cmd-down"),
    );

    this._sliderNode = document.createElement("input");
    this._sliderNode.type = "range";
    this._sliderNode.min = "0";
    this._sliderNode.max = "100";
    this._sliderNode.className = "cover-slider";
    this._sliderNode.disabled = !this._cmdId("cmd-slider");
    this._sliderNode.addEventListener("input", () => {
      if (Number.isFinite(Number(this._sliderNode.value))) {
        this._stateNode.textContent = `${this._sliderNode.value} %`;
      }
    });
    this._sliderNode.addEventListener("change", () => {
      const cmdId = this._cmdId("cmd-slider");
      if (!cmdId) {
        return;
      }
      const value = Math.max(0, Math.min(100, Number(this._sliderNode.value)));
      const stateId = this._cmdId("cmd-state");
      if (stateId) {
        store.setOptimistic(stateId, value);
      }
      window.JeeDashApi.execCmd(cmdId, { slider: value })
        .catch((error) => {
          if (stateId) {
            store.revertOptimistic(stateId);
          }
          console.error("[JeeDash cover slider]", error);
        });
    });

    this._card.append(title, this._stateNode, controls, this._sliderNode);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _update(value) {
    if (value === null || value === undefined || value === "") {
      this._stateNode.textContent = "—";
      delete this._card.dataset.state;
      return;
    }

    const normalized = String(value).toLowerCase();
    if (value === true || value === 1 || normalized === "1" || normalized === "on") {
      this._stateNode.textContent = "100 %";
      this._sliderNode.value = "100";
      this._card.dataset.state = "open";
      return;
    }
    if (value === false || value === 0 || normalized === "0" || normalized === "off") {
      this._stateNode.textContent = "0 %";
      this._sliderNode.value = "0";
      this._card.dataset.state = "closed";
      return;
    }

    const position = Number(value);
    if (Number.isFinite(position)) {
      this._stateNode.textContent = `${position} %`;
      this._sliderNode.value = String(Math.round(position));
      this._card.dataset.state = position <= 5 ? "closed" : (position >= 95 ? "open" : "partial");
      return;
    }

    this._stateNode.textContent = String(value);
    this._card.dataset.state = "partial";
  }
}

if (!customElements.get("widget-cover")) {
  customElements.define("widget-cover", WidgetCover);
}
}());
