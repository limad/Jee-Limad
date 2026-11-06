"use strict";

(function () {

class WidgetDivider extends HTMLElement {
  static get observedAttributes() {
    return ["title"];
  }

  connectedCallback() {
    this._build();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._build();
    }
  }

  _build() {
    const wrap = document.createElement("div");
    wrap.className = "widget widget-divider";

    const line = document.createElement("hr");
    line.className = "divider-line";

    const titleText = this.getAttribute("title") ?? "";
    if (titleText) {
      const span = document.createElement("span");
      span.className = "divider-title";
      span.textContent = titleText;
      wrap.append(span);
    }
    wrap.append(line);
    this.replaceChildren(wrap);
  }
}

if (!customElements.get("widget-divider")) {
  customElements.define("widget-divider", WidgetDivider);
}
}());
