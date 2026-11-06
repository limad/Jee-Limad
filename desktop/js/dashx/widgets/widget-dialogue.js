"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetDialogue extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-action", "cmd-response", "label", "placeholder"];
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
    card.className = "widget widget-dialogue";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Dialogue";

    this._history = document.createElement("div");
    this._history.className = "dialogue-history";

    const composer = document.createElement("div");
    composer.className = "dialogue-composer";

    this._input = document.createElement("textarea");
    this._input.className = "dialogue-input";
    this._input.placeholder = this.getAttribute("placeholder") ?? "Votre message...";
    this._input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this._send();
      }
    });

    this._sendBtn = document.createElement("button");
    this._sendBtn.className = "btn-dialogue-send";
    this._sendBtn.type = "button";
    this._sendBtn.textContent = "^";
    this._sendBtn.disabled = !this._cmdId("cmd-action");
    this._sendBtn.addEventListener("click", () => this._send());

    composer.append(this._input, this._sendBtn);
    card.append(title, this._history, composer);
    this.replaceChildren(card);
  }

  _subscribe() {
    const responseId = this._cmdId("cmd-response");
    if (!responseId) {
      return;
    }
    this.unsubscribe = store.subscribe(responseId, ({ value }) => this._update(value));
  }

  _send() {
    const cmdId = this._cmdId("cmd-action");
    const message = this._input.value.trim();
    if (!cmdId || !message) {
      return;
    }
    this._pushBubble("request", message);
    this._showSpinner();
    window.JeeDashApi?.execCmd(cmdId, { title: "", message })
      .catch((error) => {
        this._hideSpinner();
        console.error("[JeeDash dialogue]", error);
      });
    this._input.value = "";
  }

  _update(value) {
    const text = String(value ?? "").trim();
    if (!text) {
      return;
    }
    this._hideSpinner();
    this._pushBubble("response", text);
  }

  _pushBubble(kind, text) {
    const bubble = document.createElement("div");
    bubble.className = `dialogue-bubble dialogue-bubble--${kind}`;
    bubble.textContent = text;
    this._history.append(bubble);
    this._history.scrollTop = this._history.scrollHeight;
  }

  _showSpinner() {
    this._hideSpinner();
    const spinner = document.createElement("div");
    spinner.className = "dialogue-spinner";
    spinner.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));
    this._history.append(spinner);
    this._history.scrollTop = this._history.scrollHeight;
  }

  _hideSpinner() {
    this._history.querySelector(".dialogue-spinner")?.remove();
  }
}

if (!customElements.get("widget-dialogue")) {
  customElements.define("widget-dialogue", WidgetDialogue);
}
}());
