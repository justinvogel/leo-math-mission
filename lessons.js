/**
 * Short teach-me lessons for each skill.
 * Kid-friendly, visual-first. Optional Khan deep links for more.
 */
(function (global) {
  "use strict";

  const LESSONS = {
    "mult-facts": {
      title: "Multiplication Facts",
      emoji: "⚡",
      hook: "Multiplication is fast adding of equal groups.",
      steps: [
        "3 × 4 means three groups of four: 4 + 4 + 4.",
        "That’s 12. The × sign just means “groups of.”",
        "Fact families help: if 3 × 4 = 12, then 4 × 3 = 12 too.",
      ],
      example: {
        prompt: "Think: 5 × 6",
        show: "Five groups of 6 → 6+6+6+6+6 = 30",
      },
      tryIt: "Say out loud: “____ groups of ____.”",
      khan: "https://www.khanacademy.org/math/arithmetic-home/multiply-divide",
      khanLabel: "Khan: Multiply & divide",
    },
    "div-facts": {
      title: "Division Facts",
      emoji: "➗",
      hook: "Division asks: how many equal groups? Or how many in each group?",
      steps: [
        "12 ÷ 3 means “split 12 into 3 equal groups.”",
        "Each group gets 4, so 12 ÷ 3 = 4.",
        "It’s the flip of multiply: 3 × 4 = 12, so 12 ÷ 3 = 4.",
      ],
      example: {
        prompt: "Think: 20 ÷ 5",
        show: "How many 5s fit in 20? Four times. Answer: 4.",
      },
      tryIt: "For any ÷ problem, ask: “What times the bottom equals the top?”",
      khan: "https://www.khanacademy.org/math/arithmetic-home/multiply-divide",
      khanLabel: "Khan: Multiply & divide",
    },
    "place-whole": {
      title: "Whole-Number Place Value",
      emoji: "🔢",
      hook: "Every digit has a job based on where it sits.",
      steps: [
        "From the right: ones, tens, hundreds, thousands…",
        "In 3,482 the 8 is tens (80), the 4 is hundreds (400).",
        "Moving left multiplies by 10 each step.",
      ],
      example: {
        prompt: "Number: 5,670",
        show: "6 is in the hundreds place → 600.",
      },
      tryIt: "Pick any digit and name its place out loud.",
      khan: "https://www.khanacademy.org/math/arithmetic-home/arith-review-place-value",
      khanLabel: "Khan: Place value",
    },
    "mult-multi": {
      title: "Multi-Digit Multiply",
      emoji: "✖️",
      hook: "Break big multiplies into pieces you already know.",
      steps: [
        "23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.",
        "Write numbers stacked, multiply ones first, then tens.",
        "Keep place value lined up so nothing drifts.",
      ],
      example: {
        prompt: "15 × 6",
        show: "10×6=60, 5×6=30, total 90.",
      },
      tryIt: "Split the bigger number into tens + ones, then add.",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-review-multiply-divide",
      khanLabel: "Khan: Multi-digit multiply",
    },
    "div-multi": {
      title: "Multi-Digit Divide",
      emoji: "📐",
      hook: "Division is “how many fit?” — one chunk at a time.",
      steps: [
        "84 ÷ 4: how many 4s in 8 tens? Two → write 2, bring down.",
        "Or think: 4 × ? = 84. Try 20 → 80, need 4 more → 21.",
        "Check by multiplying your answer times the divisor.",
      ],
      example: {
        prompt: "36 ÷ 3",
        show: "3×12=36, so the answer is 12. Always check!",
      },
      tryIt: "Guess a product, then adjust up or down.",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-review-multiply-divide",
      khanLabel: "Khan: Multi-digit divide",
    },
    "frac-parts": {
      title: "Parts of a Whole",
      emoji: "🍕",
      hook: "A fraction is a fair share of something cut into equal pieces.",
      steps: [
        "Bottom number (denominator) = how many equal pieces the whole is cut into.",
        "Top number (numerator) = how many of those pieces you have.",
        "3/8 means: cut into 8 equal pieces, take 3 of them.",
      ],
      example: {
        prompt: "Pizza cut into 4. You eat 1 slice.",
        show: "You ate 1/4. Three slices left is 3/4.",
      },
      tryIt: "Draw a bar, split it into equal parts, shade some.",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-fractions-intro",
      khanLabel: "Khan: Intro to fractions",
    },
    "frac-equiv": {
      title: "Equivalent Fractions",
      emoji: "🔁",
      hook: "Same amount of pizza — different-looking slices.",
      steps: [
        "1/2 of a pizza is the same as 2/4 or 4/8.",
        "Multiply (or divide) top and bottom by the same number.",
        "1/2 × (2/2) = 2/4. You didn’t change the amount — only the cut size.",
      ],
      example: {
        prompt: "Is 3/6 equal to 1/2?",
        show: "Divide top and bottom of 3/6 by 3 → 1/2. Yes!",
      },
      tryIt: "Make three fractions equal to 1/3 by multiplying by 2, 3, 4.",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-equivalent-fractions",
      khanLabel: "Khan: Equivalent fractions",
    },
    "frac-compare": {
      title: "Compare Fractions",
      emoji: "⚖️",
      hook: "Which share is bigger? Line them up fairly.",
      steps: [
        "Same bottom? Bigger top wins (3/8 > 2/8).",
        "Same top? Smaller bottom wins (1/3 > 1/5) — pieces are larger.",
        "Different both? Convert to the same denominator, or compare to 1/2.",
      ],
      example: {
        prompt: "3/4 vs 2/3",
        show: "Common bottom 12: 9/12 vs 8/12 → 3/4 is larger.",
      },
      tryIt: "Ask: is each above or below half?",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-fractions-comparing",
      khanLabel: "Khan: Comparing fractions",
    },
    "frac-add-sub": {
      title: "Add & Subtract (Same Denominator)",
      emoji: "➕",
      hook: "Same-size pieces: just add or subtract the counts.",
      steps: [
        "If bottoms match, keep that bottom.",
        "2/7 + 3/7 = 5/7 (2 pieces + 3 pieces of sevenths).",
        "5/8 − 2/8 = 3/8. Simplify if you can at the end.",
      ],
      example: {
        prompt: "1/5 + 2/5",
        show: "Same fifths → 3/5.",
      },
      tryIt: "Never add the bottoms when they’re already the same!",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-add-sub-fractions",
      khanLabel: "Khan: Add & subtract fractions",
    },
    "frac-mixed-ops": {
      title: "Unlike Denominators",
      emoji: "🧩",
      hook: "You can’t add different-size pieces until you cut them the same.",
      steps: [
        "Find a common denominator (a shared multiple of both bottoms).",
        "1/2 + 1/3 → bottoms 2 and 3 → common is 6.",
        "1/2 = 3/6, 1/3 = 2/6, so 3/6 + 2/6 = 5/6.",
      ],
      example: {
        prompt: "1/4 + 1/2",
        show: "1/2 = 2/4, so 1/4 + 2/4 = 3/4.",
      },
      tryIt: "Rewrite both fractions with the same bottom before + or −.",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-add-sub-fractions",
      khanLabel: "Khan: Unlike denominators",
    },
    "frac-mult": {
      title: "Multiply Fractions",
      emoji: "✳️",
      hook: "“Of” often means multiply. 1/2 of 1/3 is a piece of a piece.",
      steps: [
        "Multiply tops together. Multiply bottoms together.",
        "2/3 × 4/5 = 8/15.",
        "Simplify before or after — both OK.",
      ],
      example: {
        prompt: "1/2 × 1/4",
        show: "Half of a quarter is one eighth → 1/8.",
      },
      tryIt: "Draw a square, shade 1/2 one way, then 1/3 of that.",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-mult-div-fractions",
      khanLabel: "Khan: Multiply fractions",
    },
    "frac-div": {
      title: "Divide Fractions (Intro)",
      emoji: "🔄",
      hook: "Dividing by a fraction asks: how many of these fit?",
      steps: [
        "How many 1/2s fit in 3? Six half-pieces fit in 3 wholes.",
        "Shortcut: multiply by the flip (reciprocal).",
        "3 ÷ 1/2 = 3 × 2/1 = 6.",
      ],
      example: {
        prompt: "1/2 ÷ 1/4",
        show: "How many quarters in a half? Two. Or 1/2 × 4/1 = 2.",
      },
      tryIt: "Flip the second fraction, then multiply.",
      khan: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/arith-review-mult-div-fractions",
      khanLabel: "Khan: Divide fractions",
    },
    "dec-place": {
      title: "Decimal Place Value",
      emoji: "📍",
      hook: "Decimals continue the place-value chart to the right of the point.",
      steps: [
        "Just right of the point: tenths (0.1).",
        "Next: hundredths (0.01), then thousandths (0.001).",
        "0.37 = 3 tenths + 7 hundredths.",
      ],
      example: {
        prompt: "In 4.582, which digit is hundredths?",
        show: "5 is tenths, 8 is hundredths, 2 is thousandths.",
      },
      tryIt: "Say decimals out loud: 0.4 is “four tenths.”",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-decimals",
      khanLabel: "Khan: Decimals",
    },
    "dec-compare": {
      title: "Compare Decimals",
      emoji: "📊",
      hook: "Line up the decimal points, then compare place by place.",
      steps: [
        "Compare tenths first, then hundredths, then thousandths.",
        "0.4 vs 0.35 → think 0.40 vs 0.35 → 0.40 is larger.",
        "Extra zeros after the last digit don’t change value (0.50 = 0.5).",
      ],
      example: {
        prompt: "0.6 vs 0.58",
        show: "0.60 vs 0.58 → 0.6 is larger.",
      },
      tryIt: "Write both with the same number of decimal places.",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-decimals",
      khanLabel: "Khan: Compare decimals",
    },
    "frac-dec": {
      title: "Fractions ↔ Decimals",
      emoji: "🔀",
      hook: "Two languages for the same amount.",
      steps: [
        "Fraction → decimal: divide top by bottom (1÷2 = 0.5).",
        "Decimal → fraction: 0.3 = 3/10, 0.25 = 25/100 = 1/4.",
        "Memorize common friends: 1/2=0.5, 1/4=0.25, 3/4=0.75, 1/5=0.2.",
      ],
      example: {
        prompt: "3/4 as a decimal",
        show: "3÷4 = 0.75.",
      },
      tryIt: "Flash yourself: 0.2 ↔ ?  1/4 ↔ ?",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-review-decimals/arith-review-decimals-to-fractions",
      khanLabel: "Khan: Fractions & decimals",
    },
    "dec-ops": {
      title: "Decimal Add & Subtract",
      emoji: "🧮",
      hook: "Line up the points — then it’s like whole numbers.",
      steps: [
        "Stack numbers so decimal points are in a straight column.",
        "Fill empty places with zeros if it helps (3.2 → 3.20).",
        "Add or subtract as usual; bring the point straight down.",
      ],
      example: {
        prompt: "1.4 + 2.35",
        show: "1.40 + 2.35 = 3.75.",
      },
      tryIt: "Always write the point in the answer before you add.",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-decimals/arith-review-add-decimals",
      khanLabel: "Khan: Add/subtract decimals",
    },
    "dec-mult": {
      title: "Decimal Multiply",
      emoji: "💥",
      hook: "Multiply as whole numbers, then place the point.",
      steps: [
        "Ignore points, multiply (0.3 × 4 → think 3 × 4 = 12).",
        "Count total digits after points in the factors (0.3 has 1).",
        "Put that many digits after the point in the answer (1.2).",
      ],
      example: {
        prompt: "0.5 × 6",
        show: "5×6=30, one decimal place → 3.0 which is 3.",
      },
      tryIt: "Count decimal digits first so you don’t lose the point.",
      khan: "https://www.khanacademy.org/math/arithmetic/arith-decimals/arith-review-mul-decimals",
      khanLabel: "Khan: Multiply decimals",
    },
    "word-mixed": {
      title: "Story Missions",
      emoji: "📖",
      hook: "Stories hide the same fraction/decimal moves you already know.",
      steps: [
        "Underline what you’re asked for (left over? total? change?).",
        "Sketch a bar, money, or trail if the words feel messy.",
        "Do the math, then check: does the answer make sense in the story?",
      ],
      example: {
        prompt: "Pizza 8 slices, ate 3. Fraction left?",
        show: "5 left → 5/8.",
      },
      tryIt: "Retell the story in one short math sentence.",
      khan: "https://www.khanacademy.org/math/cc-fifth-grade-math",
      khanLabel: "Khan: Grade 5 word problems",
    },
    "percent-intro": {
      title: "Percent Basics",
      emoji: "💯",
      hook: "Percent means “per 100” — out of a hundred.",
      steps: [
        "50% = 50/100 = 1/2 = 0.5.",
        "25% = 1/4 = 0.25. 10% = 1/10 = 0.1.",
        "To go percent → decimal, move the point two left (40% → 0.40).",
      ],
      example: {
        prompt: "What fraction is 75%?",
        show: "75/100 = 3/4.",
      },
      tryIt: "Memorize: 50%, 25%, 10%, 1% as fraction and decimal.",
      khan: "https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-percentages",
      khanLabel: "Khan: Percentages",
    },
    "puzzle-lab": {
      title: "Puzzle Lab",
      emoji: "🧩",
      hook: "Games that hide fraction and decimal practice inside matching and memory.",
      steps: [
        "Match games pair values that mean the same amount.",
        "Use patterns and elimination — same brain as Sudoku and Pips.",
        "Wrong matches bounce back; only true pairs stick.",
      ],
      example: {
        prompt: "1/2 pairs with…",
        show: "0.5 or 50% — same amount, different look.",
      },
      tryIt: "Open Match Up and clear the board.",
      khan: null,
      khanLabel: null,
    },
  };

  function getLesson(skillId) {
    return LESSONS[skillId] || null;
  }

  function lessonIds() {
    return Object.keys(LESSONS);
  }

  global.MathMissionLessons = {
    LESSONS,
    getLesson,
    lessonIds,
  };
})(window);
