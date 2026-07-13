# Leo's Math Mission

A fun, iPad-friendly daily math app to help Leo catch up on **fractions** and **decimals** before / during 6th grade.

## Live URL (use this on Leo’s iPads)

**https://justinvogel.github.io/leo-math-mission/**

Works at Dad’s or Mom’s house — any Wi‑Fi. No App Store.

### Put it on the home screen (best experience)

1. Open the link in **Safari** on the iPad  
2. Tap **Share** → **Add to Home Screen**  
3. Open from the new icon next time  

### Progress on both iPads (automatic)

Leo is the only player. Progress **auto-saves to the cloud** — no codes, no accounts, no setup.

Open the same URL on Dad’s or Mom’s iPad. The app loads and merges his progress in the background.

Needs Wi‑Fi to sync; offline it keeps going locally and catches up next time.

## What it is

- **Skill Scan** (~12–18 min): maps skills as Solid / Building / Growth edge — **never a grade-level label for Leo**
- **Tonight's Mission** (~15–20 min): warm-up → quest → boss, biased toward his growth edges
- **Skill paths**: foundations (facts, place value), fractions, decimals, connections, percents
- **XP, levels, streaks, Number Base unlocks**
- **Parent view** (📊): skill map with optional “typical intro band” for *you only* + session history

See **ASSESSMENT.md** for how placement works and how Khan / free tutoring diagnostics fit in.

Montessori-friendly: Leo chooses paths; the scan only sets a smart default.

## Local development

```powershell
cd "C:\Users\justi\Desktop\CLAUDE COWORK\PROJECTS\Family\Leo\MathMission"
python -m http.server 8765
```

Open `http://localhost:8765`

### Deploy updates

```powershell
git add -A
git commit -m "Update Math Mission"
git push
```

GitHub Pages rebuilds in about a minute: https://justinvogel.github.io/leo-math-mission/

### Tips

- Use **Safari** for best “Add to Home Screen” on iPad  
- Progress is **per device** (not cloud-synced yet). One iPad that travels = ideal  
- Dad nights: one mission after dinner is enough. Miss a day? Streak resets; skill progress stays

## Suggested routine (15–30 min)

1. **Mission** (main path) — most nights  
2. If he wants more, one **skill chip** practice round  
3. Optional real-world closer: recipe halves, store prices, sports stats  

Pair with (not instead of) whatever diagnostic/tutoring you set up — this is the daily reps layer.

## Files

| File | Role |
|------|------|
| `index.html` | Shell / screens |
| `styles.css` | iPad-first dark UI |
| `curriculum.js` | Problem generators |
| `app.js` | Game loop, XP, parent view |
| `manifest.json` | Add-to-home-screen metadata |

## Reset

Parent view → **Reset all progress** (only if you mean it).
