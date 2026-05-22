import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, MapPin, Bell, Activity, Menu, X, ChevronLeft, Radio, Zap } from 'lucide-react';
import LiveIndicator from './LiveIndicator';

const navItems = [
  { path: '/overview',    label: 'Overview',    icon: LayoutDashboard, desc: 'City dashboard' },
  { path: '/simulation',  label: 'Simulation',  icon: PlayCircle,      desc: 'Real-time control' },
  { path: '/junctions',   label: 'Junctions',   icon: MapPin,          desc: 'Node management' },
  { path: '/alerts',      label: 'Alerts',      icon: Bell,            desc: 'System events', badge: 4 },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');

  :root {
    --sb-bg:       #080c12;
    --sb-surface:  #0d1219;
    --sb-border:   #151c26;
    --sb-muted:    #3d4d5e;
    --sb-text:     #c9d4df;
    --sb-active:   #1d6bfc;
    --sb-active-bg:#0f2a5e;
    --sb-glow:     rgba(29,107,252,0.25);
    --sb-green:    #00e5a0;
    --fm: 'Geist Mono', ui-monospace, monospace;
    --fs: 'Geist', system-ui, sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sb-root {
    font-family: var(--fs);
    min-height: 100vh;
    background: #06090f;
    display: flex;
  }

  /* ── Sidebar shell ── */
  .sb-aside {
    background: var(--sb-bg);
    border-right: 1px solid var(--sb-border);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100%;
    z-index: 40;
    transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
  }

  /* ── Noise texture overlay ── */
  .sb-aside::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* ── Vertical accent line ── */
  .sb-aside::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: linear-gradient(180deg, transparent, var(--sb-active) 40%, var(--sb-active) 60%, transparent);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
  }

  /* ── Logo area ── */
  .sb-logo {
    position: relative;
    z-index: 2;
    padding: 20px 18px;
    border-bottom: 1px solid var(--sb-border);
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 72px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .sb-logo:hover { background: rgba(29,107,252,0.04); }

  .sb-logo-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1d6bfc 0%, #06b6d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px rgba(29,107,252,0.4), 0 0 20px rgba(29,107,252,0.3), 0 4px 12px rgba(0,0,0,0.4);
    position: relative;
  }
  .sb-logo-icon::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  }

  .sb-logo-text {
    overflow: hidden;
    transition: opacity 0.2s, width 0.3s;
    white-space: nowrap;
  }
  .sb-logo-title {
    font-family: var(--fm);
    font-size: 15px;
    font-weight: 700;
    color: #e8f0fc;
    letter-spacing: 0.12em;
    display: block;
  }
  .sb-logo-sub {
    font-family: var(--fs);
    font-size: 10px;
    color: var(--sb-muted);
    letter-spacing: 0.05em;
    display: block;
    margin-top: 1px;
  }

  /* ── Nav ── */
  .sb-nav {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .sb-section-label {
    font-family: var(--fm);
    font-size: 8px;
    font-weight: 600;
    color: var(--sb-muted);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 8px 10px 4px;
    overflow: hidden;
    white-space: nowrap;
    transition: opacity 0.2s;
  }

  .sb-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 9px;
    text-decoration: none;
    border: 1px solid transparent;
    color: var(--sb-muted);
    transition: all 0.18s;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }
  .sb-link:hover {
    background: rgba(255,255,255,0.04);
    color: var(--sb-text);
    border-color: var(--sb-border);
  }
  .sb-link.active {
    background: linear-gradient(135deg, rgba(29,107,252,0.14) 0%, rgba(6,182,212,0.06) 100%);
    color: #6eb4ff;
    border-color: rgba(29,107,252,0.3);
    box-shadow: 0 0 0 1px rgba(29,107,252,0.1) inset, 0 2px 12px rgba(29,107,252,0.1);
  }

  /* Active left accent bar */
  .sb-link.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 2px;
    border-radius: 0 2px 2px 0;
    background: linear-gradient(180deg, #1d6bfc, #06b6d4);
    box-shadow: 0 0 8px rgba(29,107,252,0.8);
  }

  /* Hover shimmer */
  .sb-link::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s;
  }
  .sb-link:hover::after { transform: translateX(100%); }

  .sb-link-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.18s;
  }
  .sb-link.active .sb-link-icon {
    background: rgba(29,107,252,0.18);
    border-color: rgba(29,107,252,0.3);
    box-shadow: 0 0 12px rgba(29,107,252,0.2);
  }
  .sb-link:hover .sb-link-icon {
    background: rgba(255,255,255,0.07);
  }

  .sb-link-info {
    overflow: hidden;
    transition: opacity 0.15s, width 0.3s;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .sb-link-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    display: block;
  }
  .sb-link-desc {
    font-family: var(--fm);
    font-size: 9px;
    color: var(--sb-muted);
    letter-spacing: 0.04em;
    display: block;
    transition: color 0.18s;
  }
  .sb-link.active .sb-link-desc { color: rgba(110,180,255,0.6); }

  .sb-badge {
    margin-left: auto;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 6px;
    background: #ef4444;
    border: 1px solid rgba(239,68,68,0.5);
    box-shadow: 0 0 8px rgba(239,68,68,0.4);
    font-family: var(--fm);
    font-size: 9px;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0;
  }

  /* ── Footer ── */
  .sb-footer {
    position: relative;
    z-index: 2;
    padding: 12px 10px;
    border-top: 1px solid var(--sb-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sb-status-card {
    background: rgba(0,229,160,0.04);
    border: 1px solid rgba(0,229,160,0.12);
    border-radius: 9px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 9px;
    overflow: hidden;
    transition: opacity 0.2s, height 0.3s;
  }
  .sb-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--sb-green);
    box-shadow: 0 0 8px var(--sb-green);
    flex-shrink: 0;
    animation: sbPulse 2s ease-in-out infinite;
  }
  @keyframes sbPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--sb-green); }
    50%       { opacity: 0.5; box-shadow: 0 0 3px var(--sb-green); }
  }
  .sb-status-text {
    font-family: var(--fm);
    font-size: 10px;
    font-weight: 600;
    color: var(--sb-green);
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .sb-status-label {
    font-family: var(--fm);
    font-size: 8px;
    color: rgba(0,229,160,0.45);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    display: block;
    margin-bottom: 2px;
  }

  .sb-collapse-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--sb-border);
    background: transparent;
    color: var(--sb-muted);
    cursor: pointer;
    font-family: var(--fs);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: all 0.15s;
  }
  .sb-collapse-btn:hover {
    background: rgba(255,255,255,0.04);
    color: var(--sb-text);
    border-color: rgba(255,255,255,0.1);
  }

  /* ── Mobile overlay ── */
  .sb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    z-index: 30;
  }

  /* ── Header ── */
  .sb-header {
    height: 60px;
    background: rgba(8,12,18,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--sb-border);
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ── Collapsed icon tooltip ── */
  .sb-link[data-tooltip]:not(.expanded) {
    position: relative;
  }

  /* ── Content transition ── */
  .sb-content {
    flex: 1;
    min-width: 0;
    transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes sbFadeIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .sb-link { animation: sbFadeIn 0.25s ease both; }
  .sb-link:nth-child(1) { animation-delay: 0.03s; }
  .sb-link:nth-child(2) { animation-delay: 0.06s; }
  .sb-link:nth-child(3) { animation-delay: 0.09s; }
  .sb-link:nth-child(4) { animation-delay: 0.12s; }
`;

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const expanded = sidebarOpen || isMobile;
  const sidebarWidth = expanded ? 228 : 66;

  return (
    <>
      <style>{STYLES}</style>
      <div className="sb-root">

        {/* Mobile overlay */}
        {isMobile && mobileOpen && (
          <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside
          className="sb-aside"
          style={{
            width: isMobile ? 228 : sidebarWidth,
            transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          }}
        >
          {/* Logo — click to go to landing */}
          <div
            className="sb-logo"
            onClick={() => navigate('/')}
            title="Back to landing page"
          >
            <div className="sb-logo-icon">
              <Activity size={18} color="white" strokeWidth={2.5} />
            </div>
            <div
              className="sb-logo-text"
              style={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            >
              <span className="sb-logo-title">TRAFFIX</span>
              <span className="sb-logo-sub">Smart Traffic Management</span>
            </div>
            {isMobile && (
              <button
                onClick={e => { e.stopPropagation(); setMobileOpen(false); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3d4d5e', cursor: 'pointer', display: 'flex', padding: 4 }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="sb-nav">
            {expanded && (
              <span className="sb-section-label">Navigation</span>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
                  title={!expanded ? item.label : ''}
                  style={{ justifyContent: expanded ? 'flex-start' : 'center', padding: expanded ? '9px 12px' : '9px' }}
                >
                  <div className="sb-link-icon">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>

                  {expanded && (
                    <div className="sb-link-info">
                      <span className="sb-link-label">{item.label}</span>
                      <span className="sb-link-desc">{item.desc}</span>
                    </div>
                  )}

                  {expanded && item.badge && (
                    <span className="sb-badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="sb-footer">
            {/* System status */}
            {expanded ? (
              <div className="sb-status-card">
                <div className="sb-status-dot" />
                <div>
                  <span className="sb-status-label">System Status</span>
                  <span className="sb-status-text">All Systems Nominal</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                <div className="sb-status-dot" />
              </div>
            )}

            {/* Collapse toggle — desktop only */}
            {!isMobile && (
              <button
                className="sb-collapse-btn"
                onClick={() => setSidebarOpen(p => !p)}
                style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
              >
                <ChevronLeft
                  size={14}
                  style={{
                    transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.3s',
                    flexShrink: 0,
                  }}
                />
                {expanded && <span>Collapse</span>}
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div
          className="sb-content"
          style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        >
          {/* Header */}
          <header className="sb-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {isMobile && (
                <button
                  onClick={() => setMobileOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#3d4d5e', cursor: 'pointer', display: 'flex' }}
                >
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h2 style={{
                  fontFamily: "'Geist', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#c9d4df',
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}>
                  Smart Traffic Management System
                </h2>
                <p style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 16,
                  color: '#3d4d5e',
                  margin: 0,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Bhopal City Network
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <LiveIndicator />

              {/* Alerts */}
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: '1px solid #151c26',
                  background: '#0d1219',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.15s',
                }}>
                  <Bell size={15} color="#3d4d5e" strokeWidth={1.8} />
                </div>
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16,
                  background: '#ef4444',
                  border: '1.5px solid #06090f',
                  borderRadius: '50%',
                  fontSize: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                  fontFamily: "'Geist Mono', monospace",
                }}>4</span>
              </div>

              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg, #1d6bfc 0%, #06b6d4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11, fontWeight: 700, color: 'white',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(29,107,252,0.3)',
                letterSpacing: '0.04em',
              }}>
                AD
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ padding: '24px', flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}