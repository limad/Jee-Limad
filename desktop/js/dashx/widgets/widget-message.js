"use strict";

(function () {

class WidgetMessage extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-action", "label", "show-title", "placeholder-title", "placeholder-msg"];
  }

  connectedCallback() {
    this._build();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._build();
    }
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _build() {
    const card = document.createElement("div");
    card.className = "widget widget-message";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Message";

    this._titleInput = document.createElement("input");
    this._titleInput.className = "msg-title";
    this._titleInput.type = "text";
    this._titleInput.placeholder = this.getAttribute("placeholder-title") ?? "";
    this._titleInput.hidden = this.getAttribute("show-title") === "0";

    this._bodyArea = document.createElement("textarea");
    this._bodyArea.className = "msg-body";
    this._bodyArea.placeholder = this.getAttribute("placeholder-msg") ?? "";
    this._bodyArea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.ctrlKey) {
        event.preventDefault();
        this._send();
      }
    });

    this._sendBtn = document.createElement("button");
    this._sendBtn.className = "btn-msg-send";
    this._sendBtn.type = "button";
    this._sendBtn.textContent = "Envoyer";
    this._sendBtn.disabled = !this._cmdId("cmd-action");
    this._sendBtn.addEventListener("click", () => this._send());

    card.append(title, this._titleInput, this._bodyArea, this._sendBtn);
    this.replaceChildren(card);
  }

  _send() {
    const cmdId = this._cmdId("cmd-action");
    const message = this._bodyArea.value.trim();
    if (!cmdId || !message) {
      return;
    }
    const title = this._titleInput.hidden ? "" : this._titleInput.value.trim();
    window.JeeDashApi?.execCmd(cmdId, { title, message })
      .catch((error) => console.error("[JeeDash message]", error));
    this._bodyArea.value = "";
  }
}

if (!customElements.get("widget-message")) {
  customElements.define("widget-message", WidgetMessage);
}
}());
