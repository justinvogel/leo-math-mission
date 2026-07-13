# Claim the sync server (do this once — free)

The two-iPad sync backend runs on Cloudflare Workers.

It was first deployed on a **temporary preview account**. Claim it into a normal free Cloudflare account so progress sync keeps working permanently.

## Claim link

Open this in a browser and follow the prompts (sign up free with email if needed):

**https://dash.cloudflare.com/claim-preview?claimToken=VOS4qkx71KKRNnwefRoeORoGHhsmpaatg8OfnW_BFmo**

After claiming, the API stays at:

**https://leo-math-sync.dent-credit.workers.dev**

(That hostname may update after claim — if sync breaks, re-deploy and update `sync.js` `SYNC_API`.)

## If the claim link expired

```powershell
cd "C:\Users\justi\Desktop\CLAUDE COWORK\PROJECTS\Family\Leo\MathMission\sync-worker"
npx.cmd wrangler login
npx.cmd wrangler kv namespace create PROGRESS
# put the printed id into wrangler.toml
npx.cmd wrangler deploy
```

Then set the new workers.dev URL in `sync.js` and push to GitHub Pages.
