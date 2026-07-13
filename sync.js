/**
 * Automatic cloud progress for Leo's Math Mission
 * One fixed cloud save — both iPads use it with zero setup.
 */
(function (global) {
  "use strict";

  const SYNC_API =
    (global.MATH_MISSION_SYNC_URL ||
      "https://leo-math-sync.dent-credit.workers.dev").replace(/\/$/, "");

  // Leo is the only player — one permanent cloud slot (no codes to enter)
  const PLAYER_SLOT = "LEOMM2026";
  const META_KEY = "leo-math-mission-sync-meta";

  function loadMeta() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveMeta(meta) {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function deviceId() {
    const meta = loadMeta();
    if (meta.deviceId) return meta.deviceId;
    const id =
      "ipad-" +
      Math.random().toString(36).slice(2, 8) +
      Date.now().toString(36).slice(-4);
    meta.deviceId = id;
    saveMeta(meta);
    return id;
  }

  function getCode() {
    return PLAYER_SLOT;
  }

  /** Merge two progress states without losing work from either iPad */
  function mergeStates(a, b) {
    if (!a) return clone(b);
    if (!b) return clone(a);
    const out = clone(a);

    if ((b.level || 1) > (out.level || 1)) {
      out.level = b.level;
      out.xp = b.xp || 0;
    } else if ((b.level || 1) === (out.level || 1)) {
      out.xp = Math.max(out.xp || 0, b.xp || 0);
    }

    out.missionsCompleted = Math.max(out.missionsCompleted || 0, b.missionsCompleted || 0);
    out.streak = Math.max(out.streak || 0, b.streak || 0);

    if ((b.lastMissionDate || "") > (out.lastMissionDate || "")) {
      out.lastMissionDate = b.lastMissionDate;
    }

    out.skillStats = out.skillStats || {};
    const bStats = b.skillStats || {};
    const ids = new Set([...Object.keys(out.skillStats), ...Object.keys(bStats)]);
    ids.forEach((id) => {
      const x = out.skillStats[id] || { seen: 0, correct: 0 };
      const y = bStats[id] || { seen: 0, correct: 0 };
      const seen = Math.max(x.seen || 0, y.seen || 0);
      let correct = Math.max(x.correct || 0, y.correct || 0);
      if (correct > seen) correct = seen;
      out.skillStats[id] = { seen, correct };
    });

    out.unlockedModules = [
      ...new Set([...(out.unlockedModules || []), ...(b.unlockedModules || [])]),
    ];

    const aScan = out.placement && out.placement.scannedAt;
    const bScan = b.placement && b.placement.scannedAt;
    if (bScan && (!aScan || bScan > aScan)) {
      out.placement = b.placement;
      out.hasCompletedScan = !!(b.hasCompletedScan || out.hasCompletedScan);
    } else {
      out.hasCompletedScan = !!(out.hasCompletedScan || b.hasCompletedScan);
    }

    const sessions = [...(out.sessions || []), ...(b.sessions || [])];
    const seen = new Set();
    const merged = [];
    sessions
      .sort((x, y) => String(y.date).localeCompare(String(x.date)) || (y.ms || 0) - (x.ms || 0))
      .forEach((s) => {
        const key = [s.date, s.title, s.mode, s.correct, s.total, s.xp].join("|");
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(s);
      });
    out.sessions = merged.slice(0, 20);

    out.avatar = out.avatar || b.avatar;
    out.version = Math.max(out.version || 1, b.version || 1);
    return out;
  }

  function clone(o) {
    return o ? JSON.parse(JSON.stringify(o)) : o;
  }

  async function pull() {
    const res = await fetch(`${SYNC_API}?code=${encodeURIComponent(PLAYER_SLOT)}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "Sync pull failed");
    }
    return res.json();
  }

  async function push(state) {
    const envelope = {
      state,
      updatedAt: Date.now(),
      device: deviceId(),
    };
    const res = await fetch(`${SYNC_API}?code=${encodeURIComponent(PLAYER_SLOT)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "Sync push failed");
    }
    const meta = loadMeta();
    meta.lastSyncAt = envelope.updatedAt;
    saveMeta(meta);
    return res.json();
  }

  /**
   * Pull cloud, merge with local, push result.
   * Always uses Leo's fixed slot — no codes.
   */
  async function syncNow(localState) {
    let cloud = null;
    try {
      const remote = await pull();
      if (remote && remote.exists && remote.state) cloud = remote.state;
    } catch (e) {
      await push(localState);
      throw e;
    }

    const merged = cloud ? mergeStates(localState, cloud) : clone(localState);
    await push(merged);
    return { state: merged, pulled: !!cloud, pushed: true };
  }

  global.MathMissionSync = {
    SYNC_API,
    PLAYER_SLOT,
    getCode,
    deviceId,
    mergeStates,
    pull,
    push,
    syncNow,
    loadMeta,
  };
})(window);
