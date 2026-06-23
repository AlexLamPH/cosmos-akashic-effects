/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Star, MessageSquare, Flame, Tag, RefreshCw } from 'lucide-react';
import { TimelineEntry } from '../types.ts';

interface MemoryTimelineProps {
  entries: TimelineEntry[];
}

export default function MemoryTimeline({ entries }: MemoryTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "mem-01": true, // Expand first item by default
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Toggle card body expansion
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Compile list of unique tags for filtering
  const allTags = Array.from(
    new Set(entries.flatMap(entry => entry.tags))
  );

  const filteredEntries = selectedTag
    ? entries.filter(entry => entry.tags.includes(selectedTag))
    : entries;

  // Render rhythm heatmap - Ra's timeline spans 16 days.
  // We can represent a beautiful rhythm grid / timeline pulse based on entries' intensity.
  const rhythmData = [
    { date: "2026-06-12", intensity: 1, title: "Slider v2 UI adjustment" },
    { date: "2026-06-13", intensity: 0, title: "Rest State" },
    { date: "2026-06-14", intensity: 0, title: "Rest State" },
    { date: "2026-06-15", intensity: 0, title: "Rest State" },
    { date: "2026-06-16", intensity: 0, title: "Rest State" },
    { date: "2026-06-17", intensity: 0, title: "Rest State" },
    { date: "2026-06-18", intensity: 0, title: "Rest State" },
    { date: "2026-06-19", intensity: 1, title: "Enviroment sandbox migration" },
    { date: "2026-06-20", intensity: 2, title: "Wake hook installed & Environment launch" },
    { date: "2026-06-21", intensity: 1, title: "Card discipline directive verified" },
    { date: "2026-06-22", intensity: 3, title: "HTML Preview Render (Playwright Milestone)" }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Rhythm Heatmap Grid Module */}
      <div className="bg-brand-card/75 border border-brand-border/60 rounded-xl p-5 md:p-6 backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border/40 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-100 tracking-wide uppercase">CHRONOS NEURAL RHYTHM</h4>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Temporal activity heartbeat over a 16-day active cycle</p>
            </div>
          </div>
          
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedTag(null)}
              id="tag-filter-clear"
              className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-all uppercase ${
                selectedTag === null
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-brand-border/40'
              }`}
            >
              ALL MEMORIES
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                id={`tag-filter-${tag}`}
                className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-all uppercase flex items-center gap-1 ${
                  selectedTag === tag
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-brand-border/40'
                }`}
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Heartbeat Pulse Wave Graph (SVG Custom Rhythm) */}
        <div className="relative pt-4 pb-2 w-full bg-slate-950/50 rounded-xl p-4 border border-brand-border/30">
          <div className="absolute top-2 left-3 font-mono text-[9px] text-slate-600 uppercase tracking-widest">
            COGNITIVE PULSE OSCILLATOR
          </div>

          <div className="h-20 w-full flex items-end justify-between gap-1 xs:gap-1.5 md:gap-3 transition-all">
            {rhythmData.map((d, i) => {
              // Map intensity to heights & color sparks
              const heightPct = d.intensity === 3 ? 'h-full' : d.intensity === 2 ? 'h-2/3' : d.intensity === 1 ? 'h-1/3' : 'h-[6px]';
              const bgClass = d.intensity === 3 ? 'bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                            : d.intensity === 2 ? 'bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                            : d.intensity === 1 ? 'bg-zinc-800'
                            : 'bg-slate-950 border border-brand-border/20';

              return (
                <div 
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-16 group/bar cursor-pointer"
                  onMouseEnter={() => setHoveredDay(d.date)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className={`w-full rounded-t-md transition-all duration-300 ease-out ${heightPct} ${bgClass}`} />
                  <span className="font-mono text-[8px] text-slate-600 group-hover/bar:text-amber-400 transition-colors mt-2 uppercase">
                    {d.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hover diagnostics display inside pulse wave */}
          <div className="h-6 mt-3 border-t border-brand-border/30 pt-2 flex items-center justify-between">
            <div className="font-mono text-[9.5px] text-slate-400">
              {hoveredDay ? (
                <div className="flex gap-2 items-center">
                  <span className="text-amber-500 font-bold">&gt;&gt;</span>
                  <span>DATE: {hoveredDay}</span>
                  <span className="text-zinc-500 font-bold">|</span>
                  <span className="text-zinc-350">{rhythmData.find(r => r.date === hoveredDay)?.title}</span>
                </div>
              ) : (
                <div className="flex gap-2 items-center text-slate-500 animate-pulse">
                  <span>● STANDBY READINGS</span>
                  <span className="text-zinc-500">|</span>
                  <span>HOVER NEURAL COLUMNS TO RESTORE FRAGMENTS</span>
                </div>
              )}
            </div>
            <div className="font-mono text-[8.5px] text-slate-600 uppercase">
              16-DAY ACTIVE WINDOW STATUS: SOLID
            </div>
          </div>

        </div>

      </div>

      {/* TIMELINE LIST ELEMENT */}
      <div className="relative pl-6 md:pl-8 border-l border-brand-border/50 flex flex-col gap-5 mt-2">
        {filteredEntries.map((entry, index) => {
          const isExpanded = !!expandedIds[entry.id];
          const isMilestone = entry.kind === 'milestone';

          return (
            <div key={entry.id} className="relative group">
              {/* Chronological Circle Anchor */}
              <div className={`absolute -left-[31px] md:-left-[39px] top-4 w-4 h-4 rounded-full border bg-slate-950 flex items-center justify-center transition-all duration-300 ${
                isMilestone 
                  ? 'border-amber-500 text-amber-500 holo-glow-gold scale-110 z-10' 
                  : 'border-slate-700 text-slate-500 group-hover:border-slate-500'
              }`}>
                {isMilestone ? (
                  <Star className="w-2.5 h-2.5 fill-amber-500" />
                ) : (
                  <MessageSquare className="w-2 h-2" />
                )}
              </div>

              {/* Memory Card layout */}
              <div className={`bg-brand-card/50 border hover:bg-brand-card/75 rounded-2xl transition-all duration-300 overflow-hidden ${
                isMilestone 
                  ? isExpanded 
                    ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.04)]' 
                    : 'border-brand-border/80 group-hover:border-amber-500/20'
                  : 'border-brand-border/60 group-hover:border-brand-border'
              }`}>
                
                {/* Header clickable zone toggle body info */}
                <div 
                  onClick={() => toggleExpand(entry.id)}
                  id={`timeline-card-header-${entry.id}`}
                  className="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 flex-wrap pr-4">
                    {/* Date badge */}
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] font-light">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{entry.date}</span>
                    </div>

                    <span className="text-slate-600 font-mono text-[11px] select-none">&#47;&#47;</span>

                    {/* Kind badge */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase border ${
                      isMilestone 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                    }`}>
                      {entry.kind}
                    </span>

                    <span className="text-slate-600 font-mono text-[11px] select-none hidden sm:inline">&#47;&#47;</span>

                    {/* Title */}
                    <h3 className="font-display font-medium text-slate-100 text-sm md:text-base tracking-wide leading-tight group-hover:text-amber-400 transition-colors">
                      {entry.title}
                    </h3>
                  </div>

                  <div className="text-slate-500 group-hover:text-slate-300 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Dropdown Expand block */}
                {isExpanded && (
                  <div className="px-4 md:px-5 pb-5 border-t border-brand-border/40 pt-4 bg-slate-950/25">
                    <p className="font-sans text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {entry.body}
                    </p>

                    {/* Tag bubbles */}
                    <div className="flex items-center gap-2 flex-wrap text-slate-500 font-mono text-[10px]">
                      <Tag className="w-3.5 h-3.5 text-slate-600" />
                      {entry.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-brand-border text-slate-400 font-light hover:text-amber-400 transition-colors uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="bg-brand-card/30 border border-brand-border/30 rounded-2xl p-8 text-center text-slate-500 font-mono text-xs">
            <RefreshCw className="w-6 h-6 text-slate-600 mx-auto mb-2 animate-spin-slow" />
            No memories matched the selected filter.
          </div>
        )}
      </div>

    </div>
  );
}
