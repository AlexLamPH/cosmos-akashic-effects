/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Search, CornerDownLeft, Sparkles, Cpu, Layers } from 'lucide-react';
import { Diary, TimelineEntry, Objective } from '../types.ts';

interface AkashicTerminalProps {
  diary: Diary;
  activeTone: 'amber' | 'cyan' | 'rose';
  onNavigateNode?: (nodeLabel: string) => void;
}

interface TerminalLog {
  type: 'input' | 'system' | 'result';
  text: string;
}

export default function AkashicTerminal({ diary, activeTone, onNavigateNode }: AkashicTerminalProps) {
  const [terminalInput, setTerminalInput] = useState('');
  const [logs, setLogs] = useState<TerminalLog[]>([
    { type: 'system', text: "Akashic Database Query Terminal [Node V-DIA4] Standard Interface." },
    { type: 'system', text: "Type keyword query or click prompt buttons below to query Ra's memories." },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick prompt codes for prompt buttons
  const promptButtons = [
    { label: 'Alex Feedback', query: 'Alex ui feedback' },
    { label: 'Playwright Preview', query: 'playwright preview' },
    { label: 'Card Discipline', query: 'card-ify rule' },
    { label: 'Core Mandate', query: 'mandate query' },
  ];

  // Colors mapping based on parent tone
  const getOutputColor = () => {
    switch (activeTone) {
      case 'rose': return 'text-rose-400';
      case 'cyan': return 'text-cyan-400';
      case 'amber':
      default:
        return 'text-amber-400';
    }
  };

  // Scroll to bottom when logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle Typewriter rendering dynamically
  const printTypewriterLine = (fullText: string, delay = 15) => {
    setIsTyping(true);
    let currentText = '';
    const textInterval = setInterval(() => {
      if (currentText.length < fullText.length) {
        currentText += fullText[currentText.length];
        
        // Update the last log item dynamically
        setLogs((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].type === 'result') {
            updated[updated.length - 1] = { type: 'result', text: currentText };
          } else {
            updated.push({ type: 'result', text: currentText });
          }
          return updated;
        });
      } else {
        clearInterval(textInterval);
        setIsTyping(false);
      }
    }, delay);
  };

  // Run the search algorithm over the diary
  const handleQuerySubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    if (isTyping) return;

    const query = (customQuery || terminalInput).trim();
    if (!query) return;

    // Log user input
    setLogs((prev) => [...prev, { type: 'input', text: query }]);
    setTerminalInput('');

    // Pre-empt helper logs
    if (query.toLowerCase() === 'help') {
      printTypewriterLine("HELP MANUAL ON DIRECTIVES:\n - stats: diagnostic logs\n - memory: view chronos records\n - mandate: raw sacred drive code\n - [keyword]: search indexing memory logs", 10);
      return;
    }

    if (query.toLowerCase() === 'stats') {
      const statsText = `DIAGNOSTIC EXPORT:\n Name: ${diary.identity.name}\n Role: ${diary.identity.role}\n Scope: ${diary.identity.scope}\n Status: Operational\n Temporal Memories: ${diary.identity.stats.memories} sectors\n Card Builds: ${diary.identity.stats.cardsBuilt} registered`;
      printTypewriterLine(statsText, 10);
      return;
    }

    // Search algorithm running substring matching in memories
    const matches: string[] = [];
    const normalizedQuery = query.toLowerCase();

    // 1. Search Timeline entries
    diary.timeline.forEach((entry) => {
      if (
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.body.toLowerCase().includes(normalizedQuery) ||
        entry.tags.some(t => t.toLowerCase().includes(normalizedQuery))
      ) {
        matches.push(`[MEMORY] ${entry.date} · ${entry.title.toUpperCase()}\n   -> "${entry.body.substring(0, 130)}..."`);
      }
    });

    // 2. Search Plan objectives
    diary.plan.focus.forEach((f) => {
      if (f.label.toLowerCase().includes(normalizedQuery)) {
        matches.push(`[PLAN FOCUS] Trajectory prioritized: ${f.label.toUpperCase()} (${f.pct}% match)`);
      }
    });

    diary.plan.objectives.forEach((obj) => {
      if (obj.title.toLowerCase().includes(normalizedQuery) || obj.body.toLowerCase().includes(normalizedQuery)) {
        matches.push(`[PLAN OBJECTIVE] ${obj.title.toUpperCase()} (Status: ${obj.status})\n   -> Detail: "${obj.body}"`);
      }
    });

    // 3. Search Identity Card mandate
    if (diary.identity.mandate.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes('mandate')) {
      matches.push(`[MANDATE DIRECTIVE] Active Core Rule:\n   -> "${diary.identity.mandate}"`);
    }

    // Construct reply
    if (matches.length > 0) {
      const header = `AKASHIC CORRELATION SEARCH COMPLETE. FOUND ${matches.length} MATCHES:\n\n`;
      const fullResponse = header + matches.join("\n\n");
      printTypewriterLine(fullResponse, 8);
    } else {
      printTypewriterLine(`QUERY COMPLETE. ZERO records found matching "${query}".\nTips: Try searching for keywords like "Playwright", "Alex", "render", or "Slider".`, 12);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-brand-card/75 border border-brand-border/60 rounded-2xl p-4 md:p-6 backdrop-blur-md">
      
      {/* Title head bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-brand-border/40 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <TerminalIcon className={` some-color w-5 h-5 ${getOutputColor()} animate-pulse`} />
          <div>
            <h4 className="font-display text-sm font-semibold text-slate-100 tracking-wide uppercase">AKASHIC SEARCH LOGS TERMINAL</h4>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Type commands or query keywords relating to Ra&apos;s actions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 font-mono text-[9.5px]">
          <span className="flex items-center gap-1 text-slate-500 uppercase">
            <Cpu className="w-3.5 h-3.5" /> Core: RA-LOBE
          </span>
          <span className="text-zinc-650">|</span>
          <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
            SECURE QUERY ONLINE
          </span>
        </div>
      </div>

      {/* Terminal logs viewport screen */}
      <div 
        ref={scrollRef}
        id="terminal-monitor"
        className="w-full h-64 bg-slate-950/90 border border-brand-border/40 rounded-xl p-4 md:p-5 font-mono text-[11px] md:text-xs overflow-y-auto scanline-grid space-y-3 shadow-inner"
      >
        {logs.map((log, index) => {
          if (log.type === 'input') {
            return (
              <div key={index} className="flex gap-2 text-slate-350 select-none">
                <span className={`${getOutputColor()} font-bold`}>ra_guest@akashic:~$</span>
                <span>{log.text}</span>
              </div>
            );
          }
          if (log.type === 'system') {
            return (
              <div key={index} className="text-slate-500 leading-relaxed uppercase select-none">
                <span className="mr-1.5 font-bold">[SYS]</span>
                {log.text}
              </div>
            );
          }
          return (
            <div key={index} className="text-slate-100 leading-relaxed whitespace-pre-wrap flex items-start gap-1">
              <span className="text-emerald-500 font-bold select-none">[RES]</span>
              <span>{log.text}</span>
            </div>
          );
        })}
        {isTyping && (
          <span className="inline-block w-1.5 h-4 bg-amber-500 scale-95 translate-y-[2px] animate-pulse" />
        )}
      </div>

      {/* Quick clickable Query chips prompt panel */}
      <div className="my-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] text-slate-500 uppercase flex items-center gap-1 pr-1">
          <Layers className="w-3.5 h-3.5" /> QUICK TELEMETRY KEYS:
        </span>
        {promptButtons.map((btn, index) => (
          <button
            key={index}
            disabled={isTyping}
            onClick={() => handleQuerySubmit(undefined, btn.query)}
            id={`quick-chip-${btn.query.replace(/\s+/g, '-')}`}
            className="px-2.5 py-1 text-[10.5px] font-mono tracking-wide rounded-lg bg-slate-900 border border-brand-border/40 hover:border-amber-500/40 text-slate-400 hover:text-slate-200 transition-all cursor-pointer hover:bg-slate-950 disabled:opacity-50"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Interactive terminal form input bar */}
      <form onSubmit={handleQuerySubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          type="text"
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          disabled={isTyping}
          placeholder='Query memories (e.g., "playwright", "Alex feedback", or type "help" / "stats"...)'
          className="w-full bg-slate-950 border border-brand-border/60 hover:border-brand-border focus:border-amber-500/50 rounded-xl p-3 pl-10 pr-12 font-mono text-[11px] md:text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 shadow-inner"
        />

        <div className="absolute right-3">
          <button
            type="submit"
            disabled={isTyping || !terminalInput.trim()}
            id="terminal-enter-btn"
            title="Execute query"
            className="bg-slate-900 hover:bg-slate-850 p-1.5 rounded-md border border-brand-border/50 text-slate-400 hover:text-slate-200 transition-all disabled:opacity-40"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
}
