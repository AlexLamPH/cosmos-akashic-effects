# Cosmos Akashic — Effect Library

**231 self-contained web effects** in the Cosmos *Phantom* aesthetic — Canvas-2D animations,
WebGL/GLSL shaders, polished UI components, and playable Web-Audio instruments. Every effect is
**one HTML file, zero dependencies, zero build step**. Open it, embed it, or copy it. Runs offline.

> Brand: **Cosmos AI Lab**. Accents — violet `#8b5cff`, cosmic `#46b4ff`, nebula `#ff5cc2`,
> aurora `#36d39a`, solaris `#ff6a3d`, sacred `#e0b24a`. Background Phantom-dark `#05030d` / `#0a0816`.

## Gallery

Open **[`index.html`](./index.html)** in any browser — a filterable showcase of all effects
(filter by tier, search by name/tag, click a tile to run it live). No server needed. In the live
preview, hit **⧉ Embed** to copy a ready-to-paste `<iframe>` snippet for that effect.

## Tiers

| Tier | Count | What it is |
|------|-------|------------|
| **Canvas 2D** | 133 | Deterministic, seamless looping animations (Canvas 2D). Backgrounds, loaders, sci-fi, sacred geometry, text FX. |
| **Shaders** | 15 | Real WebGL/GLSL fragment shaders — raymarch, fractals, plasma, tunnels, volumetric. |
| **UI** | 51 | Drop-in UI components — toast, modal, tabs, table, date-picker, pricing, login… interactive + animated. |
| **Audio** 🔊 | 32 | **Playable instruments that make real sound** via Web Audio — synth, drums, theremin, handpan, sequencers… |

## How to use an effect (vanilla — pick one)

Every effect lives in `./<slug>/index.html`. Three ways to drop it into your own page:

**1. Embed as an iframe** (simplest, fully isolated)
```html
<iframe src="cosmos-fx/domain-warp/index.html"
        style="border:0;width:100%;height:100%" loading="lazy"></iframe>
```

**2. Copy the folder** — it's self-contained; just reference its `index.html`. Nothing to install.

**3. Inline it** — open the file, copy the `<canvas>`/markup + the `<script>` into your page.
Each effect exposes a `render(t)` / `frame(t)` function driven purely by time, so you can host it
on your own animation loop.

### Audio effects
Audio instruments (`audio` tier) play **real sound on the first click/keypress** (browser autoplay
policy). Each one's `usage_notes` (in its `meta.json`) lists exactly how to play it (which keys / mouse).

## Capture / automation

Every effect supports a deterministic, silent capture mode for generating GIFs or thumbnails:
```
yourpage/<slug>/index.html?auto=1     →  window.__seek(timeMs) sets an exact frame; window.__ready signals load
```
`render(t)` is a pure function of time and loops seamlessly over the effect's `LOOP` (in `meta.json`),
so `frame(0) === frame(LOOP)`.

## Metadata

Each `./<slug>/meta.json` carries: `title`, `title_vi`, `W`, `H`, `LOOP`, `tags`, `summary`,
`usage_notes` (run + technique + tuning knobs), and Vietnamese summaries. The gallery and any
tooling read from these.

## Regenerate the gallery

After adding/removing an effect folder:
```
node /home/user/factory/build-gallery.cjs
```
It rescans every `meta.json`, re-classifies tiers, and rewrites `index.html`.

## License

MIT — see [`LICENSE`](./LICENSE). Free for personal and commercial use; attribution appreciated.

---
*Built by Cosmos AI Lab. Phantom collection.*
