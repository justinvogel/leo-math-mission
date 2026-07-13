/**
 * Real matching game for Puzzle Lab
 * Flip cards: match equivalent values (fraction ↔ decimal ↔ percent)
 */
(function (global) {
  "use strict";

  const PAIRS = [
    { a: "1/2", b: "0.5", skill: "frac-dec" },
    { a: "1/4", b: "0.25", skill: "frac-dec" },
    { a: "3/4", b: "0.75", skill: "frac-dec" },
    { a: "1/5", b: "0.2", skill: "frac-dec" },
    { a: "2/5", b: "0.4", skill: "frac-dec" },
    { a: "1/10", b: "0.1", skill: "frac-dec" },
    { a: "3/10", b: "0.3", skill: "frac-dec" },
    { a: "1/2", b: "50%", skill: "percent-intro" },
    { a: "1/4", b: "25%", skill: "percent-intro" },
    { a: "3/4", b: "75%", skill: "percent-intro" },
    { a: "1/5", b: "20%", skill: "percent-intro" },
    { a: "0.5", b: "50%", skill: "percent-intro" },
    { a: "2/4", b: "1/2", skill: "frac-equiv" },
    { a: "2/8", b: "1/4", skill: "frac-equiv" },
    { a: "3/6", b: "1/2", skill: "frac-equiv" },
    { a: "0.25", b: "1/4", skill: "frac-dec" },
    { a: "0.2", b: "1/5", skill: "frac-dec" },
    { a: "4/8", b: "0.5", skill: "frac-dec" },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickPairs(count) {
    const pool = shuffle(PAIRS);
    const used = new Set();
    const out = [];
    for (const p of pool) {
      const key = [p.a, p.b].sort().join("|");
      if (used.has(key)) continue;
      // avoid duplicate face values on board that confuse pairing
      if (used.has("L:" + p.a) || used.has("R:" + p.b)) continue;
      if (used.has("L:" + p.b) || used.has("R:" + p.a)) continue;
      used.add(key);
      used.add("L:" + p.a);
      used.add("R:" + p.b);
      out.push(p);
      if (out.length >= count) break;
    }
    return out;
  }

  /**
   * Build a board of 2N cards (N pairs)
   * pairCount: 4, 5, or 6 → 8 / 10 / 12 cards
   */
  function createBoard(pairCount) {
    const n = Math.min(6, Math.max(4, pairCount || 6));
    const pairs = pickPairs(n);
    const cards = [];
    pairs.forEach((p, pi) => {
      const pairId = "p" + pi;
      cards.push({
        id: pairId + "a",
        pairId,
        label: p.a,
        skill: p.skill,
      });
      cards.push({
        id: pairId + "b",
        pairId,
        label: p.b,
        skill: p.skill,
      });
    });
    return {
      pairs: pairs.length,
      cards: shuffle(cards),
      skills: [...new Set(pairs.map((p) => p.skill))],
    };
  }

  global.MathMissionMatchGame = {
    createBoard,
    PAIRS,
  };
})(window);
