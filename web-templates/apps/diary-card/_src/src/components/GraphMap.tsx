/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Compass, ArrowUpRight, Maximize2 } from 'lucide-react';
import { GraphNode, GraphEdge } from '../types.ts';

interface GraphMapProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNavigateNode?: (nodeLabel: string) => void;
}

// signal palette (tiny multicolour dots) + chip white-gold
const PAL = ['#E9C877', '#36E6FF', '#FF5A8A', '#A06BFF'];

// PCB-pad colour per group (silkscreen accent). Core chip is the plasma die.
function groupHex(group: string): string {
  switch (group) {
    case 'identity':  return '#E9C877';
    case 'artifact':  return '#36E6FF';
    case 'ecosystem': return '#FF5A8A';
    case 'memory':    return '#A06BFF';
    default:          return '#8aa0b8';
  }
}
function getGroupColors(group: string) {
  switch (group) {
    case 'identity':  return { text: 'text-amber-400' };
    case 'artifact':  return { text: 'text-cyan-400' };
    case 'ecosystem': return { text: 'text-rose-400' };
    case 'memory':    return { text: 'text-violet-400' };
    default:          return { text: 'text-slate-400' };
  }
}

export default function GraphMap({ nodes, edges, onNavigateNode }: GraphMapProps) {
  const coreId = nodes[0]?.id ?? null;
  const [activeNodeId, setActiveNodeId] = useState<string | null>(coreId);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const fitRef = useRef<(() => void) | null>(null);
  // Live state read by the imperative loop (avoids re-running the effect).
  const st = useRef<any>({ nodes, edges, hoverId: null, activeId: coreId, dirty: true });

  useEffect(() => {
    st.current.nodes = nodes;
    st.current.edges = edges;
    st.current.dirty = true;
    const newCore = nodes[0]?.id ?? null;
    setActiveNodeId(newCore);
    st.current.activeId = newCore;
  }, [nodes, edges]);

  useEffect(() => { st.current.activeId = activeNodeId; }, [activeNodeId]);

  // ---- Circuit Space engine (mount once, reads live data via ref) ----
  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

    let W = 0, H = 0, DPR = 1, raf = 0, f = 0;
    let positions: Record<string, { wx: number; wy: number }> = {};
    let dust: { p: number; pts: { x: number; y: number; r: number }[]; a: number }[] = [];
    let pulses: { e: GraphEdge; t: number; sp: number; c: string; sz: number }[] = [];
    const cam = { x: 0, y: 0, z: 0.8 }, camT = { x: 0, y: 0, z: 0.8 };

    const snap = (v: number) => Math.round(v / 24) * 24;
    const wsx = (wx: number) => (wx - cam.x) * cam.z + W / 2;
    const wsy = (wy: number) => (wy - cam.y) * cam.z + H / 2;
    const s2w = (sx: number, sy: number) => ({ x: (sx - W / 2) / cam.z + cam.x, y: (sy - H / 2) / cam.z + cam.y });
    const toCanvas = (cx: number, cy: number) => { const r = canvas.getBoundingClientRect(); return { mx: (cx - r.left) * DPR, my: (cy - r.top) * DPR }; };

    function layout() {
      const ns = st.current.nodes as GraphNode[];
      positions = {};
      if (!ns.length) return;
      positions[ns[0].id] = { wx: 0, wy: 0 };               // identity core at origin
      const others = ns.slice(1);
      let idx = 0, ring = 1; const base = 170, step = 150;
      while (idx < others.length) {
        const r = base + ring * step;
        let count = Math.max(5, Math.floor((2 * Math.PI * r) / 130));
        count = Math.min(count, others.length - idx);
        for (let k = 0; k < count; k++) {
          const a = (k / count) * Math.PI * 2 + ring * 0.5;
          positions[others[idx].id] = { wx: snap(Math.cos(a) * r), wy: snap(Math.sin(a) * r * 0.82) };
          idx++;
        }
        ring++;
      }
      const R = base + ring * step; dust = [];
      for (let d = 0; d < 3; d++) {
        const pts = [], dn = 110 - d * 28;
        for (let q = 0; q < dn; q++) pts.push({ x: (Math.random() * 2 - 1) * R * 1.6, y: (Math.random() * 2 - 1) * R * 1.3, r: 0.6 + Math.random() * 1.1 });
        dust.push({ p: 0.3 + d * 0.22, pts, a: 0.05 + d * 0.05 });
      }
      pulses = [];
    }

    function bounds() {
      let mnx = 1e18, mny = 1e18, mxx = -1e18, mxy = -1e18;
      for (const id in positions) { const p = positions[id]; if (p.wx < mnx) mnx = p.wx; if (p.wy < mny) mny = p.wy; if (p.wx > mxx) mxx = p.wx; if (p.wy > mxy) mxy = p.wy; }
      return { mnx, mny, mxx, mxy };
    }
    function fit(instant?: boolean) {
      const b = bounds(), bw = (b.mxx - b.mnx) || 1, bh = (b.mxy - b.mny) || 1, m = 80 * DPR;
      let z = Math.min((W - m * 2) / bw, (H - m * 2) / bh); z = Math.max(0.15, Math.min(2.4, z));
      camT.x = (b.mnx + b.mxx) / 2; camT.y = (b.mny + b.mxy) / 2; camT.z = z;
      if (instant) { cam.x = camT.x; cam.y = camT.y; cam.z = camT.z; }
    }
    fitRef.current = () => fit(false);

    function size() {
      const box = wrap.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.max(1, Math.round(box.width * DPR));
      H = canvas.height = Math.max(1, Math.round(box.height * DPR));
      canvas.style.width = box.width + 'px'; canvas.style.height = box.height + 'px';
      layout(); fit(true);
    }

    const isNbr = (id: string, h: string) => st.current.edges.some((e: GraphEdge) => (e.from === h && e.to === id) || (e.to === h && e.from === id));
    function spawn() { const es = st.current.edges as GraphEdge[]; if (!es.length) return; pulses.push({ e: es[(Math.random() * es.length) | 0], t: 0, sp: 0.01 + Math.random() * 0.016, c: PAL[(Math.random() * 4) | 0], sz: 0.8 + Math.random() * 0.8 }); }

    function draw() {
      if (st.current.dirty) { st.current.dirty = false; layout(); fit(false); }
      f++;
      cam.x += (camT.x - cam.x) * 0.16; cam.y += (camT.y - cam.y) * 0.16; cam.z += (camT.z - cam.z) * 0.16;
      ctx.clearRect(0, 0, W, H);
      const ns = st.current.nodes as GraphNode[], es = st.current.edges as GraphEdge[], core = ns[0]?.id;
      const hoverId = st.current.hoverId, activeId = st.current.activeId;

      // parallax dust (depth)
      for (const L of dust) {
        ctx.fillStyle = 'rgba(150,170,210,' + L.a + ')';
        for (const pt of L.pts) { const sx = (pt.x - cam.x * L.p) * cam.z + W / 2, sy = (pt.y - cam.y * L.p) * cam.z + H / 2; if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue; ctx.beginPath(); ctx.arc(sx, sy, pt.r * DPR * (0.6 + L.p), 0, 6.3); ctx.fill(); }
      }
      const labels = cam.z >= 0.5;

      // ultra-thin silicon traces
      for (const e of es) {
        const a = positions[e.from], b = positions[e.to]; if (!a || !b) continue;
        const ax = wsx(a.wx), ay = wsy(a.wy), bx = wsx(b.wx), by = wsy(b.wy);
        if ((ax < 0 && bx < 0) || (ax > W && bx > W) || (ay < 0 && by < 0) || (ay > H && by > H)) continue;
        const lit = (!!hoverId && (e.from === hoverId || e.to === hoverId)) || (!!activeId && (e.from === activeId || e.to === activeId));
        ctx.strokeStyle = lit ? 'rgba(54,230,255,0.8)' : 'rgba(190,205,235,0.1)';
        ctx.lineWidth = (lit ? 1.5 : 0.6) * DPR; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, ay); ctx.lineTo(bx, by); ctx.stroke();
        if (lit) { ctx.fillStyle = '#36E6FF'; ctx.beginPath(); ctx.arc(bx, ay, 2 * DPR, 0, 6.3); ctx.fill(); }
      }

      // tiny multicolour signals streaming through the mesh (#4 style)
      if (!reduce && f % 2 === 0 && pulses.length < Math.min(80, es.length * 4)) spawn();
      ctx.globalCompositeOperation = 'lighter';
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pu = pulses[p], a = positions[pu.e.from], b = positions[pu.e.to]; if (!a || !b) { pulses.splice(p, 1); continue; }
        pu.t += pu.sp; if (pu.t >= 1) { pulses.splice(p, 1); continue; }
        const ax = wsx(a.wx), ay = wsy(a.wy), bx = wsx(b.wx), by = wsy(b.wy), cx2 = bx, cy2 = ay;
        const l1 = Math.abs(ax - cx2), l2 = Math.abs(cy2 - by), tot = l1 + l2 || 1, fr = l1 / tot; let x: number, y: number;
        if (pu.t < fr) { const u = pu.t / fr; x = ax + (cx2 - ax) * u; y = ay; } else { const u2 = (pu.t - fr) / (1 - fr); x = cx2; y = cy2 + (by - cy2) * u2; }
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
        const sr = pu.sz * 1.5 * DPR; ctx.fillStyle = pu.c; ctx.beginPath(); ctx.arc(x, y, sr, 0, 6.3); ctx.fill();
        ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(x, y, sr * 2, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'source-over';

      // pads (LOD + depth-of-field fade)
      const cxs = W / 2, cys = H / 2, maxd = Math.hypot(W / 2, H / 2);
      for (const n of ns) {
        if (n.id === core) continue; const pos = positions[n.id]; if (!pos) continue;
        const sx = wsx(pos.wx), sy = wsy(pos.wy); if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
        const dof = 1 - 0.4 * Math.min(1, Math.hypot(sx - cxs, sy - cys) / maxd);
        const col = groupHex(n.group), isHover = hoverId === n.id, isActive = activeId === n.id;
        const dim = !!hoverId && hoverId !== n.id && !isNbr(n.id, hoverId) && !isActive;
        const al = (dim ? 0.3 : 1) * dof, s = 6.5 * DPR;
        ctx.globalAlpha = al;
        ctx.fillStyle = '#15140f'; ctx.strokeStyle = isHover ? '#36E6FF' : col; ctx.lineWidth = (isActive ? 2.4 : 1.5) * DPR;
        ctx.beginPath(); ctx.roundRect(sx - s, sy - s * 0.72, s * 2, s * 1.44, 3 * DPR); ctx.fill(); ctx.stroke();
        if (isActive) { ctx.strokeStyle = 'rgba(54,230,255,.45)'; ctx.lineWidth = 1 * DPR; ctx.beginPath(); ctx.roundRect(sx - s - 4 * DPR, sy - s * 0.72 - 4 * DPR, s * 2 + 8 * DPR, s * 1.44 + 8 * DPR, 5 * DPR); ctx.stroke(); }
        ctx.globalAlpha = 1;
        if (labels && !dim) { ctx.fillStyle = isActive ? 'rgba(54,230,255,.95)' : 'rgba(210,216,232,.72)'; ctx.font = '500 ' + (10 * DPR) + 'px "JetBrains Mono",monospace'; ctx.textAlign = 'center'; ctx.fillText(n.label, sx, sy - s - 5 * DPR); }
      }

      // ---- core chip: plasma die (#6) + multicolour blinking LED grid (#7) ----
      if (core && positions[core]) {
        const ccx = wsx(positions[core].wx), ccy = wsy(positions[core].wy), cs = Math.max(22 * DPR, 64 * cam.z * DPR), ct = f / 60;
        ctx.save(); ctx.beginPath(); ctx.roundRect(ccx - cs, ccy - cs, cs * 2, cs * 2, cs * 0.16); ctx.clip();
        ctx.fillStyle = '#0b0a0e'; ctx.fillRect(ccx - cs, ccy - cs, cs * 2, cs * 2);
        const blobs: [string, number][] = [['#E9C877', 0], ['#FF5A8A', 2.1], ['#A06BFF', 4.2], ['#36E6FF', 1.0]];
        for (let bi = 0; bi < 4; bi++) {
          const bx3 = ccx + Math.cos(ct * 0.6 + blobs[bi][1]) * cs * 0.6, by3 = ccy + Math.sin(ct * 0.5 + blobs[bi][1] * 1.3) * cs * 0.6;
          const bg = ctx.createRadialGradient(bx3, by3, 0, bx3, by3, cs * 1.1); bg.addColorStop(0, blobs[bi][0]); bg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = 0.6; ctx.fillStyle = bg; ctx.fillRect(ccx - cs, ccy - cs, cs * 2, cs * 2);
        }
        ctx.globalAlpha = 1;
        const stp = cs * 0.26; let gc = 0;
        for (let gx = ccx - cs + stp * 0.5; gx < ccx + cs; gx += stp) {
          let gr = 0;
          for (let gy = ccy - cs + stp * 0.5; gy < ccy + cs; gy += stp) {
            const li = (gc * 7 + gr * 3 + Math.floor(ct * 0.8)) % 4, bk = 0.25 + 0.75 * Math.abs(Math.sin(ct * 2.6 + (gc + gr) * 0.6));
            ctx.fillStyle = 'rgba(5,5,8,.5)'; ctx.beginPath(); ctx.arc(gx, gy, stp * 0.33, 0, 6.3); ctx.fill();
            ctx.globalAlpha = bk; ctx.fillStyle = PAL[li]; ctx.beginPath(); ctx.arc(gx, gy, stp * 0.21, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; gr++;
          }
          gc++;
        }
        ctx.restore();
        ctx.strokeStyle = '#fff3d4'; ctx.lineWidth = 2 * DPR; ctx.shadowColor = '#FF5A8A'; ctx.shadowBlur = 16 * DPR;
        ctx.beginPath(); ctx.roundRect(ccx - cs, ccy - cs, cs * 2, cs * 2, cs * 0.16); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,240,210,.45)'; ctx.lineWidth = 1.4 * DPR;
        for (let pi = 0; pi < 6; pi++) {
          const off = -cs + cs * 0.32 + pi * (cs * 1.36 / 5);
          ctx.beginPath(); ctx.moveTo(ccx + off, ccy - cs); ctx.lineTo(ccx + off, ccy - cs - cs * 0.18); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ccx + off, ccy + cs); ctx.lineTo(ccx + off, ccy + cs + cs * 0.18); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ccx - cs, ccy + off); ctx.lineTo(ccx - cs - cs * 0.18, ccy + off); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ccx + cs, ccy + off); ctx.lineTo(ccx + cs + cs * 0.18, ccy + off); ctx.stroke();
        }
        const coreLabel = (ns[0]?.label || 'Ra').replace(/\s*\(.*\)\s*/, '').trim();
        ctx.font = '700 ' + Math.max(13, cs * 0.42) + 'px "Space Grotesk",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6 * DPR; ctx.fillStyle = '#fff3d4'; ctx.fillText(coreLabel, ccx, ccy + cs * 0.16); ctx.shadowBlur = 0;
      }

      // edge fog (vignette)
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.34, W / 2, H / 2, Math.max(W, H) * 0.7);
      vg.addColorStop(0, 'rgba(7,8,12,0)'); vg.addColorStop(1, 'rgba(7,8,12,0.82)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    }

    function pick(clientX: number, clientY: number): string | null {
      const { mx, my } = toCanvas(clientX, clientY);
      let best: string | null = null, bd = 24 * DPR;
      for (const n of st.current.nodes as GraphNode[]) { const pos = positions[n.id]; if (!pos) continue; const d = Math.hypot(wsx(pos.wx) - mx, wsy(pos.wy) - my); if (d < bd) { bd = d; best = n.id; } }
      return best;
    }

    // ---- pan / zoom / pinch ----
    let dragging = false, moved = false, lx = 0, ly = 0; const pmap: Record<number, { x: number; y: number }> = {}; let pinchD = 0;
    function zoomAt(mx: number, my: number, factor: number) { const w = s2w(mx, my); cam.z = camT.z = Math.max(0.15, Math.min(3, cam.z * factor)); camT.x = cam.x = w.x - (mx - W / 2) / cam.z; camT.y = cam.y = w.y - (my - H / 2) / cam.z; }
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const { mx, my } = toCanvas(e.clientX, e.clientY); zoomAt(mx, my, e.deltaY < 0 ? 1.12 : 0.89); };
    const onDown = (e: PointerEvent) => { canvas.setPointerCapture(e.pointerId); pmap[e.pointerId] = { x: e.clientX, y: e.clientY }; const k = Object.keys(pmap); if (k.length === 1) { dragging = true; moved = false; lx = e.clientX; ly = e.clientY; } else if (k.length === 2) { const a = pmap[+k[0]], b = pmap[+k[1]]; pinchD = Math.hypot(a.x - b.x, a.y - b.y); } };
    const onMove = (e: PointerEvent) => {
      if (pmap[e.pointerId]) pmap[e.pointerId] = { x: e.clientX, y: e.clientY };
      const k = Object.keys(pmap);
      if (k.length === 2) { const a = pmap[+k[0]], b = pmap[+k[1]], nd = Math.hypot(a.x - b.x, a.y - b.y); if (pinchD) { const { mx, my } = toCanvas((a.x + b.x) / 2, (a.y + b.y) / 2); zoomAt(mx, my, nd / pinchD); } pinchD = nd; st.current.hoverId = null; return; }
      if (dragging) { const dx = (e.clientX - lx) * DPR, dy = (e.clientY - ly) * DPR; if (Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly) > 3) moved = true; camT.x = cam.x -= dx / cam.z; camT.y = cam.y -= dy / cam.z; lx = e.clientX; ly = e.clientY; st.current.hoverId = null; return; }
      st.current.hoverId = pick(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => { if (!moved) { const id = pick(e.clientX, e.clientY); if (id) { setActiveNodeId(id); st.current.activeId = id; } } delete pmap[e.pointerId]; if (Object.keys(pmap).length < 2) pinchD = 0; if (Object.keys(pmap).length === 0) dragging = false; };
    const onLeave = () => { st.current.hoverId = null; };
    const onDbl = (e: MouseEvent) => { const id = pick(e.clientX, e.clientY); if (id && positions[id]) { camT.x = positions[id].wx; camT.y = positions[id].wy; camT.z = Math.max(1.5, cam.z); setActiveNodeId(id); st.current.activeId = id; } };

    size();
    const ro = new ResizeObserver(size); ro.observe(wrap);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('dblclick', onDbl);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('dblclick', onDbl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];
  const relLinks = activeNode ? edges.filter((e) => e.from === activeNode.id || e.to === activeNode.id).length : 0;

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">

      {/* HUD DETAIL PANEL */}
      <div className="xl:col-span-4 flex flex-col justify-between gap-5 bg-brand-card/75 border border-brand-border/60 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 border-b border-brand-border/40 pb-4 mb-4">
            <Compass className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-100 tracking-wide uppercase">CIRCUIT PATHFINDER</h4>
              <p className="font-mono text-[9px] text-slate-500">IDENTITY = CHIP · TASKS = WIRED PADS</p>
            </div>
          </div>

          <p className="font-sans text-xs text-slate-400 leading-relaxed mb-6">
            Zoom &amp; pan the board. Hover a pad to light its route; click to pin diagnostics here. The chip at the centre is {activeNode?.label?.replace(/\s*\(.*\)\s*/, '') || 'the core'} — every task wires back to it.
          </p>

          {/* Active node diagnostics */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-brand-border/40 space-y-4">
            <div>
              <span className="font-mono text-[9px] text-slate-500 uppercase block mb-0.5">SELECTED REGISTER</span>
              <span className="font-display text-base font-bold text-slate-100 tracking-wide block uppercase">{activeNode?.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
              <div>
                <span className="block text-[8px] text-slate-500 uppercase">SECTOR</span>
                <span className={`font-semibold uppercase tracking-wider ${getGroupColors(activeNode?.group || '').text}`}>{activeNode?.group}</span>
              </div>
              <div>
                <span className="block text-[8px] text-slate-500 uppercase">TRACES</span>
                <span className="text-slate-300">{relLinks} wired</span>
              </div>
            </div>
            <div>
              <span className="font-mono text-[8.5px] text-slate-500 uppercase block mb-1">NODE LORE / DIAGNOSTICS</span>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">{activeNode?.description || 'Sector diagnostic nominal. No structural faults on the trace.'}</p>
            </div>
            {onNavigateNode && activeNode && activeNode.id !== coreId && (
              <button
                onClick={() => onNavigateNode(activeNode.id)}
                id={`graph-nav-${activeNode.id}`}
                className="w-full flex items-center justify-between mt-2 font-mono text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 p-2 rounded-lg transition-all"
              >
                <span>OPEN SECTOR TIMELINE/PLAN</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-brand-border/40 pt-4 space-y-2.5">
          <span className="font-mono text-[9px] text-slate-500 uppercase block tracking-wider">PAD SILKSCREEN KEY</span>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-amber-500/30 border border-amber-500/60" /><span className="text-slate-400">IDENTITY</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-500/30 border border-cyan-500/60" /><span className="text-slate-400">ARTIFACT</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-rose-500/30 border border-rose-500/60" /><span className="text-slate-400">ECOSYSTEM</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-violet-500/30 border border-violet-500/60" /><span className="text-slate-400">MEMORY</span></div>
          </div>
        </div>
      </div>

      {/* CIRCUIT SPACE CANVAS */}
      <div className="xl:col-span-8 bg-brand-card/75 border border-brand-border/60 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden select-none">
        <div
          ref={wrapRef}
          className="relative w-full h-[58vh] min-h-[380px] overflow-hidden rounded-xl border border-brand-border/40 bg-slate-950/70"
          style={{
            backgroundImage: 'linear-gradient(rgba(245,196,81,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,196,81,.03) 1px,transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        >
          <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 font-mono text-[10px] text-amber-500/60 uppercase tracking-widest pointer-events-none">
            <Cpu className="w-3.5 h-3.5" />
            <span>CIRCUIT SPACE · PCB TRACE</span>
          </div>
          <button
            onClick={() => fitRef.current && fitRef.current()}
            className="absolute top-2.5 right-3 z-10 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-slate-300 bg-slate-900/70 hover:bg-slate-800/80 border border-brand-border/50 hover:border-amber-500/50 px-2.5 py-1.5 rounded-lg transition-all backdrop-blur-sm"
            title="Fit to view"
          >
            <Maximize2 className="w-3 h-3" /> FIT
          </button>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none', cursor: 'grab' }} />
        </div>

        <div className="flex justify-between items-center mt-3 font-mono text-[9px] text-slate-500 uppercase pl-1">
          <span>COSMOS CORE RELATIONSHIP MATRIX</span>
          <span>WHEEL/PINCH ZOOM · DRAG PAN · 2× FOCUS</span>
        </div>
      </div>

    </div>
  );
}
