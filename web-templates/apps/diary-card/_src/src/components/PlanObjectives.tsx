/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, Circle, AlertCircle, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';
import { Plan } from '../types.ts';

interface PlanObjectivesProps {
  plan: Plan;
}

export default function PlanObjectives({ plan }: PlanObjectivesProps) {
  const [animateWidths, setAnimateWidths] = useState(false);

  // Animate the progress bar widths from 0 on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateWidths(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT BOX: Dynamic Focus Progress (40% width on widescreen) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Core Focus Progression */}
        <div className="bg-brand-card/75 border border-brand-border/60 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 border-b border-brand-border/40 pb-4 mb-5">
              <Target className="w-5 h-5 text-amber-500 animate-pulse" />
              <div>
                <h4 className="font-display text-sm font-semibold text-slate-100 tracking-wide uppercase">TRAJECTORY FOCUS</h4>
                <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Cognitive priorities allocated inside CAL</p>
              </div>
            </div>

            <p className="font-sans text-xs text-slate-400 mb-6 leading-relaxed">
              Allocating sub-thread focus reserves ensures key artifacts (3D models, performance optimizations and Akashic records) meet requirements.
            </p>

            <div className="space-y-6">
              {plan.focus.map((focusItem, index) => {
                const isComplete = focusItem.pct === 100;

                return (
                  <div key={index} className="space-y-2 group">
                    <div className="flex justify-between items-end font-mono text-[11px]">
                      <span className="text-slate-300 font-light group-hover:text-amber-400 transition-colors uppercase leading-none">
                        {focusItem.label}
                      </span>
                      <span className={`font-bold font-mono tracking-wider ${isComplete ? 'text-amber-400' : 'text-slate-400'}`}>
                        {focusItem.pct}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-950 h-2.5 rounded-full border border-brand-border/30 overflow-hidden p-[2px]">
                      <div 
                        className={`h-full rounded-full transition-all duration-[1200ms] ease-out-elastic ${
                          isComplete 
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                            : 'bg-gradient-to-r from-slate-700 via-slate-600 to-amber-500/60'
                        }`}
                        style={{ width: animateWidths ? `${focusItem.pct}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-brand-border/40 pt-4 flex items-center justify-between font-mono text-[9px] text-slate-500">
            <span>ALLOCATION STATUS: SYSTEM BALANCED</span>
            <span>RAT: CAL-V2</span>
          </div>
        </div>

        {/* Dynamic Standby Alert Box */}
        <div className="bg-brand-card/80 border border-brand-border/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/[0.015] filter blur-[32px] pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {/* Double pulsing green beacon */}
              <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                <span className="absolute w-full h-full bg-emerald-400 rounded-full animate-ping opacity-60" />
                <span className="relative w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <span className="font-mono text-[10px] text-emerald-400 tracking-widest font-bold uppercase">POLLED STATUS OK</span>
            </div>
            
            <span className="font-mono text-[9px] text-slate-500 uppercase">AK-DIA-BEACON</span>
          </div>

          <div className="my-5">
            <span className="font-mono text-[9px] text-slate-500 uppercase block mb-1">CURRENT BROADCAST:</span>
            <p className="font-display font-medium text-slate-100 text-[15px] leading-relaxed select-none">
              &ldquo;{plan.standby}&rdquo;
            </p>
          </div>

          <div className="bg-slate-950/60 border border-brand-border/40 p-3 rounded-xl flex items-center justify-between font-mono text-[9.5px] text-zinc-400 uppercase">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
              SYS_CHANNEL_OPEN
            </span>
            <span className="text-slate-500">921mHz L&apos;ORANGE</span>
          </div>
        </div>

      </div>

      {/* RIGHT BOX: Objectives Vertical Subway Journey (70% width on widescreen) */}
      <div className="lg:col-span-7 bg-brand-card/75 border border-brand-border/60 rounded-2xl p-6 md:p-8 backdrop-blur-md">
        
        <div className="flex justify-between items-center border-b border-brand-border/40 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-100 tracking-wide uppercase">OBJECTIVES ROADMAP</h4>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Milestones categorized by execution sequence</p>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-slate-900 border border-brand-border px-2 py-0.5 rounded text-amber-500">
            TOTAL: {plan.objectives.length} STAGES
          </span>
        </div>

        {/* Vertical track subway lines */}
        <div id="objectives-subway-track" className="relative pl-6 md:pl-8 border-l-2 border-slate-900 flex flex-col gap-6">
          {plan.objectives.map((obj, i) => {
            const isDone = obj.status === 'done';
            const isActive = obj.status === 'active';
            const isNext = obj.status === 'next';

            return (
              <div key={i} className="relative group/obj">
                
                {/* Node icon placement */}
                <div className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full border bg-slate-950 flex items-center justify-center transition-all duration-300 ${
                  isDone ? 'border-amber-505 border-amber-500 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] z-10'
                  : isActive ? 'border-cyan-500 text-cyan-400 scale-110 z-10 animate-bounce'
                  : 'border-slate-800 text-slate-600 group-hover/obj:border-slate-600'
                }`} style={isActive ? { animationDuration: '4s' } : {}}>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 fill-slate-950" />
                  ) : isActive ? (
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  ) : (
                    <Circle className="w-2.5 h-2.5 fill-slate-950" />
                  )}
                </div>

                {/* Info block layout */}
                <div className={`border rounded-2xl p-4 md:p-5 transition-all duration-300 ${
                  isDone ? 'bg-slate-950/20 border-brand-border/40 hover:bg-slate-950/45'
                  : isActive ? 'bg-cyan-950/5 border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.03)]'
                  : 'bg-brand-card/20 border-dashed border-brand-border/40 opacity-55 hover:opacity-100'
                }`}>
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <h5 className={`font-display font-medium text-[14px] md:text-base ${isDone ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-100'}`}>
                      {obj.title}
                    </h5>
                    
                    {/* Status badge */}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase border ${
                      isDone ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : isActive ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse'
                      : 'bg-slate-900 border-brand-border/30 text-slate-500'
                    }`}>
                      {obj.status}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-slate-400 leading-relaxed mt-2">
                    {obj.body}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
