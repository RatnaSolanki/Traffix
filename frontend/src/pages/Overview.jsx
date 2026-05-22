import { useState, useEffect } from 'react';
import {
  MapPin, Cpu, Activity,
  GitBranch, Car, AlertTriangle, Clock, ArrowDown, ArrowUp
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { useTraffic } from '../hooks/UseTraffic';
import JunctionMap from './JunctionMap';

// ─── Severity config ──────────────────────────────────────────────────────────
const SEV = {
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  label: 'Low'      },
  medium:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)',   label: 'Medium'   },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  label: 'High'     },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   label: 'Critical' },
};

const ICON_MAP = { GitBranch, Car, AlertTriangle, Cpu, Clock };

const GEIST_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');
  :root {
    --font-sans:  'Geist', 'Geist Fallback', system-ui, sans-serif;
    --font-mono:  'Geist Mono', 'Geist Mono Fallback', ui-monospace, monospace;
    --tracking-tight:  -0.03em;
    --tracking-normal: -0.01em;
    --tracking-widest:  0.12em;
    --weight-normal:    400;
    --weight-medium:    500;
    --weight-semibold:  600;
    --weight-bold:      700;
    --weight-black:     900;
  }
  .overview-root, .overview-root * { font-family: var(--font-sans); }
  .metric-card {
    position: relative; overflow: hidden;
    background: #0d1117; border: 1px solid #1c2128;
    border-radius: 12px; padding: 18px;
    transition: border-color 0.2s, transform 0.18s; cursor: default;
  }
  .metric-card:hover { border-color: var(--accent, #3b82f6); transform: translateY(-2px); }
  .metric-card-glow {
    position: absolute; top: -40px; right: -40px;
    width: 100px; height: 100px; border-radius: 50%;
    background: radial-gradient(circle, var(--accent, #3b82f6) 0%, transparent 70%);
    opacity: 0.07; pointer-events: none;
  }
  .metric-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: color-mix(in srgb, var(--accent, #3b82f6) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent, #3b82f6) 22%, transparent);
    display: flex; align-items: center; justify-content: center;
  }
  .metric-value {
    font-size: 28px; font-weight: var(--weight-black); color: #f0f6fc;
    font-family: var(--font-mono); letter-spacing: var(--tracking-tight);
    margin: 0 0 4px; line-height: 1;
  }
  .metric-label { font-size: 11px; font-weight: var(--weight-medium); color: #7d8590; margin: 0; }
  .change-badge {
    display: flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: var(--weight-semibold);
    font-family: var(--font-mono); padding: 3px 8px; border-radius: 99px;
  }
  .change-badge.pos { background: rgba(16,185,129,0.12); color: #10b981; }
  .change-badge.neg { background: rgba(239,68,68,0.12);  color: #ef4444; }
  .section-title {
    font-family: var(--font-sans); font-size: 15px; font-weight: var(--weight-semibold);
    color: #f0f6fc; letter-spacing: var(--tracking-tight); margin: 0 0 2px;
  }
  .section-sub { font-size: 12px; color: #7d8590; margin: 0; }
  .card-box { background: #0d1117; border: 1px solid #1c2128; border-radius: 14px; padding: 20px; }
  .junc-detail-name {
    font-family: var(--font-sans); font-size: 16px; font-weight: var(--weight-bold);
    color: #f0f6fc; letter-spacing: var(--tracking-tight); margin: 0;
  }
  .label-caps {
    font-family: var(--font-mono); font-size: 10px; font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-widest); color: #7d8590; text-transform: uppercase;
  }
  .num-mono { font-family: var(--font-mono); letter-spacing: var(--tracking-tight); }
  .divider { height: 1px; background: #1c2128; margin: 14px 0; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, change, icon, accent }) {
  const Icon = ICON_MAP[icon] || GitBranch;
  const isPos = change.startsWith('+');
  const accentColor = accent || '#3b82f6';
  return (
    <div className="metric-card" style={{ '--accent': accentColor }}>
      <div className="metric-card-glow" />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="metric-icon"><Icon size={16} color={accentColor} /></div>
        <span className={`change-badge ${isPos ? 'pos' : 'neg'}`}>
          {isPos ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{change}
        </span>
      </div>
      <p className="metric-value num-mono">{value}</p>
      <p className="metric-label">{label}</p>
    </div>
  );
}

function SignalRing({ duration, maxDuration = 90, color }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * (duration / maxDuration);
  return (
    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
      <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
        <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '12px', fontWeight: 700,
        color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em'
      }}>{duration}s</span>
    </div>
  );
}

function DirectionBar({ dir, count, max, color }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="label-caps">{dir} BOUND</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>{count}</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: color, transition: 'width 0.6s ease', boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}

function AIComparison({ aiWait = 18, fixedWait = 30 }) {
  const saved = fixedWait - aiWait;
  const pct = Math.round((saved / fixedWait) * 100);
  return (
    <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Cpu size={12} color="#3b82f6" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: '#3b82f6', letterSpacing: 'var(--tracking-widest)' }}>AI vs FIXED-TIME</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '8px 10px' }}>
          <p style={{ fontSize: 10, color: '#7d8590', margin: '0 0 3px' }}>Fixed Wait</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em', margin: 0 }}>{fixedWait}s</p>
        </div>
        <div style={{ flex: 1, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 8, padding: '8px 10px' }}>
          <p style={{ fontSize: 10, color: '#7d8590', margin: '0 0 3px' }}>AI Wait</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em', margin: 0 }}>{aiWait}s</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#7d8590' }}>Delay reduction</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', fontFamily: 'var(--font-mono)' }}>↓ {pct}% ({saved}s saved)</span>
      </div>
      <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1c2128', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#7d8590', marginBottom: 6, fontWeight: 500 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#7d8590' }}>{p.name}:</span>
          <span style={{ color: '#f0f6fc', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function LiveTicker() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontSize: 11, color: '#484f58', fontFamily: 'var(--font-mono)' }}>
      {time.toLocaleTimeString()}
    </span>
  );
}

// ─── Main Overview ─────────────────────────────────────────────────────────────
export default function Overview() {
  const { junctionsData, chartData, overviewMetrics } = useTraffic();
  const [selectedJunction, setSelectedJunction] = useState(null);
  const [pulseId, setPulseId] = useState(null);

  // ── ALL hooks must come before any conditional return ──
  useEffect(() => {
    if (!selectedJunction && junctionsData?.length > 0) {
      setSelectedJunction(junctionsData[0]);
    }
  }, [junctionsData, selectedJunction]);

  useEffect(() => {
    if (!junctionsData?.length) return;
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * junctionsData.length);
      setPulseId(junctionsData[idx].id);
      setTimeout(() => setPulseId(null), 800);
    }, 4000);
    return () => clearInterval(t);
  }, [junctionsData]);

  // ── Loading state — after all hooks ──
  if (!selectedJunction) {
    return (
      <>
        <style>{GEIST_STYLES}</style>
        <div className="overview-root" style={{ padding: '2rem' }}>
          <p style={{ color: '#7d8590', fontSize: 13 }}>Loading junction data...</p>
        </div>
      </>
    );
  }

  const sev = SEV[selectedJunction.severity];
  const maxDir = Math.max(...Object.values(selectedJunction.directions));
  const metricAccents = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

  return (
    <>
      <style>{GEIST_STYLES}</style>
      <div className="overview-root" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 900, color: '#f0f6fc', margin: 0, letterSpacing: '-0.03em' }}>
              Overview
            </h1>
            <p style={{ fontSize: 13, color: '#7d8590', margin: '4px 0 0' }}>
              Real-time city traffic monitoring dashboard
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>LIVE</span>
            <span style={{ margin: '0 6px', color: '#1c2128' }}>|</span>
            <LiveTicker />
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {overviewMetrics?.map((m, i) => (
            <MetricCard key={m.label} {...m} accent={metricAccents[i]} />
          ))}
        </div>

        {/* ── Map + Junction Panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>

          {/* Map */}
          <div className="card-box">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p className="section-title">Junction Map</p>
                <p className="section-sub">Live junction status — Bhopal City</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {Object.entries(SEV).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: v.color }} />
                    <span style={{ fontSize: 11, color: '#7d8590' }}>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <JunctionMap
              selectedId={selectedJunction.id}
              onSelect={(j) => setSelectedJunction(junctionsData.find(jd => jd.id === j.id) || j)}
            />
          </div>

          {/* Junction Detail Panel */}
          <div className="card-box" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: sev.bg, border: `1px solid ${sev.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color={sev.color} />
              </div>
              <div>
                <p className="junc-detail-name">{selectedJunction.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, letterSpacing: '0.08em' }}>
                    {sev.label.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#484f58' }}>
                    Junction #{selectedJunction.id}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <SignalRing duration={selectedJunction.signalDuration} maxDuration={90} color={sev.color} />
              <div>
                <p className="label-caps" style={{ marginBottom: 3 }}>AI GREEN PHASE</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#f0f6fc', margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {selectedJunction.signalDuration}s
                </p>
                <p style={{ fontSize: 11, color: '#7d8590', margin: '4px 0 0' }}>
                  {selectedJunction.avgVehicles} avg vehicles
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p className="label-caps" style={{ marginBottom: 10 }}>VEHICLE DISTRIBUTION</p>
              {Object.entries(selectedJunction.directions).map(([dir, count]) => (
                <DirectionBar key={dir} dir={dir} count={count} max={maxDir} color={sev.color} />
              ))}
            </div>

            <div className="divider" />
            <AIComparison
              aiWait={Math.round(selectedJunction.signalDuration * 0.6)}
              fixedWait={30}
            />
          </div>
        </div>

        {/* ── Live Chart ── */}
        <div className="card-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p className="section-title">Live Vehicle Count</p>
              <p className="section-sub">Last 10 minutes across major junctions</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={12} color="#3b82f6" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#484f58', fontWeight: 600, letterSpacing: '0.08em' }}>LIVE FEED</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 2s infinite' }} />
            </div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  {[['mp','#3b82f6'],['hab','#ef4444'],['rosh','#10b981'],['arera','#f59e0b']].map(([id, color]) => (
                    <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" stroke="#30363d" fontSize={10} tickLine={false} axisLine={false} style={{ fontFamily: 'var(--font-mono)' }} />
                <YAxis stroke="#30363d" fontSize={10} tickLine={false} axisLine={false} style={{ fontFamily: 'var(--font-mono)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12, color: '#7d8590', fontFamily: 'var(--font-sans)' }} />
                <Area type="monotone" dataKey="MP_Nagar"   stroke="#3b82f6" strokeWidth={1.5} fill="url(#grad-mp)"    dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Habibganj"  stroke="#ef4444" strokeWidth={1.5} fill="url(#grad-hab)"   dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Roshanpura" stroke="#10b981" strokeWidth={1.5} fill="url(#grad-rosh)"  dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Arera"      stroke="#f59e0b" strokeWidth={1.5} fill="url(#grad-arera)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}