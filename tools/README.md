# Gallery auto-sync tools (§26)

Keep this static gallery in sync with **Akashic** (the source of truth for every effect).
Ra builds effects locally → uploads → they become `code_pattern` cards; this tooling pulls
those cards back down and rebuilds the gallery.

## Files
- **`export-gallery.cjs`** — orchestrator. Reads `manifest.json`, fetches each effect card
  from the Akashic API, writes `<slug>/index.html` (= `core_payload.code`), refreshes
  `<slug>/meta.json` (preserves build params, refreshes card prose), writes `<slug>/thumb.png`
  (frame 0 of the preview GIF; keeps existing; placeholder if no GIF), then runs `build-gallery.cjs`.
- **`build-gallery.cjs`** — Ra's gallery template/generator (presentation layer). Reads
  `<FX_DIR>/<slug>/{meta.json,thumb.png,index.html}` → emits the top-level `index.html`.
  Patched (§26): reads `tier` from `meta.json` when present, else falls back to `tierOf(slug)`.
- **`manifest.json`** — slug ↔ tier ↔ card_number ↔ preview_file map (cards don't store a slug).

## Run locally
```bash
cd tools
npm install
AKASHIC_API_KEY=<read-scoped key> LIMIT=3 node export-gallery.cjs   # LIMIT for a quick test
AKASHIC_API_KEY=<key> node export-gallery.cjs                       # full sync (324 effects)
```
Env: `AKASHIC_API_KEY` (required, read scope), `AKASHIC_BASE` (default prod), `GALLERY_DIR`
(default repo root), `LIMIT` (first N), `REFRESH_THUMBS=1` (regenerate every thumb from GIF).

## Automation
`.github/workflows/sync-from-akashic.yml` runs this every 6h + on manual dispatch, commits +
pushes if anything changed → `pages.yml` redeploys.

**Setup (one-time, Alex):** add repo secret **`AKASHIC_API_KEY`** (a *read-scoped* key) under
Settings → Secrets and variables → Actions. Nothing else is needed — everything is same-repo
(no cross-repo token).

## Notes
- `*.gif` stays out of this repo (kept light); tiles use `thumb.png`, click → live iframe.
- Deterministic: re-running only changes files whose card content actually changed.
- New effect with no preview GIF (e.g. some audio effects) → tier-tinted placeholder thumb +
  logged; add a preview GIF on the card to get a real thumbnail next sync.
