/**
 * Puzzle Lab — math that feels like Sudoku / Pips / pattern puzzles
 * Same number skills, different brain mode (Leo's strength).
 */
(function (global) {
  "use strict";

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }
  function simplify(n, d) {
    const g = gcd(n, d);
    return [n / g, d / g];
  }
  function fmt(n, d) {
    if (d === 1) return String(n);
    return `${n}/${d}`;
  }
  function uniqueChoices(correct, distractors) {
    const set = new Set();
    const out = [];
    const push = (v) => {
      const s = String(v);
      if (!set.has(s)) {
        set.add(s);
        out.push(s);
      }
    };
    push(correct);
    distractors.forEach(push);
    while (out.length < 4) push(String(randInt(1, 9)) + "/" + String(randInt(2, 10)));
    return shuffle(out.slice(0, 4));
  }

  // --- Puzzle types ---

  /** Odd one out — pattern / set logic (word-puzzle energy) */
  function puzzleOddOneOut() {
    const packs = [
      {
        items: ["1/2", "2/4", "3/6", "1/3"],
        answer: "1/3",
        explain: "1/2, 2/4, and 3/6 are all equal to one half. 1/3 is the odd one out.",
        skillId: "frac-equiv",
      },
      {
        items: ["0.5", "1/2", "50%", "0.05"],
        answer: "0.05",
        explain: "0.5, 1/2, and 50% are the same amount. 0.05 is only five hundredths.",
        skillId: "frac-dec",
      },
      {
        items: ["1/4", "0.25", "2/8", "0.4"],
        answer: "0.4",
        explain: "1/4, 0.25, and 2/8 all equal one quarter. 0.4 is two fifths.",
        skillId: "frac-dec",
      },
      {
        items: ["3/4", "6/8", "0.75", "2/3"],
        answer: "2/3",
        explain: "3/4, 6/8, and 0.75 are three quarters. 2/3 is different.",
        skillId: "frac-equiv",
      },
      {
        items: ["0.2", "1/5", "2/10", "0.02"],
        answer: "0.02",
        explain: "0.2, 1/5, and 2/10 are two tenths. 0.02 is two hundredths.",
        skillId: "dec-place",
      },
      {
        items: ["1/3", "2/6", "3/9", "1/2"],
        answer: "1/2",
        explain: "1/3, 2/6, and 3/9 are equivalent. 1/2 is the odd one out.",
        skillId: "frac-equiv",
      },
    ];
    const p = pick(packs);
    return {
      skillId: p.skillId,
      phase: "puzzle",
      puzzleType: "odd-one-out",
      prompt: `🧩 Odd one out — which does NOT belong with the others?\n${p.items.join("   ·   ")}`,
      visual: { type: "chips", items: p.items },
      choices: shuffle(p.items.slice()),
      answer: p.answer,
      explain: p.explain,
    };
  }

  /** Sequence / next term — pattern completion */
  function puzzleSequence() {
    const kinds = pick(["halves", "tenths", "add-same", "equiv-grow"]);
    if (kinds === "halves") {
      // 1/8, 2/8, 3/8, ?
      const d = pick([6, 8, 10]);
      const start = 1;
      const seq = [start, start + 1, start + 2].map((n) => fmt(n, d));
      const ans = fmt(start + 3, d);
      return {
        skillId: "frac-parts",
        phase: "puzzle",
        puzzleType: "sequence",
        prompt: `🧩 Pattern puzzle — what comes next?\n${seq.join("  →  ")}  →  ?`,
        visual: { type: "chips", items: [...seq, "?"] },
        choices: uniqueChoices(ans, [
          fmt(start + 4, d),
          fmt(start + 3, d + 1),
          fmt(start + 2, d),
          fmt(start, d),
        ]),
        answer: ans,
        explain: `Each step adds one more ${fmt(1, d)}. After ${seq[2]} comes ${ans}.`,
      };
    }
    if (kinds === "tenths") {
      const start = Number((randInt(1, 5) / 10).toFixed(1));
      const seq = [start, Number((start + 0.1).toFixed(1)), Number((start + 0.2).toFixed(1))];
      const ans = String(Number((start + 0.3).toFixed(1)));
      return {
        skillId: "dec-place",
        phase: "puzzle",
        puzzleType: "sequence",
        prompt: `🧩 Pattern puzzle — what comes next?\n${seq.join("  →  ")}  →  ?`,
        visual: { type: "chips", items: seq.map(String).concat(["?"]) },
        choices: uniqueChoices(ans, [
          String(Number((start + 0.4).toFixed(1))),
          String(Number((start + 0.3 + 0.1).toFixed(1))),
          String(start),
          String(Number((start * 10 + 3).toFixed(0))),
        ]),
        answer: ans,
        explain: `Each step adds 0.1 (one tenth). Next is ${ans}.`,
      };
    }
    if (kinds === "equiv-grow") {
      // 1/2, 2/4, 3/6, ?
      const n = 1;
      const mults = [1, 2, 3];
      const seq = mults.map((m) => fmt(n * m, 2 * m));
      const ans = fmt(4, 8);
      return {
        skillId: "frac-equiv",
        phase: "puzzle",
        puzzleType: "sequence",
        prompt: `🧩 Pattern puzzle — all equal one half. What continues the pattern?\n${seq.join("  →  ")}  →  ?`,
        visual: { type: "chips", items: [...seq, "?"] },
        choices: uniqueChoices(ans, ["4/6", "5/10", "3/8", "2/3"]),
        answer: ans,
        explain: `Multiply top and bottom by 1, 2, 3, 4… so next is 4/8.`,
      };
    }
    // add-same denominator
    const d = pick([5, 6, 8]);
    const a = randInt(1, 2);
    const seq = [a, a + a, a + a + a].map((n) => fmt(n, d));
    const ansN = a * 4;
    const [sn, sd] = simplify(ansN, d);
    const ans = fmt(sn, sd);
    return {
      skillId: "frac-add-sub",
      phase: "puzzle",
      puzzleType: "sequence",
      prompt: `🧩 Pattern puzzle — each step adds ${fmt(a, d)}.\n${seq.join("  →  ")}  →  ?`,
      visual: { type: "chips", items: [...seq, "?"] },
      choices: uniqueChoices(ans, [
        fmt(ansN, d),
        fmt(ansN + a, d),
        fmt(a, d),
        fmt(ansN, d + 1),
      ]),
      answer: ans,
      explain: `Four groups of ${fmt(a, d)} → ${fmt(ansN, d)}${ans !== fmt(ansN, d) ? ` = ${ans}` : ""}.`,
    };
  }

  /** Target sum — Pips-like: pick the set that hits the total */
  function puzzleTargetSum() {
    const mode = pick(["frac", "dec"]);
    if (mode === "frac") {
      const d = pick([4, 5, 6, 8, 10]);
      const a = randInt(1, Math.floor(d / 2) - 1 || 1);
      const b = randInt(1, d - a - 1);
      const target = fmt(...simplify(a + b, d));
      const correctPair = `${fmt(a, d)} + ${fmt(b, d)}`;
      const wrongs = [
        `${fmt(a, d)} + ${fmt(b + 1, d)}`,
        `${fmt(a + 1, d)} + ${fmt(b, d)}`,
        `${fmt(a, d)} + ${fmt(a, d)}`,
        `${fmt(b, d)} + ${fmt(b, d)}`,
      ];
      return {
        skillId: "frac-add-sub",
        phase: "puzzle",
        puzzleType: "target-sum",
        prompt: `🧩 Pip puzzle — which pair adds up to exactly ${target}?`,
        visual: { type: "target", label: `Target: ${target}` },
        choices: uniqueChoices(correctPair, wrongs),
        answer: correctPair,
        explain: `${fmt(a, d)} + ${fmt(b, d)} = ${fmt(a + b, d)}${
          fmt(a + b, d) !== target ? ` = ${target}` : ""
        }.`,
      };
    }
    const t = Number((randInt(10, 20) / 10).toFixed(1));
    const a = Number((randInt(3, Math.floor(t * 10) - 2) / 10).toFixed(1));
    const b = Number((t - a).toFixed(1));
    const correctPair = `${a} + ${b}`;
    return {
      skillId: "dec-ops",
      phase: "puzzle",
      puzzleType: "target-sum",
      prompt: `🧩 Pip puzzle — which pair adds up to exactly ${t}?`,
      visual: { type: "target", label: `Target: ${t}` },
      choices: uniqueChoices(correctPair, [
        `${a} + ${Number((b + 0.1).toFixed(1))}`,
        `${Number((a + 0.1).toFixed(1))} + ${b}`,
        `${a} + ${a}`,
        `${b} + ${b}`,
      ]),
      answer: correctPair,
      explain: `${a} + ${b} = ${t}.`,
    };
  }

  /** Logic clue — riddle / elimination (crossword-clue energy) */
  function puzzleLogicClue() {
    const bank = [
      {
        prompt:
          "🧩 Logic clue — I’m a fraction. My denominator is 4. I’m greater than 1/2 but less than 1. I’m equal to 0.75. What am I?",
        answer: "3/4",
        choices: ["1/4", "2/4", "3/4", "4/4"],
        explain: "Greater than 1/2, less than 1, denominator 4, equals 0.75 → 3/4.",
        skillId: "frac-dec",
      },
      {
        prompt:
          "🧩 Logic clue — I’m a decimal with one digit after the point. I’m less than 1/2 but greater than 0.2. What am I?",
        answer: "0.3",
        choices: ["0.1", "0.2", "0.3", "0.5"],
        explain: "Between 0.2 and 0.5 with one decimal place → 0.3 or 0.4; 0.3 is the listed fit.",
        skillId: "dec-compare",
      },
      {
        prompt:
          "🧩 Logic clue — I’m equivalent to 1/2. My denominator is 8. What am I?",
        answer: "4/8",
        choices: ["2/8", "3/8", "4/8", "5/8"],
        explain: "1/2 = 4/8.",
        skillId: "frac-equiv",
      },
      {
        prompt:
          "🧩 Logic clue — Two of these are equal. Which value matches both 2/5 and 0.4?",
        answer: "40%",
        choices: ["20%", "25%", "40%", "50%"],
        explain: "2/5 = 0.4 = 40%.",
        skillId: "percent-intro",
      },
      {
        prompt:
          "🧩 Logic clue — I’m in the tenths place of 3.7. What digit am I?",
        answer: "7",
        choices: ["3", "7", "0", "10"],
        explain: "In 3.7, the digit right of the decimal is 7 (tenths).",
        skillId: "dec-place",
      },
      {
        prompt:
          "🧩 Logic clue — A pizza has 8 slices. Leo ate some and 3/8 is left. How many slices did he eat?",
        answer: "5",
        choices: ["3", "4", "5", "6"],
        explain: "8 − 3 = 5 slices eaten (5/8).",
        skillId: "word-mixed",
      },
    ];
    const p = pick(bank);
    return {
      skillId: p.skillId,
      phase: "puzzle",
      puzzleType: "logic-clue",
      prompt: p.prompt,
      visual: null,
      choices: shuffle(p.choices.slice()),
      answer: p.answer,
      explain: p.explain,
    };
  }

  /** Mini grid — Sudoku-ish row must sum to 1 */
  function puzzleGridSum() {
    const d = pick([4, 5, 6, 8]);
    // three known cells + one blank; row sums to d/d = 1
    const a = randInt(1, d - 3);
    const b = randInt(1, d - a - 2);
    const c = randInt(1, d - a - b - 1);
    const missing = d - a - b - c;
    if (missing <= 0 || missing >= d) return puzzleTargetSum();
    const [mn, md] = simplify(missing, d);
    const ans = fmt(mn, md);
    const cells = [fmt(a, d), fmt(b, d), "?", fmt(c, d)];
    return {
      skillId: "frac-add-sub",
      phase: "puzzle",
      puzzleType: "grid-sum",
      prompt: `🧩 Grid puzzle — these four pieces make one whole. What’s the missing piece?`,
      visual: {
        type: "grid-row",
        cells,
        label: "Row sums to 1 whole",
      },
      choices: uniqueChoices(ans, [
        fmt(missing, d),
        fmt(missing + 1, d),
        fmt(a, d),
        fmt(missing, d + 1),
      ]),
      answer: ans,
      explain: `${fmt(a, d)}+${fmt(b, d)}+${fmt(c, d)}+? = 1, so ? = ${fmt(missing, d)}${
        ans !== fmt(missing, d) ? ` = ${ans}` : ""
      }.`,
    };
  }

  /** Match bridge — fraction ↔ decimal (pairing like a match puzzle) */
  function puzzleMatchBridge() {
    const pairs = [
      ["1/2", "0.5"],
      ["1/4", "0.25"],
      ["3/4", "0.75"],
      ["1/5", "0.2"],
      ["2/5", "0.4"],
      ["1/10", "0.1"],
      ["3/10", "0.3"],
      ["1/8", "0.125"],
    ];
    const [frac, dec] = pick(pairs);
    if (Math.random() < 0.5) {
      return {
        skillId: "frac-dec",
        phase: "puzzle",
        puzzleType: "match",
        prompt: `🧩 Match puzzle — which decimal is the partner for ${frac}?`,
        visual: { type: "match", left: frac, right: "?" },
        choices: uniqueChoices(dec, ["0.5", "0.25", "0.2", "0.75", "0.4", "0.1", "0.3"]),
        answer: dec,
        explain: `${frac} = ${dec}.`,
      };
    }
    return {
      skillId: "frac-dec",
      phase: "puzzle",
      puzzleType: "match",
      prompt: `🧩 Match puzzle — which fraction is the partner for ${dec}?`,
      visual: { type: "match", left: dec, right: "?" },
      choices: uniqueChoices(frac, ["1/2", "1/4", "3/4", "1/5", "2/5", "1/10", "1/3"]),
      answer: frac,
      explain: `${dec} = ${frac}.`,
    };
  }

  /** Order lock — smallest → largest (like rearranging tiles) */
  function puzzleOrderLock() {
    const set = shuffle([
      pick(["1/4", "0.25"]),
      pick(["1/2", "0.5"]),
      pick(["3/4", "0.75"]),
      pick(["1/5", "0.2"]),
      pick(["2/5", "0.4"]),
      pick(["1/10", "0.1"]),
    ]).slice(0, 3);
    // ensure unique values
    const vals = set.map((s) => {
      if (s.includes("/")) {
        const [n, d] = s.split("/").map(Number);
        return { s, v: n / d };
      }
      return { s, v: Number(s) };
    });
    // unique by value
    const uniq = [];
    const seen = new Set();
    vals.forEach((x) => {
      const key = x.v.toFixed(4);
      if (!seen.has(key)) {
        seen.add(key);
        uniq.push(x);
      }
    });
    while (uniq.length < 3) {
      uniq.push({ s: "1/3", v: 1 / 3 });
    }
    const three = uniq.slice(0, 3);
    const sorted = three.slice().sort((a, b) => a.v - b.v);
    const answer = sorted.map((x) => x.s).join(" < ");
    const scrambled = shuffle(three.map((x) => x.s));
    return {
      skillId: "frac-compare",
      phase: "puzzle",
      puzzleType: "order",
      prompt: `🧩 Order lock — arrange smallest to largest:\n${scrambled.join("   ·   ")}`,
      visual: { type: "chips", items: scrambled },
      choices: uniqueChoices(answer, [
        sorted
          .slice()
          .reverse()
          .map((x) => x.s)
          .join(" < "),
        shuffle(three.map((x) => x.s)).join(" < "),
        three.map((x) => x.s).join(" = "),
      ]),
      answer,
      explain: `Smallest → largest: ${answer}.`,
    };
  }

  const GENERATORS = [
    puzzleOddOneOut,
    puzzleSequence,
    puzzleTargetSum,
    puzzleLogicClue,
    puzzleGridSum,
    puzzleMatchBridge,
    puzzleOrderLock,
  ];

  function generatePuzzle(level) {
    let q;
    let tries = 0;
    do {
      q = pick(GENERATORS)();
      tries++;
    } while ((!q.choices || !q.choices.includes(q.answer)) && tries < 10);
    q.id = `puzzle-${q.puzzleType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    q.level = level || 1;
    // tag for stats under both puzzle-lab and underlying skill
    q.skillId = q.skillId || "word-mixed";
    q.trackSkills = ["puzzle-lab", q.skillId];
    return q;
  }

  function buildPuzzleRound(count, level) {
    const n = count || 8;
    const questions = [];
    const used = new Set();
    let guard = 0;
    while (questions.length < n && guard < n * 8) {
      guard++;
      const q = generatePuzzle(level || 2);
      const key = q.prompt + q.answer;
      if (used.has(key)) continue;
      used.add(key);
      questions.push(q);
    }
    return questions;
  }

  /** Mix a few puzzles into a normal mission list */
  function injectPuzzles(questions, howMany) {
    const n = howMany || 2;
    const out = questions.slice();
    for (let i = 0; i < n; i++) {
      const idx = Math.min(out.length - 1, 3 + i * 3);
      out.splice(idx, 0, generatePuzzle(2));
    }
    return out;
  }

  global.MathMissionPuzzles = {
    generatePuzzle,
    buildPuzzleRound,
    injectPuzzles,
  };
})(window);
