# Leo's Math Mission

A fun, iPad-friendly daily math app to help Leo catch up on **fractions** and **decimals** before / during 6th grade.

Built as a web app — no App Store, no account. Progress saves on the iPad in the browser.

## What it is

- **Skill Scan** (~12–18 min): maps skills as Solid / Building / Growth edge — **never a grade-level label for Leo**
- **Tonight's Mission** (~15–20 min): warm-up → quest → boss, biased toward his growth edges
- **Skill paths**: foundations (facts, place value), fractions, decimals, connections, percents
- **XP, levels, streaks, Number Base unlocks**
- **Parent view** (📊): skill map with optional “typical intro band” for *you only* + session history

See **ASSESSMENT.md** for how placement works and how Khan / free tutoring diagnostics fit in.

Montessori-friendly: Leo chooses paths; the scan only sets a smart default.

## Put it on Leo's iPad

### Fastest (same Wi‑Fi)

On your PC, in this folder:

```powershell
cd "C:\Users\justi\Desktop\CLAUDE COWORK\PROJECTS\Family\Leo\MathMission"
python -m http.server 8765
```

On the iPad Safari, open:

`http://YOUR-PC-IP:8765`

(Find your PC IP: `ipconfig` → IPv4 address.)

Then **Share → Add to Home Screen** so it feels like a real app.

### Always available

- Upload this folder to Google Drive / Dropbox and open `index.html` (some browsers restrict local files; a simple host is more reliable)
- Or deploy free on [Netlify Drop](https://app.netlify.com/drop) / GitHub Pages and bookmark the URL
- Or AirDrop / cable-copy the folder and use a simple local server app

### Tips

- Use **Safari**, not Chrome, for best “Add to Home Screen” on iPad
- Progress is stored **on that iPad** (localStorage). Clearing Safari data wipes it
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
