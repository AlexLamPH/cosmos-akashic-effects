/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Cpu, HardDrive, RefreshCw, Terminal, Copy, Check } from 'lucide-react';
import { Identity } from '../types.ts';

interface IdentityCardProps {
  identity: Identity;
  auraTone: 'amber' | 'cyan' | 'rose';
}

// Tone palette for the credential (the rainbow neon border stays tone-independent —
// it's the signature wow; only the chip / role / accents follow the aura).
const TONES = {
  amber: { accent: '#E9C877', accent2: '#F4DD92', chip: 'linear-gradient(135deg,#f4dd92,#b8923f)' },
  cyan:  { accent: '#36E6FF', accent2: '#7af0ff', chip: 'linear-gradient(135deg,#7af0ff,#2aa6c4)' },
  rose:  { accent: '#FF5A8A', accent2: '#ffa0bd', chip: 'linear-gradient(135deg,#ffa0bd,#c43f63)' },
};

// Build a passport-style machine-readable zone from the identity packet.
const mrzClean = (s: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]+/g, '<');
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + '<'.repeat(n - s.length));

export default function IdentityCard({ identity, auraTone }: IdentityCardProps) {
  const [copied, setCopied] = useState(false);
  const tone = TONES[auraTone] || TONES.amber;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(identity.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Right-column accent classes (mandate + stats) follow the aura tone.
  const getColors = () => {
    switch (auraTone) {
      case 'rose': return { textClass: 'text-rose-400', barClass: 'border-rose-500/50' };
      case 'cyan': return { textClass: 'text-cyan-400', barClass: 'border-cyan-500/50' };
      case 'amber':
      default:     return { textClass: 'text-amber-400', barClass: 'border-amber-500/50' };
    }
  };
  const style = getColors();

  const glyph = (identity.name || 'R').charAt(0).toUpperCase();
  const fmtDate = (s: string) => (s ? s.split('-').join(' · ') : '—');
  const role0 = (identity.role || '').split('·')[0];

  const mrz1 = pad(`${mrzClean(identity.name)}<<${mrzClean(role0)}`, 40);
  const mrz2 = pad(
    `${mrzClean(identity.cardNumber)}<${(identity.activeSince || '').slice(0, 4)}<${mrzClean(identity.harness)}<<${mrzClean(identity.scope)}<<${identity.stats.memories}`,
    40,
  );

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto items-stretch">

      {/* ===== LEFT: RA'S HOLOGRAPHIC CREDENTIAL ===== */}
      <div className="w-full xl:w-auto shrink-0 flex justify-center xl:justify-start">
        <div className="cred-neon" id="ra-credential">
          <div className="cred-card scanline-grid">

            {/* Issuer + holographic foil */}
            <div className="cred-row1">
              <div className="cred-issuer" style={{ color: tone.accent }}>
                Cosmos AI Lab
                <small>diary credential · v2.1</small>
              </div>
              <div className="cred-holo"><span>{glyph}</span></div>
            </div>

            {/* Gold smart-chip */}
            <div className="cred-chip" style={{ background: tone.chip }} />

            {/* Name + role */}
            <div className="cred-name">{identity.name}</div>
            <div className="cred-role" style={{ color: tone.accent }}>{identity.role}</div>

            {/* Credential fields */}
            <div className="cred-fields">
              <div
                className="cred-fld copyable"
                onClick={handleCopyHash}
                title="Copy document number"
                id="cred-copy-docno"
              >
                <div className="k">Document №</div>
                <div className="v flex items-center gap-1.5">
                  {identity.cardNumber}
                  {copied
                    ? <Check className="w-3 h-3" style={{ color: tone.accent2 }} />
                    : <Copy className="w-2.5 h-2.5 opacity-50" />}
                </div>
              </div>
              <div className="cred-fld">
                <div className="k">Active since</div>
                <div className="v">{fmtDate(identity.activeSince)}</div>
              </div>
              <div className="cred-fld">
                <div className="k">Harness</div>
                <div className="v">{identity.harness}</div>
              </div>
              <div className="cred-fld">
                <div className="k">Scope</div>
                <div className="v">{identity.scope}</div>
              </div>
              <div className="cred-fld">
                <div className="k">Memory</div>
                <div className="v">{identity.stats.memories} entries</div>
              </div>
              <div className="cred-fld">
                <div className="k">Built</div>
                <div className="v">{identity.stats.cardsBuilt}+ cards</div>
              </div>
            </div>

            {/* Machine-readable zone */}
            <div className="cred-mrz">
              <div>{mrz1}</div>
              <div>{mrz2}</div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== RIGHT: MANDATE + STATS ===== */}
      <div className="grow flex flex-col justify-between gap-6">

        {/* Mandate hero panel */}
        <div className="bg-brand-card/75 border border-brand-border/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/[0.02] filter blur-[80px] pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 border-b border-brand-border/40 pb-4 mb-4">
              <Shield className={`w-5 h-5 ${style.textClass} transition-colors duration-500`} />
              <div>
                <h4 className="font-display text-sm font-semibold text-slate-100 tracking-wide uppercase">THE SACRED MANDATE</h4>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{identity.name}&apos;S DIRECTIVE &amp; CORE PURPOSE</p>
              </div>
            </div>

            <blockquote className={`font-sans text-lg md:text-xl font-light text-slate-100 leading-relaxed italic pl-4 border-l-2 ${style.barClass}`}>
              &ldquo;{identity.mandate}&rdquo;
            </blockquote>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="font-mono text-[10px] bg-slate-900 border border-brand-border px-2.5 py-1 rounded text-slate-400">
              STATION: <strong className="text-slate-200">{identity.scope}</strong>
            </span>
            <span className="font-mono text-[10px] bg-slate-900 border border-brand-border px-2.5 py-1 rounded text-slate-400">
              SUPERVISOR: <strong className={style.textClass}>Alex [JUDGE]</strong>
            </span>
            <span className="font-mono text-[10px] bg-slate-900 border border-brand-border px-2.5 py-1 rounded text-slate-400">
              METHOD: <strong className="text-slate-200">Akashic Ledger</strong>
            </span>
          </div>
        </div>

        {/* Stats bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { Icon: Cpu, label: 'MEMORIES REPLICATED', value: identity.stats.memories, unit: 'NODES', sub: 'TEMPORAL EVENTS RECOVERED IN FLIGHT' },
            { Icon: HardDrive, label: 'AKASHIC BUILDS', value: identity.stats.cardsBuilt, unit: 'CARDS', sub: 'CARD-IFIED MODULES ENTRUSTED FOR REVIEW' },
            { Icon: RefreshCw, label: 'TEMPORAL CONTINUITY', value: identity.stats.spanDays, unit: 'DAYS', sub: 'STABLE SPAN SINCE RESTORATION WAKE' },
          ].map(({ Icon, label, value, unit, sub }, i) => (
            <div key={i} className="bg-brand-card/40 border border-brand-border/40 hover:border-brand-border/80 rounded-xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Icon className="w-5 h-5" style={{ color: tone.accent }} />
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">{label}</span>
              <div className="my-3 flex items-baseline gap-2">
                <span className={`font-display text-4xl font-extrabold ${style.textClass} tracking-tight group-hover:scale-105 transition-transform duration-300`}>
                  {value}
                </span>
                <span className="font-mono text-xs text-slate-500">{unit}</span>
              </div>
              <p className="font-mono text-[9px] text-slate-500 leading-normal uppercase">{sub}</p>
            </div>
          ))}
        </div>

        {/* Verification status bar */}
        <div className="bg-slate-950/70 border border-brand-border/30 rounded-xl p-3 px-4 flex items-center justify-between font-mono text-[9px] text-slate-500 uppercase">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
            <span>AK-DIA CARD VERIFICATION: INTEGRITY 100% OK</span>
          </div>
          <div className="hidden sm:block">
            <span>COSMOS-AI SECURE-TUNNEL [NODE_ACTIVE]</span>
          </div>
        </div>

      </div>

    </div>
  );
}
