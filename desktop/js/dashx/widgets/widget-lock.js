"use strict";

(function () {

const store = window.JeeDashStore;

const t = (key) => window.JeeDashI18n?.t(key) ?? key;

class WidgetLock extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-state", "cmd-open", "cmd-close", "label"];
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
    const stateId = this._cmdId("cmd-state");
    if (!stateId) {
      return;
    }
    this.unsubscribe = store.subscribe(stateId, ({ value }) => this._update(value));
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
    if (!window.confirm("Confirmer l action sur la serrure ?")) {
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
      console.error("[JeeDash lock]", error);
    });
  }

  _build() {
    const label = this.getAttribute("label") ?? "Serrure";

    this._card = document.createElement("div");
    this._card.className = "widget widget-lock";

    const icon = document.createElement("div");
    icon.className = "widget-icon";
    icon.textContent = "Lock";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = label;

    this._statusNode = document.createElement("div");
    this._statusNode.className = "widget-state";
    this._statusNode.setAttribute("aria-live", "polite");
    this._statusNode.setAttribute("aria-atomic", "true");

    const actions = document.createElement("div");
    actions.className = "widget-actions";

    this._openBtn = document.createElement("button");
    this._openBtn.className = "btn-lock-open";
    this._openBtn.type = "button";
    this._openBtn.textContent = t("open");
    this._openBtn.disabled = !this._cmdId("cmd-open");
    this._openBtn.setAttribute("aria-label", t("lock_open_aria"));
    this._openBtn.addEventListener("click", () => this._exec("cmd-open", 0));

    this._closeBtn = document.createElement("button");
    this._closeBtn.className = "btn-lock-close";
    this._closeBtn.type = "button";
    this._closeBtn.textContent = t("close");
    this._closeBtn.disabled = !this._cmdId("cmd-close");
    this._closeBtn.setAttribute("aria-label", t("lock_close_aria"));
    this._closeBtn.addEventListener("click", () => this._exec("cmd-close", 1));

    actions.append(this._openBtn, this._closeBtn);
    this._card.append(icon, title, this._statusNode, actions);
    this.replaceChildren(this._card);
    this._update(null);
  }

  _update(value) {
    const isUnknown = value === null || value === undefined || value === "";
    const isLocked = !isUnknown && (value === 1 || value === true || value === "1" || value === "on");

    this._card.className = `widget widget-lock${isLocked ? " state-locked" : (isUnknown ? "" : " state-open")}`;
    this._statusNode.textContent = isUnknown ? t("unknown") : (isLocked ? t("locked") : t("unlocked"));
    this._openBtn.disabled = isUnknown || !this._cmdId("cmd-open");
    this._closeBtn.disabled = isUnknown || !this._cmdId("cmd-close");
  }
}

if (!customElements.get("widget-lock")) {
  customElements.define("widget-lock", WidgetLock);
}
}());
