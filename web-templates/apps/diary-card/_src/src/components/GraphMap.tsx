/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Compass, ArrowUpRight } from 'lucide-react';
import { GraphNode, GraphEdge } from '../types.ts';

interface GraphMapProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNavigateNode?: (nodeLabel: string) => void;
}

// PCB-pad colour per group (silkscreen accent). Core chip is always gold.
function groupHex(group: string): string {
  switch (group) {
    case 'identity':  return '#E9C877';
    case 'artifact':  return '#36E6FF';
    case 'ecosystem': return '#FF5A8A';
    case 'memory':    return '#A06BFF';
    default:          return '#8aa0b8';
  }
}

// Tailwind classes for the HUD detail panel.
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
  // Live state read by the imperative animation loop (avoids re-running the effect).
  const st = useRef<{
    nodes: GraphNode[]; edges: GraphEdge[];
    hoverId: string | null; activeId: string | null; dirty: boolean;
  }>({ nodes, edges, hoverId: null, activeId: coreId, dirty: true });

  // Sync props → loop state; reset selection when the profile swaps.
  useEffect(() => {
    st.current.nodes = nodes;
    st.current.edges = edges;
    st.current.dirty = true;
    const newCore = nodes[0]?.id ?? null;
    setActiveNodeId(newCore);
    st.current.activeId = newCore;
  }, [nodes, edges]);

  // Keep the loop's active id in sync with React state (HUD selection).
  useEffect(() => { st.current.activeId = activeNodeId; }, [activeNodeId]);

  // ---- Canvas circuit map (mount once, reads live data via ref) ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    let W = 0, H = 0, DPR = 1, raf = 0, f = 0;
    let positions: Record<string, { x: number; y: number; s: number; core: boolean }> = {};
    let pulses: { e: GraphEdge; t: number; sp: number }[] = [];

    const snap = (v: number) => { const g = 32 * DPR; return Math.round(v / g) * g; };
    const corner = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: b.x, y: a.y }); // horizontal-first L

    function layout() {
      const ns = st.current.nodes;
      const core = ns[0]?.id;
      const cx = snap(W / 2), cy = snap(H / 2);
      positions = {};
      if (core) positions[core] = { x: cx, y: cy, s: 0, core: true };
      const others = ns.filter((n) => n.id !== core);
      // Distribute on an ellipse that fills the (often wide) canvas; ring varies per node.
      const m = 46 * DPR;                          // keep pads off the edges
      const rx = (W / 2) - m, ry = (H / 2) - m;
      for (let i = 0; i < others.length; i++) {
        const a = (i / Math.max(1, others.length)) * Math.PI * 2 - Math.PI / 2;
        const ring = 0.62 + ((i * 5) % 4) * 0.12;  // 0.62 .. 0.98 — staggered rings
        let x = snap(cx + Math.cos(a) * rx * ring);
        let y = snap(cy + Math.sin(a) * ry * ring);
        x = Math.max(m, Math.min(W - m, x));
        y = Math.max(m, Math.min(H - m, y));
        positions[others[i].id] = { x, y, s: (6 + (i % 3) * 1.4), core: false };
      }
      pulses = [];
    }

    function size() {
      const box = wrap.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.max(1, Math.round(box.width * DPR));
      H = canvas.height = Math.max(1, Math.round(box.height * DPR));
      canvas.style.width = box.width + 'px';
      canvas.style.height = box.height + 'px';
      layout();
    }

    const isNbr = (id: string, h: string) =>
      st.current.edges.some((e) => (e.from === h && e.to === id) || (e.to === h && e.from === id));

    function spawn() {
      const es = st.current.edges;
      if (!es.length) return;
      pulses.push({ e: es[(Math.random() * es.length) | 0], t: 0, sp: 0.01 + Math.random() * 0.012 });
    }

    function draw() {
      if (st.current.dirty) { st.current.dirty = false; layout(); }
      f++; ctx.clearRect(0, 0, W, H);
      const ns = st.current.nodes, es = st.current.edges;
      const core = ns[0]?.id;
      const hoverId = st.current.hoverId, activeId = st.current.activeId;

      // traces (right-angle PCB)
      for (const e of es) {
        const a = positions[e.from], b = positions[e.to];
        if (!a || !b) continue;
        const c = corner(a, b);
        const lit = (!!hoverId && (e.from === hoverId || e.to === hoverId)) ||
                    (!!activeId && (e.from === activeId || e.to === activeId));
        ctx.strokeStyle = lit ? 'rgba(54,230,255,0.8)' : 'rgba(233,200,119,0.16)';
        ctx.lineWidth = (lit ? 2 : 1.3) * DPR; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        // via dot at the corner
        ctx.fillStyle = lit ? '#36E6FF' : 'rgba(233,200,119,0.3)';
        ctx.beginPath(); ctx.arc(c.x, c.y, 2.2 * DPR, 0, 6.3); ctx.fill();
      }

      // data pulses flowing along the L-path
      if (!reduce && f % 16 === 0 && pulses.length < 26) spawn();
      ctx.globalCompositeOperation = 'lighter';
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pu = pulses[p], a = positions[pu.e.from], b = positions[pu.e.to];
        if (!a || !b) { pulses.splice(p, 1); continue; }
        const c = corner(a, b); pu.t += pu.sp;
        if (pu.t >= 1) { pulses.splice(p, 1); continue; }
        const l1 = Math.abs(a.x - c.x), l2 = Math.abs(c.y - b.y), tot = l1 + l2 || 1, fr = l1 / tot;
        let x: number, y: number;
        if (pu.t < fr) { const u = pu.t / fr; x = a.x + (c.x - a.x) * u; y = a.y; }
        else { const u2 = (pu.t - fr) / (1 - fr); x = c.x; y = c.y + (b.y - c.y) * u2; }
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7 * DPR);
        g.addColorStop(0, '#ffe6b0'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7 * DPR, 0, 6.3); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // pads (non-core nodes)
      for (const n of ns) {
        if (n.id === core) continue;
        const pos = positions[n.id]; if (!pos) continue;
        const hex = groupHex(n.group);
        const isActive = activeId === n.id, isHover = hoverId === n.id;
        const dim = !!hoverId && hoverId !== n.id && !isNbr(n.id, hoverId) && !isActive;
        const s = pos.s * DPR;
        ctx.fillStyle = dim ? 'rgba(233,200,119,.10)' : '#16140f';
        ctx.strokeStyle = dim ? 'rgba(233,200,119,.25)' : (isHover ? '#36E6FF' : hex);
        ctx.lineWidth = (isActive ? 2.4 : 1.5) * DPR;
        ctx.beginPath(); ctx.roundRect(pos.x - s, pos.y - s * 0.7, s * 2, s * 1.4, 3 * DPR); ctx.fill(); ctx.stroke();
        if (isActive) {
          ctx.strokeStyle = 'rgba(54,230,255,.4)'; ctx.lineWidth = 1 * DPR;
          ctx.beginPath();
          ctx.roundRect(pos.x - s - 4 * DPR, pos.y - s * 0.7 - 4 * DPR, s * 2 + 8 * DPR, s * 1.4 + 8 * DPR, 5 * DPR);
          ctx.stroke();
        }
      }

      // core chip (the identity)
      const cp = core ? positions[core] : null;
      if (cp) {
        const cs = Math.min(W, H) * 0.05;
        ctx.fillStyle = '#1a160e'; ctx.strokeStyle = '#E9C877'; ctx.lineWidth = 2 * DPR;
        ctx.shadowColor = 'rgba(233,200,119,.55)'; ctx.shadowBlur = 14 * DPR;
        ctx.beginPath(); ctx.roundRect(cp.x - cs, cp.y - cs, cs * 2, cs * 2, 6 * DPR); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        // chip pins
        ctx.strokeStyle = 'rgba(233,200,119,.5)'; ctx.lineWidth = 1.4 * DPR;
        for (let pi = 0; pi < 6; pi++) {
          const off = -cs + cs * 0.3 + pi * (cs * 1.4 / 5);
          ctx.beginPath(); ctx.moveTo(cp.x + off, cp.y - cs); ctx.lineTo(cp.x + off, cp.y - cs - 6 * DPR); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cp.x + off, cp.y + cs); ctx.lineTo(cp.x + off, cp.y + cs + 6 * DPR); ctx.stroke();
        }
        const coreLabel = (ns[0]?.label || 'Ra').replace(/\s*\(.*\)\s*/, '').trim();
        ctx.font = '700 ' + (15 * DPR) + 'px "Space Grotesk",sans-serif';
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff3d4';
        ctx.fillText(coreLabel, cp.x, cp.y + 5 * DPR);
      }

      // hover label
      if (hoverId && hoverId !== core && positions[hoverId]) {
        const n = ns.find((x) => x.id === hoverId);
        const pos = positions[hoverId];
        if (n) {
          ctx.font = '500 ' + (11 * DPR) + 'px "JetBrains Mono",monospace';
          ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(54,230,255,.95)';
          ctx.fillText(n.label, pos.x, pos.y - 13 * DPR);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function pick(e: PointerEvent | MouseEvent): string | null {
      const r = canvas.getBoundingClientRect();
      const mx = (e.clientX - r.left) * DPR, my = (e.clientY - r.top) * DPR;
      let best: string | null = null, bd = 26 * DPR;
      for (const n of st.current.nodes) {
        const pos = positions[n.id]; if (!pos) continue;
        const d = Math.hypot(pos.x - mx, pos.y - my);
        if (d < bd) { bd = d; best = n.id; }
      }
      return best;
    }

    const onMove = (e: PointerEvent) => { st.current.hoverId = pick(e); };
    const onLeave = () => { st.current.hoverId = null; };
    const onClick = (e: MouseEvent) => { const id = pick(e); if (id) { setActiveNodeId(id); st.current.activeId = id; } };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
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
              <p className="font-mono text-[9px] text-slate-500">IDENTITY = CHIP · CARDS &amp; MEMORIES = WIRED PADS</p>
            </div>
          </div>

          <p className="font-sans text-xs text-slate-400 leading-relaxed mb-6">
            Hover a pad to light its trace; click to pin diagnostics here. The chip at the centre is {activeNode?.label?.replace(/\s*\(.*\)\s*/, '') || 'the core'} — every pad wires back to it.
          </p>

          {/* Active node diagnostics */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-brand-border/40 space-y-4">
            <div>
              <span className="font-mono text-[9px] text-slate-500 uppercase block mb-0.5">SELECTED REGISTER</span>
              <span className="font-display text-base font-bold text-slate-100 tracking-wide block uppercase">
                {activeNode?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
              <div>
                <span className="block text-[8px] text-slate-500 uppercase">SECTOR</span>
                <span className={`font-semibold uppercase tracking-wider ${getGroupColors(activeNode?.group || '').text}`}>
                  {activeNode?.group}
                </span>
              </div>
              <div>
                <span className="block text-[8px] text-slate-500 uppercase">TRACES</span>
                <span className="text-slate-300">{relLinks} wired</span>
              </div>
            </div>

            <div>
              <span className="font-mono text-[8.5px] text-slate-500 uppercase block mb-1">NODE LORE / DIAGNOSTICS</span>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                {activeNode?.description || 'Sector diagnostic nominal. No structural faults on the trace.'}
              </p>
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
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-amber-500/30 border border-amber-500/60" />
              <span className="text-slate-400">IDENTITY</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-500/30 border border-cyan-500/60" />
              <span className="text-slate-400">ARTIFACT</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-500/30 border border-rose-500/60" />
              <span className="text-slate-400">ECOSYSTEM</span>
            </div>
          </div>
        </div>
      </div>

      {/* CIRCUIT MAP CANVAS */}
      <div className="xl:col-span-8 bg-brand-card/75 border border-brand-border/60 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden select-none">
        <div
          ref={wrapRef}
          className="relative w-full aspect-[4/3] sm:aspect-[8/5] overflow-hidden rounded-xl border border-brand-border/40 bg-slate-950/70"
          style={{
            backgroundImage:
              'linear-gradient(rgba(245,196,81,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,196,81,.03) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 font-mono text-[10px] text-amber-500/60 uppercase tracking-widest pointer-events-none">
            <Cpu className="w-3.5 h-3.5" />
            <span>CIRCUIT MAP · PCB TRACE</span>
          </div>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        <div className="flex justify-between items-center mt-3 font-mono text-[9px] text-slate-500 uppercase pl-1">
          <span>COSMOS CORE RELATIONSHIP MATRIX</span>
          <span>HOVER TO LIGHT · CLICK TO PIN</span>
        </div>
      </div>

    </div>
  );
}
