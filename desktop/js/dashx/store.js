"use strict";

window.JeeDashStore = (() => {
  const commands = new Map();
  const subscribers = new Map();
  const allSubscribers = [];
  const optimistic = new Map();

  function notify(id, state) {
    const callbacks = subscribers.get(id) ?? [];
    for (const callback of callbacks) {
      try {
        callback({ cmdId: id, ...state });
      } catch (error) {
        console.error("[JeeDash store] subscriber error", error);
      }
    }
  }

  function _emit(id, value, datetime = null, unit = null, meta = {}, force = false) {
    // meta peut être passé explicitement à null (setOptimistic/revert sans état
    // précédent) ; le défaut `= {}` ne couvre que `undefined`, pas `null`.
    meta = meta ?? {};
    const previous = commands.get(id);
    const available = meta.available !== false;
    const reason = meta.reason ?? null;
    if (
      !force &&
      previous &&
      Object.is(previous.value, value) &&
      previous.unit === unit &&
      previous.available === available &&
      previous.reason === reason
    ) {
      return;
    }

    const state = { value, datetime, unit, available, reason, eqLogic: meta.eqLogic ?? null };
    commands.set(id, state);
    notify(id, state);
    notifyAll(id, state);
  }

  function update(cmdId, value, datetime = null, unit = null, meta = {}) {
    const id = String(cmdId);
    const entry = optimistic.get(id);
    if (entry?.timer) {
      clearTimeout(entry.timer);
    }
    if (entry) {
      optimistic.delete(id);
    }
    _emit(id, value, datetime, unit, meta, Boolean(entry));
  }

  function setOptimistic(cmdId, value, { revertMs = 6000 } = {}) {
    const id = String(cmdId);
    const previous = get(id);
    const existing = optimistic.get(id);
    if (existing?.timer) {
      clearTimeout(existing.timer);
    }

    const entry = {
      confirmedValue: existing ? existing.confirmedValue : (previous?.value ?? null),
      confirmedMeta: existing ? existing.confirmedMeta : (previous ?? null),
      timer: null,
    };

    _emit(id, value, previous?.datetime ?? null, previous?.unit ?? null, previous ?? null);
    entry.timer = setTimeout(() => {
      const current = optimistic.get(id);
      if (!current) {
        return;
      }
      optimistic.delete(id);
      _emit(
        id,
        current.confirmedValue,
        current.confirmedMeta?.datetime ?? null,
        current.confirmedMeta?.unit ?? null,
        current.confirmedMeta ?? null,
        true,
      );
    }, revertMs);
    optimistic.set(id, entry);
  }

  function revertOptimistic(cmdId) {
    const id = String(cmdId);
    const entry = optimistic.get(id);
    if (!entry) {
      return;
    }
    if (entry.timer) {
      clearTimeout(entry.timer);
    }
    optimistic.delete(id);
    _emit(
      id,
      entry.confirmedValue,
      entry.confirmedMeta?.datetime ?? null,
      entry.confirmedMeta?.unit ?? null,
      entry.confirmedMeta ?? null,
      true,
    );
  }

  function notifyAll(id, state) {
    for (const callback of allSubscribers) {
      try {
        callback({ cmdId: id, ...state });
      } catch (error) {
        console.error("[JeeDash store] global subscriber error", error);
      }
    }
  }

  function setCommand(command) {
    update(command.id, command.value, command.datetime ?? null, command.unit ?? null, {
      available: command.available !== false,
      reason: command.reason ?? null,
      eqLogic: command.eqLogic ?? null,
    });
  }

  function subscribe(cmdId, callback) {
    const id = String(cmdId);
    if (!subscribers.has(id)) {
      subscribers.set(id, []);
    }
    subscribers.get(id).push(callback);

    if (commands.has(id)) {
      callback({ cmdId: id, ...commands.get(id) });
    }

    return () => {
      const next = (subscribers.get(id) ?? []).filter((item) => item !== callback);
      if (next.length === 0) {
        subscribers.delete(id);
        return;
      }
      subscribers.set(id, next);
    };
  }

  function subscribeAll(callback) {
    allSubscribers.push(callback);
    for (const [id, state] of commands.entries()) {
      callback({ cmdId: id, ...state });
    }
    return () => {
      const index = allSubscribers.indexOf(callback);
      if (index >= 0) {
        allSubscribers.splice(index, 1);
      }
    };
  }

  function get(cmdId) {
    return commands.get(String(cmdId)) ?? null;
  }

  return { get, revertOptimistic, setCommand, setOptimistic, subscribe, subscribeAll, update };
})();
