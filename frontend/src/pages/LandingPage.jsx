import { useEffect, useRef, useState } from 'react';

// ── Inline SVG icons (no external icon library needed) ────────────────────────
const Icon = {
  ClockX:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="18" y1="6" x2="22" y2="10"/><line x1="22" y1="6" x2="18" y2="10"/></svg>,
  Ambulance: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>,
  TrendUp:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Cpu:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  Sliders:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  Brain:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-3 2.5 2.5 0 0 1 .5-4.98v-.52a2.5 2.5 0 0 1 3-2.5"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-3 2.5 2.5 0 0 0-.5-4.98v-.52a2.5 2.5 0 0 0-3-2.5"/></svg>,
  Alert:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Star:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Activity:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  ArrowRight:() => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Info:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Dashboard: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
};

// ── Animated city grid canvas ─────────────────────────────────────────────────
function CityGrid() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, nodes = [], particles = [];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = 220;
      buildNodes();
    }

    function buildNodes() {
      nodes = [];
      const W = canvas.width, H = canvas.height;
      const cols = Math.floor(W / 88), rows = 3;
      const xGap = W / (cols + 1), yGap = H / (rows + 1);
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++)
          nodes.push({
            x: c * xGap + xGap * 0.5, y: r * yGap + yGap * 0.5,
            color: Math.random() < 0.3 ? '#10b981' : Math.random() < 0.5 ? '#3b82f6' : '#ef4444',
            timer: Math.random() * 60,
          });
      particles = [];
      for (let i = 0; i < 18; i++) spawnParticle();
    }

    function spawnParticle() {
      const fi = Math.floor(Math.random() * nodes.length);
      const from = nodes[fi];
      const near = nodes.filter((n, i) => i !== fi && Math.hypot(n.x - from.x, n.y - from.y) < 110);
      if (!near.length) return;
      const to = near[Math.floor(Math.random() * near.length)];
      particles.push({ x: from.x, y: from.y, tx: to.x, ty: to.y, prog: 0, speed: 0.004 + Math.random() * 0.007, color: from.color });
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#1c2128'; ctx.lineWidth = 1;
      nodes.forEach(n => nodes.forEach(m => {
        const d = Math.hypot(m.x - n.x, m.y - n.y);
        if (d > 0 && d < 100) { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke(); }
      }));
      nodes.forEach(n => {
        n.timer -= 0.3;
        if (n.timer <= 0) { n.color = Math.random() < 0.35 ? '#10b981' : Math.random() < 0.5 ? '#3b82f6' : '#ef4444'; n.timer = 40 + Math.random() * 60; }
        ctx.globalAlpha = 0.12; ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2); ctx.fill();
      });
      particles.forEach((p, i) => {
        p.prog += p.speed;
        if (p.prog >= 1) { particles.splice(i, 1); spawnParticle(); return; }
        p.x += (p.tx - p.x) * p.speed * 4; p.y += (p.ty - p.y) * p.speed * 4;
        ctx.globalAlpha = 0.75; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    resize(); window.addEventListener('resize', resize); draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 220, display: 'block' }} />;
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const update = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Landing page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&display=swap');
        .lp*{box-sizing:border-box;margin:0;padding:0;}
        .lp{background:#0d1117;color:#f0f6fc;font-family:'Geist',system-ui,sans-serif;min-height:100vh;overflow-x:hidden;}
        .mono{font-family:'Geist Mono',monospace;}

        /* Nav */
        .lp-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 48px;border-bottom:1px solid #1c2128;position:sticky;top:0;z-index:100;background:#0d1117;transition:border-color .2s;}
        .lp-nav.sc{border-color:#30363d;}
        .nav-logo{display:flex;align-items:center;gap:10px;}
        .nav-dot{width:8px;height:8px;border-radius:50%;background:#10b981;animation:np 2.5s ease-in-out infinite;}
        @keyframes np{0%,100%{box-shadow:0 0 0 3px #10b98125;}50%{box-shadow:0 0 0 6px #10b98112;}}
        .nav-wordmark{font-size:17px;font-weight:800;letter-spacing:-0.04em;color:#f0f6fc;}
        .nav-badge{font-family:'Geist Mono',monospace;font-size:10px;color:#484f58;letter-spacing:.08em;border:1px solid #1c2128;padding:3px 8px;border-radius:4px;}
        .nav-links{display:flex;align-items:center;gap:24px;}
        .lp-navbtn{font-size:13px;color:#7d8590;cursor:pointer;background:none;border:none;font-family:'Geist',system-ui,sans-serif;transition:color .15s;}
        .lp-navbtn:hover{color:#f0f6fc;}
        .nav-cta{font-size:13px;font-weight:500;color:#0d1117;background:#f0f6fc;padding:7px 18px;border-radius:7px;cursor:pointer;border:none;transition:opacity .15s;font-family:'Geist',system-ui,sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:7px;}
        .nav-cta:hover{opacity:.85;}

        /* Hero */
        .hero{padding:86px 48px 64px;max-width:860px;margin:0 auto;text-align:center;}
        .hero-pill{display:inline-flex;align-items:center;gap:7px;font-family:'Geist Mono',monospace;font-size:10px;color:#10b981;letter-spacing:.08em;border:1px solid #10b98128;background:#10b98108;padding:5px 14px;border-radius:99px;margin-bottom:30px;}
        .pill-dot{width:5px;height:5px;border-radius:50%;background:#10b981;}
        .hero-h1{font-size:58px;font-weight:800;letter-spacing:-.045em;line-height:1.05;color:#f0f6fc;margin-bottom:22px;}
        .hero-h1 .blue{color:#3b82f6;}
        .hero-sub{font-size:16px;color:#7d8590;line-height:1.72;max-width:520px;margin:0 auto 38px;}
        .hero-btns{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;}
        .btn-p{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:#0d1117;background:#f0f6fc;padding:11px 24px;border-radius:8px;cursor:pointer;border:none;transition:opacity .15s;font-family:'Geist',system-ui,sans-serif;text-decoration:none;}
        .btn-p:hover{opacity:.87;}
        .btn-g{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#7d8590;background:transparent;padding:11px 24px;border-radius:8px;cursor:pointer;border:1px solid #1c2128;transition:all .15s;font-family:'Geist',system-ui,sans-serif;}
        .btn-g:hover{color:#f0f6fc;border-color:#30363d;}

        /* Grid visual */
        .hero-visual{margin:50px 48px 0;border:1px solid #1c2128;border-radius:14px;background:#090d14;overflow:hidden;}

        /* Ticker */
        .ticker{display:flex;border-top:1px solid #1c2128;border-bottom:1px solid #1c2128;background:#090d14;}
        .t-item{flex:1;padding:22px 0;text-align:center;border-right:1px solid #1c2128;}
        .t-item:last-child{border-right:none;}
        .t-val{font-family:'Geist Mono',monospace;font-size:22px;font-weight:600;color:#f0f6fc;letter-spacing:-.03em;display:block;margin-bottom:4px;}
        .t-label{font-size:11px;color:#484f58;}

        /* Sections */
        .sec{padding:72px 48px;max-width:900px;margin:0 auto;}
        .sec-alt{background:#090d14;border-top:1px solid #1c2128;border-bottom:1px solid #1c2128;}
        .sec-tag{display:block;font-family:'Geist Mono',monospace;font-size:10px;color:#3b82f6;letter-spacing:.12em;margin-bottom:12px;}
        .sec-h2{font-size:30px;font-weight:700;letter-spacing:-.03em;color:#f0f6fc;margin-bottom:10px;}
        .sec-sub{font-size:14px;color:#7d8590;line-height:1.65;max-width:480px;}

        /* Problem cards */
        .prob-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:36px;}
        .prob-card{background:#090d14;border:1px solid #1c2128;border-radius:12px;padding:24px;transition:border-color .2s;}
        .prob-card:hover{border-color:#30363d;}
        .prob-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
        .prob-title{font-size:13px;font-weight:600;color:#f0f6fc;margin-bottom:7px;letter-spacing:-.01em;}
        .prob-text{font-size:12px;color:#484f58;line-height:1.65;}

        /* Steps */
        .steps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#1c2128;border:1px solid #1c2128;border-radius:12px;overflow:hidden;margin-top:36px;}
        .step{background:#090d14;padding:28px 24px;}
        .step-num{font-family:'Geist Mono',monospace;font-size:11px;color:#3b82f6;letter-spacing:.06em;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
        .step-num::after{content:'';flex:1;height:1px;background:#1c2128;}
        .step-title{font-size:14px;font-weight:600;color:#f0f6fc;margin-bottom:8px;letter-spacing:-.01em;}
        .step-desc{font-size:12px;color:#484f58;line-height:1.65;}
        .step-tag{display:inline-block;font-family:'Geist Mono',monospace;font-size:10px;padding:3px 9px;border-radius:4px;margin-top:14px;letter-spacing:.04em;}

        /* Features */
        .feat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:36px;}
        .feat-card{background:#090d14;border:1px solid #1c2128;border-radius:10px;padding:20px;transition:border-color .2s;}
        .feat-card:hover{border-color:#30363d;}
        .feat-icon{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
        .feat-title{font-size:13px;font-weight:600;color:#f0f6fc;margin-bottom:5px;letter-spacing:-.01em;}
        .feat-desc{font-size:11px;color:#484f58;line-height:1.6;}

        /* Comparison */
        .cmp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:36px;}
        .cmp-card{background:#090d14;border:1px solid #1c2128;border-radius:12px;padding:24px;}
        .cmp-label{font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:.08em;margin-bottom:18px;display:block;}
        .cmp-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #1c2128;}
        .cmp-row:last-child{border-bottom:none;}
        .cmp-key{font-size:12px;color:#7d8590;}
        .cmp-val{font-family:'Geist Mono',monospace;font-size:12px;font-weight:500;}

        /* Stack */
        .stack{display:flex;flex-wrap:wrap;gap:8px;margin-top:32px;}
        .pill{font-family:'Geist Mono',monospace;font-size:11px;color:#7d8590;border:1px solid #1c2128;padding:6px 14px;border-radius:99px;letter-spacing:.04em;transition:all .15s;cursor:default;}
        .pill:hover{color:#f0f6fc;border-color:#30363d;}

        /* Footer */
        .lp-footer{border-top:1px solid #1c2128;padding:28px 48px;display:flex;align-items:center;justify-content:space-between;}
        .ft{font-size:12px;color:#484f58;line-height:1.6;}
        .ft-badge{font-family:'Geist Mono',monospace;font-size:10px;color:#3b82f6;border:1px solid #3b82f620;background:#3b82f608;padding:5px 12px;border-radius:4px;letter-spacing:.06em;}

        @media(max-width:700px){
          .hero-h1{font-size:36px;}
          .lp-nav{padding:16px 20px;}
          .nav-links{display:none;}
          .hero{padding:56px 20px 40px;}
          .hero-visual{margin:36px 20px 0;}
          .sec{padding:52px 20px;}
          .prob-grid,.steps,.feat-grid,.cmp-grid{grid-template-columns:1fr;}
          .ticker{flex-direction:column;}
          .t-item{border-right:none;border-bottom:1px solid #1c2128;}
          .t-item:last-child{border-bottom:none;}
          .lp-footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px;}
        }
      `}</style>

      <div className="lp">

        {/* Nav */}
        <nav className={`lp-nav${scrolled ? ' sc' : ''}`}>
          <div className="nav-logo">
            <div className="nav-dot" />
            <span className="nav-wordmark" style={{ fontSize: 32}}>Traffix</span>
            <span className="nav-badge">SIH25050</span>
          </div>
          <div className="nav-links">
            <button className="lp-navbtn" onClick={() => scrollTo('how')}>How it works</button>
            <button className="lp-navbtn" onClick={() => scrollTo('features')}>Features</button>
            <button className="lp-navbtn" onClick={() => scrollTo('stack')}>Stack</button>
          </div>
          <a href="/overview" className="nav-cta">
            <Icon.Dashboard /> Open Dashboard
          </a>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-pill">
            <div className="pill-dot" />
            AI-POWERED · SIMULATION-BASED · REAL-TIME
          </div>
          <h1 className="hero-h1">
            Smart signals.<br />
            <span className="blue">Smarter cities.</span>
          </h1>
          <p className="hero-sub">
            An AI system that dynamically optimises traffic signal timings across urban
            intersections — reducing congestion, cutting wait times, and clearing paths
            for emergency vehicles.
          </p>
          <div className="hero-btns">
            <a href="/overview" className="btn-p">
              <Icon.Dashboard /> View Dashboard
            </a>
            <button className="btn-g" onClick={() => scrollTo('how')}>
              <Icon.Info /> How it works
            </button>
          </div>
        </div>

        {/* Animated grid */}
        <div className="hero-visual" style={{ margin: '50px 48px 0' }}>
          <CityGrid />
        </div>

        {/* Ticker */}
        <div className="ticker">
          {[
            { target: 18420, suffix: '',  label: 'vehicles optimised today' },
            { target: 38,    suffix: '%', label: 'avg wait time reduction'  },
            { target: 8,     suffix: '',  label: 'junctions monitored'      },
            { target: 2164,  suffix: '',  label: 'AI decisions made'        },
          ].map(({ target, suffix, label }) => (
            <div className="t-item" key={label}>
              <span className="t-val mono"><Counter target={target} suffix={suffix} /></span>
              <span className="t-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Problem */}
        <div className="sec">
          <span className="sec-tag">THE PROBLEM</span>
          <h2 className="sec-h2">Fixed timers don't work.</h2>
          <p className="sec-sub">Traditional signals run on preset timers — oblivious to real conditions. The result is preventable congestion every single day.</p>
          <div className="prob-grid">
            {[
              { bg: '#ef444412', color: '#ef4444', icon: <Icon.ClockX />,    title: 'Fixed 30s green — regardless of traffic',  text: 'A lane with 60 vehicles gets the same green time as one with 3. Wasted capacity, preventable queues.' },
              { bg: '#f59e0b12', color: '#f59e0b', icon: <Icon.Ambulance />, title: 'Emergency vehicles stuck at red',           text: 'No system clears a live signal path for ambulances. Every second of delay has real consequences.' },
              { bg: '#3b82f612', color: '#3b82f6', icon: <Icon.TrendUp />,   title: 'Peak hours crush the system',              text: 'Rush hours are predictable — yet static signals treat them identically to 2am traffic.' },
              { bg: '#10b98112', color: '#10b981', icon: <Icon.Cpu />,       title: 'No learning, no adaptation',               text: "Fixed systems don't improve. The same bad decision repeats every cycle, forever." },
            ].map((p) => (
              <div className="prob-card" key={p.title}>
                <div className="prob-icon" style={{ background: p.bg, color: p.color }}>{p.icon}</div>
                <div className="prob-title">{p.title}</div>
                <div className="prob-text">{p.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="sec-alt" id="how">
          <div className="sec">
            <span className="sec-tag">HOW IT WORKS</span>
            <h2 className="sec-h2">Three layers of intelligence.</h2>
            <p className="sec-sub">Each layer builds on the last — simulation feeds the algorithm, the algorithm feeds the agent, the agent learns.</p>
            <div className="steps">
              {[
                { n: '01', title: 'Traffic simulation',  desc: "Realistic vehicle counts generated per direction using time-of-day profiles — morning peak, evening rush, off-peak. In production, replaced by YOLO camera feeds.", tag: 'Data layer',    tc: '#3b82f6', tb: '#3b82f610', tbo: '#3b82f620' },
                { n: '02', title: "Webster's algorithm", desc: "Webster's 1958 formula computes the theoretically optimal cycle length and green splits from flow ratios and saturation. Academic, proven, rigorous.",              tag: 'Optimisation', tc: '#f59e0b', tb: '#f59e0b10', tbo: '#f59e0b20' },
                { n: '03', title: 'Q-Learning agent',   desc: 'A reinforcement learning agent adjusts the output using ε-greedy exploration. Reward = reduction in wait time. The agent improves every cycle via the Bellman equation.', tag: 'AI layer',     tc: '#10b981', tb: '#10b98110', tbo: '#10b98120' },
              ].map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                  <span className="step-tag" style={{ background: s.tb, color: s.tc, border: `1px solid ${s.tbo}` }}>{s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="sec" id="features">
          <span className="sec-tag">FEATURES</span>
          <h2 className="sec-h2">Built for real conditions.</h2>
          <p className="sec-sub">Every feature maps to a real urban traffic problem.</p>
          <div className="feat-grid">
            {[
              { bg: '#3b82f610', color: '#3b82f6', icon: <Icon.Sliders />,  title: 'Adaptive signal timing',      desc: 'Green time allocated proportionally to vehicle density — not a fixed split.' },
              { bg: '#ef444410', color: '#ef4444', icon: <Icon.Ambulance />,title: 'Emergency vehicle override',  desc: 'Instant all-red on cross routes, green on the emergency path. One API call.' },
              { bg: '#10b98110', color: '#10b981', icon: <Icon.Brain />,    title: 'Q-Learning feedback loop',   desc: 'Every decision is scored. The agent updates its Q-table via Bellman each cycle.' },
              { bg: '#f59e0b10', color: '#f59e0b', icon: <Icon.Alert />,    title: 'Incident detection',         desc: 'Simulate accidents — congestion spikes and signals adapt in real time.' },
              { bg: '#8b5cf610', color: '#8b5cf6', icon: <Icon.Star />,     title: 'Multi-junction coordination',desc: 'Each junction runs an independent AI agent. City-wide stats aggregated live.' },
              { bg: '#06b6d410', color: '#06b6d4', icon: <Icon.Activity />, title: 'Live WebSocket dashboard',   desc: 'Frontend updates every 2 seconds via Socket.IO. No polling, no refresh.' },
            ].map((f) => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="sec-alt">
          <div className="sec">
            <span className="sec-tag">IMPACT</span>
            <h2 className="sec-h2">Fixed vs adaptive.</h2>
            <p className="sec-sub">The difference a feedback loop makes — measured in seconds saved every cycle.</p>
            <div className="cmp-grid">
              <div className="cmp-card" style={{ borderColor: '#ef444425' }}>
                <span className="cmp-label" style={{ color: '#ef4444' }}>FIXED-TIMER SIGNALS</span>
                {[['Green time per phase','30s always','#ef4444'],['Adapts to traffic?','No','#484f58'],['Emergency override','No','#484f58'],['Learns over time?','No','#484f58'],['Avg vehicle wait','~45s','#ef4444']].map(([k,v,c]) => (
                  <div className="cmp-row" key={k}><span className="cmp-key">{k}</span><span className="cmp-val" style={{ color: c }}>{v}</span></div>
                ))}
              </div>
              <div className="cmp-card" style={{ borderColor: '#10b98130' }}>
                <span className="cmp-label" style={{ color: '#10b981' }}>TRAFFIX — AI ADAPTIVE</span>
                {[['Green time per phase','10–90s dynamic','#10b981'],['Adapts to traffic?','Yes — every cycle','#10b981'],['Emergency override','Yes — instant','#10b981'],['Learns over time?','Yes — Q-Learning','#10b981'],['Avg vehicle wait','~28s','#10b981']].map(([k,v,c]) => (
                  <div className="cmp-row" key={k}><span className="cmp-key">{k}</span><span className="cmp-val" style={{ color: c }}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stack */}
        <div className="sec" id="stack">
          <span className="sec-tag">TECH STACK</span>
          <h2 className="sec-h2">Built on proven tools.</h2>
          <p className="sec-sub">No exotic dependencies — a stack deployable on any city infrastructure server.</p>
          <div className="stack">
            {['Node.js','Express','MongoDB','Socket.IO','React','Recharts',"Webster's Formula","Q-Learning (ε-greedy)",'Bellman Equation','REST API','WebSocket'].map(s => (
              <span className="pill" key={s}>{s}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="lp-footer">
          <div className="ft">
            <div style={{ fontWeight: 500, color: '#7d8590', marginBottom: 3 }}>Traffix — Smart Traffic Management System</div>
            Built for Smart India Hackathon 2025 · Bhopal, Madhya Pradesh
          </div>
          <span className="ft-badge">SIH25050</span>
        </footer>

      </div>
    </>
  );
}