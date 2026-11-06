"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetScene extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-action", "cmd-state", "label", "active-label", "inactive-label"];
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
    const label = this.getAttribute("label") ?? "Action";
    this._activeLabel = this.getAttribute("active-label") || "Actif";
    this._inactiveLabel = this.getAttribute("inactive-label") || "Inactif";

    const card = document.createElement("div");
    card.className = "widget widget-scene";

    this._btn = document.createElement("button");
    this._btn.type = "button";
    this._btn.className = "scene-btn";
    this._btn.disabled = !this._cmdId("cmd-action");
    this._btn.setAttribute("aria-label", label);
    this._btn.addEventListener("click", () => {
      const cmdId = this._cmdId("cmd-action");
      if (cmdId) {
        window.JeeDashApi?.execCmd(cmdId).catch((error) => console.error("[JeeDash scene]", error));
      }
    });

    const icon = document.createElement("div");
    icon.className = "scene-icon";
    icon.textContent = ">";

    const name = document.createElement("div");
    name.className = "scene-label";
    name.textContent = label;

    this._statusNode = document.createElement("div");
    this._statusNode.className = "scene-status";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    this._btn.append(icon, name, this._statusNode);
    card.append(this._btn);
    this.replaceChildren(card);
    this._update(null);
  }

  _subscribe() {
    const stateId = this._cmdId("cmd-state");
    if (!stateId) {
      return;
    }
    this.unsubscribe = store.subscribe(stateId, ({ value }) => this._update(value));
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "";
    const isOn = !isUnknown && (value === true || value === 1 || value === "1" || value === "on");

    this._btn.classList.toggle("state-active", isOn);
    this._statusNode.textContent = isUnknown ? "" : (isOn ? this._activeLabel : this._inactiveLabel);
  }
}

if (!customElements.get("widget-scene")) {
  customElements.define("widget-scene", WidgetScene);
}
}());
