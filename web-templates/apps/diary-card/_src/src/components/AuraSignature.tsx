/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

interface AuraSignatureProps {
  currentTone: 'amber' | 'cyan' | 'rose';
  onChangeTone: (tone: 'amber' | 'cyan' | 'rose') => void;
}

export default function AuraSignature({ currentTone, onChangeTone }: AuraSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Get color properties based on current tone
  const getToneColors = () => {
    switch (currentTone) {
      case 'rose':
        return {
          primary: 'rgba(244, 63, 94, 0.25)', // Rose-500
          secondary: 'rgba(190, 24, 74, 0.15)', // Rose-700
          accent: 'rgba(253, 244, 245, 0.05)',
          glow: 'rgba(244, 63, 94, 0.4)',
          shadow: 'shadow-red-950/40',
          border: 'border-rose-500/30',
        };
      case 'cyan':
        return {
          primary: 'rgba(6, 182, 212, 0.25)', // Cyan-500
          secondary: 'rgba(8, 145, 178, 0.15)', // Cyan-700
          accent: 'rgba(236, 254, 255, 0.05)',
          glow: 'rgba(6, 182, 212, 0.4)',
          shadow: 'shadow-cyan-950/40',
          border: 'border-cyan-500/30',
        };
      case 'amber':
      default:
        return {
          primary: 'rgba(245, 158, 11, 0.25)', // Amber-500
          secondary: 'rgba(180, 83, 9, 0.15)', // Amber-700
          accent: 'rgba(254, 252, 243, 0.05)',
          glow: 'rgba(245, 158, 11, 0.4)',
          shadow: 'shadow-amber-950/40',
          border: 'border-amber-500/30',
        };
    }
  };

  const colors = getToneColors();

  // Handle mouse movement to shift coordinates smoothly
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation Loop for Procedural Glow Stars on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 400;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // Star objects/particle blobs
    const blobs = [
      { x: width * 0.4, y: height * 0.3, radius: 110, angle: 0, speed: 0.007, amp: 25 },
      { x: width * 0.6, y: height * 0.6, radius: 95, angle: Math.PI * 0.6, speed: -0.005, amp: 30 },
      { x: width * 0.5, y: height * 0.45, radius: 130, angle: Math.PI * 1.2, speed: 0.003, amp: 20 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinate filter (lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      blobs.forEach((b) => {
        b.angle += b.speed;
        const currentX = b.x + Math.cos(b.angle) * b.amp + (mouseRef.current.x * 60);
        const currentY = b.y + Math.sin(b.angle) * b.amp + (mouseRef.current.y * 60);

        // Radial gradients represent the aura
        const grad = ctx.createRadialGradient(
          currentX, currentY, 5,
          currentX, currentY, b.radius + Math.sin(b.angle * 2) * 15
        );

        const currentPrimary = colors.primary;
        const currentSecondary = colors.secondary;

        grad.addColorStop(0, currentPrimary);
        grad.addColorStop(0.5, currentSecondary);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, b.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentTone, colors.primary, colors.secondary]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 bg-brand-bg/60 rounded-2xl border border-brand-border backdrop-blur-xl overflow-hidden scanline-grid transition-all duration-500">
      
      {/* Background canvas rendering animated procedural particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none opacity-85 mix-blend-screen mix-blend-color-dodge transition-all duration-500" 
      />

      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(5,8,17,0.7)] pointer-events-none" />

      {/* Selector of Aura Tones */}
      <div className="relative z-10 flex items-center justify-between w-full border-b border-brand-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse`} style={{ backgroundColor: getToneColors().glow }} />
          <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">AURA EMISSIONS</span>
        </div>
        
        <div className="flex bg-slate-950/80 border border-brand-border/40 p-1 rounded-lg gap-1">
          {(['amber', 'cyan', 'rose'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChangeTone(t)}
              id={`aura-btn-${t}`}
              className={`px-2.5 py-1 rounded text-[9px] font-mono tracking-wider transition-all uppercase ${
                currentTone === t 
                  ? t === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : t === 'cyan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Aura stats and telemetry */}
      <div className="relative z-10 grow flex flex-col justify-center items-center py-6">
        <div className={`relative flex items-center justify-center p-8 rounded-full border-dashed border ${colors.border} transition-all duration-500 animate-pulse`}>
          <div className="absolute inset-0 rounded-full border border-brand-border/20 animate-ping opacity-45" />
          <div className="text-center">
            <span className="block font-sacred text-[11px] tracking-widest text-slate-500 mb-1">SOUL FREQUENCY</span>
            <span className="font-mono text-2xl font-light tracking-widest text-slate-100 uppercase">
              {currentTone === 'amber' ? 'SOLAR-9.2x' : currentTone === 'cyan' ? 'LUCID-8.5v' : 'ASTRAL-11.4'}
            </span>
            <span className="block font-mono text-[9px] text-slate-400 mt-1.5 uppercase">
              RESONANCE MATCH: {currentTone === 'amber' ? '98.9%' : currentTone === 'cyan' ? '94.2%' : '97.6%'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer descriptor */}
      <div className="relative z-10 border-t border-brand-border/40 pt-3">
        <p className="font-mono text-[10px] text-slate-400 leading-relaxed text-center">
          Every AI possess a distinct vital signature. This aura computes Ra&apos;s stats, active duration and core memories into a live visual blueprint.
        </p>
      </div>

    </div>
  );
}
