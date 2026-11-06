"use strict";

(function () {

const store = window.JeeDashStore;

class WidgetCamera extends HTMLElement {
  static get observedAttributes() {
    return ["cmd-url", "label", "refresh"];
  }

  connectedCallback() {
    this.unsubscribe = null;
    this._refreshTimer = null;
    this._hls = null;
    this._build();
    this._subscribe();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this._clearRefresh();
    this._destroyHls();
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.unsubscribe?.();
    this._clearRefresh();
    this._destroyHls();
    this._build();
    this._subscribe();
  }

  _cmdId() {
    return Number.parseInt(this.getAttribute("cmd-url") ?? "", 10) || 0;
  }

  _refresh() {
    return Math.max(5, Math.min(300, Number(this.getAttribute("refresh") ?? "10") || 10));
  }

  _build() {
    const card = document.createElement("div");
    card.className = "widget widget-camera";

    const title = document.createElement("div");
    title.className = "widget-label";
    title.textContent = this.getAttribute("label") ?? "Camera";

    this._media = document.createElement("div");
    this._media.className = "camera-media";
    this._media.setAttribute("aria-live", "polite");
    this._media.setAttribute("aria-atomic", "true");

    card.append(title, this._media);
    this.replaceChildren(card);
    this._update(null);
  }

  _subscribe() {
    const id = this._cmdId();
    if (!id) {
      return;
    }
    this.unsubscribe = store.subscribe(id, (state) => this._update(state.value, state));
  }

  _update(value, state = {}) {
    if (state.available === false) {
      this._showUnavailable(state.reason);
      return;
    }

    const url = String(value ?? "").trim();

    if (!url) {
      this._showUnavailable("cmd_empty");
      return;
    }

    if (url.endsWith(".m3u8") || url.includes(".m3u8?")) {
      this._clearRefresh();
      this._renderHls(url);
      return;
    }

    this._destroyHls();
    this._renderSnapshot(url);
  }

  _showUnavailable(reason = null) {
    this._clearRefresh();
    this._destroyHls();
    this._media.replaceChildren();
    const message = document.createElement("div");
    message.className = "camera-alert";
    message.textContent = reason === "eqLogic_disabled"
      ? "Equipement desactive"
      : reason === "cmd_missing"
        ? "Commande indisponible"
        : "Flux camera indisponible";
    this._media.append(message);
  }

  _renderSnapshot(url) {
    let img = this._media.querySelector("img.camera-img");
    if (!img) {
      this._media.replaceChildren();
      img = document.createElement("img");
      img.className = "camera-img";
      img.alt = this.getAttribute("label") ?? "Camera";
      this._media.append(img);
    }

    const reload = async () => {
      const state = await this._checkCommand();
      if (state?.available === false) {
        this._showUnavailable(state.reason);
        return;
      }
      const nextUrl = String(state?.value ?? url).trim();
      if (!nextUrl) {
        this._showUnavailable("cmd_empty");
        return;
      }
      img.src = `${nextUrl}${nextUrl.includes("?") ? "&" : "?"}_t=${Date.now()}`;
    };
    reload();
    this._clearRefresh();
    this._refreshTimer = window.setInterval(reload, this._refresh() * 1000);
  }

  async _checkCommand() {
    const id = this._cmdId();
    if (!id || !window.JeeDashApi?.getCmd) {
      return null;
    }
    try {
      const command = await window.JeeDashApi.getCmd(id);
      store.setCommand(command);
      return command;
    } catch (error) {
      console.warn("[JeeDash camera] commande indisponible", error);
      return { available: false, reason: "cmd_missing" };
    }
  }

  _renderHls(url) {
    let video = this._media.querySelector("video.camera-video");
    if (!video) {
      this._media.replaceChildren();
      video = document.createElement("video");
      video.className = "camera-video";
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = false;
      this._media.append(video);
    }

    if (video.dataset.hlsSrc === url) {
      return;
    }
    video.dataset.hlsSrc = url;
    this._destroyHls();

    const initHls = () => {
      if (window.Hls?.isSupported()) {
        this._hls = new window.Hls({ autoStartLoad: true });
        this._hls.loadSource(url);
        this._hls.attachMedia(video);
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    };

    if (window.Hls) {
      initHls();
      return;
    }

    const existing = document.querySelector('script[data-jeedash-hls="1"]');
    if (existing) {
      existing.addEventListener("load", initHls, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/data/customTemplates/dashboard/hls.light.min.js";
    script.dataset.jeedashHls = "1";
    script.onload = initHls;
    script.onerror = () => {
      this._media.textContent = "HLS indisponible";
    };
    document.head.append(script);
  }

  _clearRefresh() {
    if (this._refreshTimer) {
      window.clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  _destroyHls() {
    if (this._hls) {
      this._hls.destroy();
      this._hls = null;
    }
  }
}

if (!customElements.get("widget-camera")) {
  customElements.define("widget-camera", WidgetCamera);
}
}());
