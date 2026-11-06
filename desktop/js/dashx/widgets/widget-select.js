"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetSelect extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-action", "cmd-state", "label", "options"];
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

  _parseOptions() {
    const raw = this.getAttribute("options") ?? "";
    if (!raw.trim()) {
      return [];
    }
    return raw.split(",").map((entry) => {
      const [value, ...labelParts] = entry.trim().split(":");
      const trimmedValue = value.trim();
      return { value: trimmedValue, label: (labelParts.join(":") || trimmedValue).trim() };
    }).filter((option) => option.value !== "");
  }

  _build() {
    const label = this.getAttribute("label") ?? "Select";

    const card = document.createElement("div");
    card.className = "widget widget-select";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._select = document.createElement("select");
    this._select.className = "select-control";
    this._select.disabled = !this._cmdId("cmd-action");
    this._select.setAttribute("aria-label", label);

    for (const option of this._parseOptions()) {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      this._select.append(opt);
    }

    this._select.addEventListener("change", () => {
      const cmdId = this._cmdId("cmd-action");
      if (cmdId) {
        window.JeeDashApi?.execCmd(cmdId, { select: this._select.value })
          .catch((error) => console.error("[JeeDash select]", error));
      }
    });

    card.append(title, this._select);
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
    if (value === null || value === undefined || value === "") {
      return;
    }
    const currentValue = String(value);
    const option = Array.from(this._select.options).find((item) => item.value === currentValue);
    if (option) {
      this._select.value = currentValue;
    }
  }
}

if (!customElements.get("widget-select")) {
  customElements.define("widget-select", WidgetSelect);
}
}());
