#!/usr/bin/env node
/* Cosmos Gallery builder — scans /home/user/fx/<slug>/meta.json, classifies each
   effect into a tier, and emits a single self-contained /home/user/fx/index.html
   showcase (zero deps, lazy thumbnails, hover→GIF on desktop, click→live iframe).
   Re-run after adding effects:  node build-gallery.cjs                          */
const fs = require('fs'), path = require('path');
const FX = process.env.FX_DIR || '/home/user/fx';

// --- tier membership (known sets); everything else is canvas ---
const SHADER = new Set(['domain-warp','raymarch-blob','mandelbulb','julia-set','mandelbrot','plasma-glsl','metaballs-glsl','kaleidoscope-glsl','voronoi-glsl','tunnel-glsl','hex-tunnel','star-nest','clouds-raymarch','apollonian','gyroid']);
const UI = new Set(['toast-notification','skeleton-loader','tab-switcher','modal-dialog','animated-chart','form-validation','stepper','accordion','command-palette','toggle-switch','segmented-control','notification-stack','copy-button','progress-ring','search-bar','rating-stars','hamburger-menu','loading-button','file-upload','dropdown-menu','date-picker','range-slider','checkbox-radio','pagination','breadcrumb','avatar-stack','badge-notification','progress-bar','carousel','side-drawer','chat-bubble','audio-player','pricing-card','stat-card','social-share','tooltip','snackbar','kanban-card','file-tree','color-picker','otp-input','tag-input','rating-input','timeline','navbar','kbd-shortcut','code-block','empty-state','login-form','data-table','calendar-agenda']);
const AUDIO = new Set(['synth-keyboard','drum-machine','theremin','arpeggiator','tone-matrix','harp-strings','fm-pad','bass-sequencer','wind-chimes','singing-bowl','chord-strummer','music-box','drum-pads','kalimba','ambient-generator','vowel-synth','glockenspiel','vocoder-talk','chord-pad','sine-choir','euclidean-rhythm','pluck-sequencer','gravity-harp','step-808','spiral-sequencer','mono-synth','handpan','laser-harp','beat-looper','fm-bells','drum-circle','theremin-grid']);
const tierOf = s => /^(micviz|webcam|tilt)-/.test(s) ? 'reactive' : /^game-/.test(s) ? 'game' : /^remix-/.test(s) ? 'remix' : SHADER.has(s) ? 'shader' : AUDIO.has(s) ? 'audio' : UI.has(s) ? 'ui' : 'canvas';

const items = [];
for (const slug of fs.readdirSync(FX)) {
  const dir = path.join(FX, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const mp = path.join(dir, 'meta.json');
  if (!fs.existsSync(mp) || !fs.existsSync(path.join(dir,'index.html')) || !fs.existsSync(path.join(dir,'thumb.png'))) continue;
  let m; try { m = JSON.parse(fs.readFileSync(mp,'utf8')); } catch { continue; }
  const hasGif = !process.env.NOGIF && fs.existsSync(path.join(dir, slug + '.gif'));
  items.push({
    slug,
    title: (m.title||slug).replace(/^Cosmos\s+/,''),
    vi: m.title_vi ? m.title_vi.replace(/^Cosmos\s+/,'') : '',
    tier: m.tier || tierOf(slug),
    tags: Array.isArray(m.tags) ? m.tags.slice(0,6) : [],
    summary: m.summary || '',
    gif: hasGif
  });
}
items.sort((a,b)=> a.tier===b.tier ? a.title.localeCompare(b.title) : a.tier.localeCompare(b.tier));
const counts = items.reduce((o,i)=>(o[i.tier]=(o[i.tier]||0)+1,o),{});

const TIERS = [
  ['all','All', items.length],
  ['canvas','Canvas 2D', counts.canvas||0],
  ['shader','Shaders', counts.shader||0],
  ['ui','UI', counts.ui||0],
  ['audio','Audio 🔊', counts.audio||0],
  ['remix','Remix 🎛️', counts.remix||0],
  ['game','Games 🎮', counts.game||0],
  ['reactive','Reactive 🔮', counts.reactive||0],
];

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cosmos Akashic — Effect Gallery (${items.length})</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#06040f;--panel:#0d0a1c;--line:#221a3a;--txt:#e7e2f5;--mut:#8b82ad;--violet:#8b5cff;--cosmic:#46b4ff;--nebula:#ff5cc2;--aurora:#36d39a}
html,body{background:var(--bg);color:var(--txt);font-family:-apple-system,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
header{position:sticky;top:0;z-index:20;background:rgba(6,4,15,.86);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:16px 20px 12px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.logo{width:34px;height:34px;border-radius:9px;background:conic-gradient(from 0deg,var(--violet),var(--cosmic),var(--aurora),var(--nebula),var(--violet));box-shadow:0 0 22px rgba(139,92,255,.55);flex:none}
.brand h1{font-size:18px;font-weight:700;letter-spacing:.2px}
.brand h1 span{color:var(--mut);font-weight:500}
.brand .count{margin-left:auto;font-size:12.5px;color:var(--mut)}
.controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.pills{display:flex;gap:7px;flex-wrap:wrap}
.pill{font-size:12.5px;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--mut);cursor:pointer;transition:.18s;white-space:nowrap}
.pill:hover{color:var(--txt);border-color:#3a2e63}
.pill.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--violet),var(--cosmic));box-shadow:0 4px 18px rgba(139,92,255,.4)}
.pill b{opacity:.6;font-weight:600;margin-left:5px}
.search{flex:1;min-width:160px;max-width:340px;margin-left:auto}
.search input{width:100%;font-size:13.5px;color:var(--txt);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:9px 15px;outline:none}
.search input:focus{border-color:var(--violet)}
main{padding:18px 20px 60px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:16px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:15px;overflow:hidden;cursor:pointer;transition:transform .16s,border-color .16s,box-shadow .16s;display:flex;flex-direction:column}
.card:hover{transform:translateY(-3px);border-color:#3a2e63;box-shadow:0 14px 34px rgba(0,0,0,.5)}
.thumb{position:relative;aspect-ratio:1/.72;background:#05030d;overflow:hidden}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.thumb .gif{position:absolute;inset:0;opacity:0;transition:opacity .2s}
.card:hover .thumb .gif{opacity:1}
.badge{position:absolute;top:8px;left:8px;font-size:10.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:3px 8px;border-radius:7px;backdrop-filter:blur(6px);background:rgba(13,10,28,.7);border:1px solid var(--line)}
.badge.canvas{color:var(--cosmic)}.badge.shader{color:var(--nebula)}.badge.ui{color:var(--aurora)}.badge.audio{color:var(--violet)}.badge.remix{color:#e0b24a}.badge.game{color:#ff6a3d}.badge.reactive{color:#36d39a}
.meta{padding:11px 13px 13px}
.meta h3{font-size:13.5px;font-weight:600;line-height:1.3;margin-bottom:4px}
.meta p{font-size:11.5px;color:var(--mut);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.empty{color:var(--mut);text-align:center;padding:60px 0;font-size:14px}
/* modal */
.modal{position:fixed;inset:0;z-index:50;background:rgba(4,2,10,.86);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:24px}
.modal.on{display:flex}
.box{background:var(--panel);border:1px solid var(--line);border-radius:16px;width:min(960px,96vw);max-height:92vh;overflow:hidden;display:flex;flex-direction:column}
.box .bar{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--line)}
.box .bar h2{font-size:15px;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.box .bar .tag{font-size:11px;color:var(--mut)}
.box .bar a,.box .bar button{font-size:12.5px;color:var(--txt);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:7px 12px;cursor:pointer}
.box .bar a:hover,.box .bar button:hover{border-color:var(--violet)}
.box .frame{flex:1;background:#05030d;min-height:340px}
.box iframe{width:100%;height:60vh;border:0;display:block}
.box .desc{padding:12px 16px;font-size:12.5px;color:var(--mut);line-height:1.55;border-top:1px solid var(--line)}
footer{padding:30px 20px;text-align:center;color:var(--mut);font-size:12px;border-top:1px solid var(--line)}
</style></head>
<body>
<header>
  <div class="brand">
    <div class="logo"></div>
    <h1>Cosmos Akashic <span>· Effect Gallery</span></h1>
    <div class="count">${items.length} effects · self-contained · zero deps</div>
  </div>
  <div class="controls">
    <div class="pills" id="pills">
      ${TIERS.map((t,i)=>`<button class="pill${i===0?' on':''}" data-tier="${t[0]}">${t[1]}<b>${t[2]}</b></button>`).join('')}
    </div>
    <div class="search"><input id="q" type="search" placeholder="Search effects, tags…" autocomplete="off"></div>
  </div>
</header>
<main><div class="grid" id="grid"></div><div class="empty" id="empty" style="display:none">No effects match.</div></main>
<footer>Cosmos AI Lab · Phantom collection · open any tile to run it live (audio effects play on click)</footer>

<div class="modal" id="modal">
  <div class="box">
    <div class="bar">
      <h2 id="mt"></h2><span class="tag" id="mtag"></span>
      <button id="membed">⧉ Embed</button>
      <a id="mopen" target="_blank" rel="noopener">Open ↗</a>
      <button id="mclose">Close ✕</button>
    </div>
    <div class="frame"><iframe id="mframe" title="effect" loading="lazy"></iframe></div>
    <div class="desc" id="mdesc"></div>
  </div>
</div>

<script>
const DATA = ${JSON.stringify(items)};
const grid=document.getElementById('grid'), empty=document.getElementById('empty');
let tier='all', q='';
function draw(){
  const qq=q.trim().toLowerCase();
  const list=DATA.filter(d=>(tier==='all'||d.tier===tier) &&
    (!qq || d.title.toLowerCase().includes(qq) || d.slug.includes(qq) || d.tags.join(' ').toLowerCase().includes(qq)));
  empty.style.display=list.length?'none':'block';
  grid.innerHTML=list.map(d=>\`<div class="card" data-slug="\${d.slug}">
    <div class="thumb">
      <img loading="lazy" src="./\${d.slug}/thumb.png" alt="\${d.title}">
      \${d.gif?\`<img class="gif" loading="lazy" data-gif="./\${d.slug}/\${d.slug}.gif" alt="">\`:''}
      <span class="badge \${d.tier}">\${d.tier}</span>
    </div>
    <div class="meta"><h3>\${d.title}</h3><p>\${d.summary}</p></div>
  </div>\`).join('');
}
// hover lazy-loads the GIF only on desktop pointers
grid.addEventListener('pointerover',e=>{
  const c=e.target.closest('.card'); if(!c||matchMedia('(hover:none)').matches)return;
  const g=c.querySelector('.gif'); if(g&&!g.src)g.src=g.dataset.gif;
});
grid.addEventListener('click',e=>{const c=e.target.closest('.card');if(c)open(c.dataset.slug)});
document.getElementById('pills').addEventListener('click',e=>{
  const b=e.target.closest('.pill'); if(!b)return;
  tier=b.dataset.tier; [...document.querySelectorAll('.pill')].forEach(p=>p.classList.toggle('on',p===b)); draw();
});
document.getElementById('q').addEventListener('input',e=>{q=e.target.value;draw()});
// modal
const modal=document.getElementById('modal'),mf=document.getElementById('mframe');
let curSlug=null;
function open(slug){const d=DATA.find(x=>x.slug===slug);if(!d)return; curSlug=slug;
  document.getElementById('mt').textContent=d.title;
  document.getElementById('mtag').textContent=d.tier.toUpperCase()+' · '+d.tags.slice(0,4).join(', ');
  document.getElementById('mdesc').textContent=d.summary;
  document.getElementById('mopen').href='./'+slug+'/index.html';
  mf.src='./'+slug+'/index.html'; modal.classList.add('on');}
function close(){modal.classList.remove('on');mf.src='about:blank';}
// Copy a ready-to-paste iframe embed snippet for the open effect.
const membed=document.getElementById('membed');
membed.onclick=()=>{ if(!curSlug)return;
  const snip='<iframe src="cosmos-fx/'+curSlug+'/index.html" style="border:0;width:100%;height:100%" loading="lazy" title="'+curSlug+'"></iframe>';
  const done=()=>{const o=membed.textContent;membed.textContent='✓ Copied';setTimeout(()=>membed.textContent=o,1300);};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(snip).then(done).catch(done);}else{const ta=document.createElement('textarea');ta.value=snip;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();done();}
};
document.getElementById('mclose').onclick=close;
modal.addEventListener('click',e=>{if(e.target===modal)close()});
addEventListener('keydown',e=>{if(e.key==='Escape')close()});
draw();
</script>
</body></html>`;

fs.writeFileSync(path.join(FX, 'index.html'), html);
console.log(`gallery -> ${FX}/index.html  (${items.length} effects: ` +
  TIERS.slice(1).map(t=>`${t[0]} ${t[2]}`).join(', ') + ')');
