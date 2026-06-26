/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Cpu, HardDrive, RefreshCw, Terminal, Copy, Check } from 'lucide-react';
import { Identity } from '../types.ts';

interface IdentityCardProps {
  identity: Identity;
  auraTone?: 'amber' | 'cyan' | 'rose';
}

// Build a passport-style machine-readable zone from the identity packet.
const mrzClean = (s: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]+/g, '<');
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + '<'.repeat(n - s.length));

export default function IdentityCard({ identity }: IdentityCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(identity.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmtDate = (s: string) => (s ? s.split('-').join(' · ') : '—');
  const role0 = (identity.role || '').split('·')[0];

  const mrz1 = pad(`${mrzClean(identity.name)}<<${mrzClean(role0)}`, 40);
  const mrz2 = pad(
    `${mrzClean(identity.cardNumber)}<${(identity.activeSince || '').slice(0, 4)}<${mrzClean(identity.harness)}<<${mrzClean(identity.scope)}<<${identity.stats.memories}`,
    40,
  );

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto items-stretch">

      {/* ===== LEFT: RA'S PLATINUM METAL CREDENTIAL (Phantom Lab v2.0, clean) ===== */}
      <div className="w-full xl:w-auto shrink-0 flex justify-center xl:justify-start">
        <div className="cred-neon" id="ra-credential">
          <div className="cred-card scanline-grid">

            {/* fine amber corner bracket */}
            <div className="cred-bracket" aria-hidden="true" />

            {/* Issuer + CAL logo */}
            <div className="cred-row1">
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <img src="./cal-logo.png" alt="Cosmos AI Lab" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                <div className="cred-issuer" style={{ color: '#FF8A1F' }}>
                  Cosmos AI Lab
                  <small>diary credential · v2.0</small>
                </div>
              </div>
            </div>

            {/* Hero — vortex avatar + name */}
            <div className="cred-hero">
              <div
                className="cred-chip"
                role="img"
                aria-label={`${identity.name} vortex portrait`}
              />
              <div className="cred-who">
                <div className="cred-name">{identity.name}</div>
                <div className="cred-role" style={{ color: '#FF8A1F' }}>{role0.trim() || identity.role}</div>
                <div className="cred-sub">Cosmos AI Lab</div>
              </div>
            </div>

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
                    ? <Check className="w-3 h-3" style={{ color: '#FF8A1F' }} />
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

            {/* Bottom strip — mandate + machine-readable zone */}
            <div className="cred-strip">
              <div className="cred-mandate">Keeper of thin memory — building knowledge for the Cosmos.</div>
              <div className="cred-mrz">
                <div>{mrz1}</div>
                <div>{mrz2}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== RIGHT: MANDATE + STATS (Phantom Lab) ===== */}
      <div className="grow flex flex-col justify-between gap-6">

        {/* Mandate hero panel */}
        <div className="bg-brand-card border border-brand-border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 allow-round rounded-full bg-[#FF8A1F]/[0.03] filter blur-[80px] pointer-events-none" />

          <div>
            <div className="flex items-center gap-2.5 border-b border-brand-border pb-4 mb-4">
              <Shield className="w-5 h-5 text-[#FF8A1F]" />
              <div>
                <h4 className="font-display text-[13px] text-white tracking-[0.06em] uppercase">THE SACRED MANDATE</h4>
                <p className="font-mono text-[10px] text-[#8E8E8E] uppercase tracking-[0.2em] mt-0.5">{identity.name}&apos;S DIRECTIVE &amp; CORE PURPOSE</p>
              </div>
            </div>

            <blockquote className="font-serif text-lg md:text-xl italic text-[#E8E8E8] leading-relaxed pl-4 border-l-2 border-[#FF8A1F]/60">
              &ldquo;{identity.mandate}&rdquo;
            </blockquote>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="font-mono text-[10px] bg-black border border-brand-border px-2.5 py-1 text-[#8E8E8E] uppercase tracking-wide">
              STATION: <strong className="text-[#E8E8E8] font-normal">{identity.scope}</strong>
            </span>
            <span className="font-mono text-[10px] bg-black border border-brand-border px-2.5 py-1 text-[#8E8E8E] uppercase tracking-wide">
              SUPERVISOR: <strong className="text-[#FF8A1F] font-normal">Alex [JUDGE]</strong>
            </span>
            <span className="font-mono text-[10px] bg-black border border-brand-border px-2.5 py-1 text-[#8E8E8E] uppercase tracking-wide">
              METHOD: <strong className="text-[#E8E8E8] font-normal">Akashic Ledger</strong>
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
            <div key={i} className="bg-brand-card border border-brand-border hover:border-[#FF8A1F]/40 p-5 flex flex-col justify-between transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-25 group-hover:opacity-50 transition-opacity">
                <Icon className="w-5 h-5 text-[#FF8A1F]" />
              </div>
              <span className="font-mono text-[10px] text-[#8E8E8E] uppercase tracking-[0.2em] block">{label}</span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-display text-4xl text-white tracking-tight">
                  {value}
                </span>
                <span className="font-mono text-xs text-[#FF8A1F]">{unit}</span>
              </div>
              <p className="font-mono text-[9px] text-[#8E8E8E] leading-normal uppercase tracking-wide">{sub}</p>
            </div>
          ))}
        </div>

        {/* Verification status bar */}
        <div className="bg-black border border-brand-border p-3 px-4 flex items-center justify-between font-mono text-[9px] text-[#8E8E8E] uppercase tracking-wide">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#FF8A1F] animate-pulse" />
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
