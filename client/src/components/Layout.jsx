import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Map, Heart, User, Sparkles, Sun, Moon, Search } from 'lucide-react';
import { DarnaLogo, LogoMark } from '../lib/art';
import { useAuth } from '../context/AuthContext';
import Assistant from './Assistant';

const NAV = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/explore', label: 'Explorer', icon: Compass },
  { to: '/map', label: 'Carte', icon: Map },
  { to: '/favorites', label: 'Favoris', icon: Heart },
];

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('darna_theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('darna_theme', theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))];
}

export default function Layout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [theme, toggleTheme] = useTheme();
  const [asstOpen, setAsstOpen] = useState(false);

  const goSearch = useCallback(() => nav('/explore'), [nav]);

  return (
    <div className="app-shell">
      {/* ---------- Desktop top nav ---------- */}
      <header className="desktop-nav" style={{
        position: 'sticky', top: 0, zIndex: 40, height: 'var(--header-h)',
        background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)',
      }}>
        <div className="container spread" style={{ height: '100%' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center' }}><DarnaLogo size={22} /></NavLink>
          <nav className="row" style={{ gap: 4 }}>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999,
                fontWeight: 600, fontSize: 15, color: isActive ? 'var(--primary)' : 'var(--ink-soft)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
              })}>
                <Icon size={17} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="row" style={{ gap: 8 }}>
            <button className="press" onClick={goSearch} aria-label="Rechercher" style={iconBtn}><Search size={18} /></button>
            <button className="press" onClick={toggleTheme} aria-label="Thème" style={iconBtn}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button className="btn gold press" onClick={() => setAsstOpen(true)} style={{ padding: '9px 16px' }}>
              <Sparkles size={16} /> Concierge
            </button>
            {user ? (
              <NavLink to="/profile" className="row press" style={{ gap: 8, paddingInlineStart: 4 }}>
                <LogoMark name={`${user.firstName} ${user.lastName}`} size={38} />
              </NavLink>
            ) : (
              <button className="btn press" onClick={() => nav('/auth')} style={{ padding: '9px 18px' }}>Connexion</button>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Mobile compact header ---------- */}
      <header className="tabbar" style={{
        position: 'sticky', top: 0, zIndex: 40, height: 56, display: 'none',
        background: 'color-mix(in srgb, var(--surface) 90%, transparent)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between',
      }} data-mobile-header>
        <DarnaLogo size={19} />
        <div className="row" style={{ gap: 6 }}>
          <button className="press" onClick={toggleTheme} aria-label="Thème" style={iconBtn}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <button className="press" onClick={goSearch} aria-label="Rechercher" style={iconBtn}><Search size={18} /></button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav className="tabbar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 45, height: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'color-mix(in srgb, var(--surface) 94%, transparent)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--line)', alignItems: 'stretch', justifyContent: 'space-around',
      }}>
        {NAV.slice(0, 2).map((n) => <Tab key={n.to} {...n} />)}
        <button className="press" onClick={() => setAsstOpen(true)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2,
        }} aria-label="Concierge">
          <span style={{
            width: 52, height: 52, marginTop: -22, borderRadius: 999, display: 'grid', placeItems: 'center',
            background: 'linear-gradient(135deg,#C79A3B,#B0872A)', color: '#221803', boxShadow: 'var(--shadow-md)', border: '3px solid var(--surface)',
          }}><Sparkles size={22} /></span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gold-ink)' }}>Concierge</span>
        </button>
        {NAV.slice(2).map((n) => <Tab key={n.to} {...n} />)}
        <Tab to={user ? '/profile' : '/auth'} label={user ? 'Profil' : 'Compte'} icon={User} />
      </nav>

      <Assistant open={asstOpen} onClose={() => setAsstOpen(false)} />
      <style>{`@media (max-width:899px){[data-mobile-header]{display:flex!important}}`}</style>
    </div>
  );
}

function Tab({ to, label, icon: Icon, end }) {
  return (
    <NavLink to={to} end={end} className="press" style={({ isActive }) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 3,
      fontSize: 10.5, fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--ink-faint)',
    })}>
      <Icon size={21} />
      {label}
    </NavLink>
  );
}

const iconBtn = {
  width: 40, height: 40, borderRadius: 999, display: 'grid', placeItems: 'center',
  color: 'var(--ink-soft)', background: 'var(--surface-2)', border: '1px solid var(--line)',
};
