"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetText extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-action", "cmd-state", "label", "placeholder"];
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
    const card = document.createElement("div");
    card.className = "widget widget-text";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Texte";

    const row = document.createElement("div");
    row.className = "text-row";

    this._input = document.createElement("input");
    this._input.className = "text-input";
    this._input.type = "text";
    this._input.placeholder = this.getAttribute("placeholder") ?? "";
    this._input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this._send();
      }
    });

    this._sendBtn = document.createElement("button");
    this._sendBtn.className = "btn-text-send";
    this._sendBtn.type = "button";
    this._sendBtn.textContent = "OK";
    this._sendBtn.disabled = !this._cmdId("cmd-action");
    this._sendBtn.addEventListener("click", () => this._send());

    row.append(this._input, this._sendBtn);
    card.append(title, row);
    this.replaceChildren(card);
  }

  _subscribe() {
    const stateId = this._cmdId("cmd-state");
    if (!stateId) {
      return;
    }
    this.unsubscribe = store.subscribe(stateId, ({ value }) => this._update(value));
  }

  _send() {
    const cmdId = this._cmdId("cmd-action");
    if (!cmdId) {
      return;
    }
    window.JeeDashApi?.execCmd(cmdId, { text: this._input.value })
      .catch((error) => console.error("[JeeDash text]", error));
  }

  _update(value) {
    if (value !== null && value !== undefined) {
      this._input.value = String(value);
    }
  }
}

if (!customElements.get("widget-text")) {
  customElements.define("widget-text", WidgetText);
}
}());
