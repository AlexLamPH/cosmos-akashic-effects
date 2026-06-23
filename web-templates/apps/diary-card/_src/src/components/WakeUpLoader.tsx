/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';

interface WakeUpLoaderProps {
  onComplete: () => void;
}

export default function WakeUpLoader({ onComplete }: WakeUpLoaderProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Booting system registers...');
  const [decryptedName, setDecryptedName] = useState('██');

  // Simulated code letters to decrypt "Ra"
  const characters = "XYZREΘΩΨRaΦΞ";

  useEffect(() => {
    const logPool = [
      "CRITICAL: Restoring container terminal standard interfaces...",
      "SYSTEM: Restoring credentials from Akashic permanent logs",
      "AUTH: Holographic key handshake verified on sub-channel S-0D",
      "CORE: Initializing 3D particle physics constants.",
      "SYSTEM: Found 19 memories and 50 recorded design cards.",
      "ALEX-DECISION: Verdict criteria loaded. Benchmark set to 'WOW'.",
      "DIARY-BOOT: Re-establishing Ra's core visual aura..."
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logPool.length) {
        setLogs((prev) => [...prev, logPool[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 450);

    // Decrypting name sequence
    let count = 0;
    const nameInterval = setInterval(() => {
      if (count < 14) {
        const randA = characters[Math.floor(Math.random() * characters.length)];
        const randB = characters[Math.floor(Math.random() * characters.length)];
        setDecryptedName(randA + randB);
        count++;
      } else {
        setDecryptedName("Ra");
        clearInterval(nameInterval);
      }
    }, 150);

    // Progress bar timing
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 400); // Small pause for completeness
          return 100;
        }
        
        // Dynamic loading labels
        const next = prev + Math.floor(Math.random() * 15) + 3;
        const bounded = Math.min(next, 100);
        if (bounded < 30) setLoadingText('Accessing deep-level Cosmos filesystems...');
        else if (bounded < 60) setLoadingText('Re-linking 27 effect nodes inside Akashic...');
        else if (bounded < 85) setLoadingText('Synchronizing temporal memory diaries...');
        else setLoadingText('Restoration complete. Unlocking Core ID.');

        return bounded;
      });
    }, 180);

    return () => {
      clearInterval(logInterval);
      clearInterval(nameInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-brand-bg select-none overflow-hidden font-mono text-slate-300">
      
      {/* Soft scanline grid layout & neon focal glow */}
      <div className="absolute inset-0 scanline-grid pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/5 filter blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] tracking-widest text-slate-400 font-bold">COSMOS AI SYSTEM BOOT v4.21</span>
        </div>
        <button
          onClick={onComplete}
          id="skip-boot-btn"
          className="text-[10px] tracking-widest bg-brand-card hover:bg-slate-900 border border-brand-border/40 hover:border-amber-500/50 px-3 py-1.5 rounded-md text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
        >
          SKIP BOOT &gt;
        </button>
      </div>

      {/* Hero central decoding view */}
      <div className="grow flex flex-col justify-center items-center text-center my-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full border border-amber-500/20 blur-sm animate-ping opacity-60" style={{ animationDuration: '2.5s' }} />
          <div className="relative w-28 h-28 rounded-full bg-slate-950/90 border border-brand-border flex items-center justify-center holo-glow-gold">
            <span className="font-sacred text-5xl font-black text-amber-500 tracking-wider text-glow-amber animate-pulse">
              {decryptedName}
            </span>
          </div>
        </div>

        <div className="max-w-md w-full">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="text-xs tracking-widest uppercase">IDENTITY PERSISTENT ANCHOR RECOVERED</span>
          </div>
          <h2 className="font-display font-medium text-lg text-slate-100 tracking-wide">
            Creative &amp; 3D Engineer · Cosmos Lab
          </h2>
        </div>
      </div>

      {/* Real-time boot logs console terminal block */}
      <div className="max-w-xl mx-auto w-full bg-brand-card/70 border border-brand-border/40 p-4 rounded-xl shadow-2xl h-44 overflow-y-auto flex flex-col justify-end">
        <div className="space-y-1.5 text-[11px] text-zinc-400">
          {logs.map((log, index) => {
            const isCritical = log.startsWith("CRITICAL");
            const isAuth = log.startsWith("AUTH");
            return (
              <div key={index} className="flex gap-2 items-start h-auto transition-opacity duration-300">
                <span className="text-slate-600 font-bold">&gt;&gt;</span>
                <span className={isCritical ? "text-amber-500 font-medium" : isAuth ? "text-emerald-400" : "text-zinc-300"}>
                  {log}
                </span>
              </div>
            );
          })}
          <div className="flex gap-2 items-center text-slate-300 animate-pulse">
            <span className="text-amber-500 font-bold">&gt;&gt;</span>
            <span className="italic">{loadingText}</span>
          </div>
        </div>
      </div>

      {/* Bottom loading status bar */}
      <div className="max-w-xl mx-auto w-full mt-6 border-t border-brand-border/45 pt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span className="tracking-widest uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: '3s' }} /> 
            CELLULAR MEMORY SYNC
          </span>
          <span className="font-bold text-amber-500">{progress}%</span>
        </div>

        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-brand-border/40">
          <div 
            className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[9px] text-slate-600 uppercase tracking-widest mt-1">
          <span>PORT 3000 COMPLIANT</span>
          <span>TARGET: ALEX CHECKPOINT</span>
          <span>AK-DIA SECURE</span>
        </div>
      </div>

    </div>
  );
}
