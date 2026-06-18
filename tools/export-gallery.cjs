#!/usr/bin/env node
/* export-gallery.cjs — §26 auto-sync: Akashic (source of truth) → this gallery.
 *
 * Ra's build pipeline runs LOCAL → upload → card, so Akashic is the DESTINATION.
 * To keep this static gallery in sync we pull the cards back DOWN.
 *
 * SOURCE OF TRUTH = the API: every Cosmos `code_pattern` card (so effects ADDED to
 * Akashic later also sync, not just a frozen list). For each effect:
 *   - <slug>/index.html  = core_payload.code
 *   - <slug>/meta.json   = existing build params (W/H/LOOP/N) + refreshed card prose
 *   - <slug>/thumb.png   = frame 0 of the preview GIF (kept if present; placeholder if none)
 * then runs build-gallery.cjs (NOGIF=1) to regenerate the gallery index.html.
 *
 * slug/tier: cards don't store a slug → resolved from the card's curator_annotations
 * (.slug/.tier, once Ra backfills), else manifest.json, else slugify(title)+tier-from-tags.
 * Only PUBLIC effects are exported (never leak a private card into the public gallery).
 *
 * Deterministic → git only commits when content actually changed.
 *
 * Env: AKASHIC_API_KEY (required, read scope) · AKASHIC_BASE (default prod) ·
 *      GALLERY_DIR (default repo root) · LIMIT (first N, testing) ·
 *      REFRESH_THUMBS=1 (regenerate every thumb from GIF).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { GifReader } = require('omggif');
const { PNG } = require('pngjs');

const BASE = (process.env.AKASHIC_BASE || 'https://akashic.cosmos-ai-lab.com').replace(/\/+$/, '');
const KEY = process.env.AKASHIC_API_KEY;
const ROOT = process.env.GALLERY_DIR || path.resolve(__dirname, '..');
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0;
const REFRESH_THUMBS = process.env.REFRESH_THUMBS === '1';

if (!KEY) { console.error('AKASHIC_API_KEY required (Bearer, read scope).'); process.exit(1); }

const TIER_RGB = {
  canvas: [70, 180, 255], shader: [255, 92, 194], ui: [54, 211, 154],
  audio: [139, 92, 255], remix: [224, 178, 74], game: [255, 106, 61], reactive: [54, 211, 154]
};

async function getJson(url) {
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + KEY, Accept: 'application/json' } });
  if (!r.ok) throw new Error('GET ' + url + ' → ' + r.status);
  return r.json();
}

// File cards (AK-FIL) don't serve bytes directly — the download endpoint returns
// JSON { download_url: <signed GCS url> }. Fetch that, then the bytes (no auth on GCS).
async function getSignedFileBytes(fileCn) {
  const meta = await getJson(BASE + '/api/files/' + encodeURIComponent(fileCn) + '/download?inline=1');
  if (!meta || !meta.download_url) throw new Error('no download_url for ' + fileCn);
  const r = await fetch(meta.download_url, { redirect: 'follow' }); // signed URL — send NO auth header
  if (!r.ok) throw new Error('GCS GET → ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

// Every Cosmos code_pattern card, paginated. Title filter mirrors Ra's bundle.
async function listAllCosmosEffects() {
  const out = [];
  let offset = 0; const limit = 100;
  for (;;) {
    const d = await getJson(BASE + '/api/cards?type=code_pattern&limit=' + limit + '&offset=' + offset);
    const arr = d.cards || d.data || [];
    for (const c of arr) {
      if (!c.deleted_at && c.status !== 'quarantined' && /^Cosmos\s/i.test(c.title || '')) out.push(c);
    }
    offset += limit;
    if (arr.length === 0 || offset >= (d.total || 0)) break;
  }
  return out;
}

function slugify(title) {
  return String(title || '').replace(/^Cosmos\s+/i, '').split(/[—–]/)[0]
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'effect';
}

// Best-effort tier for cards not in the manifest (until Ra backfills curator_annotations.tier).
function tierFallback(tags, slug) {
  const t = (tags || []).map(function (x) { return String(x).toLowerCase(); });
  if (/^(micviz|webcam|tilt)-/.test(slug)) return 'reactive';
  if (/^game-/.test(slug)) return 'game';
  if (/^remix-/.test(slug)) return 'remix';
  if (t.some(function (x) { return /shader|webgl|glsl|raymarch/.test(x); })) return 'shader';
  if (t.some(function (x) { return /audio|webaudio|sound|synth|music/.test(x); })) return 'audio';
  if (t.some(function (x) { return /^(ui|component|form|button|input|widget)$/.test(x); })) return 'ui';
  return 'canvas';
}

// GIF first frame → PNG buffer (no headless browser: thumb == GIF frame 0).
function gifFrame0ToPng(gifBuf) {
  const gr = new GifReader(gifBuf);
  const w = gr.width, h = gr.height;
  const rgba = Buffer.alloc(w * h * 4);
  gr.decodeAndBlitFrameRGBA(0, rgba);
  const png = new PNG({ width: w, height: h });
  rgba.copy(png.data);
  return PNG.sync.write(png);
}

// Solid tier-tinted placeholder so an effect with no GIF + no existing thumb still
// shows (build-gallery.cjs skips any <slug> lacking thumb.png).
function placeholderPng(tier, w, h) {
  const c = TIER_RGB[tier] || [110, 110, 140];
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = Math.round(c[0] * 0.12 + 8);
    png.data[i + 1] = Math.round(c[1] * 0.12 + 6);
    png.data[i + 2] = Math.round(c[2] * 0.12 + 15);
    png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }

async function main() {
  const manifest = readJsonSafe(path.join(__dirname, 'manifest.json')) || { effects: [] };
  const mByCn = {};
  (manifest.effects || []).forEach(function (e) { mByCn[e.card_number] = e; });

  let cards = await listAllCosmosEffects();
  if (LIMIT > 0) cards = cards.slice(0, LIMIT);
  console.log('export-gallery: ' + cards.length + ' Cosmos code_pattern effects from ' + BASE + ' → ' + ROOT);

  const stats = { written: 0, thumbsNew: 0, thumbsKept: 0, placeholders: [], missingCode: [], skippedPrivate: [], errors: [] };

  for (const summary of cards) {
    const cn = summary.card_number;
    let slug = cn;
    try {
      const data = await getJson(BASE + '/api/cards/' + encodeURIComponent(cn));
      const card = data.card || data;
      const cp = card.core_payload || {};
      const ann = card.curator_annotations || {};
      const m = mByCn[cn] || {};
      slug = ann.slug || m.slug || slugify(card.title);
      const tier = ann.tier || m.tier || tierFallback(card.tags, slug);
      const previewFile = ann.preview_file || m.preview_file || null;

      if (card.visibility && card.visibility !== 'public') { stats.skippedPrivate.push(slug); continue; }
      if (typeof cp.code !== 'string' || !cp.code.trim()) { stats.missingCode.push(slug); continue; }

      const dir = path.join(ROOT, slug);
      fs.mkdirSync(dir, { recursive: true });

      // index.html = the effect's self-contained code (source of truth = the card)
      fs.writeFileSync(path.join(dir, 'index.html'), cp.code);

      // meta.json = preserve build params (W/H/LOOP/N) + refresh card-derived prose
      const prev = readJsonSafe(path.join(dir, 'meta.json')) || {};
      const meta = Object.assign({}, prev, {
        slug: slug,
        card_number: cn,
        tier: tier,
        title: card.title || prev.title || slug,
        title_vi: ann.title_vi || prev.title_vi || '',
        tags: Array.isArray(card.tags) ? card.tags : (prev.tags || []),
        summary: cp.summary || prev.summary || '',
        usage_notes: cp.usage_notes || prev.usage_notes || '',
        summary_vi: ann.summary_vi || prev.summary_vi || '',
        notes: ann.notes || prev.notes || ''
      });
      const lw = parseInt(ann.live_width, 10), lh = parseInt(ann.live_height, 10);
      if (lw > 0) meta.W = lw;
      if (lh > 0) meta.H = lh;
      fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

      // thumb.png — keep existing (cheap, deterministic) unless REFRESH_THUMBS;
      // else frame 0 of the preview GIF; no GIF + no thumb → tier placeholder.
      const thumbPath = path.join(dir, 'thumb.png');
      const haveThumb = fs.existsSync(thumbPath);
      if (haveThumb && !REFRESH_THUMBS) {
        stats.thumbsKept++;
      } else if (previewFile) {
        try {
          fs.writeFileSync(thumbPath, gifFrame0ToPng(await getSignedFileBytes(previewFile)));
          stats.thumbsNew++;
        } catch (e) {
          stats.errors.push(slug + ' thumb: ' + e.message);
          if (!haveThumb) { fs.writeFileSync(thumbPath, placeholderPng(tier, 320, 230)); stats.placeholders.push(slug); }
        }
      } else if (!haveThumb) {
        fs.writeFileSync(thumbPath, placeholderPng(tier, 320, 230));
        stats.placeholders.push(slug);
      }

      stats.written++;
    } catch (e) {
      stats.errors.push((slug || cn) + ': ' + e.message);
    }
  }

  // Regenerate gallery index.html via Ra's builder (NOGIF=1 → tiles use thumb.png).
  execFileSync('node', [path.join(__dirname, 'build-gallery.cjs')], {
    stdio: 'inherit',
    env: Object.assign({}, process.env, { FX_DIR: ROOT, NOGIF: '1' })
  });

  console.log('\n— export-gallery summary —');
  console.log('written: ' + stats.written + ' | thumbs new: ' + stats.thumbsNew + ' | kept: ' + stats.thumbsKept + ' | placeholders: ' + stats.placeholders.length);
  if (stats.skippedPrivate.length) console.log('SKIPPED (not public): ' + stats.skippedPrivate.join(', '));
  if (stats.missingCode.length) console.log('NO CODE (skipped): ' + stats.missingCode.join(', '));
  if (stats.placeholders.length) console.log('PLACEHOLDER THUMB (add a preview GIF on the card for a real one): ' + stats.placeholders.join(', '));
  if (stats.errors.length) console.log('ERRORS (' + stats.errors.length + '):\n  ' + stats.errors.join('\n  '));
  if (stats.written === 0) { console.error('\nNothing written — aborting (check AKASHIC_API_KEY / API).'); process.exit(1); }
}

main().catch(function (e) { console.error('FATAL:', e && e.stack || e); process.exit(1); });
