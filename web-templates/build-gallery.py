#!/usr/bin/env python3
"""Cosmos Web Templates — gallery factory.
Scans templates/<slug>/{meta.json,index.html}, embeds each page (base64, with a
localStorage shim for sandboxed iframes), and writes a single self-contained
gallery index.html: a coded grid with LIVE scaled-iframe thumbnails + a
full-screen viewer. Re-run after adding/removing templates."""
import base64, glob, json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(ROOT, "templates")

SHIM = ('<script>(function(){try{var t=window.localStorage;t.getItem("__p");}catch(e){var s={};'
        'try{Object.defineProperty(window,"localStorage",{configurable:true,value:{get length(){return Object.keys(s).length},'
        'getItem:function(k){return Object.prototype.hasOwnProperty.call(s,k)?s[k]:null},setItem:function(k,v){s[k]=String(v)},'
        'removeItem:function(k){delete s[k]},clear:function(){s={}},key:function(n){return Object.keys(s)[n]||null}}});}catch(e2){}}})();</script>')

items = []
for meta_path in sorted(glob.glob(os.path.join(TPL, "*", "meta.json"))):
    d = os.path.dirname(meta_path)
    html_path = os.path.join(d, "index.html")
    if not os.path.exists(html_path):
        continue
    m = json.load(open(meta_path, encoding="utf-8"))
    html = open(html_path, encoding="utf-8").read()
    html, n = re.subn(r'(<head[^>]*>)', lambda mm: mm.group(1) + SHIM, html, count=1, flags=re.I)
    if n == 0:
        html = SHIM + html
    b64 = base64.b64encode(html.encode("utf-8")).decode("ascii")
    items.append({
        "code": m.get("code", "CWT-???"), "title": m.get("title", m.get("slug", "")),
        "title_vi": m.get("title_vi", ""), "industry": m.get("industry", "other"),
        "style": m.get("style", ""), "special": m.get("special", ""),
        "tags": m.get("tags", []), "b": b64,
    })
items.sort(key=lambda x: x["code"])
industries = sorted(set(i["industry"] for i in items))

SHELL = """<!doctype html>
<html lang="vi"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Cosmos Web Templates — Gallery</title>
<style>
 :root{--bg:#08080d;--panel:#121420;--line:#23263a;--ink:#eef0fa;--mut:#9aa0bd;--brand:#8b5cff;--cyan:#22d3ee}
 *{box-sizing:border-box;margin:0;padding:0}
 body{background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
 a{color:inherit}
 .top{position:sticky;top:0;z-index:20;background:rgba(8,8,13,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:16px 20px;padding-top:calc(16px + env(safe-area-inset-top))}
 .top h1{font-size:18px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
 .mark{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,var(--brand),var(--cyan));display:grid;place-items:center;color:#08080d;font-size:15px}
 .top p{color:var(--mut);font-size:13px;margin-top:3px}
 .filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
 .filters button{background:#0f1120;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:7px 14px;font:600 13px inherit;cursor:pointer;text-transform:capitalize}
 .filters button.on{background:var(--ink);color:#08080d;border-color:var(--ink)}
 .grid{max-width:1280px;margin:0 auto;padding:22px;display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
 @media(min-width:980px){.grid{grid-template-columns:repeat(3,1fr)}}
 .card{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--panel);cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s}
 .card:hover{transform:translateY(-4px);border-color:var(--brand);box-shadow:0 24px 50px -24px #000}
 .thumb{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0b0b12;border-bottom:1px solid var(--line)}
 .thumb iframe{position:absolute;top:0;left:0;width:1280px;height:800px;border:0;transform-origin:0 0;pointer-events:none}
 .thumb .code{position:absolute;top:10px;left:10px;z-index:2;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);border:1px solid #ffffff2a;color:#fff;font:800 12px ui-monospace,monospace;letter-spacing:.05em;padding:5px 9px;border-radius:7px}
 .thumb .open{position:absolute;inset:0;display:grid;place-items:center;opacity:0;background:rgba(8,8,13,.35);transition:opacity .2s;z-index:1}
 .card:hover .thumb .open{opacity:1}
 .open b{background:var(--ink);color:#08080d;font:700 13px inherit;padding:9px 16px;border-radius:999px}
 .info{padding:14px 16px}
 .info h3{font-size:15.5px;font-weight:700}
 .info .ind{color:var(--cyan);font:700 11px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
 .info .sty{color:var(--mut);font-size:13px;margin-top:6px}
 /* modal */
 .modal{position:fixed;inset:0;z-index:50;background:rgba(4,4,8,.92);display:none;flex-direction:column}
 .modal.open{display:flex}
 .mbar{display:flex;align-items:center;gap:12px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:1px solid var(--line);background:#0b0b12}
 .mbar .code{font:800 13px ui-monospace,monospace;color:var(--cyan)}
 .mbar h3{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .mbar .sp{flex:1}
 .mbar button{background:#0f1120;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:9px 14px;font:600 14px inherit;cursor:pointer}
 .stagebox{flex:1;overflow:auto;background:#05050a;display:flex;justify-content:center}
 .viewport{width:100%;height:100%;background:#fff;transition:max-width .25s}
 .viewport.mobile{max-width:402px;border-left:1px solid var(--line);border-right:1px solid var(--line)}
 .viewport.desktop{width:1280px;max-width:none;flex:0 0 1280px}
 .viewport iframe{width:100%;height:100%;border:0;background:#fff;display:block}
 .seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;flex:0 0 auto}
 .seg button{background:#0f1120;color:var(--mut);border:0;padding:8px 11px;font:600 13px inherit;cursor:pointer;white-space:nowrap}
 .seg button.on{background:var(--ink);color:#08080d}
</style></head><body>
<div class="top">
  <h1><span class="mark">◆</span> Cosmos Web Templates</h1>
  <p>__COUNT__ mẫu · bấm thẻ để xem full · ghi <b style="color:var(--ink)">mã CWT-…</b> để Ra biết design nào.</p>
  <div class="filters" id="filters"></div>
</div>
<div class="grid" id="grid"></div>
<div class="modal" id="modal">
  <div class="mbar"><span class="code" id="mcode"></span><h3 id="mtitle"></h3><span class="sp"></span>
    <div class="seg" id="seg"><button data-m="mobile" class="on">📱 Mobile</button><button data-m="desktop">🖥 Desktop</button></div>
    <button id="mclose">✕</button></div>
  <div class="stagebox"><div class="viewport mobile" id="viewport"><iframe id="mframe" sandbox="allow-scripts allow-popups allow-modals" referrerpolicy="no-referrer"></iframe></div></div>
</div>
<script>
 var DATA=__DATA__, INDS=__INDS__;
 var grid=document.getElementById('grid'),filters=document.getElementById('filters');
 var modal=document.getElementById('modal'),mframe=document.getElementById('mframe'),mcode=document.getElementById('mcode'),mtitle=document.getElementById('mtitle'),viewport=document.getElementById('viewport'),seg=document.getElementById('seg');
 function url(b){return 'data:text/html;charset=utf-8;base64,'+b}
 // cards
 DATA.forEach(function(d){
   var c=document.createElement('div');c.className='card';c.dataset.ind=d.industry;
   c.innerHTML='<div class="thumb"><div class="code">'+d.code+'</div><iframe loading="lazy" sandbox="allow-scripts" referrerpolicy="no-referrer" src="'+url(d.b)+'"></iframe><div class="open"><b>Xem full ▸</b></div></div>'+
     '<div class="info"><h3>'+d.title+'</h3><div class="ind">'+d.industry+'</div><div class="sty">'+d.style+'</div></div>';
   c.addEventListener('click',function(){openModal(d)});
   grid.appendChild(c);
 });
 // scale thumbnails to fit
 function scaleThumbs(){document.querySelectorAll('.thumb').forEach(function(t){var f=t.querySelector('iframe');var s=t.clientWidth/1280;f.style.transform='scale('+s+')'})}
 addEventListener('resize',scaleThumbs);setTimeout(scaleThumbs,30);scaleThumbs();
 // filters
 function mkBtn(name,val){var b=document.createElement('button');b.textContent=name;if(val==='all')b.classList.add('on');
   b.addEventListener('click',function(){filters.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
     document.querySelectorAll('.card').forEach(function(c){c.style.display=(val==='all'||c.dataset.ind===val)?'':'none'});scaleThumbs()});
   return b}
 filters.appendChild(mkBtn('Tất cả','all'));INDS.forEach(function(i){filters.appendChild(mkBtn(i,i))});
 // modal
 function setMode(m){viewport.className='viewport '+m;seg.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.m===m)})}
 seg.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){setMode(b.dataset.m)})});
 function openModal(d){mcode.textContent=d.code;mtitle.textContent=d.title;setMode('mobile');mframe.src=url(d.b);modal.classList.add('open');document.body.style.overflow='hidden'}
 function closeModal(){modal.classList.remove('open');mframe.src='about:blank';document.body.style.overflow=''}
 document.getElementById('mclose').addEventListener('click',closeModal);
 addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});
</script>
</body></html>
"""
out = (SHELL.replace("__DATA__", json.dumps(items))
            .replace("__INDS__", json.dumps(industries))
            .replace("__COUNT__", str(len(items))))
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(out)
print("templates embedded:", len(items), "->", ", ".join(i["code"] for i in items))
print("industries:", ", ".join(industries))
print("gallery:", os.path.join(ROOT, "index.html"), "·", round(os.path.getsize(os.path.join(ROOT, "index.html"))/1024), "KB")
