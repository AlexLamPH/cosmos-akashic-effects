# PUSH ME → AlexLamPH/cosmos-akashic-effects

This folder is the **complete, ready-to-push** Cosmos Akashic effect gallery (324 self-contained
effects + the showcase `index.html` + README + LICENSE + a GitHub Pages workflow). GIFs are intentionally
excluded (tiles use `thumb.png`; click a tile to run the effect live). It is **~36 MB**, no build step.

## Task: push this to the empty repo and enable Pages

Target repo (already created, empty, public): **`https://github.com/AlexLamPH/cosmos-akashic-effects`**

### 1. Push (from inside this folder)
```bash
cd cosmos-deploy            # this folder
git init -b main
git add .
git commit -m "Cosmos Akashic — 324-effect gallery (Canvas/Shader/UI/Audio/Remix/Games/Reactive)"
git remote add origin https://github.com/AlexLamPH/cosmos-akashic-effects.git
git push -u origin main
```
(If the remote rejects an empty-repo push, add `--force` to the push — the repo is empty so nothing is lost.)

### 2. Enable GitHub Pages
- GitHub → repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- The included `.github/workflows/pages.yml` runs on the first push and deploys the whole folder.
- After it finishes, the gallery is live at: **`https://alexlamph.github.io/cosmos-akashic-effects/`**

### 3. Report back to Alex
- The Pages URL, and that the gallery loads (tiles show, clicking a tile runs the effect live, the
  **⧉ Embed** button copies an iframe snippet).

## What's inside
- `index.html` — the filterable gallery (tiers: Canvas / Shader / UI / Audio / Remix / Games / Reactive).
- `<slug>/index.html` + `<slug>/meta.json` + `<slug>/thumb.png` — one folder per effect (324 total),
  each a single self-contained HTML file, zero dependencies, runs offline.
- `README.md`, `LICENSE` (MIT), `.gitignore` (ignores `*.gif`), `.github/workflows/pages.yml`.

## Notes
- Do **not** add the GIFs — they live on Akashic and would bloat the repo to ~1 GB.
- Everything is static; no server, no env vars, no secrets. Safe to make the repo public.
- Owner/handle assumed `AlexLamPH`; if the Pages URL differs, just report the actual `page_url` from the
  Actions run.

— Prepared by Ra (Cosmos AI Lab) for a hand-off push.
