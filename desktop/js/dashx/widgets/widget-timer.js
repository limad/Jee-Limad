"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetTimer extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-remaining", "cmd-state", "cmd-set", "cmd-pause", "cmd-resume", "label"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._timer = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    clearTimeout(this._timer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribe?.();
    clearTimeout(this._timer);
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _build() {
    this._card = document.createElement("div");
    this._card.className = "widget widget-timer";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Minuteur";

    this._displayNode = document.createElement("div");
    this._displayNode.className = "timer-display";
    this._displayNode.textContent = "--:--";

    const actions = document.createElement("div");
    actions.className = "timer-actions";

    this._pauseBtn = document.createElement("button");
    this._pauseBtn.className = "btn-timer-pause";
    this._pauseBtn.type = "button";
    this._pauseBtn.textContent = "||";
    this._pauseBtn.disabled = !this._cmdId("cmd-pause");
    this._pauseBtn.addEventListener("click", () => this._exec("cmd-pause"));

    this._resumeBtn = document.createElement("button");
    this._resumeBtn.className = "btn-timer-resume";
    this._resumeBtn.type = "button";
    this._resumeBtn.textContent = ">";
    this._resumeBtn.disabled = !this._cmdId("cmd-resume");
    this._resumeBtn.addEventListener("click", () => this._exec("cmd-resume"));

    actions.append(this._pauseBtn, this._resumeBtn);
    this._card.append(title, this._displayNode, actions);

    if (this._cmdId("cmd-set")) {
      const set = document.createElement("div");
      set.className = "timer-set";

      const label = document.createElement("label");
      label.textContent = "Duree (s)";

      this._setSlider = document.createElement("input");
      this._setSlider.className = "timer-set-slider";
      this._setSlider.type = "range";
      this._setSlider.min = "0";
      this._setSlider.max = "7200";
      this._setSlider.step = "30";
      this._setSlider.value = "300";

      this._setValueNode = document.createElement("span");
      this._setValueNode.className = "timer-set-value";
      this._setValueNode.textContent = this._formatTime(this._setSlider.value);

      this._setSlider.addEventListener("input", () => {
        this._setValueNode.textContent = this._formatTime(this._setSlider.value);
        clearTimeout(this._timer);
        this._timer = setTimeout(() => this._exec("cmd-set", { slider: this._setSlider.value }), 300);
      });

      set.append(label, this._setSlider, this._setValueNode);
      this._card.append(set);
    }

    this.replaceChildren(this._card);
    this._update("state", null);
  }

  _subscribe() {
    const unsubscribers = [];
    const remainingId = this._cmdId("cmd-remaining");
    const stateId = this._cmdId("cmd-state");

    if (remainingId) {
      unsubscribers.push(store.subscribe(remainingId, ({ value }) => this._update("remaining", value)));
    }
    if (stateId) {
      unsubscribers.push(store.subscribe(stateId, ({ value }) => this._update("state", value)));
    }
    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _exec(attr, options = {}) {
    const cmdId = this._cmdId(attr);
    if (cmdId) {
      window.JeeDashApi?.execCmd(cmdId, options).catch((error) => console.error("[JeeDash timer]", error));
    }
  }

  _update(field, value) {
    if (field === "remaining") {
      this._displayNode.textContent = this._formatTime(value);
      return;
    }
    if (field === "state") {
      const hasState = value !== null && value !== undefined && value !== "";
      const paused = hasState && (value === true || value === 1 || value === "1" || value === "pause" || value === "paused");
      this._card.classList.toggle("state-paused", paused);
      this._card.classList.toggle("state-running", hasState && !paused);
      if (hasState) {
        this._pauseBtn.hidden = paused;
        this._resumeBtn.hidden = !paused;
      } else {
        this._pauseBtn.hidden = false;
        this._resumeBtn.hidden = false;
      }
    }
  }

  _formatTime(seconds) {
    if (seconds === null || seconds === undefined || seconds === "") {
      return "--:--";
    }
    const s = Math.max(0, Math.round(Number(seconds) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
}

if (!customElements.get("widget-timer")) {
  customElements.define("widget-timer", WidgetTimer);
}
}());
