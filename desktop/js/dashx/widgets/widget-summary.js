"use strict";

(function () {

class WidgetSummary extends HTMLElement {
  static get observedAttributes() {
    return ["label", "fields"];
  }

  connectedCallback() {
    this._fields = [];
    this._valueNodes = new Map();
    this._titleNode = null;
    this.data = null;
    this.timer = null;
    this._build();
    this.refresh();
    this.timer = window.setInterval(() => this.refresh(), 60000);
  }

  disconnectedCallback() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    const newFields = this._parseFields();
    const fieldsChanged = newFields.join(",") !== this._fields.join(",");
    if (fieldsChanged) {
      this._build();
    } else if (this._titleNode) {
      this._titleNode.textContent = this.getAttribute("label") ?? "Resume";
    }
  }

  _parseFields() {
    const raw = this.getAttribute("fields") ?? "lights,messages,updates";
    return raw.split(",").map((field) => field.trim()).filter(Boolean);
  }

  _itemLabel(field) {
    return { lights: "Lumieres", messages: "Messages", updates: "Updates" }[field] ?? field;
  }

  _itemData(field) {
    const value = this.data?.[field] ?? this.data?.summary?.[field]?.value ?? 0;
    const unit = this.data?.summary?.[field]?.unit ?? "";
    return { value, unit };
  }

  _build() {
    this._fields = this._parseFields();
    this._valueNodes = new Map();

    const card = document.createElement("div");
    card.className = "widget widget-summary";

    const header = document.createElement("div");
    header.className = "summary-header";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = "Home";

    this._titleNode = document.createElement("div");
    this._titleNode.className = "widget-label";
    this._titleNode.textContent = this.getAttribute("label") ?? "Resume";

    header.append(icon, this._titleNode);

    const summaryGrid = document.createElement("div");
    summaryGrid.className = "summary-grid";

    for (const field of this._fields) {
      const node = document.createElement("div");
      node.className = "summary-item";

      const valueNode = document.createElement("div");
      valueNode.className = "summary-value";

      const labelNode = document.createElement("div");
      labelNode.className = "summary-label";
      labelNode.textContent = this._itemLabel(field);

      node.append(valueNode, labelNode);
      summaryGrid.append(node);
      this._valueNodes.set(field, valueNode);
    }

    card.append(header, summaryGrid);
    this.replaceChildren(card);
    this._update();
  }

  _update() {
    for (const field of this._fields) {
      const valueNode = this._valueNodes.get(field);
      if (!valueNode) {
        continue;
      }
      const { value, unit } = this._itemData(field);
      valueNode.textContent = `${value}${unit}`;
    }
  }

  async refresh() {
    if (!window.JeeDashApi?.getSummary) {
      return;
    }
    try {
      this.data = await window.JeeDashApi.getSummary();
      this._update();
    } catch (error) {
      console.error("[JeeDash summary]", error);
    }
  }
}

if (!customElements.get("widget-summary")) {
  customElements.define("widget-summary", WidgetSummary);
}
}());
