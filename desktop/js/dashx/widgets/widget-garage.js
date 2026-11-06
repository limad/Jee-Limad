"use strict";

(function () {

const store = window.JeeDashStore;
const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetGarage extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-open", "cmd-close", "cmd-toggle", "label", "invert"];
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

  _exec(attr, optimisticState) {
    const cmdId = this._cmdId(attr);
    if (cmdId) {
      if (!window.confirm("Confirmer l action sur le garage/portail ?")) {
        return;
      }
      const stateId = this._cmdId("cmd-state");
      if (stateId && optimisticState !== undefined) {
        store.setOptimistic(stateId, optimisticState);
      }
      window.JeeDashApi?.execCmd(cmdId).catch((error) => {
        if (stateId && optimisticState !== undefined) {
          store.revertOptimistic(stateId);
        }
        console.error("[JeeDash garage]", error);
      });
    }
  }

  _build() {
    this._card = document.createElement("div");
    this._card.className = "widget widget-garage state-unknown";

    this._icon = document.createElement("div");
    this._icon.className = "widget-icon";
    this._icon.textContent = "?";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Garage";

    this._statusNode = document.createElement("div");
    this._statusNode.className = "widget-state";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    const actions = document.createElement("div");
    actions.className = "widget-actions";

    const openValue = this.getAttribute("invert") === "1" ? 0 : 1;
    const closeValue = this.getAttribute("invert") === "1" ? 1 : 0;
    const openBtn = this._button("btn-garage-open", t("open"), "cmd-open", openValue);
    const closeBtn = this._button("btn-garage-close", t("close"), "cmd-close", closeValue);
    const toggleBtn = this._button("btn-garage-toggle", "Toggle", "cmd-toggle");

    actions.append(openBtn, closeBtn);
    if (this._cmdId("cmd-toggle")) {
      actions.append(toggleBtn);
    }

    this._card.append(this._icon, title, this._statusNode, actions);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _button(className, text, attr, optimisticState) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = text;
    button.disabled = !this._cmdId(attr);
    button.addEventListener("click", () => {
      const stateId = this._cmdId("cmd-state");
      const current = store.get(stateId)?.value;
      const rawOpen = current === true || current === 1 || current === "1" || current === "on";
      const next = attr === "cmd-toggle" ? (rawOpen ? 0 : 1) : optimisticState;
      this._exec(attr, next);
    });
    return button;
  }

  _subscribe() {
    const stateId = this._cmdId("cmd-state");
    if (!stateId) {
      return;
    }
    this.unsubscribe = store.subscribe(stateId, ({ value }) => this._update(value));
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "" || value === "unknown";
    const rawOpen = value === true || value === 1 || value === "1" || value === "on";
    const isOpen = this.getAttribute("invert") === "1" ? !rawOpen : rawOpen;
    const state = isUnknown ? "unknown" : (isOpen ? "open" : "closed");

    this._card.className = `widget widget-garage state-${state}`;
    this._icon.textContent = isUnknown ? "?" : (isOpen ? "^" : "v");
    this._statusNode.textContent = isUnknown ? t("unknown") : (isOpen ? t("open") : t("closed"));
  }
}

if (!customElements.get("widget-garage")) {
  customElements.define("widget-garage", WidgetGarage);
}
}());
