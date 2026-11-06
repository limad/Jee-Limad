"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetEquipment extends HTMLElement {
  static get observedAttributes() {
    return ["eqlogic-id", "label", "show-actions", "columns"];
  }

  connectedCallback() {
    this._unsubs = [];
    this._loadSeq = 0;
    this._load();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._load();
    }
  }

  _eqLogicId() {
    return Number.parseInt(this.getAttribute("eqlogic-id") ?? "", 10) || 0;
  }

  _showActions() {
    return this.getAttribute("show-actions") !== "0";
  }

  _columns() {
    const value = Number.parseInt(this.getAttribute("columns") ?? "", 10);
    return Number.isInteger(value) ? Math.max(1, Math.min(6, value)) : null;
  }

  _cleanup() {
    for (const unsub of this._unsubs ?? []) {
      unsub();
    }
    this._unsubs = [];
  }

  async _load() {
    const eqLogicId = this._eqLogicId();
    const seq = ++this._loadSeq;
    this._cleanup();
    this._renderLoading();
    if (!eqLogicId || !window.JeeDashApi?.getEqLogic) {
      this._renderError("Equipement manquant");
      return;
    }

    try {
      const eqLogic = await window.JeeDashApi.getEqLogic(eqLogicId);
      if (seq !== this._loadSeq) {
        return;
      }
      for (const cmd of eqLogic.cmds ?? []) {
        if (cmd.type === "info") {
          store?.setCommand(cmd);
        }
      }
      this._render(eqLogic);
    } catch (error) {
      if (seq === this._loadSeq) {
        console.warn("[JeeDash equipment]", error);
        this._renderError("Equipement indisponible");
      }
    }
  }

  _renderLoading() {
    const card = document.createElement("div");
    card.className = "widget widget-equipment";
    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Equipement";
    const loading = document.createElement("p");
    loading.className = "equipment-empty";
    loading.textContent = "Chargement...";
    card.append(title, loading);
    this.replaceChildren(card);
  }

  _renderError(message) {
    const card = document.createElement("div");
    card.className = "widget widget-equipment";
    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Equipement";
    const error = document.createElement("p");
    error.className = "equipment-empty";
    error.textContent = message;
    card.append(title, error);
    this.replaceChildren(card);
  }

  _render(eqLogic) {
    const label = this.getAttribute("label") || eqLogic.name || "Equipement";
    const commands = (eqLogic.cmds ?? []).filter((cmd) => cmd.isVisible !== 0 && (this._showActions() || cmd.type !== "action"));

    const card = document.createElement("div");
    card.className = "widget widget-equipment";
    const columns = this._columns();
    if (columns !== null) {
      card.style.setProperty("--equipment-columns", String(columns));
    }

    const header = document.createElement("header");
    header.className = "equipment-header";
    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;
    const type = document.createElement("div");
    type.className = "equipment-type";
    type.textContent = eqLogic.type ?? "";
    header.append(title, type);

    const list = document.createElement("div");
    list.className = "equipment-cmds";
    if (commands.length === 0) {
      const empty = document.createElement("p");
      empty.className = "equipment-empty";
      empty.textContent = "Aucune commande visible.";
      list.append(empty);
    } else {
      for (const cmd of commands) {
        list.append(cmd.type === "action" ? this._renderActionRow(cmd, commands) : this._renderInfoRow(cmd));
      }
    }

    card.append(header, list);
    this.replaceChildren(card);
  }

  _renderInfoRow(cmd) {
    const row = document.createElement("div");
    row.className = "equipment-cmd-row";

    const name = document.createElement("span");
    name.className = "equipment-cmd-name";
    name.textContent = cmd.name;

    const value = document.createElement("span");
    value.className = "equipment-cmd-value";
    value.textContent = this._formatValue(cmd.value, cmd.unit);
    this._unsubs.push(store.subscribe(cmd.id, (state) => {
      value.textContent = this._formatValue(state.value, state.unit ?? cmd.unit);
    }));

    row.append(name, value);
    return row;
  }

  _renderActionRow(cmd, commands) {
    const row = document.createElement("div");
    row.className = "equipment-cmd-row equipment-action-row";

    const name = document.createElement("span");
    name.className = "equipment-cmd-name";
    name.textContent = cmd.name;

    row.append(name, this._renderActionControl(cmd, commands));
    return row;
  }

  _renderActionControl(cmd, commands) {
    const valueCmdId = this._valueCommandId(cmd);

    if (cmd.subType === "slider") {
      const input = document.createElement("input");
      input.className = "equipment-action-range";
      input.type = "range";
      input.min = this._numberConfig(cmd, "minValue", 0);
      input.max = this._numberConfig(cmd, "maxValue", 100);
      const linked = this._linkedCommandValue(valueCmdId, commands, cmd);
      this._setRangeValue(input, linked?.value);
      if (valueCmdId) {
        this._unsubs.push(store.subscribe(valueCmdId, (state) => {
          if (document.activeElement !== input) {
            this._setRangeValue(input, state.value);
          }
        }));
      }
      input.addEventListener("input", () => this._updateRangeFill(input));
      input.addEventListener("change", () => {
        const value = Number(input.value);
        if (valueCmdId) {
          store.setOptimistic(valueCmdId, value);
        }
        this._exec(cmd, { slider: value });
      });
      return input;
    }

    if (cmd.subType === "select") {
      return this._renderSelectAction(cmd, commands, valueCmdId);
    }

    if (cmd.subType === "color") {
      const input = document.createElement("input");
      input.className = "equipment-action-color";
      input.type = "color";
      input.value = "#ffffff";
      const linked = this._linkedCommandValue(valueCmdId, commands, cmd);
      this._setColorValue(input, linked?.value);
      if (valueCmdId) {
        this._unsubs.push(store.subscribe(valueCmdId, (state) => this._setColorValue(input, state.value)));
      }
      input.addEventListener("change", () => {
        if (valueCmdId) {
          store.setOptimistic(valueCmdId, input.value);
        }
        this._exec(cmd, { color: input.value });
      });
      return input;
    }

    const button = document.createElement("button");
    button.className = "equipment-action-btn";
    button.type = "button";
    button.textContent = "Executer";
    button.addEventListener("click", () => {
      if (cmd.subType === "message") {
        this._execMessage(cmd);
      } else {
        this._exec(cmd);
      }
    });
    return button;
  }

  _updateRangeFill(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || min);
    const span = max - min || 1;
    const percent = Math.max(0, Math.min(100, ((value - min) / span) * 100));
    input.style.setProperty("--equipment-range-fill", `${percent}%`);
  }

  _setRangeValue(input, value) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      input.value = String(Math.max(min, Math.min(max, numeric)));
    } else {
      input.value = input.min;
    }
    this._updateRangeFill(input);
  }

  _renderSelectAction(cmd, commands, valueCmdId) {
    const select = document.createElement("select");
    select.className = "equipment-action-select";
    select.append(this._option("", "Choisir"));
    const linked = this._linkedCommandValue(valueCmdId, commands, cmd);
    this._setSelectValue(select, linked?.value);
    if (valueCmdId) {
      this._unsubs.push(store.subscribe(valueCmdId, (state) => this._setSelectValue(select, state.value)));
    }

    let populated = false;
    const populate = () => {
      if (populated) {
        return;
      }
      populated = true;
      select.dataset.populated = "1";
      const options = this._parseOptions(cmd.configuration?.listValue ?? "");
      select.replaceChildren(this._option("", "Choisir"));
      for (const option of options) {
        select.append(this._option(option.value, option.label));
      }
      this._applySelectPendingValue(select);
    };

    select.addEventListener("pointerdown", populate);
    select.addEventListener("focus", populate);
    select.addEventListener("change", () => {
      if (select.value !== "") {
        if (valueCmdId) {
          store.setOptimistic(valueCmdId, select.value);
        }
        this._exec(cmd, { select: select.value });
      }
    });
    return select;
  }

  _setSelectValue(select, value) {
    const selected = String(value ?? "").trim();
    if (!selected) {
      return;
    }
    select.dataset.pendingValue = selected;
    this._applySelectPendingValue(select);
  }

  _applySelectPendingValue(select) {
    const selected = select.dataset.pendingValue;
    if (!selected) {
      return;
    }
    const options = Array.from(select.options);
    const match = options.find((option) => option.value === selected);
    if (match) {
      select.value = selected;
      if (select.dataset.populated === "1") {
        delete select.dataset.pendingValue;
      }
      return;
    }
    if (options.length === 1 && options[0].value === "") {
      options[0].value = selected;
      options[0].textContent = selected;
      select.value = selected;
    }
  }

  _setColorValue(input, value) {
    const raw = String(value ?? "").trim();
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      input.value = normalized;
    }
  }

  _option(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  async _execMessage(cmd) {
    if (!window.JeeDashDialog?.askFields) {
      this._exec(cmd);
      return;
    }
    const values = await window.JeeDashDialog?.askFields?.({
      title: cmd.name,
      fields: [
        { name: "title", label: "Titre", maxLength: 80 },
        { name: "message", label: "Message", required: true, maxLength: 240 },
      ],
    });
    if (!values) {
      return;
    }
    this._exec(cmd, { title: values.title ?? "", message: values.message ?? "" });
  }

  _exec(cmd, options = {}) {
    window.JeeDashApi?.execCmd(cmd.id, options)
      .catch((error) => console.error("[JeeDash equipment]", error));
  }

  _formatValue(value, unit = "") {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return `${value}${unit ? ` ${unit}` : ""}`;
  }

  _numberConfig(cmd, key, fallback) {
    const value = Number(cmd.configuration?.[key]);
    return Number.isFinite(value) ? String(value) : String(fallback);
  }

  _valueCommandId(cmd) {
    const id = Number.parseInt(cmd.valueCmdId ?? "", 10);
    return Number.isInteger(id) && id > 0 ? String(id) : null;
  }

  _linkedCommandValue(valueCmdId, commands, sourceCmd = null) {
    if (!valueCmdId) {
      return null;
    }
    const linked = commands.find((cmd) => String(cmd.id) === valueCmdId) ?? store.get(valueCmdId);
    if (linked) {
      return linked;
    }
    if (sourceCmd && Object.prototype.hasOwnProperty.call(sourceCmd, "valueCmdValue")) {
      return { value: sourceCmd.valueCmdValue };
    }
    return null;
  }

  _parseOptions(raw) {
    const value = String(raw ?? "").trim();
    const separatorPattern = value.includes(";") || value.includes("|") ? /;/ : /,/;
    return value
      .split(separatorPattern)
      .map((entry) => {
        const clean = entry.trim();
        if (!clean) {
          return null;
        }
        const separator = clean.includes("|") ? "|" : ":";
        const [value, ...labelParts] = clean.split(separator);
        const trimmedValue = value.trim();
        return trimmedValue ? { value: trimmedValue, label: (labelParts.join(separator).trim() || trimmedValue) } : null;
      })
      .filter(Boolean);
  }
}

if (!customElements.get("widget-equipment")) {
  customElements.define("widget-equipment", WidgetEquipment);
}
}());
