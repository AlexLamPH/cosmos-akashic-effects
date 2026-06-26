---
name: ra-design-pipeline
description: >
  Ra's pipeline for producing PREMIUM, professional visual design for Cosmos AI Lab by
  orchestrating AI image generation + code — NOT hand-drawing SVG/CSS (which produced amateur
  results). Use for ANY user-facing UI/UX visual: membership/credential cards, banners, hero
  art, avatars, textures, backgrounds, "make this look premium / modern / pro", or whenever a
  hand-coded design came out ugly. Ships verified image-gen + image-edit scripts, a
  premium-design checklist, and CAL Brand DNA anchoring. Load this before designing anything a
  user will see.
---

# Ra Design Pipeline — image-gen + code, art-director method

> **Why this exists** (Alex, 2026-06-26): Ra kept *hand-drawing* card art / ornaments in SVG/CSS
> and the results looked amateur ("xấu om… như thập niên 1960"). The fix is not "try harder at
> drawing" — it is **changing medium and role**. Premium AI designs are *generated raster art*
> refined + composed with code. Ra's job is **art director / integrator**, not a freehand
> illustrator. Alex's words: *"Agent tạo ảnh card (đẹp hơn nhiều là code ra), rồi bạn chỉnh sửa,
> thiết kế lại trên ảnh đó… bạn tạo một workflow nhiều bước, giao nhiều sub-agent, bạn tổng hợp,
> thiết kế cuối."*

## Core mindset (do not forget after a compact)

1. **Art director, not hand-drawer.** Generate the art layer with an image model; never fake
   illustration/textures/avatars/ornaments in raw SVG/CSS. Use code for *layout, type, interaction*.
2. **Reference-first, always.** Before designing, study 3–5 premium references (real product +
   Apple / Linear / Stripe / Awwwards / Mobbin). Write down palette, grid, ONE focal point,
   spacing, type scale BEFORE touching anything.
3. **Subtract, don't add.** Every ugly Ra design came from *adding* (3 stacked images, thick gold
   border, ornate flourish). Premium = restraint: ≤3 colours, ONE focal element, lots of negative space.
4. **Right medium per layer.** Hero art / avatar / texture / emblem → generated raster. Layout /
   text / responsive / a11y → code. Live UI must be real HTML — never ship a flat PNG as the app UI.
5. **Two-tier quality gate.** Technical *effect samples* (gallery) may be rough — people copy the
   technique, not the look. *User-facing UI/UX* used daily → MUST pass the full pipeline below.
6. **Self-critique before Alex sees it.** Render real pixels, place beside the reference, ask
   "*does this look like it came from the same studio?*" If no, it does NOT reach Alex.

## The pipeline (5 steps)

| # | Who | Step |
|---|-----|------|
| 1 | Ra + research sub-agent | **Brief & reference.** Pull premium refs, extract palette/grid/focal/type. Lock to CAL Brand DNA (`AK-CDP-00000CV`). |
| 2 | image-gen (fan-out) | **Generate** N candidate assets from carefully engineered prompts (`scripts/generate.py`). |
| 3 | Ra (or judge sub-agents) | **Critique & select.** Score against brief + reference; drop weak ones BEFORE showing Alex. |
| 4 | **Ra (lead)** | **Composite & build.** Refine the winner on the image (`scripts/edit.py`) + build the live UI in code with CAL tokens. Add REAL text here. |
| 5 | render + judge | **Render & final judge.** Render pixels (Playwright→PNG), compare to reference, loop if needed. |

For multi-asset / multi-variant jobs, drive steps 2–3 with the **Workflow tool** (fan-out
sub-agents) — Alex explicitly approved orchestrating sub-agents with Ra as final designer.

## Tools (VERIFIED 2026-06-26 — Alibaba DashScope via `ALIBABA_API_KEY`)

Both legs proven end-to-end (submitted, polled, downloaded real PNGs).

```bash
# TEXT → IMAGE  (async: submit → poll → download). Quality model:
python3 .claude/skills/ra-design-pipeline/scripts/generate.py \
  --model wan2.2-t2i-plus --size 768*1152 --out-dir /tmp/art \
  --prompt "premium matte-black credential card, single burnt-amber accent, cyber-vortex inset, studio render" \
  --prompt "second variation here..."        # repeat --prompt for a batch

# EDIT ON THE IMAGE  (sync, instruction-based). Feed a URL (proven) or local path (base64):
python3 .claude/skills/ra-design-pipeline/scripts/edit.py \
  --image "<url-from-generate-manifest>" --out /tmp/art/clean.png \
  --instruction "remove all text, keep the vortex, clean matte black brushed metal, premium"
```

Verified models — **probe again if "Model not exist" (DashScope renames often):**
- text2image: `wan2.2-t2i-plus` (best), `wan2.2-t2i-flash` (fast). Endpoint `…/aigc/text2image/image-synthesis`, header `X-DashScope-Async: enable`, poll `…/api/v1/tasks/<id>`.
- image-edit: `qwen-image-edit`. Endpoint `…/aigc/multimodal-generation/generation` (sync). Source image as URL (proven) or `data:image/...;base64,...`.
- International endpoint: `https://dashscope-intl.aliyuncs.com`. (China host `dashscope.aliyuncs.com` exposes more models, incl. `wanx2.1-imageedit`, if ever needed.)
- Sizes (t2i): `1024*1024`, `768*1152` (portrait card), `1152*768`, `720*1280`.

## Premium design checklist (distilled from pro references)

Pro banners/cards share a SYSTEM, not luck:
- **≤ 3 colours.** (e.g. matte black + one accent + white.) No rainbow except the CAL logo.
- **ONE focal element**, everything else flat/quiet. Don't let things compete.
- **Consistent radius + spacing + ONE icon style** (single stroke weight, line-art).
- **Type hierarchy**: bold display / caps mono label / muted body — repeated identically.
- **Generous negative space** + connective tissue (a motif/line tying the composition together).
- **Anti-patterns** (Ra has burned these): thick gold borders, baroque ornament, 1960s look,
  stacking 3 images, clutter, garbled generated text shipped as-is.

## CAL Brand DNA anchor

`AK-CDP-00000CV` — Phantom Lab v2.0: pure black `#000000` + single burnt-amber `#FF8A1F` UI
accent, sharp corners (radius 0), Archivo Black wordmark, rainbow ONLY for the logo. **Decoration
MAY use other colours** (Alex, 2026-06-25). Fetch the card for the full token set when designing.

## Gotchas

- **Generated images always garble text.** NEVER ship gen text. Generate the *look*; add real
  text/labels in code (step 4). For a "blank" card face, edit out the text with `edit.py`.
- **Image-gen is hit-or-miss** → always generate a small batch, self-select the strong ones.
- Requires `ALIBABA_API_KEY` in env (CAL-provisioned). Outbound goes through the agent proxy; curl
  works without extra flags.
- Skills die with the container → this skill is **committed to the repo** so wake-up Ra finds it.

## Hard-won lessons — first shipped + approved product (2026-06-26)

The **Ra Diary Credential** (Akashic `AK-FIL-00000ED`) was the first product shipped with this
pipeline and **APPROVED by Alex**. Repeat these:

1. **Do NOT generate a full card/poster that contains text zones.** The image model splits
   "card + emblem" into separate floating objects and garbles any text. Instead generate
   **single-subject assets** (a vortex orb, an emblem, a seamless texture) on a clean background,
   then **build the card layout + ALL text in code** (HTML/CSS + real fonts) and render to PNG.
   Art = generated; structure + type = code. This is the reliable combo.
2. **Real fonts for the render.** Google Fonts CDN is unreachable inside the Playwright sandbox →
   pre-fetch the `.ttf` via curl from `github.com/google/fonts/raw/main/ofl/<family>/...` and
   embed with a local `@font-face`. Used: Archivo Black (display), Inter (body/mono), Playfair
   Display italic (editorial mandate line).
3. **Render recipe.** Playwright is global at `/opt/node22/lib/node_modules` (run node with
   `NODE_PATH=/opt/node22/lib/node_modules node render.js`); chromium auto-found via
   `/opt/pw-browsers`. Use `deviceScaleFactor: 2` for crisp output and `await document.fonts.ready`
   before the screenshot.
4. **Delivery — never hand Alex an ephemeral link** (DashScope / GCS signed URLs expire = dead
   links). Upload the final asset to Akashic and give the permanent card:
   `curl -X POST .../api/files/upload -H "Authorization: Bearer $AKASHIC_API_KEY_RA" -F file=@final.png -F visibility=public -F "title=..." -F "tags=..."`
   → returns a permanent `AK-FIL-NNNNNNN`. Fetch a viewable URL with
   `GET /api/files/<card>/download?inline=1`. ALSO `SendUserFile` the local PNG so Alex sees it
   immediately regardless of links.
5. **"Workflow successful" = Alex approves the shipped PRODUCT** — not merely that the tooling ran
   or that concept images were generated. Ship → upload to Akashic → get sign-off.

## Provenance
Built + verified by Ra, 2026-06-26, after Alex's directive to "học design lại" and package the
working workflow as a skill that survives session compaction. Diary: `AK-DIA-000000D`.
