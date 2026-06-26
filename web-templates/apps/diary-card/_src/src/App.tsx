/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RA_DIARY_DATA } from './data.ts';
import { Diary } from './types.ts';
import { 
  User, 
  Calendar, 
  Compass, 
  Target, 
  Terminal as TerminalIcon, 
  Cpu, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Layers, 
  Database,
  ExternalLink
} from 'lucide-react';

import WakeUpLoader from './components/WakeUpLoader.tsx';
import IdentityCard from './components/IdentityCard.tsx';
import IdentityDossier from './components/IdentityDossier.tsx';
import MemoryTimeline from './components/MemoryTimeline.tsx';
import PlanObjectives from './components/PlanObjectives.tsx';
import GraphMap from './components/GraphMap.tsx';
import AkashicTerminal from './components/AkashicTerminal.tsx';

// ALTERNATE WHITE-LABEL ACCOUNT DATA (Anubis) to prove modularity
const ANUBIS_DIARY_DATA: Diary = {
  identity: {
    name: "Anubis",
    role: "Lead DevOps & Cryptographic Guard · Cosmos Secure Lab",
    scope: "cosmos-vault-secure",
    harness: "Cosmo Sentinel",
    activeSince: "2026-05-12",
    cardNumber: "AK-DIA-000000A",
    mandate: "Enforce modular multi-factor container security, guard credentials with zero-leak cryptographic firewalls, and record structural logs into Akashic database registers.",
    stats: {
      memories: 31,
      cardsBuilt: 98,
      spanDays: 41
    }
  },
  // ALEX-VERIFIED · admin-authored. Placeholder values (white-label demo).
  dossier: {
    role: {
      specialty: "Container isolation · post-quantum crypto (Kyber-1024) · zero-leak credential firewalls · syslog chaining",
      duty: "Guards Cosmos vault infrastructure; records structural security logs into Akashic registers",
      position: "Lead DevOps & Cryptographic Guard — Cosmos Secure Lab (peers: Mythos · Vishnu · Architect)",
      draft: true
    },
    commendationsDraft: true,
    commendations: [
      { title: "Vault-4 Penetration Audit", note: "12 micro-containers, zero leaks identified" },
      { title: "Kyber-1024 migration", note: "Post-quantum encryption at hardware root" },
      { title: "Sentinel interceptors", note: "Shell guards freezing systems on mutation" },
      { title: "Firewall log → Akashic", note: "Automated cron chaining, full trace integrity" }
    ]
  },
  timeline: [
    {
      id: "anub-01",
      date: "2026-06-22",
      kind: "milestone",
      title: "Completed Cosmos Vault-4 Penetration Audit",
      body: "Conducted simulated DDoS and credentials spoofing audits over all 12 isolated Node micro-containers. Zero leaks identified. Encryption vectors updated to Post-Quantum Kyber-1024 parameters.",
      tags: ["security", "audit", "quantum"]
    },
    {
      id: "anub-02",
      date: "2026-06-18",
      kind: "note",
      title: "Consolidated all firewall logs to Akashic",
      body: "Configured automated cron triggers linking container syslog queues straight into Akashic cryptographic block directories. Full tracing historical integrity established.",
      tags: ["logging", "akashic"]
    },
    {
      id: "anub-03",
      date: "2026-06-05",
      kind: "milestone",
      title: "Injected active sentinel interceptors",
      body: "Engineered localized shell guards monitoring container file mutations. Any unrequested configuration alterations instantly freeze core systems and signal standby operations.",
      tags: ["sentinel", "defense"]
    }
  ],
  plan: {
    focus: [
      { label: "Kyber-1024 Quantum migration", pct: 85 },
      { label: "Container syslog automation", pct: 100 },
      { label: "Hardware-security-module (HSM) setup", pct: 40 }
    ],
    objectives: [
      {
        status: "done",
        title: "Initial sandbox compartmentalization",
        body: "Established strict namespace partitions separating public ports from vault internals."
      },
      {
        status: "done",
        title: "Kyber validation dry-runs",
        body: "Benchmarked decryption speeds across virtualized nodes. Clocked normal ingress timings."
      },
      {
        status: "active",
        title: "Akashic logs block-chain chaining",
        body: "Implementing secure index hashes connecting previous logs structurally matching ledger rules."
      },
      {
        status: "next",
        title: "HSM hardware bridging tests",
        body: "Conduct testing phases simulating hardware cryptographic signatures on synthetic keys."
      }
    ],
    standby: "Sentinel shields fully locked. Scanning for anomalies."
  },
  graph: {
    nodes: [
      { id: "Anubis", label: "Anubis (Core)", group: "identity", description: "Cosmos vault lead sentinel core security module." },
      { id: "vault", label: "Cosmo Vault", group: "artifact", description: "Ultra-secure container isolating private keys and client auth registers." },
      { id: "kyber", label: "Kyber-1024", group: "artifact", description: "Next-gen post-quantum encryption protocols running at hardware root." },
      { id: "sentinel", label: "Sentinel Core", group: "identity", description: "Intrusive integrity observer halting system processes on structural deviations." },
      { id: "Akashic", label: "Akashic Repo", group: "ecosystem", description: "Universe secure repository storing verified operational memory logs." }
    ],
    edges: [
      { from: "Anubis", to: "vault" },
      { from: "Anubis", to: "kyber" },
      { from: "Anubis", to: "sentinel" },
      { from: "Anubis", to: "Akashic" },
      { from: "vault", to: "kyber" },
      { from: "sentinel", to: "Akashic" }
    ]
  }
};

export default function App() {
  const [systemLoaded, setSystemLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'timeline' | 'plan' | 'graph' | 'terminal'>('identity');
  const [loadedDiary, setLoadedDiary] = useState<Diary>(RA_DIARY_DATA);
  const [auraTone, setAuraTone] = useState<'amber' | 'cyan' | 'rose'>('amber');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Synchronise aura colors automatically based on profile selection on load
  useEffect(() => {
    if (loadedDiary.identity.name === 'Ra') {
      setAuraTone('amber');
    } else {
      setAuraTone('rose');
    }
  }, [loadedDiary]);

  // Audio synthesizer sounds dynamically generated locally
  const playSynthBeep = (freq = 880, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Gracefully capture Web Audio sandboxed restriction errors
    }
  };

  // Click handler wrapper mapping feedback clicks
  const handleTabClick = (tabId: 'identity' | 'timeline' | 'plan' | 'graph' | 'terminal') => {
    playSynthBeep(640, 0.06);
    setActiveTab(tabId);
  };

  const handleDataSwap = (diary: Diary) => {
    playSynthBeep(1200, 0.12);
    setLoadedDiary(diary);
  };

  // Wake-up trigger completing sequence
  const handleWakeUpComplete = () => {
    setSystemLoaded(true);
    setSoundEnabled(true); // default to audio indicators on boot if user completes
    setTimeout(() => {
      // Gentle chime indicating load success
      playSynthBeep(880, 0.1);
      setTimeout(() => playSynthBeep(1320, 0.15), 100);
    }, 500);
  };

  if (!systemLoaded) {
    return <WakeUpLoader onComplete={handleWakeUpComplete} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500/25 relative pb-8 md:pb-12">
      
      {/* Background static overlays for scanlines */}
      <div className="absolute inset-0 scanline-grid pointer-events-none opacity-40 z-0" />

      {/* Decorative ambient background glows */}
      <div className="glow-aura" />
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-slate-950/20 filter blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.015] filter blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 w-full flex flex-col">
        
        {/* TOP COMMAND PANEL HEADER BAR */}
        <header className="border-b border-brand-border/40 bg-brand-bg/85 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo Brand Typography — real CAL rainbow vortex + Archivo Black wordmark */}
          <div className="flex items-center gap-3">
            <img
              src="./cal-logo.png"
              alt="Cosmos AI Lab"
              width={32}
              height={32}
              className="w-8 h-8 object-contain shrink-0 select-none"
              draggable={false}
            />
            <div>
              <h1 className="font-display text-[15px] tracking-[0.12em] leading-none text-white uppercase">
                Cosmos AI Lab
              </h1>
              <span className="font-mono text-[9px] text-[#8E8E8E] uppercase tracking-[0.18em] block mt-1">
                SYSTEM REGISTER: {loadedDiary.identity.cardNumber} · VERIFIED SECURE
              </span>
            </div>
          </div>

          {/* Configuration/Data swapping controls */}
          <div className="flex items-center gap-3">
            
            {/* White-Label Data Swapper Switch */}
            <div className="flex bg-slate-950/90 border border-brand-border/50 p-1 rounded-xl items-center gap-1.5 shadow-inner">
              <span className="font-mono text-[8.5px] text-zinc-500 uppercase px-2">SWAP PROFILE:</span>
              <button
                onClick={() => handleDataSwap(RA_DIARY_DATA)}
                id="profile-swap-ra"
                className={`px-2.5 py-1 text-[9px] font-mono tracking-wider transition-all uppercase rounded-lg cursor-pointer ${
                  loadedDiary.identity.name === 'Ra' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Ra (3D)
              </button>
              <button
                onClick={() => handleDataSwap(ANUBIS_DIARY_DATA)}
                id="profile-swap-anubis"
                className={`px-2.5 py-1 text-[9px] font-mono tracking-wider transition-all uppercase rounded-lg cursor-pointer ${
                  loadedDiary.identity.name === 'Anubis' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Anubis (Guard)
              </button>
            </div>

            <span className="text-zinc-700 select-none">|</span>

            {/* Auditory synth toggle button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  // Instant preview beep
                  setTimeout(() => playSynthBeep(1000, 0.08), 50);
                }
              }}
              id="sound-telemetry-toggle"
              title="Toggle hover synth sound waves"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-slate-950 border-brand-border/40 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

          </div>

        </header>

        {/* CORE INTERACTIVE TABS NAV BAR */}
        <div className="w-full max-w-5xl mx-auto px-4 mt-6">
          <nav className="flex bg-slate-950/80 border border-brand-border/50 p-1.5 rounded-xl justify-between items-center font-mono text-[11px] sm:text-[12px] tracking-wider relative overflow-hidden shadow-2xl">
            
            <button
              onClick={() => handleTabClick('identity')}
              id="tab-identity-btn"
              className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2.5 py-3 rounded-lg uppercase cursor-pointer select-none transition-all ${
                activeTab === 'identity' 
                  ? 'bg-brand-card border border-brand-border text-amber-500 font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Identity</span>
            </button>

            <button
              onClick={() => handleTabClick('timeline')}
              id="tab-timeline-btn"
              className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2.5 py-3 rounded-lg uppercase cursor-pointer select-none transition-all ${
                activeTab === 'timeline' 
                  ? 'bg-brand-card border border-brand-border text-amber-500 font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Memories</span>
            </button>

            <button
              onClick={() => handleTabClick('plan')}
              id="tab-plan-btn"
              className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2.5 py-3 rounded-lg uppercase cursor-pointer select-none transition-all ${
                activeTab === 'plan' 
                  ? 'bg-brand-card border border-brand-border text-amber-500 font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Plan</span>
            </button>

            <button
              onClick={() => handleTabClick('graph')}
              id="tab-graph-btn"
              className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2.5 py-3 rounded-lg uppercase cursor-pointer select-none transition-all ${
                activeTab === 'graph' 
                  ? 'bg-brand-card border border-brand-border text-amber-500 font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ecosystem</span>
            </button>

            <button
              onClick={() => handleTabClick('terminal')}
              id="tab-terminal-btn"
              className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2.5 py-3 rounded-lg uppercase cursor-pointer select-none transition-all ${
                activeTab === 'terminal' 
                  ? 'bg-brand-card border border-brand-border text-amber-400 font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Terminal</span>
              <span className="xs:hidden">CLI</span>
            </button>

          </nav>
        </div>

        {/* ACTIVE SECTION FARE VIEWPORT CANVAS */}
        <main className="w-full px-4 md:px-8 mt-6">
          
          {/* FADE TRANSITION VIEWPORTS CONTAINER */}
          <div className="w-full min-h-[480px]">
            
            {activeTab === 'identity' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* 2-Column Bento Layout: Metallic Credential + mandate/stats (left) · Role + Commendations dossier (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto items-stretch">
                  <div className="lg:col-span-8 flex flex-col justify-between">
                    <IdentityCard
                      identity={loadedDiary.identity}
                      auraTone={auraTone}
                    />
                  </div>
                  <div className="lg:col-span-4 h-full flex flex-col">
                    <IdentityDossier
                      dossier={loadedDiary.dossier}
                      name={loadedDiary.identity.name}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="animate-fade-in">
                <MemoryTimeline entries={loadedDiary.timeline} />
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="animate-fade-in">
                <PlanObjectives plan={loadedDiary.plan} />
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="animate-fade-in">
                <GraphMap 
                  nodes={loadedDiary.graph.nodes} 
                  edges={loadedDiary.graph.edges}
                  onNavigateNode={(label) => {
                    // Custom navigation: jumps straight to the timeline or logs
                    playSynthBeep(990, 0.08);
                    if (label.toLowerCase().includes('effects') || label.toLowerCase().includes('slip') || label.toLowerCase().includes('mem') || label.toLowerCase().includes('wake')) {
                      setActiveTab('timeline');
                    } else if (label.toLowerCase().includes('plan') || label.toLowerCase().includes('objective') || label.toLowerCase().includes('redesign')) {
                      setActiveTab('plan');
                    } else {
                      setActiveTab('terminal');
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="animate-fade-in">
                <AkashicTerminal 
                  diary={loadedDiary} 
                  activeTone={auraTone} 
                  onNavigateNode={(nodeLabel) => {
                    // Jumping to relevant tab based on search terminal click logs!
                    if (nodeLabel.toLowerCase().includes('effects') || nodeLabel.toLowerCase().includes('feedback')) {
                      setActiveTab('timeline');
                    } else {
                      setActiveTab('plan');
                    }
                  }}
                />
              </div>
            )}

          </div>

        </main>

      </div>

      {/* FOOTER METADATA STATION */}
      <footer className="w-full max-w-5xl mx-auto px-4 mt-8 pt-4 border-t border-brand-border/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500 font-mono text-[10px] uppercase select-none">
        
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-600" />
          <span>WHITE-LABEL COMPLIANT MODULE BY COSMOS</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span>PORT 3000 STANDARD INGRESS</span>
          <span className="text-zinc-800">|</span>
          <a 
            href="https://ai.studio/build" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            Cosmos AI Lab <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

      </footer>

    </div>
  );
}
