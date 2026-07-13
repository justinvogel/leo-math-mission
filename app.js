/**
 * Leo's Math Mission — app shell, Skill Scan, mission flow
 */
(function () {
  "use strict";

  const C = window.MathMissionCurriculum;
  const Sync = window.MathMissionSync;
  const Puzzles = window.MathMissionPuzzles;
  const Lessons = window.MathMissionLessons;
  const MatchGame = window.MathMissionMatchGame;
  const STORAGE_KEY = "leo-math-mission-v1";

  const defaultState = () => ({
    version: 2,
    xp: 0,
    level: 1,
    streak: 0,
    lastMissionDate: null,
    missionsCompleted: 0,
    skillStats: {}, // id -> { seen, correct }
    sessions: [],
    unlockedModules: ["pad"],
    avatar: "🚀",
    placement: null, // analyzeScan result
    hasCompletedScan: false,
  });

  /** Keep cloud/local state safe so a bad field can't blank the dashboard */
  function normalizeState(raw) {
    const base = defaultState();
    const s = raw && typeof raw === "object" ? raw : {};
    const skillStats =
      s.skillStats && typeof s.skillStats === "object" && !Array.isArray(s.skillStats)
        ? s.skillStats
        : {};
    const sessions = Array.isArray(s.sessions) ? s.sessions : [];
    const unlockedModules = Array.isArray(s.unlockedModules)
      ? s.unlockedModules.filter(Boolean)
      : ["pad"];
    if (!unlockedModules.includes("pad")) unlockedModules.unshift("pad");

    return {
      ...base,
      ...s,
      version: Number(s.version) || base.version,
      xp: Math.max(0, Number(s.xp) || 0),
      level: Math.max(1, Number(s.level) || 1),
      streak: Math.max(0, Number(s.streak) || 0),
      missionsCompleted: Math.max(0, Number(s.missionsCompleted) || 0),
      lastMissionDate: s.lastMissionDate || null,
      skillStats,
      sessions,
      unlockedModules,
      avatar: s.avatar || base.avatar,
      placement: s.placement && typeof s.placement === "object" ? s.placement : null,
      hasCompletedScan: !!s.hasCompletedScan,
    };
  }

  let state = loadState();
  let session = null;
  let lessonSkillId = null;
  let lessonReturn = "home";
  let matchState = null;
  let syncTimer = null;
  let syncInFlight = false;

  const $ = (id) => document.getElementById(id);
  const screens = {
    home: $("screen-home"),
    play: $("screen-play"),
    complete: $("screen-complete"),
    parent: $("screen-parent"),
    lesson: $("screen-lesson"),
    match: $("screen-match"),
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return normalizeState(JSON.parse(raw));
    } catch {
      return defaultState();
    }
  }

  function saveState(opts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!opts || opts.sync !== false) queueSync();
  }

  function queueSync() {
    if (!Sync) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      syncNow({ quiet: true }).catch(() => {});
    }, 1200);
  }

  function setSyncStatus(msg, show) {
    const el = $("sync-status");
    if (!el) return;
    if (!show && !msg) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.textContent = msg || "";
  }

  async function syncNow(opts) {
    const quiet = opts && opts.quiet;
    if (!Sync) return;
    if (syncInFlight) return;
    syncInFlight = true;
    if (!quiet) setSyncStatus("Saving…", true);
    try {
      const result = await Sync.syncNow(state);
      state = normalizeState(result.state);
      saveState({ sync: false });
      if (screens.home.classList.contains("active")) renderHome();
      if (screens.parent.classList.contains("active")) renderParent();
      const when = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      setSyncStatus(`Saved · ${when}`, true);
      const statusEl = $("sync-setup-status");
      if (statusEl) {
        statusEl.textContent = `Cloud progress up to date · ${when}`;
      }
    } catch (e) {
      setSyncStatus("Offline — will save when connected", true);
      console.warn("sync", e);
    } finally {
      syncInFlight = false;
    }
  }

  function todayKey() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function dayIndex() {
    const t = todayKey().split("-").map(Number);
    return Math.floor(Date.UTC(t[0], t[1] - 1, t[2]) / 86400000);
  }

  function showScreen(name) {
    Object.values(screens).forEach((el) => {
      el.classList.remove("active");
      el.classList.remove("screen-enter");
    });
    const next = screens[name];
    next.classList.add("active");
    // Force reflow so enter animation + iOS compositing pick up full content
    void next.offsetHeight;
    next.classList.add("screen-enter");
    window.scrollTo(0, 0);
  }

  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, 2200);
  }

  function skillMastery(skillId) {
    const stats = state.skillStats && typeof state.skillStats === "object" ? state.skillStats : {};
    const s = stats[skillId] || { seen: 0, correct: 0 };
    if (!s.seen) return 0;
    return Math.round((s.correct / s.seen) * 100);
  }

  function placementStatus(skillId) {
    if (!state.placement || !state.placement.map) return null;
    return state.placement.map[skillId] || null;
  }

  function masteryBars(pct) {
    const filled = Math.round((pct / 100) * 5);
    return Array.from(
      { length: 5 },
      (_, i) => `<i class="${i < filled ? "on" : ""}"></i>`
    ).join("");
  }

  function weakSkills() {
    // Prefer placement growth edges, then live low mastery
    if (state.placement && state.placement.growth && state.placement.growth.length) {
      return state.placement.growth.slice();
    }
    return C.SKILLS.filter((sk) => {
      const st = state.skillStats[sk.id];
      if (!st || st.seen < 3) return false;
      return st.correct / st.seen < 0.7;
    }).map((sk) => sk.id);
  }

  function focusSkills() {
    if (state.placement && state.placement.focusSkills && state.placement.focusSkills.length) {
      return state.placement.focusSkills.slice();
    }
    return weakSkills().slice(0, 4);
  }

  function effectiveLevel() {
    return Math.min(6, Math.max(1, state.level));
  }

  function avatarsForLevel(level) {
    const list = ["🚀", "🛸", "🦊", "🐉", "⚡", "🦸", "🏆"];
    return list[Math.min(list.length - 1, level - 1)];
  }

  function recordSkillResult(skillId, correct) {
    if (!state.skillStats[skillId]) state.skillStats[skillId] = { seen: 0, correct: 0 };
    state.skillStats[skillId].seen += 1;
    if (correct) state.skillStats[skillId].correct += 1;
  }

  // --- Home ---
  function renderHome() {
    try {
      state = normalizeState(state);
      state.avatar = avatarsForLevel(state.level);
      $("home-avatar").textContent = state.avatar;
      $("stat-level").textContent = String(state.level);
      $("stat-xp").textContent = String(state.xp);
      $("stat-streak").textContent = `${state.streak}🔥`;

      const need = C.xpForLevel(state.level);
      const pct = Math.min(100, Math.round((state.xp / need) * 100));
      $("xp-fill").style.width = pct + "%";
      $("xp-caption").textContent = `${Math.max(0, need - state.xp)} XP to Level ${
        state.level + 1
      }`;

      // Scan card if not done (removeAttribute so iOS reliably shows it)
      const scanCard = $("scan-card");
      if (state.hasCompletedScan) {
        scanCard.setAttribute("hidden", "");
      } else {
        scanCard.removeAttribute("hidden");
      }

      const focus = focusSkills();
      const mission = C.missionForDay(dayIndex(), state.hasCompletedScan ? focus : null);
      $("mission-title").textContent = mission.title;
      $("mission-desc").textContent = mission.desc;
      $("mission-focus").textContent = `Focus: ${mission.focus}`;
      $("mission-time").textContent =
        state.lastMissionDate === todayKey() ? "Done today · replay ok" : "~15–20 min";

      // Path from scan
      const pathSection = $("path-section");
      if (state.hasCompletedScan && state.placement) {
        pathSection.removeAttribute("hidden");
        $("path-headline").textContent =
          state.placement.kidHeadline || "From your Skill Scan";
        $("path-chips").innerHTML = (state.placement.focusSkills || [])
          .map((id) => {
            const sk = C.SKILL_BY_ID[id];
            if (!sk) return "";
            const st = placementStatus(id);
            const badge = st ? st.label : "Train";
            return `<button type="button" class="path-chip" data-skill="${id}">
            <span class="emoji">${sk.emoji}</span>
            <span class="name">${sk.name}</span>
            <span class="meta">${badge}</span>
          </button>`;
          })
          .join("");
        $("path-chips").querySelectorAll("[data-skill]").forEach((btn) => {
          btn.addEventListener("click", () => startPractice(btn.getAttribute("data-skill")));
        });
      } else {
        pathSection.setAttribute("hidden", "");
      }

      // Skills grid
      const grid = $("skill-grid");
      grid.innerHTML = C.SKILLS.map((sk) => {
        const locked = state.level < sk.unlockLevel && !state.hasCompletedScan;
        const pctM = skillMastery(sk.id);
        const place = placementStatus(sk.id);
        let meta = locked ? `Unlocks at Level ${sk.unlockLevel}` : sk.blurb;
        if (place && place.status !== "not-scanned") {
          meta = place.label;
        }
        const statusClass = place ? `status-${place.status}` : "";
        return `
        <button type="button" class="skill-chip ${statusClass}" data-skill="${sk.id}" ${
          locked ? "disabled" : ""
        } style="${locked ? "opacity:0.45" : ""}">
          <span class="emoji">${sk.emoji}</span>
          <span class="name">${sk.name}</span>
          <span class="meta">${meta}</span>
          ${locked ? "" : `<div class="bars">${masteryBars(pctM)}</div>`}
        </button>
      `;
      }).join("");

      grid.querySelectorAll(".skill-chip[data-skill]:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-skill");
          const place = placementStatus(id);
          if (place && place.status === "growth" && Lessons && Lessons.getLesson(id)) {
            openLesson(id, "home");
          } else {
            startPractice(id);
          }
        });
      });

      // Base modules
      const base = $("base-grid");
      if (!Array.isArray(state.unlockedModules)) state.unlockedModules = ["pad"];
      base.innerHTML = C.BASE_MODULES.map((m) => {
        const unlocked =
          state.unlockedModules.includes(m.id) || state.missionsCompleted >= m.needMissions;
        if (unlocked && !state.unlockedModules.includes(m.id)) {
          state.unlockedModules.push(m.id);
        }
        return `
        <div class="base-tile ${unlocked ? "unlocked" : "locked"}">
          <span class="emoji">${unlocked ? m.emoji : "🔒"}</span>
          <span class="name">${m.name}</span>
          <span class="meta">${unlocked ? "Online" : `${m.needMissions} missions to unlock`}</span>
        </div>
      `;
      }).join("");

      // Persist unlocks only — don't kick off sync mid-render
      saveState({ sync: false });

      // Learn-first chips for growth edges / weak skills
      renderLearnSection();

      // Nudge iOS to paint full dashboard height after dynamic content
      requestAnimationFrame(() => {
        const home = screens.home;
        if (home && home.classList.contains("active")) {
          home.style.minHeight = "auto";
          void home.offsetHeight;
        }
      });
    } catch (err) {
      console.error("renderHome failed", err);
    }
  }

  function renderLearnSection() {
    const section = $("learn-section");
    const grid = $("learn-grid");
    if (!section || !grid || !Lessons) return;

    let ids = [];
    if (state.placement && state.placement.focusSkills && state.placement.focusSkills.length) {
      ids = state.placement.focusSkills.slice(0, 4);
    } else {
      ids = weakSkills().slice(0, 4);
    }
    // Always offer core fraction/decimal if nothing flagged yet
    if (!ids.length) {
      ids = ["frac-parts", "frac-equiv", "dec-place", "frac-dec"];
    }
    ids = ids.filter((id) => Lessons.getLesson(id));

    if (!ids.length) {
      section.setAttribute("hidden", "");
      return;
    }
    section.removeAttribute("hidden");
    grid.innerHTML = ids
      .map((id) => {
        const sk = C.SKILL_BY_ID[id] || { emoji: "📘", name: id };
        const lesson = Lessons.getLesson(id);
        return `<button type="button" class="learn-chip" data-learn="${id}">
          <span class="emoji">${sk.emoji || "📘"}</span>
          <span class="name">${lesson.title}</span>
          <span class="meta">Tap to learn</span>
        </button>`;
      })
      .join("");
    grid.querySelectorAll("[data-learn]").forEach((btn) => {
      btn.addEventListener("click", () => openLesson(btn.getAttribute("data-learn"), "home"));
    });
  }

  function openLesson(skillId, returnTo) {
    const lesson = Lessons && Lessons.getLesson(skillId);
    if (!lesson) {
      toast("No lesson for that skill yet");
      return;
    }
    lessonSkillId = skillId;
    lessonReturn = returnTo || "home";
    $("lesson-title").textContent = lesson.emoji + " " + lesson.title;

    $("lesson-body").innerHTML = `
      <div class="lesson-card">
        <p class="lesson-hook">${lesson.hook}</p>
        <ol class="lesson-steps">
          ${lesson.steps.map((s) => `<li>${s}</li>`).join("")}
        </ol>
        <div class="lesson-example">
          <div class="lesson-example-label">Example</div>
          <p><strong>${lesson.example.prompt}</strong></p>
          <p>${lesson.example.show}</p>
        </div>
        <p class="lesson-try"><strong>Try this:</strong> ${lesson.tryIt}</p>
      </div>
    `;

    const resBox = $("lesson-resources");
    const resources = Array.isArray(lesson.resources)
      ? lesson.resources
      : lesson.khan
        ? [{ label: lesson.khanLabel || "Khan Academy", url: lesson.khan, kind: "khan" }]
        : [];
    if (resources.length) {
      resBox.innerHTML = resources
        .map((r) => {
          const badge =
            r.kind === "khan" ? "🎓 Khan" : r.kind === "video" ? "▶️ Watch" : "📖 Read";
          return `<a class="resource-btn kind-${r.kind || "link"}" href="${r.url}" target="_blank" rel="noopener">
            <span class="resource-badge">${badge}</span>
            <span class="resource-label">${r.label} ↗</span>
          </a>`;
        })
        .join("");
    } else {
      resBox.innerHTML = `<p class="soft">No external links for this one — use the steps above, then try a few.</p>`;
    }

    showScreen("lesson");
  }

  // --- Adaptive scan list (trim based on early misses) ---
  function buildAdaptiveScanQuestions() {
    // Core: 2 each for anchors (~18), then optional stretch 1 each if doing well
    const core = [
      "mult-facts",
      "div-facts",
      "place-whole",
      "frac-parts",
      "frac-equiv",
      "frac-add-sub",
      "frac-compare",
      "dec-place",
      "dec-compare",
      "frac-dec",
      "dec-ops",
    ];
    const stretch = ["frac-mixed-ops", "frac-mult", "dec-mult", "word-mixed", "percent-intro"];

    const list = [];
    core.forEach((id) => {
      list.push({ ...C.generateQuestion(id, 2), phase: "scan", skillId: id });
      list.push({ ...C.generateQuestion(id, 2), phase: "scan", skillId: id });
    });
    stretch.forEach((id) => {
      list.push({ ...C.generateQuestion(id, 3), phase: "scan", skillId: id, stretch: true });
    });
    return list;
  }

  function startSkillScan() {
    session = {
      mode: "scan",
      title: "Skill Scan",
      questions: buildAdaptiveScanQuestions(),
      index: 0,
      correct: 0,
      results: [], // per question: correct | miss
      scanLog: [], // { skillId, correct }
      startedAt: Date.now(),
      // live tallies for adaptive skip
      skillLive: {},
    };
    showScreen("play");
    renderQuestion();
  }

  function startMission() {
    if (!state.hasCompletedScan) {
      // Soft nudge — still allow skip for flexibility
      const goScan = confirm(
        "Skill Scan first? It maps what to train (~15 min). OK = scan, Cancel = regular mission."
      );
      if (goScan) {
        startSkillScan();
        return;
      }
    }

    const mission = C.missionForDay(dayIndex(), state.hasCompletedScan ? focusSkills() : null);
    const skillIds = mission.skills.slice();
    const unlocked = skillIds.filter((id) => {
      const sk = C.SKILL_BY_ID[id];
      return sk && (state.hasCompletedScan || state.level >= sk.unlockLevel);
    });
    const use = unlocked.length ? unlocked : ["frac-parts", "dec-place"];

    let questions = C.buildMission({
      skillIds: use,
      level: effectiveLevel(),
      weakSkills: weakSkills(),
      placementFocus: focusSkills(),
    });
    // Leo loves puzzles — fold a couple into every mission
    if (Puzzles && Puzzles.injectPuzzles) {
      questions = Puzzles.injectPuzzles(questions, 2);
    }

    session = {
      mode: "mission",
      title: mission.title,
      questions,
      index: 0,
      correct: 0,
      results: [],
      scanLog: [],
      startedAt: Date.now(),
    };
    showScreen("play");
    renderQuestion();
  }

  function startPractice(skillId) {
    if (skillId === "puzzle-lab") {
      startMatchGame();
      return;
    }
    const questions = C.buildPractice(skillId, effectiveLevel(), 6);
    session = {
      mode: "practice",
      title: C.SKILL_BY_ID[skillId]?.name || "Practice",
      questions,
      index: 0,
      correct: 0,
      results: [],
      scanLog: [],
      startedAt: Date.now(),
      practiceSkillId: skillId,
    };
    showScreen("play");
    renderQuestion();
  }

  function startMatchGame() {
    if (!MatchGame) {
      toast("Match game still loading");
      return;
    }
    const board = MatchGame.createBoard(6);
    matchState = {
      cards: board.cards.map((c) => ({
        ...c,
        faceUp: false,
        matched: false,
      })),
      flipped: [],
      pairsFound: 0,
      totalPairs: board.pairs,
      moves: 0,
      skills: board.skills,
      lock: false,
      startedAt: Date.now(),
    };
    $("match-complete").hidden = true;
    $("match-board").hidden = false;
    showScreen("match");
    renderMatchBoard();
  }

  function renderMatchBoard() {
    if (!matchState) return;
    $("match-hud").textContent = `${matchState.pairsFound} / ${matchState.totalPairs} pairs · ${matchState.moves} moves`;
    $("match-score").textContent = `⭐ ${matchState.pairsFound}`;
    const board = $("match-board");
    const n = matchState.cards.length;
    board.style.gridTemplateColumns = n <= 8 ? "repeat(4, 1fr)" : "repeat(4, 1fr)";
    board.innerHTML = matchState.cards
      .map((c, i) => {
        const cls = [
          "match-card",
          c.faceUp || c.matched ? "face-up" : "",
          c.matched ? "matched" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<button type="button" class="${cls}" data-idx="${i}" ${
          c.matched ? "disabled" : ""
        }>
          <span class="match-card-inner">
            <span class="match-back">?</span>
            <span class="match-front">${c.label}</span>
          </span>
        </button>`;
      })
      .join("");

    board.querySelectorAll(".match-card:not(.matched)").forEach((btn) => {
      btn.addEventListener("click", () => onMatchFlip(Number(btn.getAttribute("data-idx"))));
    });
  }

  function onMatchFlip(idx) {
    if (!matchState || matchState.lock) return;
    const card = matchState.cards[idx];
    if (!card || card.matched || card.faceUp) return;
    if (matchState.flipped.length >= 2) return;

    card.faceUp = true;
    matchState.flipped.push(idx);
    renderMatchBoard();

    if (matchState.flipped.length < 2) return;

    matchState.moves += 1;
    matchState.lock = true;
    const [i, j] = matchState.flipped;
    const a = matchState.cards[i];
    const b = matchState.cards[j];
    const isMatch = a.pairId === b.pairId;

    setTimeout(() => {
      if (isMatch) {
        a.matched = true;
        b.matched = true;
        a.faceUp = true;
        b.faceUp = true;
        matchState.pairsFound += 1;
        recordSkillResult(a.skill, true);
        recordSkillResult("puzzle-lab", true);
        saveState();
      } else {
        a.faceUp = false;
        b.faceUp = false;
        recordSkillResult(a.skill, false);
        recordSkillResult(b.skill, false);
        saveState();
      }
      matchState.flipped = [];
      matchState.lock = false;
      renderMatchBoard();

      if (matchState.pairsFound >= matchState.totalPairs) {
        finishMatchGame();
      }
    }, isMatch ? 350 : 750);
  }

  function finishMatchGame() {
    const xpGain = 25 + Math.max(0, 20 - matchState.moves);
    state.xp += xpGain;
    while (state.xp >= C.xpForLevel(state.level)) {
      state.xp -= C.xpForLevel(state.level);
      state.level += 1;
    }
    state.sessions.unshift({
      date: todayKey(),
      title: "Match Up",
      mode: "match",
      correct: matchState.pairsFound,
      total: matchState.totalPairs,
      xp: xpGain,
      ms: Date.now() - matchState.startedAt,
    });
    state.sessions = state.sessions.slice(0, 20);
    saveState();

    $("match-board").hidden = true;
    $("match-complete").hidden = false;
    $("match-complete-msg").textContent = `Cleared in ${matchState.moves} moves · +${xpGain} XP`;
  }

  function phaseLabel(phase, mode) {
    if (mode === "scan") return "Skill Scan";
    if (mode === "puzzle" || phase === "puzzle") return "Puzzle Lab";
    if (phase === "warm-up") return "Warm-up";
    if (phase === "quest") return "Quest";
    if (phase === "boss") return "Boss Challenge";
    return "Practice";
  }

  function renderDots() {
    const el = $("progress-dots");
    // For long scans, show condensed progress
    const total = session.questions.length;
    if (total > 16) {
      el.innerHTML = `<span class="progress-text">${session.index + 1} / ${total}</span>`;
      return;
    }
    el.innerHTML = session.questions
      .map((_, i) => {
        let cls = "";
        if (i < session.index) cls = session.results[i] === "correct" ? "done" : "miss";
        else if (i === session.index) cls = "current";
        return `<span class="${cls}"></span>`;
      })
      .join("");
  }

  function renderVisual(visual) {
    const box = $("q-visual");
    if (!visual) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    if (visual.type === "bar") {
      const cells = Array.from({ length: visual.total }, (_, i) => {
        return `<div class="cell ${i < visual.filled ? "filled" : ""}"></div>`;
      }).join("");
      box.innerHTML = `<div class="frac-bar">${cells}</div><div class="frac-label">${visual.label}</div>`;
      return;
    }
    if (visual.type === "pie") {
      box.innerHTML = `<div class="pie" style="--pct:${visual.pct}%" data-label="${visual.label}"></div>`;
      return;
    }
    if (visual.type === "decimal") {
      box.innerHTML = `
        <div class="decimal-places">
          <div class="box"><strong>${visual.whole}</strong><span>ones</span></div>
          <div class="box"><strong>.</strong><span>point</span></div>
          <div class="box"><strong>${visual.tenths}</strong><span>tenths</span></div>
          <div class="box"><strong>${visual.hundredths}</strong><span>hundredths</span></div>
          <div class="box"><strong>${visual.thousandths}</strong><span>thousandths</span></div>
        </div>`;
      return;
    }
    if (visual.type === "chips") {
      box.innerHTML = `<div class="chip-row">${visual.items
        .map((it) => `<span class="chip ${it === "?" ? "mystery" : ""}">${it}</span>`)
        .join("")}</div>`;
      return;
    }
    if (visual.type === "target") {
      box.innerHTML = `<div class="target-banner">${visual.label}</div>`;
      return;
    }
    if (visual.type === "grid-row") {
      box.innerHTML = `<div class="grid-row-visual">${visual.cells
        .map((c) => `<div class="gcell ${c === "?" ? "blank" : ""}">${c}</div>`)
        .join("")}</div><div class="grid-row-label">${visual.label || ""}</div>`;
      return;
    }
    if (visual.type === "match") {
      box.innerHTML = `<div class="match-visual"><span>${visual.left}</span><span class="arrow">↔</span><span>${visual.right}</span></div>`;
    }
  }

  function renderQuestion() {
    // Adaptive: skip remaining stretch items if many growth edges already
    pruneScanIfNeeded();

    const q = session.questions[session.index];
    if (!q) {
      finishSession();
      return;
    }

    $("play-phase").textContent = phaseLabel(q.phase, session.mode);
    $("play-score").textContent =
      session.mode === "scan" ? `🔍 ${session.index + 1}` : `⭐ ${session.correct}`;
    renderDots();

    $("q-prompt").textContent = q.prompt;
    renderVisual(q.visual);

    const feedback = $("q-feedback");
    feedback.hidden = true;
    feedback.textContent = "";
    feedback.className = "q-feedback";
    $("btn-next").hidden = true;

    // Skip: especially important on Skill Scan — don't guess
    const skipBtn = $("btn-skip");
    const learnBtn = $("btn-learn-now");
    skipBtn.hidden = false;
    skipBtn.disabled = false;
    // Learn available when we have a lesson for this skill
    const canLearn = Lessons && Lessons.getLesson(q.skillId);
    learnBtn.hidden = !canLearn;
    learnBtn.disabled = false;

    const choices = $("q-choices");
    choices.innerHTML = "";
    q.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice;
      btn.addEventListener("click", () => onAnswer(choice, btn));
      choices.appendChild(btn);
    });
  }

  function pruneScanIfNeeded() {
    if (!session || session.mode !== "scan") return;
    // After core (first 22 Q), if growth edges >= 4, drop stretch
    if (session.index < 20) return;
    const growthSoFar = new Set();
    const by = {};
    session.scanLog.forEach((r) => {
      if (!by[r.skillId]) by[r.skillId] = { s: 0, c: 0 };
      by[r.skillId].s++;
      if (r.correct) by[r.skillId].c++;
    });
    Object.keys(by).forEach((id) => {
      if (by[id].s >= 2 && by[id].c / by[id].s < 0.5) growthSoFar.add(id);
    });
    if (growthSoFar.size >= 4) {
      // remove remaining stretch questions
      session.questions = session.questions.filter((q, i) => {
        if (i <= session.index) return true;
        return !q.stretch;
      });
    }
  }

  function lockQuestionUi() {
    const buttons = [...$("q-choices").querySelectorAll(".choice-btn")];
    buttons.forEach((b) => {
      b.disabled = true;
    });
    $("btn-skip").hidden = true;
    $("btn-learn-now").hidden = true;
    return buttons;
  }

  function showContinue() {
    const nextBtn = $("btn-next");
    nextBtn.hidden = false;
    nextBtn.textContent =
      session.index >= session.questions.length - 1
        ? session.mode === "scan"
          ? "See my path"
          : "See results"
        : "Continue";
    nextBtn.focus();
  }

  function onAnswer(choice, btn) {
    const q = session.questions[session.index];
    const buttons = lockQuestionUi();

    const ok = choice === q.answer;
    session.results[session.index] = ok ? "correct" : "miss";
    if (ok) session.correct += 1;

    recordSkillResult(q.skillId, ok);
    if (q.trackSkills && Array.isArray(q.trackSkills)) {
      q.trackSkills.forEach((sid) => {
        if (sid !== q.skillId) recordSkillResult(sid, ok);
      });
    }
    if (session.mode === "scan") {
      session.scanLog.push({ skillId: q.skillId, correct: ok, skipped: false });
    }
    saveState();

    buttons.forEach((b) => {
      if (b.textContent === q.answer) b.classList.add("correct");
      else if (b === btn && !ok) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    const feedback = $("q-feedback");
    feedback.hidden = false;
    if (session.mode === "scan") {
      feedback.className = "q-feedback " + (ok ? "good" : "bad");
      feedback.textContent = ok
        ? "Locked in."
        : `Answer: ${q.answer}. ${q.explain || ""}`.trim();
    } else {
      feedback.className = "q-feedback " + (ok ? "good" : "bad");
      feedback.textContent =
        (ok ? "Nice! " : "Not quite. ") + (q.explain || `Answer: ${q.answer}`);
      // After a miss, offer explain
      if (!ok && Lessons && Lessons.getLesson(q.skillId)) {
        $("btn-learn-now").hidden = false;
        $("btn-learn-now").disabled = false;
      }
    }

    $("play-score").textContent =
      session.mode === "scan" ? `🔍 ${session.index + 1}` : `⭐ ${session.correct}`;
    renderDots();
    showContinue();
  }

  function onSkip() {
    if (!session) return;
    const q = session.questions[session.index];
    if (!q) return;

    lockQuestionUi();
    session.results[session.index] = "skip";
    // Count as "doesn't know" — seen up, correct NOT up
    recordSkillResult(q.skillId, false);
    if (q.trackSkills && Array.isArray(q.trackSkills)) {
      q.trackSkills.forEach((sid) => {
        if (sid !== q.skillId) recordSkillResult(sid, false);
      });
    }
    if (session.mode === "scan") {
      session.scanLog.push({ skillId: q.skillId, correct: false, skipped: true });
    }
    saveState();

    const buttons = [...$("q-choices").querySelectorAll(".choice-btn")];
    buttons.forEach((b) => {
      if (b.textContent === q.answer) b.classList.add("correct");
      else b.classList.add("dim");
    });

    const feedback = $("q-feedback");
    feedback.hidden = false;
    feedback.className = "q-feedback bad";
    feedback.textContent =
      session.mode === "scan"
        ? `Skipped — marked as needs practice. (Answer was ${q.answer}.)`
        : `Skipped. Answer: ${q.answer}. ${q.explain || ""}`.trim();

    // Offer lesson when they skip
    if (Lessons && Lessons.getLesson(q.skillId)) {
      $("btn-learn-now").hidden = false;
      $("btn-learn-now").disabled = false;
    }

    renderDots();
    showContinue();
  }

  function advance() {
    if (session.index >= session.questions.length - 1) {
      finishSession();
      return;
    }
    session.index += 1;
    renderQuestion();
  }

  function finishSession() {
    const total = session.questions.length;
    const correct = session.correct;
    const accuracy = total ? correct / total : 0;

    let xpGain = 0;
    let placement = null;

    if (session.mode === "scan") {
      placement = C.analyzeScan(session.scanLog);
      state.placement = placement;
      state.hasCompletedScan = true;
      // Seed a sensible starting level without shaming
      const solidN = placement.solid.length;
      const growthN = placement.growth.length;
      if (solidN >= 10 && growthN <= 1) state.level = Math.max(state.level, 4);
      else if (solidN >= 6) state.level = Math.max(state.level, 3);
      else if (solidN >= 3) state.level = Math.max(state.level, 2);
      xpGain = 40 + Math.round(accuracy * 20);
    } else if (session.mode === "mission") {
      xpGain = 25 + Math.round(accuracy * 35);
      session.questions.forEach((q, i) => {
        if (q.phase === "boss" && session.results[i] === "correct") xpGain += 5;
      });
      if (accuracy >= 0.9) xpGain += 10;

      const today = todayKey();
      if (state.lastMissionDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = [
          yesterday.getFullYear(),
          String(yesterday.getMonth() + 1).padStart(2, "0"),
          String(yesterday.getDate()).padStart(2, "0"),
        ].join("-");
        if (state.lastMissionDate === yKey) state.streak += 1;
        else state.streak = 1;
        state.lastMissionDate = today;
        state.missionsCompleted += 1;
        if (state.streak >= 3) xpGain += 5;
        if (state.streak >= 7) xpGain += 10;
      }
    } else if (session.mode === "puzzle") {
      xpGain = 20 + Math.round(accuracy * 30);
      if (accuracy >= 0.9) xpGain += 10;
    } else {
      xpGain = 10 + Math.round(accuracy * 15);
    }

    state.xp += xpGain;
    let leveled = false;
    while (state.xp >= C.xpForLevel(state.level)) {
      state.xp -= C.xpForLevel(state.level);
      state.level += 1;
      leveled = true;
    }
    state.avatar = avatarsForLevel(state.level);

    let unlockText = "";
    C.BASE_MODULES.forEach((m) => {
      if (
        state.missionsCompleted >= m.needMissions &&
        !state.unlockedModules.includes(m.id)
      ) {
        state.unlockedModules.push(m.id);
        unlockText = `${m.emoji} ${m.name} unlocked!`;
      }
    });

    state.sessions.unshift({
      date: todayKey(),
      title: session.title,
      mode: session.mode,
      correct,
      total,
      xp: xpGain,
      ms: Date.now() - session.startedAt,
    });
    state.sessions = state.sessions.slice(0, 20);
    saveState();

    // Complete UI
    $("complete-emoji").textContent =
      session.mode === "scan"
        ? "🗺️"
        : accuracy >= 0.85
          ? "🏆"
          : accuracy >= 0.6
            ? "🎉"
            : "💪";
    $("complete-title").textContent =
      session.mode === "scan"
        ? "Skill Scan Complete!"
        : session.mode === "mission"
          ? "Mission Complete!"
          : session.mode === "puzzle"
            ? "Puzzle Lab Clear!"
            : "Practice Complete!";
    $("complete-summary").textContent =
      session.mode === "scan"
        ? placement.kidHeadline
        : session.mode === "puzzle"
          ? leveled
            ? `Level up! You're now Level ${state.level}. Sharp puzzle brain.`
            : accuracy >= 0.75
              ? "Those patterns didn’t stand a chance."
              : "Good solving. Try another round when you want."
          : leveled
            ? `Level up! You're now Level ${state.level}. ${encouragement(accuracy)}`
            : encouragement(accuracy);
    $("c-correct").textContent = `${correct}/${total}`;
    $("c-xp").textContent = `+${xpGain}`;
    $("c-streak").textContent = String(state.streak);

    const banner = $("unlock-banner");
    if (session.mode === "scan") {
      banner.hidden = false;
      $("unlock-text").textContent = "Training path unlocked on your home base";
    } else if (unlockText) {
      banner.hidden = false;
      $("unlock-text").textContent = unlockText;
    } else if (leveled) {
      banner.hidden = false;
      $("unlock-text").textContent = `Level ${state.level} — ${state.avatar}`;
    } else {
      banner.hidden = true;
    }

    const scanBox = $("scan-results-box");
    if (session.mode === "scan" && placement) {
      scanBox.hidden = false;
      const focus = placement.focusSkills || [];
      const chips = focus
        .map((id) => {
          const sk = C.SKILL_BY_ID[id];
          return sk
            ? `<button type="button" class="mini-chip mini-chip-btn" data-learn="${id}">${sk.emoji} Learn ${sk.name}</button>`
            : "";
        })
        .join("");
      const skips = (session.scanLog || []).filter((r) => r.skipped).length;
      scanBox.innerHTML = `
        <h3>Learn these next</h3>
        <div class="mini-chip-row">${chips || "<span class='mini-chip'>You’re in good shape — try Match Up or a mission</span>"}</div>
        <p class="soft">Solid: ${placement.solid.length} · Building: ${placement.building.length} · Growth: ${placement.growth.length}${
          skips ? ` · Skipped: ${skips}` : ""
        }</p>
      `;
      scanBox.querySelectorAll("[data-learn]").forEach((btn) => {
        btn.addEventListener("click", () => openLesson(btn.getAttribute("data-learn"), "home"));
      });
      $("btn-another").textContent = focus.length ? "Learn first skill" : "Start training mission";
    } else {
      scanBox.hidden = true;
      $("btn-another").textContent = "One more quick round";
    }

    showScreen("complete");
  }

  function encouragement(accuracy) {
    if (accuracy >= 0.9) return "Sharp work. That was elite.";
    if (accuracy >= 0.75) return "Solid mission. You're building real muscle.";
    if (accuracy >= 0.5) return "Good reps. Mistakes are data — you'll crush these next time.";
    return "Tough set, and you finished. That's how catch-up works.";
  }

  // --- Parent ---
  function renderParent() {
    const totalSeen = Object.values(state.skillStats).reduce((a, s) => a + s.seen, 0);
    const totalCorrect = Object.values(state.skillStats).reduce((a, s) => a + s.correct, 0);
    const overall = totalSeen ? Math.round((totalCorrect / totalSeen) * 100) : 0;
    const meta = Sync && Sync.loadMeta ? Sync.loadMeta() : {};
    const last = meta.lastSyncAt
      ? new Date(meta.lastSyncAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

    $("parent-summary").innerHTML = totalSeen
      ? `Leo is <strong>Level ${state.level}</strong> with a <strong>${state.streak}-day</strong> streak.
         Overall accuracy: <strong>${overall}%</strong> across <strong>${totalSeen}</strong> problems.
         Full missions: <strong>${state.missionsCompleted}</strong>.
         Skill Scan: <strong>${state.hasCompletedScan ? "done" : "not yet"}</strong>.`
      : `No data yet. Start with the <strong>Skill Scan</strong> (~15 min) to map solid vs growth edges — without a grade label.`;

    const statusEl = $("sync-setup-status");
    if (statusEl) {
      statusEl.textContent = last
        ? `Cloud progress auto-saves on both iPads · last save ${last}`
        : "Cloud progress auto-saves on both iPads — no codes needed.";
    }

    const placeEl = $("parent-placement");
    const mapEl = $("parent-skill-map");
    if (state.placement) {
      placeEl.textContent = state.placement.parentHeadline;
      const domains = ["foundations", "fractions", "decimals", "mixed", "ratio"];
      mapEl.innerHTML = domains
        .map((dom) => {
          const skills = C.SKILLS.filter((s) => s.domain === dom);
          if (!skills.length) return "";
          const rows = skills
            .map((sk) => {
              const m = state.placement.map[sk.id] || {
                status: "not-scanned",
                label: "Not scanned",
              };
              // Parent-only band as small soft text
              return `<div class="map-row status-${m.status}">
                <span>${sk.emoji} ${sk.name}</span>
                <span>${m.label}<small class="band"> · often intro ~gr ${sk.typicalBand}</small></span>
              </div>`;
            })
            .join("");
          return `<div class="map-domain"><h4>${C.domainLabel(dom)}</h4>${rows}</div>`;
        })
        .join("");
    } else {
      placeEl.textContent =
        "No Skill Scan yet. Have Leo run it once — maps skills as Solid / Building / Growth edge. Parent view can show typical intro bands; Leo never sees “grade 3.”";
      mapEl.innerHTML = "";
    }

    $("parent-skills").innerHTML = C.SKILLS.map((sk) => {
      const st = state.skillStats[sk.id] || { seen: 0, correct: 0 };
      const pct = st.seen ? Math.round((st.correct / st.seen) * 100) : 0;
      return `
        <div class="mastery-row">
          <span>${sk.emoji} ${sk.name}</span>
          <span>${st.seen ? pct + "% · " + st.seen + " tries" : "—"}</span>
          <div class="mastery-bar"><i style="width:${pct}%"></i></div>
        </div>
      `;
    }).join("");

    const sessions = state.sessions;
    $("parent-sessions").innerHTML = sessions.length
      ? sessions
          .map((s) => {
            const mins = Math.max(1, Math.round(s.ms / 60000));
            return `<div class="session-row">
              <span><strong>${s.title}</strong><br><span style="color:var(--muted);font-size:0.82rem">${s.date} · ${s.mode}</span></span>
              <span>${s.correct}/${s.total} · +${s.xp} XP · ~${mins}m</span>
            </div>`;
          })
          .join("")
      : `<p class="empty-note">Sessions will show up here after Leo plays.</p>`;
  }

  // --- Events ---
  $("btn-start-mission").addEventListener("click", () => startMission());
  $("btn-start-scan").addEventListener("click", () => startSkillScan());
  $("btn-start-match").addEventListener("click", () => startMatchGame());
  $("btn-next").addEventListener("click", advance);
  $("btn-skip").addEventListener("click", () => onSkip());
  $("btn-learn-now").addEventListener("click", () => {
    if (!session) return;
    const q = session.questions[session.index];
    if (q && q.skillId) openLesson(q.skillId, "play");
  });
  $("btn-quit").addEventListener("click", () => {
    if (session && session.index > 0) {
      const ok = confirm("Exit? Unfinished scan/mission won't fully count.");
      if (!ok) return;
    }
    session = null;
    showScreen("home");
    renderHome();
  });
  $("btn-home").addEventListener("click", () => {
    session = null;
    showScreen("home");
    renderHome();
    syncNow({ quiet: true }).catch(() => {});
  });
  $("btn-another").addEventListener("click", () => {
    if (session && session.mode === "scan") {
      const focus = (state.placement && state.placement.focusSkills) || focusSkills();
      session = null;
      if (focus.length && Lessons && Lessons.getLesson(focus[0])) {
        openLesson(focus[0], "home");
        return;
      }
      startMission();
      return;
    }
    const weak = weakSkills();
    if (weak.length) startPractice(weak[0]);
    else startMission();
  });
  $("btn-parent").addEventListener("click", () => {
    renderParent();
    showScreen("parent");
  });
  $("btn-parent-back").addEventListener("click", () => {
    showScreen("home");
    renderHome();
  });
  $("btn-rescan").addEventListener("click", () => {
    showScreen("home");
    startSkillScan();
  });
  $("btn-reset").addEventListener("click", () => {
    if (!confirm("Reset all of Leo's progress on this device?")) return;
    state = defaultState();
    saveState();
    renderParent();
    toast("Progress reset");
  });

  $("btn-lesson-back").addEventListener("click", () => {
    if (lessonReturn === "play" && session) {
      showScreen("play");
    } else {
      showScreen("home");
      renderHome();
    }
  });
  $("btn-lesson-done").addEventListener("click", () => {
    if (lessonReturn === "play" && session) {
      showScreen("play");
    } else {
      showScreen("home");
      renderHome();
    }
  });
  $("btn-lesson-practice").addEventListener("click", () => {
    const id = lessonSkillId;
    if (id) startPractice(id);
  });

  $("btn-match-quit").addEventListener("click", () => {
    matchState = null;
    showScreen("home");
    renderHome();
  });
  $("btn-match-again").addEventListener("click", () => startMatchGame());
  $("btn-match-home").addEventListener("click", () => {
    matchState = null;
    showScreen("home");
    renderHome();
    syncNow({ quiet: true }).catch(() => {});
  });

  document.addEventListener("keydown", (e) => {
    if (!screens.play.classList.contains("active")) return;
    if (e.key === "Enter" && !$("btn-next").hidden) {
      e.preventDefault();
      advance();
    }
  });

  // When app returns to foreground, pull latest from cloud
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Sync) {
      syncNow({ quiet: true }).catch(() => {});
    }
  });

  // Paint dashboard first, then cloud sync (avoids racing empty/broken state)
  showScreen("home");
  renderHome();
  requestAnimationFrame(() => {
    renderHome();
    if (Sync) {
      setSyncStatus("Saving…", true);
      // Slight delay so first paint of skill tiles isn't interrupted on iOS
      setTimeout(() => {
        syncNow({ quiet: true }).catch(() => {});
      }, 300);
    }
  });
})();
