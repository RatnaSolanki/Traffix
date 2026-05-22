import { useState, useEffect, useRef, useCallback } from 'react';
import { Pause, Play, RotateCcw, ChevronDown, Cpu, Activity, Zap, AlertTriangle } from 'lucide-react';
import { useTraffic } from '../hooks/UseTraffic';

// ─── Constants ────────────────────────────────────────────────────────────────
const SIG_COLOR = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
const SIG_GLOW  = { green: '#10b98160', yellow: '#f59e0b60', red: '#ef444460' };
const CAR_PALETTE = ['#3b82f6','#06b6d4','#8b5cf6','#f59e0b','#10b981','#f43f5e','#a78bfa','#34d399'];

// Phase sequence driven by Webster timing from backend
// Each phase has: signals state + how long to hold (seconds)
const buildPhases = (signals) => {
  // signals is array from backend: [{direction, aiStats:{aiGreenTime}}]
  const nsGreen = signals?.find(s => s.direction === 'North')?.aiStats?.aiGreenTime || 30;
  const ewGreen = signals?.find(s => s.direction === 'East')?.aiStats?.aiGreenTime  || 30;
  const yellow  = 4;
  return [
    { id: 0, label: 'E/W Green',  duration: ewGreen, signals: { N:'red',    S:'red',    E:'green',  W:'green'  } },
    { id: 1, label: 'E/W Yellow', duration: yellow,  signals: { N:'red',    S:'red',    E:'yellow', W:'yellow' } },
    { id: 2, label: 'N/S Green',  duration: nsGreen, signals: { N:'green',  S:'green',  E:'red',    W:'red'    } },
    { id: 3, label: 'N/S Yellow', duration: yellow,  signals: { N:'yellow', S:'yellow', E:'red',    W:'red'    } },
  ];
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');

  :root {
    --fs: 'Geist', system-ui, sans-serif;
    --fm: 'Geist Mono', ui-monospace, monospace;
    --tt: -0.03em; --tn: -0.01em; --tw: 0.1em;
    --c-bg:    #060a10;
    --c-card:  #0b1018;
    --c-border:#161d28;
    --c-muted: #7d8590;
    --c-text:  #e6edf3;
    --c-dim:   #30363d;
  }

  .sim-root { font-family: var(--fs); background: var(--c-bg); min-height: 100vh; }
  .sim-root * { box-sizing: border-box; }

  /* ── Scanline overlay ── */
  .sim-root::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
  }

  .s-card {
    background: var(--c-card);
    border: 1px solid var(--c-border);
    border-radius: 12px;
  }

  .s-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 8px; border: none;
    font-family: var(--fs); font-size: 13px; font-weight: 600;
    letter-spacing: var(--tn); cursor: pointer;
    transition: filter 0.15s, transform 0.15s;
  }
  .s-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }

  .lc {
    font-family: var(--fm); font-size: 9px; font-weight: 700;
    letter-spacing: var(--tw); color: var(--c-muted);
    text-transform: uppercase; display: block;
  }

  .n { font-family: var(--fm); letter-spacing: -0.04em; }

  /* ── HUD border glow ── */
  .hud-border {
    position: relative;
  }
  .hud-border::before {
    content: '';
    position: absolute; inset: -1px; border-radius: 13px;
    background: linear-gradient(135deg, rgba(59,130,246,0.3), transparent 50%, rgba(16,185,129,0.2));
    z-index: -1;
  }

  /* ── Corner brackets ── */
  .bracket {
    position: absolute; width: 16px; height: 16px;
    border-color: #3b82f640; border-style: solid;
  }
  .bracket-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
  .bracket-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
  .bracket-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
  .bracket-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes carMoveN { 0%{transform:translateY(0)} 100%{transform:translateY(-120%)} }
  @keyframes carMoveS { 0%{transform:translateY(0)} 100%{transform:translateY(120%)} }
  @keyframes carMoveE { 0%{transform:translateX(0)} 100%{transform:translateX(120%)} }
  @keyframes carMoveW { 0%{transform:translateX(0)} 100%{transform:translateX(-120%)} }
  @keyframes carAppear { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
  @keyframes blinkYellow { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes timerShrink { from{width:100%} to{width:0%} }
  @keyframes gridFade { from{opacity:0} to{opacity:1} }
  @keyframes scanH {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(800%); }
  }

  .car-moving-N { animation: carMoveN 2.5s ease-in forwards; }
  .car-moving-S { animation: carMoveS 2.5s ease-in forwards; }
  .car-moving-E { animation: carMoveE 2.5s ease-in forwards; }
  .car-moving-W { animation: carMoveW 2.5s ease-in forwards; }
  .car-appear   { animation: carAppear 0.4s ease-out; }

  .sig-yellow-blink { animation: blinkYellow 0.5s ease-in-out infinite; }

  @media (max-width: 1100px) {
    .sim-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── Car component ────────────────────────────────────────────────────────────
function Car({ color, dir, moving, delay = 0 }) {
  const isNS = dir === 'N' || dir === 'S';
  const w = isNS ? 16 : 26;
  const h = isNS ? 26 : 16;
  const movingClass = moving ? `car-moving-${dir}` : 'car-appear';
  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={movingClass}
      style={{ display: 'block', animationDelay: `${delay}s`, flexShrink: 0 }}
    >
      {/* Body */}
      <rect x={1} y={1} width={w-2} height={h-2} rx={3} fill={color}/>
      {/* Windscreen */}
      <rect x={3} y={isNS?3:2} width={w-6} height={isNS?7:h-4} rx={2} fill="rgba(255,255,255,0.28)"/>
      {/* Wheels */}
      {isNS ? (
        <>
          <rect x={0} y={5}   width={2} height={5} rx={1} fill="rgba(0,0,0,0.6)"/>
          <rect x={w-2} y={5} width={2} height={5} rx={1} fill="rgba(0,0,0,0.6)"/>
          <rect x={0} y={h-10}   width={2} height={5} rx={1} fill="rgba(0,0,0,0.6)"/>
          <rect x={w-2} y={h-10} width={2} height={5} rx={1} fill="rgba(0,0,0,0.6)"/>
        </>
      ) : (
        <>
          <rect x={5}   y={0} width={5} height={2} rx={1} fill="rgba(0,0,0,0.6)"/>
          <rect x={w-10} y={0} width={5} height={2} rx={1} fill="rgba(0,0,0,0.6)"/>
          <rect x={5}   y={h-2} width={5} height={2} rx={1} fill="rgba(0,0,0,0.6)"/>
          <rect x={w-10} y={h-2} width={5} height={2} rx={1} fill="rgba(0,0,0,0.6)"/>
        </>
      )}
      {/* Headlights */}
      {dir === 'S' && <rect x={2} y={1} width={4} height={2} rx={1} fill="rgba(255,230,100,0.9)"/>}
      {dir === 'S' && <rect x={w-6} y={1} width={4} height={2} rx={1} fill="rgba(255,230,100,0.9)"/>}
      {dir === 'N' && <rect x={2} y={h-3} width={4} height={2} rx={1} fill="rgba(255,100,100,0.9)"/>}
      {dir === 'N' && <rect x={w-6} y={h-3} width={4} height={2} rx={1} fill="rgba(255,100,100,0.9)"/>}
      {dir === 'E' && <rect x={1} y={2} width={2} height={4} rx={1} fill="rgba(255,230,100,0.9)"/>}
      {dir === 'E' && <rect x={1} y={h-6} width={2} height={4} rx={1} fill="rgba(255,230,100,0.9)"/>}
      {dir === 'W' && <rect x={w-3} y={2} width={2} height={4} rx={1} fill="rgba(255,100,100,0.9)"/>}
      {dir === 'W' && <rect x={w-3} y={h-6} width={2} height={4} rx={1} fill="rgba(255,100,100,0.9)"/>}
    </svg>
  );
}

// ─── Signal Pole ──────────────────────────────────────────────────────────────
function SignalPole({ state, dir }) {
  const isV = dir === 'N' || dir === 'S';
  return (
    <div style={{
      display: 'flex', flexDirection: isV ? 'column' : 'row',
      alignItems: 'center', gap: 4,
      background: '#0d1117',
      border: '1px solid #21262d',
      borderRadius: 8,
      padding: isV ? '8px 5px' : '5px 8px',
      boxShadow: '0 0 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      {['red','yellow','green'].map(c => (
        <div key={c} style={{
          width: 11, height: 11, borderRadius: '50%',
          background: state === c ? SIG_COLOR[c] : '#0a0f18',
          border: `1px solid ${state === c ? SIG_COLOR[c] : '#21262d'}`,
          boxShadow: state === c
            ? `0 0 12px ${SIG_COLOR[c]}, 0 0 24px ${SIG_GLOW[c]}, inset 0 1px 2px rgba(255,255,255,0.3)`
            : 'none',
          transition: 'all 0.25s ease',
          className: state === 'yellow' && c === 'yellow' ? 'sig-yellow-blink' : '',
        }}/>
      ))}
    </div>
  );
}

// ─── Intersection Canvas ──────────────────────────────────────────────────────
function IntersectionCanvas({ signals, vehicles, phase }) {
  const greenDirs = Object.entries(signals).filter(([,s]) => s === 'green').map(([d]) => d);

  return (
    <div style={{
      position: 'relative', width: '100%', paddingBottom: '85%',
      background: '#060a10',
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid #161d28',
    }}>
      {/* Corner brackets */}
      <div className="bracket bracket-tl"/>
      <div className="bracket bracket-tr"/>
      <div className="bracket bracket-bl"/>
      <div className="bracket bracket-br"/>

      {/* HUD scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)',
        zIndex: 20, pointerEvents: 'none',
        animation: 'scanH 4s linear infinite',
      }}/>

      <div style={{ position: 'absolute', inset: 0 }}>

        {/* ── Road grid bg ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(22,29,40,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(22,29,40,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}/>

        {/* ── Horizontal road ── */}
        <div style={{
          position: 'absolute', top: '38%', bottom: '38%', left: 0, right: 0,
          background: 'linear-gradient(180deg, #111822 0%, #0f1620 50%, #111822 100%)',
          borderTop: '1px solid #1e2d3d', borderBottom: '1px solid #1e2d3d',
        }}>
          {/* Center yellow line */}
          <div style={{
            position: 'absolute', top: '50%', left: '5%', right: '5%', height: 3,
            background: 'repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 20px,transparent 20px,transparent 40px)',
            transform: 'translateY(-50%)', opacity: 0.5,
          }}/>
          {/* Lane lines */}
          <div style={{ position: 'absolute', top: '27%', left: '5%', right: '5%', height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', top: '73%', left: '5%', right: '5%', height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          {/* Road glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)',
          }}/>
        </div>

        {/* ── Vertical road ── */}
        <div style={{
          position: 'absolute', left: '38%', right: '38%', top: 0, bottom: 0,
          background: 'linear-gradient(90deg, #111822 0%, #0f1620 50%, #111822 100%)',
          borderLeft: '1px solid #1e2d3d', borderRight: '1px solid #1e2d3d',
        }}>
          <div style={{
            position: 'absolute', left: '50%', top: '5%', bottom: '5%', width: 3,
            background: 'repeating-linear-gradient(180deg,#f59e0b 0,#f59e0b 20px,transparent 20px,transparent 40px)',
            transform: 'translateX(-50%)', opacity: 0.5,
          }}/>
          <div style={{ position: 'absolute', left: '27%', top: '5%', bottom: '5%', width: 1, background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', left: '73%', top: '5%', bottom: '5%', width: 1, background: 'rgba(255,255,255,0.08)' }}/>
        </div>

        {/* ── Zebra crossings ── */}
        {[
          { top: 'calc(38% - 12px)', left: '38%', right: '38%', height: 12, dir: 'h' },
          { bottom: 'calc(38% - 12px)', left: '38%', right: '38%', height: 12, dir: 'h' },
          { left: 'calc(38% - 12px)', top: '38%', bottom: '38%', width: 12, dir: 'v' },
          { right: 'calc(38% - 12px)', top: '38%', bottom: '38%', width: 12, dir: 'v' },
        ].map((z, i) => (
          <div key={i} style={{
            position: 'absolute', zIndex: 4,
            top: z.top, bottom: z.bottom, left: z.left, right: z.right,
            height: z.height, width: z.width,
            background: z.dir === 'h'
              ? 'repeating-linear-gradient(90deg,rgba(255,255,255,0.07) 0,rgba(255,255,255,0.07) 8px,transparent 8px,transparent 16px)'
              : 'repeating-linear-gradient(180deg,rgba(255,255,255,0.07) 0,rgba(255,255,255,0.07) 8px,transparent 8px,transparent 16px)',
          }}/>
        ))}

        {/* ── Intersection box ── */}
        <div style={{
          position: 'absolute', top: '38%', bottom: '38%', left: '38%', right: '38%',
          background: 'linear-gradient(135deg, #0e1520, #0a1018)',
          border: '1px solid #1e2d3d', zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Stop lines */}
          {[{top:0,h:true},{bottom:0,h:true},{left:0,v:true},{right:0,v:true}].map((s,i) => (
            <div key={i} style={{
              position:'absolute',
              top: s.top !== undefined ? s.top : undefined,
              bottom: s.bottom !== undefined ? s.bottom : undefined,
              left: s.left !== undefined ? s.left : 0,
              right: s.right !== undefined ? s.right : 0,
              height: s.h ? 3 : undefined,
              width: s.v ? 3 : undefined,
              top2: s.v ? 0 : undefined,
              bottom2: s.v ? 0 : undefined,
              background: 'rgba(255,255,255,0.15)',
            }}/>
          ))}
          {/* Center roundel */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `1.5px solid rgba(59,130,246,0.3)`,
            background: 'rgba(59,130,246,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59,130,246,0.15)',
          }}>
            <Activity size={15} color="#3b82f6" />
          </div>
          {/* Green phase glow */}
          {greenDirs.length > 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, ${SIG_COLOR.green}15 0%, transparent 70%)`,
              transition: 'opacity 0.5s',
            }}/>
          )}
        </div>

        {/* ── Vehicles North ── */}
        <div style={{
          position: 'absolute', top: 8, left: '38%', right: '38%',
          height: 'calc(38% - 8px)', display: 'flex',
          flexDirection: 'column-reverse', alignItems: 'center',
          gap: 5, padding: '4px 0', overflow: 'hidden', zIndex: 6,
        }}>
          {vehicles.N.map((v, i) => (
            <Car key={`${v.id}-${i}`} color={v.color} dir="N"
              moving={signals.N === 'green'} delay={i * 0.3}/>
          ))}
        </div>

        {/* ── Vehicles South ── */}
        <div style={{
          position: 'absolute', bottom: 8, left: '38%', right: '38%',
          height: 'calc(38% - 8px)', display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          gap: 5, padding: '4px 0', overflow: 'hidden', zIndex: 6,
        }}>
          {vehicles.S.map((v, i) => (
            <Car key={`${v.id}-${i}`} color={v.color} dir="S"
              moving={signals.S === 'green'} delay={i * 0.3}/>
          ))}
        </div>

        {/* ── Vehicles West ── */}
        <div style={{
          position: 'absolute', left: 8, top: '38%', bottom: '38%',
          width: 'calc(38% - 8px)', display: 'flex',
          flexDirection: 'row-reverse', alignItems: 'center',
          gap: 5, padding: '0 4px', overflow: 'hidden', zIndex: 6,
        }}>
          {vehicles.W.map((v, i) => (
            <Car key={`${v.id}-${i}`} color={v.color} dir="W"
              moving={signals.W === 'green'} delay={i * 0.3}/>
          ))}
        </div>

        {/* ── Vehicles East ── */}
        <div style={{
          position: 'absolute', right: 8, top: '38%', bottom: '38%',
          width: 'calc(38% - 8px)', display: 'flex',
          flexDirection: 'row', alignItems: 'center',
          gap: 5, padding: '0 4px', overflow: 'hidden', zIndex: 6,
        }}>
          {vehicles.E.map((v, i) => (
            <Car key={`${v.id}-${i}`} color={v.color} dir="E"
              moving={signals.E === 'green'} delay={i * 0.3}/>
          ))}
        </div>

        {/* ── Signal poles ── */}
        <div style={{ position:'absolute', top:'calc(38% - 42px)', left:'50%', transform:'translateX(-50%)', zIndex:10 }}>
          <SignalPole state={signals.N} dir="N"/>
        </div>
        <div style={{ position:'absolute', bottom:'calc(38% - 42px)', left:'50%', transform:'translateX(-50%)', zIndex:10 }}>
          <SignalPole state={signals.S} dir="S"/>
        </div>
        <div style={{ position:'absolute', left:'calc(38% - 42px)', top:'50%', transform:'translateY(-50%)', zIndex:10 }}>
          <SignalPole state={signals.W} dir="W"/>
        </div>
        <div style={{ position:'absolute', right:'calc(38% - 42px)', top:'50%', transform:'translateY(-50%)', zIndex:10 }}>
          <SignalPole state={signals.E} dir="E"/>
        </div>

        {/* ── Direction labels ── */}
        {[
          { d:'N', s:{ top:10, left:'50%', transform:'translateX(-50%)' } },
          { d:'S', s:{ bottom:10, left:'50%', transform:'translateX(-50%)' } },
          { d:'W', s:{ left:10, top:'50%', transform:'translateY(-50%)' } },
          { d:'E', s:{ right:10, top:'50%', transform:'translateY(-50%)' } },
        ].map(({d,s}) => (
          <span key={d} style={{
            position:'absolute', ...s, zIndex:2,
            fontFamily:'var(--fm)', fontSize:10, fontWeight:800,
            color:'#2d3748', letterSpacing:'0.15em',
          }}>{d}</span>
        ))}

        {/* ── Phase label overlay ── */}
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 15,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 700,
            color: SIG_COLOR[signals.N === 'green' || signals.S === 'green' ? 'green' : signals.E === 'yellow' || signals.N === 'yellow' ? 'yellow' : 'red'],
            letterSpacing: '0.1em', padding: '3px 8px',
            background: 'rgba(6,10,16,0.8)', borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {phase?.label?.toUpperCase() || 'PHASE'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase countdown bar ──────────────────────────────────────────────────────
function PhaseCountdown({ phase, remaining, total }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const color = phase?.signals?.N === 'green' || phase?.signals?.S === 'green' ? '#10b981'
    : phase?.label?.includes('Yellow') ? '#f59e0b' : '#3b82f6';
  return (
    <div style={{ background: '#060a10', borderRadius: 10, padding: 14, border: '1px solid #161d28' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <span className="lc" style={{ marginBottom: 3 }}>Current Phase</span>
          <p style={{ fontSize: 14, fontWeight: 700, color, margin: 0, fontFamily: 'var(--fs)', letterSpacing: '-0.02em' }}>
            {phase?.label || '—'}
          </p>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${color}10`,
          boxShadow: `0 0 16px ${color}40`,
        }}>
          <span className="n" style={{ fontSize: 20, fontWeight: 800, color }}>{remaining}</span>
        </div>
      </div>
      {/* Timer bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}90, ${color})`,
          boxShadow: `0 0 8px ${color}80`,
          transition: 'width 1s linear',
        }}/>
      </div>
      {/* Phase steps */}
      <div style={{ display: 'flex', gap: 3 }}>
        {['E/W Green','E/W Yellow','N/S Green','N/S Yellow'].map((l, i) => {
          const active = phase?.label === l;
          const c = l.includes('Yellow') ? '#f59e0b' : '#10b981';
          return (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: active ? c : '#1c2128',
              boxShadow: active ? `0 0 6px ${c}` : 'none',
              transition: 'all 0.3s',
            }}/>
          );
        })}
      </div>
    </div>
  );
}

// ─── Signal state grid ────────────────────────────────────────────────────────
function SignalGrid({ signals }) {
  return (
    <div style={{ background: '#060a10', borderRadius: 10, padding: 14, border: '1px solid #161d28' }}>
      <span className="lc" style={{ marginBottom: 10 }}>Signal States</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {Object.entries(signals).map(([dir, state]) => (
          <div key={dir} style={{
            background: '#0b1018', borderRadius: 8, padding: '9px 11px',
            border: `1px solid ${state !== 'red' ? SIG_COLOR[state] + '35' : '#161d28'}`,
            display: 'flex', alignItems: 'center', gap: 9,
            transition: 'border-color 0.3s',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: SIG_COLOR[state],
              boxShadow: state !== 'red' ? `0 0 10px ${SIG_GLOW[state]}` : 'none',
              transition: 'all 0.3s',
            }}/>
            <div>
              <p style={{ fontSize: 10, color: '#484f58', margin: 0, fontFamily: 'var(--fs)' }}>{dir} Bound</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: SIG_COLOR[state], margin: 0, letterSpacing: '-0.01em' }}>
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Webster stats panel ──────────────────────────────────────────────────────
function WebsterStats({ backendSignals, optimalCycle }) {
  if (!backendSignals?.length) return null;
  return (
    <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: 10, padding: 14, border: '1px solid rgba(59,130,246,0.13)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Cpu size={12} color="#3b82f6"/>
        <span className="lc" style={{ color: '#3b82f6' }}>Webster AI Timing</span>
        {optimalCycle && (
          <span style={{
            marginLeft: 'auto', fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 700,
            color: '#3b82f6', padding: '2px 7px',
            background: 'rgba(59,130,246,0.1)', borderRadius: 99,
          }}>Cycle: {optimalCycle}s</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {backendSignals.map(s => {
          const ai  = s.aiStats?.aiGreenTime || 0;
          const fix = s.aiStats?.fixedWaitTime || 0;
          const imp = s.aiStats?.improvementPct || 0;
          const col = imp > 0 ? '#10b981' : imp < 0 ? '#ef4444' : '#7d8590';
          return (
            <div key={s.direction} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: '#7d8590', width: 20 }}>
                {s.direction?.charAt(0)}
              </span>
              <div style={{ flex: 1, height: 4, borderRadius: 99, background: '#161d28' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${Math.min(100, (ai / 90) * 100)}%`,
                  background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                  transition: 'width 0.6s ease',
                }}/>
              </div>
              <span className="n" style={{ fontSize: 11, color: '#f0f6fc', fontWeight: 700, width: 28, textAlign: 'right' }}>{ai}s</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: col, width: 36, textAlign: 'right' }}>
                {imp > 0 ? `↓${imp}%` : imp < 0 ? `↑${Math.abs(imp)}%` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vehicle count bars ───────────────────────────────────────────────────────
function VehicleBars({ vehicles, signals }) {
  const dirs = ['N','S','E','W'];
  const counts = { N: vehicles.N.length, S: vehicles.S.length, E: vehicles.E.length, W: vehicles.W.length };
  const max = Math.max(...Object.values(counts), 1);
  const total = Object.values(counts).reduce((a,b) => a+b, 0);
  return (
    <div style={{ background: '#060a10', borderRadius: 10, padding: 14, border: '1px solid #161d28' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="lc">Vehicle Queue</span>
        <span className="n" style={{ fontSize: 18, fontWeight: 800, color: '#f0f6fc' }}>{total}</span>
      </div>
      {dirs.map(d => {
        const isGreen = signals[d] === 'green';
        const color = isGreen ? '#10b981' : signals[d] === 'yellow' ? '#f59e0b' : '#3b82f6';
        return (
          <div key={d} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--fs)', fontSize: 11, color: '#7d8590' }}>{d} Bound</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isGreen && (
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#10b981', fontFamily: 'var(--fm)', letterSpacing: '0.1em' }}>MOVING</span>
                )}
                <span className="n" style={{ fontSize: 12, fontWeight: 700, color: '#f0f6fc' }}>{counts[d]}</span>
              </div>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.04)' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${(counts[d] / max) * 100}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
                transition: 'width 0.6s ease, background 0.3s',
                boxShadow: isGreen ? `0 0 6px ${color}60` : 'none',
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Congestion meter ─────────────────────────────────────────────────────────
function CongestionMeter({ level, saturation }) {
  const pct  = Math.round(Math.min(100, Math.max(0, level)));
  const color = pct < 40 ? '#10b981' : pct < 70 ? '#f59e0b' : '#ef4444';
  const label = pct < 40 ? 'LOW' : pct < 70 ? 'MODERATE' : 'HIGH';
  return (
    <div style={{ background: '#060a10', borderRadius: 10, padding: 14, border: '1px solid #161d28' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="lc">Congestion</span>
        <span style={{ fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 800, color,
          padding: '2px 8px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 99, letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg, #10b981, ${color})`,
          boxShadow: `0 0 8px ${color}50`,
          transition: 'width 0.8s ease',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span className="n" style={{ fontSize: 28, fontWeight: 800, color: '#f0f6fc', lineHeight: 1 }}>
          {pct}<span style={{ fontSize: 13, color: '#7d8590', fontWeight: 400 }}>%</span>
        </span>
        {saturation !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <span className="lc" style={{ marginBottom: 2 }}>Saturation</span>
            <span className="n" style={{ fontSize: 13, fontWeight: 700, color: saturation > 80 ? '#ef4444' : '#7d8590' }}>
              {saturation}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Simulation ──────────────────────────────────────────────────────────
export default function Simulation() {
  const { simulationData, connected } = useTraffic();

  const [isPaused, setIsPaused]   = useState(false);
  const [resetKey, setResetKey]   = useState(0);
  const [selectedJunction, setSelectedJunction] = useState(null);

  // Phase engine state
  const [phaseIdx,   setPhaseIdx]   = useState(0);
  const [remaining,  setRemaining]  = useState(0);
  const [phases,     setPhases]     = useState(buildPhases(null));
  const [signals,    setSignals]    = useState(phases[0].signals);

  // Live vehicles — each is { id, color }
  const [vehicles, setVehicles] = useState({
    N: [{id:1,color:'#3b82f6'},{id:2,color:'#8b5cf6'},{id:3,color:'#06b6d4'}],
    S: [{id:4,color:'#f59e0b'},{id:5,color:'#10b981'}],
    E: [{id:6,color:'#f43f5e'},{id:7,color:'#3b82f6'},{id:8,color:'#a78bfa'},{id:9,color:'#34d399'}],
    W: [{id:10,color:'#06b6d4'},{id:11,color:'#f59e0b'},{id:12,color:'#8b5cf6'}],
  });

  const [congestion, setCongestion] = useState(55);
  const vehicleIdRef = useRef(100);

  // ── Sync phases from backend when data arrives ──
  useEffect(() => {
    if (simulationData?.signals?.length) {
      const newPhases = buildPhases(simulationData.signals);
      setPhases(newPhases);
    }
  }, [simulationData]);

  // ── Auto-select junction ──
  useEffect(() => {
    if (!selectedJunction && simulationData?.junctions?.length) {
      setSelectedJunction(simulationData.junctions[0]);
    }
  }, [simulationData, selectedJunction]);

  // ── Phase engine: countdown then advance ──
  useEffect(() => {
    setRemaining(phases[phaseIdx].duration);
    setSignals(phases[phaseIdx].signals);
  }, [phaseIdx, phases]);

  useEffect(() => {
    if (isPaused) return;
    if (remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          // Advance to next phase
          setPhaseIdx(p => {
            const next = (p + 1) % phases.length;
            return next;
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPaused, remaining, phases]);

  // ── Vehicle spawning: when light goes green, clear queue gradually ──
  useEffect(() => {
    if (isPaused) return;

    // Every 1.5s update vehicle positions
    const t = setInterval(() => {
      setVehicles(prev => {
        const next = { ...prev };
        // For green directions: remove front car (it passed through)
        // For red: add a car if queue < 6
        const greenDirs = Object.entries(signals).filter(([,s]) => s === 'green').map(([d]) => d);
        const redDirs   = Object.entries(signals).filter(([,s]) => s === 'red').map(([d]) => d);

        greenDirs.forEach(d => {
          if (next[d].length > 0) {
            next[d] = next[d].slice(1); // remove car that moved through
          }
        });

        redDirs.forEach(d => {
          if (next[d].length < 6) {
            vehicleIdRef.current++;
            next[d] = [...next[d], {
              id: vehicleIdRef.current,
              color: CAR_PALETTE[vehicleIdRef.current % CAR_PALETTE.length],
            }];
          }
        });

        return next;
      });

      setVehicles(latest => {
        const total = Object.values(latest).flat().length;
        setCongestion(Math.round(Math.min(95, Math.max(10, total * 4 + Math.random() * 5))));
        return latest; // no change, just reading
      });
    }, 1500);

    return () => clearInterval(t);
  }, [isPaused, signals, resetKey]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setResetKey(p => p + 1);
    setPhaseIdx(0);
    setVehicles({
      N: [{id:1,color:'#3b82f6'},{id:2,color:'#8b5cf6'}],
      S: [{id:3,color:'#f59e0b'},{id:4,color:'#10b981'}],
      E: [{id:5,color:'#f43f5e'},{id:6,color:'#3b82f6'},{id:7,color:'#a78bfa'}],
      W: [{id:8,color:'#06b6d4'},{id:9,color:'#f59e0b'}],
    });
    setCongestion(40);
  }, []);

  // ── Derived data ──
  const junctions      = simulationData?.junctions || [];
  const backendSignals = simulationData?.signals    || [];
  const optimalCycle   = simulationData?.summary?.optimalCycle;
  const saturation     = simulationData?.summary?.saturationPct;
  const currentPhase   = phases[phaseIdx];

  if (!selectedJunction && !junctions.length) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="sim-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
          <p style={{ color: '#7d8590', fontFamily: 'var(--fm)', fontSize: 13, letterSpacing: '0.1em' }}>
            CONNECTING TO BACKEND...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="sim-root" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <h1 style={{ fontFamily: 'var(--fs)', fontSize: 22, fontWeight: 800, color: '#e6edf3', margin: 0, letterSpacing: '-0.03em' }}>
                {selectedJunction?.name || 'Simulation'}
              </h1>
              <span style={{
                fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 700,
                color: connected ? '#10b981' : '#ef4444',
                padding: '3px 8px', borderRadius: 99,
                background: connected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${connected ? '#10b98140' : '#ef444440'}`,
                letterSpacing: '0.1em',
              }}>
                {connected ? '● LIVE' : '○ OFFLINE'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#7d8590', margin: 0 }}>
              Webster-optimised AI signal control · Real-time simulation
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="s-btn"
              style={{ background: isPaused ? '#059669' : '#1d4ed8', color: 'white' }}
              onClick={() => setIsPaused(p => !p)}>
              {isPaused ? <Play size={14}/> : <Pause size={14}/>}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button className="s-btn"
              style={{ background: '#0b1018', color: '#7d8590', border: '1px solid #161d28' }}
              onClick={handleReset}>
              <RotateCcw size={14}/> Reset
            </button>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="sim-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>

          {/* Intersection */}
          <div className="s-card hud-border" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontFamily: 'var(--fs)', fontSize: 14, fontWeight: 600, color: '#e6edf3', margin: 0, letterSpacing: '-0.02em' }}>
                  Intersection View
                </p>
                <p style={{ fontSize: 11, color: '#484f58', margin: '2px 0 0' }}>
                  AI-optimised · Phase {phaseIdx + 1}/4 · {remaining}s remaining
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {optimalCycle && (
                  <span style={{ fontFamily:'var(--fm)', fontSize:9, color:'#3b82f6', letterSpacing:'0.08em' }}>
                    CYCLE {optimalCycle}s
                  </span>
                )}
                {!isPaused && (
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981',
                    animation:'pulse 2s infinite', boxShadow:'0 0 8px #10b981' }}/>
                )}
                <span style={{ fontFamily:'var(--fm)', fontSize:10, fontWeight:700,
                  color: isPaused ? '#484f58' : '#10b981', letterSpacing:'0.08em' }}>
                  {isPaused ? 'PAUSED' : 'LIVE'}
                </span>
              </div>
            </div>
            <IntersectionCanvas signals={signals} vehicles={vehicles} phase={currentPhase}/>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Junction selector */}
            {junctions.length > 0 && (
              <div className="s-card" style={{ padding: 12 }}>
                <span className="lc" style={{ marginBottom: 7 }}>Select Junction</span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedJunction?.id || ''}
                    onChange={e => setSelectedJunction(junctions.find(j => j.id === parseInt(e.target.value)))}
                    style={{
                      width: '100%', appearance: 'none', background: '#060a10',
                      border: '1px solid #161d28', borderRadius: 7,
                      padding: '9px 32px 9px 12px',
                      fontFamily: 'var(--fs)', fontSize: 13, fontWeight: 500, color: '#e6edf3',
                      cursor: 'pointer', outline: 'none',
                    }}>
                    {junctions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                  <ChevronDown size={13} color="#484f58" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                </div>
              </div>
            )}

            <PhaseCountdown phase={currentPhase} remaining={remaining} total={currentPhase?.duration || 1}/>
            <SignalGrid signals={signals}/>
            <VehicleBars vehicles={vehicles} signals={signals}/>
            <CongestionMeter level={congestion} saturation={saturation}/>
            <WebsterStats backendSignals={backendSignals} optimalCycle={optimalCycle}/>
          </div>
        </div>
      </div>
    </>
  );
}