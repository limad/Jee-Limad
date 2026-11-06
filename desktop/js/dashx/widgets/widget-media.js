"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetMedia extends HTMLElement {
  static get observedAttributes() {
    return [
      "cmd-state", "cmd-status", "cmd-title", "cmd-artist", "cmd-album",
      "cmd-play", "cmd-pause", "cmd-stop", "cmd-next", "cmd-prev",
      "cmd-volume", "label",
    ];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._volTimer = null;
    this._status = "";
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    clearTimeout(this._volTimer);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribe?.();
    clearTimeout(this._volTimer);
    this._build();
    this._subscribe();
  }

  _cmdId(attr) {
    return Number.parseInt(this.getAttribute(attr) ?? "", 10) || 0;
  }

  _exec(attr, options = {}) {
    const cmdId = this._cmdId(attr);
    if (!cmdId) {
      return;
    }
    window.JeeDashApi?.execCmd(cmdId, options).catch((error) => console.error("[JeeDash media]", error));
  }

  _build() {
    const card = document.createElement("div");
    card.className = "widget widget-media";

    const header = document.createElement("div");
    header.className = "media-header";

    this._dotNode = document.createElement("div");
    this._dotNode.className = "media-state-dot stopped";

    const label = document.createElement("div");
    label.className = "widget-label";
    label.textContent = this.getAttribute("label") ?? "Media";

    header.append(this._dotNode, label);

    const meta = document.createElement("div");
    meta.className = "media-meta";

    this._titleNode = document.createElement("div");
    this._titleNode.className = "media-title";
    this._titleNode.textContent = "-";

    this._artistNode = document.createElement("div");
    this._artistNode.className = "media-artist";

    meta.append(this._titleNode, this._artistNode);

    const controls = document.createElement("div");
    controls.className = "media-controls";

    this._prevBtn = this._button("btn-prev", "<<", "cmd-prev", () => this._exec("cmd-prev"));
    this._playBtn = this._button("btn-play", ">", null, () => {
      this._exec(this._isPlaying() ? "cmd-pause" : "cmd-play");
    });
    this._stopBtn = this._button("btn-stop", "[]", "cmd-stop", () => this._exec("cmd-stop"));
    this._nextBtn = this._button("btn-next", ">>", "cmd-next", () => this._exec("cmd-next"));

    controls.append(this._prevBtn, this._playBtn, this._stopBtn, this._nextBtn);

    card.append(header, meta, controls);

    if (this._cmdId("cmd-volume")) {
      const volume = document.createElement("div");
      volume.className = "media-volume";

      this._volumeSlider = document.createElement("input");
      this._volumeSlider.className = "volume-slider";
      this._volumeSlider.type = "range";
      this._volumeSlider.min = "0";
      this._volumeSlider.max = "100";
      this._volumeSlider.step = "1";
      this._volumeSlider.setAttribute("aria-label", "Volume");
      this._volumeSlider.addEventListener("input", () => {
        clearTimeout(this._volTimer);
        this._volTimer = setTimeout(() => {
          this._exec("cmd-volume", { slider: this._volumeSlider.value });
        }, 300);
      });

      volume.append(this._volumeSlider);
      card.append(volume);
    } else {
      this._volumeSlider = null;
    }

    this.replaceChildren(card);
    this._update("status", null);
  }

  _button(className, text, actionAttr, onClick) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = text;
    button.disabled = actionAttr ? !this._cmdId(actionAttr) : (!this._cmdId("cmd-play") && !this._cmdId("cmd-pause"));
    button.addEventListener("click", onClick);
    return button;
  }

  _subscribe() {
    const fields = [
      ["state", "cmd-state"],
      ["status", "cmd-status"],
      ["title", "cmd-title"],
      ["artist", "cmd-artist"],
      ["album", "cmd-album"],
      ["volume", "cmd-volume"],
    ];
    const unsubscribers = [];

    for (const [field, attr] of fields) {
      const cmdId = this._cmdId(attr);
      if (cmdId) {
        unsubscribers.push(store.subscribe(cmdId, ({ value }) => this._update(field, value)));
      }
    }

    this.unsubscribe = () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  _update(field, value) {
    if (field === "state" && !this._cmdId("cmd-status")) {
      this._setStatus(value);
      return;
    }
    if (field === "status") {
      this._setStatus(value);
      return;
    }
    if (field === "title") {
      this._titleNode.textContent = value ? String(value) : "-";
      return;
    }
    if (field === "artist" || field === "album") {
      const artist = field === "artist" ? value : store.get(this._cmdId("cmd-artist"))?.value;
      const album = field === "album" ? value : store.get(this._cmdId("cmd-album"))?.value;
      this._artistNode.textContent = [artist, album].filter(Boolean).join(" - ");
      return;
    }
    if (field === "volume" && this._volumeSlider && value !== null && value !== undefined && value !== "") {
      const volume = Math.max(0, Math.min(100, Number(value)));
      if (Number.isFinite(volume)) {
        this._volumeSlider.value = String(volume);
      }
    }
  }

  _setStatus(value) {
    const status = String(value ?? "").toLowerCase();
    this._status = status;
    const playing = this._isPlaying();
    const paused = status === "pause" || status === "paused";
    const state = playing ? "playing" : (paused ? "paused" : "stopped");

    this._dotNode.className = `media-state-dot ${state}`;
    this._playBtn.textContent = playing ? "||" : ">";
    this._playBtn.disabled = playing ? !this._cmdId("cmd-pause") : !this._cmdId("cmd-play");
  }

  _isPlaying() {
    return this._status === "1" || this._status === "play" || this._status === "playing";
  }
}

if (!customElements.get("widget-media")) {
  customElements.define("widget-media", WidgetMedia);
}
}());
