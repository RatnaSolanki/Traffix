import { useEffect, useRef, useState } from 'react';

// ─── Junction data — replace coords/data with your real API values ────────────
// cx/cy are SVG coords within a 760×400 viewBox matching Bhopal's road layout
const JUNCTIONS = [
  { id: 1, name: 'MP Nagar',          sev: 'low',      cx: 320, cy: 220, vehicles: 187, green: 32, saved: 11 },
  { id: 2, name: 'Habibganj Crossing', sev: 'high',     cx: 380, cy: 220, vehicles: 528, green: 68, saved: 22 },
  { id: 3, name: 'Roshanpura',         sev: 'medium',   cx: 280, cy: 220, vehicles: 312, green: 44, saved: 14 },
  { id: 4, name: 'Arera Colony',       sev: 'low',      cx: 430, cy: 310, vehicles: 142, green: 28, saved: 9  },
  { id: 5, name: 'Shahpura',           sev: 'critical', cx: 510, cy: 200, vehicles: 641, green: 82, saved: 31 },
  { id: 6, name: 'TT Nagar',           sev: 'medium',   cx: 280, cy: 170, vehicles: 289, green: 40, saved: 13 },
  { id: 7, name: 'Kolar Chowk',        sev: 'low',      cx: 560, cy: 280, vehicles: 98,  green: 18, saved: 6  },
  { id: 8, name: 'Old City Chowk',     sev: 'high',     cx: 160, cy: 218, vehicles: 471, green: 60, saved: 19 },
];

const SEV_COLOR  = { low: '#10b981', medium: '#eab308', high: '#f97316', critical: '#ef4444' };
const SEV_BG     = { low: 'rgba(16,185,129,0.12)', medium: 'rgba(234,179,8,0.12)', high: 'rgba(249,115,22,0.12)', critical: 'rgba(239,68,68,0.12)' };
const SEV_BORDER = { low: 'rgba(16,185,129,0.3)',  medium: 'rgba(234,179,8,0.3)',  high: 'rgba(249,115,22,0.3)',  critical: 'rgba(239,68,68,0.3)'  };
const SEV_LABEL  = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

// ─── Animated pulse ring ──────────────────────────────────────────────────────
function PulseRing({ cx, cy, color, delay = 0 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={1} opacity={0}>
        <animate attributeName="r" values="10;22" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite"/>
      </circle>
      <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={1} opacity={0}>
        <animate attributeName="r" values="10;22" dur="2.4s" begin={`${delay + 0.8}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0" dur="2.4s" begin={`${delay + 0.8}s`} repeatCount="indefinite"/>
      </circle>
    </>
  );
}

// ─── Traffic flow dot animated along a path ───────────────────────────────────
function FlowDot({ pathId, color, dur, delay = 0, r = 2.5 }) {
  return (
    <circle r={r} fill={color} opacity={0.7}>
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" rotate="auto">
        <mpath href={`#${pathId}`}/>
      </animateMotion>
    </circle>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function JunctionMap({ onSelect, selectedId }) {
  const svgRef    = useRef(null);
  const wrapRef   = useRef(null);
  const [tooltip, setTooltip] = useState(null);  // { j, x, y }
  const [activeId, setActiveId] = useState(selectedId || 2);

  // Sync external selectedId prop
  useEffect(() => {
    if (selectedId) setActiveId(selectedId);
  }, [selectedId]);

  function handleClick(j, e) {
    setActiveId(j.id);
    onSelect?.(j);

    // Compute tooltip position relative to wrapper
    const wrap = wrapRef.current;
    const svg  = svgRef.current;
    if (!wrap || !svg) return;
    const wrapRect = wrap.getBoundingClientRect();
    const svgRect  = svg.getBoundingClientRect();
    const scaleX   = svgRect.width  / 760;
    const scaleY   = svgRect.height / 400;
    const px = j.cx * scaleX + (svgRect.left - wrapRect.left);
    const py = j.cy * scaleY + (svgRect.top  - wrapRect.top);
    let tx = px + 14;
    let ty = py - 10;
    if (tx + 175 > wrapRect.width)  tx = px - 180;
    if (ty + 130 > wrapRect.height) ty = py - 135;
    setTooltip({ j, x: tx, y: ty });
  }

  function handleOutsideClick(e) {
    if (e.target === svgRef.current || e.target.closest('svg') === svgRef.current) return;
    setTooltip(null);
  }

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const activeJunction = JUNCTIONS.find(j => j.id === activeId);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        background: '#090d14',
        borderRadius: 10,
        border: '1px solid #1c2128',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 760 400"
        style={{ display: 'block', width: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Water bodies ── */}
        <path fill="#0c1929" opacity={0.6}
          d="M 0 0 L 160 0 L 180 30 L 200 60 L 195 90 L 170 110 L 140 120 L 110 115 L 80 100 L 50 80 L 20 60 L 0 40 Z"/>
        <text fontSize={8} fontWeight={600} fill="#1e2d40" letterSpacing="0.08em"
          x={38} y={58} transform="rotate(-5, 38, 58)" fontFamily="'Geist Mono', monospace">UPPER LAKE</text>

        <path fill="#0c1929" opacity={0.5}
          d="M 0 120 L 60 110 L 90 130 L 100 160 L 80 180 L 40 185 L 0 175 Z"/>
        <text fontSize={7} fontWeight={600} fill="#1e2d40" letterSpacing="0.07em"
          x={12} y={150} fontFamily="'Geist Mono', monospace">LOWER LAKE</text>

        {/* ── Green zones ── */}
        <ellipse cx={680} cy={60} rx={80} ry={50} fill="#0c1a10" opacity={0.5}/>
        <text fontSize={8} fontWeight={600} fill="#0f2814" letterSpacing="0.08em"
          x={648} y={58} fontFamily="'Geist Mono', monospace">VAN VIHAR</text>
        <ellipse cx={720} cy={330} rx={48} ry={38} fill="#0c1a10" opacity={0.45}/>

        {/* ── Dense urban zone overlay ── */}
        <rect x={220} y={100} width={340} height={220} rx={4} fill="#0f1520" opacity={0.25}/>

        {/* ── Minor roads ── */}
        {[
          'M 130 200 L 130 320', 'M 160 190 L 160 330', 'M 100 245 L 210 245',
          'M 95 285 L 225 285', 'M 350 120 L 350 165', 'M 400 145 L 400 200',
          'M 460 130 L 460 200', 'M 305 255 L 305 325', 'M 490 245 L 490 325',
          'M 535 200 L 605 200', 'M 578 160 L 578 265', 'M 618 200 L 618 305',
          'M 558 282 L 655 282',
        ].map((d, i) => (
          <path key={i} d={d} stroke="#111822" strokeWidth={3} fill="none" strokeLinecap="round"/>
        ))}

        {/* ── Major roads ── */}
        <path d="M 100 212 Q 160 207 220 217 Q 272 227 322 222" stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>
        <path d="M 280 95 L 280 200 L 280 335" stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>
        <path d="M 430 88 L 430 180 L 430 315 L 430 372" stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>
        <path d="M 198 342 Q 320 337 442 342 Q 522 345 602 342" stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>
        <path d="M 558 200 L 558 312 L 558 372" stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>
        <path d="M 488 132 Q 520 162 520 202 Q 520 252 510 292" stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>

        {/* ── Outer arc (north) ── */}
        <path d="M 178 42 Q 280 18 380 16 Q 482 14 582 38 Q 652 58 682 112"
          stroke="#162030" strokeWidth={5} fill="none" strokeLinecap="round"/>

        {/* ── Highways ── */}
        {/* NH-12 */}
        <path id="nh12path"
          d="M 0 220 Q 80 215 160 218 Q 240 221 320 220 Q 400 219 480 222 Q 560 225 640 222 Q 700 220 760 218"
          stroke="#1e2d45" strokeWidth={8} fill="none" strokeLinecap="round"/>
        {/* NH-12 center dashes */}
        <path
          d="M 0 220 Q 80 215 160 218 Q 240 221 320 220 Q 400 219 480 222 Q 560 225 640 222 Q 700 220 760 218"
          stroke="#1a2d45" strokeWidth={1} fill="none" strokeDasharray="8 6" opacity={0.5}/>

        {/* VIP Road */}
        <path id="vippath"
          d="M 380 0 Q 378 80 380 160 Q 382 240 380 320 Q 378 360 380 400"
          stroke="#1e2d45" strokeWidth={8} fill="none" strokeLinecap="round"/>
        <path
          d="M 380 0 Q 378 80 380 160 Q 382 240 380 320 Q 378 360 380 400"
          stroke="#1a2d45" strokeWidth={1} fill="none" strokeDasharray="8 6" opacity={0.5}/>

        {/* Ring Road */}
        <path id="ringpath"
          d="M 200 382 Q 300 372 400 382 Q 500 392 600 372 Q 660 358 702 322 Q 732 292 742 252"
          stroke="#1e2d45" strokeWidth={8} fill="none" strokeLinecap="round"/>

        {/* ── Road labels ── */}
        {[
          { text: 'Hamidia Rd',   x: 105, y: 208, rotate: -1 },
          { text: 'Berasia Rd',   x: 266, y: 148, rotate: -90 },
          { text: 'Raisen Rd',    x: 422, y: 138, rotate: -90 },
          { text: 'NH-12',        x: 42,  y: 213  },
          { text: 'VIP Road',     x: 386, y: 28   },
          { text: 'Ring Road',    x: 215, y: 378  },
          { text: 'Kolar Rd',     x: 554, y: 194, rotate: -90 },
        ].map(({ text, x, y, rotate }, i) => (
          <text key={i} fontSize={8} fontWeight={500} fill="#1e2d40"
            fontFamily="'Geist Mono', monospace" letterSpacing="0.04em"
            x={x} y={y}
            transform={rotate ? `rotate(${rotate}, ${x}, ${y})` : undefined}>
            {text}
          </text>
        ))}

        {/* ── Traffic flow dots ── */}
        <FlowDot pathId="nh12path" color="#3b82f6" dur={4.0} delay={0}   />
        <FlowDot pathId="nh12path" color="#3b82f6" dur={4.0} delay={1.3} />
        <FlowDot pathId="nh12path" color="#3b82f6" dur={4.0} delay={2.6} />
        <FlowDot pathId="vippath"  color="#8b5cf6" dur={5.0} delay={0}   />
        <FlowDot pathId="vippath"  color="#8b5cf6" dur={5.0} delay={1.6} />
        <FlowDot pathId="ringpath" color="#06b6d4" dur={6.0} delay={0}   r={2}/>
        <FlowDot pathId="ringpath" color="#06b6d4" dur={6.0} delay={2.0} r={2}/>

        {/* ── Selected junction glow ── */}
        {activeJunction && (
          <circle cx={activeJunction.cx} cy={activeJunction.cy} r={12}
            fill="none" stroke={SEV_COLOR[activeJunction.sev]} strokeWidth={2} opacity={0}>
            <animate attributeName="r"       values="12;28"  dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0"  dur="1.5s" repeatCount="indefinite"/>
          </circle>
        )}

        {/* ── Junction nodes ── */}
        {JUNCTIONS.map((j, i) => {
          const color = SEV_COLOR[j.sev];
          const isActive = j.id === activeId;
          const r = isActive ? 7 : 5.5;
          // Label placement — avoid overlap
          const labelAnchor = j.cx > 600 ? 'start' : j.cx < 200 ? 'middle' : 'middle';
          const labelDy = j.cy < 50 ? 18 : -10;
          return (
            <g key={j.id} onClick={(e) => handleClick(j, e)} style={{ cursor: 'pointer' }}>
              <PulseRing cx={j.cx} cy={j.cy} color={color} delay={i * 0.35}/>
              {/* Invisible larger hit area */}
              <circle cx={j.cx} cy={j.cy} r={16} fill="transparent"/>
              {/* Dot */}
              <circle
                cx={j.cx} cy={j.cy} r={r}
                fill={color}
                style={{ filter: `drop-shadow(0 0 ${isActive ? 7 : 4}px ${color}90)`, transition: 'r 0.2s' }}
              />
              {/* Label */}
              <text
                x={j.cx} y={j.cy + labelDy}
                textAnchor={labelAnchor}
                fontSize={9} fontWeight={600}
                fill={color}
                fontFamily="'Geist', system-ui, sans-serif"
                letterSpacing="0.02em"
                paintOrder="stroke"
                stroke="#090d14"
                strokeWidth={3}
                strokeLinejoin="round"
              >
                {j.name}
              </text>
            </g>
          );
        })}

        {/* ── Compass ── */}
        <g transform="translate(728, 28)">
          <circle cx={0} cy={0} r={14} fill="#0d1117" stroke="#1c2128" strokeWidth={1}/>
          <line x1={0} y1={-9} x2={0} y2={9} stroke="#21262d" strokeWidth={1}/>
          <line x1={-9} y1={0} x2={9} y2={0} stroke="#21262d" strokeWidth={1}/>
          <text fontSize={9} fontWeight={700} fill="#30363d" textAnchor="middle"
            fontFamily="'Geist Mono', monospace" y={-13}>N</text>
          <polygon points="0,-7 2.5,0 0,2 -2.5,0" fill="#3b82f6"/>
          <polygon points="0,7 2.5,0 0,-2 -2.5,0" fill="#21262d"/>
        </g>

        {/* ── Scale bar ── */}
        <g transform="translate(614, 378)">
          <line x1={0} y1={0} x2={60} y2={0} stroke="#21262d" strokeWidth={1.5}/>
          <line x1={0} y1={-4} x2={0} y2={4} stroke="#21262d" strokeWidth={1.5}/>
          <line x1={60} y1={-4} x2={60} y2={4} stroke="#21262d" strokeWidth={1.5}/>
          <text fontSize={8} fontWeight={500} fill="#1e2d40" textAnchor="middle"
            fontFamily="'Geist Mono', monospace" x={30} y={-7}>2 km</text>
        </g>

        {/* ── City watermark ── */}
        <text fontSize={9} fontWeight={700} fill="#1e2d40" letterSpacing="0.14em"
          x={12} y={14} fontFamily="'Geist Mono', monospace">BHOPAL CITY NETWORK</text>
      </svg>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          background: '#0d1117',
          border: '1px solid #1c2128',
          borderRadius: 8,
          padding: '10px 13px',
          pointerEvents: 'none',
          zIndex: 20,
          minWidth: 168,
        }}>
          <p style={{
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 12, fontWeight: 600, color: '#f0f6fc',
            letterSpacing: '-0.02em', margin: '0 0 5px',
          }}>
            {tooltip.j.name}
          </p>
          <span style={{
            display: 'inline-block',
            fontFamily: "'Geist Mono', monospace",
            fontSize: 9, fontWeight: 700,
            padding: '2px 8px', borderRadius: 99,
            background: SEV_BG[tooltip.j.sev],
            color: SEV_COLOR[tooltip.j.sev],
            border: `1px solid ${SEV_BORDER[tooltip.j.sev]}`,
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}>
            {SEV_LABEL[tooltip.j.sev].toUpperCase()}
          </span>
          {[
            { label: 'Vehicles',   val: tooltip.j.vehicles },
            { label: 'AI Green',   val: `${tooltip.j.green}s` },
            { label: 'Delay saved',val: `${tooltip.j.saved}s` },
          ].map(({ label, val }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', gap: 14,
              fontSize: 10, color: '#7d8590', marginTop: 3,
              fontFamily: "'Geist', system-ui, sans-serif",
            }}>
              <span>{label}</span>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                color: '#f0f6fc', fontWeight: 600,
              }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{
        position: 'absolute', bottom: 10, left: 12,
        display: 'flex', gap: 12, alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {Object.entries(SEV_COLOR).map(([sev, color]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}/>
            <span style={{
              fontSize: 10, color: '#484f58', fontWeight: 500,
              fontFamily: "'Geist', system-ui, sans-serif",
            }}>
              {SEV_LABEL[sev]}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 4 }}>
          <div style={{
            width: 20, height: 3,
            background: 'linear-gradient(90deg, #3b82f6, transparent)',
            borderRadius: 2,
          }}/>
          <span style={{ fontSize: 10, color: '#484f58', fontFamily: "'Geist', system-ui, sans-serif" }}>
            Traffic flow
          </span>
        </div>
      </div>
    </div>
  );
}