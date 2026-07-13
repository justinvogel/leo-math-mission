/**
 * Leo's Math Mission — curriculum + skill map + adaptive Skill Scan
 *
 * Design rules:
 * - Kid-facing labels never say "3rd grade" / "behind"
 * - Parent-only fields (typicalBand) exist for your planning only
 * - Status is skill mastery: solid / building / growth edge / not scanned
 */
(function (global) {
  "use strict";

  /**
   * Skill taxonomy for 6th-grade number readiness.
   * prereqs: skills that should be solid before we train this heavily
   * typicalBand: parent-only "when schools often introduce this" (not a label for Leo)
   * domain: foundations | fractions | decimals | mixed | ratio
   * targetFor: what "caught up for 6th" means for this node
   */
  const SKILLS = [
    // --- Foundations (often the real bottleneck) ---
    {
      id: "mult-facts",
      name: "Multiplication Facts",
      emoji: "⚡",
      domain: "foundations",
      focus: "foundations",
      blurb: "Quick times tables",
      unlockLevel: 1,
      prereqs: [],
      typicalBand: "3–4",
      targetFor: "6th",
      scanPriority: 10,
    },
    {
      id: "div-facts",
      name: "Division Facts",
      emoji: "➗",
      domain: "foundations",
      focus: "foundations",
      blurb: "Related fact families",
      unlockLevel: 1,
      prereqs: ["mult-facts"],
      typicalBand: "3–4",
      targetFor: "6th",
      scanPriority: 20,
    },
    {
      id: "place-whole",
      name: "Whole-Number Place Value",
      emoji: "🔢",
      domain: "foundations",
      focus: "foundations",
      blurb: "Ones, tens, hundreds…",
      unlockLevel: 1,
      prereqs: [],
      typicalBand: "3–4",
      targetFor: "6th",
      scanPriority: 30,
    },
    {
      id: "mult-multi",
      name: "Multi-Digit Multiply",
      emoji: "✖️",
      domain: "foundations",
      focus: "foundations",
      blurb: "Bigger multiplication",
      unlockLevel: 2,
      prereqs: ["mult-facts"],
      typicalBand: "4–5",
      targetFor: "6th",
      scanPriority: 40,
    },
    {
      id: "div-multi",
      name: "Multi-Digit Divide",
      emoji: "📐",
      domain: "foundations",
      focus: "foundations",
      blurb: "Longer division",
      unlockLevel: 2,
      prereqs: ["div-facts", "mult-facts"],
      typicalBand: "4–5",
      targetFor: "6th",
      scanPriority: 50,
    },

    // --- Fractions ---
    {
      id: "frac-parts",
      name: "Parts of a Whole",
      emoji: "🍕",
      domain: "fractions",
      focus: "fractions",
      blurb: "What fraction is shaded?",
      unlockLevel: 1,
      prereqs: [],
      typicalBand: "3–4",
      targetFor: "6th",
      scanPriority: 100,
    },
    {
      id: "frac-equiv",
      name: "Equivalent Fractions",
      emoji: "🔁",
      domain: "fractions",
      focus: "fractions",
      blurb: "Same amount, different look",
      unlockLevel: 1,
      prereqs: ["frac-parts", "mult-facts"],
      typicalBand: "4",
      targetFor: "6th",
      scanPriority: 110,
    },
    {
      id: "frac-compare",
      name: "Compare Fractions",
      emoji: "⚖️",
      domain: "fractions",
      focus: "fractions",
      blurb: "Which is larger?",
      unlockLevel: 2,
      prereqs: ["frac-equiv"],
      typicalBand: "4",
      targetFor: "6th",
      scanPriority: 120,
    },
    {
      id: "frac-add-sub",
      name: "Add & Subtract (Same Denominator)",
      emoji: "➕",
      domain: "fractions",
      focus: "fractions",
      blurb: "Same bottoms first",
      unlockLevel: 2,
      prereqs: ["frac-parts"],
      typicalBand: "4",
      targetFor: "6th",
      scanPriority: 130,
    },
    {
      id: "frac-mixed-ops",
      name: "Unlike Denominators",
      emoji: "🧩",
      domain: "fractions",
      focus: "fractions",
      blurb: "Find a common bottom",
      unlockLevel: 3,
      prereqs: ["frac-add-sub", "frac-equiv", "mult-facts"],
      typicalBand: "5",
      targetFor: "6th",
      scanPriority: 140,
    },
    {
      id: "frac-mult",
      name: "Multiply Fractions",
      emoji: "✳️",
      domain: "fractions",
      focus: "fractions",
      blurb: "Of means multiply",
      unlockLevel: 4,
      prereqs: ["frac-parts", "mult-facts"],
      typicalBand: "5",
      targetFor: "6th",
      scanPriority: 150,
    },
    {
      id: "frac-div",
      name: "Divide Fractions (Intro)",
      emoji: "🔄",
      domain: "fractions",
      focus: "fractions",
      blurb: "How many fit?",
      unlockLevel: 5,
      prereqs: ["frac-mult"],
      typicalBand: "5–6",
      targetFor: "6th",
      scanPriority: 160,
    },

    // --- Decimals ---
    {
      id: "dec-place",
      name: "Decimal Place Value",
      emoji: "📍",
      domain: "decimals",
      focus: "decimals",
      blurb: "Tenths, hundredths…",
      unlockLevel: 1,
      prereqs: ["place-whole"],
      typicalBand: "4–5",
      targetFor: "6th",
      scanPriority: 200,
    },
    {
      id: "dec-compare",
      name: "Compare Decimals",
      emoji: "📊",
      domain: "decimals",
      focus: "decimals",
      blurb: "Order and compare",
      unlockLevel: 2,
      prereqs: ["dec-place"],
      typicalBand: "4–5",
      targetFor: "6th",
      scanPriority: 210,
    },
    {
      id: "frac-dec",
      name: "Fractions ↔ Decimals",
      emoji: "🔀",
      domain: "mixed",
      focus: "mixed",
      blurb: "Switch forms freely",
      unlockLevel: 3,
      prereqs: ["frac-parts", "dec-place"],
      typicalBand: "5",
      targetFor: "6th",
      scanPriority: 220,
    },
    {
      id: "dec-ops",
      name: "Decimal Add & Subtract",
      emoji: "🧮",
      domain: "decimals",
      focus: "decimals",
      blurb: "Line up the points",
      unlockLevel: 3,
      prereqs: ["dec-place"],
      typicalBand: "5",
      targetFor: "6th",
      scanPriority: 230,
    },
    {
      id: "dec-mult",
      name: "Decimal Multiply",
      emoji: "💥",
      domain: "decimals",
      focus: "decimals",
      blurb: "Multiply, place the point",
      unlockLevel: 4,
      prereqs: ["dec-ops", "mult-facts"],
      typicalBand: "5–6",
      targetFor: "6th",
      scanPriority: 240,
    },

    // --- Application ---
    {
      id: "word-mixed",
      name: "Story Missions",
      emoji: "📖",
      domain: "mixed",
      focus: "mixed",
      blurb: "Real-world problems",
      unlockLevel: 2,
      prereqs: ["frac-parts", "dec-place"],
      typicalBand: "4–6",
      targetFor: "6th",
      scanPriority: 300,
    },
    {
      id: "percent-intro",
      name: "Percent Basics",
      emoji: "💯",
      domain: "ratio",
      focus: "mixed",
      blurb: "Out of 100",
      unlockLevel: 5,
      prereqs: ["frac-dec", "dec-place"],
      typicalBand: "6",
      targetFor: "6th",
      scanPriority: 310,
    },
  ];

  const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

  const BASE_MODULES = [
    { id: "pad", name: "Landing Pad", emoji: "🛸", needMissions: 0 },
    { id: "lab", name: "Fraction Lab", emoji: "🔬", needMissions: 1 },
    { id: "radar", name: "Decimal Radar", emoji: "📡", needMissions: 3 },
    { id: "forge", name: "Number Forge", emoji: "⚒️", needMissions: 5 },
    { id: "tower", name: "Skill Tower", emoji: "🗼", needMissions: 8 },
    { id: "core", name: "Master Core", emoji: "💎", needMissions: 12 },
  ];

  const MISSION_ROTATION = [
    {
      id: "foundations",
      title: "Fraction Foundations",
      focus: "fractions",
      skills: ["frac-parts", "frac-equiv", "frac-compare"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
    {
      id: "decimal-dock",
      title: "Decimal Dock",
      focus: "decimals",
      skills: ["dec-place", "dec-compare", "dec-ops"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
    {
      id: "bridge",
      title: "Bridge the Forms",
      focus: "mixed",
      skills: ["frac-dec", "frac-add-sub", "dec-ops"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
    {
      id: "ops-run",
      title: "Operations Run",
      focus: "fractions",
      skills: ["frac-add-sub", "frac-mixed-ops", "frac-mult"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
    {
      id: "story-shift",
      title: "Story Shift",
      focus: "mixed",
      skills: ["word-mixed", "frac-compare", "dec-ops"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
    {
      id: "precision",
      title: "Precision Protocol",
      focus: "decimals",
      skills: ["dec-place", "dec-mult", "frac-dec"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
    {
      id: "power-core",
      title: "Power Core",
      focus: "foundations",
      skills: ["mult-facts", "div-facts", "mult-multi"],
      desc: "Warm-up · 8 quest problems · boss challenge",
    },
  ];

  // ---------- utils ----------
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
  function fmtFrac(n, d) {
    if (d === 1) return String(n);
    return `${n}/${d}`;
  }
  function nearlyEqual(a, b, eps = 1e-9) {
    return Math.abs(a - b) < eps;
  }
  function uniqueChoices(correct, distractors, format = (x) => String(x)) {
    const set = new Set();
    const out = [];
    const push = (v) => {
      const s = format(v);
      if (!set.has(s)) {
        set.add(s);
        out.push(s);
      }
    };
    push(correct);
    for (const d of distractors) {
      if (out.length >= 4) break;
      push(d);
    }
    let guard = 0;
    while (out.length < 4 && guard < 30) {
      guard++;
      if (typeof correct === "number") {
        push(Number((correct + (Math.random() - 0.5) * 2).toFixed(2)));
      } else {
        push(String(correct) + ["*", "+", "·", "′"][guard % 4]);
      }
    }
    return shuffle(out.slice(0, 4));
  }

  function visualBar(filled, total) {
    return {
      type: "bar",
      filled,
      total,
      label: `${filled} of ${total} equal parts shaded`,
    };
  }
  function visualPie(n, d) {
    return {
      type: "pie",
      n,
      d,
      pct: (n / d) * 100,
      label: fmtFrac(n, d),
    };
  }
  function visualDecimal(value) {
    const s = Number(value).toFixed(3);
    const [whole, frac] = s.split(".");
    return {
      type: "decimal",
      whole,
      tenths: frac[0],
      hundredths: frac[1],
      thousandths: frac[2],
      value: Number(value),
    };
  }

  // ---------- generators ----------
  function genMultFacts() {
    const a = randInt(2, 12);
    const b = randInt(2, 12);
    const correct = a * b;
    return {
      skillId: "mult-facts",
      prompt: `What is ${a} × ${b}?`,
      visual: null,
      choices: uniqueChoices(String(correct), [
        String(correct + a),
        String(correct - b),
        String(a + b),
        String(a * (b + 1)),
        String(Math.abs(correct - 10)),
      ]),
      answer: String(correct),
      explain: `${a} × ${b} = ${correct}.`,
    };
  }

  function genDivFacts() {
    const b = randInt(2, 12);
    const q = randInt(2, 12);
    const a = b * q;
    const correct = q;
    return {
      skillId: "div-facts",
      prompt: `What is ${a} ÷ ${b}?`,
      visual: null,
      choices: uniqueChoices(String(correct), [
        String(correct + 1),
        String(correct - 1),
        String(b),
        String(a - b),
        String(Math.floor(a / (b + 1)) || 1),
      ]),
      answer: String(correct),
      explain: `${b} × ${q} = ${a}, so ${a} ÷ ${b} = ${q}.`,
    };
  }

  function genPlaceWhole() {
    const n = randInt(1000, 999999);
    const s = String(n);
    const places = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"];
    const idxFromRight = randInt(0, Math.min(5, s.length - 1));
    const digit = s[s.length - 1 - idxFromRight];
    const placeName = places[idxFromRight];
    return {
      skillId: "place-whole",
      prompt: `In ${n.toLocaleString("en-US")}, what digit is in the ${placeName} place?`,
      visual: null,
      choices: uniqueChoices(digit, shuffle(s.split("")).slice(0, 4)),
      answer: digit,
      explain: `In ${n.toLocaleString("en-US")}, the ${placeName} digit is ${digit}.`,
    };
  }

  function genMultMulti(level) {
    const a = level < 3 ? randInt(11, 29) : randInt(12, 48);
    const b = level < 3 ? randInt(3, 9) : randInt(4, 12);
    const correct = a * b;
    return {
      skillId: "mult-multi",
      prompt: `What is ${a} × ${b}?`,
      visual: null,
      choices: uniqueChoices(String(correct), [
        String(correct + a),
        String(correct - b),
        String(a + b * 10),
        String((a - 1) * b),
        String(a * (b + 1)),
      ]),
      answer: String(correct),
      explain: `${a} × ${b} = ${correct}.`,
    };
  }

  function genDivMulti(level) {
    const b = level < 3 ? randInt(3, 9) : randInt(4, 12);
    const q = level < 3 ? randInt(11, 25) : randInt(12, 36);
    const a = b * q;
    return {
      skillId: "div-multi",
      prompt: `What is ${a} ÷ ${b}?`,
      visual: null,
      choices: uniqueChoices(String(q), [
        String(q + 1),
        String(q - 1),
        String(b),
        String(Math.floor(a / 10)),
        String(q + b),
      ]),
      answer: String(q),
      explain: `${b} × ${q} = ${a}, so ${a} ÷ ${b} = ${q}.`,
    };
  }

  function genFracParts(level) {
    const total = pick(level < 3 ? [4, 5, 6, 8] : [6, 8, 10, 12]);
    const filled = randInt(1, total - 1);
    const [n, d] = simplify(filled, total);
    const correct = fmtFrac(n, d);
    const showUnsimplified = filled !== n;
    return {
      skillId: "frac-parts",
      prompt: showUnsimplified
        ? `This bar is shaded. What fraction is shaded? (Simplify if you can.)`
        : `What fraction of the bar is shaded?`,
      visual: visualBar(filled, total),
      choices: uniqueChoices(correct, [
        fmtFrac(filled, total),
        fmtFrac(total - filled, total),
        fmtFrac(filled, total + 1),
        fmtFrac(filled + 1, total),
        fmtFrac(n, d + 1),
      ].filter((x) => x !== correct)),
      answer: correct,
      explain: `${filled} out of ${total} → ${fmtFrac(filled, total)}${
        showUnsimplified ? ` = ${correct}` : ""
      }.`,
    };
  }

  function genFracEquiv(level) {
    const dens = level < 3 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 8];
    const d = pick(dens);
    const n = randInt(1, d - 1);
    const mult = pick(level < 3 ? [2, 3] : [2, 3, 4]);
    const correct = fmtFrac(n * mult, d * mult);
    return {
      skillId: "frac-equiv",
      prompt: `Which fraction is equivalent to ${fmtFrac(n, d)}?`,
      visual: visualPie(n, d),
      choices: uniqueChoices(correct, [
        fmtFrac(n + 1, d * mult),
        fmtFrac(n * mult, d * mult + 1),
        fmtFrac(n, d * mult),
        fmtFrac(n * mult + 1, d * mult),
      ]),
      answer: correct,
      explain: `Multiply top and bottom by ${mult}: ${fmtFrac(n, d)} = ${correct}.`,
    };
  }

  function genFracCompare(level) {
    let n1, d1, n2, d2;
    if (level < 3 && Math.random() < 0.5) {
      d1 = d2 = pick([4, 5, 6, 8, 10]);
      n1 = randInt(1, d1 - 1);
      do {
        n2 = randInt(1, d2 - 1);
      } while (n2 === n1);
    } else {
      d1 = pick([2, 3, 4, 5, 6, 8]);
      d2 = pick([2, 3, 4, 5, 6, 8, 10].filter((x) => x !== d1));
      n1 = randInt(1, d1 - 1);
      n2 = randInt(1, d2 - 1);
      if (nearlyEqual(n1 / d1, n2 / d2)) n2 = Math.min(d2 - 1, n2 + 1);
    }
    const v1 = n1 / d1;
    const v2 = n2 / d2;
    const f1 = fmtFrac(n1, d1);
    const f2 = fmtFrac(n2, d2);
    let answer, explain;
    if (nearlyEqual(v1, v2)) {
      answer = "They're equal";
      explain = `${f1} and ${f2} are the same amount.`;
    } else if (v1 > v2) {
      answer = f1;
      explain = `${f1} ≈ ${v1.toFixed(2)}, ${f2} ≈ ${v2.toFixed(2)} → ${f1} is larger.`;
    } else {
      answer = f2;
      explain = `${f1} ≈ ${v1.toFixed(2)}, ${f2} ≈ ${v2.toFixed(2)} → ${f2} is larger.`;
    }
    const choices = shuffle([f1, f2, "They're equal", "Can't tell"].filter((x, i, a) => a.indexOf(x) === i));
    while (choices.length < 4) choices.push(fmtFrac(randInt(1, 5), pick([3, 4, 5, 6, 8])));
    return {
      skillId: "frac-compare",
      prompt: `Which is larger: ${f1} or ${f2}?`,
      visual: null,
      choices: choices.slice(0, 4),
      answer,
      explain,
    };
  }

  function finalizeAddSub(n1, n2, d, op, correctN) {
    if (correctN === undefined) correctN = n1 - n2;
    const [sn, sd] = simplify(correctN, d);
    const correct = fmtFrac(sn, sd);
    const raw = fmtFrac(correctN, d);
    return {
      skillId: "frac-add-sub",
      prompt: `What is ${fmtFrac(n1, d)} ${op} ${fmtFrac(n2, d)}?`,
      visual: null,
      choices: uniqueChoices(correct, [
        raw,
        fmtFrac(n1 + n2, d * 2),
        fmtFrac(Math.abs(n1 - n2), d),
        fmtFrac(n1 + n2, d + d),
        fmtFrac(sn + 1, sd),
      ]),
      answer: correct,
      explain:
        op === "+"
          ? `Add tops, keep ${d}: ${fmtFrac(n1 + n2, d)}${raw !== correct ? ` = ${correct}` : ""}.`
          : `Subtract tops, keep ${d}: ${fmtFrac(correctN, d)}${raw !== correct ? ` = ${correct}` : ""}.`,
    };
  }

  function genFracAddSub(level) {
    const d = pick(level < 3 ? [4, 5, 6, 8, 10] : [6, 8, 10, 12]);
    const n1 = randInt(1, d - 2);
    const n2 = randInt(1, d - n1);
    if (Math.random() < 0.55) return finalizeAddSub(n1, n2, d, "+", n1 + n2);
    const a = Math.max(n1, n2);
    const b = Math.min(n1, n2);
    return finalizeAddSub(a, b, d, "−");
  }

  function genFracMixedOps() {
    const pairs = [
      [2, 4],
      [2, 6],
      [3, 6],
      [4, 8],
      [3, 9],
      [5, 10],
      [2, 8],
      [4, 6],
      [3, 4],
      [2, 3],
    ];
    let [d1, d2] = pick(pairs);
    if (Math.random() < 0.5) [d1, d2] = [d2, d1];
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, Math.max(1, d2 - 1));
    const lcd = (d1 * d2) / gcd(d1, d2);
    let a = n1 * (lcd / d1);
    let b = n2 * (lcd / d2);
    const op = Math.random() < 0.6 ? "+" : "−";
    let promptN1 = n1,
      promptN2 = n2,
      promptD1 = d1,
      promptD2 = d2,
      sum;
    if (op === "+") sum = a + b;
    else if (a >= b) sum = a - b;
    else {
      sum = b - a;
      promptN1 = n2;
      promptD1 = d2;
      promptN2 = n1;
      promptD2 = d1;
    }
    const [sn, sd] = simplify(sum, lcd);
    const correct = fmtFrac(sn, sd);
    return {
      skillId: "frac-mixed-ops",
      prompt: `What is ${fmtFrac(promptN1, promptD1)} ${op} ${fmtFrac(promptN2, promptD2)}?`,
      visual: null,
      choices: uniqueChoices(correct, [
        fmtFrac(sum, lcd),
        fmtFrac(promptN1 + promptN2, promptD1 + promptD2),
        fmtFrac(promptN1 + promptN2, lcd),
        fmtFrac(Math.abs(promptN1 - promptN2), lcd),
      ]),
      answer: correct,
      explain: `Common denominator ${lcd}. Answer: ${correct}.`,
    };
  }

  function genFracMult() {
    const d1 = pick([2, 3, 4, 5, 6]);
    const d2 = pick([2, 3, 4, 5]);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const rawN = n1 * n2;
    const rawD = d1 * d2;
    const [sn, sd] = simplify(rawN, rawD);
    const correct = fmtFrac(sn, sd);
    const style = Math.random() < 0.45;
    return {
      skillId: "frac-mult",
      prompt: style
        ? `What is ${fmtFrac(n1, d1)} of ${fmtFrac(n2, d2)}?`
        : `What is ${fmtFrac(n1, d1)} × ${fmtFrac(n2, d2)}?`,
      visual: null,
      choices: uniqueChoices(correct, [
        fmtFrac(rawN, rawD),
        fmtFrac(n1 + n2, d1 + d2),
        fmtFrac(n1 * n2, d1),
        fmtFrac(n1, d1 * d2),
      ]),
      answer: correct,
      explain: `(${n1}×${n2})/(${d1}×${d2}) = ${fmtFrac(rawN, rawD)}${
        correct !== fmtFrac(rawN, rawD) ? ` → ${correct}` : ""
      }.`,
    };
  }

  function genFracDiv() {
    // unit fraction ÷ whole or simple "how many fit"
    const modes = pick(["unit-into", "whole-div-unit"]);
    if (modes === "unit-into") {
      const d = pick([2, 3, 4, 5, 6, 8]);
      const whole = pick([2, 3, 4]);
      // (1/d) into whole? wait: whole ÷ (1/d) = whole * d
      const correct = String(whole * d);
      return {
        skillId: "frac-div",
        prompt: `How many pieces of size ${fmtFrac(1, d)} fit into ${whole}?`,
        visual: null,
        choices: uniqueChoices(correct, [
          String(whole + d),
          String(d),
          String(whole),
          String(Math.floor(d / whole) || 1),
        ]),
        answer: correct,
        explain: `${whole} ÷ ${fmtFrac(1, d)} = ${whole} × ${d} = ${correct}.`,
      };
    }
    const d = pick([2, 3, 4, 5]);
    const n = randInt(1, d - 1);
    // (n/d) ÷ 2 when even, else n/d ÷ 1/2
    const correctN = n * 2;
    const [sn, sd] = simplify(correctN, d);
    const correct = fmtFrac(sn, sd);
    return {
      skillId: "frac-div",
      prompt: `What is ${fmtFrac(n, d)} ÷ ${fmtFrac(1, 2)}?`,
      visual: null,
      choices: uniqueChoices(correct, [
        fmtFrac(n, d * 2),
        fmtFrac(n, 2),
        fmtFrac(n * 2, d * 2),
        fmtFrac(n + 1, d),
      ]),
      answer: correct,
      explain: `Dividing by 1/2 is the same as multiplying by 2 → ${correct}.`,
    };
  }

  function genDecPlace(level) {
    const mode = pick(["name", "value", "which"]);
    if (mode === "name") {
      const place = pick([
        { mult: 0.1, name: "tenths" },
        { mult: 0.01, name: "hundredths" },
        { mult: 0.001, name: "thousandths" },
      ]);
      const digit = randInt(1, 9);
      const value = Number((digit * place.mult).toFixed(3));
      const correct = String(value);
      return {
        skillId: "dec-place",
        prompt: `What decimal is ${digit} ${place.name}?`,
        visual: visualDecimal(value),
        choices: uniqueChoices(correct, [
          String(digit),
          String(Number((digit * 0.1).toFixed(1))),
          String(Number((digit * 0.01).toFixed(2))),
          String(Number((digit * 0.001).toFixed(3))),
        ]),
        answer: correct,
        explain: `${digit} ${place.name} = ${correct}.`,
      };
    }
    if (mode === "value") {
      const value = Number((randInt(1, 99) / (Math.random() < 0.5 ? 10 : 100)).toFixed(2));
      const s = value.toFixed(2);
      const tenthsDigit = s.split(".")[1][0];
      return {
        skillId: "dec-place",
        prompt: `In ${value}, what digit is in the tenths place?`,
        visual: visualDecimal(value),
        choices: uniqueChoices(tenthsDigit, [
          s.split(".")[1][1],
          String(Math.floor(value)),
          String((parseInt(tenthsDigit, 10) + 1) % 10),
          "0",
        ]),
        answer: tenthsDigit,
        explain: `One place right of the decimal is tenths → ${tenthsDigit}.`,
      };
    }
    const a = Number((randInt(10, 99) / 100).toFixed(2));
    let b = Number((randInt(10, 99) / 100).toFixed(2));
    if (a === b) b = Number((b + 0.01).toFixed(2));
    const answer = a > b ? String(a) : String(b);
    return {
      skillId: "dec-place",
      prompt: `Which is larger?`,
      visual: null,
      choices: shuffle([String(a), String(b), String(Number((a + b).toFixed(2))), "They're equal"]),
      answer,
      explain: `${a} vs ${b} → larger is ${answer}.`,
    };
  }

  function genDecCompare() {
    const vals = shuffle([
      Number((randInt(1, 99) / 100).toFixed(2)),
      Number((randInt(1, 99) / 10).toFixed(1)),
      Number((randInt(10, 99) / 100).toFixed(2)),
      Number((randInt(1, 9) / 10).toFixed(1)),
    ]).slice(0, 3);
    // make unique
    const uniq = [...new Set(vals.map((v) => Number(v)))];
    while (uniq.length < 3) uniq.push(Number((Math.random()).toFixed(2)));
    const sorted = uniq.slice().sort((a, b) => a - b);
    const correct = sorted.map(String).join(" < ");
    const wrong1 = sorted
      .slice()
      .reverse()
      .map(String)
      .join(" < ");
    const wrong2 = shuffle(sorted.map(String)).join(" < ");
    const wrong3 = sorted.map(String).join(" > ");
    return {
      skillId: "dec-compare",
      prompt: `Put these in order from smallest to largest: ${uniq.join(", ")}`,
      visual: null,
      choices: uniqueChoices(correct, [wrong1, wrong2, wrong3, uniq.join(" = ")]),
      answer: correct,
      explain: `Smallest to largest: ${correct}.`,
    };
  }

  function genFracDec(level) {
    const commons = [
      [1, 2, "0.5"],
      [1, 4, "0.25"],
      [3, 4, "0.75"],
      [1, 5, "0.2"],
      [2, 5, "0.4"],
      [1, 10, "0.1"],
      [3, 10, "0.3"],
      [1, 8, "0.125"],
      [3, 8, "0.375"],
    ];
    const [n, d, dec] = pick(level < 3 ? commons.slice(0, 7) : commons);
    if (Math.random() < 0.55) {
      const exact = n / d;
      const cleanAnswer = dec.includes("…") ? Number(exact.toFixed(2)).toString() : dec;
      return {
        skillId: "frac-dec",
        prompt: `What decimal equals ${fmtFrac(n, d)}?`,
        visual: visualPie(n, d),
        choices: uniqueChoices(cleanAnswer, [
          String(Number((exact + 0.1).toFixed(2))),
          String(Number((exact / 2).toFixed(2))),
          String(n / 10),
          String(Number((1 - exact).toFixed(2))),
        ]),
        answer: cleanAnswer,
        explain: `${fmtFrac(n, d)} = ${n}÷${d} = ${cleanAnswer}.`,
      };
    }
    const map = [
      ["0.5", "1/2"],
      ["0.25", "1/4"],
      ["0.75", "3/4"],
      ["0.2", "1/5"],
      ["0.4", "2/5"],
      ["0.1", "1/10"],
      ["0.3", "3/10"],
      ["0.6", "3/5"],
      ["0.8", "4/5"],
    ];
    const [decStr, fracStr] = pick(map);
    return {
      skillId: "frac-dec",
      prompt: `Which fraction equals ${decStr}?`,
      visual: visualDecimal(Number(decStr)),
      choices: uniqueChoices(fracStr, ["1/2", "1/4", "2/5", "3/10", "1/3", "1/5", "4/5"]),
      answer: fracStr,
      explain: `${decStr} = ${fracStr}.`,
    };
  }

  function genDecOps(level) {
    const kind = pick(level < 3 ? ["add", "sub"] : ["add", "sub"]);
    if (kind === "add") {
      const a = Number((randInt(10, 90) / 10).toFixed(1));
      const b = Number((randInt(10, 90) / 10).toFixed(1));
      const correct = Number((a + b).toFixed(1));
      return {
        skillId: "dec-ops",
        prompt: `What is ${a} + ${b}?`,
        visual: null,
        choices: uniqueChoices(String(correct), [
          String(Number((a + b + 0.1).toFixed(1))),
          String(Number((a + b - 1).toFixed(1))),
          String(Number((a * 10 + b).toFixed(1))),
        ]),
        answer: String(correct),
        explain: `Line up decimals: ${a} + ${b} = ${correct}.`,
      };
    }
    let a = Number((randInt(20, 99) / 10).toFixed(1));
    let b = Number((randInt(10, 80) / 10).toFixed(1));
    if (b > a) [a, b] = [b, a];
    const correct = Number((a - b).toFixed(1));
    return {
      skillId: "dec-ops",
      prompt: `What is ${a} − ${b}?`,
      visual: null,
      choices: uniqueChoices(String(correct), [
        String(Number((a - b + 1).toFixed(1))),
        String(Number((a + b).toFixed(1))),
        String(Number((b - a).toFixed(1))),
      ]),
      answer: String(correct),
      explain: `Line up decimals: ${a} − ${b} = ${correct}.`,
    };
  }

  function genDecMult() {
    const a = Number((randInt(2, 9) / 10).toFixed(1));
    const b = randInt(2, 9);
    const correct = Number((a * b).toFixed(1));
    return {
      skillId: "dec-mult",
      prompt: `What is ${a} × ${b}?`,
      visual: null,
      choices: uniqueChoices(String(correct), [
        String(Number((a + b).toFixed(1))),
        String(Number((a * b * 10).toFixed(0))),
        String(Number((a * (b + 1)).toFixed(1))),
        String(Number(((a * b) / 10).toFixed(2))),
      ]),
      answer: String(correct),
      explain: `${a} × ${b} = ${correct}. Multiply, then place the decimal.`,
    };
  }

  function genPercentIntro() {
    const map = [
      [50, "1/2", "0.5"],
      [25, "1/4", "0.25"],
      [75, "3/4", "0.75"],
      [10, "1/10", "0.1"],
      [20, "1/5", "0.2"],
      [40, "2/5", "0.4"],
    ];
    const [p, frac, dec] = pick(map);
    if (Math.random() < 0.5) {
      return {
        skillId: "percent-intro",
        prompt: `What fraction equals ${p}%?`,
        visual: null,
        choices: uniqueChoices(frac, ["1/2", "1/4", "1/5", "1/10", "3/4", "2/5"]),
        answer: frac,
        explain: `${p}% = ${p}/100 = ${frac}.`,
      };
    }
    return {
      skillId: "percent-intro",
      prompt: `What decimal equals ${p}%?`,
      visual: null,
      choices: uniqueChoices(dec, ["0.5", "0.25", "0.1", "0.2", "0.75", String(p)]),
      answer: dec,
      explain: `${p}% = ${p}/100 = ${dec}.`,
    };
  }

  function genWordMixed(level) {
    const stories = [
      () => {
        const total = pick([8, 10, 12]);
        const ate = randInt(2, total - 2);
        const left = total - ate;
        const [ln, ld] = simplify(left, total);
        return {
          skillId: "word-mixed",
          prompt: `A pizza is cut into ${total} equal slices. Leo eats ${ate}. What fraction is left?`,
          visual: visualBar(left, total),
          choices: uniqueChoices(fmtFrac(ln, ld), [
            fmtFrac(ate, total),
            fmtFrac(left, total),
            fmtFrac(1, total),
          ]),
          answer: fmtFrac(ln, ld),
          explain: `${left}/${total}${fmtFrac(left, total) !== fmtFrac(ln, ld) ? ` = ${fmtFrac(ln, ld)}` : ""}.`,
        };
      },
      () => {
        const price = Number((randInt(25, 95) / 10).toFixed(1));
        const pay = Number((price + randInt(1, 5)).toFixed(1));
        const change = Number((pay - price).toFixed(1));
        return {
          skillId: "word-mixed",
          prompt: `A snack costs $${price.toFixed(2)}. Leo pays $${pay.toFixed(2)}. How much change?`,
          visual: null,
          choices: uniqueChoices(`$${change.toFixed(2)}`, [
            `$${(change + 1).toFixed(2)}`,
            `$${price.toFixed(2)}`,
            `$${(pay + price).toFixed(2)}`,
          ]),
          answer: `$${change.toFixed(2)}`,
          explain: `$${pay.toFixed(2)} − $${price.toFixed(2)} = $${change.toFixed(2)}.`,
        };
      },
      () => {
        const parts = pick([4, 5]);
        const done = randInt(1, parts - 1);
        return {
          skillId: "word-mixed",
          prompt: `Leo finished ${done} of ${parts} equal levels. What decimal is that?`,
          visual: visualPie(done, parts),
          choices: uniqueChoices(String(Number((done / parts).toFixed(2))), [
            String(done),
            String(Number(((parts - done) / parts).toFixed(2))),
            String(parts / 10),
          ]),
          answer: String(Number((done / parts).toFixed(2))),
          explain: `${fmtFrac(done, parts)} = ${Number((done / parts).toFixed(2))}.`,
        };
      },
      () => {
        const d = pick([6, 8, 10]);
        const a = randInt(1, Math.floor(d / 2));
        const b = randInt(1, d - a - 1);
        const [sn, sd] = simplify(a + b, d);
        return {
          skillId: "word-mixed",
          prompt: `Leo walks ${fmtFrac(a, d)} of a trail before lunch and ${fmtFrac(b, d)} after. How much total?`,
          visual: null,
          choices: uniqueChoices(fmtFrac(sn, sd), [
            fmtFrac(a + b, d),
            fmtFrac(a + b, d * 2),
            fmtFrac(Math.abs(a - b), d),
          ]),
          answer: fmtFrac(sn, sd),
          explain: `${a}+${b} over ${d} → ${fmtFrac(sn, sd)}.`,
        };
      },
    ];
    return pick(stories)();
  }

  const GENERATORS = {
    "mult-facts": () => genMultFacts(),
    "div-facts": () => genDivFacts(),
    "place-whole": () => genPlaceWhole(),
    "mult-multi": (l) => genMultMulti(l),
    "div-multi": (l) => genDivMulti(l),
    "frac-parts": (l) => genFracParts(l),
    "frac-equiv": (l) => genFracEquiv(l),
    "frac-compare": (l) => genFracCompare(l),
    "frac-add-sub": (l) => genFracAddSub(l),
    "frac-mixed-ops": () => genFracMixedOps(),
    "frac-mult": () => genFracMult(),
    "frac-div": () => genFracDiv(),
    "dec-place": (l) => genDecPlace(l),
    "dec-compare": () => genDecCompare(),
    "frac-dec": (l) => genFracDec(l),
    "dec-ops": (l) => genDecOps(l),
    "dec-mult": () => genDecMult(),
    "word-mixed": (l) => genWordMixed(l),
    "percent-intro": () => genPercentIntro(),
  };

  function generateQuestion(skillId, level = 1) {
    const gen = GENERATORS[skillId] || genFracParts;
    let q;
    let tries = 0;
    do {
      q = gen(level);
      tries++;
    } while ((!q.choices || q.choices.length < 2 || !q.choices.includes(q.answer)) && tries < 8);
    q.id = `${skillId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return q;
  }

  // ---------- mastery helpers ----------
  function masteryFromStats(stat) {
    if (!stat || !stat.seen) return null;
    return stat.correct / stat.seen;
  }

  /** Kid-safe status labels */
  function statusFromRate(rate, seen) {
    if (seen == null || seen === 0 || rate == null) return "not-scanned";
    if (seen < 2) return "building";
    if (rate >= 0.8) return "solid";
    if (rate >= 0.5) return "building";
    return "growth";
  }

  function statusLabel(status) {
    return (
      {
        solid: "Solid",
        building: "Building",
        growth: "Growth edge",
        "not-scanned": "Not scanned yet",
      }[status] || status
    );
  }

  /**
   * Adaptive Skill Scan
   * Ladder through domains: foundations → fractions → decimals → stretch
   * 2 items per skill; solid (≥1.5/2) → continue; weak (0/2) → mark growth + sample prereqs
   * Soft cap ~18–22 questions so it fits one evening (~12–18 min)
   */
  function buildSkillScan() {
    const ladder = [
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
      "frac-mixed-ops",
      "frac-mult",
      "dec-mult",
      "word-mixed",
      "percent-intro",
    ];

    const questions = [];
    // Pre-build a fixed adaptive plan: generate 2 per skill up front,
    // app.js will early-stop domain stretches based on live answers.
    // For simplicity & reliability offline: generate full ladder with 2 each,
    // then trim to max 20 by priority sampling in createScanSession.
    ladder.forEach((skillId) => {
      for (let i = 0; i < 2; i++) {
        questions.push({
          ...generateQuestion(skillId, 2),
          phase: "scan",
          skillId,
        });
      }
    });
    return { ladder, questions };
  }

  /**
   * Create a practical-length scan (~16–20 Q):
   * Always covers foundations + core fraction + core decimal anchors.
   * Adds stretch skills if earlier ones look strong during play (handled by adaptive filter in app).
   */
  function createScanQuestionList() {
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
      list.push({ ...generateQuestion(id, 2), phase: "scan", skillId: id });
      list.push({ ...generateQuestion(id, 2), phase: "scan", skillId: id });
    });
    // Stretch: 1 each (optional depth); app may skip if time — keep 1 per
    stretch.forEach((id) => {
      list.push({ ...generateQuestion(id, 3), phase: "scan", skillId: id });
    });
    return list; // 22 + 5 = 27 max; we'll use adaptive pruning in app to ~18
  }

  /**
   * After scan answers, compute placement map.
   * results: [{ skillId, correct: boolean }, ...]
   */
  function analyzeScan(results) {
    const bySkill = {};
    results.forEach((r) => {
      if (!bySkill[r.skillId]) bySkill[r.skillId] = { seen: 0, correct: 0 };
      bySkill[r.skillId].seen += 1;
      if (r.correct) bySkill[r.skillId].correct += 1;
    });

    const map = {};
    SKILLS.forEach((sk) => {
      const st = bySkill[sk.id];
      if (!st) {
        map[sk.id] = {
          status: "not-scanned",
          rate: null,
          seen: 0,
          correct: 0,
          label: statusLabel("not-scanned"),
        };
        return;
      }
      const rate = st.correct / st.seen;
      const status = statusFromRate(rate, st.seen);
      map[sk.id] = {
        status,
        rate,
        seen: st.seen,
        correct: st.correct,
        label: statusLabel(status),
        typicalBand: sk.typicalBand,
      };
    });

    // Training queue: growth edges first, then building, respecting prereqs
    const growth = SKILLS.filter((s) => map[s.id].status === "growth").map((s) => s.id);
    const building = SKILLS.filter((s) => map[s.id].status === "building").map((s) => s.id);
    const solid = SKILLS.filter((s) => map[s.id].status === "solid").map((s) => s.id);

    // Frontier = first non-solid skills in ladder order whose prereqs aren't all growth
    const ladder = SKILLS.slice().sort((a, b) => a.scanPriority - b.scanPriority);
    const trainQueue = [];
    ladder.forEach((sk) => {
      const st = map[sk.id].status;
      if (st === "growth" || st === "building") {
        // prefer prereqs that are growth first
        sk.prereqs.forEach((p) => {
          if (map[p] && (map[p].status === "growth" || map[p].status === "not-scanned")) {
            if (!trainQueue.includes(p)) trainQueue.push(p);
          }
        });
        if (!trainQueue.includes(sk.id)) trainQueue.push(sk.id);
      }
    });

    // Kid-facing summary (no grade levels)
    const solidCount = solid.length;
    const growthCount = growth.length;
    let kidHeadline = "Scan complete — your training path is ready.";
    if (growthCount === 0 && solidCount >= 6) {
      kidHeadline = "Strong scan! Ready for tougher missions.";
    } else if (growthCount > 0) {
      kidHeadline = "Scan complete. We found the best next skills to train.";
    }

    // Parent-facing summary (can mention bands carefully)
    const growthSkills = growth.map((id) => SKILL_BY_ID[id]);
    const parentHeadline =
      growthCount === 0
        ? `No major growth edges in scanned skills (${solidCount} solid). Keep building toward full 6th-grade number readiness.`
        : `Growth edges: ${growthSkills
            .slice(0, 5)
            .map((s) => s.name)
            .join(", ")}${growthCount > 5 ? "…" : ""}. Train those first — not a single “grade level.”`;

    const focusSkills = trainQueue.slice(0, 4);
    if (!focusSkills.length) {
      // default next
      ["frac-mixed-ops", "frac-mult", "dec-mult", "percent-intro"].forEach((id) => {
        if (map[id] && map[id].status !== "solid") focusSkills.push(id);
      });
    }

    return {
      map,
      solid,
      building,
      growth,
      trainQueue,
      focusSkills: focusSkills.slice(0, 4),
      kidHeadline,
      parentHeadline,
      scannedAt: new Date().toISOString(),
    };
  }

  function buildMission({ skillIds, level, weakSkills, placementFocus }) {
    let skills = skillIds && skillIds.length ? skillIds.slice() : ["frac-parts", "dec-place"];
    if (placementFocus && placementFocus.length) {
      // Blend: 60% placement focus, 40% mission theme
      skills = shuffle([
        ...placementFocus.slice(0, 3),
        ...skills.slice(0, 2),
      ]);
    }
    const weak = weakSkills || [];
    const questions = [];

    for (let i = 0; i < 3; i++) {
      const pool = weak.length && Math.random() < 0.75 ? weak : skills;
      questions.push({
        ...generateQuestion(pick(pool), Math.max(1, level - 1)),
        phase: "warm-up",
      });
    }
    for (let i = 0; i < 8; i++) {
      questions.push({
        ...generateQuestion(pick(skills), level),
        phase: "quest",
      });
    }
    for (let i = 0; i < 2; i++) {
      questions.push({
        ...generateQuestion(pick(skills), level + 2),
        phase: "boss",
      });
    }
    return questions;
  }

  function buildPractice(skillId, level, count = 6) {
    return Array.from({ length: count }, () => ({
      ...generateQuestion(skillId, level),
      phase: "practice",
    }));
  }

  function missionForDay(dayIndex, placementFocus) {
    const base = MISSION_ROTATION[dayIndex % MISSION_ROTATION.length];
    if (placementFocus && placementFocus.length) {
      return {
        ...base,
        title: "Training Mission",
        focus: "your path",
        skills: placementFocus.slice(0, 3),
        desc: "Built from your Skill Scan · warm-up · quest · boss",
      };
    }
    return base;
  }

  function xpForLevel(level) {
    return 40 + (level - 1) * 25;
  }

  function domainLabel(domain) {
    return (
      {
        foundations: "Foundations",
        fractions: "Fractions",
        decimals: "Decimals",
        mixed: "Connections",
        ratio: "Percents & ratios",
      }[domain] || domain
    );
  }

  global.MathMissionCurriculum = {
    SKILLS,
    SKILL_BY_ID,
    BASE_MODULES,
    MISSION_ROTATION,
    generateQuestion,
    buildMission,
    buildPractice,
    buildSkillScan,
    createScanQuestionList,
    analyzeScan,
    statusFromRate,
    statusLabel,
    masteryFromStats,
    missionForDay,
    xpForLevel,
    domainLabel,
  };
})(window);
