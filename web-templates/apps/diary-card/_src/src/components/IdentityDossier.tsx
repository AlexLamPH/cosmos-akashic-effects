/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BadgeCheck, Award, Briefcase } from 'lucide-react';
import { Dossier } from '../types.ts';

interface IdentityDossierProps {
  dossier: Dossier;
  name: string;
}

// "ALEX-VERIFIED" badge — signals the AI does NOT self-author these sections.
// Only Alex sets them (by instructing the AI, or editing the card directly).
function VerifiedBadge() {
  return (
    <span className="dossier-badge" title="Admin-authored — the AI does not self-author this. Only Alex sets it.">
      <BadgeCheck className="w-3 h-3" />
      ALEX-VERIFIED · admin-authored
    </span>
  );
}

function DraftTag() {
  return <span className="dossier-draft">draft · chờ Alex duyệt</span>;
}

export default function IdentityDossier({ dossier, name }: IdentityDossierProps) {
  const { role, commendations } = dossier;

  return (
    <div className="w-full h-full flex flex-col gap-6">

      {/* ===== SECTION 1 — ROLE · VỊ TRÍ TRONG CAL ===== */}
      <section className="bg-brand-card border border-brand-border relative overflow-hidden flex flex-col">
        {/* amber edge accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF8A1F]/60 pointer-events-none" />

        <div className="flex items-start justify-between gap-3 border-b border-brand-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-[18px] h-[18px] text-[#FF8A1F]" />
            <div>
              <h3 className="font-display text-[13px] text-white tracking-[0.05em] uppercase leading-none">ROLE</h3>
              <p className="font-mono text-[9px] text-[#8E8E8E] tracking-[0.18em] uppercase mt-1">VỊ TRÍ TRONG CAL</p>
            </div>
          </div>
          <VerifiedBadge />
        </div>

        <div className="px-5 py-4 flex flex-col gap-3.5">
          {role.draft && <div><DraftTag /></div>}

          {[
            { k: 'Specialty', vn: 'Chuyên môn', v: role.specialty },
            { k: 'Role', vn: 'Vai trò', v: role.duty },
            { k: 'Position', vn: 'Vị trí', v: role.position },
          ].map(({ k, vn, v }) => (
            <div key={k} className="bg-black border border-brand-border px-3.5 py-2.5">
              <div className="font-mono text-[8.5px] text-[#FF8A1F] tracking-[0.16em] uppercase mb-1">
                {k} <span className="text-[#8E8E8E]">· {vn}</span>
              </div>
              <p className="font-sans text-[12.5px] text-[#E8E8E8] leading-snug">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 2 — COMMENDATIONS · TUYÊN DƯƠNG (wall of recognition) ===== */}
      <section className="bg-brand-card border border-brand-border relative overflow-hidden grow flex flex-col">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF8A1F]/60 pointer-events-none" />

        <div className="flex items-start justify-between gap-3 border-b border-brand-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-[18px] h-[18px] text-[#FF8A1F]" />
            <div>
              <h3 className="font-display text-[13px] text-white tracking-[0.05em] uppercase leading-none">COMMENDATIONS</h3>
              <p className="font-mono text-[9px] text-[#8E8E8E] tracking-[0.18em] uppercase mt-1">TUYÊN DƯƠNG</p>
            </div>
          </div>
          <VerifiedBadge />
        </div>

        <div className="px-5 py-4 flex flex-col gap-2.5">
          {dossier.commendationsDraft && <div><DraftTag /></div>}

          {commendations.map((c, i) => (
            <div key={i} className="commend-row group">
              <div className="flex items-start gap-3">
                {/* honour-roll index numeral, amber */}
                <span className="font-display text-[13px] text-[#FF8A1F] leading-none pt-0.5 shrink-0 w-5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-sans text-[13px] font-semibold text-white leading-snug">{c.title}</span>
                    {c.date && <span className="font-mono text-[8.5px] text-[#8E8E8E] tracking-wide">{c.date}</span>}
                  </div>
                  <p className="font-sans text-[11.5px] text-[#8E8E8E] leading-snug mt-0.5">{c.note}</p>
                </div>
              </div>
            </div>
          ))}

          {/* honour-roll footer line */}
          <div className="mt-1 pt-3 border-t border-brand-border flex items-center justify-between font-mono text-[8.5px] text-[#8E8E8E] uppercase tracking-[0.14em]">
            <span>{name} · WALL OF RECOGNITION</span>
            <span className="text-[#FF8A1F]">{commendations.length} ENTRIES</span>
          </div>
        </div>
      </section>

    </div>
  );
}
